import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/token_storage.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../teacher/resources/widgets/resource_preview_dialog.dart';
import '../batches/batch_utils.dart';
import '../common/admin_kit.dart';

/// Every file teachers shared: the library by type, who shares and which
/// active batches have nothing yet, with preview, download and delete.
class AdminResourcesScreen extends ConsumerStatefulWidget {
  const AdminResourcesScreen({super.key});

  @override
  ConsumerState<AdminResourcesScreen> createState() => _AdminResourcesScreenState();
}

class _AdminResourcesScreenState extends ConsumerState<AdminResourcesScreen> {
  static const _types = ['pdf', 'video', 'audio', 'image', 'document'];
  List<Map<String, dynamic>> _items = [];
  List<Map<String, dynamic>> _teachers = [];
  List<Map<String, dynamic>> _batches = [];
  bool _loading = true;
  String? _error;
  String? _type;
  int? _teacher;
  int? _batch;
  String _sort = 'newest';
  String _q = '';
  int _limit = 30;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _items.isEmpty;
      _error = null;
    });
    final api = ref.read(apiClientProvider);
    try {
      final r = await Future.wait<dynamic>([
        api.get('/resources'),
        api.get('/users', queryParameters: {'role': 'teacher'}).then<dynamic>((v) => v).catchError((_) => null),
        api.get('/batches').then<dynamic>((v) => v).catchError((_) => null),
      ]);
      if (!mounted) return;
      setState(() {
        _items = J.list(r[0].data, ['resources']);
        _teachers = r[1] == null ? [] : J.list(r[1].data, ['users']);
        _batches = r[2] == null ? [] : J.list(r[2].data, ['batches']);
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

  static String typeOf(Map<String, dynamic> r) => _types.contains(J.s(r['category'])) ? J.s(r['category']) : 'document';

  static IconData typeIcon(String t) => const {
        'pdf': Icons.picture_as_pdf_outlined,
        'video': Icons.movie_outlined,
        'audio': Icons.graphic_eq,
        'image': Icons.image_outlined,
      }[t] ??
      Icons.description_outlined;

  static Color typeColor(String t) => const {
        'pdf': Color(0xFFDC2626),
        'video': Color(0xFF7C3AED),
        'audio': Color(0xFF0891B2),
        'image': Color(0xFF059669),
      }[t] ??
      const Color(0xFF2563EB);

  static String typeLabel(String t, bool fr) => {
        'pdf': 'PDF',
        'video': fr ? 'Vidéos' : 'Videos',
        'audio': 'Audio',
        'image': 'Images',
      }[t] ??
      'Documents';

  static List<int> batchIds(Map<String, dynamic> r) => r['batch_ids'] is List ? (r['batch_ids'] as List).where((x) => x != null).map(J.i).toList() : const [];

  static String size(num b) {
    if (b <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    final i = math.min(units.length - 1, (math.log(b) / math.log(1024)).floor());
    final v = b / math.pow(1024, i);
    return '${v.toStringAsFixed(v >= 10 || i == 0 ? 0 : 1)} ${units[i]}';
  }

  Future<void> _open(Map<String, dynamic> r) async {
    final base = ref.read(apiClientProvider).dio.options.baseUrl;
    final token = await TokenStorage().getToken();
    if (!mounted) return;
    ResourcePreviewDialog.show(
      context,
      resource: r,
      previewUrl: '$base/resources/${r['id']}/preview?token=$token',
      downloadUrl: '$base/resources/${r['id']}/download?token=$token',
    );
  }

  Future<void> _delete(Map<String, dynamic> r) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer « ${J.s(r['title'])} » ?' : 'Delete “${J.s(r['title'])}”?',
      message: fr ? 'Le fichier est retiré pour tous les étudiants et supprimé du stockage.' : 'The file is removed for every student and deleted from storage.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('/resources/${J.i(r['id'])}');
      if (!mounted) return;
      setState(() => _items.removeWhere((x) => J.i(x['id']) == J.i(r['id'])));
      adminToast(context, fr ? 'Ressource supprimée' : 'Resource deleted');
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _items.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final q = _q.trim().toLowerCase();
    final scoped = _items.where((r) {
      if (_teacher != null && J.i(r['teacher_id']) != _teacher) return false;
      if (_batch != null && !batchIds(r).contains(_batch)) return false;
      return q.isEmpty || '${J.s(r['title'])} ${J.s(r['file_name'])} ${J.s(r['description'])} ${J.s(r['batch_names'])}'.toLowerCase().contains(q);
    }).toList();
    final list = scoped.where((r) => _type == null || typeOf(r) == _type).toList()
      ..sort((a, b) {
        switch (_sort) {
          case 'oldest':
            return J.s(a['created_at']).compareTo(J.s(b['created_at']));
          case 'name':
            return J.s(a['title']).toLowerCase().compareTo(J.s(b['title']).toLowerCase());
          case 'size':
            return J.n(b['file_size']).compareTo(J.n(a['file_size']));
          default:
            return J.s(b['created_at']).compareTo(J.s(a['created_at']));
        }
      });
    final totalSize = scoped.fold<num>(0, (s, r) => s + J.n(r['file_size']));
    final newThisWeek = scoped.where((r) => (J.date(r['created_at']) ?? DateTime(2000)).isAfter(DateTime.now().subtract(const Duration(days: 7)))).length;

    final byTeacher = <int, (String, int)>{};
    for (final r in scoped) {
      final id = J.i(r['teacher_id']);
      final name = J.name(r, first: 'teacher_first_name', last: 'teacher_last_name');
      byTeacher[id] = (name.isEmpty ? (fr ? 'Professeur inconnu' : 'Unknown teacher') : name, (byTeacher[id]?.$2 ?? 0) + 1);
    }
    final topTeachers = byTeacher.values.toList()..sort((a, b) => b.$2.compareTo(a.$2));
    final sharing = _items.map((r) => J.i(r['teacher_id'])).toSet();
    final silent = _teachers.where((t) => !sharing.contains(J.i(t['id']))).toList();
    final covered = _items.expand(batchIds).toSet();
    final bare = _batches.where((b) => BatchX.status(b) != 'ended' && !covered.contains(J.i(b['id']))).toList();

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(child: AdminSearchField(hint: fr ? 'Titre, fichier ou promotion' : 'Title, file or batch', onChanged: (v) => setState(() => _q = v))),
              const SizedBox(width: 8),
              PopupMenuButton<String>(
                tooltip: fr ? 'Trier' : 'Sort',
                initialValue: _sort,
                onSelected: (v) => setState(() => _sort = v),
                icon: const Icon(Icons.sort, color: AppColors.textMuted),
                itemBuilder: (_) => [
                  PopupMenuItem(value: 'newest', child: Text(fr ? 'Plus récents' : 'Newest')),
                  PopupMenuItem(value: 'oldest', child: Text(fr ? 'Plus anciens' : 'Oldest')),
                  PopupMenuItem(value: 'name', child: Text(fr ? 'Nom' : 'Name')),
                  PopupMenuItem(value: 'size', child: Text(fr ? 'Taille' : 'Size')),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: AdminFilterChips<String?>(
                  options: [
                    FilterOption<String?>(null, fr ? 'Tous' : 'All', count: scoped.length),
                    for (final t in _types) FilterOption<String?>(t, typeLabel(t, fr), count: scoped.where((r) => typeOf(r) == t).length),
                  ],
                  selected: _type,
                  onSelected: (v) => setState(() => _type = v),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            children: [
              _Menu(
                icon: Icons.person_outline,
                label: _teacher == null ? (fr ? 'Professeur' : 'Teacher') : J.name(_teachers.firstWhere((t) => J.i(t['id']) == _teacher, orElse: () => const {})),
                active: _teacher != null,
                items: [(null, fr ? 'Tous les professeurs' : 'All teachers'), for (final t in _teachers) (J.i(t['id']), J.name(t))],
                onSelected: (v) => setState(() => _teacher = v),
              ),
              _Menu(
                icon: Icons.groups_outlined,
                label: _batch == null ? (fr ? 'Promotion' : 'Batch') : J.s(_batches.firstWhere((b) => J.i(b['id']) == _batch, orElse: () => const {})['name']),
                active: _batch != null,
                items: [(null, fr ? 'Toutes les promotions' : 'All batches'), for (final b in _batches) (J.i(b['id']), J.s(b['name']))],
                onSelected: (v) => setState(() => _batch = v),
              ),
            ],
          ),
        ],
      ),
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(label: fr ? 'Fichiers' : 'Files', value: '${scoped.length}', icon: Icons.folder_open_outlined),
            StatTile(label: fr ? 'Espace utilisé' : 'Storage used', value: size(totalSize), icon: Icons.storage_outlined, color: const Color(0xFF0891B2)),
            StatTile(label: fr ? 'Nouveaux (7 j)' : 'New (7 days)', value: '$newThisWeek', icon: Icons.fiber_new_outlined, color: AppColors.good),
            StatTile(label: fr ? 'Professeurs qui partagent' : 'Teachers sharing', value: '${byTeacher.length}', sub: silent.isEmpty ? null : (fr ? '${silent.length} sans fichier' : '${silent.length} with no file'), icon: Icons.co_present_outlined, color: const Color(0xFF7C3AED)),
          ],
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 320,
          maxColumns: 2,
          children: [
            AdminCard(
              title: fr ? 'Qui partage' : 'Who shares',
              icon: Icons.leaderboard_outlined,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  for (final t in topTeachers.take(5))
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 5),
                      child: Row(
                        children: [
                          Expanded(flex: 3, child: Text(t.$1, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          Expanded(
                            flex: 4,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(value: t.$2 / math.max(1, topTeachers.first.$2), minHeight: 6, color: AppColors.adminAccent, backgroundColor: AppColors.borderSoft),
                            ),
                          ),
                          SizedBox(width: 32, child: Text('${t.$2}', textAlign: TextAlign.right, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800))),
                        ],
                      ),
                    ),
                  if (silent.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      fr ? 'Aucun fichier : ${silent.take(4).map(J.name).join(', ')}${silent.length > 4 ? '…' : ''}' : 'No files yet: ${silent.take(4).map(J.name).join(', ')}${silent.length > 4 ? '…' : ''}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ],
              ),
            ),
            AdminCard(
              title: fr ? 'Promotions sans ressource' : 'Batches without resources',
              icon: Icons.inventory_2_outlined,
              accent: bare.isEmpty ? AppColors.good : AppColors.warn,
              child: bare.isEmpty
                  ? Text(fr ? 'Chaque promotion active a au moins un fichier.' : 'Every active batch has at least one file.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
                  : Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        for (final b in bare.take(10))
                          Chip(
                            avatar: Pill.level(J.s(b['french_level'])),
                            label: Text(J.s(b['name']), style: AppTypography.caption),
                            backgroundColor: AppColors.pureWhite,
                            side: const BorderSide(color: AppColors.border),
                          ),
                      ],
                    ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (list.isEmpty)
          AdminCard(child: AdminEmpty(icon: Icons.folder_off_outlined, title: fr ? 'Aucun fichier' : 'No files', message: fr ? 'Aucune ressource ne correspond.' : 'No resource matches these filters.'))
        else
          AdminGrid(
            minTileWidth: 330,
            maxColumns: 3,
            spacing: 10,
            children: [for (final r in list.take(_limit)) _ResourceCard(r: r, onOpen: () => _open(r), onDelete: () => _delete(r))],
          ),
        if (list.length > _limit)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Center(child: AdminButton(fr ? 'Afficher plus' : 'Show more', primary: false, onPressed: () => setState(() => _limit += 30))),
          ),
      ],
    );
  }
}

