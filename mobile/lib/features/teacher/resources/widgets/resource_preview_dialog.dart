import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/widgets/audio_preview_player.dart';

class ResourcePreviewDialog extends StatefulWidget {
  final Map<String, dynamic> resource;
  final String previewUrl;
  final String downloadUrl;

  const ResourcePreviewDialog({
    super.key,
    required this.resource,
    required this.previewUrl,
    required this.downloadUrl,
  });

  static void show(
    BuildContext context, {
    required Map<String, dynamic> resource,
    required String previewUrl,
    required String downloadUrl,
  }) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => ResourcePreviewDialog(
        resource: resource,
        previewUrl: previewUrl,
        downloadUrl: downloadUrl,
      ),
    );
  }

  @override
  State<ResourcePreviewDialog> createState() => _ResourcePreviewDialogState();
}

class _ResourcePreviewDialogState extends State<ResourcePreviewDialog> {
  bool _isOpening = false;

  String _formatSize(dynamic bytes) {
    final b = (bytes as num?)?.toDouble() ?? 0.0;
    if (b < 1024) return '$b B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)} Ko';
    return '${(b / (1024 * 1024)).toStringAsFixed(1)} Mo';
  }

  String _formatDate(dynamic dateStr, bool isFr) {
    if (dateStr == null) return '';
    final dt = DateTime.tryParse(dateStr.toString());
    if (dt == null) return '';
    return DateFormat('d MMMM yyyy', isFr ? 'fr_FR' : 'en_US').format(dt);
  }

