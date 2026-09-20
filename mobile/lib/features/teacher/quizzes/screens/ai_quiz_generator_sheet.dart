import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../widgets/question_editor_card.dart';

class AiQuizGeneratorSheet extends ConsumerStatefulWidget {
  final Function(List<QuizQuestionDraft> questions, String? title, String? desc) onAddQuestions;

  const AiQuizGeneratorSheet({super.key, required this.onAddQuestions});

  @override
  ConsumerState<AiQuizGeneratorSheet> createState() => _AiQuizGeneratorSheetState();
}

class _AiQuizGeneratorSheetState extends ConsumerState<AiQuizGeneratorSheet> {
  int _step = 0; // 0 = brief, 1 = generating, 2 = review
  final _promptCtrl = TextEditingController();

  String? _selectedLevel;
  final String _difficulty = 'balanced';
  final String _language = 'fr';
  int _totalCount = 10;
  String _mix = 'balanced'; // balanced, single
  int _totalPoints = 10;

  int _elapsedSeconds = 0;
  Timer? _timer;
  String? _errorMessage;

  List<QuizQuestionDraft> _generatedQuestions = [];
  final Set<int> _selectedIndices = {};
  String? _generatedTitle;
  String? _generatedDesc;

  final List<Map<String, String>> _starters = [
    {
      'title': 'Passé composé: être ou avoir',
      'prompt': 'Le passé composé avec être et avoir, accord du participe passé inclus',
    },
    {
      'title': 'Subjonctif (doute et souhaits)',
      'prompt': 'L\'emploi du subjonctif présent après les expressions de doute, de volonté et de nécessité',
    },
    {
      'title': 'La négation complexe',
      'prompt': 'La négation avancée: ne…jamais, ne…rien, ne…personne, ne…plus et ne…aucun',
    },
    {
      'title': 'Vocabulaire: Restaurant & Cuisine',
      'prompt': 'Vocabulaire de la cuisine française, des plats typiques et commande au restaurant',
    },
    {
      'title': 'Monde professionnel & Bureau',
      'prompt': 'Vocabulaire du travail en entreprise: réunions, e-mails formels, horaires et collègues',
    },
    {
      'title': 'Compréhension: Vie en ville',
      'prompt': 'Compréhension de petits passages textuels sur le quotidien et les transports dans une ville française',
    },
  ];