class _Menu extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final List<(int?, String)> items;
  final ValueChanged<int?> onSelected;
  const _Menu({required this.icon, required this.label, required this.active, required this.items, required this.onSelected});

  @override
  Widget build(BuildContext context) => PopupMenuButton<int>(
        onSelected: (v) => onSelected(v == -1 ? null : v),
        itemBuilder: (_) => [for (final i in items) PopupMenuItem(value: i.$1 ?? -1, child: Text(i.$2))],
        child: Chip(
          avatar: Icon(icon, size: 16),
          label: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 140), child: Text(label, overflow: TextOverflow.ellipsis)),
          backgroundColor: active ? AppColors.adminAccentBg : AppColors.pureWhite,
          side: BorderSide(color: active ? AppColors.adminAccent : AppColors.border),
          visualDensity: VisualDensity.compact,
        ),
      );
}

class _ResourceCard extends StatelessWidget {
  final Map<String, dynamic> r;
  final VoidCallback onOpen;
  final VoidCallback onDelete;
  const _ResourceCard({required this.r, required this.onOpen, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final t = _AdminResourcesScreenState.typeOf(r);
    final color = _AdminResourcesScreenState.typeColor(t);
    final teacher = J.name(r, first: 'teacher_first_name', last: 'teacher_last_name');
    final created = J.date(r['created_at']);
    final isNew = created != null && created.isAfter(DateTime.now().subtract(const Duration(days: 7)));
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onOpen,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                child: Icon(_AdminResourcesScreenState.typeIcon(t), color: color),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(J.s(r['title']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 2, overflow: TextOverflow.ellipsis)),
                        if (isNew) Pill(fr ? 'Nouveau' : 'New', color: AppColors.good),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${teacher.isEmpty ? '—' : teacher} · ${_AdminResourcesScreenState.size(J.n(r['file_size']))} · ${AdminFmt.dayShort(context, created)}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (J.s(r['batch_names']).isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(J.s(r['batch_names']), style: AppTypography.caption.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20, color: AppColors.textMuted),
                onSelected: (v) => v == 'open' ? onOpen() : onDelete(),
                itemBuilder: (_) => [
                  PopupMenuItem(value: 'open', child: Text(fr ? 'Ouvrir' : 'Open')),
                  PopupMenuItem(value: 'delete', child: Text(fr ? 'Supprimer' : 'Delete', style: const TextStyle(color: AppColors.bad))),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
