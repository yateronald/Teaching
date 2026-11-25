import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../teacher/meetings/screens/pre_join_screen.dart';
import '../../teacher/meetings/widgets/meeting_attendance_sheet.dart';
import '../../teacher/meetings/widgets/meeting_share_sheet.dart';
import '../common/admin_kit.dart';

/// Admin Live Meetings screen: manage batch classes, standalone public meetings,
/// demo meetings, multi-email invitations, and approval-optional entry.
class AdminMeetingsScreen extends ConsumerStatefulWidget {
  const AdminMeetingsScreen({super.key});

  @override
  ConsumerState<AdminMeetingsScreen> createState() => _AdminMeetingsScreenState();
}

class _AdminMeetingsScreenState extends ConsumerState<AdminMeetingsScreen> {
  List<Map<String, dynamic>> _meetings = [];
  List<Map<String, dynamic>> _batches = [];
  bool _loading = true;
  String? _error;
  String _tab = 'upcoming';
  String _kindFilter = 'all';
  DateTime _now = DateTime.now();
  Timer? _ticker;
  io.Socket? _socket;

  @override
  void initState() {
    super.initState();
    _load();
    _initSocket();
    _ticker = Timer.periodic(const Duration(seconds: 20), (_) {
      if (mounted) {
        setState(() => _now = DateTime.now());
        _load(silent: true);
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    try {
      _socket?.clearListeners();
      _socket?.disconnect();
      _socket?.dispose();
    } catch (_) {}
    super.dispose();
  }

  Future<void> _initSocket() async {
    try {
      final client = ref.read(apiClientProvider);
      final uri = Uri.parse(client.dio.options.baseUrl);
      final token = await client.tokenStorage.getToken() ?? '';
      if (!mounted) return;
      final s = io.io(
        uri.origin,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .setAuth({'token': token})
            .enableAutoConnect()
            .enableReconnection()
            .build(),
      );
      s.on('meeting:created', (_) { if (mounted) _load(silent: true); });
      s.on('meeting:started', (_) { if (mounted) _load(silent: true); });
      s.on('meeting:waiting', (_) { if (mounted) _load(silent: true); });
      s.on('meeting:ended', (_) { if (mounted) _load(silent: true); });
      _socket = s;
    } catch (_) {}
  }

  Future<void> _load({bool silent = false}) async {
    if (!silent && mounted) setState(() { _loading = _meetings.isEmpty; _error = null; });
    try {
      final client = ref.read(apiClientProvider);
      final res = await Future.wait([client.get('/meetings'), client.get('/batches')]);
      if (!mounted) return;
      setState(() {
        _meetings = J.list(res[0].data);
        _batches = J.list(res[1].data, ['batches']);
        _loading = false;
        _now = DateTime.now();
      });
    } catch (e) {
      if (!mounted || silent) return;
      setState(() { _error = apiErrorText(context, e); _loading = false; });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    if (_kindFilter == 'public') {
      return _meetings.where((m) => m['is_public'] == true || (J.s(m['meeting_kind']).isNotEmpty && J.s(m['meeting_kind']) != 'class')).toList();
    }
    if (_kindFilter == 'class') {
      return _meetings.where((m) => m['is_public'] != true && (J.s(m['meeting_kind']).isEmpty || J.s(m['meeting_kind']) == 'class')).toList();
    }
    return _meetings;
  }

  List<Map<String, dynamic>> get _past => _filtered.where((m) {
        final st = J.s(m['status']).toLowerCase();
        if (st == 'ended' || st == 'cancelled') return true;
        final end = J.date(m['ended_at'] ?? m['scheduled_end']);
        return st != 'active' && end != null && _now.isAfter(end);
      }).toList();

  List<Map<String, dynamic>> get _active {
    final pastIds = _past.map((e) => e['id']).toSet();
    return _filtered.where((m) {
      if (pastIds.contains(m['id'])) return false;
      final st = J.s(m['status']).toLowerCase();
      if (st == 'active' || st == 'waiting') return true;
      final start = J.date(m['started_at'] ?? m['scheduled_start']);
      return start != null && !_now.isBefore(start);
    }).toList();
  }

  List<Map<String, dynamic>> get _upcoming {
    final taken = {..._past.map((e) => e['id']), ..._active.map((e) => e['id'])};
    return _filtered.where((m) => !taken.contains(m['id'])).toList()
      ..sort((a, b) => (J.date(a['scheduled_start']) ?? _now).compareTo(J.date(b['scheduled_start']) ?? _now));
  }

  Future<void> _openMeeting(Map<String, dynamic> m) async {
    final st = J.s(m['status']).toLowerCase();
    if (st == 'scheduled') {
      try {
        await ref.read(apiClientProvider).post('/meetings/${m['id']}/prepare');
      } catch (_) {}
    }
    if (!mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => PreJoinScreen(meeting: m)));
    if (mounted) _load(silent: true);
  }

  void _openShare(Map<String, dynamic> m, {bool created = false}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => MeetingShareSheet(meeting: m, isCreated: created, onPasscodeChanged: (_) => _load(silent: true)),
    );
  }

  Future<void> _delete(Map<String, dynamic> m) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer cette réunion ?' : 'Delete this meeting?',
      message: J.s(m['title']),
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok) return;
    try {
      await ref.read(apiClientProvider).delete('/meetings/${m['id']}');
      await _load();
      if (mounted) adminToast(context, fr ? 'Réunion supprimée' : 'Meeting deleted');
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _createMeeting() async {
    final created = await showAdminPanel<Map<String, dynamic>>(
      context,
      builder: (_) => _AdminCreateMeetingPanel(batches: _batches),
    );
    if (created != null && mounted) {
      await _load(silent: true);
      _openShare(created, created: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _meetings.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final upcoming = _upcoming;
    final active = _active;
    final past = _past;
    final visible = _tab == 'active' ? active : (_tab == 'past' ? past : upcoming);

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AdminFilterChips<String>(
            options: [
              FilterOption('upcoming', fr ? 'À venir' : 'Upcoming', count: upcoming.length),
              FilterOption('active', fr ? 'En direct / Ouvertes' : 'Active', count: active.length),
              FilterOption('past', fr ? 'Passées' : 'Past', count: past.length),
            ],
            selected: _tab,
            onSelected: (v) => setState(() => _tab = v),
          ),
          const SizedBox(height: 6),
          AdminFilterChips<String>(
            options: [
              FilterOption('all', fr ? 'Toutes' : 'All'),
              FilterOption('public', fr ? 'Publiques & Démos' : 'Public & Demo'),
              FilterOption('class', fr ? 'Promotions' : 'Batch classes'),
            ],
            selected: _kindFilter,
            onSelected: (v) => setState(() => _kindFilter = v),
          ),
        ],
      ),
      children: [
        AdminHeader(
          overline: fr ? 'Administration' : 'Admin console',
          title: fr ? 'Réunions en direct' : 'Live meetings',
          subtitle: fr ? 'Créez des réunions publiques multi-e-mails, démos ou cours en direct.' : 'Host public multi-email meetings, demos, and live classes.',
          actions: [
            AdminButton(fr ? 'Nouvelle réunion' : 'New meeting', icon: Icons.video_call, onPressed: _createMeeting),
          ],
        ),
        if (visible.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.videocam_outlined,
              title: fr ? 'Aucune réunion' : 'No meetings',
              message: fr ? 'Planifiez une réunion publique ou une classe en direct.' : 'Schedule a public meeting or live class.',
            ),
          )
        else
          for (final m in visible) ...[
            _MeetingTile(
              m: m,
              onOpen: () => _openMeeting(m),
              onShare: () => _openShare(m),
              onAttendance: () => showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => MeetingAttendanceSheet(meetingId: J.i(m['id']), meetingTitle: J.s(m['title'])),
              ),
              onDelete: () => _delete(m),
            ),
            const SizedBox(height: 10),
          ],
      ],
    );
  }
}

