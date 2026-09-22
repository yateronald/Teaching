import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/token_storage.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/sliver_sticky_header_delegate.dart';
import '../widgets/resource_preview_dialog.dart';
import 'resource_upload_sheet.dart';

class ResourcesScreen extends ConsumerStatefulWidget {
  const ResourcesScreen({super.key});

  @override
  ConsumerState<ResourcesScreen> createState() => _ResourcesScreenState();
}

class _ResourcesScreenState extends ConsumerState<ResourcesScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _resources = [];
  List<dynamic> _batches = [];
  String _selectedCategory = 'all'; // all, pdf, audio, video, image, document
  String _search = '';
  int? _selectedBatchId;
  bool _isGridView = false;

  final List<Map<String, dynamic>> _categories = [
    {'id': 'all', 'label': 'Tous', 'icon': Icons.folder_open},
    {'id': 'pdf', 'label': 'PDFs', 'icon': Icons.picture_as_pdf_outlined},
    {'id': 'audio', 'label': 'Audio', 'icon': Icons.headphones_outlined},
    {'id': 'video', 'label': 'Vidéos', 'icon': Icons.videocam_outlined},
    {'id': 'image', 'label': 'Images', 'icon': Icons.image_outlined},
    {
      'id': 'document',
      'label': 'Documents',
      'icon': Icons.description_outlined,
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait<dynamic>([
        client.get('/resources'),
        client.get('/batches'),
      ]);

      final resData = results[0].data;
      final batchData = results[1].data;

      if (mounted) {
        setState(() {
          _resources = resData is List
              ? resData
              : (resData?['resources'] ?? resData?['data'] ?? []);
          _batches = batchData is List
              ? batchData
              : (batchData?['batches'] ?? batchData?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger la médiathèque pédagogique.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _deleteResource(int id) async {
    try {
      final client = ref.read(apiClientProvider);
      await client.delete('/resources/$id');
      _fetchData();
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Ressource supprimée.')));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Échec de la suppression.')),
        );
      }
    }
  }

  Future<void> _openResource(Map<String, dynamic> r) async {
    final client = ref.read(apiClientProvider);
    final baseUrl = client.dio.options.baseUrl;
    final token = await TokenStorage().getToken();
    final previewUrl = '$baseUrl/resources/${r['id']}/preview?token=$token';
    final downloadUrl = '$baseUrl/resources/${r['id']}/download?token=$token';

    if (!mounted) return;
    ResourcePreviewDialog.show(
      context,
      resource: r,
      previewUrl: previewUrl,
      downloadUrl: downloadUrl,
    );
  }

  String _formatSize(dynamic bytes) {
    final b = (bytes as num?)?.toDouble() ?? 0.0;
    if (b < 1024) return '$b B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)} Ko';
    return '${(b / (1024 * 1024)).toStringAsFixed(1)} Mo';
  }

  IconData _getIconForCategory(String cat) {
    switch (cat.toLowerCase()) {
      case 'pdf':
        return Icons.picture_as_pdf_outlined;
      case 'audio':
        return Icons.headphones_outlined;
      case 'video':
        return Icons.videocam_outlined;
      case 'image':
        return Icons.image_outlined;
      default:
        return Icons.description_outlined;
    }
  }

  Color _getColorForCategory(String cat) {
    switch (cat.toLowerCase()) {
      case 'pdf':
        return AppColors.bad;
      case 'audio':
        return AppColors.frenchBlue;
      case 'video':
        return AppColors.teacherAccent;
      case 'image':
        return AppColors.frenchGold;
      default:
        return AppColors.good;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    final filtered = _resources.where((r) {
      final map = r as Map<String, dynamic>;
      final cat = (map['category'] ?? 'document').toString().toLowerCase();
      if (_selectedCategory != 'all' && cat != _selectedCategory) return false;

      if (_selectedBatchId != null) {
        final bIds = map['batch_ids'];
        if (bIds is List && !bIds.contains(_selectedBatchId)) return false;
      }

      if (_search.isNotEmpty) {
        final title = (map['title'] ?? '').toString().toLowerCase();
        final desc = (map['description'] ?? '').toString().toLowerCase();
        final fn = (map['file_name'] ?? '').toString().toLowerCase();
        final q = _search.toLowerCase();
        if (!title.contains(q) && !desc.contains(q) && !fn.contains(q)) {
          return false;
        }
      }

      return true;
    }).toList();

    final insets = ResponsiveLayout.pageInsets(context);

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: AppColors.frenchNavy,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // 1. Header (Scrolls away)
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(insets.left, insets.top, insets.right, 0),
              child: AdaptiveContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Médiathèque Pédagogique',
                                style: AppTypography.headlineMedium.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.frenchNavy,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Partagez documents, fiches d\'exercices, audios et supports de cours.',
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        CustomButton(
                          text: 'Téléverser',
                          icon: Icons.upload_file,
                          height: 44,
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.transparent,
                              builder: (context) => ResourceUploadSheet(
                                batches: _batches,
                                onUploaded: _fetchData,
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),

          // 2. Sticky Search Bar & Categories Filter (Pins to top on scroll)
          SliverPersistentHeader(
            pinned: true,
            delegate: SliverStickyHeaderDelegate(
              height: 112.0,
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  border: const Border(
                    bottom: BorderSide(color: AppColors.borderSoft, width: 1),
                  ),
                ),
                padding: EdgeInsets.fromLTRB(insets.left, 4, insets.right, 6),
                alignment: Alignment.center,
                child: AdaptiveContent(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Search Bar & View Toggle
                      Row(
                        children: [
                          Expanded(
                            child: CustomTextField(
                              hintText: 'Rechercher un document...',
                              prefixIcon: Icons.search,
                              onChanged: (val) => setState(() => _search = val),
                            ),
                          ),
                          const SizedBox(width: 10),
                          IconButton(
                            icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
                            tooltip: _isGridView ? 'Vue liste' : 'Vue grille',
                            onPressed: () => setState(() => _isGridView = !_isGridView),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Categories horizontal bar
                      SizedBox(
                        height: 38,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _categories.length,
                          separatorBuilder: (context, index) => const SizedBox(width: 8),
                          itemBuilder: (context, idx) {
                            final cat = _categories[idx];
                            final isSelected = _selectedCategory == cat['id'];

                            return FilterChip(
                              avatar: Icon(
                                cat['icon'] as IconData,
                                size: 16,
                                color: isSelected
                                    ? AppColors.pureWhite
                                    : AppColors.frenchNavy,
                              ),
                              label: Text(cat['label'] as String),
                              selected: isSelected,
                              selectedColor: AppColors.frenchNavy,
                              backgroundColor: AppColors.pureWhite,
                              checkmarkColor: AppColors.pureWhite,
                              labelStyle: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? AppColors.pureWhite
                                    : AppColors.text,
                              ),
                              side: BorderSide(
                                color: isSelected
                                    ? AppColors.frenchNavy
                                    : AppColors.border,
                              ),
                              onSelected: (_) => setState(
                                () => _selectedCategory = cat['id'] as String,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 3. Content: Grid or Table View
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(insets.left, 16, insets.right, insets.bottom),
              child: AdaptiveContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(48),
                          child: CircularProgressIndicator(
                            color: AppColors.frenchNavy,
                          ),
                        ),
                      )
                    else if (_error != null)
                      EmptyState(
                        title: 'Erreur',
                        message: _error!,
                        icon: Icons.cloud_off_outlined,
                        actionText: 'Réessayer',
                        onAction: _fetchData,
                      )
                    else if (filtered.isEmpty)
                      EmptyState(
                        title: 'Aucune ressource',
                        message: _search.isNotEmpty
                            ? 'Aucun document ne correspond à votre recherche.'
                            : 'Aucune ressource dans cette catégorie.',
                        icon: Icons.folder_open,
                        actionText: 'Téléverser un document',
                        onAction: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => ResourceUploadSheet(
                              batches: _batches,
                              onUploaded: _fetchData,
                            ),
                          );
                        },
                      )
                    else if (_isGridView)
                      GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: isTablet ? 3 : 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: filtered.length,
                        itemBuilder: (context, idx) {
                          final r = filtered[idx] as Map<String, dynamic>;
                          final cat = (r['category'] ?? 'document').toString();
                          final icon = _getIconForCategory(cat);
                          final color = _getColorForCategory(cat);

                          return InkWell(
                            onTap: () => _openResource(r),
                            borderRadius: BorderRadius.circular(14),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: AppColors.pureWhite,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: AppColors.border,
                                  width: 1.1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: color.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Icon(icon, size: 22, color: color),
                                      ),
                                      IconButton(
                                        icon: const Icon(
                                          Icons.delete_outline,
                                          size: 18,
                                          color: AppColors.bad,
                                        ),
                                        onPressed: () => _deleteResource(r['id']),
                                      ),
                                    ],
                                  ),
                                  const Spacer(),
                                  Text(
                                    r['title'] ?? 'Sans titre',
                                    style: AppTypography.bodySmall.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.ink,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _formatSize(r['file_size']),
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textSubtle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      )
                    else
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border, width: 1.1),
                        ),
                        child: Column(
                          children: [
                            if (isTablet) _buildResourceTableHeader(),
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: filtered.length,
                              separatorBuilder: (context, index) => const Divider(
                                height: 1,
                                color: AppColors.borderSoft,
                              ),
                              itemBuilder: (context, idx) => _buildResourceRow(
                                filtered[idx] as Map<String, dynamic>,
                                isTablet: isTablet,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceTableHeader() {
    final style = AppTypography.caption.copyWith(
      color: AppColors.textMuted,
      fontWeight: FontWeight.w700,
      letterSpacing: 0.3,
    );

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      decoration: const BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
        border: Border(bottom: BorderSide(color: AppColors.borderSoft)),
      ),
      child: Row(
        children: [
          const SizedBox(width: 52),
          Expanded(flex: 4, child: Text('DOCUMENT', style: style)),
          SizedBox(width: 92, child: Text('TYPE', style: style)),
          Expanded(flex: 2, child: Text('PROMOTIONS', style: style)),
          SizedBox(width: 76, child: Text('TAILLE', style: style)),
          SizedBox(
            width: 96,
            child: Text('ACTIONS', style: style, textAlign: TextAlign.center),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceRow(
    Map<String, dynamic> resource, {
    required bool isTablet,
  }) {
    final category = (resource['category'] ?? 'document').toString();
    final icon = _getIconForCategory(category);
    final color = _getColorForCategory(category);
    final title = resource['title'] ?? 'Document';
    final batches = resource['batch_names'] ?? 'Toutes promotions';

    final actions = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(
            Icons.visibility_outlined,
            size: 18,
            color: AppColors.frenchNavy,
          ),
          tooltip: 'Aperçu',
          visualDensity: VisualDensity.compact,
          padding: const EdgeInsets.all(6),
          constraints: const BoxConstraints(),
          onPressed: () => _openResource(resource),
        ),
        const SizedBox(width: 4),
        IconButton(
          icon: const Icon(
            Icons.delete_outline,
            size: 18,
            color: AppColors.bad,
          ),
          tooltip: 'Supprimer',
          visualDensity: VisualDensity.compact,
          padding: const EdgeInsets.all(6),
          constraints: const BoxConstraints(),
          onPressed: () => _deleteResource(resource['id']),
        ),
      ],
    );

    if (!isTablet) {
      return ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        onTap: () => _openResource(resource),
        leading: _resourceIcon(icon, color),
        title: Text(
          title,
          style: AppTypography.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.ink,
          ),
        ),
        subtitle: Text(
          '${category.toUpperCase()} · ${_formatSize(resource['file_size'])} · $batches',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: actions,
      );
    }

    return InkWell(
      onTap: () => _openResource(resource),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        child: Row(
          children: [
            SizedBox(
              width: 52,
              child: Align(
                alignment: Alignment.centerLeft,
                child: _resourceIcon(icon, color),
              ),
            ),
            Expanded(
              flex: 4,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                    ),
                  ),
                  if (resource['file_name'] != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      resource['file_name'].toString(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textSubtle,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            SizedBox(
              width: 92,
              child: Text(
                category.toUpperCase(),
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                batches.toString(),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),
            SizedBox(
              width: 76,
              child: Text(
                _formatSize(resource['file_size']),
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),
            SizedBox(width: 96, child: actions),
          ],
        ),
      ),
    );
  }

  Widget _resourceIcon(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, size: 22, color: color),
    );
  }
}
