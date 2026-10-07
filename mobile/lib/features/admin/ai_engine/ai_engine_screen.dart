import 'package:dio/dio.dart' show Options;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';

/// Which Google AI service powers the whole platform: AI quizzes, exam
/// scoring, listening audio and the live oral examiner. Same page as the web
/// (Admin → AI engine): test an engine, then switch; every switch is kept in
/// the history. Keys never reach the app, only whether they are set.
class AiEngineScreen extends ConsumerStatefulWidget {
  const AiEngineScreen({super.key});

  @override
  ConsumerState<AiEngineScreen> createState() => _AiEngineScreenState();
}

// ── What the server sends (GET /admin/ai-engine) ─────────────────────────

class _Check {
  final String id;
  final bool ok;
  final int ms;
  final String model;
  final String detail;
  final String error;
  _Check(Map<String, dynamic> j)
      : id = J.s(j['id']),
        ok = j['ok'] == true,
        ms = J.i(j['ms']),
        model = J.s(j['model']),
        detail = J.s(j['detail']),
        error = J.s(j['error']);
}

class _Test {
  final DateTime? at;
  final bool ok;
  final List<_Check> checks;
  _Test(Map<String, dynamic> j)
      : at = J.date(j['at']),
        ok = j['ok'] == true,
        checks = J.list(j['checks']).map(_Check.new).toList();
}

class _Engine {
  final String id;
  final bool configured;
  final List<String> issues;
  final int keys;
  final String project;
  final String location;
  final Map<String, List<String>> models;
  _Test? lastTest;
  _Engine(Map<String, dynamic> j)
      : id = J.s(j['id']),
        configured = j['configured'] == true,
        issues = (j['issues'] is List ? j['issues'] as List : const []).map((e) => '$e').toList(),
        keys = J.i(j['keys']),
        project = J.s(j['project']),
        location = J.s(j['location']),
        models = {
          for (final kind in ['text', 'tts', 'live'])
            kind: (J.map(j['models'])[kind] is List ? J.map(j['models'])[kind] as List : const []).map((e) => '$e').toList(),
        },
        lastTest = j['lastTest'] is Map ? _Test(J.map(j['lastTest'])) : null;
}

class _Change {
  final String engine;
  final String previous;
  final DateTime? at;
  final String by;
  _Change(Map<String, dynamic> j)
      : engine = J.s(j['engine']),
        previous = J.s(j['previous_engine']),
        at = J.date(j['created_at']),
        by = J.s(j['changed_by']);
}

class _Overview {
  final String active;
  final String selected;
  final DateTime? since;
  final String changedBy;
  final List<_Engine> engines;
  final List<_Change> history;
  _Overview(Map<String, dynamic> j)
      : active = J.s(j['active']),
        selected = J.s(j['selected']).isEmpty ? J.s(j['active']) : J.s(j['selected']),
        since = J.date(j['since']),
        changedBy = J.s(j['changedBy']),
        engines = J.list(j['engines']).map(_Engine.new).toList(),
        history = J.list(j['history']).map(_Change.new).toList();
}

// ── Wording ──────────────────────────────────────────────────────────────

class _Meta {
  final String name;
  final String productFr, productEn;
  final IconData icon;
  final Color color;
  final String billingFr, billingEn;
  final String examinerFr, examinerEn;
  const _Meta(this.name, this.productFr, this.productEn, this.icon, this.color, this.billingFr, this.billingEn, this.examinerFr, this.examinerEn);
}

