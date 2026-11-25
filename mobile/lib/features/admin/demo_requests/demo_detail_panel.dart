import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../../core/utils/schedule_timezone.dart';
import '../../../core/widgets/timezone_picker_field.dart';
import '../../teacher/meetings/screens/pre_join_screen.dart';
import '../common/admin_kit.dart';
import 'demo_model.dart';

const _brandNavy = Color(0xFF183961);
const _brandSoft = Color(0xFFEDF2F8);
const _brandBorder = Color(0xFFCBD8E8);
const _brandCardHead = Color(0xFFF8FAFD);
const _brandInk = Color(0xFF0B1733);
const _brandMuted = Color(0xFF5D687D);
const _brandSubtle = Color(0xFF8390A5);
const _brandCrimson = Color(0xFFC81E32);
const _brandCrimsonBorder = Color(0xFFF2CFD4);
const _waGreen = Color(0xFF16A34A);

const Map<String, String> _countryFlags = {
  'algeria': '🇩🇿',
  'argentina': '🇦🇷',
  'australia': '🇦🇺',
  'bangladesh': '🇧🇩',
  'belgium': '🇧🇪',
  'benin': '🇧🇯',
  'brazil': '🇧🇷',
  'burkina faso': '🇧🇫',
  'cameroon': '🇨🇲',
  'canada': '🇨🇦',
  'china': '🇨🇳',
  'colombia': '🇨🇴',
  'congo': '🇨🇬',
  "cote d'ivoire": '🇨🇮',
  "côte d'ivoire": '🇨🇮',
  'croatia': '🇭🇷',
  'dr congo': '🇨🇩',
  'drc': '🇨🇩',
  'egypt': '🇪🇬',
  'france': '🇫🇷',
  'gabon': '🇬🇦',
  'germany': '🇩🇪',
  'guinea': '🇬🇳',
  'haiti': '🇭🇹',
  'india': '🇮🇳',
  'italy': '🇮🇹',
  'ivory coast': '🇨🇮',
  'japan': '🇯🇵',
  'kenya': '🇰🇪',
  'lebanon': '🇱🇧',
  'madagascar': '🇲🇬',
  'mali': '🇲🇱',
  'mauritania': '🇲🇷',
  'mexico': '🇲🇽',
  'morocco': '🇲🇦',
  'netherlands': '🇳🇱',
  'niger': '🇳🇪',
  'nigeria': '🇳🇬',
  'pakistan': '🇵🇰',
  'philippines': '🇵🇭',
  'poland': '🇵🇱',
  'portugal': '🇵🇹',
  'qatar': '🇶🇦',
  'romania': '🇷🇴',
  'rwanda': '🇷🇼',
  'saudi arabia': '🇸🇦',
  'senegal': '🇸🇳',
  'south africa': '🇿🇦',
  'south korea': '🇰🇷',
  'spain': '🇪🇸',
  'switzerland': '🇨🇭',
  'togo': '🇹🇬',
  'tunisia': '🇹🇳',
  'turkey': '🇹🇷',
  'uae': '🇦🇪',
  'united arab emirates': '🇦🇪',
  'uk': '🇬🇧',
  'united kingdom': '🇬🇧',
  'usa': '🇺🇸',
  'united states': '🇺🇸',
  'vietnam': '🇻🇳',
};

String _countryFlag(String country) => _countryFlags[country.trim().toLowerCase()] ?? '';

String _capitalizeFirst(String raw) {
  final s = raw.trim();
  if (s.isEmpty) return '-';
  return s[0].toUpperCase() + s.substring(1);
}

