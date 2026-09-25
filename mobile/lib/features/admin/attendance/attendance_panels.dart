import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';

/// Attendance rules shared with the web: present or late counts as attended,
/// 80 % is the target and under 60 % a student needs a follow-up.
class Att {
  Att._();
  static const target = 80;
  static const risk = 60;

  static int attended(Map<String, dynamic> s) => J.i(s['present_count']) + J.i(s['late_count']);
  static String kind(Map<String, dynamic> s) => J.s(s['kind']).isEmpty ? 'class' : J.s(s['kind']);

  static DateTime? start(Map<String, dynamic> s) {
    final at = J.date(s['starts_at']);
    if (at != null) return at;
    final day = J.s(s['session_date']);
    if (day.isEmpty) return null;
    final t = J.s(s['start_time']);
    return J.date(t.length >= 5 ? '${day.substring(0, 10)}T${t.substring(0, 5)}:00' : day);
  }

  static String timeText(BuildContext c, Map<String, dynamic> s) {
    final a = J.date(s['starts_at']);
    if (a != null) {
      final b = J.date(s['ends_at']);
      return '${AdminFmt.time(c, a)}${b != null ? ' – ${AdminFmt.time(c, b)}' : ''}';
    }
    String hm(dynamic t) => J.s(t).length >= 5 ? J.s(t).substring(0, 5) : J.s(t);
    return '${hm(s['start_time'])} – ${hm(s['end_time'])}';
  }

  static Color tone(num? rate) {
    if (rate == null) return AppColors.textSubtle;
    if (rate >= target) return AppColors.good;
    if (rate >= risk) return AppColors.warn;
    return AppColors.bad;
  }

  static String statusLabel(String s, bool fr) {
    switch (s) {
      case 'present':
        return fr ? 'Présent' : 'Present';
      case 'late':
        return fr ? 'En retard' : 'Late';
      case 'excused':
        return fr ? 'Excusé' : 'Excused';
      default:
        return fr ? 'Absent' : 'Absent';
    }
  }

  static Color statusColor(String s) => s == 'present' ? AppColors.good : s == 'late' ? AppColors.warn : AppColors.bad;

  static String minutesText(dynamic m, bool fr) {
    if (m == null) return '';
    final v = J.n(m);
    if (v < 1) return fr ? 'moins d’1 min' : 'under 1 min';
    if (v < 60) return '${v.round()} min';
    return '${v ~/ 60} h ${(v % 60).round().toString().padLeft(2, '0')}';
  }
}

/// Who came to one session, when they joined and for how long.
class SessionRosterPanel extends ConsumerStatefulWidget {
  final Map<String, dynamic> session;
  const SessionRosterPanel({super.key, required this.session});

  @override
  ConsumerState<SessionRosterPanel> createState() => _SessionRosterPanelState();
}

class _SessionRosterPanelState extends ConsumerState<SessionRosterPanel> {
  List<Map<String, dynamic>>? _list;
  List<Map<String, dynamic>> _guests = [];
  String? _error;
  String _filter = 'all';

  bool get _online => Att.kind(widget.session) == 'meeting';