  final List<String?> _levels = [null, 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  @override
  void dispose() {
    _promptCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _elapsedSeconds = 0;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() => _elapsedSeconds++);
      }
    });
  }

  Future<void> _generate() async {
    final text = _promptCtrl.text.trim();
    if (text.length < 5) {
      setState(() => _errorMessage = 'Veuillez décrire le sujet des questions à générer.');
      return;
    }

    setState(() {
      _step = 1;
      _errorMessage = null;
    });
    _startTimer();

    // Prepare prompt
    final buffer = StringBuffer(text);
    if (_selectedLevel != null) {
      buffer.writeln('\nNiveau CECRL cible: $_selectedLevel.');
    }
    if (_difficulty == 'accessible') {
      buffer.writeln('Difficulté: questions accessibles, vocabulaire usuel.');
    } else if (_difficulty == 'demanding') {
      buffer.writeln('Difficulté: questions exigeantes, pièges subtils, règles d\'exception.');
    }
    if (_language == 'fr') {
      buffer.writeln('Rédigez les questions et les choix de réponses intégralement en français.');
    } else {
      buffer.writeln('Instructions in English; tested French remains in French.');
    }

    final singleCount = _mix == 'single' ? _totalCount : (_totalCount * 0.5).round();
    final multiCount = _mix == 'single' ? 0 : (_totalCount * 0.3).round();
    final yesNoCount = _totalCount - singleCount - multiCount;

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/quizzes/ai-generate', data: {
        'totalQuestions': _totalCount,
        'singleChoiceCount': singleCount,
        'multipleChoiceCount': multiCount,
        'yesNoCount': yesNoCount,
        'totalPoints': _totalPoints,
        'userPrompt': buffer.toString(),
      });

      _timer?.cancel();

      final data = res.data;
      final rawQuestions = data?['questions'] as List? ?? [];
      final List<QuizQuestionDraft> parsed = [];

      for (final q in rawQuestions) {
        final qText = q['question'] ?? q['question_text'] ?? '';
        final qTypeRaw = q['type'] ?? q['question_type'] ?? 'mcq_single';
        final qType = (qTypeRaw == 'yes_no' || qTypeRaw == 'boolean')
            ? 'yes_no'
            : (qTypeRaw == 'mcq_multiple' ? 'mcq_multiple' : 'mcq_single');
        final points = (q['points'] as num?)?.toInt() ?? (q['marks'] as num?)?.toInt() ?? 1;
        final explanation = q['explanation'] ?? '';

        String? yesNoAnswer;
        final List<QuizOptionDraft> options = [];

        if (qType == 'yes_no') {
          final ca = q['correct_answer'] ?? q['correctAnswer'];
          yesNoAnswer = (ca == 'yes' || ca == 'true' || ca == true) ? 'yes' : 'no';
        } else {
          final rawOptions = q['options'] as List? ?? [];
          for (final opt in rawOptions) {
            if (opt is Map) {
              options.add(QuizOptionDraft(
                text: opt['text'] ?? opt['option_text'] ?? '',
                isCorrect: opt['isCorrect'] == true || opt['is_correct'] == true,
              ));
            } else if (opt is String) {
              final correctAnswers = q['correctAnswers'] ?? [q['correctAnswer']];
              final isCorr = (correctAnswers is List && correctAnswers.contains(opt));
              options.add(QuizOptionDraft(text: opt, isCorrect: isCorr));
            }
          }
        }

        parsed.add(QuizQuestionDraft(
          questionText: qText,
          questionType: qType,
          points: points,
          explanation: explanation,
          yesNoAnswer: yesNoAnswer ?? 'yes',
          options: options,
        ));
      }

      if (parsed.isEmpty) {
        throw Exception('Aucune question générée.');
      }

      if (mounted) {
        setState(() {
          _generatedQuestions = parsed;
          _selectedIndices.clear();
          for (int i = 0; i < parsed.length; i++) {
            _selectedIndices.add(i);
          }
          _generatedTitle = data?['title'];
          _generatedDesc = data?['description'];
          _step = 2;
        });
      }
    } catch (e) {
      _timer?.cancel();
      if (mounted) {
        setState(() {
          _step = 0;
          _errorMessage = 'La génération a échoué. Veuillez réessayer avec un sujet plus précis.';
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
          // Drag handle
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

          // Header
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
                        color: AppColors.teacherAccentSoft,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.auto_awesome, size: 20, color: AppColors.teacherAccent),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Générateur IA de Quiz',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.frenchNavy,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),

          // Body content based on step
          Expanded(
            child: _step == 0
                ? _buildSetupStep()
                : _step == 1
                    ? _buildGeneratingStep()
                    : _buildReviewStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildSetupStep() {
    return SingleChildScrollView(
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

          // Prompt
          Text(
            'Sujet ou compétence ciblée',
            style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          CustomTextField(
            hintText: 'Décrivez précisément ce que le quiz doit évaluer...',
            controller: _promptCtrl,
            maxLines: 3,
          ),
          const SizedBox(height: 14),

          // Starters
          Text(
            'Ou choisissez un modèle rapide :',
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _starters.map((s) {
              return ActionChip(
                label: Text(s['title']!),
                backgroundColor: AppColors.pureWhite,
                side: const BorderSide(color: AppColors.border),
                labelStyle: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.frenchNavy,
                ),
                onPressed: () {
                  setState(() => _promptCtrl.text = s['prompt']!);
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // CEFR Level
          Text(
            'Niveau CECRL cible',
            style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _levels.map((lvl) {
              final isSelected = _selectedLevel == lvl;
              return ChoiceChip(
                label: Text(lvl ?? 'Tous'),
                selected: isSelected,
                selectedColor: AppColors.frenchNavy,
                backgroundColor: AppColors.pureWhite,
                labelStyle: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w700,
                  color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
                ),
                side: BorderSide(color: isSelected ? AppColors.frenchNavy : AppColors.border),
                onSelected: (_) => setState(() => _selectedLevel = lvl),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),

          // Questions Count & Mix
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Nombre de questions', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<int>(
                      initialValue: _totalCount,
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                      ),
                      items: [5, 10, 15, 20].map((c) => DropdownMenuItem(value: c, child: Text('$c questions'))).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _totalCount = val;
                            _totalPoints = val;
                          });
                        }
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Mix de types', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    DropdownButtonFormField<String>(
                      initialValue: _mix,
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'balanced', child: Text('Équilibré')),
                        DropdownMenuItem(value: 'single', child: Text('Choix unique seul')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _mix = val);
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Action button
          CustomButton(
            text: 'Générer avec l\'IA',
            icon: Icons.auto_awesome,
            height: 50,
            width: double.infinity,
            onPressed: _generate,
          ),
        ],
      ),
    );
  }

  Widget _buildGeneratingStep() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(
              width: 56,
              height: 56,
              child: CircularProgressIndicator(
                strokeWidth: 3.5,
                color: AppColors.teacherAccent,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Génération en cours...',
              style: AppTypography.headlineSmall.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'L\'IA analyse votre consigne pédagogique et formule des questions avec distracteurs réalistes.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.surfaceSoft,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                'Temps écoulé : $_elapsedSeconds s',
                style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: AppColors.ink),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewStep() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_selectedIndices.length} sur ${_generatedQuestions.length} sélectionnée(s)',
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.frenchNavy,
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    if (_selectedIndices.length == _generatedQuestions.length) {
                      _selectedIndices.clear();
                    } else {
                      _selectedIndices.clear();
                      for (int i = 0; i < _generatedQuestions.length; i++) {
                        _selectedIndices.add(i);
                      }
                    }
                  });
                },
                child: Text(
                  _selectedIndices.length == _generatedQuestions.length ? 'Tout désélectionner' : 'Tout sélectionner',
                  style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1, color: AppColors.borderSoft),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: _generatedQuestions.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, idx) {
              final q = _generatedQuestions[idx];
              final isChecked = _selectedIndices.contains(idx);

              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isChecked ? AppColors.frenchNavy : AppColors.border,
                    width: isChecked ? 1.5 : 1.0,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: isChecked,
                          activeColor: AppColors.frenchNavy,
                          onChanged: (val) {
                            setState(() {
                              if (val == true) {
                                _selectedIndices.add(idx);
                              } else {
                                _selectedIndices.remove(idx);
                              }
                            });
                          },
                        ),
                        Expanded(
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                margin: const EdgeInsets.only(right: 8),
                                decoration: BoxDecoration(
                                  color: q.questionType == 'yes_no'
                                      ? AppColors.frenchGoldBg
                                      : q.questionType == 'mcq_multiple'
                                          ? AppColors.teacherAccentSoft
                                          : AppColors.surfaceSoft,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  q.questionType == 'yes_no'
                                      ? 'Vrai/Faux'
                                      : q.questionType == 'mcq_multiple'
                                          ? 'Multiples'
                                          : 'QCM',
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10,
                                    color: q.questionType == 'yes_no'
                                        ? AppColors.frenchGold
                                        : q.questionType == 'mcq_multiple'
                                            ? AppColors.teacherAccent
                                            : AppColors.frenchNavy,
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  'Q${idx + 1}. ${q.questionText}',
                                  style: AppTypography.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.ink,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 48, top: 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (q.questionType == 'yes_no') ...[
                            Row(
                              children: [
                                const Icon(Icons.check_circle, size: 16, color: AppColors.good),
                                const SizedBox(width: 8),
                                Text(
                                  'Réponse correcte : ${q.yesNoAnswer == "yes" ? "Vrai (Oui)" : "Faux (Non)"}',
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.good,
                                  ),
                                ),
                              ],
                            ),
                          ] else ...[
                            ...q.options.map((opt) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 4),
                                child: Row(
                                  children: [
                                    Icon(
                                      opt.isCorrect ? Icons.check_circle : Icons.radio_button_unchecked,
                                      size: 14,
                                      color: opt.isCorrect ? AppColors.good : AppColors.textSubtle,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        opt.text,
                                        style: AppTypography.caption.copyWith(
                                          fontWeight: opt.isCorrect ? FontWeight.w700 : FontWeight.w400,
                                          color: opt.isCorrect ? AppColors.good : AppColors.text,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                          ],
                          if (q.explanation.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceSoft,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Explication: ${q.explanation}',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppColors.pureWhite,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: CustomButton(
            text: 'Ajouter ${_selectedIndices.length} question(s) au quiz',
            icon: Icons.check,
            height: 48,
            width: double.infinity,
            onPressed: _selectedIndices.isEmpty
                ? null
                : () {
                    final selectedQuestions = _selectedIndices.map((i) => _generatedQuestions[i]).toList();
                    widget.onAddQuestions(selectedQuestions, _generatedTitle, _generatedDesc);
                    Navigator.pop(context);
                  },
          ),
        ),
      ],
    );
  }
}