bool _isLongText(String raw, [int limit = 32]) {
  final s = raw.trim();
  return s.length > limit || s.contains('\n');
}

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
  final Map<String, bool> _collapsed = {};
  bool _busy = false;
  bool _notesDirty = false;

  int get _id => J.i(_d['id']);
  String get _status => J.s(_d['status']);

  void _toggleSection(String key) => setState(() => _collapsed[key] = !(_collapsed[key] ?? false));

  @override
  void didUpdateWidget(covariant DemoDetailPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.request['id'] != oldWidget.request['id']) {
      _d = Map.of(widget.request);
      _notes.text = J.s(widget.request['notes']);
      _notesDirty = false;
      _collapsed.clear();
    }
  }

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

  Future<void> _openStatusSheet() async {
    final fr = context.isFrench;
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.pureWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(18))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                fr ? 'Mettre à jour le statut' : 'Update request status',
                style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: _brandInk),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final s in Demo.statuses)
                    ChoiceChip(
                      label: Text(Demo.statusLabel(s, fr)),
                      selected: _status == s,
                      selectedColor: Demo.statusColor(s).withValues(alpha: 0.14),
                      side: BorderSide(color: _status == s ? Demo.statusColor(s) : AppColors.border),
                      labelStyle: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: _status == s ? Demo.statusColor(s) : AppColors.text,
                      ),
                      showCheckmark: false,
                      onSelected: (_) => Navigator.of(ctx).pop(s),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    if (!mounted || picked == null || picked == _status) return;
    if (picked == 'demo_scheduled') {
      await _schedule();
    } else {
      await _setStatus(picked);
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
        return (fr ? 'Demander dispos' : 'Ask availability', Icons.send_outlined, _askAvailability);
      case 'contacted':
        return (fr ? 'Planifier' : 'Schedule demo', Icons.event, () => _schedule());
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
    final created = J.date(d['created_at']);
    final teacher = J.name(d, first: 'teacher_first_name', last: 'teacher_last_name');
    final isExam = J.s(d['interest']) == 'exam';
    final email = J.s(d['email']);
    final rawPhone = J.s(d['phone']);
    final waDigits = rawPhone.replaceAll(RegExp(r'\D'), '');
    final country = J.s(d['country']);
    final tzName = J.s(d['timezone']);
    final levelFrom = J.s(d['current_level']);
    final levelTo = J.s(d['interested_level']);
    final levelText = levelTo.isNotEmpty
        ? '${levelFrom.isEmpty ? '-' : levelFrom} → ${fr ? 'vise' : 'wants'} $levelTo'
        : (levelFrom.isEmpty ? '-' : levelFrom);
    final studyMethod = J.s(d['previous_study_method']);
    final wantsStart = J.s(d['expected_start_time']);
    final availabilityPref = J.s(d['preferred_schedule']);
    final goals = J.s(d['learning_goals']);
    final expectations = J.s(d['expectations']);

    final showSecondarySchedule = _status != 'completed' && _status != 'cancelled' && next?.$2 != Icons.event;

    return ColoredBox(
      color: AppColors.pureWhite,
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                // ── Centered hero header ──
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Color(0xFFF3F7FC), AppColors.pureWhite],
                      stops: [0.0, 0.9],
                    ),
                    border: Border(bottom: BorderSide(color: Color(0xFFF1F4F9))),
                  ),
                  padding: const EdgeInsets.fromLTRB(18, 14, 14, 18),
                  child: Column(
                    children: [
                      Align(
                        alignment: Alignment.centerRight,
                        child: Tooltip(
                          message: MaterialLocalizations.of(context).closeButtonTooltip,
                          child: InkWell(
                            onTap: () => Navigator.of(context).maybePop(),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              width: 34,
                              height: 34,
                              decoration: BoxDecoration(
                                color: AppColors.pureWhite,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.border),
                                boxShadow: [
                                  BoxShadow(color: _brandInk.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 1)),
                                ],
                              ),
                              child: const Icon(Icons.close, size: 17, color: _brandMuted),
                            ),
                          ),
                        ),
                      ),
                      Container(
                        width: 66,
                        height: 66,
                        decoration: BoxDecoration(
                          color: _brandSoft,
                          shape: BoxShape.circle,
                          border: Border.all(color: _brandBorder, width: 2),
                          boxShadow: [
                            BoxShadow(color: _brandNavy.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 3)),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          J.initials(J.s(d['full_name'])),
                          style: AppTypography.titleLarge.copyWith(color: _brandNavy, fontWeight: FontWeight.w800, fontSize: 22),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        J.s(d['full_name']),
                        textAlign: TextAlign.center,
                        style: AppTypography.titleMedium.copyWith(color: _brandInk, fontWeight: FontWeight.w800, fontSize: 19, height: 1.25),
                      ),
                      const SizedBox(height: 5),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.calendar_today_outlined, size: 13, color: _brandSubtle),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              '${fr ? 'Reçue' : 'Received'} ${AdminFmt.dateTime(context, created)}${created != null ? ' · ${AdminFmt.relative(context, created)}' : ''}',
                              textAlign: TextAlign.center,
                              style: AppTypography.bodySmall.copyWith(color: _brandMuted, fontSize: 12.5),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        alignment: WrapAlignment.center,
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _QuickActionChip(
                            icon: Icons.mail_outline,
                            label: fr ? 'E-mail' : 'Email',
                            onTap: email.isEmpty ? null : () => _launch(Uri(scheme: 'mailto', path: email)),
                          ),
                          if (rawPhone.isNotEmpty)
                            _QuickActionChip(
                              icon: Icons.phone_outlined,
                              label: fr ? 'Appeler' : 'Call',
                              onTap: () => _launch(Uri(scheme: 'tel', path: rawPhone.replaceAll(' ', ''))),
                            ),
                          if (waDigits.length >= 7)
                            _QuickActionChip(
                              icon: Icons.chat_outlined,
                              iconColor: _waGreen,
                              label: 'WhatsApp',
                              onTap: () => _launch(Uri.parse('https://wa.me/$waDigits')),
                            ),
                          _QuickActionChip(
                            icon: Icons.copy_outlined,
                            label: fr ? 'Copier' : 'Copy email',
                            onTap: email.isEmpty
                                ? null
                                : () {
                                    Clipboard.setData(ClipboardData(text: email));
                                    adminToast(context, fr ? 'E-mail copié' : 'Email copied');
                                  },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _Progress(d: d),
                ),

                if (scheduled != null) ...[
                  const SizedBox(height: 14),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Container(
                      padding: const EdgeInsets.all(13),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFF3F7FC), AppColors.pureWhite],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _brandBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 50,
                                padding: const EdgeInsets.symmetric(vertical: 7),
                                decoration: BoxDecoration(
                                  color: Demo.passed(d) ? AppColors.textSubtle : _brandNavy,
                                  borderRadius: BorderRadius.circular(11),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      AdminFmt.dayShort(context, scheduled).split(' ').last.toUpperCase(),
                                      style: AppTypography.caption.copyWith(color: Colors.white.withValues(alpha: 0.85), fontWeight: FontWeight.w700, fontSize: 10),
                                    ),
                                    Text(
                                      '${scheduled.day}',
                                      style: AppTypography.titleLarge.copyWith(color: AppColors.pureWhite, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      (Demo.passed(d) ? (fr ? 'DÉMO EFFECTUÉE' : 'DEMO HELD') : (fr ? 'DÉMO PLANIFIÉE' : 'DEMO SCHEDULED')),
                                      style: AppTypography.caption.copyWith(color: _brandNavy, fontWeight: FontWeight.w800, letterSpacing: 0.6, fontSize: 10.5),
                                    ),
                                    const SizedBox(height: 2),
                                    Text('${AdminFmt.weekdayDay(context, scheduled)} · ${AdminFmt.time(context, scheduled)}',
                                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: _brandInk)),
                                    if (teacher.isNotEmpty)
                                      Text(fr ? 'avec $teacher' : 'with $teacher', style: AppTypography.caption.copyWith(color: _brandMuted)),
                                    if (tzName.isNotEmpty)
                                      Text(fr ? 'Fuseau : $tzName' : 'Their timezone: $tzName', style: AppTypography.caption.copyWith(color: _brandMuted)),
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
                                  child: Text(J.s(d['meeting_link']),
                                      style: AppTypography.caption.copyWith(color: _brandNavy, fontWeight: FontWeight.w600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis),
                                ),
                                IconButton(
                                  tooltip: fr ? 'Copier' : 'Copy',
                                  icon: const Icon(Icons.copy, size: 17, color: _brandNavy),
                                  onPressed: () {
                                    Clipboard.setData(ClipboardData(text: J.s(d['meeting_link'])));
                                    adminToast(context, fr ? 'Lien copié' : 'Link copied');
                                  },
                                ),
                                IconButton(
                                  tooltip: fr ? 'Ouvrir' : 'Open',
                                  icon: const Icon(Icons.open_in_new, size: 17, color: _brandNavy),
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
                                  if (J.s(lm['code']).isNotEmpty) Pill('ID: ${J.s(lm['code'])}', color: _brandNavy),
                                  if (J.s(lm['passcode']).isNotEmpty) Pill('Pass: ${J.s(lm['passcode'])}', color: AppColors.good),
                                ],
                              );
                            }),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],

                // ── Availability Workflow highlight card ──
                const SizedBox(height: 14),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Builder(builder: (context) {
                    final avRaw = d['latest_availability'];
                    final hasAv = avRaw is Map;
                    final av = hasAv ? J.map(avRaw) : <String, dynamic>{};
                    final avStatus = hasAv ? J.s(av['status']) : '';
                    final subText = !hasAv
                        ? (fr ? 'Aucun lien envoyé.' : 'No availability link sent yet.')
                        : avStatus == 'submitted'
                            ? (fr ? 'Créneaux proposés reçus.' : 'Prospect submitted preferred times.')
                            : avStatus == 'pending'
                                ? (fr ? 'En attente de réponse.' : 'Waiting for prospect response.')
                                : Demo.availabilityLabel(avStatus, fr);
                    final canAsk = _status != 'completed' && _status != 'cancelled';
                    final askBtn = canAsk
                        ? OutlinedButton.icon(
                            onPressed: _busy ? null : _askAvailability,
                            icon: const Icon(Icons.send_outlined, size: 15),
                            label: Text(hasAv ? (fr ? 'Nouveau lien' : 'Send new link') : (fr ? 'Demander dispos' : 'Ask for availability')),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: _brandNavy,
                              backgroundColor: AppColors.pureWhite,
                              side: const BorderSide(color: _brandBorder),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              minimumSize: const Size(0, 34),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                              textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, fontSize: 12.5),
                            ),
                          )
                        : null;

                    return Container(
                      padding: const EdgeInsets.all(13),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF4F7FB),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFDCE5F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LayoutBuilder(builder: (context, c) {
                            final lead = Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFE5EDF7),
                                    borderRadius: BorderRadius.circular(11),
                                    border: Border.all(color: const Color(0xFFD0DEEE)),
                                  ),
                                  child: const Icon(Icons.event_available_outlined, size: 19, color: _brandNavy),
                                ),
                                const SizedBox(width: 11),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        fr ? 'Disponibilités' : 'Availability Workflow',
                                        style: AppTypography.titleSmall.copyWith(fontSize: 13.5, fontWeight: FontWeight.w800, color: _brandInk),
                                      ),
                                      const SizedBox(height: 1),
                                      Text(
                                        subText,
                                        style: AppTypography.caption.copyWith(color: _brandMuted, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            );
                            if (askBtn == null) return lead;
                            if (c.maxWidth < 360) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [lead, const SizedBox(height: 10), askBtn],
                              );
                            }
                            return Row(
                              children: [
                                Expanded(child: lead),
                                const SizedBox(width: 10),
                                askBtn,
                              ],
                            );
                          }),
                          if (hasAv && avStatus == 'submitted') ...[
                            const SizedBox(height: 11),
                            Builder(builder: (context) {
                              final slots = av['submitted_slots'] is List
                                  ? (av['submitted_slots'] as List).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList()
                                  : <Map<String, dynamic>>[];
                              return Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.goodBg,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.goodBorder),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 4,
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      children: [
                                        Pill(Demo.availabilityLabel(avStatus, fr), color: AppColors.good, icon: Icons.check_circle_outline),
                                        if (J.s(av['submitted_timezone']).isNotEmpty)
                                          Text(J.s(av['submitted_timezone']), style: AppTypography.caption.copyWith(color: const Color(0xFF065F46))),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    for (final sl in slots)
                                      Container(
                                        margin: const EdgeInsets.only(bottom: 6),
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                                        decoration: BoxDecoration(
                                          color: AppColors.pureWhite,
                                          borderRadius: BorderRadius.circular(8),
                                          border: Border.all(color: const Color(0xFFD1FAE5)),
                                        ),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                Demo.formatSlot(sl, fr: fr),
                                                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: _brandInk),
                                              ),
                                            ),
                                            if (canAsk)
                                              FilledButton(
                                                onPressed: () => _schedule(sl),
                                                style: FilledButton.styleFrom(
                                                  backgroundColor: _brandNavy,
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                  minimumSize: const Size(0, 30),
                                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(7)),
                                                  textStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: Colors.white),
                                                ),
                                                child: Text(fr ? 'Planifier' : 'Schedule'),
                                              ),
                                          ],
                                        ),
                                      ),
                                    if (J.s(av['submitted_note']).isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text(
                                          '${fr ? 'Note' : 'Prospect note'}: ${J.s(av['submitted_note'])}',
                                          style: AppTypography.bodySmall.copyWith(color: const Color(0xFF065F46), height: 1.45),
                                        ),
                                      ),
                                  ],
                                ),
                              );
                            }),
                          ] else if (hasAv) ...[
                            const SizedBox(height: 11),
                            Builder(builder: (context) {
                              final proposed = Demo.proposedSlots(av);
                              return Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: const Color(0xFFDBE4F0)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 4,
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      children: [
                                        Pill(Demo.availabilityLabel(avStatus, fr), color: _brandNavy),
                                        if (J.s(av['proposed_timezone']).isNotEmpty)
                                          Text(J.s(av['proposed_timezone']), style: AppTypography.caption.copyWith(color: _brandMuted)),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    if (proposed.isNotEmpty)
                                      for (final sl in proposed)
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 4),
                                          child: Text(
                                            Demo.formatSlot(sl, fr: fr),
                                            style: AppTypography.bodySmall.copyWith(color: _brandInk, fontWeight: FontWeight.w600),
                                          ),
                                        )
                                    else
                                      Text(
                                        '${J.s(av['proposed_start_date'])} to ${J.s(av['proposed_end_date'])} · ${J.s(av['proposed_time_start'])} - ${J.s(av['proposed_time_end'])}',
                                        style: AppTypography.bodySmall.copyWith(color: _brandInk, fontWeight: FontWeight.w600),
                                      ),
                                  ],
                                ),
                              );
                            }),
                          ],
                        ],
                      ),
                    );
                  }),
                ),

                // ── Contact collapsible card ──
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _SectionCard(
                    title: 'Contact',
                    icon: Icons.person_outline,
                    collapsed: _collapsed['contact'] ?? false,
                    onToggle: () => _toggleSection('contact'),
                    child: Column(
                      children: [
                        _KvRow(
                          icon: Icons.mail_outline,
                          label: fr ? 'E-mail' : 'Email',
                          valueText: email.isEmpty ? '-' : email,
                          stacked: _isLongText(email, 34),
                        ),
                        _KvRow(
                          icon: Icons.chat_outlined,
                          iconColor: _waGreen,
                          label: 'WhatsApp',
                          valueText: rawPhone.isEmpty ? '-' : rawPhone,
                        ),
                        _KvRow(
                          icon: Icons.location_on_outlined,
                          label: fr ? 'Pays' : 'Country',
                          valueWidget: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_countryFlag(country).isNotEmpty) ...[
                                Text(_countryFlag(country), style: const TextStyle(fontSize: 15)),
                                const SizedBox(width: 6),
                              ],
                              Flexible(
                                child: Text(
                                  country.isEmpty ? '-' : country,
                                  style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: _brandInk, fontSize: 13),
                                  textAlign: TextAlign.right,
                                ),
                              ),
                            ],
                          ),
                        ),
                        _KvRow(
                          icon: Icons.public,
                          label: fr ? 'Fuseau horaire' : 'Timezone',
                          valueText: tzName.isEmpty ? '-' : tzName.replaceAll('_', ' '),
                          stacked: _isLongText(tzName, 30),
                          isLast: true,
                        ),
                      ],
                    ),
                  ),
                ),

                // ── Exam preparation collapsible card (if exam only) ──
                if (isExam) ...[
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _SectionCard(
                      title: fr ? "Préparation d'examen" : 'Exam Preparation',
                      icon: Icons.emoji_events_outlined,
                      collapsed: _collapsed['exam'] ?? false,
                      onToggle: () => _toggleSection('exam'),
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _KvRow(
                              icon: Icons.emoji_events_outlined,
                              label: fr ? 'Examen' : 'Exam',
                              inset: false,
                              valueWidget: _ProfilePill(text: J.s(d['target_exam']).isEmpty ? '-' : J.s(d['target_exam'])),
                            ),
                            _KvRow(
                              icon: Icons.event_outlined,
                              label: fr ? "Date d'examen" : 'Exam date',
                              inset: false,
                              valueText: J.s(d['exam_date']).isEmpty ? (fr ? 'Pas encore réservée' : 'Not booked yet') : AdminFmt.day(context, J.date(d['exam_date'])),
                            ),
                            _KvRow(
                              icon: Icons.flag_outlined,
                              label: fr ? 'Score visé' : 'Score needed',
                              inset: false,
                              valueWidget: _ProfilePill(text: J.s(d['target_score']).isEmpty ? '-' : J.s(d['target_score'])),
                            ),
                            _KvRow(
                              icon: Icons.star_outline,
                              label: fr ? 'Déjà passé' : 'Sat it before',
                              inset: false,
                              isLast: Demo.skillsLabel(J.s(d['skills']), fr).isEmpty,
                              valueText: Demo.hadExperience(d['has_previous_experience']) ? (fr ? 'Oui' : 'Yes') : (fr ? 'Pas encore' : 'Not yet'),
                            ),
                            if (Demo.skillsLabel(J.s(d['skills']), fr).isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: [
                                  for (final p in Demo.skillsLabel(J.s(d['skills']), fr).split(' · '))
                                    _ProfilePill(text: p),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ],

                // ── Learning Profile collapsible card ──
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _SectionCard(
                    title: fr ? 'Profil d’apprentissage' : 'Learning Profile',
                    icon: Icons.school_outlined,
                    collapsed: _collapsed['profile'] ?? false,
                    onToggle: () => _toggleSection('profile'),
                    child: Column(
                      children: [
                        _KvRow(
                          icon: Icons.track_changes_outlined,
                          label: fr ? 'Recherche' : 'Looking for',
                          valueWidget: _ProfilePill(
                            icon: isExam ? Icons.emoji_events_outlined : Icons.videocam_outlined,
                            text: Demo.interestLabel(J.s(d['interest']), fr).isEmpty
                                ? (fr ? 'Cours en direct' : 'Live classes')
                                : Demo.interestLabel(J.s(d['interest']), fr),
                          ),
                        ),
                        _KvRow(
                          icon: Icons.bar_chart,
                          label: fr ? 'Niveau' : 'Level',
                          stacked: _isLongText(levelText, 26),
                          valueWidget: _ProfilePill(icon: Icons.bar_chart, text: levelText),
                        ),
                        _KvRow(
                          icon: Icons.star_outline,
                          label: fr ? 'Expérience' : 'Experience',
                          stacked: _isLongText(
                            Demo.hadExperience(d['has_previous_experience'])
                                ? (fr ? 'A déjà étudié le français' : 'Has studied French before')
                                : (fr ? 'Première fois' : 'First time learning'),
                            28,
                          ),
                          isLast: studyMethod.isEmpty && wantsStart.isEmpty && availabilityPref.isEmpty,
                          valueWidget: _ProfilePill(
                            icon: Icons.star,
                            text: Demo.hadExperience(d['has_previous_experience'])
                                ? (fr ? 'A déjà étudié le français' : 'Has studied French before')
                                : (fr ? 'Première fois' : 'First time learning'),
                          ),
                        ),
                        if (studyMethod.isNotEmpty)
                          _KvRow(
                            icon: Icons.account_balance_outlined,
                            label: fr ? 'A étudié avec' : 'Studied with',
                            stacked: _isLongText(studyMethod, 26),
                            isLast: wantsStart.isEmpty && availabilityPref.isEmpty,
                            valueWidget: _isLongText(studyMethod, 26)
                                ? _LongTextBlock(text: studyMethod)
                                : _ProfilePill(icon: Icons.account_balance_outlined, text: _capitalizeFirst(studyMethod)),
                          ),
                        if (wantsStart.isNotEmpty)
                          _KvRow(
                            icon: Icons.schedule,
                            label: fr ? 'Veut commencer' : 'Wants to start',
                            stacked: _isLongText(wantsStart, 26),
                            isLast: availabilityPref.isEmpty,
                            valueWidget: _isLongText(wantsStart, 26)
                                ? _LongTextBlock(text: wantsStart)
                                : _ProfilePill(text: _capitalizeFirst(wantsStart)),
                          ),
                        if (availabilityPref.isNotEmpty)
                          _KvRow(
                            icon: Icons.calendar_today_outlined,
                            label: fr ? 'Disponibilités' : 'Availability',
                            stacked: _isLongText(availabilityPref, 26),
                            isLast: true,
                            valueWidget: _isLongText(availabilityPref, 26)
                                ? _LongTextBlock(text: availabilityPref)
                                : _ProfilePill(text: _capitalizeFirst(availabilityPref)),
                          ),
                      ],
                    ),
                  ),
                ),

                // ── Goals & Expectations collapsible card ──
                if (goals.isNotEmpty || expectations.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _SectionCard(
                      title: fr ? 'Objectifs et attentes' : 'Goals & Expectations',
                      icon: Icons.track_changes_outlined,
                      collapsed: _collapsed['goals'] ?? false,
                      onToggle: () => _toggleSection('goals'),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (goals.isNotEmpty) _EditorialQuote(label: fr ? 'Objectifs' : 'Goals', text: goals),
                            if (goals.isNotEmpty && expectations.isNotEmpty) const SizedBox(height: 10),
                            if (expectations.isNotEmpty) _EditorialQuote(label: fr ? 'Attentes' : 'Expectations', text: expectations),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],

                // ── Internal Notes collapsible card ──
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _SectionCard(
                    title: fr ? 'Notes internes' : 'Internal Notes',
                    icon: Icons.sticky_note_2_outlined,
                    collapsed: _collapsed['notes'] ?? false,
                    onToggle: () => _toggleSection('notes'),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextField(
                            controller: _notes,
                            maxLines: 5,
                            minLines: 3,
                            style: AppTypography.bodyMedium.copyWith(height: 1.5, color: _brandInk),
                            decoration: adminInputDecoration(fr ? 'Notes visibles des admins seulement' : 'Only admins see these notes'),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _notesDirty
                                    ? (fr ? 'Modifications non enregistrées' : 'Unsaved changes')
                                    : (J.s(d['notes']).isNotEmpty ? (fr ? 'Enregistré' : 'Saved') : ''),
                                style: AppTypography.caption.copyWith(color: _brandSubtle),
                              ),
                              FilledButton(
                                onPressed: _busy || !_notesDirty ? null : () => _setStatus(_status, notes: _notes.text),
                                style: FilledButton.styleFrom(
                                  backgroundColor: _brandNavy,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                                  minimumSize: const Size(0, 34),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  textStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                                ),
                                child: Text(fr ? 'Enregistrer' : 'Save notes'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Sticky Bottom Footer Action Bar ──
          Container(
            decoration: const BoxDecoration(
              color: AppColors.pureWhite,
              border: Border(top: BorderSide(color: Color(0xFFE4E8F0))),
            ),
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
            child: SafeArea(
              top: false,
              child: LayoutBuilder(builder: (context, c) {
                final primaryBtn = next != null
                    ? FilledButton.icon(
                        onPressed: _busy ? null : next.$3,
                        icon: _busy
                            ? const SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Icon(next.$2, size: 17),
                        label: Text(next.$1, overflow: TextOverflow.ellipsis, maxLines: 1),
                        style: FilledButton.styleFrom(
                          backgroundColor: _brandNavy,
                          foregroundColor: AppColors.pureWhite,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          minimumSize: const Size(0, 42),
                          textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, fontSize: 13.5),
                        ),
                      )
                    : null;

                final scheduleBtn = showSecondarySchedule
                    ? OutlinedButton.icon(
                        onPressed: _busy ? null : () => _schedule(),
                        icon: const Icon(Icons.calendar_today_outlined, size: 16),
                        label: Text(scheduled != null ? (fr ? 'Replanifier' : 'Reschedule') : (fr ? 'Planifier' : 'Schedule')),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _brandInk,
                          side: const BorderSide(color: Color(0xFFDCE2EA)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          minimumSize: const Size(0, 42),
                          textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      )
                    : null;

                final statusBtn = OutlinedButton.icon(
                  onPressed: _busy ? null : _openStatusSheet,
                  icon: const Icon(Icons.edit_outlined, size: 16),
                  label: Text(fr ? 'Statut' : 'Status'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: _brandInk,
                    side: const BorderSide(color: Color(0xFFDCE2EA)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    minimumSize: const Size(0, 42),
                    textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                );

                final deleteBtn = Tooltip(
                  message: fr ? 'Supprimer la demande' : 'Delete request',
                  child: InkWell(
                    onTap: _busy ? null : _delete,
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: _brandCrimsonBorder),
                      ),
                      child: const Icon(Icons.delete_outline, size: 19, color: _brandCrimson),
                    ),
                  ),
                );

                if (c.maxWidth >= 420) {
                  return Row(
                    children: [
                      if (primaryBtn != null) ...[
                        Expanded(child: primaryBtn),
                        const SizedBox(width: 8),
                      ],
                      if (scheduleBtn != null) ...[
                        scheduleBtn,
                        const SizedBox(width: 8),
                      ],
                      if (primaryBtn == null && scheduleBtn == null)
                        Expanded(child: statusBtn)
                      else
                        statusBtn,
                      const SizedBox(width: 8),
                      deleteBtn,
                    ],
                  );
                }

                return Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        if (primaryBtn != null)
                          Expanded(child: primaryBtn)
                        else
                          Expanded(child: statusBtn),
                        const SizedBox(width: 8),
                        if (primaryBtn != null && scheduleBtn == null) ...[
                          statusBtn,
                          const SizedBox(width: 8),
                        ],
                        deleteBtn,
                      ],
                    ),
                    if (primaryBtn != null && scheduleBtn != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(child: scheduleBtn),
                          const SizedBox(width: 8),
                          Expanded(child: statusBtn),
                        ],
                      ),
                    ],
                  ],
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickActionChip extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String label;
  final VoidCallback? onTap;

  const _QuickActionChip({required this.icon, this.iconColor, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFDCE3EC)),
            boxShadow: [
              BoxShadow(color: _brandInk.withValues(alpha: 0.04), blurRadius: 3, offset: const Offset(0, 1)),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 15, color: iconColor ?? _brandMuted),
              const SizedBox(width: 6),
              Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: _brandInk, fontSize: 12.5)),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool collapsed;
  final VoidCallback onToggle;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.icon,
    required this.collapsed,
    required this.onToggle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: onToggle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 11),
              decoration: BoxDecoration(
                color: _brandCardHead,
                border: collapsed ? null : const Border(bottom: BorderSide(color: Color(0xFFEEF2F6))),
              ),
              child: Row(
                children: [
                  Icon(icon, size: 17, color: _brandNavy),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Text(title, style: AppTypography.titleSmall.copyWith(fontSize: 13.5, fontWeight: FontWeight.w800, color: _brandInk)),
                  ),
                  Icon(collapsed ? Icons.keyboard_arrow_down : Icons.keyboard_arrow_up, size: 20, color: _brandMuted),
                ],
              ),
            ),
          ),
          if (!collapsed) child,
        ],
      ),
    );
  }
}