class _MeetingTile extends StatelessWidget {
  final Map<String, dynamic> m;
  final VoidCallback onOpen;
  final VoidCallback onShare;
  final VoidCallback onAttendance;
  final VoidCallback onDelete;

  const _MeetingTile({
    required this.m,
    required this.onOpen,
    required this.onShare,
    required this.onAttendance,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final st = J.s(m['status']).toLowerCase();
    final isPublic = m['is_public'] == true;
    final reqApproval = m['require_approval'] != false;
    final kind = J.s(m['meeting_kind']);
    final code = J.s(m['code']).isNotEmpty ? J.s(m['code']) : J.s(m['room_name']);
    final start = J.date(m['started_at'] ?? m['scheduled_start']);
    final invitees = m['invitees'] is List ? (m['invitees'] as List).length : 0;

    return AdminCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(J.s(m['title']), style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
              ),
              Pill(
                st == 'active' ? (fr ? 'En direct' : 'Live') : (st == 'ended' ? (fr ? 'Terminée' : 'Ended') : (fr ? 'Programmée' : 'Scheduled')),
                color: st == 'active' ? AppColors.good : (st == 'ended' ? AppColors.textMuted : AppColors.adminAccent),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (kind == 'demo') Pill('Demo', color: const Color(0xFF7C3AED)),
              if (isPublic && kind != 'demo') Pill(fr ? 'Publique' : 'Public', color: AppColors.good, icon: Icons.public),
              if (isPublic)
                Pill(
                  reqApproval ? (fr ? 'Approbation requise' : 'Approval required') : (fr ? 'Lien ouvert' : 'Open link'),
                  color: reqApproval ? AppColors.warn : const Color(0xFF0284C7),
                ),
              if (invitees > 0) Pill('$invitees ${fr ? 'invités' : 'invited'}', color: AppColors.adminAccent, icon: Icons.mail_outline),
            ],
          ),
          const SizedBox(height: 8),
          if (start != null)
            Text(
              '${AdminFmt.weekdayDay(context, start)} · ${AdminFmt.time(context, start)}${J.s(m['batch_name']).isNotEmpty ? ' · ${J.s(m['batch_name'])}' : ''}',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          if (code.isNotEmpty)
            GestureDetector(
              onTap: () {
                Clipboard.setData(ClipboardData(text: code));
                adminToast(context, fr ? 'ID copié' : 'Meeting ID copied');
              },
              child: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text('ID: $code', style: AppTypography.caption.copyWith(fontFamily: 'monospace', color: AppColors.adminAccent, fontWeight: FontWeight.w700)),
              ),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (st != 'ended') ...[
                Expanded(
                  child: AdminButton(st == 'active' ? (fr ? 'Rejoindre' : 'Rejoin') : (fr ? 'Démarrer' : 'Start'), icon: Icons.videocam, onPressed: onOpen),
                ),
                const SizedBox(width: 8),
                IconButton(icon: const Icon(Icons.link), tooltip: fr ? 'Partager' : 'Share', onPressed: onShare),
              ],
              IconButton(icon: const Icon(Icons.fact_check_outlined), tooltip: fr ? 'Présences' : 'Attendance', onPressed: onAttendance),
              if (st != 'ended') IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.bad), tooltip: fr ? 'Supprimer' : 'Delete', onPressed: onDelete),
            ],
          ),
        ],
      ),
    );
  }
}

