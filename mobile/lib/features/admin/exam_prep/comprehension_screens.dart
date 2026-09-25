import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/token_storage.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../../core/widgets/audio_preview_player.dart';
import '../common/admin_kit.dart';
import 'assignments.dart';
import 'exam_common.dart';

/// A media address the app can open: the API base plus the session token,
/// the same way the web plays audio and shows images.
Future<String> authedUrl(WidgetRef ref, String pathOrUrl) async {
  final token = await TokenStorage().getToken() ?? '';
  final base = ref.read(apiClientProvider).dio.options.baseUrl;
  final url = pathOrUrl.startsWith('http') ? pathOrUrl : '$base$pathOrUrl';
  return '$url${url.contains('?') ? '&' : '?'}token=$token';
}

Map<String, num> _parseThresholds(dynamic raw) {
  dynamic v = raw;
  if (v is String && v.isNotEmpty) {
    try {
      v = jsonDecode(v);
    } catch (_) {
      v = null;
    }
  }
  final m = v is Map ? v : const {};
  return {for (final l in cefrLevels) if (m[l] != null) l: J.n(m[l])};
}

// ── Series list ────────────────────────────────────────────────────────────

class SeriesListScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> category;
  final Skill skill;
  const SeriesListScreen({super.key, required this.category, required this.skill});

  @override
  ConsumerState<SeriesListScreen> createState() => _SeriesListScreenState();
}

class _SeriesListScreenState extends ConsumerState<SeriesListScreen> {
  List<Map<String, dynamic>> _series = [];
  bool _loading = true;
  String? _error;
  String _query = '';
  String _sort = 'number';

  Skill get _skill => widget.skill;
  String get _type => _skill == Skill.co ? 'co_series' : 'ce_series';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('${_skill.prefix}/categories/${widget.category['id']}/series');
      if (!mounted) return;
      setState(() {
        _series = J.list(res.data, ['series']);
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

  List<Map<String, dynamic>> get _sorted {
    final q = _query.trim().toLowerCase();
    final list = _series.where((s) => q.isEmpty || J.s(s['name']).toLowerCase().contains(q)).toList();
    int byNumber(Map a, Map b) {
      final c = numberIn(J.s(a['name'])).compareTo(numberIn(J.s(b['name'])));
      return c != 0 ? c : J.s(a['name']).compareTo(J.s(b['name']));
    }

    list.sort((a, b) => switch (_sort) {
          'newest' => (J.date(b['created_at']) ?? DateTime(0)).compareTo(J.date(a['created_at']) ?? DateTime(0)),
          'questions' => J.i(a['total_questions']).compareTo(J.i(b['total_questions'])) != 0 ? J.i(a['total_questions']).compareTo(J.i(b['total_questions'])) : byNumber(a, b),
          _ => byNumber(a, b),
        });
    return list;
  }

  Future<void> _edit([Map<String, dynamic>? series]) async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => SeriesEditor(skill: _skill, categoryId: J.i(widget.category['id']), series: series));
    if (saved == true) _load();
  }

  Future<void> _delete(Map<String, dynamic> s) async {
    final fr = context.isFrench;
    final n = J.i(s['total_questions']);
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer « ${J.s(s['name'])} » ?' : 'Delete “${J.s(s['name'])}”?',
      message: fr
          ? 'Ses $n questions${_skill == Skill.co ? ' et leurs audios' : ''} seront aussi supprimées. Action irréversible.'
          : 'Its $n questions${_skill == Skill.co ? ' and their audio files' : ''} are deleted too. This can’t be undone.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('${_skill.prefix}/series/${s['id']}');
      if (mounted) adminToast(context, fr ? 'Série supprimée' : 'Series deleted');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  void _openDetail(Map<String, dynamic> s, List<Map<String, dynamic>> order) {
    openLevel(context, SeriesDetailScreen(skill: _skill, categoryId: J.i(widget.category['id']), seriesId: J.i(s['id']), order: [for (final x in order) (J.i(x['id']), J.s(x['name']))])).then((_) => _load());
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final counts = <int, int>{};
    for (final s in _series) {
      final c = J.i(s['total_questions']);
      if (c > 0) counts[c] = (counts[c] ?? 0) + 1;
    }
    final typical = counts.isEmpty ? 0 : (counts.entries.toList()..sort((a, b) => b.value != a.value ? b.value.compareTo(a.value) : b.key.compareTo(a.key))).first.key;
    final short = _series.where((s) => typical > 0 && J.i(s['total_questions']) < typical).toList();
    final totalQ = _series.fold<int>(0, (t, s) => t + J.i(s['total_questions']));
    final withIntro = _series.where((s) => s['intro_audio_kdrive_file_id'] != null).length;
    final sorted = _sorted;

    return ExamScaffold(
      title: J.s(widget.category['name']),
      subtitle: fr
          ? '${_series.length} séries · $totalQ questions${_skill == Skill.co ? ' · $withIntro avec intro audio' : ''}'
          : '${_series.length} series · $totalQ questions${_skill == Skill.co ? ' · $withIntro with intro audio' : ''}',
      skill: _skill,
      fab: ExamFab(fr ? 'Nouvelle série' : 'New series', onPressed: _edit),
      body: ExamBody(
        loading: _loading,
        error: _error,
        onRefresh: _load,
        empty: _series.isEmpty,
        emptyState: AdminEmpty(
          icon: Icons.description_outlined,
          title: fr ? 'Aucune série' : 'No series yet',
          message: fr ? 'Créez la première série, puis ajoutez ses questions.' : 'Create the first series, then add its questions.',
        ),
        toolbar: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AdminSearchField(hint: fr ? 'Rechercher une série' : 'Search series', onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            AdminFilterChips<String>(
              options: [
                FilterOption('number', fr ? 'Par numéro' : 'By number'),
                FilterOption('newest', fr ? 'Plus récentes' : 'Newest first'),
                FilterOption('questions', fr ? 'Moins de questions' : 'Fewest questions'),
              ],
              selected: _sort,
              onSelected: (v) => setState(() => _sort = v),
            ),
          ],
        ),
        children: [
          if (short.isNotEmpty)
            WarnNote(fr
                ? '${short.length} série(s) ont moins de $typical questions : ${short.take(6).map((s) => '${J.s(s['name'])} (${J.i(s['total_questions'])})').join(', ')}${short.length > 6 ? '…' : ''}'
                : '${short.length} series have fewer than $typical questions: ${short.take(6).map((s) => '${J.s(s['name'])} (${J.i(s['total_questions'])})').join(', ')}${short.length > 6 ? '…' : ''}'),
          if (sorted.isEmpty)
            AdminCard(child: AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucune série ne correspond' : 'No series match your search'))
          else
            TreeGrid(children: [
              for (final s in sorted)
                TreeCard(
                  warn: short.contains(s),
                  leading: NumberBadge(numberIn(J.s(s['name'])) == 0 ? '–' : '${numberIn(J.s(s['name']))}', color: _skill.color),
                  title: J.s(s['name']),
                  subtitle: '${J.i(s['total_questions'])} questions · ${J.i(s['total_points'])} pts · ${J.i(s['duration_minutes'])} min'
                      '${_skill == Skill.co && s['intro_audio_kdrive_file_id'] != null ? (fr ? ' · intro 🎧' : ' · intro 🎧') : ''}',
                  footer: CefrBar({for (final e in J.map(s['cefr_distribution']).entries) e.key: J.n(e.value)}),
                  onTap: () => _openDetail(s, sorted),
                  menu: [
                    menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit details', () => _edit(s)),
                    menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['$_type:${s['id']}']))),
                    menuItem(Icons.delete_outline, fr ? 'Supprimer' : 'Delete series', () => _delete(s), danger: true),
                  ],
                ),
            ]),
        ],
      ),
    );
  }
}

