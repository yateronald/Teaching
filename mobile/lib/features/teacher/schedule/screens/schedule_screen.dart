import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
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
  String _filterType = 'all'; // all, class, exam, live

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

  Future<void> _fetchSchedule() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait([
        client.get('/schedules'),
        client.get('/batches'),
      ]);

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
          _error = 'Impossible de charger votre emploi du temps.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _startSession(Map<String, dynamic> item) async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/attendance/sessions', data: {
        'schedule_id': item['id'],
        'batch_id': item['batch_id'],
      });

      final code = res.data?['session']?['access_code'] ?? res.data?['access_code'] ?? '123456';

      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Session Ouverte !', style: AppTypography.titleLarge),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Partagez ce code d\'émargement avec vos étudiants :',
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
                  child: Text(
                    code.toString(),
                    style: AppTypography.headlineLarge.copyWith(
                      color: AppColors.teacherAccent,
                      letterSpacing: 6.0,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Valable pendant 15 minutes.',
                  style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Fermer'),
              ),
              if (item['location_mode'] == 'online')
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.frenchNavy,
                    foregroundColor: AppColors.pureWhite,
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    widget.onNavigateTab?.call(6); // Go to Live Meetings
                  },
                  child: const Text('Rejoindre la salle LiveKit'),
                ),
            ],
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Impossible de démarrer la session d\'émargement.')),
        );
      }
    }
  }

  Future<void> _deleteSchedule(int id) async {
    try {
      final client = ref.read(apiClientProvider);
      await client.delete('/schedules/$id');
      _fetchSchedule();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Séance supprimée.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Échec de la suppression.')),
        );
      }
    }
  }

  String _computeLiveState(Map<String, dynamic> item) {
    if (item['status'] == 'cancelled') return 'cancelled';
    if (item['status'] == 'completed') return 'completed';

    final startStr = item['start'] ?? item['start_time'];
    final endStr = item['end'] ?? item['end_time'];

    if (startStr == null || endStr == null) return 'scheduled';

    final start = DateTime.tryParse(startStr);
    final end = DateTime.tryParse(endStr);
    final now = DateTime.now();

    if (start == null || end == null) return 'scheduled';

    if (now.isAfter(end)) return 'ended';
    if (now.isAfter(start) && now.isBefore(end)) return 'live';
    if (start.difference(now).inMinutes <= 15 && start.isAfter(now)) return 'soon';
    return 'scheduled';
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    // Filter schedules by selected date
    final daySchedules = _schedules.where((s) {
      final map = s as Map<String, dynamic>;
      final startStr = map['start'] ?? map['start_time'];
      if (startStr == null) return false;
      final dt = DateTime.tryParse(startStr);
      if (dt == null) return false;

      final matchDay = dt.year == _selectedDate.year &&
          dt.month == _selectedDate.month &&
          dt.day == _selectedDate.day;

      if (!matchDay) return false;

      if (_filterType == 'class' && map['type'] != 'class') return false;
      if (_filterType == 'exam' && map['type'] != 'exam') return false;
      if (_filterType == 'live' && _computeLiveState(map) != 'live') return false;

      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchSchedule,
      color: AppColors.frenchNavy,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isTablet ? 32 : 16,
          vertical: 24,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Emploi du Temps',
                        style: AppTypography.headlineMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Calendrier des cours, émargements numériques et sessions en direct.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                CustomButton(
                  text: 'Planifier',
                  icon: Icons.add,
                  height: 44,
                  onPressed: () {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      backgroundColor: Colors.transparent,
                      builder: (context) => ScheduleEditorSheet(
                        batches: _batches,
                        onSaved: _fetchSchedule,
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Horizontal Date Strip (14 days)
            SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _calendarDays.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final day = _calendarDays[idx];
                  final isSelected = day.year == _selectedDate.year &&
                      day.month == _selectedDate.month &&
                      day.day == _selectedDate.day;
                  final isToday = day.year == DateTime.now().year &&
                      day.month == DateTime.now().month &&
                      day.day == DateTime.now().day;

                  final dayName = DateFormat('E', 'fr_FR').format(day).toUpperCase();
                  final dayNum = day.day.toString();

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
                        border: Border.all(
                          color: isSelected ? AppColors.frenchNavy : AppColors.border,
                          width: 1.2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            dayName,
                            style: AppTypography.caption.copyWith(
                              fontWeight: FontWeight.w700,
                              color: isSelected
                                  ? AppColors.pureWhite
                                  : isToday
                                      ? AppColors.frenchNavy
                                      : AppColors.textMuted,
                              fontSize: 10,
                            ),
                          ),
                          Text(
                            dayNum,
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.w800,
                              color: isSelected ? AppColors.pureWhite : AppColors.ink,
                            ),
                          ),
                          Container(
                            width: 5,
                            height: 5,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.frenchGold
                                  : isToday
                                      ? AppColors.frenchNavy
                                      : Colors.transparent,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Date Label & Filters
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(_selectedDate),
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                Wrap(
                  spacing: 6,
                  children: [
                    _buildFilterChip('all', 'Tout'),
                    _buildFilterChip('class', 'Cours'),
                    _buildFilterChip('exam', 'Examens'),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Sessions List for Selected Day
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: CircularProgressIndicator(color: AppColors.frenchNavy),
                ),
              )
            else if (_error != null)
              EmptyState(
                title: 'Erreur',
                message: _error!,
                icon: Icons.cloud_off_outlined,
                actionText: 'Réessayer',
                onAction: _fetchSchedule,
              )
            else if (daySchedules.isEmpty)
              EmptyState(
                title: 'Aucune séance programmée',
                message: 'Aucun cours n\'est prévu pour cette date.',
                icon: Icons.event_available_outlined,
                actionText: 'Ajouter une séance',
                onAction: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (context) => ScheduleEditorSheet(
                      batches: _batches,
                      onSaved: _fetchSchedule,
                    ),
                  );
                },
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: daySchedules.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14),
                itemBuilder: (context, idx) {
                  final item = daySchedules[idx] as Map<String, dynamic>;
                  final liveState = _computeLiveState(item);
                  final isOnline = (item['location_mode'] ?? 'online') == 'online';

                  final startStr = item['start'] ?? item['start_time'];
                  final endStr = item['end'] ?? item['end_time'];
                  String timeRange = '';
                  if (startStr != null && endStr != null) {
                    final s = DateTime.tryParse(startStr);
                    final e = DateTime.tryParse(endStr);
                    if (s != null && e != null) {
                      timeRange = '${DateFormat('HH:mm').format(s)} – ${DateFormat('HH:mm').format(e)}';
                    }
                  }

                  return Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border, width: 1.1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                StatusBadge.liveState(liveState),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceSoft,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    timeRange,
                                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                                  ),
                                ),
                              ],
                            ),
                            PopupMenuButton<String>(
                              icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
                              onSelected: (action) {
                                if (action == 'edit') {
                                  showModalBottomSheet(
                                    context: context,
                                    isScrollControlled: true,
                                    backgroundColor: Colors.transparent,
                                    builder: (context) => ScheduleEditorSheet(
                                      batches: _batches,
                                      existingItem: item,
                                      onSaved: _fetchSchedule,
                                    ),
                                  );
                                } else if (action == 'delete') {
                                  _deleteSchedule(item['id']);
                                }
                              },
                              itemBuilder: (context) => [
                                const PopupMenuItem(value: 'edit', child: Text('Modifier')),
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Text('Supprimer', style: TextStyle(color: AppColors.bad)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item['title'] ?? 'Séance de cours',
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.school_outlined, size: 15, color: AppColors.textMuted),
                            const SizedBox(width: 5),
                            Text(
                              item['batch_name'] ?? 'Cohorte',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                            const SizedBox(width: 14),
                            Icon(
                              isOnline ? Icons.videocam_outlined : Icons.location_on_outlined,
                              size: 15,
                              color: AppColors.textMuted,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isOnline ? 'En ligne (LiveKit)' : (item['location'] ?? 'Présentiel'),
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _startSession(item),
                              icon: const Icon(Icons.pin, size: 16, color: AppColors.teacherAccent),
                              label: const Text('Démarrer Émargement'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.teacherAccent,
                                side: const BorderSide(color: AppColors.teacherAccentLine),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                            if (isOnline) ...[
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  widget.onNavigateTab?.call(6); // Open Live Meetings tab
                                },
                                icon: const Icon(Icons.video_call, size: 18),
                                label: const Text('Entrer dans la salle'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.frenchNavy,
                                  foregroundColor: AppColors.pureWhite,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
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