const _meta = <String, _Meta>{
  'developer': _Meta(
    'Google AI Developer',
    'Gemini API · clés AI Studio',
    'Gemini API · AI Studio keys',
    Icons.api_outlined,
    AppColors.frenchBlue,
    'Gratuit — quota quotidien par clé et par modèle',
    'Free tier — a daily quota per key and per model',
    'Le navigateur se connecte à Google avec un jeton à usage unique',
    'The browser connects to Google with a single-use token',
  ),
  'vertex': _Meta(
    'Google Cloud Vertex AI',
    'Vertex AI · projet Google Cloud',
    'Vertex AI · Google Cloud project',
    Icons.cloud_outlined,
    AppColors.good,
    'Facturé à l’usage au projet Google Cloud — sans plafond quotidien',
    'Billed per use to the Google Cloud project — no daily cap',
    'Relayé par le serveur : le navigateur ne contacte jamais Google directement',
    'Relayed by this server: the browser never reaches Google directly',
  ),
};

String _name(String? id) => _meta[id]?.name ?? (id == null || id.isEmpty ? '—' : id);

/// The three things the platform asks of an engine, with the models used for each.
const _capabilities = [
  (id: 'text', kind: 'text', icon: Icons.description_outlined, fr: 'Texte', en: 'Text', useFr: 'Quiz IA, correction des examens écrits et oraux', useEn: 'AI quizzes, written and oral exam scoring'),
  (id: 'voice', kind: 'tts', icon: Icons.volume_up_outlined, fr: 'Voix', en: 'Voice', useFr: 'Audio d’écoute des quiz', useEn: 'Listening audio for quizzes'),
  (id: 'examiner', kind: 'live', icon: Icons.mic_none_outlined, fr: 'Examinateur en direct', en: 'Live examiner', useFr: 'L’examen oral, en temps réel', useEn: 'The oral exam, in real time'),
];

String _seconds(int ms) => '${(ms / 1000).toStringAsFixed(1)} s';

// ── Screen ───────────────────────────────────────────────────────────────

