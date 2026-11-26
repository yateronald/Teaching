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
  String _hostRole = 'all'; // all | teacher | admin
  int? _hostId;
  List<Map<String, dynamic>> _events = [];
  List<Map<String, dynamic>> _hosts = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = _events.isEmpty && _hosts.isEmpty; _error = null; });
    try {
      final from = DateTime(_month.year, _month.month - 1, 20).toUtc().toIso8601String();
      final to = DateTime(_month.year, _month.month + 1, 10).toUtc().toIso8601String();
      final res = await ref.read(apiClientProvider).get('/meetings/admin-calendar', queryParameters: {
        'from': from,
        'to': to,
        if (_kind != 'all') 'kind': _kind,
        if (_hostId != null)
          'host_id': _hostId
        else if (_hostRole != 'all')
          'host_role': _hostRole,
      });
      if (!mounted) return;
      final fetchedHosts = J.list(res.data, ['hosts']);
      setState(() {
        _events = J.list(res.data, ['events']);
        if (fetchedHosts.isNotEmpty) _hosts = fetchedHosts;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = apiErrorText(context, e); _loading = false; });
    }
  }

  List<Map<String, dynamic>> get _teachers => _hosts.where((h) => J.s(h['role']) == 'teacher').toList();
  List<Map<String, dynamic>> get _admins => _hosts.where((h) => J.s(h['role']) == 'admin').toList();
  bool get _hasActiveFilter => _kind != 'all' || _hostRole != 'all' || _hostId != null;

  Map<String, dynamic>? get _selectedHost {
    if (_hostId == null) return null;
    for (final h in _hosts) {
      if (J.i(h['id']) == _hostId) return h;
    }
    return null;
  }

  String _hostLabel(Map<String, dynamic> h) {
    final full = J.name(h);
    return full.isNotEmpty ? full : J.s(h['email']);
  }

  void _setHostRole(String nextRole) {
    int? nextId = _hostId;
    if (nextId != null && nextRole != 'all') {
      final cur = _selectedHost;
      if (cur == null || J.s(cur['role']) != nextRole) {
        nextId = null;
      }
    }
    setState(() {
      _hostRole = nextRole;
      _hostId = nextId;
    });
    _load();
  }

  void _resetFilters() {
    setState(() {
      _kind = 'all';
      _hostRole = 'all';
      _hostId = null;
    });
    _load();
  }

  Future<void> _pickHost(bool fr) async {
    final candidates = _hostRole == 'teacher'
        ? _teachers
        : _hostRole == 'admin'
            ? _admins
            : _hosts;
    final picked = await showModalBottomSheet<int?>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.pureWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (ctx) => _HostPickerSheet(
        hosts: candidates,
        selectedId: _hostId,
        roleScope: _hostRole,
        fr: fr,
      ),
    );
    // -1 sentinel means explicit "All" reset; null means dismissed without choosing.
    if (picked == null || !mounted) return;
    setState(() => _hostId = picked < 0 ? null : picked);
    _load();
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
        onFilterHost: J.i(ev['teacher_id']) > 0 && _hostId != J.i(ev['teacher_id'])
            ? () {
                final role = J.s(ev['teacher_role']);
                Navigator.of(context).pop();
                setState(() {
                  _hostRole = (role == 'admin' || role == 'teacher') ? role : 'all';
                  _hostId = J.i(ev['teacher_id']);
                });
                _load();
              }
            : null,
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
    final selectedHost = _selectedHost;

    final firstWeekday = _month.weekday; // 1 = Mon
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    final cells = <DateTime?>[
      ...List.filled(firstWeekday - 1, null),
      for (var d = 1; d <= daysInMonth; d++) DateTime(_month.year, _month.month, d),
    ];

    final hostPickerLabel = selectedHost != null
        ? '${_hostLabel(selectedHost)} (${J.s(selectedHost['role']) == 'admin' ? 'Admin' : (fr ? 'Prof' : 'Teacher')})'
        : _hostRole == 'teacher'
            ? (fr ? 'Tous les professeurs (choisir un prof)' : 'All teachers (pick a teacher)')
            : _hostRole == 'admin'
                ? (fr ? 'Tous les admins (choisir un admin)' : 'All admins (pick an admin)')
                : (fr ? 'Filtrer par professeur ou admin' : 'Filter by teacher or admin');

    final headerSubtitle = selectedHost != null
        ? (fr
            ? 'Calendrier de ${_hostLabel(selectedHost)} · ${_events.length} session(s)'
            : 'Calendar for ${_hostLabel(selectedHost)} · ${_events.length} session(s)')
        : _hostRole == 'teacher'
            ? (fr ? 'Sessions de tous les professeurs · ${_events.length}' : 'All teachers\' sessions · ${_events.length}')
            : _hostRole == 'admin'
                ? (fr ? 'Sessions de tous les admins · ${_events.length}' : 'All admins\' sessions · ${_events.length}')
                : (fr ? 'Démos, réunions publiques et sessions planifiées.' : 'Demos, public meetings, and scheduled sessions.');

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AdminFilterChips<String>(
            options: [
              FilterOption('all', fr ? 'Tout' : 'All'),
              FilterOption('demo', fr ? 'Démos' : 'Demos'),
              FilterOption('admin', fr ? 'Publiques' : 'Public'),
              FilterOption('class', fr ? 'Classes' : 'Classes'),
            ],
            selected: _kind,
            onSelected: (v) { setState(() => _kind = v); _load(); },
          ),
          const SizedBox(height: 6),
          AdminFilterChips<String>(
            key: const Key('calendar-host-role'),
            options: [
              FilterOption('all', fr ? 'Tous les hôtes' : 'All hosts'),
              FilterOption('teacher', fr ? 'Professeurs' : 'Teachers', count: _teachers.length),
              FilterOption('admin', 'Admins', count: _admins.length),
            ],
            selected: _hostRole,
            onSelected: _setHostRole,
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  key: const Key('calendar-host-picker'),
                  onTap: _hosts.isEmpty ? null : () => _pickHost(fr),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    decoration: BoxDecoration(
                      color: selectedHost != null ? AppColors.adminAccentBg : AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: selectedHost != null ? AppColors.adminAccent : AppColors.border),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.person_search_outlined,
                          size: 17,
                          color: selectedHost != null ? AppColors.adminAccent : AppColors.textMuted,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            hostPickerLabel,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption.copyWith(
                              fontWeight: selectedHost != null ? FontWeight.w700 : FontWeight.w500,
                              color: selectedHost != null ? AppColors.adminAccent : AppColors.ink,
                            ),
                          ),
                        ),
                        const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textMuted),
                      ],
                    ),
                  ),
                ),
              ),
              if (_hasActiveFilter) ...[
                const SizedBox(width: 6),
                IconButton(
                  key: const Key('calendar-reset-filters'),
                  tooltip: fr ? 'Réinitialiser les filtres' : 'Reset filters',
                  icon: const Icon(Icons.filter_alt_off_outlined, size: 19, color: AppColors.adminAccent),
                  onPressed: _resetFilters,
                ),
              ],
            ],
          ),
        ],
      ),
      children: [
        AdminHeader(
          overline: fr ? 'Planification' : 'Scheduling',
          title: fr ? 'Calendrier Admin' : 'Admin calendar',
          subtitle: headerSubtitle,
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
                  Expanded(
                    child: Text(
                      DateFormat('MMMM yyyy', fr ? 'fr_FR' : 'en_US').format(_month),
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
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
              message: _hasActiveFilter
                  ? (fr ? 'Aucune session ne correspond aux filtres sélectionnés.' : 'No sessions match the selected filters.')
                  : (fr ? 'Sélectionnez une autre date sur le calendrier.' : 'Pick another day on the calendar.'),
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
                          const SizedBox(height: 2),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                '${AdminFmt.time(context, J.date(ev['scheduled_start']))} · ${J.name(ev, first: 'teacher_first_name', last: 'teacher_last_name')}',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              ),
                              if (J.s(ev['teacher_role']).isNotEmpty)
                                Pill(
                                  J.s(ev['teacher_role']) == 'admin' ? 'Admin' : (fr ? 'Prof' : 'Teacher'),
                                  color: J.s(ev['teacher_role']) == 'admin' ? AppColors.adminAccent : const Color(0xFF0284C7),
                                ),
                            ],
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

class _HostPickerSheet extends StatefulWidget {
  final List<Map<String, dynamic>> hosts;
  final int? selectedId;
  final String roleScope;
  final bool fr;

  const _HostPickerSheet({
    required this.hosts,
    required this.selectedId,
    required this.roleScope,
    required this.fr,
  });

  @override
  State<_HostPickerSheet> createState() => _HostPickerSheetState();
}

class _HostPickerSheetState extends State<_HostPickerSheet> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final filtered = widget.hosts.where((h) {
      if (q.isEmpty) return true;
      final name = J.name(h).toLowerCase();
      final email = J.s(h['email']).toLowerCase();
      return name.contains(q) || email.contains(q);
    }).toList();

    final allLabel = widget.roleScope == 'teacher'
        ? (widget.fr ? 'Tous les professeurs' : 'All teachers')
        : widget.roleScope == 'admin'
            ? (widget.fr ? 'Tous les admins' : 'All admins')
            : (widget.fr ? 'Tous les professeurs et admins' : 'All teachers & admins');

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 14, 16, MediaQuery.viewInsetsOf(context).bottom + 14),
        child: ConstrainedBox(
          constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.7),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                widget.fr ? 'Choisir un professeur ou un admin' : 'Filter by teacher or admin',
                style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              TextField(
                onChanged: (v) => setState(() => _query = v),
                decoration: adminInputDecoration(widget.fr ? 'Rechercher par nom ou e-mail' : 'Search by name or email').copyWith(
                  prefixIcon: const Icon(Icons.search, size: 18),
                ),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: ListView(
                  shrinkWrap: true,
                  children: [
                    ListTile(
                      dense: true,
                      leading: const Icon(Icons.groups_outlined, size: 20),
                      title: Text(allLabel, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                      trailing: widget.selectedId == null ? const Icon(Icons.check, color: AppColors.adminAccent) : null,
                      onTap: () => Navigator.of(context).pop(-1),
                    ),
                    const Divider(height: 1),
                    for (final h in filtered)
                      ListTile(
                        dense: true,
                        leading: CircleAvatar(
                          radius: 15,
                          backgroundColor: J.s(h['role']) == 'admin' ? AppColors.adminAccentBg : const Color(0xFFE0F2FE),
                          child: Text(
                            (J.name(h).isNotEmpty ? J.name(h)[0] : '?').toUpperCase(),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: J.s(h['role']) == 'admin' ? AppColors.adminAccent : const Color(0xFF0369A1),
                            ),
                          ),
                        ),
                        title: Row(
                          children: [
                            Expanded(
                              child: Text(
                                J.name(h).isNotEmpty ? J.name(h) : J.s(h['email']),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Pill(
                              J.s(h['role']) == 'admin' ? 'Admin' : (widget.fr ? 'Prof' : 'Teacher'),
                              color: J.s(h['role']) == 'admin' ? AppColors.adminAccent : const Color(0xFF0284C7),
                            ),
                          ],
                        ),
                        subtitle: J.s(h['email']).isNotEmpty ? Text(J.s(h['email']), style: AppTypography.caption) : null,
                        trailing: widget.selectedId == J.i(h['id']) ? const Icon(Icons.check, color: AppColors.adminAccent) : null,
                        onTap: () => Navigator.of(context).pop(J.i(h['id'])),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CalendarEventDetail extends StatelessWidget {
  final Map<String, dynamic> event;
  final VoidCallback onJoin;
  final VoidCallback? onFilterHost;

  const _CalendarEventDetail({required this.event, required this.onJoin, this.onFilterHost});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final code = J.s(event['code']).isNotEmpty ? J.s(event['code']) : J.s(event['room_name']);
    final pass = J.s(event['passcode']);
    final link = J.s(event['public_link']);
    final hostName = J.name(event, first: 'teacher_first_name', last: 'teacher_last_name');
    final hostRole = J.s(event['teacher_role']);
    final invitees = event['invitees'] is List ? (event['invitees'] as List).whereType<Map>().toList() : <Map>[];
    final ended = J.s(event['status']) == 'ended';

    return AdminPanel(
      title: J.s(event['title']),
      subtitle: AdminFmt.dateTime(context, J.date(event['scheduled_start'])),
      actions: [
        if (!ended) AdminButton(fr ? 'Ouvrir' : 'Open room', icon: Icons.videocam, onPressed: onJoin),
      ],
      children: [
        if (hostName.isNotEmpty) ...[
          PanelSection(fr ? 'Hôte' : 'Host'),
          AdminCard(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          Text(hostName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                          if (hostRole.isNotEmpty)
                            Pill(
                              hostRole == 'admin' ? 'Admin' : (fr ? 'Prof' : 'Teacher'),
                              color: hostRole == 'admin' ? AppColors.adminAccent : const Color(0xFF0284C7),
                            ),
                        ],
                      ),
                      if (J.s(event['teacher_email']).isNotEmpty)
                        Text(J.s(event['teacher_email']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                    ],
                  ),
                ),
                if (onFilterHost != null)
                  TextButton(
                    onPressed: onFilterHost,
                    child: Text(fr ? 'Voir calendrier' : 'Filter'),
                  ),
              ],
            ),
          ),
        ],
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
