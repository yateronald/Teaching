import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

class ScheduleEditorSheet extends ConsumerStatefulWidget {
  final List<dynamic> batches;
  final Map<String, dynamic>? existingItem;
  final VoidCallback onSaved;

  const ScheduleEditorSheet({
    super.key,
    required this.batches,
    this.existingItem,
    required this.onSaved,
  });

  @override
  ConsumerState<ScheduleEditorSheet> createState() => _ScheduleEditorSheetState();
}

class _ScheduleEditorSheetState extends ConsumerState<ScheduleEditorSheet> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _linkCtrl = TextEditingController();

  int? _selectedBatchId;
  String _sessionType = 'class'; // class, exam, quiz, assignment, meeting, other
  String _locationMode = 'online'; // online, physical

  DateTime _startDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 10, minute: 0);
  int _durationMinutes = 60;
  final List<int> _durations = [30, 45, 60, 90, 120];

  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.existingItem != null) {
      final it = widget.existingItem!;
      _titleCtrl.text = it['title'] ?? '';
      _descCtrl.text = it['description'] ?? '';
      _selectedBatchId = (it['batch_id'] as num?)?.toInt();
      _sessionType = it['type'] ?? 'class';
      _locationMode = it['location_mode'] ?? 'online';
      _locationCtrl.text = it['location'] ?? '';
      _linkCtrl.text = it['link'] ?? '';

      final startStr = it['start'] ?? it['start_time'];
      if (startStr != null) {
        final dt = DateTime.tryParse(startStr);
        if (dt != null) {
          _startDate = dt;
          _startTime = TimeOfDay(hour: dt.hour, minute: dt.minute);
        }
      }
    } else if (widget.batches.isNotEmpty) {
      _selectedBatchId = (widget.batches[0]['id'] as num).toInt();
    }
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _locationCtrl.dispose();
    _linkCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _startTime,
    );
    if (picked != null) setState(() => _startTime = picked);
  }

  Future<void> _save() async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) {
      setState(() => _errorMessage = 'Veuillez renseigner le titre de la session.');
      return;
    }
    if (_selectedBatchId == null) {
      setState(() => _errorMessage = 'Veuillez sélectionner une promotion.');
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    final startDt = DateTime(
      _startDate.year,
      _startDate.month,
      _startDate.day,
      _startTime.hour,
      _startTime.minute,
    );
    final endDt = startDt.add(Duration(minutes: _durationMinutes));

    final payload = {
      'title': title,
      'description': _descCtrl.text.trim(),
      'batch_id': _selectedBatchId,
      'start_time': startDt.toIso8601String(),
      'end_time': endDt.toIso8601String(),
      'session_type': _sessionType,
      'location_mode': _locationMode,
      'location': _locationCtrl.text.trim(),
      'meeting_link': _linkCtrl.text.trim(),
    };

    try {
      final client = ref.read(apiClientProvider);
      if (widget.existingItem != null && widget.existingItem!['id'] != null) {
        await client.put('/schedules/${widget.existingItem!['id']}', data: payload);
      } else {
        await client.post('/schedules', data: payload);
      }

      if (mounted) {
        widget.onSaved();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Session planifiée avec succès !'), backgroundColor: AppColors.good),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
          _errorMessage = 'Échec de l\'enregistrement de la session.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFmt = DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(_startDate);
    final timeFmt = '${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}';

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
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
                      child: const Icon(Icons.calendar_today_outlined, color: AppColors.frenchNavy, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      widget.existingItem != null ? 'Modifier la Session' : 'Planifier un Cours',
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

                  // Title
                  CustomTextField(
                    label: 'Intitulé du cours / de la session',
                    hintText: 'ex: Expression Orale – Les débats de société',
                    controller: _titleCtrl,
                  ),
                  const SizedBox(height: 14),

                  // Batch Selector
                  Text('Cohorte assignée', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<int>(
                    initialValue: _selectedBatchId,
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    ),
                    items: widget.batches.map((b) {
                      return DropdownMenuItem<int>(
                        value: (b['id'] as num).toInt(),
                        child: Text(b['name'] ?? 'Cohort', style: const TextStyle(fontWeight: FontWeight.w600)),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedBatchId = val),
                  ),
                  const SizedBox(height: 16),

                  // Type Selector
                  Text('Type d\'activité', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildTypeChip('class', 'Cours régulier'),
                      _buildTypeChip('exam', 'Examen blanc'),
                      _buildTypeChip('quiz', 'Session Quiz'),
                      _buildTypeChip('meeting', 'Réunion'),
                      _buildTypeChip('other', 'Autre'),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Date & Start Time Pickers
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Date', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: _pickDate,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.event, size: 18, color: AppColors.frenchNavy),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        dateFmt,
                                        style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 120,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Heure', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: _pickTime,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.access_time, size: 18, color: AppColors.frenchNavy),
                                    const SizedBox(width: 8),
                                    Text(timeFmt, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Duration Chips
                  Text('Durée de la séance', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: _durations.map((d) {
                      final isSelected = _durationMinutes == d;
                      return ChoiceChip(
                        label: Text('$d min'),
                        selected: isSelected,
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: isSelected ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _durationMinutes = d),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Location Mode
                  Text('Modalité du cours', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      ChoiceChip(
                        avatar: const Icon(Icons.videocam_outlined, size: 16),
                        label: const Text('En ligne (Visioconférence)'),
                        selected: _locationMode == 'online',
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _locationMode == 'online' ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: _locationMode == 'online' ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _locationMode = 'online'),
                      ),
                      const SizedBox(width: 8),
                      ChoiceChip(
                        avatar: const Icon(Icons.location_on_outlined, size: 16),
                        label: const Text('Présentiel'),
                        selected: _locationMode == 'physical',
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _locationMode == 'physical' ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: _locationMode == 'physical' ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _locationMode = 'physical'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  if (_locationMode == 'physical')
                    CustomTextField(
                      label: 'Salle ou adresse physique',
                      hintText: 'ex: Salle 204, Campus Central',
                      controller: _locationCtrl,
                    )
                  else
                    CustomTextField(
                      label: 'Lien de réunion (optionnel - généré automatiquement si vide)',
                      hintText: 'ex: https://meet.learnfrench.com/...',
                      controller: _linkCtrl,
                    ),

                  const SizedBox(height: 14),

                  // Description
                  CustomTextField(
                    label: 'Objectifs ou description (facultatif)',
                    hintText: 'Points grammaticaux abordés...',
                    controller: _descCtrl,
                    maxLines: 3,
                  ),
                  const SizedBox(height: 28),

                  CustomButton(
                    text: widget.existingItem != null ? 'Mettre à jour la session' : 'Créer la session',
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

  Widget _buildTypeChip(String id, String label) {
    final isSelected = _sessionType == id;
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
      onSelected: (_) => setState(() => _sessionType = id),
    );
  }
}
