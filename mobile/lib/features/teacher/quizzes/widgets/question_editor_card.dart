import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_text_field.dart';

class QuizOptionDraft {
  int? id;
  String text;
  bool isCorrect;

  QuizOptionDraft({
    this.id,
    required this.text,
    this.isCorrect = false,
  });

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'option_text': text.trim(),
        'is_correct': isCorrect,
      };

  factory QuizOptionDraft.fromJson(Map<String, dynamic> json) => QuizOptionDraft(
        id: (json['id'] as num?)?.toInt(),
        text: json['option_text'] ?? json['text'] ?? '',
        isCorrect: json['is_correct'] == true || json['isCorrect'] == true,
      );
}

class QuizQuestionDraft {
  int? id;
  String questionText;
  String questionType; // mcq_single, mcq_multiple, yes_no
  num points;
  String explanation;
  List<QuizOptionDraft> options;
  String? yesNoAnswer; // 'yes' | 'no'
  String? audioClipTempId;
  int? audioClipId;
  String? audioFileId;
  String? audioUrl;

  QuizQuestionDraft({
    this.id,
    required this.questionText,
    this.questionType = 'mcq_single',
    this.points = 1,
    this.explanation = '',
    List<QuizOptionDraft>? options,
    this.yesNoAnswer = 'yes',
    this.audioClipTempId,
    this.audioClipId,
    this.audioFileId,
    this.audioUrl,
  }) : options = options ?? [
          QuizOptionDraft(text: '', isCorrect: true),
          QuizOptionDraft(text: '', isCorrect: false),
          QuizOptionDraft(text: '', isCorrect: false),
          QuizOptionDraft(text: '', isCorrect: false),
        ];

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'question_text': questionText.trim(),
        'question_type': questionType,
        'marks': points,
        'correct_answer': questionType == 'yes_no' ? (yesNoAnswer ?? 'yes') : null,
        'explanation': explanation.trim(),
        if (audioClipTempId != null) 'audio_clip_temp_id': audioClipTempId,
        if (audioClipId != null) 'audio_clip_id': audioClipId,
        if (audioFileId != null) 'kdrive_file_id': audioFileId,
        'options': questionType == 'yes_no'
            ? []
            : options
                .where((o) => o.text.trim().isNotEmpty)
                .map((o) => o.toJson())
                .toList(),
      };

  String? validate(int number) {
    if (questionText.trim().isEmpty) {
      return 'Question $number : le libellé de la question est requis.';
    }
    if (points <= 0) {
      return 'Question $number : attribuez au moins 0.5 point.';
    }
    if (questionType == 'yes_no') {
      if (yesNoAnswer != 'yes' && yesNoAnswer != 'no') {
        return 'Question $number : indiquez si la réponse est Vrai ou Faux.';
      }
      return null;
    }
    final filled = options.where((o) => o.text.trim().isNotEmpty).toList();
    if (filled.length < 2) {
      return 'Question $number : saisissez au moins 2 options de réponse.';
    }
    final correctCount = filled.where((o) => o.isCorrect).length;
    if (questionType == 'mcq_single' && correctCount != 1) {
      return 'Question $number : un QCM à choix unique doit comporter exactement 1 réponse correcte.';
    }
    if (questionType == 'mcq_multiple' && correctCount < 1) {
      return 'Question $number : un QCM à choix multiples doit comporter au moins 1 réponse correcte.';
    }
    return null;
  }
}

class QuestionEditorCard extends StatefulWidget {
  final int index;
  final QuizQuestionDraft question;
  final VoidCallback onDuplicate;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;
  final VoidCallback onChanged;

  const QuestionEditorCard({
    super.key,
    required this.index,
    required this.question,
    required this.onDuplicate,
    required this.onDelete,
    this.onMoveUp,
    this.onMoveDown,
    required this.onChanged,
  });

  @override
  State<QuestionEditorCard> createState() => _QuestionEditorCardState();
}