class _AiEngineScreenState extends ConsumerState<AiEngineScreen> {
  _Overview? _data;
  bool _loading = true;
  String? _error;
  String? _testing;
  String? _switching;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (_data == null) setState(() => _loading = true);
    try {
      final res = await ref.read(apiClientProvider).get('/admin/ai-engine');
      final next = _Overview(J.map(res.data));
      if (!mounted) return;
      setState(() {
        _keepTests(next);
        _data = next;
        _error = null;
        _loading = false;
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

  /// Test results the server did not resend stay on the cards.
  void _keepTests(_Overview next) {
    for (final e in next.engines) {
      e.lastTest ??= _data?.engines.where((o) => o.id == e.id).firstOrNull?.lastTest;
    }
  }

  Future<void> _runTest(_Engine engine) async {
    final fr = context.isFrench;
    setState(() => _testing = engine.id);
    try {
      // A test waits for the platform's own fallbacks: well beyond the usual 25 s.
      final res = await ref.read(apiClientProvider).post(
            '/admin/ai-engine/test',
            data: {'engine': engine.id},
            options: Options(receiveTimeout: const Duration(minutes: 5)),
          );
      final result = _Test(J.map(res.data));
      if (!mounted) return;
      setState(() => engine.lastTest = result);
      final failed = result.checks.where((c) => !c.ok).length;
      adminToast(
        context,
        result.ok
            ? (fr ? '${_name(engine.id)} : tous les contrôles sont passés' : '${_name(engine.id)}: every check passed')
            : (fr ? '${_name(engine.id)} : $failed contrôle(s) en échec — voir la carte' : '${_name(engine.id)}: $failed check(s) failed — see the card'),
        error: !result.ok,
      );
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _testing = null);
    }
  }

  Future<void> _switchTo(_Engine engine) async {
    final fr = context.isFrench;
    final ok = await _confirmSwitch(engine);
    if (!ok || !mounted) return;
    setState(() => _switching = engine.id);
    try {
      final res = await ref.read(apiClientProvider).put('/admin/ai-engine', data: {'engine': engine.id});
      final next = _Overview(J.map(res.data));
      if (!mounted) return;
      setState(() {
        _keepTests(next);
        _data = next;
      });
      adminToast(context, fr ? 'La plateforme utilise maintenant ${_name(engine.id)}' : 'The platform now runs on ${_name(engine.id)}');
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _switching = null);
    }
  }

  Future<bool> _confirmSwitch(_Engine engine) async {
    final fr = context.isFrench;
    final name = _name(engine.id);
    final tested = engine.lastTest?.ok == true;
    final points = [
      fr
          ? 'Les quiz IA, la correction des examens, l’audio d’écoute et l’examinateur oral utiliseront $name pour chaque nouvelle requête.'
          : 'AI quizzes, exam scoring, listening audio and the oral examiner will use $name for every new request.',
      fr ? 'Les tâches d’examen oral déjà en cours gardent leur connexion jusqu’à leur fin.' : 'Oral exam tasks already under way keep their connection until the task ends.',
      if (engine.id == 'vertex')
        fr
            ? 'L’usage est facturé au projet Google Cloud${engine.project.isEmpty ? '' : ' ${engine.project}'}.'
            : 'Usage is billed to the Google Cloud project${engine.project.isEmpty ? '' : ' ${engine.project}'}.',
      if (engine.id == 'developer')
        fr ? 'Les quotas gratuits s’appliquent à nouveau : chaque clé a une limite quotidienne par modèle.' : 'The free-tier quotas apply again: each key has a daily limit per model.',
    ];
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(fr ? 'Passer la plateforme sur $name ?' : 'Switch the platform to $name?', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final p in points)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(padding: EdgeInsets.only(top: 7), child: Icon(Icons.circle, size: 5, color: AppColors.textMuted)),
                      const SizedBox(width: 9),
                      Expanded(child: Text(p, style: AppTypography.bodySmall.copyWith(color: AppColors.text, height: 1.45))),
                    ],
                  ),
                ),
              if (!tested) ...[
                const SizedBox(height: 6),
                _Notice(
                  engine.lastTest != null
                      ? (fr ? 'Le dernier test de ce moteur a échoué. Lancez un test d’abord pour vérifier que tout répond.' : 'The last test of this engine failed. Run a test first to confirm that every feature answers.')
                      : (fr ? 'Ce moteur n’a pas été testé depuis l’ouverture de la page. Lancez un test d’abord pour vérifier que tout répond.' : 'This engine has not been tested since the page was opened. Run a test first to confirm that every feature answers.'),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(fr ? 'Annuler' : 'Cancel')),
          FilledButton.icon(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
            icon: const Icon(Icons.swap_horiz, size: 18),
            label: Text(fr ? 'Basculer' : 'Switch'),
          ),
        ],
      ),
    );
    return ok == true;
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _data == null) return AdminError(message: _error!, onRetry: _load);
    final data = _data!;
    final active = _meta[data.active];

    return AdminPage(
      onRefresh: _load,
      maxWidth: 1040,
      children: [
        AdminHeader(
          overline: fr ? 'Système' : 'System',
          title: fr ? 'Moteur d’IA' : 'AI engine',
          subtitle: fr
              ? 'Le service d’IA de Google derrière toute la plateforme : quiz IA, correction des examens, audio d’écoute et examinateur oral en direct.'
              : 'The Google AI service behind the whole platform: AI quizzes, exam scoring, listening audio and the live oral examiner.',
        ),

        // ── In use ──
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.adminAccentBg,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.adminAccentLine),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.adminAccentLine)),
                    child: Icon(active?.icon ?? Icons.memory, size: 18, color: AppColors.adminAccent),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(fr ? 'En service : ${_name(data.active)}' : 'In use: ${_name(data.active)}',
                            style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                        const SizedBox(height: 4),
                        Text(
                          data.since == null
                              ? (fr ? 'Toutes les nouvelles requêtes d’IA passent par ce moteur. C’est le moteur d’origine de la plateforme.' : 'Every new AI request goes to this engine. This is the platform’s original engine.')
                              : (fr
                                  ? 'Toutes les nouvelles requêtes d’IA passent par ce moteur. Choisi le ${AdminFmt.dateTime(context, data.since)}${data.changedBy.isEmpty ? '' : ' par ${data.changedBy}'}.'
                                  : 'Every new AI request goes to this engine. Chosen ${AdminFmt.dateTime(context, data.since)}${data.changedBy.isEmpty ? '' : ' by ${data.changedBy}'}.'),
                          style: AppTypography.bodySmall.copyWith(color: AppColors.text, height: 1.45),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              if (data.selected != data.active) ...[
                const SizedBox(height: 12),
                _Notice(fr
                    ? '${_name(data.selected)} a été choisi mais n’est plus configuré sur le serveur : la plateforme est revenue sur ${_name(data.active)}. Corrigez sa configuration, puis basculez à nouveau.'
                    : '${_name(data.selected)} was chosen but is no longer configured on the server, so the platform fell back to ${_name(data.active)}. Fix its configuration, then switch again.'),
              ],
              const SizedBox(height: 10),
              Text(
                fr
                    ? 'Une bascule s’applique tout de suite aux nouvelles requêtes. Une tâche d’examen oral en cours garde sa connexion jusqu’à sa fin ; aucune requête ne passe d’un moteur à l’autre.'
                    : 'A switch applies at once to new requests. An oral exam task already under way keeps its connection until the task ends; no request moves from one engine to the other.',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.45),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // ── Engines ──
        AdminGrid(
          minTileWidth: 340,
          maxColumns: 2,
          children: [
            for (final engine in data.engines)
              _EngineCard(
                engine: engine,
                active: engine.id == data.active,
                testing: _testing == engine.id,
                busy: _testing != null || _switching != null,
                switching: _switching == engine.id,
                onTest: () => _runTest(engine),
                onUse: () => _switchTo(engine),
              ),
          ],
        ),
        const SizedBox(height: 14),

        // ── History ──
        AdminCard(
          title: fr ? 'Historique' : 'History',
          icon: Icons.history,
          child: data.history.isEmpty
              ? Text(
                  fr ? 'Aucune bascule pour l’instant : la plateforme a toujours utilisé ${_name('developer')}.' : 'No switch yet: the platform has always run on ${_name('developer')}.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                )
              : Column(
                  children: [
                    for (var i = 0; i < data.history.length; i++) ...[
                      if (i > 0) const Divider(height: 18, color: AppColors.borderSoft),
                      Row(
                        children: [
                          Expanded(
                            child: Text.rich(
                              TextSpan(children: [
                                TextSpan(text: '${_name(data.history[i].previous)}  →  '),
                                TextSpan(text: _name(data.history[i].engine), style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ink)),
                              ]),
                              style: AppTypography.bodySmall.copyWith(color: AppColors.text),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(AdminFmt.dateTime(context, data.history[i].at), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                              if (data.history[i].by.isNotEmpty) Text(data.history[i].by, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
        ),
        const SizedBox(height: 14),

        // ── Security ──
        AdminCard(
          title: fr ? 'Clés et sécurité' : 'Keys and security',
          icon: Icons.lock_outline,
          accent: AppColors.good,
          child: Text(
            fr
                ? 'Les clés d’API sont réglées dans le fichier d’environnement du serveur et ne le quittent jamais : ni vers cette application, ni vers le navigateur d’un apprenant. L’examinateur oral reçoit un accès à usage unique pour chaque tâche, avec ses consignes verrouillées par le serveur.'
                : 'API keys are set in the server’s environment file and never leave the server — not to this app, not to a learner’s browser. The oral examiner receives a single-use credential for each task, with the examiner’s instructions locked by the server.',
            style: AppTypography.bodySmall.copyWith(color: AppColors.text, height: 1.45),
          ),
        ),
      ],
    );
  }
}

// ── One engine ───────────────────────────────────────────────────────────

class _EngineCard extends StatelessWidget {
  final _Engine engine;
  final bool active;
  final bool testing;
  final bool busy;
  final bool switching;
  final VoidCallback onTest;
  final VoidCallback onUse;

  const _EngineCard({
    required this.engine,
    required this.active,
    required this.testing,
    required this.busy,
    required this.switching,
    required this.onTest,
    required this.onUse,
  });

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final meta = _meta[engine.id];
    final test = engine.lastTest;
    final (statusText, statusColor) = active
        ? (fr ? 'En service' : 'In use', AppColors.adminAccent)
        : engine.configured
            ? (fr ? 'Prêt' : 'Ready', AppColors.good)
            : (fr ? 'Non configuré' : 'Not configured', AppColors.textMuted);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: active ? AppColors.adminAccent : AppColors.border, width: active ? 1.5 : 1),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.025), blurRadius: 10, offset: const Offset(0, 3))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Head
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: (meta?.color ?? AppColors.adminAccent).withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(color: (meta?.color ?? AppColors.adminAccent).withValues(alpha: 0.3)),
                ),
                child: Icon(meta?.icon ?? Icons.memory, size: 20, color: meta?.color ?? AppColors.adminAccent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_name(engine.id), style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                    const SizedBox(height: 2),
                    Text(fr ? (meta?.productFr ?? '') : (meta?.productEn ?? ''), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Pill(statusText, color: statusColor),
            ],
          ),
          const SizedBox(height: 14),

          // Facts
          Container(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
            decoration: BoxDecoration(color: AppColors.surfaceSoft, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.borderSoft)),
            child: Column(
              children: [
                _Fact(fr ? 'Facturation' : 'Billing', fr ? (meta?.billingFr ?? '') : (meta?.billingEn ?? '')),
                _Fact(
                  fr ? 'Clés' : 'Keys',
                  engine.keys == 0
                      ? (fr ? 'Aucune sur le serveur' : 'None set on the server')
                      : engine.keys == 1
                          ? (fr ? '1 clé, gardée sur le serveur' : '1 key, kept on the server')
                          : (fr ? '${engine.keys} clés, utilisées à tour de rôle' : '${engine.keys} keys, used in rotation'),
                ),
                if (engine.id == 'vertex')
                  _Fact(
                    fr ? 'Projet' : 'Project',
                    engine.project.isEmpty
                        ? (fr ? 'Non défini' : 'Not set')
                        : (fr ? '${engine.project} · région de l’examinateur ${engine.location}' : '${engine.project} · examiner region ${engine.location}'),
                  ),
                _Fact(fr ? 'Examinateur' : 'Examiner', fr ? (meta?.examinerFr ?? '') : (meta?.examinerEn ?? '')),
              ],
            ),
          ),
          const SizedBox(height: 6),

          // Capabilities
          for (var i = 0; i < _capabilities.length; i++) ...[
            if (i > 0) const Divider(height: 1, color: AppColors.borderSoft),
            _Capability(
              icon: _capabilities[i].icon,
              label: fr ? _capabilities[i].fr : _capabilities[i].en,
              use: fr ? _capabilities[i].useFr : _capabilities[i].useEn,
              models: engine.models[_capabilities[i].kind] ?? const [],
              check: test?.checks.where((c) => c.id == _capabilities[i].id).firstOrNull,
            ),
          ],

          // Configuration problems
          for (final issue in engine.issues) ...[const SizedBox(height: 8), _Notice(issue)],

          // Last test
          if (test != null) ...[
            const SizedBox(height: 10),
            _TestResult(test),
          ],

          // Actions
          const SizedBox(height: 14),
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 10,
            runSpacing: 10,
            children: [
              AdminButton(
                testing ? (fr ? 'Test en cours…' : 'Testing…') : (fr ? 'Lancer un test' : 'Run test'),
                icon: Icons.science_outlined,
                primary: false,
                busy: testing,
                onPressed: !engine.configured || busy ? null : onTest,
              ),
              if (active)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle, size: 16, color: AppColors.adminAccent),
                      const SizedBox(width: 6),
                      Text(fr ? 'En service' : 'In use', style: AppTypography.bodySmall.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w800)),
                    ],
                  ),
                )
              else
                AdminButton(
                  fr ? 'Utiliser ce moteur' : 'Use this engine',
                  icon: Icons.swap_horiz,
                  busy: switching,
                  onPressed: !engine.configured || busy ? null : onUse,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  final String label;
  final String value;
  const _Fact(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
          ),
          Expanded(child: Text(value, style: AppTypography.caption.copyWith(color: AppColors.text, height: 1.4))),
        ],
      ),
    );
  }
}