class _AdminCreateMeetingPanel extends ConsumerStatefulWidget {
  final List<Map<String, dynamic>> batches;
  const _AdminCreateMeetingPanel({required this.batches});

  @override
  ConsumerState<_AdminCreateMeetingPanel> createState() => _AdminCreateMeetingPanelState();
}

class _AdminCreateMeetingPanelState extends ConsumerState<_AdminCreateMeetingPanel> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _emails = TextEditingController();
  bool _isPublic = true;
  bool _requireApproval = true;
  int? _batchId;
  DateTime _start = DateTime.now().add(const Duration(hours: 1));
  DateTime _end = DateTime.now().add(const Duration(hours: 2));
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _emails.dispose();
    super.dispose();
  }

  Future<void> _pick(bool isStart) async {
    final base = isStart ? _start : _end;
    final d = await showDatePicker(context: context, initialDate: base, firstDate: DateTime.now().subtract(const Duration(days: 1)), lastDate: DateTime.now().add(const Duration(days: 365)));
    if (d == null || !mounted) return;
    final t = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (t == null) return;
    setState(() {
      final picked = DateTime(d.year, d.month, d.day, t.hour, t.minute);
      if (isStart) {
        _start = picked;
        if (!_end.isAfter(_start)) _end = _start.add(const Duration(hours: 1));
      } else {
        _end = picked;
      }
    });
  }

  Future<void> _submit() async {
    final fr = context.isFrench;
    if (_title.text.trim().isEmpty) {
      setState(() => _error = fr ? 'Titre requis.' : 'Title is required.');
      return;
    }
    if (!_isPublic && _batchId == null) {
      setState(() => _error = fr ? 'Choisissez une promotion.' : 'Select a batch.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      final res = await ref.read(apiClientProvider).post('/meetings', data: {
        'title': _title.text.trim(),
        'description': _desc.text.trim().isEmpty ? null : _desc.text.trim(),
        'scheduled_start': _start.toUtc().toIso8601String(),
        'scheduled_end': _end.toUtc().toIso8601String(),
        if (_isPublic) ...{
          'is_public': true,
          'meeting_kind': 'admin',
          'require_approval': _requireApproval,
          if (_emails.text.trim().isNotEmpty) 'invitee_emails': _emails.text.trim(),
        } else
          'batch_id': _batchId,
      });
      if (!mounted) return;
      Navigator.of(context).pop(J.map(res.data));
    } catch (e) {
      if (mounted) setState(() { _error = apiErrorText(context, e); _saving = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final fmt = DateFormat('EEE d MMM · HH:mm');
    return AdminPanel(
      title: fr ? 'Nouvelle réunion' : 'New meeting',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
        AdminButton(fr ? 'Créer' : 'Create', icon: Icons.video_call, busy: _saving, onPressed: _submit),
      ],
      children: [
        const SizedBox(height: 8),
        SegmentedButton<bool>(
          segments: [
            ButtonSegment(value: true, label: Text(fr ? 'Publique / Externe' : 'Public / External')),
            ButtonSegment(value: false, label: Text(fr ? 'Classe promotion' : 'Batch class')),
          ],
          selected: {_isPublic},
          onSelectionChanged: (s) => setState(() => _isPublic = s.first),
        ),
        const SizedBox(height: 14),
        AdminField(label: fr ? 'Titre' : 'Title', controller: _title),
        AdminField(label: fr ? 'Description (facultatif)' : 'Description (optional)', controller: _desc, maxLines: 2),
        if (_isPublic) ...[
          AdminField(
            label: fr ? 'Inviter par e-mail (un ou plusieurs)' : 'Invite by email (one or many)',
            hint: 'alice@example.com, bob@example.com',
            controller: _emails,
            maxLines: 3,
          ),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            title: Text(fr ? 'Approuver avant l’entrée' : 'Require host approval', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
            subtitle: Text(
              _requireApproval
                  ? (fr ? 'Les invités attendent dans le lobby.' : 'Guests wait in lobby until admitted.')
                  : (fr ? 'Toute personne avec le lien peut entrer.' : 'Anyone with link/credentials joins directly.'),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
            value: _requireApproval,
            onChanged: (v) => setState(() => _requireApproval = v),
          ),
        ] else
          AdminSelect<int?>(
            label: fr ? 'Promotion' : 'Batch',
            value: _batchId,
            options: [for (final b in widget.batches) FilterOption<int?>(J.i(b['id']), J.s(b['name']))],
            onChanged: (v) => setState(() => _batchId = v),
          ),
        const SizedBox(height: 8),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(fr ? 'Début' : 'Start'),
          subtitle: Text(fmt.format(_start)),
          trailing: const Icon(Icons.edit_calendar_outlined),
          onTap: () => _pick(true),
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(fr ? 'Fin' : 'End'),
          subtitle: Text(fmt.format(_end)),
          trailing: const Icon(Icons.edit_calendar_outlined),
          onTap: () => _pick(false),
        ),
        if (_error != null) Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
      ],
    );
  }
}
