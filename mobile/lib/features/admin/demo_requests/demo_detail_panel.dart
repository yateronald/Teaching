import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../teacher/meetings/screens/pre_join_screen.dart';
import '../common/admin_kit.dart';
import 'demo_model.dart';

/// One demo request: where it stands, what the visitor answered, and the
/// actions that move it forward (contact, schedule, complete, cancel).
class DemoDetailPanel extends ConsumerStatefulWidget {
  final Map<String, dynamic> request;
  final Future<void> Function() onChanged;

  const DemoDetailPanel({super.key, required this.request, required this.onChanged});

  @override
  ConsumerState<DemoDetailPanel> createState() => _DemoDetailPanelState();
}

class _DemoDetailPanelState extends ConsumerState<DemoDetailPanel> {
  late Map<String, dynamic> _d = Map.of(widget.request);
  late final _notes = TextEditingController(text: J.s(widget.request['notes']));
  bool _busy = false;
  bool _notesDirty = false;

  int get _id => J.i(_d['id']);
  String get _status => J.s(_d['status']);

  @override
  void initState() {
    super.initState();
    _notes.addListener(() {
      final dirty = _notes.text != J.s(_d['notes']);
      if (dirty != _notesDirty) setState(() => _notesDirty = dirty);
    });
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    await widget.onChanged();
    try {
      final res = await ref.read(apiClientProvider).get('/demo-requests/$_id');
      final data = J.map(res.data);
      final fresh = data['data'] is Map ? J.map(data['data']) : data;
      if (fresh.isNotEmpty && mounted) setState(() => _d = {..._d, ...fresh});
    } catch (_) {}
  }

  Future<void> _setStatus(String status, {String? notes}) async {
    final fr = context.isFrench;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).patch('/demo-requests/$_id/status', data: {
        'status': status,
        'notes': notes ?? _notes.text,
      });
      if (!mounted) return;
      setState(() {
        _d['status'] = status;
        _d['notes'] = notes ?? _notes.text;
        _notesDirty = false;
      });
      adminToast(context, status == _status && notes != null ? (fr ? 'Note enregistrée' : 'Note saved') : (fr ? 'Statut : ${Demo.statusLabel(status, fr)}' : 'Status: ${Demo.statusLabel(status, fr)}'));
      await _reload();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _schedule([Map<String, dynamic>? prefillSlot]) async {
    final done = await showAdminPanel<bool>(
      context,
      builder: (_) => _ScheduleForm(request: _d, prefillSlot: prefillSlot),
    );
    if (done == true) await _reload();
  }

  Future<void> _askAvailability() async {
    final done = await showAdminPanel<bool>(
      context,
      builder: (_) => _AskAvailabilityForm(request: _d),
    );
    if (done == true) await _reload();
  }

  Future<void> _openLinkedRoom(Map<String, dynamic> lm) async {
    final m = Map<String, dynamic>.from(lm);
    if (J.s(m['status']) == 'scheduled') {
      try {
        await ref.read(apiClientProvider).post('/meetings/${m['id']}/prepare');
      } catch (_) {}
    }
    if (!mounted) return;
    await Navigator.push(context, MaterialPageRoute(builder: (_) => PreJoinScreen(meeting: m)));
    await _reload();
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer cette demande ?' : 'Delete this request?',
      message: fr ? 'La demande de ${J.s(_d['full_name'])} est supprimée définitivement.' : "${J.s(_d['full_name'])}'s request is permanently removed.",
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete('/demo-requests/$_id');
      await widget.onChanged();
      if (!mounted) return;
      adminToast(context, fr ? 'Demande supprimée' : 'Request deleted');
      Navigator.of(context).maybePop();
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _launch(Uri uri) async {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      adminToast(context, context.isFrench ? "Impossible d'ouvrir ce lien." : 'Could not open this link.', error: true);
    }
  }