class _KvRow extends StatelessWidget {
  final IconData icon;
  final Color? iconColor;
  final String label;
  final String? valueText;
  final Widget? valueWidget;
  final bool stacked;
  final bool isLast;
  final bool inset;

  const _KvRow({
    required this.icon,
    this.iconColor,
    required this.label,
    this.valueText,
    this.valueWidget,
    this.stacked = false,
    this.isLast = false,
    this.inset = true,
  });

  @override
  Widget build(BuildContext context) {
    final labelRow = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: iconColor ?? _brandSubtle),
        const SizedBox(width: 9),
        Text(label, style: AppTypography.bodySmall.copyWith(color: _brandMuted, fontSize: 12.5)),
      ],
    );
    final valueChild = valueWidget ??
        Text(
          valueText ?? '-',
          textAlign: stacked ? TextAlign.left : TextAlign.right,
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: _brandInk, fontSize: 13),
        );

    return Container(
      padding: EdgeInsets.symmetric(horizontal: inset ? 15 : 0, vertical: 11),
      decoration: BoxDecoration(
        border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFF1F4F9))),
      ),
      child: stacked
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                labelRow,
                const SizedBox(height: 7),
                Align(alignment: Alignment.centerLeft, child: valueChild),
              ],
            )
          : Row(
              children: [
                labelRow,
                const SizedBox(width: 12),
                Expanded(child: Align(alignment: Alignment.centerRight, child: valueChild)),
              ],
            ),
    );
  }
}

