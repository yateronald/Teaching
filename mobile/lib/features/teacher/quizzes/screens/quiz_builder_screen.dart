import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/authenticated_audio_player.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../widgets/audio_clip_draft.dart';
import '../widgets/question_editor_card.dart';
import 'ai_quiz_generator_sheet.dart';
import 'audio_question_sheet.dart';

class QuizBuilderScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic>? existingQuiz;

  const QuizBuilderScreen({super.key, this.existingQuiz});

  @override
  ConsumerState<QuizBuilderScreen> createState() => _QuizBuilderScreenState();
}

class _QuizBuilderScreenState extends ConsumerState<QuizBuilderScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _instructionsCtrl = TextEditingController();
  bool _showInstructions = false;

  int _durationMinutes = 30;
  final List<int> _durationChips = [10, 15, 20, 30, 45, 60];

  // Availability Window
  bool _hasWindow = false;
  DateTime? _startDate;
  DateTime? _endDate;

  // Delivery options
  bool _shuffleQuestions = false;
  bool _shuffleOptions = false;
  final bool _autoSubmit = true;

  final List<AudioClipDraft> _audioClips = [];
  final List<QuizQuestionDraft> _questions = [];
  final List<int> _selectedBatchIds = [];
  List<dynamic> _availableBatches = [];

  bool _isLoadingBatches = true;
  bool _isLoadingDetails = false;
  bool _isSaving = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initExistingData();
    _fetchBatches();
    if (widget.existingQuiz != null && widget.existingQuiz!['id'] != null) {
      _fetchQuizDetails();
    }
  }

  void _initExistingData() {
    final eq = widget.existingQuiz;
    if (eq != null) {
      _titleCtrl.text = eq['title'] ?? '';
      _descCtrl.text = eq['description'] ?? '';
      _durationMinutes = eq['duration_minutes'] ?? 30;
      _shuffleQuestions =
          eq['randomize_questions'] == true || eq['shuffle_questions'] == true;
      _shuffleOptions = eq['randomize_options'] == true;

      final rawBatchIds = eq['batch_ids'];
      if (rawBatchIds is List) {
        _selectedBatchIds.addAll(rawBatchIds.map((e) => (e as num).toInt()));
      }
    }

    if (_questions.isEmpty) {
      _questions.add(
        QuizQuestionDraft(
          questionText: '',
          questionType: 'mcq_single',
          points: 1,
        ),
      );
    }
  }

  Future<void> _fetchQuizDetails() async {
    final id = widget.existingQuiz?['id'];
    if (id == null) return;
    setState(() => _isLoadingDetails = true);

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/quizzes/$id');
      final data = res.data;
      if (data is Map<String, dynamic> && mounted) {
        setState(() {
          _titleCtrl.text = data['title'] ?? _titleCtrl.text;
          _descCtrl.text = data['description'] ?? _descCtrl.text;
          _instructionsCtrl.text = data['instructions'] ?? '';
          if (_instructionsCtrl.text.isNotEmpty) _showInstructions = true;
          _durationMinutes = data['duration_minutes'] ?? _durationMinutes;
          _shuffleQuestions = data['randomize_questions'] == true;
          _shuffleOptions = data['randomize_options'] == true;

          if (data['start_date'] != null || data['end_date'] != null) {
            _hasWindow = true;
            _startDate = DateTime.tryParse(data['start_date'] ?? '')?.toLocal();
            _endDate = DateTime.tryParse(data['end_date'] ?? '')?.toLocal();
          }

          final rawBatches = data['batches'] ?? data['batch_ids'];
          if (rawBatches is List) {
            _selectedBatchIds.clear();
            for (final b in rawBatches) {
              final bId = (b is Map ? b['id'] : b) as num?;
              if (bId != null) _selectedBatchIds.add(bId.toInt());
            }
          }

          final rawClips = data['audio_clips'] as List? ?? [];
          _audioClips.clear();
          for (final c in rawClips) {
            _audioClips.add(AudioClipDraft.fromJson(c as Map<String, dynamic>));
          }

          final rawQuestions = data['questions'] as List? ?? [];
          if (rawQuestions.isNotEmpty) {
            _questions.clear();
            for (final q in rawQuestions) {
              final rawOptions = q['options'] as List? ?? [];
              final options = rawOptions
                  .map(
                    (o) => QuizOptionDraft(
                      id: (o['id'] as num?)?.toInt(),
                      text: o['option_text'] ?? o['text'] ?? '',
                      isCorrect:
                          o['is_correct'] == true || o['isCorrect'] == true,
                    ),
                  )
                  .toList();

              _questions.add(
                QuizQuestionDraft(
                  id: (q['id'] as num?)?.toInt(),
                  questionText: q['question_text'] ?? q['question'] ?? '',
                  questionType: q['question_type'] ?? 'mcq_single',
                  points: (q['marks'] as num?) ?? (q['points'] as num?) ?? 1,
                  explanation: q['explanation'] ?? '',
                  yesNoAnswer: q['correct_answer'] ?? 'yes',
                  audioClipId: (q['audio_clip_id'] as num?)?.toInt(),
                  options: options,
                ),
              );
            }
          }
        });
      }
    } catch (_) {
      // Keep fallback
    } finally {
      if (mounted) setState(() => _isLoadingDetails = false);
    }
  }

  Future<void> _fetchBatches() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/batches');
      final data = res.data;
      if (mounted) {
        setState(() {
          _availableBatches = data is List
              ? data
              : (data?['batches'] ?? data?['data'] ?? []);
          _isLoadingBatches = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingBatches = false);
    }
  }

  num get _totalPoints => _questions.fold(0, (sum, q) => sum + q.points);

  void _openAiGenerator() {
    void addGeneratedQuestions(
      List<QuizQuestionDraft> newQuestions,
      String? title,
      String? desc,
    ) {
      setState(() {
        if (_titleCtrl.text.isEmpty && title != null) {
          _titleCtrl.text = title;
        }
        if (_descCtrl.text.isEmpty && desc != null) _descCtrl.text = desc;
        if (_questions.length == 1 && _questions[0].questionText.isEmpty) {
          _questions.clear();
        }
        _questions.addAll(newQuestions);
      });
    }

    final size = MediaQuery.sizeOf(context);
    if (size.width >= 700) {
      showDialog<void>(
        context: context,
        builder: (dialogContext) => Dialog(
          clipBehavior: Clip.antiAlias,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 28,
            vertical: 24,
          ),
          child: SizedBox(
            width: 1000,
            height: (size.height * 0.9).clamp(560, 900),
            child: AiQuizGeneratorSheet(
              isDialog: true,
              onAddQuestions: addGeneratedQuestions,
            ),
          ),
        ),
      );
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) =>
          AiQuizGeneratorSheet(onAddQuestions: addGeneratedQuestions),
    );
  }

  void _openAudioStudio() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AudioQuestionSheet(
        quizTitle: _titleCtrl.text.isNotEmpty
            ? _titleCtrl.text
            : 'Quiz de Compréhension Orale',
        onSave: (result) {
          setState(() {
            final clip = AudioClipDraft(
              tempId: result.tempId,
              sourceType: result.sourceType,
              kdriveFileId: result.kdriveFileId,
              fileName: result.fileName,
              durationSeconds: result.durationSeconds,
              transcript: result.transcript,
              voiceName: result.voiceName ?? 'Kore',
              maxPlays: result.maxPlays,
            );
            _audioClips.add(clip);

            if (result.questions.isNotEmpty) {
              if (_questions.length == 1 &&
                  _questions[0].questionText.isEmpty) {
                _questions.clear();
              }
              _questions.addAll(result.questions);
            } else {
              _questions.add(
                QuizQuestionDraft(
                  questionText: 'Compréhension du document audio :',
                  questionType: 'mcq_single',
                  points: 1,
                  audioClipTempId: clip.tempId,
                ),
              );
            }
          });
        },
      ),
    );
  }

  void _openSetAllPointsDialog() {
    final ctrl = TextEditingController(text: '1');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          'Harmoniser le barème',
          style: AppTypography.titleMedium.copyWith(
            color: AppColors.frenchNavy,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Attribuer le même nombre de points à l\'ensemble des ${_questions.length} questions :',
              style: AppTypography.bodySmall,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              autofocus: true,
              decoration: const InputDecoration(
                labelText: 'Points par question',
                suffixText: 'pts',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.frenchNavy,
            ),
            onPressed: () {
              final p = num.tryParse(ctrl.text);
              if (p != null && p > 0) {
                setState(() {
                  for (final q in _questions) {
                    q.points = p;
                  }
                });
                Navigator.pop(context);
              }
            },
            child: const Text(
              'Appliquer',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _applyWindowPreset(int hours) {
    final now = DateTime.now();
    setState(() {
      _startDate = now;
      _endDate = now.add(Duration(hours: hours));
    });
  }

  Future<void> _pickDateTimeRange() async {
    final now = DateTime.now();
    final pickedStart = await showDatePicker(
      context: context,
      initialDate: _startDate ?? now,
      firstDate: now.subtract(const Duration(days: 1)),
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Date d\'ouverture du quiz',
    );
    if (pickedStart == null || !mounted) return;

    final pickedStartTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_startDate ?? now),
      helpText: 'Heure d\'ouverture',
    );
    if (pickedStartTime == null || !mounted) return;

    final start = DateTime(
      pickedStart.year,
      pickedStart.month,
      pickedStart.day,
      pickedStartTime.hour,
      pickedStartTime.minute,
    );

    final pickedEnd = await showDatePicker(
      context: context,
      initialDate: _endDate ?? start.add(const Duration(days: 2)),
      firstDate: start,
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Date de fermeture du quiz',
    );
    if (pickedEnd == null || !mounted) return;

    final pickedEndTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _endDate ?? start.add(const Duration(hours: 48)),
      ),
      helpText: 'Heure de fermeture',
    );
    if (pickedEndTime == null || !mounted) return;

    final end = DateTime(
      pickedEnd.year,
      pickedEnd.month,
      pickedEnd.day,
      pickedEndTime.hour,
      pickedEndTime.minute,
    );

    setState(() {
      _startDate = start;
      _endDate = end;
    });
  }

  Future<void> _saveQuiz({required bool publish}) async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) {
      setState(() => _errorMessage = 'Veuillez attribuer un titre au quiz.');
      return;
    }

    if (_selectedBatchIds.isEmpty) {
      setState(
        () => _errorMessage =
            'Veuillez sélectionner au moins une promotion assignée.',
      );
      return;
    }

    if (_questions.isEmpty) {
      setState(
        () => _errorMessage = 'Veuillez ajouter au moins une question au quiz.',
      );
      return;
    }

    for (int i = 0; i < _questions.length; i++) {
      final err = _questions[i].validate(i + 1);
      if (err != null) {
        setState(() => _errorMessage = err);
        return;
      }
    }

    if (_hasWindow) {
      if (_startDate == null || _endDate == null) {
        setState(
          () => _errorMessage =
              'Veuillez définir les dates d\'ouverture et de fermeture.',
        );
        return;
      }
      if (_endDate!.isBefore(_startDate!)) {
        setState(
          () => _errorMessage =
              'La date de fermeture doit être postérieure à la date d\'ouverture.',
        );
        return;
      }
      if (_endDate!.difference(_startDate!).inMinutes < _durationMinutes) {
        setState(
          () => _errorMessage =
              'La période d\'ouverture doit être supérieure à la durée du quiz.',
        );
        return;
      }
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    final payload = {
      'title': title,
      'description': _descCtrl.text.trim(),
      'instructions': _instructionsCtrl.text.trim(),
      'duration_minutes': _durationMinutes,
      'start_date': _hasWindow && _startDate != null
          ? _startDate!.toUtc().toIso8601String()
          : null,
      'end_date': _hasWindow && _endDate != null
          ? _endDate!.toUtc().toIso8601String()
          : null,
      'randomize_questions': _shuffleQuestions,
      'randomize_options': _shuffleOptions,
      'auto_submit': _autoSubmit,
      'status': publish ? 'published' : 'draft',
      'batch_ids': _selectedBatchIds,
      'questions': _questions.map((q) => q.toJson()).toList(),
      'audio_clips': _audioClips.map((c) => c.toJson()).toList(),
    };

    try {
      final client = ref.read(apiClientProvider);
      final quizId = widget.existingQuiz?['id'];
      if (quizId != null) {
        await client.put('/quizzes/$quizId', data: payload);
      } else {
        await client.post('/quizzes', data: payload);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              publish ? 'Quiz publié avec succès !' : 'Brouillon enregistré !',
            ),
            backgroundColor: AppColors.good,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSaving = false;
          _errorMessage =
              'Échec de l\'enregistrement : vérifiez vos informations.';
        });
      }
    }
  }

  bool _belongsToClip(QuizQuestionDraft question, AudioClipDraft clip) {
    if (clip.id != null && question.audioClipId == clip.id) return true;
    return question.audioClipTempId != null &&
        question.audioClipTempId == clip.tempId;
  }

  Iterable<MapEntry<int, QuizQuestionDraft>> _questionsForClip(
    AudioClipDraft clip,
  ) {
    return _questions.asMap().entries.where(
      (entry) => _belongsToClip(entry.value, clip),
    );
  }

  bool _isAudioQuestion(QuizQuestionDraft question) {
    return _audioClips.any((clip) => _belongsToClip(question, clip));
  }

  void _duplicateQuestion(int index, QuizQuestionDraft question) {
    final copiedOptions = question.options
        .map(
          (option) =>
              QuizOptionDraft(text: option.text, isCorrect: option.isCorrect),
        )
        .toList();
    _questions.insert(
      index + 1,
      QuizQuestionDraft(
        questionText: '${question.questionText} (Copie)',
        questionType: question.questionType,
        points: question.points,
        explanation: question.explanation,
        yesNoAnswer: question.yesNoAnswer,
        audioClipTempId: question.audioClipTempId,
        audioClipId: question.audioClipId,
        options: copiedOptions,
        audioFileId: question.audioFileId,
      ),
    );
  }

  Widget _buildQuestionEditor(int index) {
    final question = _questions[index];
    return Padding(
      key: ValueKey(question.id ?? question),
      padding: const EdgeInsets.only(bottom: 14),
      child: QuestionEditorCard(
        index: index,
        question: question,
        onChanged: () => setState(() {}),
        onDuplicate: () => setState(() => _duplicateQuestion(index, question)),
        onDelete: () => setState(() => _questions.remove(question)),
        onMoveUp: index > 0
            ? () => setState(() {
                final item = _questions.removeAt(index);
                _questions.insert(index - 1, item);
              })
            : null,
        onMoveDown: index < _questions.length - 1
            ? () => setState(() {
                final item = _questions.removeAt(index);
                _questions.insert(index + 1, item);
              })
            : null,
      ),
    );
  }

  String? _audioEndpoint(AudioClipDraft clip) {
    if (clip.id != null) return '/quizzes/audio/${clip.id}/stream';
    final fileId = clip.kdriveFileId;
    if (fileId == null || fileId.isEmpty) return null;
    return '/quizzes/audio/preview/${Uri.encodeComponent(fileId)}';
  }

  Widget _summaryMetric(IconData icon, String value, String label) {
    return Container(
      constraints: const BoxConstraints(minWidth: 130),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 19, color: AppColors.frenchBlue),
          const SizedBox(width: 9),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.frenchNavy,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Text(
                label,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuizSummary() {
    final single = _questions
        .where((question) => question.questionType == 'mcq_single')
        .length;
    final multiple = _questions
        .where((question) => question.questionType == 'mcq_multiple')
        .length;
    final yesNo = _questions
        .where((question) => question.questionType == 'yes_no')
        .length;
    final complete = _questions.asMap().entries.every(
      (entry) => entry.value.validate(entry.key + 1) == null,
    );

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.summarize_outlined,
                color: AppColors.frenchBlue,
                size: 21,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  'Résumé du quiz',
                  style: AppTypography.titleMedium.copyWith(
                    color: AppColors.frenchNavy,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: complete ? AppColors.goodBg : AppColors.frenchGoldBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  complete ? 'Prêt' : 'À compléter',
                  style: AppTypography.caption.copyWith(
                    color: complete ? AppColors.good : AppColors.frenchGold,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _summaryMetric(
                Icons.quiz_outlined,
                '${_questions.length}',
                'questions',
              ),
              _summaryMetric(
                Icons.stars_outlined,
                _totalPoints.toStringAsFixed(
                  _totalPoints.truncateToDouble() == _totalPoints ? 0 : 1,
                ),
                'points',
              ),
              _summaryMetric(
                Icons.timer_outlined,
                '$_durationMinutes min',
                'durée',
              ),
              if (_audioClips.isNotEmpty)
                _summaryMetric(
                  Icons.headphones_outlined,
                  '${_audioClips.length}',
                  'section${_audioClips.length > 1 ? 's' : ''} audio',
                ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              Chip(label: Text('$single choix unique')),
              if (multiple > 0) Chip(label: Text('$multiple choix multiples')),
              if (yesNo > 0) Chip(label: Text('$yesNo vrai / faux')),
            ],
          ),
          if (_titleCtrl.text.trim().isEmpty ||
              _selectedBatchIds.isEmpty ||
              !complete) ...[
            const SizedBox(height: 8),
            Text(
              [
                if (_titleCtrl.text.trim().isEmpty) 'Ajoutez un titre',
                if (_selectedBatchIds.isEmpty) 'Choisissez une promotion',
                if (!complete) 'Terminez les questions incomplètes',
              ].join(' · '),
              style: AppTypography.caption.copyWith(
                color: AppColors.frenchGold,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text(
          widget.existingQuiz != null
              ? 'Modifier le Quiz'
              : 'Studio de Création de Quiz',
          style: AppTypography.titleMedium.copyWith(color: AppColors.ink),
        ),
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.frenchNavy),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.auto_awesome,
              color: AppColors.teacherAccent,
            ),
            tooltip: 'Générateur IA',
            onPressed: _openAiGenerator,
          ),
          IconButton(
            icon: const Icon(Icons.headphones, color: AppColors.frenchBlue),
            tooltip: 'Section Audio',
            onPressed: _openAudioStudio,
          ),
        ],
      ),
      body: _isLoadingDetails
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.frenchNavy),
            )
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: ResponsiveLayout.pageInsets(context),
                    child: AdaptiveContent(
                      maxWidth: 1080,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.badBg,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.badBorder),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.error_outline,
                                    color: AppColors.bad,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.bad,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Metadata Card
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.pureWhite,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: AppColors.border,
                                width: 1.1,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Informations générales',
                                  style: AppTypography.titleMedium.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.frenchNavy,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                CustomTextField(
                                  label: 'Titre du quiz',
                                  hintText:
                                      'ex: Évaluation TCF – Compréhension Écrite A2',
                                  controller: _titleCtrl,
                                  onChanged: (_) => setState(() {}),
                                ),
                                const SizedBox(height: 14),
                                CustomTextField(
                                  label: 'Description courte',
                                  hintText: 'Ce que couvre cette évaluation...',
                                  controller: _descCtrl,
                                  maxLines: 2,
                                ),
                                const SizedBox(height: 10),

                                // Instructions Toggle
                                if (!_showInstructions)
                                  TextButton.icon(
                                    onPressed: () => setState(
                                      () => _showInstructions = true,
                                    ),
                                    icon: const Icon(
                                      Icons.add,
                                      size: 16,
                                      color: AppColors.frenchNavy,
                                    ),
                                    label: Text(
                                      'Ajouter des consignes spécifiques pour les étudiants',
                                      style: AppTypography.caption.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.frenchNavy,
                                      ),
                                    ),
                                  )
                                else ...[
                                  const SizedBox(height: 4),
                                  CustomTextField(
                                    label:
                                        'Consignes préalables à la passation',
                                    hintText:
                                        'ex: Pas de dictionnaire. Toutes les questions doivent être répondues...',
                                    controller: _instructionsCtrl,
                                    maxLines: 3,
                                  ),
                                ],
                                const SizedBox(height: 18),

                                // Duration chips
                                Text(
                                  'Durée de passation (minutes)',
                                  style: AppTypography.label.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  children: _durationChips.map((mins) {
                                    final isSelected = _durationMinutes == mins;
                                    return ChoiceChip(
                                      label: Text('$mins min'),
                                      selected: isSelected,
                                      selectedColor: AppColors.frenchNavy,
                                      backgroundColor: AppColors.pureWhite,
                                      labelStyle: AppTypography.caption
                                          .copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: isSelected
                                                ? AppColors.pureWhite
                                                : AppColors.textMuted,
                                          ),
                                      side: BorderSide(
                                        color: isSelected
                                            ? AppColors.frenchNavy
                                            : AppColors.border,
                                      ),
                                      onSelected: (_) => setState(
                                        () => _durationMinutes = mins,
                                      ),
                                    );
                                  }).toList(),
                                ),
                                const SizedBox(height: 18),

                                // Target Batches Multi-Select
                                Text(
                                  'Promotions assignées',
                                  style: AppTypography.label.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                if (_isLoadingBatches)
                                  const LinearProgressIndicator(minHeight: 2)
                                else if (_availableBatches.isEmpty)
                                  Text(
                                    'Aucune promotion disponible.',
                                    style: AppTypography.caption,
                                  )
                                else
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 6,
                                    children: _availableBatches.map((b) {
                                      final bId = (b['id'] as num).toInt();
                                      final isSelected = _selectedBatchIds
                                          .contains(bId);
                                      return FilterChip(
                                        label: Text(b['name'] ?? 'Cohort'),
                                        selected: isSelected,
                                        selectedColor:
                                            AppColors.teacherAccentSoft,
                                        checkmarkColor: AppColors.teacherAccent,
                                        labelStyle: AppTypography.caption
                                            .copyWith(
                                              fontWeight: isSelected
                                                  ? FontWeight.w700
                                                  : FontWeight.w500,
                                              color: isSelected
                                                  ? AppColors.teacherAccent
                                                  : AppColors.text,
                                            ),
                                        onSelected: (sel) {
                                          setState(() {
                                            if (sel) {
                                              _selectedBatchIds.add(bId);
                                            } else {
                                              _selectedBatchIds.remove(bId);
                                            }
                                          });
                                        },
                                      );
                                    }).toList(),
                                  ),
                                const SizedBox(height: 18),

                                // Availability Mode (Open vs Window)
                                Text(
                                  'Disponibilité du quiz',
                                  style: AppTypography.label.copyWith(
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: BoxDecoration(
                                    color: AppColors.surfaceSoft,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: AppColors.borderSoft,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: InkWell(
                                          onTap: () => setState(() {
                                            _hasWindow = false;
                                            _startDate = null;
                                            _endDate = null;
                                          }),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 8,
                                            ),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: !_hasWindow
                                                  ? AppColors.pureWhite
                                                  : Colors.transparent,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              boxShadow: !_hasWindow
                                                  ? [
                                                      BoxShadow(
                                                        color: Colors.black
                                                            .withValues(
                                                              alpha: 0.05,
                                                            ),
                                                        blurRadius: 4,
                                                      ),
                                                    ]
                                                  : null,
                                            ),
                                            child: Text(
                                              'Dès publication',
                                              style: AppTypography.caption
                                                  .copyWith(
                                                    fontWeight: !_hasWindow
                                                        ? FontWeight.w700
                                                        : FontWeight.w500,
                                                    color: !_hasWindow
                                                        ? AppColors.frenchNavy
                                                        : AppColors.textMuted,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: InkWell(
                                          onTap: () {
                                            setState(() => _hasWindow = true);
                                            if (_startDate == null ||
                                                _endDate == null) {
                                              _applyWindowPreset(72);
                                            }
                                          },
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 8,
                                            ),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: _hasWindow
                                                  ? AppColors.pureWhite
                                                  : Colors.transparent,
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              boxShadow: _hasWindow
                                                  ? [
                                                      BoxShadow(
                                                        color: Colors.black
                                                            .withValues(
                                                              alpha: 0.05,
                                                            ),
                                                        blurRadius: 4,
                                                      ),
                                                    ]
                                                  : null,
                                            ),
                                            child: Text(
                                              'Période planifiée',
                                              style: AppTypography.caption
                                                  .copyWith(
                                                    fontWeight: _hasWindow
                                                        ? FontWeight.w700
                                                        : FontWeight.w500,
                                                    color: _hasWindow
                                                        ? AppColors.frenchNavy
                                                        : AppColors.textMuted,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),

                                if (_hasWindow) ...[
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceSoft,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: AppColors.border,
                                      ),
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Créneau horaire :',
                                              style: AppTypography.caption
                                                  .copyWith(
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                            ),
                                            TextButton.icon(
                                              onPressed: _pickDateTimeRange,
                                              icon: const Icon(
                                                Icons.edit_calendar,
                                                size: 16,
                                              ),
                                              label: const Text('Modifier'),
                                            ),
                                          ],
                                        ),
                                        if (_startDate != null &&
                                            _endDate != null) ...[
                                          Text(
                                            'Ouverture : ${DateFormat('dd MMM yyyy à HH:mm').format(_startDate!)}',
                                            style: AppTypography.caption,
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            'Clôture : ${DateFormat('dd MMM yyyy à HH:mm').format(_endDate!)}',
                                            style: AppTypography.caption,
                                          ),
                                        ],
                                        const SizedBox(height: 8),
                                        Wrap(
                                          spacing: 6,
                                          children: [
                                            ActionChip(
                                              label: const Text('24h'),
                                              onPressed: () =>
                                                  _applyWindowPreset(24),
                                            ),
                                            ActionChip(
                                              label: const Text('3 jours'),
                                              onPressed: () =>
                                                  _applyWindowPreset(72),
                                            ),
                                            ActionChip(
                                              label: const Text('7 jours'),
                                              onPressed: () =>
                                                  _applyWindowPreset(168),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 18),

                                // Delivery options
                                SwitchListTile(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text(
                                    'Mélanger l\'ordre des questions',
                                    style: AppTypography.bodyMedium.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  subtitle: Text(
                                    'Ordre aléatoire des questions pour chaque candidat.',
                                    style: AppTypography.caption,
                                  ),
                                  activeThumbColor: AppColors.frenchNavy,
                                  value: _shuffleQuestions,
                                  onChanged: (val) =>
                                      setState(() => _shuffleQuestions = val),
                                ),
                                SwitchListTile(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text(
                                    'Mélanger l\'ordre des réponses',
                                    style: AppTypography.bodyMedium.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  subtitle: Text(
                                    'Ordre aléatoire des options A, B, C, D.',
                                    style: AppTypography.caption,
                                  ),
                                  activeThumbColor: AppColors.frenchNavy,
                                  value: _shuffleOptions,
                                  onChanged: (val) =>
                                      setState(() => _shuffleOptions = val),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 24),

                          _buildQuizSummary(),
                          const SizedBox(height: 24),

                          // Listening Sections (if any)
                          if (_audioClips.isNotEmpty) ...[
                            Text(
                              'Sections d\'écoute audio (${_audioClips.length})',
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.frenchNavy,
                              ),
                            ),
                            const SizedBox(height: 10),
                            ..._audioClips.asMap().entries.map((entry) {
                              final cIdx = entry.key;
                              final clip = entry.value;
                              final linkedQuestions = _questionsForClip(
                                clip,
                              ).toList();
                              final audioEndpoint = _audioEndpoint(clip);

                              return Container(
                                margin: const EdgeInsets.only(bottom: 14),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: AppColors.frenchBlue.withValues(
                                      alpha: 0.3,
                                    ),
                                    width: 1.3,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceSoft,
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: const Icon(
                                            Icons.headphones,
                                            color: AppColors.frenchBlue,
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Section Audio #${cIdx + 1}',
                                                style: AppTypography.bodyMedium
                                                    .copyWith(
                                                      fontWeight:
                                                          FontWeight.w700,
                                                    ),
                                              ),
                                              Text(
                                                clip.sourceType == 'tts'
                                                    ? 'Voix native · ${clip.voiceName}'
                                                    : (clip.fileName ??
                                                          'Enregistrement importé'),
                                                style: AppTypography.caption
                                                    .copyWith(
                                                      color:
                                                          AppColors.textMuted,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(
                                            Icons.delete_outline,
                                            color: AppColors.bad,
                                            size: 20,
                                          ),
                                          tooltip: 'Supprimer la section audio',
                                          onPressed: () {
                                            setState(() {
                                              _audioClips.removeAt(cIdx);
                                              // Detach questions from this clip
                                              for (final q in _questions) {
                                                if (_belongsToClip(q, clip)) {
                                                  q.audioClipTempId = null;
                                                  q.audioClipId = null;
                                                }
                                              }
                                            });
                                          },
                                        ),
                                      ],
                                    ),
                                    if (clip.transcript.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Text(
                                        clip.transcript,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: AppTypography.caption.copyWith(
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    ],
                                    if (audioEndpoint != null) ...[
                                      const SizedBox(height: 12),
                                      AuthenticatedAudioPlayer(
                                        endpoint: audioEndpoint,
                                        title: 'Écouter l\'audio',
                                      ),
                                    ],
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 3,
                                          ),
                                          decoration: BoxDecoration(
                                            color: AppColors.surfaceSoft,
                                            borderRadius: BorderRadius.circular(
                                              6,
                                            ),
                                          ),
                                          child: Text(
                                            clip.maxPlays == 0
                                                ? 'Écoutes illimitées'
                                                : '${clip.maxPlays} écoute(s) max',
                                            style: AppTypography.caption
                                                .copyWith(
                                                  fontWeight: FontWeight.w600,
                                                ),
                                          ),
                                        ),
                                        const Spacer(),
                                        TextButton.icon(
                                          icon: const Icon(Icons.add, size: 16),
                                          label: const Text(
                                            'Question sur cet audio',
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              _questions.add(
                                                QuizQuestionDraft(
                                                  questionText: '',
                                                  questionType: 'mcq_single',
                                                  points: 1,
                                                  audioClipTempId: clip.tempId,
                                                  audioClipId: clip.id,
                                                ),
                                              );
                                            });
                                          },
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    const Divider(
                                      height: 1,
                                      color: AppColors.borderSoft,
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Text(
                                          '${linkedQuestions.length} question${linkedQuestions.length > 1 ? 's' : ''} liée${linkedQuestions.length > 1 ? 's' : ''}',
                                          style: AppTypography.caption.copyWith(
                                            color: AppColors.frenchNavy,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        const Spacer(),
                                        Text(
                                          '${linkedQuestions.fold<num>(0, (sum, item) => sum + item.value.points)} pts',
                                          style: AppTypography.caption.copyWith(
                                            color: AppColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    ...linkedQuestions.map(
                                      (item) => _buildQuestionEditor(item.key),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(height: 12),
                          ],

                          // Questions Section Header
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Questions indépendantes (${_questions.where((question) => !_isAudioQuestion(question)).length})',
                                    style: AppTypography.titleLarge.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                  Text(
                                    'Total : ${_totalPoints.toStringAsFixed(_totalPoints.truncateToDouble() == _totalPoints ? 0 : 1)} point${_totalPoints > 1 ? "s" : ""}',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.teacherAccent,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  TextButton.icon(
                                    onPressed: _openSetAllPointsDialog,
                                    icon: const Icon(
                                      Icons.tune,
                                      size: 16,
                                      color: AppColors.frenchNavy,
                                    ),
                                    label: Text(
                                      'Harmoniser le barème',
                                      style: AppTypography.caption.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.frenchNavy,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),

                          // Questions list
                          ..._questions
                              .asMap()
                              .entries
                              .where((entry) => !_isAudioQuestion(entry.value))
                              .map((entry) => _buildQuestionEditor(entry.key)),

                          // Add Question Action Buttons
                          Row(
                            children: [
                              Expanded(
                                child: CustomButton(
                                  text: 'Ajouter question',
                                  icon: Icons.add,
                                  variant: ButtonVariant.secondary,
                                  height: 48,
                                  onPressed: () {
                                    setState(() {
                                      _questions.add(
                                        QuizQuestionDraft(
                                          questionText: '',
                                          questionType: 'mcq_single',
                                          points: 1,
                                        ),
                                      );
                                    });
                                  },
                                ),
                              ),
                              const SizedBox(width: 10),
                              IconButton(
                                style: IconButton.styleFrom(
                                  backgroundColor: AppColors.teacherAccentSoft,
                                  padding: const EdgeInsets.all(12),
                                ),
                                icon: const Icon(
                                  Icons.auto_awesome,
                                  color: AppColors.teacherAccent,
                                ),
                                tooltip: 'Générer avec l\'IA',
                                onPressed: _openAiGenerator,
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                style: IconButton.styleFrom(
                                  backgroundColor: AppColors.frenchGoldBg,
                                  padding: const EdgeInsets.all(12),
                                ),
                                icon: const Icon(
                                  Icons.headphones,
                                  color: AppColors.frenchGold,
                                ),
                                tooltip: 'Section Audio',
                                onPressed: _openAudioStudio,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Bottom Bar
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: const BoxDecoration(
                    color: AppColors.pureWhite,
                    border: Border(top: BorderSide(color: AppColors.border)),
                  ),
                  child: AdaptiveContent(
                    maxWidth: 1080,
                    child: Row(
                      children: [
                        Expanded(
                          child: CustomButton(
                            text: 'Brouillon',
                            variant: ButtonVariant.secondary,
                            isLoading: _isSaving,
                            onPressed: () => _saveQuiz(publish: false),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: CustomButton(
                            text: widget.existingQuiz?['status'] == 'published'
                                ? 'Sauvegarder'
                                : 'Publier',
                            icon: Icons.rocket_launch,
                            variant: ButtonVariant.primary,
                            isLoading: _isSaving,
                            onPressed: () => _saveQuiz(publish: true),
                          ),
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