// ── Series detail ──────────────────────────────────────────────────────────

class SeriesDetailScreen extends ConsumerStatefulWidget {
  final Skill skill;
  final int categoryId;
  final int seriesId;

  /// The list the admin came from, for previous / next.
  final List<(int, String)> order;

  const SeriesDetailScreen({super.key, required this.skill, required this.categoryId, required this.seriesId, this.order = const []});

  @override
  ConsumerState<SeriesDetailScreen> createState() => _SeriesDetailScreenState();
}

class _SeriesDetailScreenState extends ConsumerState<SeriesDetailScreen> {
  Map<String, dynamic>? _d;
  bool _loading = true;
  String? _error;
  String _level = 'all';
  String _query = '';
  int? _open;
  String? _introUrl;

  Skill get _skill => widget.skill;
  bool get _co => _skill == Skill.co;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('${_skill.prefix}/series/${widget.seriesId}');
      final d = J.map(res.data);
      String? intro;
      if (_co && d['intro_audio_kdrive_file_id'] != null) intro = await authedUrl(ref, '/tcf/co/series/${widget.seriesId}/intro-audio');
      if (!mounted) return;
      setState(() {
        _d = d;
        _introUrl = intro;
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

  List<Map<String, dynamic>> get _questions => J.list(_d?['questions'])..sort((a, b) => J.i(a['question_order']).compareTo(J.i(b['question_order'])));

  Future<void> _editSeries() async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => SeriesEditor(skill: _skill, categoryId: widget.categoryId, series: _d));
    if (saved == true) _load();
  }

  Future<void> _editQuestion([Map<String, dynamic>? q]) async {
    final saved = await showAdminPanel<bool>(context, tabletWidth: 600, builder: (_) => QuestionEditor(skill: _skill, seriesId: widget.seriesId, question: q));
    if (saved == true) _load();
  }

