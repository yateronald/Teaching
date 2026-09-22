import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../widgets/join_with_id_sheet.dart';
import '../widgets/meeting_attendance_sheet.dart';
import '../widgets/meeting_share_sheet.dart';
import 'pre_join_screen.dart';

/// How many past meetings are revealed at a time.
const int _pastPage = 10;

/// Ordering used when several meetings are live or opening at once, so the one
/// that needs attention first is the one on top.
const Map<String, int> _statusRank = {
  'active': 0,
  'waiting': 1,
  'scheduled': 2,
  'ended': 3,
};

DateTime? _at(dynamic iso) {
  if (iso == null) return null;
  return DateTime.tryParse(iso.toString())?.toLocal();
}

int? _minutesBetween(dynamic a, dynamic b) {
  final start = _at(a);
  final end = _at(b);
  if (start == null || end == null) return null;
  final diff = end.difference(start).inMinutes;
  return diff < 0 ? 0 : diff;
}

/// "45 min", "1 h 20 min" — the shape the web list uses for class length.
String _durationText(int? minutes) {
  if (minutes == null) return '—';
  if (minutes < 60) return '$minutes min';
  final h = minutes ~/ 60;
  final m = minutes % 60;
  return m == 0 ? '$h h' : '$h h $m min';
}

/// Same idea for a countdown: minutes, then hours, then days.
String _spanText(Duration d) {
  final minutes = d.inMinutes < 1 ? 1 : d.inMinutes;
  if (minutes < 60) return '$minutes min';
  final hours = minutes ~/ 60;
  if (hours < 24) {
    final m = minutes % 60;
    return m == 0 ? '$hours h' : '$hours h $m min';
  }
  final days = hours ~/ 24;
  final h = hours % 24;
  return h == 0 ? '$days j' : '$days j $h h';
}

class LiveMeetingsScreen extends ConsumerStatefulWidget {
  const LiveMeetingsScreen({super.key});

  @override
  ConsumerState<LiveMeetingsScreen> createState() => _LiveMeetingsScreenState();
}