  /// The one action that moves the request forward, as on the web.
  (String, IconData, VoidCallback)? _nextAction(bool fr) {
    final av = _d['latest_availability'];
    if (av is Map && J.s(av['status']) == 'submitted' && (_status == 'new' || _status == 'contacted')) {
      return (fr ? 'Planifier' : 'Schedule', Icons.event, () => _schedule());
    }
    switch (_status) {
      case 'new':
        return (fr ? 'Demander dispos' : 'Ask availability', Icons.schedule_send_outlined, _askAvailability);
      case 'contacted':
        return (fr ? 'Planifier la démo' : 'Schedule demo', Icons.event, () => _schedule());
      case 'demo_scheduled':
        if (Demo.passed(_d)) return (fr ? 'Marquer terminée' : 'Mark completed', Icons.check_circle, () => _setStatus('completed'));
        if (_d['linked_meeting'] is Map) {
          final lm = J.map(_d['linked_meeting']);
          return (fr ? 'Ouvrir la salle' : 'Open room', Icons.videocam, () => _openLinkedRoom(lm));
        }
        final link = J.s(_d['meeting_link']);
        if (link.isNotEmpty) return (fr ? 'Ouvrir le lien' : 'Open link', Icons.link, () => _launch(Uri.parse(link)));
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = _d;
    final next = _nextAction(fr);
    final scheduled = J.date(d['demo_scheduled_at']);
    final teacher = J.name(d, first: 'teacher_first_name', last: 'teacher_last_name');
    final isExam = J.s(d['interest']) == 'exam';

    return AdminPanel(
      title: J.s(d['full_name']),
      subtitle: '${fr ? 'Reçue' : 'Received'} ${AdminFmt.dateTime(context, J.date(d['created_at']))}',
      leading: InitialsAvatar(J.s(d['full_name']), size: 44),
      actions: [
        if (next != null) AdminButton(next.$1, icon: next.$2, busy: _busy, onPressed: next.$3),
      ],
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            Pill(Demo.statusLabel(_status, fr), color: Demo.statusColor(_status), icon: Demo.statusIcon(_status)),
            if (Demo.interestLabel(J.s(d['interest']), fr).isNotEmpty)
              Pill(Demo.interestLabel(J.s(d['interest']), fr), color: isExam ? const Color(0xFFD97706) : AppColors.adminAccent),
          ],
        ),
        const SizedBox(height: 14),
        _Progress(d: d),
        const SizedBox(height: 14),
        Builder(builder: (context) {
          final rawPhone = J.s(d['phone']);
          final waDigits = rawPhone.replaceAll(RegExp(r'\D'), '');
          final mailBtn = AdminButton(
            'E-mail',
            icon: Icons.mail_outline,
            primary: false,
            onPressed: () => _launch(Uri(scheme: 'mailto', path: J.s(d['email']))),
          );
          final callBtn = AdminButton(
            fr ? 'Appeler' : 'Call',
            icon: Icons.phone_outlined,
            primary: false,
            onPressed: rawPhone.isEmpty ? null : () => _launch(Uri(scheme: 'tel', path: rawPhone.replaceAll(' ', ''))),
          );
          final waBtn = waDigits.length >= 7
              ? OutlinedButton.icon(
                  onPressed: () => _launch(Uri.parse('https://wa.me/$waDigits')),
                  icon: const Icon(Icons.chat_outlined, size: 18),
                  label: const Text('WhatsApp'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF15803D),
                    backgroundColor: const Color(0xFFF0FDF4),
                    side: const BorderSide(color: Color(0xFFBBF7D0)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                    minimumSize: const Size(0, 44),
                  ),
                )
              : null;
          if (waBtn == null) {
            return Row(
              children: [
                Expanded(child: mailBtn),
                const SizedBox(width: 10),
                Expanded(child: callBtn),
              ],
            );
          }
          return LayoutBuilder(builder: (context, c) {
            if (c.maxWidth >= 340) {
              return Row(
                children: [
                  Expanded(child: mailBtn),
                  const SizedBox(width: 8),
                  Expanded(child: waBtn),
                  const SizedBox(width: 8),
                  Expanded(child: callBtn),
                ],
              );
            }
            return Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [mailBtn, waBtn, callBtn],
            );
          });
        }),
        if (scheduled != null) ...[
          PanelSection(fr ? 'Démo' : 'Demo'),
          AdminCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 52,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      decoration: BoxDecoration(color: AppColors.adminAccentBg, borderRadius: BorderRadius.circular(10)),
                      child: Column(
                        children: [
                          Text(AdminFmt.dayShort(context, scheduled).split(' ').last.toUpperCase(), style: AppTypography.caption.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w800, fontSize: 10)),
                          Text('${scheduled.day}', style: AppTypography.titleLarge.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${AdminFmt.weekdayDay(context, scheduled)} · ${AdminFmt.time(context, scheduled)}', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                          if (teacher.isNotEmpty) Text(fr ? 'avec $teacher' : 'with $teacher', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                          if (J.s(d['timezone']).isNotEmpty)
                            Text(fr ? 'Fuseau du visiteur : ${J.s(d['timezone'])}' : 'Their timezone: ${J.s(d['timezone'])}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                  ],
                ),
                if (J.s(d['meeting_link']).isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: Text(J.s(d['meeting_link']), style: AppTypography.caption.copyWith(color: AppColors.adminAccent), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      IconButton(
                        tooltip: fr ? 'Copier' : 'Copy',
                        icon: const Icon(Icons.copy, size: 18),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: J.s(d['meeting_link'])));
                          adminToast(context, fr ? 'Lien copié' : 'Link copied');
                        },
                      ),
                      IconButton(
                        tooltip: fr ? 'Ouvrir' : 'Open',
                        icon: const Icon(Icons.open_in_new, size: 18),
                        onPressed: () {
                          if (d['linked_meeting'] is Map) {
                            _openLinkedRoom(J.map(d['linked_meeting']));
                          } else {
                            _launch(Uri.parse(J.s(d['meeting_link'])));
                          }
                        },
                      ),
                    ],
                  ),
                ],
                if (d['linked_meeting'] is Map) ...[
                  const SizedBox(height: 6),
                  Builder(builder: (context) {
                    final lm = J.map(d['linked_meeting']);
                    return Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        if (J.s(lm['code']).isNotEmpty) Pill('ID: ${J.s(lm['code'])}', color: AppColors.adminAccent),
                        if (J.s(lm['passcode']).isNotEmpty) Pill('Pass: ${J.s(lm['passcode'])}', color: AppColors.good),
                      ],
                    );
                  }),
                ],
              ],
            ),
          ),
        ],
        PanelSection(
          fr ? 'Disponibilités' : 'Availability workflow',
          trailing: (_status != 'completed' && _status != 'cancelled')
              ? TextButton.icon(
                  onPressed: _busy ? null : _askAvailability,
                  icon: const Icon(Icons.schedule_send_outlined, size: 16),
                  label: Text(d['latest_availability'] != null ? (fr ? 'Nouveau lien' : 'New link') : (fr ? 'Demander' : 'Ask')),
                )
              : null,
        ),
        Builder(builder: (context) {
          final avRaw = d['latest_availability'];
          if (avRaw is! Map) {
            return AdminCard(
              padding: const EdgeInsets.all(14),
              child: Text(
                fr
                    ? 'Aucun lien envoyé. Appuyez sur « Demander » pour envoyer un lien à usage unique.'
                    : 'No availability link sent yet. Tap Ask to email a single-use scheduling link.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              ),
            );
          }
          final av = J.map(avRaw);
          final avStatus = J.s(av['status']);
          if (avStatus == 'submitted') {
            final slots = av['submitted_slots'] is List
                ? (av['submitted_slots'] as List).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList()
                : <Map<String, dynamic>>[];
            return AdminCard(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Pill(Demo.availabilityLabel(avStatus, fr), color: AppColors.good, icon: Icons.check_circle_outline),
                      Text(J.s(av['submitted_timezone']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  for (final sl in slots)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              Demo.formatSlot(sl, fr: fr),
                              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                            ),
                          ),
                          if (_status != 'completed' && _status != 'cancelled')
                            TextButton(
                              onPressed: () => _schedule(sl),
                              child: Text(fr ? 'Planifier' : 'Schedule'),
                            ),
                        ],
                      ),
                    ),
                  if (J.s(av['submitted_note']).isNotEmpty)
                    Text(
                      '${fr ? 'Note' : 'Note'}: ${J.s(av['submitted_note'])}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                ],
              ),
            );
          }
          final proposed = Demo.proposedSlots(av);
          return AdminCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Pill(Demo.availabilityLabel(avStatus, fr), color: Demo.availabilityColor(avStatus)),
                    Text(J.s(av['proposed_timezone']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  ],
                ),
                const SizedBox(height: 8),
                if (proposed.isNotEmpty)
                  for (final sl in proposed)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        Demo.formatSlot(sl, fr: fr),
                        style: AppTypography.bodySmall.copyWith(color: AppColors.ink, fontWeight: FontWeight.w600),
                      ),
                    )
                else
                  Text(
                    '${J.s(av['proposed_start_date'])} to ${J.s(av['proposed_end_date'])} · ${J.s(av['proposed_time_start'])} - ${J.s(av['proposed_time_end'])}',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.ink, fontWeight: FontWeight.w600),
                  ),
              ],
            ),
          );
        }),
        PanelSection(fr ? 'Contact' : 'Contact'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              InfoRow(icon: Icons.mail_outline, label: 'E-mail', value: J.s(d['email'])),
              InfoRow(icon: Icons.chat_outlined, label: 'WhatsApp', value: J.s(d['phone'])),
              InfoRow(icon: Icons.public, label: fr ? 'Pays' : 'Country', value: J.s(d['country'])),
              InfoRow(icon: Icons.schedule, label: fr ? 'Fuseau horaire' : 'Timezone', value: J.s(d['timezone'])),
            ],
          ),
        ),
        PanelSection(fr ? 'Ses réponses' : 'Their answers'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              if (isExam) ...[
                InfoRow(icon: Icons.school_outlined, label: fr ? 'Examen' : 'Exam', value: J.s(d['target_exam'])),
                InfoRow(icon: Icons.event_outlined, label: fr ? "Date d'examen" : 'Exam date', value: J.s(d['exam_date']).isEmpty ? (fr ? 'Pas encore réservée' : 'Not booked yet') : AdminFmt.day(context, J.date(d['exam_date']))),
                InfoRow(icon: Icons.flag_outlined, label: fr ? 'Score visé' : 'Score needed', value: J.s(d['target_score'])),
                InfoRow(icon: Icons.checklist, label: fr ? 'Épreuves' : 'Papers', value: Demo.skillsLabel(J.s(d['skills']), fr)),
              ],
              InfoRow(icon: Icons.signal_cellular_alt, label: fr ? 'Niveau actuel' : 'Current level', value: J.s(d['current_level'])),
              if (!isExam) InfoRow(icon: Icons.trending_up, label: fr ? 'Niveau visé' : 'Level wanted', value: J.s(d['interested_level'])),
              InfoRow(
                icon: Icons.history_edu_outlined,
                label: fr ? 'Expérience' : 'Experience',
                value: Demo.hadExperience(d['has_previous_experience'])
                    ? (fr ? 'A déjà étudié le français' : 'Has studied French before')
                    : (fr ? 'Première fois' : 'First time learning'),
              ),
              InfoRow(icon: Icons.menu_book_outlined, label: fr ? 'A étudié avec' : 'Studied with', value: J.s(d['previous_study_method'])),
              InfoRow(icon: Icons.track_changes_outlined, label: fr ? 'Objectifs' : 'Goals', value: J.s(d['learning_goals'])),
              InfoRow(icon: Icons.lightbulb_outline, label: fr ? 'Attentes' : 'Expectations', value: J.s(d['expectations'])),
              InfoRow(icon: Icons.play_circle_outline, label: fr ? 'Veut commencer' : 'Wants to start', value: J.s(d['expected_start_time'])),
              InfoRow(icon: Icons.calendar_month_outlined, label: fr ? 'Disponibilités' : 'Availability', value: J.s(d['preferred_schedule'])),
            ],
          ),
        ),
        PanelSection(
          fr ? 'Notes internes' : 'Internal notes',
          trailing: _notesDirty
              ? TextButton(
                  onPressed: _busy ? null : () => _setStatus(_status, notes: _notes.text),
                  child: Text(fr ? 'Enregistrer' : 'Save'),
                )
              : null,
        ),
        TextField(
          controller: _notes,
          maxLines: 4,
          minLines: 3,
          style: AppTypography.bodyMedium,
          decoration: adminInputDecoration(fr ? 'Visible des admins seulement' : 'Only admins see these notes'),
        ),
        PanelSection(fr ? 'Statut' : 'Status'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final s in Demo.statuses)
              ChoiceChip(
                label: Text(Demo.statusLabel(s, fr)),
                selected: _status == s,
                selectedColor: Demo.statusColor(s).withValues(alpha: 0.15),
                side: BorderSide(color: _status == s ? Demo.statusColor(s) : AppColors.border),
                labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: _status == s ? Demo.statusColor(s) : AppColors.text),
                showCheckmark: false,
                onSelected: _busy || _status == s
                    ? null
                    : (_) {
                        if (s == 'demo_scheduled') {
                          _schedule();
                        } else {
                          _setStatus(s);
                        }
                      },
              ),
          ],
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            if (_status != 'completed' && _status != 'cancelled')
              AdminButton(
                fr ? 'Demander dispos' : 'Ask availability',
                icon: Icons.schedule_send_outlined,
                primary: false,
                onPressed: _busy ? null : _askAvailability,
              ),
            if (_status != 'completed' && _status != 'cancelled')
              AdminButton(
                scheduled != null ? (fr ? 'Replanifier' : 'Reschedule') : (fr ? 'Planifier' : 'Schedule'),
                icon: Icons.event,
                primary: false,
                onPressed: _busy ? null : () => _schedule(),
              ),
            AdminButton(fr ? 'Supprimer' : 'Delete', icon: Icons.delete_outline, primary: false, danger: true, onPressed: _busy ? null : _delete),
          ],
        ),
      ],
    );
  }
}

