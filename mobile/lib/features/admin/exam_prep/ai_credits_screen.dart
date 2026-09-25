import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'assignments.dart';
import 'exam_common.dart';

/// AI correction credits for Expression Écrite and Expression Orale: who has
/// how many, granting to many people at once, and revoking.
class AiCreditsScreen extends ConsumerStatefulWidget {
  const AiCreditsScreen({super.key});

  @override
  ConsumerState<AiCreditsScreen> createState() => _AiCreditsScreenState();
}

class _AiCreditsScreenState extends ConsumerState<AiCreditsScreen> {
  List<Map<String, dynamic>> _balances = [];
  bool _loading = true;
  String? _error;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('/ai-credits/balances');
      if (!mounted) return;
      setState(() {
        _balances = J.list(res.data, ['balances']);
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _grant() async {
    final done = await showAdminPanel<bool>(context, builder: (_) => const _GrantPanel());
    if (done == true) _load();
  }

  Future<void> _revoke(Map<String, dynamic> b, String type) async {
    final fr = context.isFrench;
    final what = switch (type) {
      'ee' => fr ? 'les crédits EE' : 'Expression Écrite credits',
      'eo' => fr ? 'les crédits EO' : 'Expression Orale credits',
      _ => fr ? 'tous les crédits IA' : 'all AI credits',
    };
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Retirer $what ?' : 'Revoke $what?',
      message: fr ? '${J.name(b)} ne pourra plus les utiliser.' : '${J.name(b)} will no longer be able to use them.',
      confirmLabel: fr ? 'Retirer' : 'Revoke',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).post('/ai-credits/revoke', data: {'user_id': b['user_id'], 'type': type, 'amount': 'all', 'notes': 'Revoked by admin'});
      if (mounted) adminToast(context, fr ? 'Crédits retirés' : 'Credits revoked');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final holders = _balances.where((b) => J.i(b['ee_credits']) > 0 || J.i(b['eo_credits']) > 0).toList();
    final q = _query.trim().toLowerCase();
    final shown = holders.where((b) => q.isEmpty || '${J.name(b)} ${J.s(b['email'])}'.toLowerCase().contains(q)).toList();
    final ee = holders.fold<int>(0, (t, b) => t + J.i(b['ee_credits']));
    final eo = holders.fold<int>(0, (t, b) => t + J.i(b['eo_credits']));
    return ExamScaffold(
      title: fr ? 'Crédits IA' : 'AI credits',
      subtitle: fr ? 'Corrections automatiques EE et EO' : 'Automatic EE and EO corrections',
      skill: Skill.other,
      fab: ExamFab(fr ? 'Donner des crédits' : 'Grant credits', onPressed: _grant),
      body: ExamBody(
        loading: _loading,
        error: _error,
        onRefresh: _load,
        empty: false,
        emptyState: const SizedBox.shrink(),
        toolbar: AdminSearchField(hint: fr ? 'Rechercher un étudiant' : 'Search a student', onChanged: (v) => setState(() => _query = v)),
        children: [
          AdminGrid(minTileWidth: 150, maxColumns: 3, spacing: 10, children: [
            StatTile(label: fr ? 'Personnes avec crédits' : 'People with credits', value: '${holders.length}', icon: Icons.people_outline),
            StatTile(label: fr ? 'Crédits EE' : 'EE credits', value: '$ee', icon: Icons.edit_note, color: Skill.ee.color),
            StatTile(label: fr ? 'Crédits EO' : 'EO credits', value: '$eo', icon: Icons.record_voice_over_outlined, color: Skill.eo.color),
          ]),
          const SizedBox(height: 14),
          if (shown.isEmpty)
            AdminCard(
              child: AdminEmpty(
                icon: Icons.bolt_outlined,
                title: holders.isEmpty ? (fr ? 'Personne n’a de crédits' : 'Nobody has credits yet') : (fr ? 'Aucun résultat' : 'No results'),
                message: holders.isEmpty ? (fr ? 'Donnez des crédits pour activer la correction par IA.' : 'Grant credits to turn on AI correction.') : null,
              ),
            )
          else
            AdminCard(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Column(children: [
                for (final (i, b) in shown.indexed) ...[
                  if (i > 0) const Divider(height: 1, color: AppColors.borderSoft),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: InitialsAvatar(J.name(b)),
                    title: Text(J.name(b), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(
                      [J.s(b['email']), if (J.s(b['role']) == 'candidate') (fr ? 'candidat' : 'candidate')].where((s) => s.isNotEmpty).join(' · '),
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      Pill('EE ${J.i(b['ee_credits'])}', color: Skill.ee.color),
                      const SizedBox(width: 4),
                      Pill('EO ${J.i(b['eo_credits'])}', color: Skill.eo.color),
                      PopupMenuButton<VoidCallback>(
                        icon: const Icon(Icons.more_vert, color: AppColors.textMuted),
                        onSelected: (a) => a(),
                        itemBuilder: (_) => [
                          if (J.i(b['ee_credits']) > 0) menuItem(Icons.remove_circle_outline, fr ? 'Retirer les crédits EE' : 'Revoke EE credits', () => _revoke(b, 'ee'), danger: true),
                          if (J.i(b['eo_credits']) > 0) menuItem(Icons.remove_circle_outline, fr ? 'Retirer les crédits EO' : 'Revoke EO credits', () => _revoke(b, 'eo'), danger: true),
                          menuItem(Icons.block, fr ? 'Tout retirer' : 'Revoke all', () => _revoke(b, 'all'), danger: true),
                        ],
                      ),
                    ]),
                  ),
                ],
              ]),
            ),
        ],
      ),
    );
  }
}