  Future<void> _deleteQuestion(Map<String, dynamic> q) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer la question ${J.i(q['question_order'])} ?' : 'Delete question ${J.i(q['question_order'])}?',
      message: fr ? 'Action irréversible.' : 'This can’t be undone.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('${_skill.prefix}/questions/${q['id']}');
      if (mounted) adminToast(context, fr ? 'Question supprimée' : 'Question deleted');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  /// Swaps two neighbours on screen at once, then saves only those two rows.
  Future<void> _move(int index, int delta) async {
    final list = _questions;
    final j = index + delta;
    if (j < 0 || j >= list.length) return;
    final a = list[index], b = list[j];
    final oa = J.i(a['question_order']), ob = J.i(b['question_order']);
    final previous = _d;
    setState(() {
      _d = {
        ..._d!,
        'questions': [
          for (final q in list)
            if (q['id'] == a['id']) {...q, 'question_order': ob} else if (q['id'] == b['id']) {...q, 'question_order': oa} else q,
        ],
      };
    });
    try {
      await ref.read(apiClientProvider).put('${_skill.prefix}/series/${widget.seriesId}/questions/reorder', data: {
        'questions': [
          {'id': a['id'], 'question_order': ob},
          {'id': b['id'], 'question_order': oa},
        ],
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _d = previous);
      adminToast(context, context.isFrench ? 'Le nouvel ordre n’a pas pu être enregistré.' : 'The new order could not be saved.', error: true);
    }
  }

  void _goTo(int id) {
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (_) => SeriesDetailScreen(skill: _skill, categoryId: widget.categoryId, seriesId: id, order: widget.order),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = _d;
    final pos = widget.order.indexWhere((e) => e.$1 == widget.seriesId);
    final prev = pos > 0 ? widget.order[pos - 1] : null;
    final next = pos >= 0 && pos < widget.order.length - 1 ? widget.order[pos + 1] : null;
    final type = _co ? 'co_series' : 'ce_series';

    return ExamScaffold(
      title: d == null ? (fr ? 'Série' : 'Series') : J.s(d['name']),
      subtitle: d == null || J.s(d['description']).isEmpty ? null : J.s(d['description']),
      skill: _skill,
      actions: [
        if (widget.order.length > 1) ...[
          IconButton(tooltip: prev?.$2, onPressed: prev == null ? null : () => _goTo(prev.$1), icon: const Icon(Icons.chevron_left)),
          IconButton(tooltip: next?.$2, onPressed: next == null ? null : () => _goTo(next.$1), icon: const Icon(Icons.chevron_right)),
        ],
        if (d != null)
          PopupMenuButton<VoidCallback>(
            onSelected: (a) => a(),
            itemBuilder: (_) => [
              menuItem(Icons.edit_outlined, fr ? 'Modifier la série' : 'Edit series', _editSeries),
              menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['$type:${widget.seriesId}']))),
            ],
          ),
      ],
      fab: d == null ? null : ExamFab(fr ? 'Question' : 'Add question', onPressed: _editQuestion),
      body: _body(context),
    );
  }

  Widget _body(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _d == null) return AdminError(message: _error!, onRetry: _load);
    final d = _d!;
    final questions = _questions;
    final dist = {for (final l in cefrLevels) l: 0};
    for (final q in questions) {
      final l = J.s(q['cefr_level']);
      if (dist.containsKey(l)) dist[l] = dist[l]! + 1;
    }
    final thresholds = _parseThresholds(d['cefr_thresholds']);
    final points = questions.fold<num>(0, (t, q) => t + J.n(q['points']));
    final missingAudio = _co ? questions.where((q) => q['audio_kdrive_file_id'] == null).length : 0;
    final duration = J.i(d['duration_minutes']);
    final perQ = questions.isEmpty ? 0 : (duration * 60 / questions.length).round();
    final needle = _query.trim().toLowerCase();
    final shown = questions.where((q) {
      if (_level != 'all' && J.s(q['cefr_level']) != _level) return false;
      if (needle.isEmpty) return true;
      return [q['question_text'], q['option_a'], q['option_b'], q['option_c'], q['option_d']].map(J.s).join(' ').toLowerCase().contains(needle);
    }).toList();
    final reorderable = needle.isEmpty && _level == 'all';

    return AdminPage(
      onRefresh: _load,
      children: [
        AdminGrid(
          minTileWidth: 100,
          maxColumns: 3,
          spacing: 10,
          children: [
            StatTile(
              label: 'Questions',
              value: '${questions.length}',
              sub: missingAudio > 0 ? (fr ? '$missingAudio sans audio' : '$missingAudio without audio') : (_co ? (fr ? 'toutes avec audio' : 'all with audio') : (fr ? 'choix multiples' : 'multiple choice')),
              icon: Icons.help_outline,
              color: missingAudio > 0 ? AppColors.warn : _skill.color,
            ),
            StatTile(label: 'Points', value: AdminFmt.number(context, points), sub: fr ? 'score maximum' : 'maximum score', icon: Icons.star_outline, color: AppColors.good),
            StatTile(label: fr ? 'Durée' : 'Duration', value: '$duration min', sub: perQ > 0 ? (fr ? '≈ $perQ s par question' : '≈ $perQ s per question') : null, icon: Icons.timer_outlined, color: AppColors.warn),
          ],
        ),
        const SizedBox(height: 12),
        AdminCard(
          title: fr ? 'Niveaux · points requis' : 'Level mix · points needed',
          icon: Icons.stacked_bar_chart,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CefrBar(dist, height: 10),
              const SizedBox(height: 12),
              Wrap(
                spacing: 14,
                runSpacing: 8,
                children: [
                  for (final l in cefrLevels)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(mainAxisSize: MainAxisSize.min, children: [
                          Container(width: 9, height: 9, decoration: BoxDecoration(color: Pill.levelColor(l), borderRadius: BorderRadius.circular(3))),
                          const SizedBox(width: 5),
                          Text('$l · ${dist[l]}', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800)),
                        ]),
                        Text(thresholds[l] == null ? '—' : '≥ ${thresholds[l]} pts', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
                      ],
                    ),
                ],
              ),
            ],
          ),
        ),
        if (_introUrl != null) ...[
          const SizedBox(height: 12),
          AdminCard(
            title: fr ? 'Audio d’introduction' : 'Introduction audio',
            icon: Icons.headphones_outlined,
            child: AudioPreviewPlayer(audioUrl: _introUrl, title: J.s(d['intro_audio_file_name']).isEmpty ? (fr ? 'Joué avant la question 1' : 'Played before question 1') : J.s(d['intro_audio_file_name'])),
          ),
        ],
        const SizedBox(height: 14),
        AdminSearchField(hint: fr ? 'Rechercher dans les questions et réponses' : 'Search questions and answers', onChanged: (v) => setState(() => _query = v)),
        const SizedBox(height: 8),
        AdminFilterChips<String>(
          options: [
            FilterOption('all', fr ? 'Tous' : 'All', count: questions.length),
            for (final l in cefrLevels) if (dist[l]! > 0) FilterOption(l, l, count: dist[l]),
          ],
          selected: _level,
          onSelected: (v) => setState(() => _level = v),
        ),
        if (!reorderable && questions.length > 1)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Text(fr ? 'Effacez la recherche et le filtre pour réordonner.' : 'Clear the search and level filter to reorder questions.', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          ),
        const SizedBox(height: 10),
        if (questions.isEmpty)
          AdminCard(child: AdminEmpty(icon: Icons.help_outline, title: fr ? 'Aucune question' : 'No questions yet', message: fr ? 'Ajoutez la première question de la série.' : 'Add the first question of this series.'))
        else if (shown.isEmpty)
          AdminCard(child: AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucune question ne correspond' : 'No question matches'))
        else
          for (final q in shown)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _QuestionCard(
                q: q,
                skill: _skill,
                open: _open == J.i(q['id']),
                onToggle: () => setState(() => _open = _open == J.i(q['id']) ? null : J.i(q['id'])),
                canUp: reorderable && questions.indexOf(q) > 0,
                canDown: reorderable && questions.indexOf(q) < questions.length - 1,
                onUp: () => _move(questions.indexOf(q), -1),
                onDown: () => _move(questions.indexOf(q), 1),
                onEdit: () => _editQuestion(q),
                onDelete: () => _deleteQuestion(q),
              ),
            ),
        const SizedBox(height: 72),
      ],
    );
  }
}