/// New → contacted → scheduled → completed, with the date of each step.
class _Progress extends StatelessWidget {
  final Map<String, dynamic> d;
  const _Progress({required this.d});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final status = J.s(d['status']);
    if (status == 'cancelled') {
      return Text(fr ? 'Cette demande a été annulée.' : 'This request was cancelled.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted));
    }
    const steps = ['new', 'contacted', 'demo_scheduled', 'completed'];
    final at = steps.indexOf(status);
    final dates = {
      'new': J.date(d['created_at']),
      'contacted': J.date(d['contacted_at']),
      'demo_scheduled': J.date(d['demo_scheduled_at']),
      'completed': status == 'completed' ? J.date(d['updated_at']) : null,
    };
    return Row(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          Expanded(
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(child: Container(height: 3, color: i == 0 ? Colors.transparent : (i <= at ? AppColors.adminAccent : AppColors.border))),
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: i <= at ? AppColors.adminAccent : AppColors.pureWhite,
                        shape: BoxShape.circle,
                        border: Border.all(color: i <= at ? AppColors.adminAccent : AppColors.border, width: 2),
                      ),
                      child: i <= at ? const Icon(Icons.check, size: 13, color: AppColors.pureWhite) : null,
                    ),
                    Expanded(child: Container(height: 3, color: i == steps.length - 1 ? Colors.transparent : (i < at ? AppColors.adminAccent : AppColors.border))),
                  ],
                ),
                const SizedBox(height: 6),
                Text(Demo.statusLabel(steps[i], fr), textAlign: TextAlign.center, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 11, color: i <= at ? AppColors.ink : AppColors.textMuted)),
                Text(
                  i <= at && dates[steps[i]] != null ? AdminFmt.dayShort(context, dates[steps[i]]) : '-',
                  style: AppTypography.caption.copyWith(fontSize: 10.5, color: AppColors.textMuted),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

/// Date, time, host and access policy of the demo. Creates a live public meeting
/// on the platform (or saves a manual link) and emails the prospect.
class _ScheduleForm extends ConsumerStatefulWidget {
  final Map<String, dynamic> request;
  final Map<String, dynamic>? prefillSlot;
  const _ScheduleForm({required this.request, this.prefillSlot});

  @override
  ConsumerState<_ScheduleForm> createState() => _ScheduleFormState();
}

class _ScheduleFormState extends ConsumerState<_ScheduleForm> {
  final _form = GlobalKey<FormState>();
  bool _platformMode = true;
  late DateTime? _at;
  int _durationMin = 30;
  bool _requireApproval = true;
  int? _hostId;
  late int? _teacher = widget.request['teacher_id'] == null ? null : J.i(widget.request['teacher_id']);
  late final _title = TextEditingController(text: 'French Demo: ${J.s(widget.request['full_name'])}');
  late final _link = TextEditingController(text: J.s(widget.request['meeting_link']));
  final _notes = TextEditingController();
  List<Map<String, dynamic>> _teachers = [];
  List<Map<String, dynamic>> _hosts = [];
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _at = _initialDateTime();
    _hostId = ref.read(authNotifierProvider).user?.id;
    _loadHosts();
  }

  DateTime? _initialDateTime() {
    final slot = widget.prefillSlot ??
        (widget.request['latest_availability'] is Map &&
                widget.request['latest_availability']['submitted_slots'] is List &&
                (widget.request['latest_availability']['submitted_slots'] as List).isNotEmpty
            ? Map<String, dynamic>.from((widget.request['latest_availability']['submitted_slots'] as List).first as Map)
            : null);
    if (slot != null) {
      final d = J.s(slot['date']);
      final s = J.s(slot['start']);
      final parsed = DateTime.tryParse('${d}T$s:00');
      if (parsed != null) return parsed;
    }
    return J.date(widget.request['demo_scheduled_at']);
  }

  @override
  void dispose() {
    _title.dispose();
    _link.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _loadHosts() async {
    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait([
        client.get('/users/role/teachers'),
        client.get('/users', queryParameters: {'limit': 100}),
      ]);
      final tList = J.list(results[0].data, ['teachers', 'users']);
      final allUsers = J.list(results[1].data, ['users']);
      final hostMap = <int, Map<String, dynamic>>{};
      for (final u in [...tList, ...allUsers]) {
        final role = J.s(u['role']);
        if (role == 'admin' || role == 'teacher') {
          hostMap[J.i(u['id'])] = u;
        }
      }
      if (mounted) {
        setState(() {
          _teachers = tList;
          _hosts = hostMap.values.toList();
          if (_hostId == null && _hosts.isNotEmpty) _hostId = J.i(_hosts.first['id']);
        });
      }
    } catch (_) {}
  }

  Future<void> _pick() async {
    final now = DateTime.now();
    final base = _at ?? DateTime(now.year, now.month, now.day + 1, 10);
    final day = await showDatePicker(context: context, initialDate: base.isBefore(now) ? now : base, firstDate: DateTime(now.year - 1), lastDate: DateTime(now.year + 2));
    if (day == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (time == null) return;
    setState(() => _at = DateTime(day.year, day.month, day.day, time.hour, time.minute));
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (_at == null) {
      setState(() => _error = fr ? 'Choisissez la date et l’heure.' : 'Pick the date and time.');
      return;
    }
    if (!_platformMode && !(_form.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final client = ref.read(apiClientProvider);
      if (_platformMode) {
        final end = _at!.add(Duration(minutes: _durationMin));
        await client.post('/demo-requests/${J.i(widget.request['id'])}/schedule-meeting', data: {
          'scheduled_start': _at!.toUtc().toIso8601String(),
          'scheduled_end': end.toUtc().toIso8601String(),
          'title': _title.text.trim(),
          'host_id': _hostId,
          'require_approval': _requireApproval,
          if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
        });
        if (!mounted) return;
        adminToast(context, fr ? 'Réunion créée et lien envoyé au prospect' : 'Meeting scheduled and link emailed');
      } else {
        await client.patch('/demo-requests/${J.i(widget.request['id'])}/schedule', data: {
          'demo_scheduled_at': _at!.toUtc().toIso8601String(),
          'teacher_id': _teacher,
          'meeting_link': _link.text.trim(),
          if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
        });
        if (!mounted) return;
        adminToast(context, fr ? 'Démo planifiée : e-mails envoyés' : 'Demo scheduled and emailed');
      }
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final r = widget.request;
    return Form(
      key: _form,
      child: AdminPanel(
        title: J.date(r['demo_scheduled_at']) != null ? (fr ? 'Replanifier la démo' : 'Reschedule demo') : (fr ? 'Planifier une démo' : 'Schedule a demo'),
        subtitle: [J.s(r['full_name']), J.s(r['current_level']), J.s(r['country'])].where((s) => s.isNotEmpty).join(' · '),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop(false)),
          AdminButton(fr ? 'Planifier et envoyer' : 'Schedule & email', icon: Icons.send, busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 8),
          SegmentedButton<bool>(
            segments: [
              ButtonSegment(value: true, label: Text(fr ? 'Réunion directe' : 'Live meeting')),
              ButtonSegment(value: false, label: Text(fr ? 'Lien externe' : 'External link')),
            ],
            selected: {_platformMode},
            onSelectionChanged: (s) => setState(() => _platformMode = s.first),
          ),
          const SizedBox(height: 14),
          InkWell(
            onTap: _pick,
            borderRadius: BorderRadius.circular(10),
            child: InputDecorator(
              decoration: adminInputDecoration(fr ? 'Date et heure' : 'Date and time', suffix: const Icon(Icons.event, color: AppColors.textMuted)),
              child: Text(_at == null ? (fr ? 'Choisir' : 'Pick') : AdminFmt.dateTime(context, _at), style: AppTypography.bodyMedium),
            ),
          ),
          const SizedBox(height: 14),
          if (_platformMode) ...[
            AdminField(label: fr ? 'Titre' : 'Title', controller: _title),
            AdminSelect<int>(
              label: fr ? 'Durée' : 'Duration',
              value: _durationMin,
              options: const [
                FilterOption(15, '15 min'),
                FilterOption(30, '30 min'),
                FilterOption(45, '45 min'),
                FilterOption(60, '60 min'),
              ],
              onChanged: (v) => setState(() => _durationMin = v ?? 30),
            ),
            if (_hosts.isNotEmpty)
              AdminSelect<int?>(
                label: fr ? 'Hôte' : 'Host',
                value: _hostId,
                options: [for (final h in _hosts) FilterOption<int?>(J.i(h['id']), '${J.name(h)} (${J.s(h['role'])})')],
                onChanged: (v) => setState(() => _hostId = v),
              ),
            SwitchListTile.adaptive(
              contentPadding: EdgeInsets.zero,
              title: Text(fr ? 'Approuver avant l’entrée' : 'Require host approval', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
              subtitle: Text(
                _requireApproval
                    ? (fr ? 'Le prospect attend en salle d’attente.' : 'Guest waits in lobby until admitted.')
                    : (fr ? 'Accès direct avec le lien.' : 'Direct entry with the link.'),
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
              value: _requireApproval,
              onChanged: (v) => setState(() => _requireApproval = v),
            ),
          ] else ...[
            AdminSelect<int?>(
              label: fr ? 'Professeur' : 'Teacher',
              value: _teacher,
              options: [for (final t in _teachers) FilterOption<int?>(J.i(t['id']), J.name(t).isEmpty ? J.s(t['email']) : J.name(t))],
              validator: (v) => v == null ? (fr ? 'Choisissez un professeur' : 'Choose a teacher') : null,
              onChanged: (v) => setState(() => _teacher = v),
            ),
            AdminField(
              label: fr ? 'Lien de la réunion' : 'Meeting link',
              hint: 'https://…',
              controller: _link,
              keyboardType: TextInputType.url,
              validator: (v) {
                final uri = Uri.tryParse((v ?? '').trim());
                return uri != null && uri.hasScheme && uri.host.isNotEmpty ? null : (fr ? 'Lien valide requis (https://…)' : 'A valid link is required (https://…)');
              },
            ),
          ],
          AdminField(label: fr ? 'Note (facultatif)' : 'Note (optional)', controller: _notes, maxLines: 3),
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.badBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.badBorder)),
              child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
            ),
        ],
      ),
    );
  }
}