class _GrantPanel extends ConsumerStatefulWidget {
  const _GrantPanel();

  @override
  ConsumerState<_GrantPanel> createState() => _GrantPanelState();
}

class _GrantPanelState extends ConsumerState<_GrantPanel> {
  ExamPeople? _people;
  final Set<int> _students = {};
  final Set<int> _candidates = {};
  final Set<int> _batches = {};
  int _ee = 0;
  int _eo = 0;
  final _notes = TextEditingController();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    ExamPeople.load(ref).then((p) {
      if (mounted) setState(() => _people = p);
    }).catchError((Object e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    });
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _pick(String kind) async {
    final fr = context.isFrench;
    final p = _people!;
    final list = switch (kind) { 'student' => p.students, 'candidate' => p.candidates, _ => p.batches };
    final set = switch (kind) { 'student' => _students, 'candidate' => _candidates, _ => _batches };
    final picked = await showAdminPanel<Set<int>>(
      context,
      builder: (_) => MultiPicker(
        title: switch (kind) { 'student' => fr ? 'Étudiants' : 'Students', 'candidate' => fr ? 'Candidats' : 'Exam candidates', _ => fr ? 'Promotions' : 'Batches' },
        items: [for (final x in list) (J.i(x['id']), kind == 'batch' ? J.s(x['name']) : J.name(x), kind == 'batch' ? '${J.i(x['student_count'])}' : J.s(x['email']))],
        initial: set,
      ),
    );
    if (picked != null) {
      setState(() {
        set
          ..clear()
          ..addAll(picked);
      });
    }
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    setState(() => _saving = true);
    try {
      final res = await ref.read(apiClientProvider).post('/ai-credits/bulk-grant', data: {
        'student_ids': [..._students, ..._candidates],
        'batch_ids': [..._batches],
        'ee_credits': _ee,
        'eo_credits': _eo,
        if (_notes.text.trim().isNotEmpty) 'notes': _notes.text.trim(),
      });
      if (!mounted) return;
      final n = J.i(J.map(res.data)['recipients_count']);
      adminToast(context, fr ? 'Crédits donnés à $n personne(s)' : 'Credits granted to $n recipient(s)');
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  Widget _amount(String label, Color color, int value, ValueChanged<int> onChanged) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: color))),
          IconButton.outlined(onPressed: value <= 0 ? null : () => onChanged(value - 1), icon: const Icon(Icons.remove, size: 18), visualDensity: VisualDensity.compact),
          SizedBox(width: 44, child: Text('$value', textAlign: TextAlign.center, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800))),
          IconButton.outlined(onPressed: () => onChanged(value + 1), icon: const Icon(Icons.add, size: 18), visualDensity: VisualDensity.compact),
        ]),
        const SizedBox(height: 6),
        Wrap(spacing: 6, children: [
          for (final q in [0, 1, 5, 10, 20]) ChoiceChip(label: Text('$q'), selected: value == q, onSelected: (_) => onChanged(q)),
        ]),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final p = _people;
    final recipients = _students.length + _candidates.length + _batches.length;
    final ok = recipients > 0 && (_ee > 0 || _eo > 0);
    Widget who(String kind, IconData icon, String label, Set<int> ids) => ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(icon, color: AppColors.adminAccent),
          title: Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
          subtitle: Text(ids.isEmpty ? (fr ? 'Aucun' : 'None') : (fr ? '${ids.length} sélectionné(s)' : '${ids.length} selected'), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          trailing: const Icon(Icons.chevron_right),
          onTap: p == null ? null : () => _pick(kind),
        );
    return AdminPanel(
      title: fr ? 'Donner des crédits IA' : 'Grant AI credits',
      subtitle: fr ? 'Ajoutés au solde de chaque destinataire' : 'Added to each recipient’s balance',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
        AdminButton(fr ? 'Donner' : 'Grant', icon: Icons.bolt, busy: _saving, onPressed: ok ? _save : null),
      ],
      children: [
        PanelSection(fr ? 'Destinataires' : 'Recipients'),
        if (p == null)
          const AdminLoading()
        else ...[
          who('student', Icons.person_outline, fr ? 'Étudiants' : 'Students', _students),
          who('candidate', Icons.badge_outlined, fr ? 'Candidats' : 'Exam candidates', _candidates),
          who('batch', Icons.groups_outlined, fr ? 'Promotions (tous leurs étudiants)' : 'Batches (all their students)', _batches),
        ],
        PanelSection(fr ? 'Crédits par personne' : 'Credits per person'),
        _amount('Expression écrite', Skill.ee.color, _ee, (v) => setState(() => _ee = v)),
        _amount('Expression orale', Skill.eo.color, _eo, (v) => setState(() => _eo = v)),
        AdminField(label: fr ? 'Note (facultative)' : 'Note (optional)', controller: _notes),
      ],
    );
  }
}