class _QuestionCard extends ConsumerWidget {
  final Map<String, dynamic> q;
  final Skill skill;
  final bool open;
  final VoidCallback onToggle;
  final bool canUp;
  final bool canDown;
  final VoidCallback onUp;
  final VoidCallback onDown;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _QuestionCard({
    required this.q,
    required this.skill,
    required this.open,
    required this.onToggle,
    required this.canUp,
    required this.canDown,
    required this.onUp,
    required this.onDown,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fr = context.isFrench;
    final co = skill == Skill.co;
    final level = J.s(q['cefr_level']);
    final answer = J.s(q['correct_answer']);
    final hasImage = co ? q['image_kdrive_file_id'] != null : J.s(q['image_url']).isNotEmpty;
    final hasAudio = q['audio_kdrive_file_id'] != null;
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: open ? skill.color.withValues(alpha: 0.5) : AppColors.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            InkWell(
              borderRadius: BorderRadius.circular(14),
              onTap: onToggle,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 4, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    NumberBadge('${J.i(q['question_order'])}', color: skill.color, size: 34),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(J.s(q['question_text']).isNotEmpty ? J.s(q['question_text']) : J.s(q['passage_text']).replaceAll(RegExp(r'\*\*|\||\[image[^\]]*\]|-{3,}'), ' ').replaceAll(RegExp(r'\s+'), ' ').trim(), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), maxLines: open ? 20 : 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 5),
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Pill(level, color: Pill.levelColor(level)),
                              Text('${J.n(q['points'])} pts · ${fr ? 'réponse' : 'answer'} $answer', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                              if (hasImage) const Icon(Icons.image_outlined, size: 15, color: AppColors.textMuted),
                              if (co && !hasAudio) Pill(fr ? 'Sans audio' : 'No audio', color: AppColors.warn, icon: Icons.warning_amber_rounded),
                            ],
                          ),
                        ],
                      ),
                    ),
                    PopupMenuButton<VoidCallback>(
                      icon: const Icon(Icons.more_vert, color: AppColors.textMuted),
                      onSelected: (a) => a(),
                      itemBuilder: (_) => [
                        menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit', onEdit),
                        if (canUp) menuItem(Icons.arrow_upward, fr ? 'Monter' : 'Move up', onUp),
                        if (canDown) menuItem(Icons.arrow_downward, fr ? 'Descendre' : 'Move down', onDown),
                        menuItem(Icons.delete_outline, fr ? 'Supprimer' : 'Delete', onDelete, danger: true),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (open) _QuestionDetail(q: q, skill: skill),
          ],
        ),
      ),
    );
  }
}

class _QuestionDetail extends ConsumerStatefulWidget {
  final Map<String, dynamic> q;
  final Skill skill;
  const _QuestionDetail({required this.q, required this.skill});

  @override
  ConsumerState<_QuestionDetail> createState() => _QuestionDetailState();
}

class _QuestionDetailState extends ConsumerState<_QuestionDetail> {
  String? _audio;
  String? _image;

  @override
  void initState() {
    super.initState();
    _resolve();
  }

  Future<void> _resolve() async {
    final q = widget.q;
    final co = widget.skill == Skill.co;
    final audio = co && q['audio_kdrive_file_id'] != null ? await authedUrl(ref, '/tcf/co/questions/${q['id']}/audio') : null;
    // A reading document keeps its image when it needs one (shown under the text).
    final image = co
        ? (q['image_kdrive_file_id'] != null ? await authedUrl(ref, '/tcf/co/questions/${q['id']}/image') : null)
        : (J.s(q['image_url']).isNotEmpty ? await authedUrl(ref, J.s(q['image_url'])) : null);
    if (mounted) {
      setState(() {
        _audio = audio;
        _image = image;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final q = widget.q;
    final answer = J.s(q['correct_answer']);
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Divider(color: AppColors.borderSoft),
          if (_audio != null) ...[
            AudioPreviewPlayer(audioUrl: _audio, title: J.s(q['audio_file_name']).isEmpty ? null : J.s(q['audio_file_name'])),
            const SizedBox(height: 10),
          ],
          if (J.s(q['passage_text']).isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Skill.ce.color.withValues(alpha: 0.35)),
              ),
              child: CeDocumentView(J.s(q['passage_text'])),
            ),
            const SizedBox(height: 10),
          ],
          if (_image != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 260),
                child: Image.network(
                  _image!,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => Container(
                    height: 80,
                    color: AppColors.borderSoft,
                    alignment: Alignment.center,
                    child: Text(fr ? 'Image indisponible' : 'Image unavailable', style: AppTypography.caption),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 10),
          ],
          for (final k in ['A', 'B', 'C', 'D'])
            Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: answer == k ? AppColors.goodBg : AppColors.frenchPaper,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: answer == k ? AppColors.good.withValues(alpha: 0.4) : AppColors.borderSoft),
              ),
              child: Row(
                children: [
                  Text(k, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: answer == k ? AppColors.good : AppColors.textMuted)),
                  const SizedBox(width: 10),
                  Expanded(child: Text(J.s(q['option_${k.toLowerCase()}']).isEmpty ? '—' : J.s(q['option_${k.toLowerCase()}']), style: AppTypography.bodySmall)),
                  if (answer == k) const Icon(Icons.check_circle, color: AppColors.good, size: 18),
                ],
              ),
            ),
          if (widget.skill == Skill.ce)
            Container(
              margin: const EdgeInsets.only(top: 4),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: J.s(q['explanation']).isEmpty ? AppColors.frenchPaper : const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fr ? 'EXPLICATION' : 'EXPLANATION', style: AppTypography.caption.copyWith(fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: const Color(0xFF2563EB))),
                  const SizedBox(height: 3),
                  Text(
                    J.s(q['explanation']).isEmpty ? (fr ? 'Pas encore d’explication.' : 'No explanation yet.') : J.s(q['explanation']),
                    style: AppTypography.bodySmall.copyWith(height: 1.45, color: J.s(q['explanation']).isEmpty ? AppColors.textMuted : const Color(0xFF1E3A8A)),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

// ── Media picking ──────────────────────────────────────────────────────────

class _PickedFile {
  final String path;
  final String name;
  const _PickedFile(this.path, this.name);
}

Future<_PickedFile?> _pick(List<String> extensions) async {
  final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: extensions);
  final f = res?.files.single;
  if (f == null || f.path == null) return null;
  return _PickedFile(f.path!, f.name);
}