class _ProposedSlot {
  DateTime date;
  DateTime? endDate;
  TimeOfDay start;
  TimeOfDay end;
  _ProposedSlot({required this.date, this.endDate, required this.start, required this.end});
  bool get isRange => endDate != null;
}

/// Asks the prospect for their availability by proposing one or more flexible single-day or date-range options.
class _AskAvailabilityForm extends ConsumerStatefulWidget {
  final Map<String, dynamic> request;
  const _AskAvailabilityForm({required this.request});

  @override
  ConsumerState<_AskAvailabilityForm> createState() => _AskAvailabilityFormState();
}

class _AskAvailabilityFormState extends ConsumerState<_AskAvailabilityForm> {
  final List<_ProposedSlot> _slots = [
    _ProposedSlot(
      date: DateTime.now().add(const Duration(days: 1)),
      start: const TimeOfDay(hour: 10, minute: 0),
      end: const TimeOfDay(hour: 11, minute: 0),
    ),
  ];
  late String _tz = J.s(ref.read(authNotifierProvider).user?.timezone).isNotEmpty
      ? J.s(ref.read(authNotifierProvider).user?.timezone)
      : 'UTC';
  final _note = TextEditingController();
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  String _isoDate(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  String _hm(TimeOfDay t) => '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  void _addOption() {
    if (_slots.length >= 15) return;
    final last = _slots.last;
    final anchor = last.endDate ?? last.date;
    setState(() {
      _error = null;
      _slots.add(_ProposedSlot(
        date: anchor.add(const Duration(days: 1)),
        start: last.start,
        end: last.end,
      ));
    });
  }

