import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../widgets/question_editor_card.dart';

class AiQuizGeneratorSheet extends ConsumerStatefulWidget {
  final Function(List<QuizQuestionDraft> questions, String? title, String? desc)
  onAddQuestions;
  final bool isDialog;

  const AiQuizGeneratorSheet({
    super.key,
    required this.onAddQuestions,
    this.isDialog = false,
  });

  @override
  ConsumerState<AiQuizGeneratorSheet> createState() =>
      _AiQuizGeneratorSheetState();
}

class _AiQuizGeneratorSheetState extends ConsumerState<AiQuizGeneratorSheet> {
  int _step = 0; // 0 = brief, 1 = generating, 2 = review
  final _promptCtrl = TextEditingController();

  String? _selectedStarterTitle;
  String _difficulty = 'balanced'; // accessible, balanced, demanding
  String _language = 'fr'; // fr, en
  int _totalCount = 10;
  String _questionTypeMode = 'balanced'; // balanced, single, custom
  int _customSingleCount = 5;
  int _customMultiCount = 3;
  int _customYesNoCount = 2;
  String _scoringMode = 'weighted'; // weighted, equal
  int _equalPointsTotal = 10;
  final _questionCountCtrl = TextEditingController(text: '10');
  final _pointsCtrl = TextEditingController(text: '10');
  bool _detailedExplanations = true;
  bool _detectTraps = true;

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
      'prompt':
          'Le passé composé avec être et avoir, accord du participe passé inclus',
    },
    {
      'title': 'Subjonctif (doute et souhaits)',
      'prompt':
          'L\'emploi du subjonctif présent après les expressions de doute, de volonté et de nécessité',
    },
    {
      'title': 'La négation complexe',
      'prompt':
          'La négation avancée: ne…jamais, ne…rien, ne…personne, ne…plus et ne…aucun',
    },
    {
      'title': 'Vocabulaire: Restaurant & Cuisine',
      'prompt':
          'Vocabulaire de la cuisine française, des plats typiques et commande au restaurant',
    },
    {
      'title': 'Monde professionnel & Bureau',
      'prompt':
          'Vocabulaire du travail en entreprise: réunions, e-mails formels, horaires et collègues',
    },
    {
      'title': 'Compréhension: Vie en ville',
      'prompt':
          'Compréhension de petits passages textuels sur le quotidien et les transports dans une ville française',
    },
  ];

  @override
  void dispose() {
    _promptCtrl.dispose();
    _questionCountCtrl.dispose();
    _pointsCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  int get _configuredQuestionCount => _questionTypeMode == 'custom'
      ? _customSingleCount + _customMultiCount + _customYesNoCount
      : _totalCount;

  int get _configuredPoints => _equalPointsTotal.clamp(1, 500);

  ({int single, int multiple, int yesNo}) get _configuredDistribution {
    final total = _configuredQuestionCount;
    if (_questionTypeMode == 'single') {
      return (single: total, multiple: 0, yesNo: 0);
    }
    if (_questionTypeMode == 'custom') {
      return (
        single: _customSingleCount,
        multiple: _customMultiCount,
        yesNo: _customYesNoCount,
      );
    }
    final single = (total * 0.5).round();
    final multiple = (total * 0.3).round();
    return (
      single: single,
      multiple: multiple,
      yesNo: (total - single - multiple).clamp(0, total),
    );
  }

  void _setTotalCount(int count, {bool updateController = true}) {
    final safeCount = count.clamp(1, 50);
    setState(() {
      _totalCount = safeCount;
      if (updateController) {
        _questionCountCtrl.text = '$safeCount';
      }
      _equalPointsTotal = safeCount;
      _pointsCtrl.text = '$safeCount';
      if (_questionTypeMode == 'custom') {
        _customSingleCount = (safeCount * 0.5).round();
        _customMultiCount = (safeCount * 0.3).round();
        _customYesNoCount = safeCount - _customSingleCount - _customMultiCount;
      }
    });
  }

  void _setQuestionTypeMode(String mode) {
    setState(() {
      _questionTypeMode = mode;
      if (mode == 'custom') {
        _customSingleCount = (_totalCount * 0.5).round();
        _customMultiCount = (_totalCount * 0.3).round();
        _customYesNoCount =
            _totalCount - _customSingleCount - _customMultiCount;
      }
    });
  }

  void _setCustomDistribution({int? single, int? multiple, int? yesNo}) {
    setState(() {
      _customSingleCount = (single ?? _customSingleCount).clamp(0, 50);
      _customMultiCount = (multiple ?? _customMultiCount).clamp(0, 50);
      _customYesNoCount = (yesNo ?? _customYesNoCount).clamp(0, 50);
      final total = _configuredQuestionCount.clamp(0, 50);
      _totalCount = total;
      _questionCountCtrl.text = '$total';
      if (total > 0) {
        _equalPointsTotal = total;
        _pointsCtrl.text = '$total';
      }
    });
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

  int? _statusOf(Object error) {
    if (error is DioException) {
      if (error.error is ApiException) {
        return (error.error as ApiException).statusCode;
      }
      return error.response?.statusCode;
    }
    return null;
  }

  bool _isRetryable(Object error) {
    final status = _statusOf(error);
    return status == 429 ||
        status == 500 ||
        status == 502 ||
        status == 503 ||
        status == 504 ||
        (error is DioException &&
            (error.type == DioExceptionType.connectionTimeout ||
                error.type == DioExceptionType.receiveTimeout ||
                error.type == DioExceptionType.connectionError));
  }

  String _friendlyAiError(Object error, {required bool isFr}) {
    dynamic payload;
    String? raw;
    if (error is DioException) {
      payload = error.response?.data;
      if (error.error is ApiException) {
        final apiError = error.error as ApiException;
        payload ??= apiError.details;
        raw = apiError.message;
      }
    }
    if (payload is Map) {
      raw = (payload['message'] ?? payload['error'])?.toString() ?? raw;
    } else if (payload is String) {
      raw = payload;
    }
    raw ??= error.toString();

    try {
      final decoded = jsonDecode(raw);
      if (decoded is Map) {
        final nested = decoded['error'];
        raw = nested is Map
            ? (nested['message'] ?? nested['status'])?.toString()
            : (decoded['message'] ?? nested)?.toString();
      }
    } catch (_) {
      // The server already returned plain text.
    }

    final status = _statusOf(error);
    if (_isRetryable(error) ||
        RegExp(
          r'high demand|temporar|unavailable|overload|rate limit',
          caseSensitive: false,
        ).hasMatch(raw ?? '')) {
      return isFr
          ? 'Le service IA est momentanément très sollicité. Nous avons réessayé automatiquement ; veuillez patienter quelques secondes puis relancer.'
          : 'The AI service is temporarily busy. We retried automatically; wait a few seconds and try again.';
    }
    if (status == 400) {
      return isFr
          ? 'Les paramètres du quiz ne sont pas valides. Vérifiez le nombre de questions et la répartition.'
          : 'The quiz settings are invalid. Check the question count and distribution.';
    }
    return raw == null || raw.isEmpty
        ? (isFr
              ? 'La génération a échoué. Veuillez réessayer.'
              : 'Generation failed. Please try again.')
        : raw;
  }

  Future<Response<dynamic>> _requestGeneration(
    ApiClient client,
    Map<String, dynamic> payload,
  ) async {
    Object? lastError;
    for (var attempt = 0; attempt < 2; attempt++) {
      try {
        return await client.post(
          '/quizzes/ai-generate',
          data: payload,
          options: Options(
            receiveTimeout: const Duration(seconds: 150),
            sendTimeout: const Duration(seconds: 60),
          ),
        );
      } catch (error) {
        lastError = error;
        if (!_isRetryable(error) || attempt == 1) rethrow;
        await Future<void>.delayed(const Duration(milliseconds: 1400));
      }
    }
    throw lastError!;
  }

  Future<void> _generate() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final text = _promptCtrl.text.trim();
    if (text.length < 5) {
      setState(
        () => _errorMessage = isFr
            ? 'Veuillez décrire le sujet ou le texte source du quiz.'
            : 'Please describe the topic or source text of the quiz.',
      );
      return;
    }
    if (_configuredQuestionCount <= 0) {
      setState(
        () => _errorMessage = isFr
            ? 'Ajoutez au moins une question à la répartition.'
            : 'Add at least one question to the distribution.',
      );
      return;
    }

    setState(() {
      _step = 1;
      _errorMessage = null;
    });
    _startTimer();

    // Prepare prompt
    final buffer = StringBuffer(text);
    if (_difficulty == 'accessible') {
      buffer.writeln(
        '\nNiveau cible: Accessible (A1-A2), vocabulaire courant, syntaxe directe.',
      );
    } else if (_difficulty == 'demanding') {
      buffer.writeln(
        '\nNiveau cible: Exigeant (B2-C1), pièges subtils, nuances et exceptions.',
      );
    } else {
      buffer.writeln(
        '\nNiveau cible: Équilibré (B1), structures intermédiaires standard.',
      );
    }

    if (_language == 'fr') {
      buffer.writeln(
        'Rédigez les questions et l\'intégralité des choix de réponses en français.',
      );
    } else {
      buffer.writeln(
        'Quiz language: English instructions, French grammar/vocabulary target.',
      );
    }

    if (_detailedExplanations) {
      buffer.writeln(
        'Fournissez des explications pédagogiques claires pour chaque réponse correcte.',
      );
    }
    if (_detectTraps) {
      buffer.writeln(
        'Intégrez les erreurs fréquentes et faux amis pour tester le discernement.',
      );
    }

    int resolvedTotal = _totalCount;
    int singleCount;
    int multiCount;
    int yesNoCount;

    if (_questionTypeMode == 'single') {
      singleCount = resolvedTotal;
      multiCount = 0;
      yesNoCount = 0;
    } else if (_questionTypeMode == 'custom') {
      singleCount = _customSingleCount;
      multiCount = _customMultiCount;
      yesNoCount = _customYesNoCount;
      resolvedTotal = singleCount + multiCount + yesNoCount;
      if (resolvedTotal <= 0) {
        singleCount = 5;
        resolvedTotal = 5;
      }
    } else {
      singleCount = (resolvedTotal * 0.5).round();
      multiCount = (resolvedTotal * 0.3).round();
      yesNoCount = (resolvedTotal - singleCount - multiCount).clamp(
        0,
        resolvedTotal,
      );
    }

    final int resolvedPoints = _configuredPoints;
    buffer.writeln(
      _scoringMode == 'weighted'
          ? 'Répartissez $resolvedPoints points au total en pondérant les questions selon leur difficulté.'
          : 'Répartissez $resolvedPoints points au total de façon égale entre les questions.',
    );

    try {
      final client = ref.read(apiClientProvider);
      final res = await _requestGeneration(client, {
        'totalQuestions': resolvedTotal,
        'singleChoiceCount': singleCount,
        'multipleChoiceCount': multiCount,
        'yesNoCount': yesNoCount,
        'totalPoints': resolvedPoints,
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
        final rawPoints = (q['points'] as num?) ?? (q['marks'] as num?);
        final num points = rawPoints != null && rawPoints > 0 ? rawPoints : 1;
        final explanation = q['explanation'] ?? '';

        String? yesNoAnswer;
        final List<QuizOptionDraft> options = [];

        if (qType == 'yes_no') {
          final ca = q['correct_answer'] ?? q['correctAnswer'];
          yesNoAnswer = (ca == 'yes' || ca == 'true' || ca == true)
              ? 'yes'
              : 'no';
        } else {
          final rawOptions = q['options'] as List? ?? [];
          for (final opt in rawOptions) {
            if (opt is Map) {
              options.add(
                QuizOptionDraft(
                  text: opt['text'] ?? opt['option_text'] ?? '',
                  isCorrect:
                      opt['isCorrect'] == true || opt['is_correct'] == true,
                ),
              );
            } else if (opt is String) {
              final correctAnswers =
                  q['correctAnswers'] ?? [q['correctAnswer']];
              final isCorr =
                  (correctAnswers is List && correctAnswers.contains(opt));
              options.add(QuizOptionDraft(text: opt, isCorrect: isCorr));
            }
          }
        }

        parsed.add(
          QuizQuestionDraft(
            questionText: qText,
            questionType: qType,
            points: points,
            explanation: explanation,
            yesNoAnswer: yesNoAnswer ?? 'yes',
            options: options,
            startCollapsed: true,
          ),
        );
      }

      if (parsed.isEmpty) {
        throw Exception('Aucune question valide générée par l\'IA.');
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
      debugPrint('[AiQuizGenerator] Generation error: $e');
      final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
      final errorText = _friendlyAiError(e, isFr: isFr);

      if (mounted) {
        setState(() {
          _step = 0;
          _errorMessage = errorText;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';

    return Container(
      height: widget.isDialog
          ? double.infinity
          : MediaQuery.of(context).size.height * 0.92,
      padding: EdgeInsets.only(top: widget.isDialog ? 0 : 12),
      decoration: BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: widget.isDialog
            ? BorderRadius.circular(20)
            : const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag handle
          if (!widget.isDialog) ...[
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
            const SizedBox(height: 10),
          ] else
            const SizedBox(height: 8),

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
                      child: const Icon(
                        Icons.auto_awesome,
                        size: 20,
                        color: AppColors.teacherAccent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      isFr ? 'Générateur IA de Quiz' : 'AI Quiz Generator',
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
                ? _buildSetupStep(isFr)
                : _step == 1
                ? _buildGeneratingStep(isFr)
                : _buildReviewStep(isFr),
          ),
        ],
      ),
    );
  }

  Widget _buildSetupStep(bool isFr) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < 820) {
          return _buildSetupForm(isFr);
        }

        return Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(child: _buildSetupForm(isFr)),
            const VerticalDivider(width: 1, color: AppColors.borderSoft),
            Container(
              width: 300,
              color: AppColors.pureWhite,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: _buildBlueprintCard(isFr),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSetupForm(bool isFr) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
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
                style: AppTypography.caption.copyWith(
                  color: AppColors.bad,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 1. Modèle de départ (Dropdown)
          Text(
            isFr ? 'Modèle de départ' : 'Starter template',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String?>(
                value: _selectedStarterTitle,
                isExpanded: true,
                hint: Text(
                  isFr
                      ? 'Sélectionnez un modèle pédagogique...'
                      : 'Select a starter template...',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.textMuted,
                  ),
                ),
                icon: const Icon(
                  Icons.arrow_drop_down,
                  color: AppColors.textMuted,
                ),
                items: [
                  DropdownMenuItem<String?>(
                    value: null,
                    child: Text(
                      isFr
                          ? '— Aucun modèle (texte libre) —'
                          : '— No template (free text) —',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  ..._starters.map(
                    (s) => DropdownMenuItem<String?>(
                      value: s['title'],
                      child: Text(
                        s['title']!,
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                  ),
                ],
                onChanged: (val) {
                  setState(() {
                    _selectedStarterTitle = val;
                    if (val != null) {
                      final found = _starters.firstWhere(
                        (s) => s['title'] == val,
                      );
                      _promptCtrl.text = found['prompt']!;
                    }
                  });
                },
              ),
            ),
          ),
          const SizedBox(height: 18),

          // 2. Sujet ou texte source
          Text(
            isFr ? 'Sujet ou texte source' : 'Topic or source text',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 6),
          CustomTextField(
            hintText: isFr
                ? 'Ex: Le subjonctif présent en français, les accords du participe passé, ou collez le texte d\'un article...'
                : 'E.g. The present subjunctive in French, past participle agreement, or paste notes...',
            controller: _promptCtrl,
            maxLines: 4,
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 18),

          // 3. Niveau cible (3 segment chips: Accessible, Équilibré, Exigeant)
          Text(
            isFr ? 'Niveau cible' : 'Target level',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildSegmentOption(
                label: isFr ? 'Accessible (A1-A2)' : 'Accessible (A1-A2)',
                selected: _difficulty == 'accessible',
                onTap: () => setState(() => _difficulty = 'accessible'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr ? 'Équilibré (B1)' : 'Balanced (B1)',
                selected: _difficulty == 'balanced',
                onTap: () => setState(() => _difficulty = 'balanced'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr ? 'Exigeant (B2-C1)' : 'Demanding (B2-C1)',
                selected: _difficulty == 'demanding',
                onTap: () => setState(() => _difficulty = 'demanding'),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // 4. Langue du quiz
          Text(
            isFr ? 'Langue du quiz' : 'Quiz language',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildSegmentOption(
                label: isFr ? 'Français' : 'French',
                selected: _language == 'fr',
                onTap: () => setState(() => _language = 'fr'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr ? 'Anglais (Consignes)' : 'English',
                selected: _language == 'en',
                onTap: () => setState(() => _language = 'en'),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // 5. Nombre de questions
          Text(
            isFr ? 'Nombre de questions' : 'Number of questions',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 86,
                child: TextFormField(
                  controller: _questionCountCtrl,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  decoration: InputDecoration(
                    isDense: true,
                    suffixText: 'Q',
                    helperText: '1–50',
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 10,
                    ),
                  ),
                  onChanged: (value) {
                    final count = int.tryParse(value);
                    if (count != null && count >= 1 && count <= 50) {
                      _setTotalCount(count, updateController: false);
                    }
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [5, 10, 15, 20].map((count) {
                    final isSel = _totalCount == count;
                    return ChoiceChip(
                      label: Text('$count'),
                      selected: isSel,
                      selectedColor: AppColors.frenchNavy,
                      backgroundColor: AppColors.pureWhite,
                      labelStyle: AppTypography.caption.copyWith(
                        fontWeight: FontWeight.w700,
                        color: isSel ? AppColors.pureWhite : AppColors.ink,
                      ),
                      side: BorderSide(
                        color: isSel ? AppColors.frenchNavy : AppColors.border,
                      ),
                      onSelected: (_) => _setTotalCount(count),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // 6. Type de questions
          Text(
            isFr ? 'Type de questions' : 'Question types',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildSegmentOption(
                label: isFr ? 'Mix équilibré' : 'Balanced mix',
                selected: _questionTypeMode == 'balanced',
                onTap: () => _setQuestionTypeMode('balanced'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr ? 'Choix unique' : 'Single choice',
                selected: _questionTypeMode == 'single',
                onTap: () => _setQuestionTypeMode('single'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr ? 'Personnalisé' : 'Custom',
                selected: _questionTypeMode == 'custom',
                onTap: () => _setQuestionTypeMode('custom'),
              ),
            ],
          ),

          // Custom question distribution panel
          if (_questionTypeMode == 'custom') ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: AppColors.frenchNavy.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                children: [
                  _buildCustomCountRow(
                    label: isFr
                        ? 'Choix unique (QCM standard)'
                        : 'Single choice (Standard MCQ)',
                    count: _customSingleCount,
                    onChanged: (val) => _setCustomDistribution(single: val),
                  ),
                  const Divider(height: 16, color: AppColors.borderSoft),
                  _buildCustomCountRow(
                    label: isFr
                        ? 'Choix multiples (Plusieurs réponses)'
                        : 'Multiple choice (Several answers)',
                    count: _customMultiCount,
                    onChanged: (val) => _setCustomDistribution(multiple: val),
                  ),
                  const Divider(height: 16, color: AppColors.borderSoft),
                  _buildCustomCountRow(
                    label: isFr ? 'Vrai / Faux' : 'True / False',
                    count: _customYesNoCount,
                    onChanged: (val) => _setCustomDistribution(yesNo: val),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isFr ? 'Total configuré :' : 'Total configured:',
                        style: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      Text(
                        '${_customSingleCount + _customMultiCount + _customYesNoCount} ${isFr ? "questions" : "questions"}',
                        style: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.teacherAccent,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 18),

          // 7. Barème des points
          Text(
            isFr ? 'Barème des points' : 'Scoring system',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildSegmentOption(
                label: isFr
                    ? 'Pondéré selon la difficulté'
                    : 'Weighted by difficulty',
                selected: _scoringMode == 'weighted',
                onTap: () => setState(() => _scoringMode = 'weighted'),
              ),
              const SizedBox(width: 8),
              _buildSegmentOption(
                label: isFr
                    ? 'Points égaux par question'
                    : 'Equal points per question',
                selected: _scoringMode == 'equal',
                onTap: () => setState(() => _scoringMode = 'equal'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 108,
                  child: TextFormField(
                    controller: _pointsCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration: const InputDecoration(
                      isDense: true,
                      suffixText: 'pts',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 10,
                      ),
                    ),
                    onChanged: (value) {
                      final points = int.tryParse(value);
                      if (points != null && points >= 1 && points <= 500) {
                        setState(() => _equalPointsTotal = points);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _scoringMode == 'weighted'
                        ? (isFr
                              ? 'Points au total. Les questions difficiles recevront une pondération plus forte.'
                              : 'Points in total. Harder questions receive a larger share.')
                        : (isFr
                              ? 'Points au total, répartis également entre les questions.'
                              : 'Points in total, shared equally across questions.'),
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // 8. Options pédagogiques
          Text(
            isFr ? 'Options pédagogiques' : 'Pedagogical options',
            style: AppTypography.label.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text(
                    isFr
                        ? 'Explications détaillées pour chaque réponse'
                        : 'Detailed explanations for each answer',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  value: _detailedExplanations,
                  activeThumbColor: AppColors.teacherAccent,
                  onChanged: (v) => setState(() => _detailedExplanations = v),
                ),
                const Divider(height: 1, color: AppColors.borderSoft),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  title: Text(
                    isFr
                        ? 'Détecter les pièges fréquents et faux-amis'
                        : 'Detect frequent traps and false friends',
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  value: _detectTraps,
                  activeThumbColor: AppColors.teacherAccent,
                  onChanged: (v) => setState(() => _detectTraps = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 9. Buttons: Annuler and Générer
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  text: isFr ? 'Annuler' : 'Cancel',
                  variant: ButtonVariant.secondary,
                  height: 48,
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: CustomButton(
                  text: isFr ? 'Générer les questions' : 'Generate questions',
                  icon: Icons.auto_awesome,
                  height: 48,
                  onPressed: _generate,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildBlueprintCard(bool isFr) {
    final distribution = _configuredDistribution;
    final total = _configuredQuestionCount;
    final topic = _promptCtrl.text.trim();
    final level = switch (_difficulty) {
      'accessible' => 'A1–A2',
      'demanding' => 'B2–C1',
      _ => 'B1',
    };
    final lowerMinutes = (total * 0.8).ceil().clamp(1, 90);
    final upperMinutes = (total * 1.5).ceil().clamp(2, 120);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9F8FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.teacherAccent.withValues(alpha: 0.18),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isFr ? 'PLAN DU QUIZ' : 'QUIZ BLUEPRINT',
            style: AppTypography.caption.copyWith(
              color: AppColors.teacherAccent,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
              fontSize: 10,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            topic.isEmpty
                ? (isFr
                      ? 'Votre consigne apparaîtra ici.'
                      : 'Your brief will appear here.')
                : topic,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.bodySmall.copyWith(
              color: topic.isEmpty ? AppColors.textSubtle : AppColors.ink,
              fontStyle: topic.isEmpty ? FontStyle.italic : FontStyle.normal,
              fontWeight: topic.isEmpty ? FontWeight.w400 : FontWeight.w600,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildBlueprintStat(
                value: '$total',
                label: isFr ? 'questions' : 'questions',
              ),
              const SizedBox(width: 8),
              _buildBlueprintStat(
                value: '$_configuredPoints',
                label: isFr ? 'points' : 'points',
              ),
              const SizedBox(width: 8),
              _buildBlueprintStat(value: level, label: 'CEFR'),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: SizedBox(
              height: 7,
              child: total <= 0
                  ? const ColoredBox(color: AppColors.border)
                  : Row(
                      children: [
                        if (distribution.single > 0)
                          Expanded(
                            flex: distribution.single,
                            child: const ColoredBox(
                              color: AppColors.teacherAccent,
                            ),
                          ),
                        if (distribution.multiple > 0)
                          Expanded(
                            flex: distribution.multiple,
                            child: const ColoredBox(
                              color: AppColors.frenchBlue,
                            ),
                          ),
                        if (distribution.yesNo > 0)
                          Expanded(
                            flex: distribution.yesNo,
                            child: const ColoredBox(
                              color: AppColors.frenchGold,
                            ),
                          ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 12),
          _buildBlueprintLegend(
            color: AppColors.teacherAccent,
            label: isFr ? 'Choix unique' : 'Single choice',
            value: distribution.single,
          ),
          _buildBlueprintLegend(
            color: AppColors.frenchBlue,
            label: isFr ? 'Choix multiples' : 'Multiple choice',
            value: distribution.multiple,
          ),
          _buildBlueprintLegend(
            color: AppColors.frenchGold,
            label: isFr ? 'Vrai / Faux' : 'Yes / No',
            value: distribution.yesNo,
          ),
          const Divider(height: 28, color: AppColors.borderSoft),
          Row(
            children: [
              Expanded(
                child: _buildBlueprintDetail(
                  isFr ? 'Difficulté' : 'Difficulty',
                  _difficulty == 'balanced'
                      ? (isFr ? 'Équilibrée' : 'Balanced')
                      : _difficulty == 'accessible'
                      ? (isFr ? 'Accessible' : 'Accessible')
                      : (isFr ? 'Exigeante' : 'Demanding'),
                ),
              ),
              Expanded(
                child: _buildBlueprintDetail(
                  isFr ? 'Langue' : 'Language',
                  _language == 'fr'
                      ? (isFr ? 'Français' : 'French')
                      : (isFr ? 'Anglais' : 'English'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildBlueprintDetail(
                  isFr ? 'Barème' : 'Scoring',
                  _scoringMode == 'weighted'
                      ? (isFr ? 'Par difficulté' : 'By difficulty')
                      : (isFr ? 'Points égaux' : 'Equal points'),
                ),
              ),
              Expanded(
                child: _buildBlueprintDetail(
                  isFr ? 'Temps étudiant' : 'Student time',
                  '≈ $lowerMinutes–$upperMinutes min',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.goodBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.verified_user_outlined,
                  size: 16,
                  color: AppColors.good,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    isFr
                        ? 'Rien n’est ajouté avant votre validation de chaque question et réponse.'
                        : 'Nothing is added until you review every question and answer.',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.good,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBlueprintStat({required String value, required String label}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.borderSoft),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.titleMedium.copyWith(
                fontWeight: FontWeight.w800,
                color: AppColors.ink,
              ),
            ),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.caption.copyWith(
                color: AppColors.textMuted,
                fontSize: 9,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlueprintLegend({
    required Color color,
    required String label,
    required int value,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: AppTypography.caption)),
          Text(
            '$value',
            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }

  Widget _buildBlueprintDetail(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTypography.caption.copyWith(
            color: AppColors.textSubtle,
            fontSize: 9,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: AppTypography.caption.copyWith(
            color: AppColors.ink,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildSegmentOption({
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          constraints: const BoxConstraints(minHeight: 44),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? AppColors.frenchNavy : AppColors.pureWhite,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: selected ? AppColors.frenchNavy : AppColors.border,
              width: 1.2,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: AppColors.frenchNavy.withValues(alpha: 0.15),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w700,
              color: selected ? AppColors.pureWhite : AppColors.ink,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ),
    );
  }

  Widget _buildCustomCountRow({
    required String label,
    required int count,
    required ValueChanged<int> onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: AppTypography.bodySmall.copyWith(color: AppColors.ink),
          ),
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(
                Icons.remove_circle_outline,
                size: 20,
                color: AppColors.textMuted,
              ),
              onPressed: count > 0 ? () => onChanged(count - 1) : null,
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              padding: EdgeInsets.zero,
            ),
            SizedBox(
              width: 32,
              child: Text(
                '$count',
                textAlign: TextAlign.center,
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(
                Icons.add_circle_outline,
                size: 20,
                color: AppColors.teacherAccent,
              ),
              onPressed: () => onChanged(count + 1),
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              padding: EdgeInsets.zero,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGeneratingStep(bool isFr) {
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
              isFr ? 'Génération en cours...' : 'Generation in progress...',
              style: AppTypography.headlineSmall.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              isFr
                  ? 'L\'IA analyse votre consigne pédagogique et formule des questions avec distracteurs réalistes.'
                  : 'AI is analyzing your instructions and generating questions with realistic distractors.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textMuted,
              ),
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
                isFr
                    ? 'Temps écoulé : $_elapsedSeconds s'
                    : 'Elapsed time: ${_elapsedSeconds}s',
                style: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewStep(bool isFr) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isFr
                    ? '${_selectedIndices.length} sur ${_generatedQuestions.length} sélectionnée(s)'
                    : '${_selectedIndices.length} of ${_generatedQuestions.length} selected',
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
                  _selectedIndices.length == _generatedQuestions.length
                      ? (isFr ? 'Tout désélectionner' : 'Deselect all')
                      : (isFr ? 'Tout sélectionner' : 'Select all'),
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
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
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
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
                                      ? (isFr ? 'Vrai/Faux' : 'True/False')
                                      : q.questionType == 'mcq_multiple'
                                      ? (isFr ? 'Multiples' : 'Multiple')
                                      : (isFr ? 'QCM' : 'Single'),
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
                                const Icon(
                                  Icons.check_circle,
                                  size: 16,
                                  color: AppColors.good,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  isFr
                                      ? 'Réponse correcte : ${q.yesNoAnswer == "yes" ? "Vrai (Oui)" : "Faux (Non)"}'
                                      : 'Correct answer: ${q.yesNoAnswer == "yes" ? "True (Yes)" : "False (No)"}',
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
                                      opt.isCorrect
                                          ? Icons.check_circle
                                          : Icons.radio_button_unchecked,
                                      size: 14,
                                      color: opt.isCorrect
                                          ? AppColors.good
                                          : AppColors.textSubtle,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        opt.text,
                                        style: AppTypography.caption.copyWith(
                                          fontWeight: opt.isCorrect
                                              ? FontWeight.w700
                                              : FontWeight.w400,
                                          color: opt.isCorrect
                                              ? AppColors.good
                                              : AppColors.text,
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
                                '${isFr ? "Explication" : "Explanation"}: ${q.explanation}',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textMuted,
                                ),
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
            text: isFr
                ? 'Ajouter ${_selectedIndices.length} question(s) au quiz'
                : 'Add ${_selectedIndices.length} question(s) to quiz',
            icon: Icons.check,
            height: 48,
            width: double.infinity,
            onPressed: _selectedIndices.isEmpty
                ? null
                : () {
                    final selectedQuestions = _selectedIndices
                        .map((i) => _generatedQuestions[i])
                        .toList();
                    widget.onAddQuestions(
                      selectedQuestions,
                      _generatedTitle,
                      _generatedDesc,
                    );
                    Navigator.pop(context);
                  },
          ),
        ),
      ],
    );
  }
}