class _FileSlot extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? current;
  final _PickedFile? picked;
  final VoidCallback onPick;
  final VoidCallback? onClear;
  final bool required;

  const _FileSlot({required this.icon, required this.label, this.current, this.picked, required this.onPick, this.onClear, this.required = false});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final name = picked?.name ?? current;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
      child: Row(
        children: [
          Icon(icon, color: AppColors.adminAccent),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('$label${required ? ' *' : ''}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                Text(
                  name ?? (fr ? 'Aucun fichier' : 'No file'),
                  style: AppTypography.caption.copyWith(color: picked != null ? AppColors.good : AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (onClear != null && name != null) IconButton(onPressed: onClear, icon: const Icon(Icons.close, size: 18, color: AppColors.textMuted)),
          TextButton(onPressed: onPick, child: Text(name == null ? (fr ? 'Choisir' : 'Choose') : (fr ? 'Remplacer' : 'Replace'))),
        ],
      ),
    );
  }
}

const _audioExt = ['mp3', 'wav', 'ogg', 'm4a', 'webm'];
const _imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// ── Series editor ──────────────────────────────────────────────────────────

class SeriesEditor extends ConsumerStatefulWidget {
  final Skill skill;
  final int categoryId;
  final Map<String, dynamic>? series;
  const SeriesEditor({super.key, required this.skill, required this.categoryId, this.series});

  @override
  ConsumerState<SeriesEditor> createState() => _SeriesEditorState();
}