  void _duplicateOption(int index) {
    if (_slots.length >= 15) return;
    final src = _slots[index];
    final canShift = src.end.hour < 22;
    setState(() {
      _error = null;
      _slots.insert(
        index + 1,
        _ProposedSlot(
          date: src.date,
          endDate: src.endDate,
          start: canShift ? TimeOfDay(hour: src.start.hour + 1, minute: src.start.minute) : src.start,
          end: canShift ? TimeOfDay(hour: src.end.hour + 1, minute: src.end.minute) : src.end,
        ),
      );
    });
  }

  void _setRangeMode(int index, bool range) {
    final sl = _slots[index];
    setState(() {
      _error = null;
      if (range) {
        sl.endDate = (sl.endDate != null && !sl.endDate!.isBefore(sl.date))
            ? sl.endDate
            : sl.date.add(const Duration(days: 1));
      } else {
        sl.endDate = null;
      }
    });
  }

  Future<void> _send() async {
    final fr = context.isFrench;
    final payload = <Map<String, String>>[];
    for (var i = 0; i < _slots.length; i++) {
      final sl = _slots[i];
      final dateStr = _isoDate(sl.date);
      String? endDateStr;
      if (sl.endDate != null) {
        final cand = _isoDate(sl.endDate!);
        if (cand.compareTo(dateStr) < 0) {
          setState(() => _error = fr ? 'Option #${i + 1} : la date de fin doit suivre le début.' : 'Option #${i + 1}: end date must be on or after start date.');
          return;
        }
        if (sl.endDate!.difference(sl.date).inDays > 31) {
          setState(() => _error = fr ? 'Option #${i + 1} : maximum 31 jours par plage.' : 'Option #${i + 1}: maximum 31 days per date range.');
          return;
        }
        if (cand != dateStr) endDateStr = cand;
      }
      final s = _hm(sl.start);
      final e = _hm(sl.end);
      if (e.compareTo(s) <= 0) {
        setState(() => _error = fr ? 'Option #${i + 1} : l’heure de fin doit suivre le début.' : 'Option #${i + 1}: end time must be after start time.');
        return;
      }
      payload.add({
        'date': dateStr,
        'end_date': ?endDateStr,
        'start': s,
        'end': e,
      });
    }
    setState(() { _sending = true; _error = null; });
    try {
      await ref.read(apiClientProvider).post('/demo-requests/${J.i(widget.request['id'])}/request-availability', data: {
        'proposed_slots': payload,
        'proposed_timezone': _tz,
        if (_note.text.trim().isNotEmpty) 'admin_note': _note.text.trim(),
      });
      if (!mounted) return;
      adminToast(context, fr ? 'Options de disponibilité envoyées par e-mail' : 'Availability options emailed to prospect');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) setState(() { _error = apiErrorText(context, e); _sending = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    const zones = ['UTC', 'America/Toronto', 'America/New_York', 'Europe/Paris', 'Europe/London', 'Africa/Casablanca', 'Africa/Abidjan', 'Africa/Dakar', 'Asia/Dubai'];
    final tzList = zones.contains(_tz) ? zones : [_tz, ...zones];
    return AdminPanel(
      title: fr ? 'Demander les disponibilités' : 'Ask for availability',
      subtitle: '${J.s(widget.request['full_name'])} · ${J.s(widget.request['email'])}',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _sending ? null : () => Navigator.of(context).pop(false)),
        AdminButton(fr ? 'Envoyer le lien' : 'Send link', icon: Icons.send, busy: _sending, onPressed: _send),
      ],
      children: [
        const SizedBox(height: 8),
        AdminSelect<String>(
          label: fr ? 'Fuseau horaire' : 'Timezone',
          value: _tz,
          options: [for (final z in tzList) FilterOption<String>(z, z)],
          onChanged: (v) => setState(() => _tz = v ?? _tz),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${fr ? 'Créneaux proposés' : 'Proposed options'} (${_slots.length}/15)',
              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
            ),
            if (_slots.length < 15)
              TextButton.icon(
                onPressed: _addOption,
                icon: const Icon(Icons.add, size: 18),
                label: Text(fr ? 'Ajouter un créneau' : 'Add option'),
              ),
          ],
        ),
        const SizedBox(height: 6),
        for (var i = 0; i < _slots.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: AdminCard(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          '${fr ? 'Option' : 'Option'} ${i + 1}',
                          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.adminAccent),
                        ),
                      ),
                      ChoiceChip(
                        label: Text(fr ? 'Un jour' : 'Single day'),
                        selected: !_slots[i].isRange,
                        visualDensity: VisualDensity.compact,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        onSelected: (_) => _setRangeMode(i, false),
                      ),
                      const SizedBox(width: 6),
                      ChoiceChip(
                        label: Text(fr ? 'Plage' : 'Date range'),
                        selected: _slots[i].isRange,
                        visualDensity: VisualDensity.compact,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        onSelected: (_) => _setRangeMode(i, true),
                      ),
                      if (_slots.length < 15)
                        IconButton(
                          tooltip: fr ? 'Dupliquer' : 'Duplicate',
                          icon: const Icon(Icons.copy_outlined, size: 18),
                          onPressed: () => _duplicateOption(i),
                          visualDensity: VisualDensity.compact,
                        ),
                      if (_slots.length > 1)
                        IconButton(
                          tooltip: fr ? 'Supprimer' : 'Remove',
                          icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.bad),
                          onPressed: () => setState(() { _error = null; _slots.removeAt(i); }),
                          visualDensity: VisualDensity.compact,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (!_slots[i].isRange)
                    InkWell(
                      onTap: () async {
                        final d = await showDatePicker(
                          context: context,
                          initialDate: _slots[i].date,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 90)),
                        );
                        if (d != null) setState(() { _error = null; _slots[i].date = d; });
                      },
                      child: InputDecorator(
                        decoration: adminInputDecoration(fr ? 'Date' : 'Date', suffix: const Icon(Icons.calendar_today_outlined, size: 16)),
                        child: Text(AdminFmt.weekdayDay(context, _slots[i].date)),
                      ),
                    )
                  else
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () async {
                              final d = await showDatePicker(
                                context: context,
                                initialDate: _slots[i].date,
                                firstDate: DateTime.now(),
                                lastDate: DateTime.now().add(const Duration(days: 90)),
                              );
                              if (d != null) {
                                setState(() {
                                  _error = null;
                                  _slots[i].date = d;
                                  if (_slots[i].endDate == null || _slots[i].endDate!.isBefore(d)) {
                                    _slots[i].endDate = d.add(const Duration(days: 1));
                                  }
                                });
                              }
                            },
                            child: InputDecorator(
                              decoration: adminInputDecoration(fr ? 'Du' : 'From date'),
                              child: Text(AdminFmt.weekdayDay(context, _slots[i].date)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: InkWell(
                            onTap: () async {
                              final start = _slots[i].date;
                              final curEnd = _slots[i].endDate ?? start.add(const Duration(days: 1));
                              final d = await showDatePicker(
                                context: context,
                                initialDate: curEnd.isBefore(start) ? start : curEnd,
                                firstDate: start,
                                lastDate: start.add(const Duration(days: 31)),
                              );
                              if (d != null) setState(() { _error = null; _slots[i].endDate = d; });
                            },
                            child: InputDecorator(
                              decoration: adminInputDecoration(fr ? 'Au' : 'To date'),
                              child: Text(AdminFmt.weekdayDay(context, _slots[i].endDate ?? _slots[i].date)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final t = await showTimePicker(context: context, initialTime: _slots[i].start);
                            if (t != null) setState(() { _error = null; _slots[i].start = t; });
                          },
                          child: InputDecorator(
                            decoration: adminInputDecoration(fr ? (_slots[i].isRange ? 'De (chaque jour)' : 'Début') : (_slots[i].isRange ? 'Daily from' : 'From')),
                            child: Text(_hm(_slots[i].start)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final t = await showTimePicker(context: context, initialTime: _slots[i].end);
                            if (t != null) setState(() { _error = null; _slots[i].end = t; });
                          },
                          child: InputDecorator(
                            decoration: adminInputDecoration(fr ? (_slots[i].isRange ? 'À (chaque jour)' : 'Fin') : (_slots[i].isRange ? 'Daily until' : 'To')),
                            child: Text(_hm(_slots[i].end)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        AdminField(label: fr ? 'Note (facultatif)' : 'Note (optional)', controller: _note, maxLines: 3),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
        ],
      ],
    );
  }
}
