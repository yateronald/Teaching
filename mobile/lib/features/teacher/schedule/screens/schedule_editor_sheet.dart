import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';

/// Where a session happens. `inbuilt` is the app's own class room: the same
/// meeting as one created in the Meetings tab (lobby, passcode, attendance,
/// recording), and it appears there too.
enum SessionPlace { inbuilt, online, physical }

/// What the editor returns after a successful save.
class ScheduleSaveResult {
  /// The meeting created for a built-in class (id, room_name, passcode…).
  final Map<String, dynamic>? createdMeeting;
  const ScheduleSaveResult({this.createdMeeting});
}

class ScheduleEditorSheet extends ConsumerStatefulWidget {
  final List<dynamic> batches;
  final Map<String, dynamic>? existingItem;
  final void Function(ScheduleSaveResult result) onSaved;

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
  String _sessionType = 'class';
  SessionPlace _place = SessionPlace.inbuilt;
  SessionPlace? _originalPlace;
  String _status = 'scheduled';

  DateTime _startDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 10, minute: 0);
  int _durationMinutes = 60;
  static const _durations = [30, 45, 60, 90, 120];

  bool _isSaving = false;
  String? _errorMessage;

  bool get _isEdit => widget.existingItem?['id'] != null;

  @override
  void initState() {
    super.initState();
    final it = widget.existingItem;
    if (it != null) {
      _titleCtrl.text = it['title'] ?? '';
      _descCtrl.text = it['description'] ?? '';
      _selectedBatchId = (it['batch_id'] as num?)?.toInt();
      _sessionType = it['type'] ?? 'class';
      _status = it['status'] ?? 'scheduled';
      _place = it['meeting_id'] != null
          ? SessionPlace.inbuilt
          : it['location_mode'] == 'physical'
              ? SessionPlace.physical
              : SessionPlace.online;
      _originalPlace = _place;
      final location = '${it['location'] ?? ''}';
      _locationCtrl.text = location == '--' ? '' : location;
      if (it['meeting_id'] == null) _linkCtrl.text = it['link'] ?? '';

      // The server sends UTC; the teacher edits in the phone's time.
      final start = DateTime.tryParse('${it['start_time'] ?? it['start'] ?? ''}')?.toLocal();
      final end = DateTime.tryParse('${it['end_time'] ?? it['end'] ?? ''}')?.toLocal();
      if (start != null) {
        _startDate = DateTime(start.year, start.month, start.day);
        _startTime = TimeOfDay(hour: start.hour, minute: start.minute);
        if (end != null && end.isAfter(start)) _durationMinutes = end.difference(start).inMinutes;
      }
    } else {
      if (widget.batches.length == 1) {
        _selectedBatchId = (widget.batches[0]['id'] as num).toInt();
      }
      // Next quarter hour.
      final now = DateTime.now().add(const Duration(minutes: 15));
      _startDate = DateTime(now.year, now.month, now.day);
      _startTime = TimeOfDay(hour: now.hour, minute: (now.minute ~/ 15) * 15);
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
    final today = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: _isEdit ? today.subtract(const Duration(days: 365)) : DateTime(today.year, today.month, today.day),
      lastDate: today.add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: _startTime);
    if (picked != null) setState(() => _startTime = picked);
  }

  Future<void> _save() async {
    final isFr = context.isFrench;
    final title = _titleCtrl.text.trim();
    String? problem;
    if (title.isEmpty) {
      problem = isFr ? 'Donnez un titre à la séance.' : 'Give the session a title.';
    } else if (_selectedBatchId == null) {
      problem = isFr ? 'Choisissez une cohorte.' : 'Choose a batch.';
    } else if (_place == SessionPlace.online && !(Uri.tryParse(_linkCtrl.text.trim())?.hasScheme ?? false)) {
      problem = isFr ? 'Ajoutez le lien complet (https://…).' : 'Add the full link (https://…).';
    } else if (_place == SessionPlace.physical && _locationCtrl.text.trim().isEmpty) {
      problem = isFr ? 'Indiquez la salle ou l\'adresse.' : 'Say where it takes place.';
    }
    final start = DateTime(_startDate.year, _startDate.month, _startDate.day, _startTime.hour, _startTime.minute);
    final end = start.add(Duration(minutes: _durationMinutes));
    if (problem == null && !_isEdit && end.isBefore(DateTime.now())) {
      problem = isFr ? 'Cette séance serait déjà terminée. Choisissez une heure à venir.' : 'That session would already be over. Pick a future time.';
    }
    if (problem != null) {
      setState(() => _errorMessage = problem);
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    final payload = <String, dynamic>{
      'title': title,
      'description': _descCtrl.text.trim(),
      'batch_id': _selectedBatchId,
      // UTC with its zone, so the server stores the moment the teacher meant.
      'start_time': start.toUtc().toIso8601String(),
      'end_time': end.toUtc().toIso8601String(),
      'type': _sessionType,
      if (_isEdit) 'status': _status,
      // An unchanged built-in class stays in its room.
      if (!(_isEdit && _place == SessionPlace.inbuilt && _originalPlace == SessionPlace.inbuilt))
        'location_mode': _place.name,
      if (_place == SessionPlace.online) 'link': _linkCtrl.text.trim(),
      if (_place == SessionPlace.physical) 'location': _locationCtrl.text.trim(),
    };

    try {
      final client = ref.read(apiClientProvider);
      final res = _isEdit
          ? await client.put('/schedules/${widget.existingItem!['id']}', data: payload)
          : await client.post('/schedules', data: payload);
      final data = res.data;
      Map<String, dynamic>? created;
      if (data is Map && data['meeting'] is Map) {
        final m = Map<String, dynamic>.from(data['meeting'] as Map);
        created = {
          'id': m['id'],
          'room_name': m['code'],
          'code': m['code'],
          'passcode': m['passcode'],
          'title': title,
          'batch_name': widget.batches
              .cast<Map>()
              .where((b) => b['id'] == _selectedBatchId)
              .map((b) => b['name'])
              .firstOrNull,
        };
      }
      if (!mounted) return;
      Navigator.pop(context);
      widget.onSaved(ScheduleSaveResult(createdMeeting: created));
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
          _errorMessage = e.message;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isSaving = false;
          _errorMessage = isFr ? 'La séance n\'a pas pu être enregistrée.' : 'The session could not be saved.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final dateFmt = DateFormat(isFr ? 'EEE d MMM yyyy' : 'EEE, MMM d, yyyy', isFr ? 'fr_FR' : 'en_US').format(_startDate);
    final timeFmt = '${_startTime.hour.toString().padLeft(2, '0')}:${_startTime.minute.toString().padLeft(2, '0')}';
    final existingCode = widget.existingItem?['meeting_code'];

    return Container(
      height: MediaQuery.of(context).size.height * 0.92,
      padding: EdgeInsets.only(top: 16, bottom: MediaQuery.of(context).viewInsets.bottom),
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
                Expanded(
                  child: Text(
                    _isEdit ? (isFr ? 'Modifier la séance' : 'Edit session') : (isFr ? 'Planifier une séance' : 'New session'),
                    style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: _isSaving ? null : () => Navigator.pop(context)),
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
                      width: double.infinity,
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
                  CustomTextField(
                    label: isFr ? 'Titre' : 'Title',
                    hintText: isFr ? 'ex : Passé composé — pratique' : 'e.g. Passé composé — practice',
                    controller: _titleCtrl,
                  ),
                  const SizedBox(height: 14),
                  _label(isFr ? 'Cohorte' : 'Batch'),
                  DropdownButtonFormField<int>(
                    initialValue: _selectedBatchId,
                    isExpanded: true,
                    hint: Text(isFr ? 'Choisir une cohorte' : 'Choose a batch'),
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                    ),
                    items: widget.batches.map((b) {
                      return DropdownMenuItem<int>(
                        value: (b['id'] as num).toInt(),
                        child: Text(b['name'] ?? 'Cohort', overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                      );
                    }).toList(),
                    onChanged: (val) => setState(() => _selectedBatchId = val),
                  ),
                  const SizedBox(height: 16),
                  _label(isFr ? 'Type' : 'Type'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _typeChip('class', isFr ? 'Cours' : 'Class'),
                      _typeChip('exam', isFr ? 'Examen' : 'Exam'),
                      _typeChip('quiz', 'Quiz'),
                      _typeChip('assignment', isFr ? 'Devoir' : 'Assignment'),
                      _typeChip('meeting', isFr ? 'Réunion' : 'Meeting'),
                      _typeChip('other', isFr ? 'Autre' : 'Other'),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _label('Date'),
                            _pickerBox(Icons.event, dateFmt, _pickDate),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        width: 112,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _label(isFr ? 'Heure' : 'Time'),
                            _pickerBox(Icons.access_time, timeFmt, _pickTime),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _label(isFr ? 'Durée' : 'Length'),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: {..._durations, _durationMinutes}.map((d) {
                      final selected = _durationMinutes == d;
                      return ChoiceChip(
                        label: Text(d >= 60 ? '${d ~/ 60} h${d % 60 > 0 ? ' ${d % 60}' : ''}' : '$d min'),
                        selected: selected,
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: selected ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: selected ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _durationMinutes = d),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                  _label(isFr ? 'Où' : 'Where'),
                  _placeOption(
                    SessionPlace.inbuilt,
                    Icons.video_camera_front_outlined,
                    isFr ? 'Salle de classe intégrée' : 'Built-in class room',
                    existingCode != null && _originalPlace == SessionPlace.inbuilt
                        ? (isFr ? 'Identifiant $existingCode · les changements s\'appliquent aussi dans Réunions.' : 'Meeting ID $existingCode · changes also apply in Meetings.')
                        : (isFr
                            ? 'Une salle est créée pour vous : salle d\'attente, code secret, présence et enregistrement. Elle apparaît aussi dans Réunions.'
                            : 'A room is created for you: lobby, passcode, attendance and recording. It also appears in Meetings.'),
                  ),
                  const SizedBox(height: 8),
                  _placeOption(
                    SessionPlace.online,
                    Icons.link,
                    isFr ? 'Lien externe' : 'External link',
                    isFr ? 'Zoom, Google Meet, Teams…' : 'Zoom, Google Meet, Teams…',
                  ),
                  const SizedBox(height: 8),
                  _placeOption(
                    SessionPlace.physical,
                    Icons.location_on_outlined,
                    isFr ? 'En présentiel' : 'In person',
                    isFr ? 'Une salle ou une adresse.' : 'A room or an address.',
                  ),
                  const SizedBox(height: 14),
                  if (_place == SessionPlace.physical)
                    CustomTextField(
                      label: isFr ? 'Salle ou adresse' : 'Room or address',
                      hintText: isFr ? 'ex : Salle 204, Campus central' : 'e.g. Room 204, Main campus',
                      controller: _locationCtrl,
                    )
                  else if (_place == SessionPlace.online)
                    CustomTextField(
                      label: isFr ? 'Lien de la réunion' : 'Meeting link',
                      hintText: 'https://meet.example.com/abc-defg',
                      controller: _linkCtrl,
                      keyboardType: TextInputType.url,
                    ),
                  if (_place != SessionPlace.inbuilt) const SizedBox(height: 14),
                  CustomTextField(
                    label: isFr ? 'Description (facultatif)' : 'Description (optional)',
                    hintText: isFr ? 'Ce que vous allez aborder…' : 'What you will cover…',
                    controller: _descCtrl,
                    maxLines: 3,
                  ),
                  if (_isEdit) ...[
                    const SizedBox(height: 16),
                    _label(isFr ? 'Statut' : 'Status'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _statusChip('scheduled', isFr ? 'Programmée' : 'Scheduled'),
                        _statusChip('completed', isFr ? 'Terminée' : 'Completed'),
                        _statusChip('cancelled', isFr ? 'Annulée' : 'Cancelled'),
                      ],
                    ),
                  ],
                  const SizedBox(height: 12),
                  Text(
                    _isEdit
                        ? (isFr ? 'Les étudiants voient la modification tout de suite.' : 'Students see the change straight away.')
                        : (isFr ? 'Les étudiants de la cohorte reçoivent un e-mail avec la date, l\'heure et comment rejoindre.' : 'Students in the batch get an email with the date, time and how to join.'),
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 22),
                  CustomButton(
                    text: _isEdit ? (isFr ? 'Enregistrer' : 'Save changes') : (isFr ? 'Créer la séance' : 'Create session'),
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

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text, style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
      );

  Widget _pickerBox(IconData icon, String text, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.frenchNavy),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                text,
                style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _placeOption(SessionPlace place, IconData icon, String title, String subtitle) {
    final selected = _place == place;
    return InkWell(
      onTap: () => setState(() => _place = place),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? AppColors.frenchNavy.withValues(alpha: 0.06) : AppColors.pureWhite,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? AppColors.frenchNavy : AppColors.border, width: selected ? 1.6 : 1),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: selected ? AppColors.frenchNavy : AppColors.textMuted),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.35)),
                ],
              ),
            ),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              size: 20,
              color: selected ? AppColors.frenchNavy : AppColors.border,
            ),
          ],
        ),
      ),
    );
  }

  Widget _typeChip(String id, String label) => _chip(label, _sessionType == id, () => setState(() => _sessionType = id));

  Widget _statusChip(String id, String label) => _chip(label, _status == id, () => setState(() => _status = id));

  Widget _chip(String label, bool selected, VoidCallback onTap) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      selectedColor: AppColors.frenchNavy,
      backgroundColor: AppColors.pureWhite,
      labelStyle: AppTypography.caption.copyWith(
        fontWeight: FontWeight.w700,
        color: selected ? AppColors.pureWhite : AppColors.textMuted,
      ),
      side: BorderSide(color: selected ? AppColors.frenchNavy : AppColors.border),
      onSelected: (_) => onTap(),
    );
  }
}