class _LiveMeetingsScreenState extends ConsumerState<LiveMeetingsScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _meetings = [];
  List<dynamic> _batches = [];
  String _tab = 'upcoming';
  int _pastLimit = _pastPage;

  /// Countdowns and the "not started yet" pills are derived from the clock, so
  /// the screen keeps its own notion of now and refreshes it on a timer.
  DateTime _now = DateTime.now();
  Timer? _ticker;

  /// Once the teacher picks a tab we stop moving it for them.
  bool _tabChosenByUser = false;

  @override
  void initState() {
    super.initState();
    _fetchMeetings();
    _ticker = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _fetchMeetings() async {
    if (mounted) setState(() => _error = null);
    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait([
        client.get('/meetings'),
        client.get('/batches'),
      ]);

      final mData = results[0].data;
      final bData = results[1].data;
      final rawMeetings = mData is List ? mData : (mData?['meetings'] ?? mData?['data'] ?? []);

      if (!mounted) return;
      setState(() {
        _meetings = (rawMeetings as List).map((e) => Map<String, dynamic>.from(e as Map)).toList();
        _batches = bData is List ? bData : (bData?['batches'] ?? bData?['data'] ?? []);
        _isLoading = false;
        _now = DateTime.now();
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Impossible de charger les réunions en direct.';
        _isLoading = false;
      });
    }
  }

  // ── Who am I looking at this list as? ──

  int? get _userId => ref.read(authProvider).user?.id;
  bool _isHost(Map<String, dynamic> m) => m['teacher_id'] != null && m['teacher_id'] == _userId;

  String _codeOf(Map<String, dynamic> m) =>
      (m['code'] ?? m['room_name'] ?? m['id'] ?? '').toString();

  // ── Buckets ──
  //
  // A meeting moves between tabs on its clock, not only on the status the
  // server last wrote. A class whose start time has passed belongs with the
  // live ones even while its status is still 'scheduled', which is what the
  // web list does — otherwise a teacher looking for today's class finds it
  // filed under "à venir".

  List<Map<String, dynamic>> get _past {
    final list = _meetings.where((m) {
      final status = (m['status'] ?? 'scheduled').toString().toLowerCase();
      if (status == 'ended' || status == 'cancelled') return true;
      final end = _at(m['ended_at'] ?? m['scheduled_end']);
      return status != 'active' && end != null && _now.isAfter(end);
    }).toList();
    list.sort((a, b) {
      final ea = _at(a['ended_at'] ?? a['started_at'] ?? a['created_at']);
      final eb = _at(b['ended_at'] ?? b['started_at'] ?? b['created_at']);
      if (ea == null || eb == null) return 0;
      return eb.compareTo(ea);
    });
    return list;
  }

  List<Map<String, dynamic>> get _active {
    final pastIds = _past.map((m) => m['id']).toSet();
    final list = _meetings.where((m) {
      if (pastIds.contains(m['id'])) return false;
      final status = (m['status'] ?? 'scheduled').toString().toLowerCase();
      if (status == 'active' || status == 'live' || status == 'waiting') return true;
      final start = _at(m['started_at'] ?? m['scheduled_start']);
      return start != null && !_now.isBefore(start);
    }).toList();
    list.sort((a, b) {
      final ra = _statusRank[(a['status'] ?? 'scheduled').toString().toLowerCase()] ?? 2;
      final rb = _statusRank[(b['status'] ?? 'scheduled').toString().toLowerCase()] ?? 2;
      if (ra != rb) return ra.compareTo(rb);
      return _whenOf(a)?.compareTo(_whenOf(b) ?? _now) ?? 0;
    });
    return list;
  }

  List<Map<String, dynamic>> get _upcoming {
    final taken = {..._past.map((m) => m['id']), ..._active.map((m) => m['id'])};
    final list = _meetings.where((m) => !taken.contains(m['id'])).toList();
    list.sort((a, b) {
      final wa = _whenOf(a);
      final wb = _whenOf(b);
      if (wa == null || wb == null) return 0;
      return wa.compareTo(wb);
    });
    return list;
  }

  DateTime? _whenOf(Map<String, dynamic> m) =>
      _at(m['started_at'] ?? m['scheduled_start'] ?? m['created_at']);

  Duration? _startsIn(Map<String, dynamic> m) {
    final start = _at(m['scheduled_start']);
    if (start == null || !start.isAfter(_now)) return null;
    return start.difference(_now);
  }

  // ── Labels ──

  String _time(dynamic iso) {
    final dt = _at(iso);
    return dt == null ? '' : DateFormat('HH:mm', 'fr_FR').format(dt);
  }

  String _rangeOf(Map<String, dynamic> m) {
    final start = m['started_at'] ?? m['scheduled_start'];
    if (start == null) return '';
    final end = m['ended_at'] ?? m['scheduled_end'];
    return end == null ? _time(start) : '${_time(start)} – ${_time(end)}';
  }

  String _dayLabel(DateTime dt) {
    final today = DateTime(_now.year, _now.month, _now.day);
    final day = DateTime(dt.year, dt.month, dt.day);
    final diff = day.difference(today).inDays;
    if (diff == 0) return "Aujourd'hui";
    if (diff == 1) return 'Demain';
    return DateFormat('EEEE d MMM', 'fr_FR').format(dt);
  }

  String _teacherOf(Map<String, dynamic> m) {
    final name = '${m['teacher_first_name'] ?? ''} ${m['teacher_last_name'] ?? ''}'.trim();
    return name.isEmpty ? 'Enseignant' : name;
  }

  int _peopleOf(Map<String, dynamic> m) =>
      int.tryParse('${m['participant_count'] ?? 0}') ?? 0;

  // ── Actions ──

  void _openMeeting(Map<String, dynamic> m) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => PreJoinScreen(meeting: m)),
    );
  }

  /// The host has to tell the server the room is opening before anyone can be
  /// let in. The web list does this on "Start class"; without it a student who
  /// taps join lands in a room that was never opened.
  Future<void> _prepareAndOpen(Map<String, dynamic> m) async {
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/${m['id']}/prepare');
      if (!mounted) return;
      _openMeeting(m);
    } catch (_) {
      if (!mounted) return;
      _snack("Impossible d'ouvrir la classe.");
    }
  }

  Future<void> _copyCode(Map<String, dynamic> m) async {
    await Clipboard.setData(ClipboardData(text: _codeOf(m)));
    if (!mounted) return;
    _snack('Identifiant de réunion copié');
  }

  void _snack(String text) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(text)));
  }

  Future<void> _confirmDelete(Map<String, dynamic> m) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer cette réunion ?'),
        content: Text('« ${m['title'] ?? 'Réunion'} » sera retirée pour tout le monde.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.bad),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (ok != true) return;
    try {
      final client = ref.read(apiClientProvider);
      await client.delete('/meetings/${m['id']}');
      await _fetchMeetings();
      if (mounted) _snack('Réunion supprimée.');
    } catch (_) {
      if (mounted) _snack('Échec de la suppression.');
    }
  }

  void _openShareSheet(Map<String, dynamic> meeting, {bool isCreated = false}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => MeetingShareSheet(
        meeting: meeting,
        isCreated: isCreated,
        onPasscodeChanged: (_) => _fetchMeetings(),
      ),
    );
  }

  void _openJoinWithIdSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const JoinWithIdSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isWide = width >= 720;
    final isCompact = width < 380;
    final pad = isWide ? 28.0 : (isCompact ? 14.0 : 18.0);

    final upcoming = _upcoming;
    final active = _active;
    final past = _past;

    // With nothing coming up but a class already running, open on that class.
    if (!_isLoading && !_tabChosenByUser && _tab == 'upcoming' && upcoming.isEmpty && active.isNotEmpty) {
      _tab = 'active';
    }

    final visible = _tab == 'active'
        ? active
        : _tab == 'upcoming'
            ? upcoming
            : past.take(_pastLimit).toList();

    return RefreshIndicator(
      onRefresh: _fetchMeetings,
      color: AppColors.frenchNavy,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.fromLTRB(pad, 20, pad, 32),
        children: [
          _header(isWide: isWide, isCompact: isCompact),
          const SizedBox(height: 18),

          if (_error != null) ...[
            _errorAlert(),
            const SizedBox(height: 18),
          ],

          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 72),
              child: Center(child: CircularProgressIndicator(color: AppColors.frenchNavy)),
            )
          else ...[
            // The next class gets a card of its own, as on the web list.
            if (upcoming.isNotEmpty) ...[
              _heroCard(upcoming.first, isWide: isWide, isCompact: isCompact),
              const SizedBox(height: 18),
            ],

            _statsRow(
              upcoming: upcoming.length,
              active: active.length,
              done: past.length,
              minutes: past.fold<int>(0, (sum, m) => sum + (_minutesBetween(m['started_at'], m['ended_at']) ?? 0)),
              isWide: isWide,
              isCompact: isCompact,
            ),
            const SizedBox(height: 18),

            _tabs(
              upcoming: upcoming.length,
              active: active.length,
              past: past.length,
              hasLive: active.any((m) => (m['status'] ?? '').toString().toLowerCase() == 'active'),
              isCompact: isCompact,
            ),
            const SizedBox(height: 16),

            if (visible.isEmpty)
              _emptyForTab(upcoming.length, active.length, past.length)
            else
              ...visible.map((m) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _meetingRow(m, isWide: isWide, isCompact: isCompact),
                  )),

            if (_tab == 'past' && past.length > _pastLimit)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Center(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _pastLimit += _pastPage),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.frenchNavy,
                      side: const BorderSide(color: AppColors.border),
                      minimumSize: const Size(0, 44),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('Afficher ${past.length - _pastLimit < _pastPage ? past.length - _pastLimit : _pastPage} de plus'),
                  ),
                ),
              ),
          ],
        ],
      ),
    );
  }

  // ── Header ──

  Widget _header({required bool isWide, required bool isCompact}) {
    final title = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'CLASSES EN DIRECT',
          style: AppTypography.labelSmall.copyWith(
            color: AppColors.teacherDot,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Classes Virtuelles & Réunions',
          style: (isCompact ? AppTypography.headlineSmall : AppTypography.headlineMedium)
              .copyWith(fontWeight: FontWeight.w700, color: AppColors.frenchNavy),
        ),
        const SizedBox(height: 4),
        Text(
          'Planifiez, démarrez et gérez vos cours en direct.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
      ],
    );

    final actions = [
      OutlinedButton.icon(
        onPressed: _openJoinWithIdSheet,
        icon: const Icon(Icons.tag, size: 16),
        label: const FittedBox(
          fit: BoxFit.scaleDown,
          child: Text('Rejoindre avec ID'),
        ),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.frenchNavy,
          side: const BorderSide(color: AppColors.border),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          minimumSize: const Size(0, 46),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
      CustomButton(
        text: 'Nouvelle réunion',
        icon: Icons.video_call,
        height: 46,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        onPressed: _openCreateSheet,
      ),
    ];

    // Side by side only when there is room; otherwise the buttons take the full
    // width under the title so neither of them gets squeezed to an ellipsis.
    if (isWide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: title),
          const SizedBox(width: 16),
          Row(mainAxisSize: MainAxisSize.min, children: [
            actions[0],
            const SizedBox(width: 10),
            actions[1],
          ]),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        title,
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: actions[0]),
          const SizedBox(width: 10),
          Expanded(child: actions[1]),
        ]),
      ],
    );
  }

  Widget _errorAlert() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.badBg,
        border: Border.all(color: AppColors.badBorder),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_off_outlined, color: AppColors.bad, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
          ),
          TextButton(
            onPressed: _fetchMeetings,
            style: TextButton.styleFrom(foregroundColor: AppColors.bad),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }

  // ── The next class ──

  Widget _heroCard(Map<String, dynamic> m, {required bool isWide, required bool isCompact}) {
    final isLive = (m['status'] ?? '').toString().toLowerCase() == 'active';
    final left = _startsIn(m);
    final when = _whenOf(m);
    final started = _at(m['started_at']);

    String overline;
    if (isLive) {
      overline = 'En direct';
    } else if ((m['status'] ?? '').toString().toLowerCase() == 'waiting') {
      overline = 'Ouverture imminente';
    } else {
      overline = 'Prochaine classe';
    }

    String? countdown;
    if (isLive && started != null) {
      countdown = 'Démarrée il y a ${_spanText(_now.difference(started))}';
    } else if (left != null) {
      countdown = 'Commence dans ${_spanText(left)}';
    }

    final onDark = isLive;
    final fg = onDark ? AppColors.pureWhite : AppColors.ink;
    final fgMuted = onDark ? AppColors.pureWhite.withValues(alpha: 0.78) : AppColors.textMuted;

    final headerTags = Wrap(
      spacing: 10,
      runSpacing: 6,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: onDark
                ? Colors.white.withValues(alpha: 0.18)
                : const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isLive) ...[
                Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: Color(0xFF34D399),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
              ],
              Text(
                overline.toUpperCase(),
                style: TextStyle(
                  color: onDark ? Colors.white : const Color(0xFF047857),
                  fontWeight: FontWeight.w700,
                  fontSize: 11,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ),
        if (countdown != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
            decoration: BoxDecoration(
              color: onDark
                  ? Colors.white.withValues(alpha: 0.14)
                  : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.schedule, size: 13, color: fgMuted),
                const SizedBox(width: 5),
                Text(
                  countdown,
                  style: AppTypography.caption.copyWith(
                    color: fgMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
      ],
    );

    final metaRow = Wrap(
      spacing: 16,
      runSpacing: 6,
      children: [
        if (when != null)
          _metaChip(Icons.calendar_today_outlined, '${_dayLabel(when)} · ${_rangeOf(m)}', fgMuted),
        _metaChip(Icons.person_outline, _teacherOf(m), fgMuted),
        if ((m['batch_name'] ?? '').toString().isNotEmpty)
          _metaChip(Icons.groups_outlined, m['batch_name'].toString(), fgMuted),
        if (isLive) _metaChip(Icons.videocam_outlined, '${_peopleOf(m)} connectés', fgMuted),
      ],
    );

    if (isWide) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        decoration: BoxDecoration(
          gradient: onDark
              ? const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF047857), Color(0xFF0F766E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : const LinearGradient(
                  colors: [Colors.white, Color(0xFFF8FAFC)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: onDark ? Colors.transparent : AppColors.border,
            width: 1.1,
          ),
          boxShadow: [
            BoxShadow(
              color: onDark
                  ? const Color(0xFF047857).withValues(alpha: 0.25)
                  : Colors.black.withValues(alpha: 0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 4,
              height: 76,
              decoration: BoxDecoration(
                color: isLive ? const Color(0xFF34D399) : const Color(0xFF047857),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  headerTags,
                  const SizedBox(height: 8),
                  Text(
                    (m['title'] ?? 'Réunion').toString(),
                    style: AppTypography.titleLarge.copyWith(
                      fontWeight: FontWeight.w700,
                      color: fg,
                    ),
                  ),
                  if ((m['description'] ?? '').toString().isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      m['description'].toString(),
                      style: AppTypography.bodySmall.copyWith(color: fgMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 10),
                  metaRow,
                ],
              ),
            ),
            const SizedBox(width: 20),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _actionsFor(m, onDark: onDark),
                if (_isHost(m)) ...[
                  const SizedBox(width: 10),
                  OutlinedButton.icon(
                    onPressed: () => _openShareSheet(m),
                    icon: const Icon(Icons.link, size: 16),
                    label: const Text('Partager'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: onDark ? Colors.white : AppColors.ink,
                      side: BorderSide(
                        color: onDark ? Colors.white.withValues(alpha: 0.4) : AppColors.border,
                      ),
                      minimumSize: const Size(0, 46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(isCompact ? 16 : 20),
      decoration: BoxDecoration(
        gradient: onDark
            ? const LinearGradient(
                colors: [AppColors.frenchNavy, AppColors.frenchNavyDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: onDark ? null : AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: onDark ? Colors.transparent : AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          headerTags,
          const SizedBox(height: 10),
          Text(
            (m['title'] ?? 'Réunion').toString(),
            style: (isCompact ? AppTypography.titleMedium : AppTypography.titleLarge)
                .copyWith(fontWeight: FontWeight.w700, color: fg),
          ),
          if ((m['description'] ?? '').toString().isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              m['description'].toString(),
              style: AppTypography.bodySmall.copyWith(color: fgMuted),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 12),
          metaRow,
          const SizedBox(height: 16),
          _actionsFor(m, onDark: onDark, fullWidth: true),
        ],
      ),
    );
  }

  Widget _metaChip(IconData icon, String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 5),
        Text(label, style: AppTypography.caption.copyWith(color: color)),
      ],
    );
  }

  // ── Key numbers ──

  Widget _statsRow({
    required int upcoming,
    required int active,
    required int done,
    required int minutes,
    required bool isWide,
    required bool isCompact,
  }) {
    final tiles = [
      _statTile(Icons.calendar_today_outlined, 'À venir', '$upcoming', AppColors.frenchBlueLight),
      _statTile(Icons.videocam_outlined, 'En direct', '$active', AppColors.good),
      _statTile(Icons.check_circle_outline, 'Terminées', '$done', AppColors.textMuted),
      _statTile(Icons.timelapse_outlined, 'Temps de classe', _durationText(minutes), AppColors.frenchGold),
    ];

    // Four across is unreadable under a phone's width, so they pair up instead.
    final perRow = isWide ? 4 : 2;
    final rows = <Widget>[];
    for (var i = 0; i < tiles.length; i += perRow) {
      final slice = tiles.sublist(i, (i + perRow).clamp(0, tiles.length));
      rows.add(Row(
        children: [
          for (var j = 0; j < slice.length; j++) ...[
            if (j > 0) SizedBox(width: isCompact ? 8 : 10),
            Expanded(child: slice[j]),
          ],
        ],
      ));
      if (i + perRow < tiles.length) rows.add(SizedBox(height: isCompact ? 8 : 10));
    }
    return Column(children: rows);
  }

  Widget _statTile(IconData icon, String label, String value, Color tone) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 17, color: tone),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  label,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  value,
                  style: AppTypography.titleSmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Tabs ──

  Widget _tabs({
    required int upcoming,
    required int active,
    required int past,
    required bool hasLive,
    required bool isCompact,
  }) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Row(
        children: [
          _tabChip('upcoming', 'À venir', upcoming, isCompact: isCompact),
          _tabChip('active', 'En cours', active, isCompact: isCompact, showDot: hasLive),
          _tabChip('past', 'Terminées', past, isCompact: isCompact),
        ],
      ),
    );
  }

  Widget _tabChip(String id, String label, int count, {required bool isCompact, bool showDot = false}) {
    final isSelected = _tab == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _tab = id;
          _tabChosenByUser = true;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.pureWhite : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 1))]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (showDot) ...[
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(color: AppColors.good, shape: BoxShape.circle),
                ),
                const SizedBox(width: 5),
              ],
              Flexible(
                child: Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? AppColors.frenchNavy : AppColors.textMuted,
                  ),
                ),
              ),
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.frenchNavy : AppColors.border,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$count',
                  style: AppTypography.labelSmall.copyWith(
                    color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyForTab(int upcoming, int active, int past) {
    if (_tab == 'active') {
      return EmptyState(
        title: 'Aucune classe en cours',
        message: "Aucun cours n'est en direct pour le moment.",
        icon: Icons.videocam_outlined,
        actionText: upcoming > 0 ? 'Voir les classes à venir ($upcoming)' : 'Nouvelle réunion',
        onAction: upcoming > 0
            ? () => setState(() {
                  _tab = 'upcoming';
                  _tabChosenByUser = true;
                })
            : _openCreateSheet,
      );
    }
    if (_tab == 'upcoming') {
      return EmptyState(
        title: 'Aucune classe à venir',
        message: 'Créez une réunion pour planifier votre prochain cours en direct.',
        icon: Icons.calendar_today_outlined,
        actionText: active > 0 ? 'Voir les classes en cours ($active)' : 'Nouvelle réunion',
        onAction: active > 0
            ? () => setState(() {
                  _tab = 'active';
                  _tabChosenByUser = true;
                })
            : _openCreateSheet,
      );
    }
    return const EmptyState(
      title: 'Aucune classe terminée',
      message: 'Les cours apparaissent ici une fois terminés.',
      icon: Icons.history,
    );
  }

  // ── One meeting ──

  Widget _meetingRow(Map<String, dynamic> m, {required bool isWide, required bool isCompact}) {
    final status = (m['status'] ?? 'scheduled').toString().toLowerCase();
    final isEnded = _tab == 'past';
    final when = _whenOf(m);
    final host = _isHost(m);

    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                (m['title'] ?? 'Réunion').toString(),
                style: AppTypography.titleSmall.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isEnded ? AppColors.textMuted : AppColors.ink,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (m['is_locked'] == true) ...[
              const SizedBox(width: 6),
              const Tooltip(
                message: 'Verrouillée — aucun nouveau participant',
                child: Icon(Icons.lock_outline, size: 15, color: AppColors.textSubtle),
              ),
            ],
            if ((m['my_role'] ?? '').toString() == 'guest') ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.frenchGoldBg,
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text('Invité',
                    style: AppTypography.labelSmall.copyWith(color: AppColors.frenchGold)),
              ),
            ],
          ],
        ),
        const SizedBox(height: 7),
        Wrap(
          spacing: 12,
          runSpacing: 5,
          children: [
            _metaChip(Icons.access_time, _rangeOf(m).isEmpty ? 'Horaire non défini' : _rangeOf(m), AppColors.textMuted),
            _metaChip(Icons.person_outline, _teacherOf(m), AppColors.textMuted),
            if ((m['batch_name'] ?? '').toString().isNotEmpty)
              _metaChip(Icons.groups_outlined, m['batch_name'].toString(), AppColors.textMuted),
            if (isEnded)
              _metaChip(Icons.history, _durationText(_minutesBetween(m['started_at'], m['ended_at'])), AppColors.textMuted),
            if (isEnded)
              _metaChip(Icons.people_outline, '${_peopleOf(m)} participants', AppColors.textMuted),
            if (!isEnded && status == 'active')
              _metaChip(Icons.videocam_outlined, '${_peopleOf(m)} connectés', AppColors.textMuted),
            if (!isEnded && host)
              InkWell(
                onTap: () => _copyCode(m),
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.tag, size: 13, color: AppColors.frenchNavy),
                    const SizedBox(width: 3),
                    Text(
                      _codeOf(m),
                      style: AppTypography.caption.copyWith(
                        color: AppColors.frenchNavy,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 3),
                    const Icon(Icons.copy_rounded, size: 11, color: AppColors.textSubtle),
                  ]),
                ),
              ),
          ],
        ),
      ],
    );

    if (isWide) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          color: isEnded ? AppColors.surfaceSoft : AppColors.pureWhite,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: status == 'active' ? AppColors.goodBorder : AppColors.border,
            width: 1.1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            _dateBlock(when, muted: isEnded),
            const SizedBox(width: 16),
            Expanded(child: body),
            const SizedBox(width: 16),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _statusPill(m),
                const SizedBox(width: 12),
                if (!isEnded) ...[
                  _actionsFor(m),
                  const SizedBox(width: 8),
                  if (host) ...[
                    _iconAction(Icons.link, 'Partager', () => _openShareSheet(m)),
                    const SizedBox(width: 6),
                    _iconAction(Icons.delete_outline, 'Supprimer', () => _confirmDelete(m), danger: true),
                    const SizedBox(width: 6),
                  ],
                  _iconAction(Icons.fact_check_outlined, 'Émargement', () => _openAttendanceSheet(m)),
                ] else ...[
                  _iconAction(Icons.fact_check_outlined, 'Voir l\'émargement', () => _openAttendanceSheet(m)),
                ],
              ],
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(isCompact ? 14 : 16),
      decoration: BoxDecoration(
        color: isEnded ? AppColors.surfaceSoft : AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: status == 'active' ? AppColors.goodBorder : AppColors.border,
          width: 1.1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dateBlock(when, muted: isEnded),
              const SizedBox(width: 12),
              Expanded(child: body),
              const SizedBox(width: 8),
              _statusPill(m),
            ],
          ),
          if (!isEnded) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                if (host) ...[
                  _iconAction(Icons.link, 'Partager', () => _openShareSheet(m)),
                  const SizedBox(width: 6),
                  _iconAction(Icons.delete_outline, 'Supprimer', () => _confirmDelete(m), danger: true),
                  const SizedBox(width: 6),
                ],
                _iconAction(Icons.fact_check_outlined, 'Émargement', () => _openAttendanceSheet(m)),
                const Spacer(),
                Flexible(child: _actionsFor(m)),
              ],
            ),
          ] else ...[
            const SizedBox(height: 14),
            Row(
              children: [
                _iconAction(Icons.fact_check_outlined, 'Voir l\'émargement', () => _openAttendanceSheet(m)),
              ],
            ),
          ],
        ],
      ),
    );
  }

  void _openAttendanceSheet(Map<String, dynamic> m) {
    final meetingId = (m['id'] as num?)?.toInt() ?? int.tryParse(m['id'].toString()) ?? 0;
    final title = (m['title'] ?? 'Réunion').toString();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => MeetingAttendanceSheet(
        meetingId: meetingId,
        meetingTitle: title,
      ),
    );
  }

  /// The month / day / weekday tile down the left of every row.
  Widget _dateBlock(DateTime? dt, {bool muted = false}) {
    final color = muted ? AppColors.textSubtle : AppColors.frenchNavy;
    return Container(
      width: 52,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: muted ? AppColors.borderSoft : AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: dt == null
            ? [Text('—', style: AppTypography.titleSmall.copyWith(color: color))]
            : [
                Text(
                  DateFormat('MMM', 'fr_FR').format(dt).toUpperCase(),
                  style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted, fontSize: 10),
                ),
                Text(
                  DateFormat('d', 'fr_FR').format(dt),
                  style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700, color: color),
                ),
                Text(
                  DateFormat('E', 'fr_FR').format(dt).toUpperCase(),
                  style: AppTypography.labelSmall.copyWith(color: AppColors.textSubtle, fontSize: 9),
                ),
              ],
      ),
    );
  }

  Widget _statusPill(Map<String, dynamic> m) {
    final status = (m['status'] ?? 'scheduled').toString().toLowerCase();
    Color bg;
    Color fg;
    String label;
    bool dot = false;

    if (_tab == 'past' || status == 'ended' || status == 'cancelled') {
      bg = AppColors.border;
      fg = AppColors.textMuted;
      label = 'Terminée';
    } else if (status == 'active') {
      bg = AppColors.goodBg;
      fg = AppColors.good;
      label = 'En direct';
      dot = true;
    } else if (status == 'waiting') {
      bg = AppColors.warnBg;
      fg = AppColors.warn;
      label = 'Ouverture';
    } else {
      final start = _at(m['started_at'] ?? m['scheduled_start']);
      if (start != null && !_now.isBefore(start)) {
        bg = AppColors.warnBg;
        fg = AppColors.warn;
        label = _isHost(m) ? 'Pas démarrée' : "En attente";
      } else {
        final left = _startsIn(m);
        if (left != null && left.inHours < 24) {
          bg = AppColors.teacherAccentSoft;
          fg = AppColors.teacherAccent;
          label = 'Dans ${_spanText(left)}';
        } else {
          bg = AppColors.surfaceSoft;
          fg = AppColors.textMuted;
          label = 'Programmée';
        }
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot) ...[
            Container(width: 6, height: 6, decoration: BoxDecoration(color: fg, shape: BoxShape.circle)),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(color: fg, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  Widget _iconAction(IconData icon, String tooltip, VoidCallback onTap, {bool danger = false}) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(9),
        child: Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(9),
            border: Border.all(color: AppColors.border),
          ),
          child: Icon(icon, size: 18, color: danger ? AppColors.bad : AppColors.textMuted),
        ),
      ),
    );
  }

  /// Which button a meeting shows depends on its state and on whether the
  /// person looking at it is the one who has to open the room.
  Widget _actionsFor(Map<String, dynamic> m, {bool onDark = false, bool fullWidth = false}) {
    final status = (m['status'] ?? 'scheduled').toString().toLowerCase();
    final host = _isHost(m);
    final start = _at(m['started_at'] ?? m['scheduled_start']);
    final hasStarted = start != null && !_now.isBefore(start);

    String label;
    IconData icon = Icons.videocam;
    VoidCallback onTap;
    bool primary = true;

    if (status == 'active') {
      label = host ? 'Revenir au direct' : 'Rejoindre';
      onTap = () => _openMeeting(m);
    } else if (status == 'waiting') {
      label = host ? 'Continuer' : 'Rejoindre';
      onTap = () => _openMeeting(m);
    } else if (hasStarted && status != 'ended') {
      label = host ? 'Démarrer la classe' : 'Rejoindre la classe';
      onTap = host ? () => _prepareAndOpen(m) : () => _openMeeting(m);
    } else if (host) {
      label = 'Démarrer la classe';
      onTap = () => _prepareAndOpen(m);
    } else {
      label = 'Tester mes appareils';
      icon = Icons.settings_outlined;
      primary = false;
      onTap = () => _openMeeting(m);
    }

    final bg = onDark
        ? AppColors.pureWhite
        : (status == 'active' ? AppColors.good : AppColors.frenchNavy);
    final fg = onDark ? AppColors.frenchNavy : AppColors.pureWhite;

    final button = primary
        ? ElevatedButton.icon(
            onPressed: onTap,
            icon: Icon(icon, size: 18),
            label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
            style: ElevatedButton.styleFrom(
              backgroundColor: bg,
              foregroundColor: fg,
              elevation: 0,
              minimumSize: const Size(0, 46),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          )
        : OutlinedButton.icon(
            onPressed: onTap,
            icon: Icon(icon, size: 18),
            label: Text(label, maxLines: 1, overflow: TextOverflow.ellipsis),
            style: OutlinedButton.styleFrom(
              foregroundColor: onDark ? AppColors.pureWhite : AppColors.frenchNavy,
              side: BorderSide(color: onDark ? AppColors.pureWhite : AppColors.border),
              minimumSize: const Size(0, 46),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
          );

    if (!fullWidth) return button;

    // On the hero card the host also gets Share next to the main action.
    if (_isHost(m)) {
      return Row(children: [
        Expanded(child: button),
        const SizedBox(width: 10),
        OutlinedButton.icon(
          onPressed: () => _openShareSheet(m),
          icon: const Icon(Icons.link, size: 18),
          label: const Text('Partager'),
          style: OutlinedButton.styleFrom(
            foregroundColor: onDark ? AppColors.pureWhite : AppColors.frenchNavy,
            side: BorderSide(color: onDark ? AppColors.pureWhite.withValues(alpha: 0.5) : AppColors.border),
            minimumSize: const Size(0, 46),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ]);
    }
    return SizedBox(width: double.infinity, child: button);
  }

  // ── Create ──

  void _openCreateSheet() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    int? batchId;
    DateTime start = DateTime.now().add(const Duration(hours: 1));
    DateTime end = DateTime.now().add(const Duration(hours: 2));
    bool submitting = false;
    String? formError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => StatefulBuilder(
        builder: (sheetContext, setSheetState) {
          Future<void> pick({required bool isStart}) async {
            final base = isStart ? start : end;
            final date = await showDatePicker(
              context: sheetContext,
              initialDate: base,
              firstDate: DateTime.now().subtract(const Duration(days: 1)),
              lastDate: DateTime.now().add(const Duration(days: 365)),
              locale: const Locale('fr', 'FR'),
            );
            if (date == null) return;
            if (!sheetContext.mounted) return;
            final time = await showTimePicker(
              context: sheetContext,
              initialTime: TimeOfDay.fromDateTime(base),
            );
            if (time == null) return;
            final picked = DateTime(date.year, date.month, date.day, time.hour, time.minute);
            setSheetState(() {
              if (isStart) {
                start = picked;
                // Keep the end after the start rather than letting the teacher
                // save a class that finishes before it begins.
                if (!end.isAfter(start)) end = start.add(const Duration(hours: 1));
              } else {
                end = picked;
              }
            });
          }

          Future<void> submit() async {
            if (titleCtrl.text.trim().isEmpty) {
              setSheetState(() => formError = 'Donnez un titre à la réunion.');
              return;
            }
            if (batchId == null) {
              setSheetState(() => formError = 'Choisissez une promotion.');
              return;
            }
            if (!end.isAfter(start)) {
              setSheetState(() => formError = 'La fin doit suivre le début.');
              return;
            }
            setSheetState(() {
              submitting = true;
              formError = null;
            });
            try {
              final client = ref.read(apiClientProvider);
              final res = await client.post('/meetings', data: {
                'title': titleCtrl.text.trim(),
                'description': descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                'batch_id': batchId,
                'scheduled_start': start.toUtc().toIso8601String(),
                'scheduled_end': end.toUtc().toIso8601String(),
              });
              if (sheetContext.mounted) Navigator.pop(sheetContext);
              await _fetchMeetings();
              if (mounted && res.data != null) {
                _openShareSheet(Map<String, dynamic>.from(res.data as Map), isCreated: true);
              }
            } catch (_) {
              setSheetState(() {
                submitting = false;
                formError = 'La réunion n\'a pas pu être créée.';
              });
            }
          }

          final fmt = DateFormat('EEE d MMM · HH:mm', 'fr_FR');
          final viewInsets = MediaQuery.of(sheetContext).viewInsets.bottom;

          return Padding(
            // Lifts the sheet above the keyboard so the fields stay visible.
            padding: EdgeInsets.only(bottom: viewInsets),
            child: Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(sheetContext).size.height * 0.92,
              ),
              decoration: const BoxDecoration(
                color: AppColors.frenchPaper,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: 10),
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    child: Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: AppColors.teacherAccentSoft,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.video_call, color: AppColors.teacherAccent, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('Nouvelle classe en direct',
                                  style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
                              Text('Planifiez un cours pour vos étudiants.',
                                  style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(sheetContext),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: AppColors.borderSoft),
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CustomTextField(
                            label: 'Titre',
                            hintText: 'ex : Grammaire française — semaine 5',
                            controller: titleCtrl,
                          ),
                          const SizedBox(height: 14),
                          CustomTextField(
                            label: 'Description (facultatif)',
                            hintText: 'Que couvrirez-vous pendant ce cours ?',
                            controller: descCtrl,
                            maxLines: 3,
                          ),
                          const SizedBox(height: 14),
                          Text('Promotion',
                              style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<int>(
                            initialValue: batchId,
                            isExpanded: true,
                            hint: const Text('Choisir une promotion'),
                            decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.all(Radius.circular(10)),
                              ),
                            ),
                            items: _batches.map((b) {
                              return DropdownMenuItem<int>(
                                value: (b['id'] as num).toInt(),
                                child: Text(
                                  (b['name'] ?? 'Promotion').toString(),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }).toList(),
                            onChanged: (val) => setSheetState(() => batchId = val),
                          ),
                          const SizedBox(height: 14),
                          Text('Horaire',
                              style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 6),
                          _timeField('Début', fmt.format(start), () => pick(isStart: true)),
                          const SizedBox(height: 8),
                          _timeField('Fin', fmt.format(end), () => pick(isStart: false)),
                          const SizedBox(height: 14),
                          _sheetNote(
                            Icons.schedule,
                            "Les horaires utilisent le fuseau de votre appareil. Chaque étudiant les voit dans le sien.",
                            AppColors.surfaceSoft,
                            AppColors.textMuted,
                          ),
                          const SizedBox(height: 8),
                          _sheetNote(
                            Icons.groups_outlined,
                            "Les étudiants de la promotion entrent directement. La réunion reçoit un identifiant et un code : toute autre personne les saisit, puis patiente jusqu'à ce que vous l'admettiez.",
                            AppColors.goodBg,
                            AppColors.good,
                          ),
                          if (formError != null) ...[
                            const SizedBox(height: 12),
                            Text(formError!,
                                style: AppTypography.caption.copyWith(color: AppColors.bad)),
                          ],
                          const SizedBox(height: 18),
                          CustomButton(
                            text: 'Créer la réunion',
                            icon: Icons.video_call,
                            height: 50,
                            width: double.infinity,
                            isLoading: submitting,
                            onPressed: submitting ? null : submit,
                          ),
                          SizedBox(height: MediaQuery.of(sheetContext).padding.bottom + 8),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _timeField(String label, String value, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            SizedBox(
              width: 48,
              child: Text(label,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            ),
            Expanded(
              child: Text(
                value,
                style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const Icon(Icons.edit_calendar_outlined, size: 18, color: AppColors.textSubtle),
          ],
        ),
      ),
    );
  }

  Widget _sheetNote(IconData icon, String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: fg),
          const SizedBox(width: 9),
          Expanded(
            child: Text(text, style: AppTypography.caption.copyWith(color: fg, height: 1.45)),
          ),
        ],
      ),
    );
  }
}
