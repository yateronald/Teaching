import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

class ResourceUploadSheet extends ConsumerStatefulWidget {
  final List<dynamic> batches;
  final VoidCallback onUploaded;

  const ResourceUploadSheet({super.key, required this.batches, required this.onUploaded});

  @override
  ConsumerState<ResourceUploadSheet> createState() => _ResourceUploadSheetState();
}

class _ResourceUploadSheetState extends ConsumerState<ResourceUploadSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String _category = 'pdf'; // pdf, video, audio, image, document
  final List<int> _selectedBatchIds = [];

  List<PlatformFile> _selectedFiles = [];
  bool _isUploading = false;
  double _uploadProgress = 0.0;
  String? _errorMessage;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'mp3', 'wav', 'mp4', 'mov', 'png', 'jpg', 'jpeg', 'docx', 'doc'],
    );

    if (result != null) {
      setState(() {
        _selectedFiles = result.files;
        if (_titleCtrl.text.isEmpty && result.files.isNotEmpty) {
          _titleCtrl.text = result.files.first.name.split('.').first;
        }
        // Auto-detect category from first file
        final ext = result.files.first.extension?.toLowerCase();
        if (ext == 'pdf') {
          _category = 'pdf';
        } else if (ext == 'mp3' || ext == 'wav') {
          _category = 'audio';
        } else if (ext == 'mp4' || ext == 'mov') {
          _category = 'video';
        } else if (ext == 'png' || ext == 'jpg' || ext == 'jpeg') {
          _category = 'image';
        } else {
          _category = 'document';
        }
      });
    }
  }

  Future<void> _upload() async {
    if (_selectedFiles.isEmpty) {
      setState(() => _errorMessage = 'Veuillez sélectionner au moins un fichier.');
      return;
    }

    final title = _titleCtrl.text.trim();
    if (title.isEmpty) {
      setState(() => _errorMessage = 'Veuillez renseigner un titre pour le document.');
      return;
    }

    setState(() {
      _isUploading = true;
      _uploadProgress = 0.0;
      _errorMessage = null;
    });

    try {
      final client = ref.read(apiClientProvider);

      for (int i = 0; i < _selectedFiles.length; i++) {
        final file = _selectedFiles[i];
        if (file.path == null) continue;

        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(file.path!, filename: file.name),
          'title': _selectedFiles.length == 1 ? title : '$title (${i + 1})',
          'description': _descCtrl.text.trim(),
          'category': _category,
          'batch_ids': _selectedBatchIds.join(','),
        });

        await client.post(
          '/resources/upload',
          data: formData,
          onSendProgress: (sent, total) {
            if (total > 0 && mounted) {
              final filePct = sent / total;
              final overall = (i + filePct) / _selectedFiles.length;
              setState(() => _uploadProgress = overall);
            }
          },
        );
      }

      if (mounted) {
        widget.onUploaded();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ressources pédagogiques téléversées avec succès !'),
            backgroundColor: AppColors.good,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploading = false;
          _errorMessage = 'Échec de l\'envoi. Vérifiez votre connexion.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.frenchNavy.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.cloud_upload_outlined, color: AppColors.frenchNavy, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Téléverser une Ressource',
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.badBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.badBorder),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: AppTypography.caption.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // File Picker Box
                  InkWell(
                    onTap: _isUploading ? null : _pickFiles,
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.frenchBlue.withValues(alpha: 0.3), width: 1.5),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            _selectedFiles.isEmpty ? Icons.upload_file : Icons.check_circle_outline,
                            size: 44,
                            color: _selectedFiles.isEmpty ? AppColors.frenchNavy : AppColors.good,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            _selectedFiles.isEmpty
                                ? 'Cliquez pour sélectionner des fichiers'
                                : '${_selectedFiles.length} fichier(s) sélectionné(s)',
                            style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'PDF, MP3, MP4, PNG, JPG, Word (jusqu\'à 100 Mo)',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),

                  if (_selectedFiles.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    ..._selectedFiles.map((f) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            children: [
                              const Icon(Icons.attach_file, size: 16, color: AppColors.frenchNavy),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  f.name,
                                  style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                '${(f.size / (1024 * 1024)).toStringAsFixed(1)} Mo',
                                style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                              ),
                            ],
                          ),
                        )),
                  ],

                  const SizedBox(height: 20),

                  // Title
                  CustomTextField(
                    label: 'Titre de la ressource',
                    hintText: 'ex: Fiche pédagogique – Les connecteurs logiques',
                    controller: _titleCtrl,
                  ),
                  const SizedBox(height: 14),

                  // Description
                  CustomTextField(
                    label: 'Description ou consignes (facultatif)',
                    hintText: 'Notes pour les étudiants...',
                    controller: _descCtrl,
                    maxLines: 2,
                  ),
                  const SizedBox(height: 18),

                  // Category
                  Text('Catégorie', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      _buildCategoryChip('pdf', 'PDF'),
                      _buildCategoryChip('audio', 'Audio'),
                      _buildCategoryChip('video', 'Vidéo'),
                      _buildCategoryChip('document', 'Document'),
                      _buildCategoryChip('image', 'Image'),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Target Batches
                  Text('Assigner aux promotions', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  if (widget.batches.isEmpty)
                    Text('Toutes les promotions auront accès.', style: AppTypography.caption)
                  else
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: widget.batches.map((b) {
                        final id = (b['id'] as num).toInt();
                        final isSelected = _selectedBatchIds.contains(id);
                        return FilterChip(
                          label: Text(b['name'] ?? 'Cohort'),
                          selected: isSelected,
                          selectedColor: AppColors.teacherAccentSoft,
                          checkmarkColor: AppColors.teacherAccent,
                          labelStyle: AppTypography.caption.copyWith(
                            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            color: isSelected ? AppColors.teacherAccent : AppColors.text,
                          ),
                          onSelected: (sel) {
                            setState(() {
                              if (sel) {
                                _selectedBatchIds.add(id);
                              } else {
                                _selectedBatchIds.remove(id);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),

                  if (_isUploading) ...[
                    const SizedBox(height: 24),
                    Text(
                      'Téléversement en cours... ${(_uploadProgress * 100).toStringAsFixed(0)}%',
                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: _uploadProgress,
                        backgroundColor: AppColors.surfaceSoft,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.frenchNavy),
                        minHeight: 8,
                      ),
                    ),
                  ],

                  const SizedBox(height: 28),

                  CustomButton(
                    text: _isUploading ? 'Téléversement...' : 'Téléverser les fichiers',
                    icon: Icons.cloud_upload,
                    isLoading: _isUploading,
                    height: 50,
                    width: double.infinity,
                    onPressed: _upload,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String id, String label) {
    final isSelected = _category == id;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.frenchNavy,
      backgroundColor: AppColors.pureWhite,
      labelStyle: AppTypography.caption.copyWith(
        fontWeight: FontWeight.w700,
        color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
      ),
      side: BorderSide(color: isSelected ? AppColors.frenchNavy : AppColors.border),
      onSelected: (_) => setState(() => _category = id),
    );
  }
}