class _SeriesEditorState extends ConsumerState<SeriesEditor> {
  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: J.s(widget.series?['name']));
  late final _description = TextEditingController(text: J.s(widget.series?['description']));
  late final _duration = TextEditingController(text: widget.series == null ? '60' : '${J.i(widget.series!['duration_minutes'])}');
  late final Map<String, TextEditingController> _thresholds = () {
    final t = _parseThresholds(widget.series?['cefr_thresholds']);
    return {for (final l in cefrLevels) l: TextEditingController(text: t[l] == null ? '' : '${t[l]}')};
  }();
  _PickedFile? _intro;
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    _duration.dispose();
    for (final c in _thresholds.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (!_form.currentState!.validate()) return;
    final t = {for (final l in cefrLevels) l: parseNum(_thresholds[l]!.text) ?? 0};
    for (var i = 1; i < cefrLevels.length; i++) {
      if (t[cefrLevels[i]]! < t[cefrLevels[i - 1]]!) {
        adminToast(context, fr ? 'Les seuils doivent être croissants (A1 ≤ A2 ≤ … ≤ C2).' : 'Thresholds must go up: A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2.', error: true);
        return;
      }
    }
    setState(() => _saving = true);
    final editing = widget.series != null;
    final url = editing ? '${widget.skill.prefix}/series/${widget.series!['id']}' : '${widget.skill.prefix}/categories/${widget.categoryId}/series';
    final duration = parseNum(_duration.text)!.round();
    try {
      final api = ref.read(apiClientProvider);
      dynamic body;
      if (widget.skill == Skill.co) {
        body = FormData.fromMap({
          'name': _name.text.trim(),
          'description': _description.text.trim(),
          'duration_minutes': '$duration',
          'cefr_thresholds': jsonEncode(t),
          if (_intro != null) 'intro_audio': await MultipartFile.fromFile(_intro!.path, filename: _intro!.name),
        });
      } else {
        body = {
          'name': _name.text.trim(),
          'description': _description.text.trim().isEmpty ? null : _description.text.trim(),
          'duration_minutes': duration,
          'cefr_thresholds': t,
        };
      }
      if (editing) {
        await api.put(url, data: body);
      } else {
        await api.post(url, data: body);
      }
      if (!mounted) return;
      adminToast(context, editing ? (fr ? 'Série mise à jour' : 'Series updated') : (fr ? 'Série créée' : 'Series created'));
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final wide = wideForm(context);
    return Form(
      key: _form,
      child: AdminPanel(
        title: widget.series == null ? (fr ? 'Nouvelle série' : 'New series') : (fr ? 'Modifier la série' : 'Edit series'),
        subtitle: widget.skill.label(fr),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(fr ? 'Enregistrer' : 'Save', busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 10),
          AdminField(label: fr ? 'Nom' : 'Name', controller: _name, hint: 'Série 1', validator: (v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null),
          AdminField(label: 'Description', controller: _description, maxLines: 2),
          NumberField(label: fr ? 'Durée (minutes)' : 'Duration (minutes)', controller: _duration, min: 1),
          if (widget.skill == Skill.co)
            _FileSlot(
              icon: Icons.headphones_outlined,
              label: fr ? 'Audio d’introduction (facultatif)' : 'Introduction audio (optional)',
              current: J.s(widget.series?['intro_audio_file_name']).isEmpty ? null : J.s(widget.series?['intro_audio_file_name']),
              picked: _intro,
              onPick: () async {
                final f = await _pick(_audioExt);
                if (f != null) setState(() => _intro = f);
              },
            ),
          PanelSection(fr ? 'Seuils CECR (points minimum)' : 'CEFR thresholds (minimum points)'),
          Text(fr ? 'Valeurs croissantes : A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2' : 'Ascending: A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          const SizedBox(height: 10),
          FieldGrid(
            columns: wide ? 6 : 3,
            spacing: 8,
            children: [for (final l in cefrLevels) NumberField(label: l, controller: _thresholds[l]!, min: 0)],
          ),
        ],
      ),
    );
  }
}

// ── Question editor ────────────────────────────────────────────────────────

class QuestionEditor extends ConsumerStatefulWidget {
  final Skill skill;
  final int seriesId;
  final Map<String, dynamic>? question;
  const QuestionEditor({super.key, required this.skill, required this.seriesId, this.question});

  @override
  ConsumerState<QuestionEditor> createState() => _QuestionEditorState();
}

class _QuestionEditorState extends ConsumerState<QuestionEditor> {
  final _form = GlobalKey<FormState>();
  Map<String, dynamic>? get _q => widget.question;
  late final _text = TextEditingController(text: J.s(_q?['question_text']));
  late final _passage = TextEditingController(text: J.s(_q?['passage_text']));
  late final _explanation = TextEditingController(text: J.s(_q?['explanation']));
  late final _options = {for (final k in ['a', 'b', 'c', 'd']) k: TextEditingController(text: J.s(_q?['option_$k']))};
  late final _points = TextEditingController(text: _q == null ? '1' : '${J.n(_q!['points'])}');
  late String? _answer = _q == null ? null : J.s(_q!['correct_answer']);
  late String? _level = _q == null ? null : J.s(_q!['cefr_level']);
  _PickedFile? _audio;
  _PickedFile? _image;
  bool _removeImage = false;
  bool _saving = false;

  bool get _co => widget.skill == Skill.co;

  @override
  void dispose() {
    _text.dispose();
    _passage.dispose();
    _explanation.dispose();
    _points.dispose();
    for (final c in _options.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (!_form.currentState!.validate()) return;
    if (_answer == null || _level == null) {
      adminToast(context, fr ? 'Choisissez la bonne réponse et le niveau.' : 'Choose the correct answer and the level.', error: true);
      return;
    }
    if (_co && _q == null && _audio == null) {
      adminToast(context, fr ? 'L’audio est obligatoire en compréhension orale.' : 'An audio file is required for listening questions.', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      final body = FormData.fromMap({
        if (_audio != null) 'audio': await MultipartFile.fromFile(_audio!.path, filename: _audio!.name),
        if (_image != null) 'image': await MultipartFile.fromFile(_image!.path, filename: _image!.name),
        if (!_co && _q != null && _image == null && _removeImage) 'remove_image': 'true',
        'question_text': _text.text.trim(),
        if (!_co) 'passage_text': _passage.text.trim(),
        if (!_co) 'explanation': _explanation.text.trim(),
        for (final e in _options.entries) 'option_${e.key}': e.value.text.trim(),
        'correct_answer': _answer,
        'cefr_level': _level,
        'points': '${parseNum(_points.text) ?? 1}',
      });
      final api = ref.read(apiClientProvider);
      if (_q == null) {
        await api.post('${widget.skill.prefix}/series/${widget.seriesId}/questions', data: body);
      } else {
        await api.put('${widget.skill.prefix}/questions/${_q!['id']}', data: body);
      }
      if (!mounted) return;
      adminToast(context, _q == null ? (fr ? 'Question ajoutée' : 'Question added') : (fr ? 'Question mise à jour' : 'Question updated'));
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final wide = wideForm(context);
    String? required(String? v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null;
    final existingImage = _co ? J.s(_q?['image_file_name']) : (J.s(_q?['image_url']).isNotEmpty ? (fr ? 'Image actuelle' : 'Current image') : '');
    return Form(
      key: _form,
      child: AdminPanel(
        title: _q == null ? (fr ? 'Nouvelle question' : 'Add question') : (fr ? 'Question ${J.i(_q!['question_order'])}' : 'Question ${J.i(_q!['question_order'])}'),
        subtitle: widget.skill.label(fr),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(fr ? 'Enregistrer' : 'Save', busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 10),
          if (_co)
            _FileSlot(
              icon: Icons.headphones_outlined,
              label: 'Audio',
              required: _q == null,
              current: J.s(_q?['audio_file_name']).isEmpty ? null : J.s(_q?['audio_file_name']),
              picked: _audio,
              onPick: () async {
                final f = await _pick(_audioExt);
                if (f != null) setState(() => _audio = f);
              },
            ),
          _FileSlot(
            icon: Icons.image_outlined,
            label: fr ? 'Image (facultative)' : 'Image (optional)',
            current: _removeImage || existingImage.isEmpty ? null : existingImage,
            picked: _image,
            onPick: () async {
              final f = await _pick(_imageExt);
              if (f != null) setState(() => _image = f);
            },
            onClear: _co
                ? null
                : () => setState(() {
                      _image = null;
                      _removeImage = true;
                    }),
          ),
          if (!_co)
            AdminField(
              label: fr ? 'Document (le texte que lit l’apprenant)' : 'Document (the text learners read)',
              controller: _passage,
              maxLines: 8,
            ),
          AdminField(label: fr ? 'Énoncé' : 'Question text', controller: _text, maxLines: 3, validator: required),
          PanelSection(fr ? 'Options de réponse' : 'Answer options'),
          FieldGrid(
            columns: wide ? 2 : 1,
            children: [
              for (final e in _options.entries)
                AdminField(label: 'Option ${e.key.toUpperCase()}', controller: e.value, validator: required),
            ],
          ),
          PanelSection(fr ? 'Bonne réponse' : 'Correct answer'),
          SegmentedButton<String>(
            segments: [for (final k in ['A', 'B', 'C', 'D']) ButtonSegment(value: k, label: Text(k, style: const TextStyle(fontWeight: FontWeight.w800)))],
            selected: {?_answer},
            emptySelectionAllowed: true,
            showSelectedIcon: false,
            onSelectionChanged: (v) => setState(() => _answer = v.isEmpty ? null : v.first),
          ),
          PanelSection(fr ? 'Niveau CECR' : 'CEFR level'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final l in cefrLevels)
                ChoiceChip(
                  label: Text(l, style: TextStyle(fontWeight: FontWeight.w800, color: _level == l ? AppColors.pureWhite : Pill.levelColor(l))),
                  selected: _level == l,
                  selectedColor: Pill.levelColor(l),
                  showCheckmark: false,
                  onSelected: (_) => setState(() => _level = l),
                ),
            ],
          ),
          const SizedBox(height: 14),
          NumberField(label: 'Points', controller: _points, decimal: true, min: 0),
          if (!_co)
            AdminField(
              label: fr ? 'Explication (montrée dans la correction)' : 'Explanation (shown in the correction)',
              controller: _explanation,
              maxLines: 5,
            ),
        ],
      ),
    );
  }
}

// ── Listening analytics ────────────────────────────────────────────────────

/// How a student or a batch does in Compréhension Orale, on the 699-point scale.
class CoAnalyticsScreen extends ConsumerStatefulWidget {
  const CoAnalyticsScreen({super.key});

  @override
  ConsumerState<CoAnalyticsScreen> createState() => _CoAnalyticsScreenState();
}

class _CoAnalyticsScreenState extends ConsumerState<CoAnalyticsScreen> {
  String _mode = 'batch';
  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _batches = [];
  int? _selected;
  Map<String, dynamic>? _data;
  bool _loadingLists = true;
  bool _loading = false;
  String? _error;

  static String levelOf(num p) => p >= 600 ? 'C2' : p >= 500 ? 'C1' : p >= 400 ? 'B2' : p >= 300 ? 'B1' : p >= 200 ? 'A2' : 'A1';

  @override
  void initState() {
    super.initState();
    _lists();
  }

  Future<void> _lists() async {
    final api = ref.read(apiClientProvider);
    try {
      final r = await Future.wait([api.get('/users', queryParameters: {'role': 'student'}), api.get('/batches')]);
      if (!mounted) return;
      setState(() {
        _students = J.list(r[0].data, ['users'])..sort((a, b) => J.name(a).compareTo(J.name(b)));
        _batches = J.list(r[1].data, ['batches'])..sort((a, b) => J.s(a['name']).compareTo(J.s(b['name'])));
        _loadingLists = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _loadingLists = false;
          _error = apiErrorText(context, e);
        });
      }
    }
  }

  Future<void> _load(int id) async {
    setState(() {
      _selected = id;
      _loading = true;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/tcf/admin/co/analytics/${_mode == 'batch' ? 'batch' : 'student'}/$id');
      if (mounted) {
        setState(() {
          _data = J.map(res.data);
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _refresh() async {
    if (_selected != null) await _load(_selected!);
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final list = _mode == 'batch' ? _batches : _students;
    return ExamScaffold(
      title: fr ? 'Analyse de l’écoute' : 'Listening analytics',
      subtitle: fr ? 'Compréhension orale · score sur 699' : 'Compréhension orale · scored out of 699',
      skill: Skill.co,
      body: _loadingLists
          ? const AdminLoading()
          : AdminPage(
              onRefresh: _refresh,
              toolbar: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SegmentedButton<String>(
                    segments: [
                      ButtonSegment(value: 'batch', icon: const Icon(Icons.groups_outlined, size: 18), label: Text(fr ? 'Promotion' : 'Batch')),
                      ButtonSegment(value: 'student', icon: const Icon(Icons.person_outline, size: 18), label: Text(fr ? 'Étudiant' : 'Student')),
                    ],
                    selected: {_mode},
                    showSelectedIcon: false,
                    onSelectionChanged: (v) => setState(() {
                      _mode = v.first;
                      _selected = null;
                      _data = null;
                    }),
                  ),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<int>(
                    key: ValueKey(_mode),
                    initialValue: _selected,
                    isExpanded: true,
                    decoration: adminInputDecoration(_mode == 'batch' ? (fr ? 'Choisir une promotion' : 'Choose a batch') : (fr ? 'Choisir un étudiant' : 'Choose a student')),
                    items: [for (final x in list) DropdownMenuItem(value: J.i(x['id']), child: Text(_mode == 'batch' ? J.s(x['name']) : J.name(x), overflow: TextOverflow.ellipsis))],
                    onChanged: (v) => v == null ? null : _load(v),
                  ),
                ],
              ),
              children: [
                if (_loading)
                  const AdminLoading()
                else if (_error != null)
                  AdminError(message: _error!, onRetry: _refresh)
                else if (_data == null)
                  AdminCard(child: AdminEmpty(icon: Icons.insights_outlined, title: fr ? 'Choisissez qui analyser' : 'Choose who to analyse'))
                else if (_mode == 'batch')
                  ..._batch(context, _data!)
                else
                  ..._student(context, _data!),
              ],
            ),
    );
  }

  Widget _dist(String title, dynamic raw) {
    final m = J.map(raw);
    return AdminCard(
      title: title,
      icon: Icons.bar_chart,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          CefrBar({for (final l in cefrLevels) l: J.n(m[l])}, height: 10),
          const SizedBox(height: 10),
          Wrap(spacing: 12, runSpacing: 6, children: [
            for (final l in cefrLevels) Text('$l · ${J.i(m[l])}', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: Pill.levelColor(l))),
          ]),
        ],
      ),
    );
  }

  Widget _row(String name, String sub, String score, String level) => ListTile(
        dense: true,
        contentPadding: EdgeInsets.zero,
        title: Text(name, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(sub, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
        trailing: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(score, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.good)),
          const SizedBox(width: 8),
          if (level.isNotEmpty) Pill(level, color: Pill.levelColor(level)),
        ]),
      );

  List<Widget> _student(BuildContext context, Map<String, dynamic> d) {
    final fr = context.isFrench;
    return [
      AdminGrid(minTileWidth: 150, maxColumns: 4, spacing: 10, children: [
        StatTile(label: fr ? 'Tentatives' : 'Attempts', value: '${J.i(d['total_attempts'])}', icon: Icons.replay),
        StatTile(label: fr ? 'Séries faites' : 'Series practiced', value: '${J.i(d['series_count'])}', icon: Icons.library_books_outlined, color: const Color(0xFF7C3AED)),
        StatTile(label: fr ? 'Meilleur score moyen' : 'Avg best score', value: '${J.n(d['overall_earned'])}/${J.n(d['overall_total'])}', icon: Icons.emoji_events_outlined, color: AppColors.good),
        StatTile(label: fr ? 'Niveau' : 'Overall level', value: J.s(d['overall_level']).isEmpty ? '—' : J.s(d['overall_level']), icon: Icons.school_outlined, color: Pill.levelColor(J.s(d['overall_level']))),
      ]),
      const SizedBox(height: 12),
      _dist(fr ? 'Répartition CECR (toutes tentatives)' : 'CEFR distribution (all attempts)', d['cefr_distribution']),
      const SizedBox(height: 12),
      if (J.list(d['series_breakdown']).isNotEmpty)
        AdminCard(
          title: fr ? 'Par série' : 'Series breakdown',
          icon: Icons.emoji_events_outlined,
          child: Column(children: [
            for (final s in J.list(d['series_breakdown']))
              _row(J.s(s['series_name']), fr ? '${J.i(s['attempts'])} tentatives · dernier ${J.n(s['latest_earned'])}' : '${J.i(s['attempts'])} attempts · latest ${J.n(s['latest_earned'])}',
                  '${J.n(s['best_earned'])}/${J.n(s['best_total'])}', levelOf(J.n(s['best_earned']))),
          ]),
        ),
      const SizedBox(height: 12),
      if (J.list(d['recent_attempts']).isNotEmpty)
        AdminCard(
          title: fr ? 'Dernières tentatives' : 'Recent attempts',
          icon: Icons.history,
          child: Column(children: [
            for (final a in J.list(d['recent_attempts']).take(5))
              _row(J.s(a['series_name']), '', '${J.n(a['earned_points'])}/${J.n(a['total_points'])}', J.s(a['level'])),
          ]),
        ),
    ];
  }

  List<Widget> _batch(BuildContext context, Map<String, dynamic> d) {
    final fr = context.isFrench;
    final students = J.i(d['student_count']);
    final practiced = J.i(d['students_with_attempts']);
    return [
      AdminGrid(minTileWidth: 150, maxColumns: 5, spacing: 10, children: [
        StatTile(label: fr ? 'Étudiants' : 'Students', value: '$students', sub: fr ? '$practiced ont pratiqué' : '$practiced practiced', icon: Icons.groups_outlined),
        StatTile(label: fr ? 'Tentatives' : 'Attempts', value: '${J.i(d['total_attempts'])}', icon: Icons.replay, color: const Color(0xFF7C3AED)),
        StatTile(label: fr ? 'Moyenne' : 'Average', value: '${J.n(d['batch_avg'])}/699', icon: Icons.functions, color: AppColors.good),
        StatTile(label: fr ? 'Médiane' : 'Median', value: '${J.n(d['batch_median'])}', icon: Icons.align_vertical_center, color: AppColors.warn),
        StatTile(label: fr ? 'Niveau' : 'Batch level', value: J.s(d['overall_level']).isEmpty ? '—' : J.s(d['overall_level']), icon: Icons.school_outlined, color: Pill.levelColor(J.s(d['overall_level']))),
      ]),
      const SizedBox(height: 12),
      AdminGrid(minTileWidth: 320, maxColumns: 2, children: [
        _dist(fr ? 'Niveau des étudiants (meilleur score)' : 'Student levels (best score)', d['level_distribution_by_student']),
        _dist(fr ? 'Répartition CECR (toutes tentatives)' : 'CEFR distribution (all attempts)', d['cefr_distribution']),
      ]),
      const SizedBox(height: 12),
      if (J.list(d['leaderboard']).isNotEmpty)
        AdminCard(
          title: fr ? 'Classement' : 'Leaderboard',
          icon: Icons.emoji_events_outlined,
          child: Column(children: [
            for (final (i, s) in J.list(d['leaderboard']).indexed)
              _row('${['🥇', '🥈', '🥉'].elementAtOrNull(i) ?? '${i + 1}.'}  ${J.s(s['name'])}',
                  fr ? '${J.i(s['attempts'])} tentatives · moyenne ${J.n(s['avg_earned'])}' : '${J.i(s['attempts'])} attempts · avg ${J.n(s['avg_earned'])}',
                  '${J.n(s['best_earned'])}/${J.n(s['best_total'])}', J.s(s['level'])),
          ]),
        ),
      const SizedBox(height: 12),
      if (J.list(d['series_stats']).isNotEmpty)
        AdminCard(
          title: fr ? 'Par série' : 'Series performance',
          icon: Icons.library_books_outlined,
          child: Column(children: [
            for (final s in J.list(d['series_stats']))
              _row(J.s(s['series_name']), fr ? '${J.i(s['student_count'])} étudiants · moyenne ${J.n(s['avg_earned'])}' : '${J.i(s['student_count'])} students · avg ${J.n(s['avg_earned'])}',
                  '${J.n(s['best_earned'])}', J.s(s['level'])),
          ]),
        ),
      const SizedBox(height: 12),
      if (J.list(d['per_student']).isNotEmpty)
        AdminCard(
          title: fr ? 'Tous les étudiants' : 'All students',
          icon: Icons.people_outline,
          child: Column(children: [
            for (final s in J.list(d['per_student']))
              _row(J.s(s['name']), fr ? '${J.i(s['attempts'])} tentatives' : '${J.i(s['attempts'])} attempts',
                  J.i(s['attempts']) > 0 ? '${J.n(s['best_earned'])}/${J.n(s['best_total'])}' : (fr ? 'Aucune' : 'None'), J.s(s['level'])),
          ]),
        ),
    ];
  }
}