class _ProfilePill extends StatelessWidget {
  final IconData? icon;
  final String text;

  const _ProfilePill({this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: _brandSoft,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFD5E2F1)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: _brandNavy),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Text(
              text,
              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: _brandNavy, fontSize: 12.5),
            ),
          ),
        ],
      ),
    );
  }
}

class _LongTextBlock extends StatelessWidget {
  final String text;
  const _LongTextBlock({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: const Color(0xFFFAF9F6),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE7E4DC)),
      ),
      child: Text(
        text,
        style: AppTypography.bodyMedium.copyWith(fontSize: 13, fontWeight: FontWeight.w500, height: 1.55, color: _brandInk),
      ),
    );
  }
}

class _EditorialQuote extends StatelessWidget {
  final String label;
  final String text;
  const _EditorialQuote({required this.label, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: const BoxDecoration(
        color: Color(0xFFFAF9F6),
        border: Border(left: BorderSide(color: _brandNavy, width: 3)),
        borderRadius: BorderRadius.only(topRight: Radius.circular(10), bottomRight: Radius.circular(10)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: AppTypography.caption.copyWith(color: _brandNavy, fontWeight: FontWeight.w800, letterSpacing: 0.6, fontSize: 11),
          ),
          const SizedBox(height: 4),
          Text(text, style: AppTypography.bodyMedium.copyWith(fontSize: 13, height: 1.55, color: _brandInk)),
        ],
      ),
    );
  }
}