  @override
  void initState() {
    super.initState();
    final id = J.i(widget.session['session_id']);
    final path = _online ? '/attendance/meeting-roster/$id' : '/attendance/session-details-simple/$id';
    ref.read(apiClientProvider).get(path).then((res) {
      if (!mounted) return;
      setState(() {
        _list = J.list(res.data, ['details']);
        _guests = J.list(J.map(res.data)['guests']);
      });
    }).catchError((Object e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final s = widget.session;
    final start = Att.start(s);
    final total = J.i(s['total_students']);
    final rate = total == 0 ? null : Att.attended(s) * 100 / total;
    final list = (_list ?? const <Map<String, dynamic>>[]).where((x) {
      final st = J.s(x['status']);
      if (_filter == 'all') return true;
      if (_filter == 'absent') return st != 'present' && st != 'late';
      return st == _filter;
    }).toList();

    return AdminPanel(
      title: J.s(s['schedule_title']).isNotEmpty ? J.s(s['schedule_title']) : J.s(s['batch_name']),
      subtitle: '${AdminFmt.weekdayDay(context, start)} · ${Att.timeText(context, s)} · ${J.s(s['teacher_name'])}',
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            Pill(_online ? (fr ? 'En ligne' : 'Online') : (fr ? 'Présentiel' : 'In person'), color: AppColors.adminAccent, icon: _online ? Icons.videocam_outlined : Icons.place_outlined),
            if (s['is_live'] == true) Pill(fr ? 'En direct' : 'Live now', color: AppColors.good, icon: Icons.fiber_manual_record),
            if (J.s(s['meeting_code']).isNotEmpty) Pill(J.s(s['meeting_code']), color: AppColors.textMuted),
          ],
        ),
        const SizedBox(height: 12),
        AdminGrid(
          minTileWidth: 100,
          maxColumns: 4,
          spacing: 8,
          children: [
            _Mini(fr ? 'Présence' : 'Attendance', AdminFmt.percent(rate), Att.tone(rate)),
            _Mini(fr ? 'Présents' : 'Present', '${J.i(s['present_count'])}', AppColors.good),
            _Mini(fr ? 'Retards' : 'Late', '${J.i(s['late_count'])}', AppColors.warn),
            _Mini(fr ? 'Absents' : 'Absent', '${J.i(s['absent_count'])}', AppColors.bad),
          ],
        ),
        PanelSection(fr ? 'Liste' : 'Roster'),
        AdminFilterChips<String>(
          options: [
            FilterOption('all', fr ? 'Tous' : 'All'),
            FilterOption('present', fr ? 'Présents' : 'Present'),
            FilterOption('late', fr ? 'Retards' : 'Late'),
            FilterOption('absent', fr ? 'Absents' : 'Absent'),
          ],
          selected: _filter,
          onSelected: (v) => setState(() => _filter = v),
        ),
        const SizedBox(height: 8),
        if (_error != null)
          Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad))
        else if (_list == null)
          const AdminLoading()
        else if (list.isEmpty)
          Padding(padding: const EdgeInsets.all(12), child: Text(fr ? 'Personne dans cette liste.' : 'Nobody in this list.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)))
        else
          AdminCard(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            child: Column(
              children: [
                for (final x in list)
                  ListTile(
                    dense: true,
                    leading: InitialsAvatar(J.s(x['student_name']), size: 32, color: Att.statusColor(J.s(x['status']))),
                    title: Text(J.s(x['student_name']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      x['check_in_time'] == null
                          ? J.s(x['email'])
                          : '${_online ? (fr ? 'Arrivé' : 'Joined') : (fr ? 'Pointé' : 'Checked in')} ${AdminFmt.time(context, J.date(x['check_in_time']))}'
                              '${x['minutes'] != null ? ' · ${Att.minutesText(x['minutes'], fr)}' : ''}'
                              '${J.i(x['connections']) > 1 ? ' · ${J.i(x['connections'])} ${fr ? 'connexions' : 'connections'}' : ''}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    trailing: Pill(Att.statusLabel(J.s(x['status']), fr), color: Att.statusColor(J.s(x['status']))),
                  ),
              ],
            ),
          ),
        if (_guests.isNotEmpty) ...[
          PanelSection(fr ? 'Invités (${_guests.length})' : 'Guests (${_guests.length})'),
          AdminCard(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            child: Column(
              children: [
                for (final g in _guests)
                  ListTile(
                    dense: true,
                    leading: InitialsAvatar(J.s(g['name']), size: 32),
                    title: Text(J.s(g['name']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      '${J.s(g['role'])}${g['minutes'] != null ? ' · ${Att.minutesText(g['minutes'], fr)}' : ''}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// One student's sessions over the period, and their overall rate.
class StudentHistoryPanel extends ConsumerStatefulWidget {
  final Map<String, dynamic> student;
  final String kind;
  final DateTime? from;
  final DateTime? to;
  const StudentHistoryPanel({super.key, required this.student, required this.kind, this.from, this.to});

  @override
  ConsumerState<StudentHistoryPanel> createState() => _StudentHistoryPanelState();
}

class _StudentHistoryPanelState extends ConsumerState<StudentHistoryPanel> {
  List<Map<String, dynamic>>? _list;
  String? _error;

  @override
  void initState() {
    super.initState();
    final f = DateFormat('yyyy-MM-dd');
    ref.read(apiClientProvider).get('/attendance/reports/student-sessions/${J.i(widget.student['id'])}', queryParameters: {
      'batch_id': J.i(widget.student['batch_id']),
      if (widget.kind != 'all') 'kind': widget.kind,
      if (widget.from != null) 'date_from': f.format(widget.from!),
      if (widget.to != null) 'date_to': f.format(widget.to!),
    }).then((res) {
      if (mounted) setState(() => _list = J.list(res.data, ['sessions']));
    }).catchError((Object e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final s = widget.student;
    final rate = J.i(s['total_sessions']) == 0 ? null : J.n(s['attendance_rate']);
    return AdminPanel(
      title: J.name(s),
      subtitle: '${J.s(s['batch_name'])} · ${J.s(s['email'])}',
      leading: InitialsAvatar(J.name(s), size: 44),
      children: [
        AdminGrid(
          minTileWidth: 100,
          maxColumns: 3,
          spacing: 8,
          children: [
            _Mini(fr ? 'Présence' : 'Attendance', AdminFmt.percent(rate), Att.tone(rate)),
            _Mini(fr ? 'Séances suivies' : 'Attended', '${J.i(s['present_count'])} / ${J.i(s['total_sessions'])}', AppColors.adminAccent),
            _Mini(fr ? 'En ligne' : 'Online', '${J.i(s['online_attended'])} / ${J.i(s['online_sessions'])}', const Color(0xFF0284C7)),
          ],
        ),
        if (rate != null && rate < Att.risk) ...[
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.badBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.badBorder)),
            child: Text(
              fr ? 'Sous ${Att.risk} % de présence : un contact avec l’étudiant ou son professeur est conseillé.' : 'Below ${Att.risk}% attendance: consider reaching out to the student or their teacher.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.bad),
            ),
          ),
        ],
        PanelSection(fr ? 'Séances' : 'Sessions'),
        if (_error != null)
          Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad))
        else if (_list == null)
          const AdminLoading()
        else if (_list!.isEmpty)
          Text(fr ? 'Aucune séance sur cette période.' : 'No sessions in this period.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
        else
          AdminCard(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            child: Column(
              children: [
                for (final h in _list!)
                  ListTile(
                    dense: true,
                    leading: Icon(Att.kind(h) == 'meeting' ? Icons.videocam_outlined : Icons.place_outlined, color: AppColors.textSubtle),
                    title: Text('${AdminFmt.weekdayDay(context, J.date(h['starts_at']))} · ${AdminFmt.time(context, J.date(h['starts_at']))}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      '${J.s(h['teacher_name'])}${h['minutes'] != null ? ' · ${Att.minutesText(h['minutes'], fr)}' : ''}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    trailing: Pill(Att.statusLabel(J.s(h['status']), fr), color: Att.statusColor(J.s(h['status']))),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Mini extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _Mini(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
            const SizedBox(height: 2),
            Text(value, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, color: color)),
          ],
        ),
      );
}