  Future<void> _launchFile(String url, {bool download = false}) async {
    setState(() => _isOpening = true);
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                context.isFrench
                    ? 'Impossible d\'ouvrir le fichier sur cet appareil.'
                    : 'Could not open file on this device.',
              ),
            ),
          );
        }
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.isFrench
                  ? 'Erreur lors de l\'ouverture du document.'
                  : 'Error opening document.',
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isOpening = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final r = widget.resource;
    final category = (r['category'] ?? 'document').toString().toLowerCase();
    final title = (r['title'] ?? r['file_name'] ?? 'Ressource').toString();
    final fileName = (r['file_name'] ?? '').toString();
    final description = (r['description'] ?? '').toString();
    final batches = (r['batch_names'] ?? '').toString();
    final dateStr = _formatDate(r['created_at'], isFr);
    final sizeStr = _formatSize(r['file_size']);

    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth >= 700;

    IconData catIcon;
    Color catColor;
    String catLabel;

    switch (category) {
      case 'pdf':
        catIcon = Icons.picture_as_pdf_rounded;
        catColor = AppColors.bad;
        catLabel = 'Document PDF';
        break;
      case 'audio':
        catIcon = Icons.headphones_rounded;
        catColor = AppColors.frenchBlue;
        catLabel = 'Fichier Audio';
        break;
      case 'video':
        catIcon = Icons.videocam_rounded;
        catColor = AppColors.teacherAccent;
        catLabel = 'Vidéo Pédagogique';
        break;
      case 'image':
        catIcon = Icons.image_rounded;
        catColor = AppColors.frenchGold;
        catLabel = 'Image / Illustration';
        break;
      default:
        catIcon = Icons.description_rounded;
        catColor = AppColors.good;
        catLabel = 'Document Pédagogique';
        break;
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      backgroundColor: AppColors.pureWhite,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: isTablet ? 720 : 440,
          maxHeight: MediaQuery.of(context).size.height * 0.88,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── Dialog Header ──
            Container(
              padding: const EdgeInsets.fromLTRB(20, 18, 14, 16),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.borderSoft)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: catColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(11),
                    ),
                    child: Icon(catIcon, color: catColor, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 7,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: catColor.withValues(alpha: 0.10),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                catLabel.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: catColor,
                                  letterSpacing: 0.4,
                                ),
                              ),
                            ),
                            if (sizeStr.isNotEmpty) ...[
                              const SizedBox(width: 8),
                              Text(
                                sizeStr,
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textMuted,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          title,
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (batches.isNotEmpty) ...[
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              const Icon(
                                Icons.groups_outlined,
                                size: 14,
                                color: AppColors.textMuted,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  batches,
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20, color: AppColors.textMuted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // ── Dialog Body ──
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildCategoryPreview(
                      category: category,
                      title: title,
                      fileName: fileName,
                      catColor: catColor,
                      catIcon: catIcon,
                      isFr: isFr,
                    ),

                    if (description.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceSoft,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.borderSoft),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isFr ? 'À propos de ce document' : 'About this document',
                              style: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              description,
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.text,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    if (dateStr.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Center(
                        child: Text(
                          isFr
                              ? 'Ajouté le $dateStr'
                              : 'Uploaded on $dateStr',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSubtle,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // ── Dialog Bottom Action Bar ──
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: const BoxDecoration(
                color: AppColors.surfaceSoft,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(18)),
                border: Border(top: BorderSide(color: AppColors.borderSoft)),
              ),
              child: Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: _isOpening
                        ? null
                        : () => _launchFile(widget.downloadUrl, download: true),
                    icon: const Icon(Icons.download_rounded, size: 16),
                    label: Text(isFr ? 'Télécharger' : 'Download'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.frenchNavy,
                      side: const BorderSide(color: AppColors.border),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 11),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(isFr ? 'Fermer' : 'Close'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryPreview({
    required String category,
    required String title,
    required String fileName,
    required Color catColor,
    required IconData catIcon,
    required bool isFr,
  }) {
    switch (category) {
      case 'image':
        return Container(
          constraints: const BoxConstraints(maxHeight: 380),
          decoration: BoxDecoration(
            color: AppColors.frenchNavyDark,
            borderRadius: BorderRadius.circular(14),
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            alignment: Alignment.center,
            children: [
              InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: Image.network(
                  widget.previewUrl,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      height: 240,
                      alignment: Alignment.center,
                      child: const CircularProgressIndicator(color: Colors.white),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 200,
                      padding: const EdgeInsets.all(20),
                      alignment: Alignment.center,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.broken_image_outlined, size: 40, color: Colors.white70),
                          const SizedBox(height: 8),
                          Text(
                            isFr ? 'Aperçu indisponible' : 'Preview unavailable',
                            style: const TextStyle(color: Colors.white70, fontSize: 13),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Positioned(
                bottom: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.zoom_in, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        isFr ? 'Pincer pour zoomer' : 'Pinch to zoom',
                        style: const TextStyle(color: Colors.white, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );

      case 'audio':
        return Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderSoft),
          ),
          child: Column(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.frenchBlue.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.music_note_rounded,
                  color: AppColors.frenchBlue,
                  size: 32,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
              ),
              if (fileName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  fileName,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
              const SizedBox(height: 16),
              AudioPreviewPlayer(
                audioUrl: widget.previewUrl,
                title: title,
              ),
            ],
          ),
        );

      case 'pdf':
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderSoft),
          ),
          child: Column(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.bad.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.picture_as_pdf_rounded,
                  color: AppColors.bad,
                  size: 38,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              if (fileName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  fileName,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _isOpening ? null : () => _launchFile(widget.previewUrl),
                icon: const Icon(Icons.chrome_reader_mode_rounded, size: 18),
                label: Text(
                  isFr ? 'Consulter le PDF' : 'Read PDF Document',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.bad,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        );

      case 'video':
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderSoft),
          ),
          child: Column(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.teacherAccent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.play_circle_fill_rounded,
                  color: AppColors.teacherAccent,
                  size: 40,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              if (fileName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  fileName,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _isOpening ? null : () => _launchFile(widget.previewUrl),
                icon: const Icon(Icons.play_arrow_rounded, size: 20),
                label: Text(
                  isFr ? 'Visionner la vidéo' : 'Watch Video',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.teacherAccent,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        );

      default:
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.borderSoft),
          ),
          child: Column(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.good.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.description_rounded,
                  color: AppColors.good,
                  size: 38,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink,
                ),
              ),
              if (fileName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  fileName,
                  textAlign: TextAlign.center,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _isOpening ? null : () => _launchFile(widget.downloadUrl),
                icon: const Icon(Icons.open_in_new_rounded, size: 18),
                label: Text(
                  isFr ? 'Ouvrir le document' : 'Open Document',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.frenchNavy,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        );
    }
  }
}
