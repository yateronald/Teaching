import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
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

  Future<void> _schedule() async {
    final done = await showAdminPanel<bool>(context, builder: (_) => _ScheduleForm(request: _d));
    if (done == true) await _reload();
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
    switch (_status) {
      case 'new':
        return (fr ? 'Marquer contactée' : 'Mark contacted', Icons.check, () => _setStatus('contacted'));
      case 'contacted':
        return (fr ? 'Planifier la démo' : 'Schedule demo', Icons.event, _schedule);
      case 'demo_scheduled':
        if (Demo.passed(_d)) return (fr ? 'Marquer terminée' : 'Mark completed', Icons.check_circle, () => _setStatus('completed'));
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
        Row(
          children: [
            Expanded(
              child: AdminButton('E-mail', icon: Icons.mail_outline, primary: false, onPressed: () => _launch(Uri(scheme: 'mailto', path: J.s(d['email'])))),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: AdminButton(
                fr ? 'Appeler' : 'Call',
                icon: Icons.phone_outlined,
                primary: false,
                onPressed: J.s(d['phone']).isEmpty ? null : () => _launch(Uri(scheme: 'tel', path: J.s(d['phone']).replaceAll(' ', ''))),
              ),
            ),
          ],
        ),
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
                        onPressed: () => _launch(Uri.parse(J.s(d['meeting_link']))),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
        PanelSection(fr ? 'Contact' : 'Contact'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              InfoRow(icon: Icons.mail_outline, label: 'E-mail', value: J.s(d['email'])),
              InfoRow(icon: Icons.phone_outlined, label: fr ? 'Téléphone' : 'Phone', value: J.s(d['phone'])),
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
        Row(
          children: [
            if (_status != 'completed' && _status != 'cancelled')
              Expanded(
                child: AdminButton(
                  scheduled != null ? (fr ? 'Replanifier' : 'Reschedule') : (fr ? 'Planifier' : 'Schedule'),
                  icon: Icons.event,
                  primary: false,
                  onPressed: _busy ? null : _schedule,
                ),
              ),
            if (_status != 'completed' && _status != 'cancelled') const SizedBox(width: 10),
            Expanded(
              child: AdminButton(fr ? 'Supprimer' : 'Delete', icon: Icons.delete_outline, primary: false, danger: true, onPressed: _busy ? null : _delete),
            ),
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
                  i <= at && dates[steps[i]] != null ? AdminFmt.dayShort(context, dates[steps[i]]) : '—',
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

/// Date, time, teacher and meeting link of the demo. The visitor and the
/// teacher are e-mailed by the server once saved.
class _ScheduleForm extends ConsumerStatefulWidget {
  final Map<String, dynamic> request;
  const _ScheduleForm({required this.request});

  @override
  ConsumerState<_ScheduleForm> createState() => _ScheduleFormState();
}

class _ScheduleFormState extends ConsumerState<_ScheduleForm> {
  final _form = GlobalKey<FormState>();
  late DateTime? _at = J.date(widget.request['demo_scheduled_at']);
  late int? _teacher = widget.request['teacher_id'] == null ? null : J.i(widget.request['teacher_id']);
  late final _link = TextEditingController(text: J.s(widget.request['meeting_link']));
  final _notes = TextEditingController();
  List<Map<String, dynamic>> _teachers = [];
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTeachers();
  }

  @override
  void dispose() {
    _link.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _loadTeachers() async {
    try {
      final res = await ref.read(apiClientProvider).get('/users/role/teachers');
      if (mounted) setState(() => _teachers = J.list(res.data, ['teachers', 'users']));
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
    if (!(_form.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).patch('/demo-requests/${J.i(widget.request['id'])}/schedule', data: {
        'demo_scheduled_at': _at!.toUtc().toIso8601String(),
        'teacher_id': _teacher,
        'meeting_link': _link.text.trim(),
        if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
      });
      if (!mounted) return;
      adminToast(context, fr ? 'Démo planifiée : le visiteur et le professeur ont reçu un e-mail' : 'Demo scheduled: the visitor and the teacher were emailed');
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
          AdminButton(fr ? 'Planifier et envoyer' : 'Schedule and email', icon: Icons.send, busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 8),
          InkWell(
            onTap: _pick,
            borderRadius: BorderRadius.circular(10),
            child: InputDecorator(
              decoration: adminInputDecoration(fr ? 'Date et heure (votre fuseau)' : 'Date and time (your timezone)', suffix: const Icon(Icons.event, color: AppColors.textMuted)),
              child: Text(_at == null ? (fr ? 'Choisir' : 'Pick') : AdminFmt.dateTime(context, _at), style: AppTypography.bodyMedium),
            ),
          ),
          if (J.s(r['preferred_schedule']).isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 6, bottom: 4),
              child: Text(
                '${fr ? 'Ses disponibilités' : 'Their availability'} : ${J.s(r['preferred_schedule'])}${J.s(r['timezone']).isNotEmpty ? ' (${J.s(r['timezone'])})' : ''}',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
            ),
          const SizedBox(height: 14),
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