class _Capability extends StatelessWidget {
  final IconData icon;
  final String label;
  final String use;
  final List<String> models;
  final _Check? check;
  const _Capability({required this.icon, required this.label, required this.use, required this.models, this.check});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final check = this.check;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(color: AppColors.adminAccentBg, borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 15, color: AppColors.adminAccent),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                Text(use, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                const SizedBox(height: 5),
                Wrap(
                  spacing: 5,
                  runSpacing: 5,
                  children: [
                    if (models.isEmpty) Text(fr ? 'Aucun modèle' : 'No model', style: AppTypography.caption.copyWith(color: AppColors.textSubtle)),
                    for (var i = 0; i < models.length; i++) _ModelChip(models[i], primary: i == 0),
                  ],
                ),
              ],
            ),
          ),
          if (check != null) ...[
            const SizedBox(width: 8),
            Tooltip(
              message: check.ok ? '${check.detail}${check.model.isEmpty ? '' : ' · ${check.model}'}' : check.error,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(check.ok ? Icons.check_circle : Icons.cancel, size: 15, color: check.ok ? AppColors.good : AppColors.bad),
                  const SizedBox(width: 4),
                  Text(
                    check.ok ? _seconds(check.ms) : (fr ? 'Échec' : 'Failed'),
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: check.ok ? AppColors.good : AppColors.bad),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ModelChip extends StatelessWidget {
  final String model;
  final bool primary;
  const _ModelChip(this.model, {required this.primary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: primary ? AppColors.adminAccentBg : AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: primary ? AppColors.adminAccentLine : AppColors.border),
      ),
      child: Text(
        model,
        style: AppTypography.caption.copyWith(
          fontFamily: 'monospace',
          fontSize: 11,
          color: primary ? AppColors.ink : AppColors.textMuted,
          fontWeight: primary ? FontWeight.w700 : FontWeight.w500,
        ),
      ),
    );
  }
}