/// New -> contacted -> scheduled -> completed, with step numbers and dates.
class _Progress extends StatelessWidget {
  final Map<String, dynamic> d;
  const _Progress({required this.d});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final status = J.s(d['status']);
    if (status == 'cancelled') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
        child: Text(fr ? 'Cette demande a été annulée.' : 'This request was cancelled.', style: AppTypography.bodySmall.copyWith(color: _brandMuted)),
      );
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
                    Expanded(child: Container(height: 2, color: i == 0 ? Colors.transparent : (i <= at ? _brandNavy.withValues(alpha: 0.45) : const Color(0xFFE5EBF3)))),
                    Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: i == at ? _brandNavy : (i < at ? const Color(0xFFE6EEF8) : const Color(0xFFEEF2F6)),
                        shape: BoxShape.circle,
                        boxShadow: i == at
                            ? [const BoxShadow(color: Color(0xFFE6EEF8), spreadRadius: 4, blurRadius: 0)]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: i < at
                          ? const Icon(Icons.check, size: 14, color: _brandNavy)
                          : Text(
                              '${i + 1}',
                              style: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w800,
                                fontSize: 11.5,
                                color: i == at ? AppColors.pureWhite : _brandMuted,
                              ),
                            ),
                    ),
                    Expanded(child: Container(height: 2, color: i == steps.length - 1 ? Colors.transparent : (i < at ? _brandNavy.withValues(alpha: 0.45) : const Color(0xFFE5EBF3)))),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  Demo.statusLabel(steps[i], fr),
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 11.5, color: i <= at ? _brandInk : _brandSubtle),
                ),
                Text(
                  i <= at && dates[steps[i]] != null ? AdminFmt.dayShort(context, dates[steps[i]]) : '-',
                  style: AppTypography.caption.copyWith(fontSize: 10.5, color: _brandSubtle),
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
  late String _tz;
  late DateTime? _at;
  int? _selectedSlotIdx;
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

  String? get _profileTz {
    if (!ref.exists(authNotifierProvider)) return null;
    final raw = J.s(ref.read(authNotifierProvider).user?.timezone).trim();
    return ScheduleTz.isValid(raw) ? raw : null;
  }

  String? get _prospectTz {
    final av = widget.request['latest_availability'];
    if (av is Map) {
      final subTz = J.s(av['submitted_timezone']).trim();
      if (ScheduleTz.isValid(subTz)) return subTz;
    }
    final reqTz = J.s(widget.request['timezone']).trim();
    return ScheduleTz.isValid(reqTz) ? reqTz : null;
  }

  List<Map<String, dynamic>> _submittedSlots() {
    final av = widget.request['latest_availability'];
    if (av is Map && J.s(av['status']) == 'submitted' && av['submitted_slots'] is List) {
      return (av['submitted_slots'] as List).whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return const [];
  }

  DateTime? _parseSubmittedSlotWallClock(Map<String, dynamic> slot) {
    final d = J.s(slot['date']);
    final s = J.s(slot['start']);
    final parsed = DateTime.tryParse('${d}T$s:00');
    if (parsed == null) return null;
    final av = widget.request['latest_availability'];
    final sourceTz = av is Map ? J.s(av['submitted_timezone']).trim() : '';
    final validSrc = ScheduleTz.isValid(sourceTz) ? sourceTz : _tz;
    return ScheduleTz.convertWallClock(parsed, validSrc, _tz);
  }

  @override
  void initState() {
    super.initState();
    _tz = ScheduleTz.defaultZone(_profileTz, fallbackTz: _prospectTz);
    final submitted = _submittedSlots();
    if (widget.prefillSlot != null) {
      final idx = submitted.indexWhere(
        (s) =>
            J.s(s['date']) == J.s(widget.prefillSlot!['date']) &&
            J.s(s['start']) == J.s(widget.prefillSlot!['start']) &&
            J.s(s['end']) == J.s(widget.prefillSlot!['end']),
      );
      _selectedSlotIdx = idx >= 0 ? idx : null;
    } else if (submitted.isNotEmpty) {
      _selectedSlotIdx = 0;
    }
    _at = _initialDateTime(submitted);
    _hostId = ref.exists(authNotifierProvider) ? ref.read(authNotifierProvider).user?.id : null;
    _loadHosts();
  }

  DateTime? _initialDateTime(List<Map<String, dynamic>> submitted) {
    final slot = widget.prefillSlot ?? (submitted.isNotEmpty ? submitted.first : null);
    if (slot != null) {
      final converted = _parseSubmittedSlotWallClock(slot);
      if (converted != null) return converted;
    }
    final existing = J.date(widget.request['demo_scheduled_at']);
    return existing == null ? null : ScheduleTz.utcToWallClock(existing, _tz);
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
    final nowWall = ScheduleTz.utcToWallClock(DateTime.now().toUtc(), _tz);
    final base = _at ?? DateTime(nowWall.year, nowWall.month, nowWall.day + 1, 10);
    final day = await showDatePicker(
      context: context,
      initialDate: base.isBefore(nowWall) ? nowWall : base,
      firstDate: DateTime(nowWall.year - 1),
      lastDate: DateTime(nowWall.year + 2),
    );
    if (day == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(base));
    if (time == null) return;
    setState(() {
      _selectedSlotIdx = null;
      _at = DateTime(day.year, day.month, day.day, time.hour, time.minute);
    });
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
      final startUtc = ScheduleTz.wallClockToUtc(_at!, _tz);
      if (_platformMode) {
        final endUtc = startUtc.add(Duration(minutes: _durationMin));
        await client.post('/demo-requests/${J.i(widget.request['id'])}/schedule-meeting', data: {
          'scheduled_start': startUtc.toIso8601String(),
          'scheduled_end': endUtc.toIso8601String(),
          'host_timezone': _tz,
          'title': _title.text.trim(),
          'host_id': _hostId,
          'require_approval': _requireApproval,
          if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
        });
        if (!mounted) return;
        adminToast(context, fr ? 'Réunion créée et lien envoyé au prospect' : 'Meeting scheduled and link emailed');
      } else {
        await client.patch('/demo-requests/${J.i(widget.request['id'])}/schedule', data: {
          'demo_scheduled_at': startUtc.toIso8601String(),
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
    final prospectTz = _prospectTz;
    final startUtc = _at == null ? null : ScheduleTz.wallClockToUtc(_at!, _tz);

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
          Builder(builder: (context) {
            final submitted = _submittedSlots();
            if (submitted.isEmpty) return const SizedBox.shrink();
            final avTz = J.s(r['latest_availability'] is Map ? r['latest_availability']['submitted_timezone'] : null);
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AdminCard(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fr
                          ? 'Créneaux proposés${avTz.isNotEmpty ? ' ($avTz)' : ''}'
                          : 'Submitted availability${avTz.isNotEmpty ? ' ($avTz)' : ''}',
                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        for (var i = 0; i < submitted.length; i++)
                          ChoiceChip(
                            label: Text(Demo.formatSlot(submitted[i], fr: fr)),
                            selected: _selectedSlotIdx == i,
                            selectedColor: AppColors.adminAccentBg,
                            side: BorderSide(color: _selectedSlotIdx == i ? AppColors.adminAccent : AppColors.border),
                            labelStyle: AppTypography.caption.copyWith(
                              fontWeight: FontWeight.w700,
                              color: _selectedSlotIdx == i ? AppColors.adminAccent : AppColors.text,
                            ),
                            onSelected: (_) {
                              final converted = _parseSubmittedSlotWallClock(submitted[i]);
                              setState(() {
                                _selectedSlotIdx = i;
                                if (converted != null) _at = converted;
                              });
                            },
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
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
              child: Text(
                _at == null ? (fr ? 'Choisir' : 'Pick') : ScheduleTz.formatWallClock(_at!, _tz, fr: fr),
                style: AppTypography.bodyMedium,
              ),
            ),
          ),
          const SizedBox(height: 12),
          TimezonePickerField(
            value: _tz,
            label: fr ? 'Fuseau horaire de la planification' : 'Scheduling timezone',
            suggestedZone: prospectTz,
            suggestedLabel: fr ? 'Fuseau du prospect' : 'Prospect timezone',
            profileZone: _profileTz,
            onChanged: (v) => setState(() => _tz = v),
          ),
          if (_at != null && startUtc != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: _brandSoft,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _brandBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.schedule, size: 15, color: _brandNavy),
                      const SizedBox(width: 7),
                      Expanded(
                        child: Text(
                          '${fr ? 'Heure choisie' : 'Selected time'} (${ScheduleTz.displayName(_tz)}): ${ScheduleTz.formatWallClock(_at!, _tz, fr: fr)}',
                          style: AppTypography.caption.copyWith(color: _brandNavy, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  if (prospectTz != null && prospectTz != _tz) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.person_outline, size: 15, color: _brandMuted),
                        const SizedBox(width: 7),
                        Expanded(
                          child: Text(
                            '${fr ? 'Heure locale du prospect' : 'Prospect local time'} (${ScheduleTz.displayName(prospectTz)}): ${ScheduleTz.formatInstantInZone(startUtc, prospectTz, fr: fr)}',
                            style: AppTypography.caption.copyWith(color: _brandMuted, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
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
  late String _tz = ScheduleTz.defaultZone(
    ref.exists(authNotifierProvider) ? ref.read(authNotifierProvider).user?.timezone : null,
  );
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
    final prospectTzRaw = J.s(widget.request['timezone']).trim();
    final prospectTz = ScheduleTz.isValid(prospectTzRaw) ? prospectTzRaw : null;
    final profileTzRaw = ref.exists(authNotifierProvider) ? J.s(ref.read(authNotifierProvider).user?.timezone).trim() : '';
    final profileTz = ScheduleTz.isValid(profileTzRaw) ? profileTzRaw : null;
    return AdminPanel(
      title: fr ? 'Demander les disponibilités' : 'Ask for availability',
      subtitle: '${J.s(widget.request['full_name'])} · ${J.s(widget.request['email'])}',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _sending ? null : () => Navigator.of(context).pop(false)),
        AdminButton(fr ? 'Envoyer le lien' : 'Send link', icon: Icons.send, busy: _sending, onPressed: _send),
      ],
      children: [
        const SizedBox(height: 8),
        TimezonePickerField(
          value: _tz,
          label: fr ? 'Fuseau horaire de ces créneaux' : 'Timezone for these options',
          suggestedZone: prospectTz,
          suggestedLabel: fr ? 'Fuseau du prospect' : 'Prospect timezone',
          profileZone: profileTz,
          onChanged: (v) => setState(() => _tz = v),
        ),
        const SizedBox(height: 12),
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
