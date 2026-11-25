import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../teacher/meetings/screens/pre_join_screen.dart';
import '../common/admin_kit.dart';

/// Separate Admin Calendar screen for demo meetings, external/public meetings,
/// and scheduled live classes (distinct from Teacher Timetable).
class AdminCalendarScreen extends ConsumerStatefulWidget {
  const AdminCalendarScreen({super.key});

  @override
  ConsumerState<AdminCalendarScreen> createState() => _AdminCalendarScreenState();
}

class _AdminCalendarScreenState extends ConsumerState<AdminCalendarScreen> {
  DateTime _month = DateTime(DateTime.now().year, DateTime.now().month, 1);
  DateTime _selectedDay = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
  String _kind = 'all';
  List<Map<String, dynamic>> _events = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = _events.isEmpty; _error = null; });
    try {
      final from = DateTime(_month.year, _month.month - 1, 20).toUtc().toIso8601String();
      final to = DateTime(_month.year, _month.month + 1, 10).toUtc().toIso8601String();
      final res = await ref.read(apiClientProvider).get('/meetings/admin-calendar', queryParameters: {
        'from': from,
        'to': to,
        if (_kind != 'all') 'kind': _kind,
      });
      if (!mounted) return;
      setState(() {
        _events = J.list(res.data, ['events']);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = apiErrorText(context, e); _loading = false; });
    }
  }

  Map<String, List<Map<String, dynamic>>> get _byDay {
    final map = <String, List<Map<String, dynamic>>>{};
    for (final ev in _events) {
      final dt = J.date(ev['scheduled_start'] ?? ev['started_at']);
      if (dt == null) continue;
      final key = '${dt.year}-${dt.month}-${dt.day}';
      map.putIfAbsent(key, () => []).add(ev);
    }
    return map;
  }

  Color _kindColor(String k) {
    if (k == 'demo') return const Color(0xFF7C3AED);
    if (k == 'admin' || k == 'public') return AppColors.good;
    return AppColors.adminAccent;
  }

  Future<void> _openEvent(Map<String, dynamic> ev) async {
    await showAdminPanel<void>(
      context,
      builder: (_) => _CalendarEventDetail(
        event: ev,
        onJoin: () async {
          if (J.s(ev['status']) == 'scheduled') {
            try { await ref.read(apiClientProvider).post('/meetings/${ev['id']}/prepare'); } catch (_) {}
          }
          if (!mounted) return;
          Navigator.of(context).pop();
          await Navigator.push(context, MaterialPageRoute(builder: (_) => PreJoinScreen(meeting: ev)));
          _load();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _events.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final byDay = _byDay;
    final dayKey = '${_selectedDay.year}-${_selectedDay.month}-${_selectedDay.day}';
    final dayEvents = byDay[dayKey] ?? [];

    final firstWeekday = _month.weekday; // 1 = Mon
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    final cells = <DateTime?>[
      ...List.filled(firstWeekday - 1, null),
      for (var d = 1; d <= daysInMonth; d++) DateTime(_month.year, _month.month, d),
    ];

    return AdminPage(
      onRefresh: _load,
      toolbar: AdminFilterChips<String>(
        options: [
          FilterOption('all', fr ? 'Tout' : 'All'),
          FilterOption('demo', fr ? 'Démos' : 'Demos'),
          FilterOption('admin', fr ? 'Publiques' : 'Public'),
          FilterOption('class', fr ? 'Classes' : 'Classes'),
        ],
        selected: _kind,
        onSelected: (v) { setState(() => _kind = v); _load(); },
      ),
      children: [
        AdminHeader(
          overline: fr ? 'Planification' : 'Scheduling',
          title: fr ? 'Calendrier Admin' : 'Admin calendar',
          subtitle: fr ? 'Démos, réunions publiques et sessions planifiées.' : 'Demos, public meetings, and scheduled sessions.',
        ),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: () {
                      setState(() => _month = DateTime(_month.year, _month.month - 1, 1));
                      _load();
                    },
                  ),
                  Text(
                    DateFormat('MMMM yyyy', fr ? 'fr_FR' : 'en_US').format(_month),
                    style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: () {
                      setState(() => _month = DateTime(_month.year, _month.month + 1, 1));
                      _load();
                    },
                  ),
                ],
              ),
              const SizedBox(height: 8),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 7, mainAxisSpacing: 4, crossAxisSpacing: 4),
                itemCount: cells.length,
                itemBuilder: (_, i) {
                  final d = cells[i];
                  if (d == null) return const SizedBox.shrink();
                  final k = '${d.year}-${d.month}-${d.day}';
                  final evs = byDay[k] ?? [];
                  final selected = d.year == _selectedDay.year && d.month == _selectedDay.month && d.day == _selectedDay.day;
                  return InkWell(
                    borderRadius: BorderRadius.circular(10),
                    onTap: () => setState(() => _selectedDay = d),
                    child: Container(
                      decoration: BoxDecoration(
                        color: selected ? AppColors.adminAccent : (evs.isNotEmpty ? AppColors.surfaceSoft : Colors.transparent),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${d.day}',
                            style: AppTypography.caption.copyWith(
                              fontWeight: FontWeight.w700,
                              color: selected ? AppColors.pureWhite : AppColors.ink,
                            ),
                          ),
                          if (evs.isNotEmpty)
                            Container(
                              margin: const EdgeInsets.only(top: 2),
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: selected ? AppColors.pureWhite : _kindColor(J.s(evs.first['meeting_kind'])),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Text(
          AdminFmt.weekdayDay(context, _selectedDay),
          style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
        ),
        const SizedBox(height: 8),
        if (dayEvents.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.event_note_outlined,
              title: fr ? 'Aucune réunion ce jour' : 'No meetings on this day',
              message: fr ? 'Sélectionnez une autre date sur le calendrier.' : 'Pick another day on the calendar.',
            ),
          )
        else
          for (final ev in dayEvents) ...[
            AdminCard(
              padding: const EdgeInsets.all(14),
              child: InkWell(
                onTap: () => _openEvent(ev),
                child: Row(
                  children: [
                    Container(width: 4, height: 42, decoration: BoxDecoration(color: _kindColor(J.s(ev['meeting_kind'])), borderRadius: BorderRadius.circular(4))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(J.s(ev['title']), style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                          Text(
                            '${AdminFmt.time(context, J.date(ev['scheduled_start']))} · ${J.name(ev, first: 'teacher_first_name', last: 'teacher_last_name')}',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.textMuted),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
      ],
    );
  }
}

class _CalendarEventDetail extends StatelessWidget {
  final Map<String, dynamic> event;
  final VoidCallback onJoin;

  const _CalendarEventDetail({required this.event, required this.onJoin});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final code = J.s(event['code']).isNotEmpty ? J.s(event['code']) : J.s(event['room_name']);
    final pass = J.s(event['passcode']);
    final link = J.s(event['public_link']);
    final invitees = event['invitees'] is List ? (event['invitees'] as List).whereType<Map>().toList() : <Map>[];
    final ended = J.s(event['status']) == 'ended';

    return AdminPanel(
      title: J.s(event['title']),
      subtitle: AdminFmt.dateTime(context, J.date(event['scheduled_start'])),
      actions: [
        if (!ended) AdminButton(fr ? 'Ouvrir' : 'Open room', icon: Icons.videocam, onPressed: onJoin),
      ],
      children: [
        if (J.s(event['demo_full_name']).isNotEmpty) ...[
          PanelSection(fr ? 'Prospect démo' : 'Demo prospect'),
          AdminCard(
            padding: const EdgeInsets.all(12),
            child: Text('${J.s(event['demo_full_name'])} · ${J.s(event['demo_email'])}'),
          ),
        ],
        PanelSection(fr ? 'Accès' : 'Access'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Column(
            children: [
              InfoRow(icon: Icons.tag, label: 'ID', value: code),
              if (pass.isNotEmpty) InfoRow(icon: Icons.lock_outline, label: 'Passcode', value: pass),
              if (link.isNotEmpty)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(link, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.adminAccent)),
                  trailing: IconButton(
                    icon: const Icon(Icons.copy, size: 18),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: link));
                      adminToast(context, fr ? 'Lien copié' : 'Link copied');
                    },
                  ),
                ),
            ],
          ),
        ),
        if (invitees.isNotEmpty) ...[
          PanelSection('${fr ? 'Invités' : 'Invitees'} (${invitees.length})'),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [for (final inv in invitees) Pill(J.s(inv['email']), color: AppColors.adminAccent)],
          ),
        ],
      ],
    );
  }
}
