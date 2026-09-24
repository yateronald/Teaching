import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import '../../meetings/screens/pre_join_screen.dart';
import '../../meetings/widgets/meeting_share_sheet.dart';
import 'schedule_editor_sheet.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  final Function(int tabIndex)? onNavigateTab;

  const ScheduleScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _schedules = [];
  List<dynamic> _batches = [];
  DateTime _selectedDate = DateTime.now();
  String _filterType = 'all'; // all, class, exam, room, live
  int? _openingId;

  late List<DateTime> _calendarDays;

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _calendarDays = List.generate(
      14,
      (i) => DateTime(today.year, today.month, today.day).add(Duration(days: i - 2)),
    );
    _selectedDate = DateTime(today.year, today.month, today.day);
    _fetchSchedule();
  }

  /// Server times are UTC; everything here is shown in the phone's time.
  static DateTime? _local(dynamic value) =>
      value == null ? null : DateTime.tryParse('$value')?.toLocal();

  static bool _isRoom(Map<String, dynamic> item) => item['meeting_id'] != null;

  Future<void> _fetchSchedule() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait([client.get('/schedules'), client.get('/batches')]);
      final sData = results[0].data;
      final bData = results[1].data;
      if (mounted) {
        setState(() {
          _schedules = sData is List ? sData : (sData?['schedules'] ?? sData?['data'] ?? []);
          _batches = bData is List ? bData : (bData?['batches'] ?? bData?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = context.isFrench ? 'Impossible de charger votre emploi du temps.' : 'Your schedule could not be loaded.';
          _isLoading = false;
        });
      }
    }
  }

  void _snack(String text, {Color? color}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(text), backgroundColor: color, behavior: SnackBarBehavior.floating),
    );
  }

  void _openEditor({Map<String, dynamic>? item}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ScheduleEditorSheet(
        batches: _batches,
        existingItem: item,
        onSaved: _onSaved,
      ),
    );
  }

  void _onSaved(ScheduleSaveResult result) {
    final isFr = context.isFrench;
    _fetchSchedule();
    final meeting = result.createdMeeting;
    if (meeting != null) {
      // Same invitation card as a class created in Meetings.
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => MeetingShareSheet(meeting: meeting, isCreated: true),
      );
    } else {
      _snack(isFr ? 'Séance enregistrée.' : 'Session saved.', color: AppColors.good);
    }
  }

  // ── Built-in class room ──

  /// Opens the class room exactly like the Meetings tab: the host tells the
  /// server the room is opening, then goes through the pre-join screen.
  Future<void> _openRoom(Map<String, dynamic> item) async {
    final isFr = context.isFrench;
    final id = item['meeting_id'];
    setState(() => _openingId = item['id'] as int?);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/$id');
      final meeting = Map<String, dynamic>.from(res.data as Map);
      if (meeting['status'] != 'active') {
        await client.post('/meetings/$id/prepare');
      }
      if (!mounted) return;
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => PreJoinScreen(meeting: meeting)),
      );
      if (mounted) _fetchSchedule();
    } on ApiException catch (e) {
      if (mounted) _snack(e.message, color: AppColors.bad);
    } catch (_) {
      if (mounted) _snack(isFr ? 'Impossible d\'ouvrir la salle de classe.' : 'The class room could not be opened.', color: AppColors.bad);
    } finally {
      if (mounted) setState(() => _openingId = null);
    }
  }

  Future<void> _shareRoom(Map<String, dynamic> item) async {
    try {
      final res = await ref.read(apiClientProvider).get('/meetings/${item['meeting_id']}');
      if (!mounted) return;
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => MeetingShareSheet(meeting: Map<String, dynamic>.from(res.data as Map)),
      );
    } catch (_) {
      if (mounted) _snack(context.isFrench ? 'Invitation indisponible.' : 'The invitation could not be loaded.');
    }
  }

  // ── Other sessions ──

  /// Attendance for a class outside the platform: a code the students enter.
  Future<void> _startAttendance(Map<String, dynamic> item) async {
    final isFr = context.isFrench;
    final start = _local(item['start_time']) ?? DateTime.now();
    try {
      final res = await ref.read(apiClientProvider).post(
        '/attendance/sessions/${item['id']}/start',
        data: {'sessionDate': DateFormat('yyyy-MM-dd').format(start)},
      );
      final code = res.data?['accessCode']?.toString();
      if (code == null || code.isEmpty || !mounted) return;
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(isFr ? 'Émargement ouvert' : 'Attendance open'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                isFr ? 'Le code a été envoyé par e-mail aux étudiants :' : 'The code was emailed to the students:',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.teacherAccentSoft,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.teacherAccentLine),
                ),
                child: SelectableText(
                  code,
                  style: AppTypography.headlineLarge.copyWith(
                    color: AppColors.teacherAccent,
                    letterSpacing: 6.0,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                isFr ? 'Valable 30 minutes.' : 'Valid for 30 minutes.',
                style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Clipboard.setData(ClipboardData(text: code)),
              child: Text(isFr ? 'Copier' : 'Copy'),
            ),
            TextButton(onPressed: () => Navigator.pop(context), child: Text(isFr ? 'Fermer' : 'Close')),
          ],
        ),
      );
    } on ApiException catch (e) {
      if (mounted) _snack(e.message, color: AppColors.bad);
    } catch (_) {
      if (mounted) _snack(isFr ? 'Impossible de démarrer l\'émargement.' : 'Attendance could not be started.', color: AppColors.bad);
    }
  }

  Future<void> _openLink(String link) async {
    final uri = Uri.tryParse(link);
    if (uri == null || !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) _snack(context.isFrench ? 'Lien impossible à ouvrir.' : 'The link could not be opened.');
    }
  }

  Future<void> _confirmDelete(Map<String, dynamic> item) async {
    final isFr = context.isFrench;
    final room = _isRoom(item);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isFr ? 'Supprimer « ${item['title'] ?? ''} » ?' : 'Delete “${item['title'] ?? ''}”?'),
        content: Text(room
            ? (isFr
                ? 'Sa salle de classe est aussi supprimée, dans l\'emploi du temps et dans Réunions. Les étudiants sont prévenus.'
                : 'Its class room is removed too, from Schedule and Meetings. Students are told.')
            : (isFr ? 'Les étudiants la perdent de leur emploi du temps.' : 'Students lose it from their schedule.')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(isFr ? 'Annuler' : 'Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.bad),
            child: Text(isFr ? 'Supprimer' : 'Delete'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(apiClientProvider).delete('/schedules/${item['id']}');
      _fetchSchedule();
      if (mounted) _snack(isFr ? 'Séance supprimée.' : 'Session deleted.');
    } on ApiException catch (e) {
      if (mounted) _snack(e.message, color: AppColors.bad);
    } catch (_) {
      if (mounted) _snack(isFr ? 'Échec de la suppression.' : 'The session could not be deleted.', color: AppColors.bad);
    }
  }

  String _computeLiveState(Map<String, dynamic> item) {
    if (item['status'] == 'cancelled') return 'cancelled';
    if (item['status'] == 'completed') return 'completed';
    if (item['meeting_status'] == 'active') return 'live';
    final start = _local(item['start_time'] ?? item['start']);
    final end = _local(item['end_time'] ?? item['end']);
    if (start == null || end == null) return 'scheduled';
    final now = DateTime.now();
    if (now.isAfter(end)) return 'ended';
    if (now.isAfter(start)) return 'live';
    if (start.difference(now).inMinutes <= 15) return 'soon';
    return 'scheduled';
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final daySchedules = _schedules.where((s) {
      final map = s as Map<String, dynamic>;
      final dt = _local(map['start_time'] ?? map['start']);
      if (dt == null) return false;
      if (dt.year != _selectedDate.year || dt.month != _selectedDate.month || dt.day != _selectedDate.day) return false;
      if (_filterType == 'class' && map['type'] != 'class') return false;
      if (_filterType == 'exam' && map['type'] != 'exam') return false;
      if (_filterType == 'room' && !_isRoom(map)) return false;
      if (_filterType == 'live' && _computeLiveState(map) != 'live') return false;
      return true;
    }).toList()
      ..sort((a, b) => '${a['start_time']}'.compareTo('${b['start_time']}'));

    return RefreshIndicator(
      onRefresh: _fetchSchedule,
      color: AppColors.frenchNavy,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ResponsiveLayout.pageInsets(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isFr ? 'Emploi du temps' : 'Schedule',
                        style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.frenchNavy),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isFr
                            ? 'Vos cours : salle intégrée, lien externe ou présentiel.'
                            : 'Your classes: built-in room, external link or in person.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                CustomButton(
                  text: isFr ? 'Planifier' : 'New',
                  icon: Icons.add,
                  height: 44,
                  onPressed: () => _openEditor(),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _calendarDays.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, idx) => _dayCell(_calendarDays[idx], isFr),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: Text(
                    DateFormat(isFr ? 'EEEE d MMMM yyyy' : 'EEEE, MMMM d, yyyy', isFr ? 'fr_FR' : 'en_US').format(_selectedDate),
                    style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.frenchNavy.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${daySchedules.length} ${isFr ? (daySchedules.length > 1 ? "séances" : "séance") : (daySchedules.length > 1 ? "sessions" : "session")}',
                    style: AppTypography.caption.copyWith(color: AppColors.frenchNavy, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('all', isFr ? 'Tout' : 'All'),
                  const SizedBox(width: 8),
                  _buildFilterChip('class', isFr ? 'Cours' : 'Classes'),
                  const SizedBox(width: 8),
                  _buildFilterChip('room', isFr ? 'Salle intégrée' : 'Class room'),
                  const SizedBox(width: 8),
                  _buildFilterChip('exam', isFr ? 'Examens' : 'Exams'),
                  const SizedBox(width: 8),
                  _buildFilterChip('live', isFr ? 'En direct' : 'Live'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: CircularProgressIndicator(color: AppColors.frenchNavy),
                ),
              )
            else if (_error != null)
              EmptyState(
                title: isFr ? 'Erreur' : 'Error',
                message: _error!,
                icon: Icons.cloud_off_outlined,
                actionText: isFr ? 'Réessayer' : 'Retry',
                onAction: _fetchSchedule,
              )
            else if (daySchedules.isEmpty)
              EmptyState(
                title: isFr ? 'Aucune séance programmée' : 'Nothing scheduled',
                message: isFr ? 'Aucun cours n\'est prévu pour cette date.' : 'No class is planned for this date.',
                icon: Icons.event_available_outlined,
                actionText: isFr ? 'Ajouter une séance' : 'Add a session',
                onAction: () => _openEditor(),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: daySchedules.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14),
                itemBuilder: (context, idx) => _sessionCard(daySchedules[idx] as Map<String, dynamic>, isFr),
              ),
          ],
        ),
      ),
    );
  }

  Widget _dayCell(DateTime day, bool isFr) {
    final now = DateTime.now();
    final isSelected = day.year == _selectedDate.year && day.month == _selectedDate.month && day.day == _selectedDate.day;
    final isToday = day.year == now.year && day.month == now.month && day.day == now.day;
    final hasSessions = _schedules.any((s) {
      final dt = _local((s as Map)['start_time']);
      return dt != null && dt.year == day.year && dt.month == day.month && dt.day == day.day;
    });
    return GestureDetector(
      onTap: () => setState(() => _selectedDate = day),
      child: Container(
        width: 58,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.frenchNavy
              : isToday
                  ? AppColors.frenchNavy.withValues(alpha: 0.08)
                  : AppColors.pureWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? AppColors.frenchNavy : AppColors.border, width: 1.2),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              DateFormat('E', isFr ? 'fr_FR' : 'en_US').format(day).toUpperCase(),
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.pureWhite : isToday ? AppColors.frenchNavy : AppColors.textMuted,
                fontSize: 10,
              ),
            ),
            Text(
              '${day.day}',
              style: AppTypography.titleMedium.copyWith(
                fontWeight: FontWeight.w800,
                color: isSelected ? AppColors.pureWhite : AppColors.ink,
              ),
            ),
            Container(
              width: 5,
              height: 5,
              decoration: BoxDecoration(
                color: hasSessions
                    ? (isSelected ? AppColors.frenchGold : AppColors.frenchNavy)
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sessionCard(Map<String, dynamic> item, bool isFr) {
    final liveState = _computeLiveState(item);
    final room = _isRoom(item);
    final mode = item['location_mode'] ?? 'online';
    final start = _local(item['start_time'] ?? item['start']);
    final end = _local(item['end_time'] ?? item['end']);
    final timeRange = start != null && end != null
        ? '${DateFormat('HH:mm').format(start)} – ${DateFormat('HH:mm').format(end)}'
        : '';
    final over = liveState == 'ended' || liveState == 'completed' || liveState == 'cancelled';
    final roomLive = item['meeting_status'] == 'active';
    final now = DateTime.now();
    final isToday = start != null && start.year == now.year && start.month == now.month && start.day == now.day;
    final link = '${item['link'] ?? ''}';

    final String placeText;
    final IconData placeIcon;
    if (room) {
      placeText = isFr ? 'Salle intégrée · ${item['meeting_code'] ?? ''}' : 'Class room · ${item['meeting_code'] ?? ''}';
      placeIcon = Icons.video_camera_front_outlined;
    } else if (mode == 'physical') {
      placeText = (item['location'] ?? '').toString().isNotEmpty ? item['location'] : (isFr ? 'Présentiel' : 'In person');
      placeIcon = Icons.location_on_outlined;
    } else {
      placeText = isFr ? 'Lien externe' : 'External link';
      placeIcon = Icons.link;
    }

    final actions = <Widget>[
      if (room && !over && (roomLive || liveState == 'live' || liveState == 'soon' || isToday))
        ElevatedButton.icon(
          onPressed: _openingId == item['id'] ? null : () => _openRoom(item),
          icon: _openingId == item['id']
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.pureWhite))
              : const Icon(Icons.video_call, size: 18),
          label: Text(roomLive ? (isFr ? 'Rejoindre' : 'Join class') : (isFr ? 'Démarrer le cours' : 'Start class')),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.frenchNavy,
            foregroundColor: AppColors.pureWhite,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      if (room && !over)
        OutlinedButton.icon(
          onPressed: () => _shareRoom(item),
          icon: const Icon(Icons.ios_share, size: 16),
          label: Text(isFr ? 'Inviter' : 'Invite'),
          style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
        ),
      if (!room && item['type'] == 'class' && !over && isToday)
        OutlinedButton.icon(
          onPressed: () => _startAttendance(item),
          icon: const Icon(Icons.pin, size: 16, color: AppColors.teacherAccent),
          label: Text(isFr ? 'Émargement' : 'Attendance'),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.teacherAccent,
            side: const BorderSide(color: AppColors.teacherAccentLine),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      if (!room && mode == 'online' && link.startsWith('http') && !over)
        ElevatedButton.icon(
          onPressed: () => _openLink(link),
          icon: const Icon(Icons.open_in_new, size: 16),
          label: Text(isFr ? 'Ouvrir le lien' : 'Open link'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.frenchNavy,
            foregroundColor: AppColors.pureWhite,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: roomLive ? AppColors.good : AppColors.border,
          width: roomLive ? 1.6 : 1.1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    StatusBadge.liveState(liveState),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.surfaceSoft, borderRadius: BorderRadius.circular(6)),
                      child: Text(timeRange, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
                onSelected: (action) {
                  if (action == 'edit') {
                    _openEditor(item: item);
                  } else if (action == 'share') {
                    _shareRoom(item);
                  } else if (action == 'delete') {
                    _confirmDelete(item);
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(value: 'edit', child: Text(isFr ? 'Modifier' : 'Edit')),
                  if (room) PopupMenuItem(value: 'share', child: Text(isFr ? 'Partager l\'invitation' : 'Share invitation')),
                  PopupMenuItem(
                    value: 'delete',
                    child: Text(isFr ? 'Supprimer' : 'Delete', style: const TextStyle(color: AppColors.bad)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            item['title'] ?? (isFr ? 'Séance' : 'Session'),
            style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 14,
            runSpacing: 4,
            children: [
              _meta(Icons.school_outlined, '${item['batch_name'] ?? (isFr ? 'Cohorte' : 'Batch')}'),
              _meta(placeIcon, placeText, highlight: room),
            ],
          ),
          if (actions.isNotEmpty) ...[
            const SizedBox(height: 14),
            Wrap(spacing: 8, runSpacing: 8, alignment: WrapAlignment.end, children: actions),
          ],
        ],
      ),
    );
  }

  Widget _meta(IconData icon, String text, {bool highlight = false}) {
    final color = highlight ? AppColors.frenchNavy : AppColors.textMuted;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: color),
        const SizedBox(width: 5),
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 240),
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.caption.copyWith(color: color, fontWeight: highlight ? FontWeight.w700 : null),
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String id, String label) {
    final isSelected = _filterType == id;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.frenchNavy,
      backgroundColor: AppColors.pureWhite,
      labelStyle: AppTypography.caption.copyWith(
        fontWeight: FontWeight.w700,
        color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
      ),
      side: BorderSide(color: isSelected ? AppColors.frenchNavy : AppColors.border),
      onSelected: (_) => setState(() => _filterType = id),
    );
  }
}