class _TestResult extends StatelessWidget {
  final _Test test;
  const _TestResult(this.test);

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final color = test.ok ? AppColors.good : AppColors.bad;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: test.ok ? AppColors.goodBg : AppColors.badBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: test.ok ? AppColors.goodBorder : AppColors.badBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(test.ok ? Icons.check_circle : Icons.cancel, size: 16, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  test.ok ? (fr ? 'Tous les contrôles sont passés' : 'Every check passed') : (fr ? 'Des contrôles ont échoué' : 'Some checks failed'),
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: color),
                ),
              ),
              Text(AdminFmt.relative(context, test.at), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            ],
          ),
          const SizedBox(height: 8),
          for (final c in test.checks)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 92,
                    child: Text(
                      _capabilities.where((x) => x.id == c.id).map((x) => fr ? x.fr : x.en).firstOrNull ?? c.id,
                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      c.ok ? '${c.detail}${c.model.isEmpty ? '' : ' · ${c.model}'} · ${_seconds(c.ms)}' : c.error,
                      style: AppTypography.caption.copyWith(color: c.ok ? AppColors.text : AppColors.bad, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// A warning line (configuration problem, untested engine).
class _Notice extends StatelessWidget {
  final String text;
  const _Notice(this.text);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      decoration: BoxDecoration(color: AppColors.warnBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.warnBorder)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(padding: EdgeInsets.only(top: 1), child: Icon(Icons.warning_amber_rounded, size: 16, color: AppColors.warn)),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: AppTypography.caption.copyWith(color: const Color(0xFF92400E), height: 1.45))),
        ],
      ),
    );
  }
}
