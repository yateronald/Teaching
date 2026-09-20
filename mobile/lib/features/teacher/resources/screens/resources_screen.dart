import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/token_storage.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/audio_preview_player.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
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
    {'id': 'document', 'label': 'Documents', 'icon': Icons.description_outlined},
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
          _resources = resData is List ? resData : (resData?['resources'] ?? resData?['data'] ?? []);
          _batches = batchData is List ? batchData : (batchData?['batches'] ?? batchData?['data'] ?? []);
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
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ressource supprimée.')),
        );
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
    final fileUrl = '$baseUrl/resources/${r['id']}/download?token=$token';

    final category = (r['category'] ?? '').toString().toLowerCase();

    if (category == 'audio') {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(r['title'] ?? 'Lecture audio', style: AppTypography.titleMedium),
          content: AudioPreviewPlayer(
            audioUrl: fileUrl,
            title: r['file_name'] ?? 'Fichier audio',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Fermer'),
            ),
          ],
        ),
      );
      return;
    }

    final uri = Uri.parse(fileUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Impossible d\'ouvrir le lien de la ressource.')),
        );
      }
    }
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
        if (!title.contains(q) && !desc.contains(q) && !fn.contains(q)) return false;
      }

      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchData,
      color: AppColors.frenchNavy,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isTablet ? 32 : 16,
          vertical: 24,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
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
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
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
            const SizedBox(height: 20),

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
            const SizedBox(height: 14),

            // Categories horizontal bar
            SizedBox(
              height: 40,
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
                      color: isSelected ? AppColors.pureWhite : AppColors.frenchNavy,
                    ),
                    label: Text(cat['label'] as String),
                    selected: isSelected,
                    selectedColor: AppColors.frenchNavy,
                    backgroundColor: AppColors.pureWhite,
                    checkmarkColor: AppColors.pureWhite,
                    labelStyle: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isSelected ? AppColors.pureWhite : AppColors.text,
                    ),
                    side: BorderSide(color: isSelected ? AppColors.frenchNavy : AppColors.border),
                    onSelected: (_) => setState(() => _selectedCategory = cat['id'] as String),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Content
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: CircularProgressIndicator(color: AppColors.frenchNavy),
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
                        border: Border.all(color: AppColors.border, width: 1.1),
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
                                icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.bad),
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
                            style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
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
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filtered.length,
                  separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                  itemBuilder: (context, idx) {
                    final r = filtered[idx] as Map<String, dynamic>;
                    final cat = (r['category'] ?? 'document').toString();
                    final icon = _getIconForCategory(cat);
                    final color = _getColorForCategory(cat);

                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      leading: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(icon, size: 22, color: color),
                      ),
                      title: Text(
                        r['title'] ?? 'Document',
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      subtitle: Text(
                        '${cat.toUpperCase()} · ${_formatSize(r['file_size'])} · ${r['batch_names'] ?? "Toutes promotions"}',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.open_in_new, size: 18, color: AppColors.frenchNavy),
                            tooltip: 'Ouvrir',
                            onPressed: () => _openResource(r),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.bad),
                            tooltip: 'Supprimer',
                            onPressed: () => _deleteResource(r['id']),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}
