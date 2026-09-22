import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';

class MeetingAttendanceSheet extends ConsumerStatefulWidget {
  final int meetingId;
  final String meetingTitle;

  const MeetingAttendanceSheet({
    super.key,
    required this.meetingId,
    required this.meetingTitle,
  });

  @override
  ConsumerState<MeetingAttendanceSheet> createState() => _MeetingAttendanceSheetState();
}

class _MeetingAttendanceSheetState extends ConsumerState<MeetingAttendanceSheet> {
  bool _isLoading = true;
  String? _error;

  Map<String, dynamic>? _attendanceData;
  String _filter = 'all'; // 'all', 'present', 'absent'
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetchAttendance();
  }

  Future<void> _fetchAttendance() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/${widget.meetingId}/attendance');
      if (mounted) {
        setState(() {
          _attendanceData = res.data is Map ? Map<String, dynamic>.from(res.data) : null;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger l\'émargement pour ce cours.';
          _isLoading = false;
        });
      }
    }
  }

  String _formatTime(dynamic iso) {
    if (iso == null) return '—';
    try {
      final dt = DateTime.parse(iso.toString()).toLocal();
      return DateFormat('HH:mm').format(dt);
    } catch (_) {
      return iso.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final summaryList = (_attendanceData?['summary'] as List?)
            ?.map((e) => Map<String, dynamic>.from(e as Map))
            .toList() ??
        [];

    final stats = _attendanceData?['stats'] as Map?;
    final int total = stats?['total'] ?? summaryList.length;
    final int present = stats?['present'] ?? summaryList.where((s) => s['status'] == 'present').length;
    final int absent = stats?['absent'] ?? summaryList.where((s) => s['status'] == 'absent').length;
    final int rate = total > 0 ? ((present / total) * 100).round() : 0;

    // Filter students
    final filtered = summaryList.where((s) {
      final status = (s['status'] ?? '').toString().toLowerCase();
      if (_filter == 'present' && status != 'present') return false;
      if (_filter == 'absent' && status != 'absent') return false;

      if (_search.isNotEmpty) {
        final name = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''} ${s['email'] ?? ''}'.toLowerCase();
        if (!name.contains(_search.toLowerCase())) return false;
      }
      return true;
    }).toList();

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag Handle
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
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.teacherAccentSoft,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.fact_check_outlined, size: 20, color: AppColors.teacherAccent),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isFr ? 'Feuille d\'Émargement' : 'Attendance Sheet',
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.frenchNavy,
                          ),
                        ),
                        Text(
                          widget.meetingTitle,
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.copy, size: 20, color: AppColors.textMuted),
                      tooltip: isFr ? 'Copier le récapitulatif' : 'Copy summary',
                      onPressed: summaryList.isEmpty
                          ? null
                          : () {
                              final buffer = StringBuffer();
                              buffer.writeln('${isFr ? "Émargement" : "Attendance"}: ${widget.meetingTitle}');
                              buffer.writeln('${isFr ? "Présents" : "Present"}: $present / $total ($rate%)\n');
                              for (final s in summaryList) {
                                final fn = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim();
                                buffer.writeln('- $fn : ${s['status']} (${s['total_duration_minutes'] ?? 0} min)');
                              }
                              Clipboard.setData(ClipboardData(text: buffer.toString()));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(isFr ? 'Rapport copié dans le presse-papier !' : 'Report copied to clipboard!'),
                                  backgroundColor: AppColors.frenchNavy,
                                ),
                              );
                            },
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textMuted),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),

          if (_isLoading)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: AppColors.frenchNavy),
              ),
            )
          else if (_error != null)
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppColors.bad),
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.bad),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchAttendance,
                        child: Text(isFr ? 'Réessayer' : 'Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else ...[
            // KPI Stats row
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: _buildMetricTile(
                      label: isFr ? 'Total Inscrits' : 'Enrolled',
                      value: '$total',
                      color: AppColors.frenchNavy,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricTile(
                      label: isFr ? 'Présents' : 'Present',
                      value: '$present',
                      color: const Color(0xFF10B981),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricTile(
                      label: isFr ? 'Absents' : 'Absent',
                      value: '$absent',
                      color: const Color(0xFFEF4444),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildMetricTile(
                      label: isFr ? 'Taux Présence' : 'Rate',
                      value: '$rate%',
                      color: rate >= 75 ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),
            ),

            // Search & Filter row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 38,
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.border),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Row(
                        children: [
                          const Icon(Icons.search, size: 18, color: AppColors.textMuted),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: isFr ? 'Rechercher un apprenant...' : 'Search student...',
                                hintStyle: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                              style: AppTypography.bodySmall,
                              onChanged: (val) => setState(() => _search = val),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Filter Chips
                  _buildFilterChip('all', isFr ? 'Tous' : 'All'),
                  const SizedBox(width: 4),
                  _buildFilterChip('present', isFr ? 'Présents' : 'Present'),
                  const SizedBox(width: 4),
                  _buildFilterChip('absent', isFr ? 'Absents' : 'Absent'),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Students List
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: Text(
                        isFr ? 'Aucun apprenant trouvé' : 'No students found',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      itemCount: filtered.length,
                      separatorBuilder: (_, index) => const SizedBox(height: 8),
                      itemBuilder: (context, idx) {
                        final s = filtered[idx];
                        final fn = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim();
                        final name = fn.isNotEmpty ? fn : (s['email'] ?? 'Étudiant');
                        final isPresent = s['status'] == 'present';
                        final joinTime = _formatTime(s['first_join']);
                        final leaveTime = _formatTime(s['last_leave']);
                        final dur = (s['total_duration_minutes'] as num?)?.round() ?? 0;
                        final sessions = (s['session_count'] as num?)?.toInt() ?? 1;

                        return Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.pureWhite,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: isPresent
                                    ? const Color(0xFF10B981).withValues(alpha: 0.15)
                                    : const Color(0xFFEF4444).withValues(alpha: 0.15),
                                child: Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: AppTypography.bodySmall.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.ink,
                                      ),
                                    ),
                                    Text(
                                      s['email'] ?? '',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: isPresent
                                          ? const Color(0xFF10B981).withValues(alpha: 0.12)
                                          : const Color(0xFFEF4444).withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      isPresent ? (isFr ? 'Présent' : 'Present') : (isFr ? 'Absent' : 'Absent'),
                                      style: AppTypography.caption.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: isPresent ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                  if (isPresent) ...[
                                    const SizedBox(height: 2),
                                    Text(
                                      '$joinTime - $leaveTime · $dur min${sessions > 1 ? " ($sessions connexions)" : ""}',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMetricTile({required String label, required String value, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSel = _filter == key;
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSel ? AppColors.frenchNavy : AppColors.pureWhite,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: isSel ? AppColors.frenchNavy : AppColors.border),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontWeight: FontWeight.w700,
            fontSize: 11,
            color: isSel ? AppColors.pureWhite : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
