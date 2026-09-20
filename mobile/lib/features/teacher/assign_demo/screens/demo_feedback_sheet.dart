import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

class DemoFeedbackSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic> demo;
  final VoidCallback onSaved;

  const DemoFeedbackSheet({super.key, required this.demo, required this.onSaved});

  @override
  ConsumerState<DemoFeedbackSheet> createState() => _DemoFeedbackSheetState();
}

class _DemoFeedbackSheetState extends ConsumerState<DemoFeedbackSheet> {
  final _notesCtrl = TextEditingController();
  late String _status;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _notesCtrl.text = widget.demo['notes'] ?? '';
    _status = widget.demo['status'] ?? 'new';
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    final demoId = widget.demo['id'];

    try {
      final client = ref.read(apiClientProvider);
      await client.put('/demo-requests/$demoId', data: {
        'notes': _notesCtrl.text.trim(),
        'status': _status,
      });

      if (mounted) {
        widget.onSaved();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Notes et statut mis à jour !'), backgroundColor: AppColors.good),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
          _errorMessage = 'Échec de la mise à jour des notes.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final studentName = widget.demo['full_name'] ?? 'Étudiant Démo';

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
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
              decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Compte-rendu de Cours d\'Essai', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700)),
                    Text(studentName, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
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
                      child: Text(_errorMessage!, style: AppTypography.caption.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Status choice
                  Text('Statut du cours d\'essai', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: _status,
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'new', child: Text('Nouvelle demande')),
                      DropdownMenuItem(value: 'contacted', child: Text('Étudiant contacté')),
                      DropdownMenuItem(value: 'demo_scheduled', child: Text('Cours d\'essai planifié')),
                      DropdownMenuItem(value: 'completed', child: Text('Cours d\'essai terminé')),
                      DropdownMenuItem(value: 'cancelled', child: Text('Annulé / Absent')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _status = val);
                    },
                  ),
                  const SizedBox(height: 18),

                  // Pedagogical Notes
                  CustomTextField(
                    label: 'Notes d\'évaluation pédagogique & Recommandations',
                    hintText: 'Aisance à l\'oral, vocabulaire, niveau CECRL recommandé, formule de cours conseillée...',
                    controller: _notesCtrl,
                    maxLines: 5,
                  ),
                  const SizedBox(height: 28),

                  CustomButton(
                    text: 'Enregistrer les notes',
                    icon: Icons.check,
                    isLoading: _isSaving,
                    height: 50,
                    width: double.infinity,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