class _QuestionEditorCardState extends State<QuestionEditorCard> {
  late TextEditingController _textCtrl;
  late TextEditingController _explainCtrl;

  @override
  void initState() {
    super.initState();
    _textCtrl = TextEditingController(text: widget.question.questionText);
    _explainCtrl = TextEditingController(text: widget.question.explanation);
  }

  @override
  void didUpdateWidget(covariant QuestionEditorCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.question.questionText != widget.question.questionText &&
        _textCtrl.text != widget.question.questionText) {
      _textCtrl.text = widget.question.questionText;
    }
    if (oldWidget.question.explanation != widget.question.explanation &&
        _explainCtrl.text != widget.question.explanation) {
      _explainCtrl.text = widget.question.explanation;
    }
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _explainCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final q = widget.question;
    final isMcqSingle = q.questionType == 'mcq_single';
    final isMcqMulti = q.questionType == 'mcq_multiple';
    final isYesNo = q.questionType == 'yes_no';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row: Question badge, Type picker, Points & Actions
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.frenchNavy,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Q${widget.index + 1}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.pureWhite,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Type dropdown
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: q.questionType,
                  decoration: const InputDecoration(
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                  ),
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                  items: const [
                    DropdownMenuItem(value: 'mcq_single', child: Text('Choix unique (QCM)')),
                    DropdownMenuItem(value: 'mcq_multiple', child: Text('Choix multiples')),
                    DropdownMenuItem(value: 'yes_no', child: Text('Vrai / Faux')),
                  ],
                  onChanged: (val) {
                    if (val == null) return;
                    setState(() {
                      q.questionType = val;
                      if (val == 'yes_no') {
                        q.yesNoAnswer ??= 'yes';
                      } else if (q.options.isEmpty) {
                        q.options = [
                          QuizOptionDraft(text: '', isCorrect: true),
                          QuizOptionDraft(text: '', isCorrect: false),
                          QuizOptionDraft(text: '', isCorrect: false),
                          QuizOptionDraft(text: '', isCorrect: false),
                        ];
                      }
                    });
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 10),
              // Points
              SizedBox(
                width: 75,
                child: TextFormField(
                  initialValue: '${q.points}',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Pts',
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(8))),
                  ),
                  style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                  onChanged: (val) {
                    final p = num.tryParse(val);
                    if (p != null && p > 0) {
                      q.points = p;
                      widget.onChanged();
                    }
                  },
                ),
              ),
              // Actions menu
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20, color: AppColors.textMuted),
                onSelected: (action) {
                  if (action == 'duplicate') widget.onDuplicate();
                  if (action == 'delete') widget.onDelete();
                  if (action == 'up') widget.onMoveUp?.call();
                  if (action == 'down') widget.onMoveDown?.call();
                },
                itemBuilder: (context) => [
                  if (widget.onMoveUp != null)
                    const PopupMenuItem(value: 'up', child: Text('Déplacer vers le haut')),
                  if (widget.onMoveDown != null)
                    const PopupMenuItem(value: 'down', child: Text('Déplacer vers le bas')),
                  const PopupMenuItem(value: 'duplicate', child: Text('Dupliquer')),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Text('Supprimer', style: TextStyle(color: AppColors.bad)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Question Prompt
          CustomTextField(
            label: 'Énoncé de la question',
            hintText: 'Saisissez la question posée aux étudiants...',
            controller: _textCtrl,
            maxLines: 2,
            onChanged: (val) {
              q.questionText = val;
              widget.onChanged();
            },
          ),
          const SizedBox(height: 14),

          // Options / Answers based on type
          if (isYesNo) ...[
            Text(
              'Réponse correcte attendue',
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () {
                      setState(() => q.yesNoAnswer = 'yes');
                      widget.onChanged();
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      decoration: BoxDecoration(
                        color: q.yesNoAnswer == 'yes' ? AppColors.goodBg : AppColors.pureWhite,
                        border: Border.all(
                          color: q.yesNoAnswer == 'yes' ? AppColors.good : AppColors.border,
                          width: q.yesNoAnswer == 'yes' ? 1.5 : 1,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            q.yesNoAnswer == 'yes' ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: q.yesNoAnswer == 'yes' ? AppColors.good : AppColors.textMuted,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Vrai (Oui)',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: q.yesNoAnswer == 'yes' ? AppColors.good : AppColors.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () {
                      setState(() => q.yesNoAnswer = 'no');
                      widget.onChanged();
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      decoration: BoxDecoration(
                        color: q.yesNoAnswer == 'no' ? AppColors.goodBg : AppColors.pureWhite,
                        border: Border.all(
                          color: q.yesNoAnswer == 'no' ? AppColors.good : AppColors.border,
                          width: q.yesNoAnswer == 'no' ? 1.5 : 1,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            q.yesNoAnswer == 'no' ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: q.yesNoAnswer == 'no' ? AppColors.good : AppColors.textMuted,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Faux (Non)',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: q.yesNoAnswer == 'no' ? AppColors.good : AppColors.text,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Text(
              isMcqMulti
                  ? 'Options de réponse (cochez toutes les réponses correctes)'
                  : 'Options de réponse (cochez la seule bonne réponse)',
              style: AppTypography.caption.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 8),

            ...q.options.asMap().entries.map((entry) {
              final optIdx = entry.key;
              final opt = entry.value;
              final letter = String.fromCharCode(65 + optIdx);

              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    if (isMcqSingle)
                      IconButton(
                        icon: Icon(
                          opt.isCorrect ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                          color: opt.isCorrect ? AppColors.good : AppColors.textMuted,
                        ),
                        tooltip: 'Définir comme bonne réponse',
                        onPressed: () {
                          setState(() {
                            for (int i = 0; i < q.options.length; i++) {
                              q.options[i].isCorrect = (i == optIdx);
                            }
                          });
                          widget.onChanged();
                        },
                      )
                    else
                      Checkbox(
                        value: opt.isCorrect,
                        activeColor: AppColors.good,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        onChanged: (val) {
                          setState(() => opt.isCorrect = val ?? false);
                          widget.onChanged();
                        },
                      ),
                    Container(
                      width: 24,
                      alignment: Alignment.center,
                      child: Text(
                        letter,
                        style: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w800,
                          color: opt.isCorrect ? AppColors.good : AppColors.textMuted,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: TextFormField(
                        initialValue: opt.text,
                        decoration: InputDecoration(
                          hintText: 'Option $letter...',
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide(
                              color: opt.isCorrect ? AppColors.good : AppColors.border,
                            ),
                          ),
                        ),
                        onChanged: (val) {
                          opt.text = val;
                          widget.onChanged();
                        },
                      ),
                    ),
                    if (q.options.length > 2)
                      IconButton(
                        icon: const Icon(Icons.close, size: 18, color: AppColors.bad),
                        tooltip: 'Supprimer option',
                        onPressed: () {
                          setState(() => q.options.removeAt(optIdx));
                          widget.onChanged();
                        },
                      ),
                  ],
                ),
              );
            }),

            if (q.options.length < 8)
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    q.options.add(QuizOptionDraft(text: '', isCorrect: false));
                  });
                  widget.onChanged();
                },
                icon: const Icon(Icons.add, size: 16, color: AppColors.frenchNavy),
                label: Text(
                  'Ajouter une option (jusqu\'à 8)',
                  style: AppTypography.caption.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.frenchNavy,
                  ),
                ),
              ),
          ],

          const SizedBox(height: 12),

          // Pedagogical explanation
          CustomTextField(
            label: 'Explication pédagogique (affichée lors de la correction)',
            hintText: 'Pourquoi cette réponse est-elle la bonne ? Précisez la règle...',
            controller: _explainCtrl,
            maxLines: 2,
            prefixIcon: Icons.lightbulb_outline,
            onChanged: (val) {
              q.explanation = val;
              widget.onChanged();
            },
          ),
        ],
      ),
    );
  }
}
