import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/audio_preview_player.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../widgets/question_editor_card.dart';

class AudioResult {
  final String tempId;
  final String sourceType; // 'tts' | 'upload'
  final String kdriveFileId;
  final String? fileName;
  final int? durationSeconds;
  final String transcript;
  final String? voiceName;
  final int maxPlays;
  final List<QuizQuestionDraft> questions;

  AudioResult({
    required this.tempId,
    required this.sourceType,
    required this.kdriveFileId,
    this.fileName,
    this.durationSeconds,
    required this.transcript,
    this.voiceName,
    this.maxPlays = 0,
    required this.questions,
  });
}

class AudioQuestionSheet extends ConsumerStatefulWidget {
  final String? quizTitle;
  final Function(AudioResult result) onSave;

  const AudioQuestionSheet({super.key, this.quizTitle, required this.onSave});

  @override
  ConsumerState<AudioQuestionSheet> createState() => _AudioQuestionSheetState();
}

class _AudioQuestionSheetState extends ConsumerState<AudioQuestionSheet> {
  String _sourceType = 'tts'; // 'tts' | 'upload'
  final _transcriptCtrl = TextEditingController();
  String _selectedVoice = 'Kore';
  int _maxPlays = 0; // 0 = unlimited, 1, 2
  bool _generateAiQuestions = true;
  int _aiQuestionsCount = 4;

  bool _isGeneratingAudio = false;
  bool _isUploadingAudio = false;
  String? _errorMessage;

  String? _generatedFileId;
  String? _previewAudioPath;
  int? _durationSeconds;
  String? _uploadedFileName;

  final List<Map<String, String>> _voices = [
    {'value': 'Kore', 'label': 'Kore', 'desc': 'Féminin · clair, neutre'},
    {'value': 'Aoede', 'label': 'Aoede', 'desc': 'Féminin · chaleureux, expressif'},
    {'value': 'Leda', 'label': 'Leda', 'desc': 'Féminin · doux, calme'},
    {'value': 'Zephyr', 'label': 'Zephyr', 'desc': 'Féminin · léger, naturel'},
    {'value': 'Puck', 'label': 'Puck', 'desc': 'Masculin · dynamique, amical'},
    {'value': 'Charon', 'label': 'Charon', 'desc': 'Masculin · posé, autoritaire'},
    {'value': 'Fenrir', 'label': 'Fenrir', 'desc': 'Masculin · énergique, net'},
    {'value': 'Orus', 'label': 'Orus', 'desc': 'Masculin · profond, formel'},
  ];

  @override
  void dispose() {
    _transcriptCtrl.dispose();
    super.dispose();
  }

  int _calculateSpokenSeconds(String text) {
    final words = text.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).length;
    return (words / 2.5).ceil();
  }

  Future<void> _generateTTS() async {
    final text = _transcriptCtrl.text.trim();
    if (text.isEmpty) {
      setState(() => _errorMessage = 'Veuillez saisir le texte à lire.');
      return;
    }

    setState(() {
      _isGeneratingAudio = true;
      _errorMessage = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/quizzes/audio/generate', data: {
        'transcript': text,
        'voiceName': _selectedVoice,
        'quizTitle': widget.quizTitle ?? 'Quiz Studio',
      });

      final data = res.data;
      final audioData = data?['audio'];
      final kdriveFileId = audioData?['kdriveFileId']?.toString();
      final wavBase64 = audioData?['wavBase64'] as String?;
      final duration = (audioData?['durationSeconds'] as num?)?.toInt();

      if (kdriveFileId == null) {
        throw Exception('Impossible de générer le fichier audio.');
      }

      String? tempPath;
      if (wavBase64 != null) {
        final bytes = base64Decode(wavBase64);
        final tempDir = Directory.systemTemp;
        final file = File('${tempDir.path}/tts_${DateTime.now().millisecondsSinceEpoch}.wav');
        await file.writeAsBytes(bytes);
        tempPath = file.path;
      }

      if (mounted) {
        setState(() {
          _generatedFileId = kdriveFileId;
          _previewAudioPath = tempPath;
          _durationSeconds = duration ?? _calculateSpokenSeconds(text);
          _isGeneratingAudio = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGeneratingAudio = false;
          _errorMessage = 'Erreur lors de la synthèse vocale : vérifiez la connexion.';
        });
      }
    }
  }

  Future<void> _pickAndUploadAudio() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['mp3', 'wav', 'ogg', 'm4a', 'webm'],
    );

    if (result == null || result.files.single.path == null) return;

    final file = File(result.files.single.path!);
    final fileName = result.files.single.name;

    setState(() {
      _isUploadingAudio = true;
      _errorMessage = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final formData = FormData.fromMap({
        'audio': await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final res = await client.post('/quizzes/audio/upload', data: formData);
      final data = res.data;
      final audioData = data?['audio'];
      final kdriveFileId = audioData?['kdriveFileId']?.toString();

      if (kdriveFileId == null) {
        throw Exception('Échec de l\'envoi du fichier.');
      }

      if (mounted) {
        setState(() {
          _generatedFileId = kdriveFileId;
          _previewAudioPath = file.path;
          _uploadedFileName = fileName;
          _isUploadingAudio = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploadingAudio = false;
          _errorMessage = 'Impossible de téléverser l\'enregistrement.';
        });
      }
    }
  }

  Future<void> _saveAndFinish() async {
    if (_generatedFileId == null) {
      setState(() => _errorMessage = 'Veuillez générer ou importer un enregistrement audio.');
      return;
    }

    List<QuizQuestionDraft> aiQuestions = [];

    final clipTempId = 'clip_${DateTime.now().millisecondsSinceEpoch}';

    // If teacher opted to generate AI comprehension questions from the transcript
    if (_generateAiQuestions && _transcriptCtrl.text.trim().length >= 20) {
      setState(() => _isGeneratingAudio = true);
      try {
        final client = ref.read(apiClientProvider);
        final res = await client.post('/quizzes/ai-generate', data: {
          'totalQuestions': _aiQuestionsCount,
          'singleChoiceCount': _aiQuestionsCount,
          'multipleChoiceCount': 0,
          'yesNoCount': 0,
          'totalPoints': _aiQuestionsCount,
          'userPrompt':
              'Créez des questions de compréhension orale portant rigoureusement sur le dialogue suivant :\n\n"${_transcriptCtrl.text.trim()}"',
        });

        final data = res.data;
        final rawQuestions = data?['questions'] as List? ?? [];
        for (final q in rawQuestions) {
          final qText = q['question'] ?? q['question_text'] ?? '';
          final rawOptions = q['options'] as List? ?? [];
          final List<QuizOptionDraft> options = [];
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
          aiQuestions.add(QuizQuestionDraft(
            questionText: qText,
            questionType: 'mcq_single',
            points: 1,
            options: options,
            audioClipTempId: clipTempId,
            audioFileId: _generatedFileId,
          ));
        }
      } catch (_) {
        // Fallback with empty question if AI failed
      } finally {
        if (mounted) setState(() => _isGeneratingAudio = false);
      }
    }

    widget.onSave(AudioResult(
      tempId: clipTempId,
      sourceType: _sourceType,
      kdriveFileId: _generatedFileId!,
      fileName: _uploadedFileName,
      durationSeconds: _durationSeconds,
      transcript: _transcriptCtrl.text.trim(),
      voiceName: _sourceType == 'tts' ? _selectedVoice : null,
      maxPlays: _maxPlays,
      questions: aiQuestions,
    ));

    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = _transcriptCtrl.text.trim();
    final spokenSec = _calculateSpokenSeconds(text);

    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
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
                      child: const Icon(Icons.headphones_outlined, size: 20, color: AppColors.teacherAccent),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Studio Audio & Écoute',
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

                  // Source Type Tabs (TTS or Upload)
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppColors.borderSoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _sourceType = 'tts'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: _sourceType == 'tts' ? AppColors.pureWhite : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _sourceType == 'tts'
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 4,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                'Synthèse Vocale IA (TTS)',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: _sourceType == 'tts' ? AppColors.frenchNavy : AppColors.textMuted,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _sourceType = 'upload'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: _sourceType == 'upload' ? AppColors.pureWhite : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _sourceType == 'upload'
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.05),
                                          blurRadius: 4,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                'Importer un Fichier Audio',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: _sourceType == 'upload' ? AppColors.frenchNavy : AppColors.textMuted,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  if (_sourceType == 'tts') ...[
                    // Voice Picker (8 voices)
                    Text(
                      'Voix native française',
                      style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedVoice,
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.all(Radius.circular(10))),
                      ),
                      items: _voices.map((v) {
                        return DropdownMenuItem(
                          value: v['value'],
                          child: Row(
                            children: [
                              Text(v['label']!, style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(width: 8),
                              Text('· ${v['desc']}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedVoice = val);
                      },
                    ),
                    const SizedBox(height: 18),

                    // Transcript Text Field
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Transcription orale', style: AppTypography.label.copyWith(fontWeight: FontWeight.w700)),
                        if (spokenSec > 0)
                          Text(
                            '~ $spokenSec s de parole',
                            style: AppTypography.caption.copyWith(color: AppColors.teacherAccent, fontWeight: FontWeight.w600),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    CustomTextField(
                      hintText: 'Saisissez le dialogue ou texte en français que la voix doit prononcer...',
                      controller: _transcriptCtrl,
                      maxLines: 4,
                      onChanged: (_) => setState(() {}),
                    ),
                    const SizedBox(height: 14),

                    CustomButton(
                      text: _isGeneratingAudio ? 'Génération de la voix...' : 'Générer la voix audio',
                      icon: Icons.mic,
                      variant: ButtonVariant.secondary,
                      isLoading: _isGeneratingAudio,
                      width: double.infinity,
                      onPressed: _generateTTS,
                    ),
                  ] else ...[
                    // File Upload Mode
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border, width: 1.5),
                      ),
                      child: Column(
                        children: [
                          const Icon(Icons.cloud_upload_outlined, size: 48, color: AppColors.frenchBlue),
                          const SizedBox(height: 12),
                          Text(
                            _uploadedFileName ?? 'Choisir un enregistrement audio',
                            style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Formats supportés : MP3, WAV, M4A, OGG (jusqu\'à 50 Mo)',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 16),
                          CustomButton(
                            text: _isUploadingAudio ? 'Envoi en cours...' : 'Sélectionner un fichier',
                            icon: Icons.folder_open,
                            variant: ButtonVariant.secondary,
                            isLoading: _isUploadingAudio,
                            onPressed: _pickAndUploadAudio,
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Audio Preview Player
                  if (_previewAudioPath != null) ...[
                    const SizedBox(height: 20),
                    Text(
                      'Écoute de l\'enregistrement généré',
                      style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    AudioPreviewPlayer(
                      audioPath: _previewAudioPath,
                      title: 'Aperçu audio (${_sourceType.toUpperCase()})',
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Max Plays Limit
                  Text(
                    'Limite d\'écoutes autorisées pour l\'étudiant',
                    style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      ChoiceChip(
                        label: const Text('Illimité'),
                        selected: _maxPlays == 0,
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _maxPlays == 0 ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: _maxPlays == 0 ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _maxPlays = 0),
                      ),
                      ChoiceChip(
                        label: const Text('1 écoute (Condition examen)'),
                        selected: _maxPlays == 1,
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _maxPlays == 1 ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: _maxPlays == 1 ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _maxPlays = 1),
                      ),
                      ChoiceChip(
                        label: const Text('2 écoutes (Standard TCF)'),
                        selected: _maxPlays == 2,
                        selectedColor: AppColors.frenchNavy,
                        backgroundColor: AppColors.pureWhite,
                        labelStyle: AppTypography.caption.copyWith(
                          fontWeight: FontWeight.w700,
                          color: _maxPlays == 2 ? AppColors.pureWhite : AppColors.textMuted,
                        ),
                        side: BorderSide(color: _maxPlays == 2 ? AppColors.frenchNavy : AppColors.border),
                        onSelected: (_) => setState(() => _maxPlays = 2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // AI Questions from transcript toggle
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Checkbox(
                              value: _generateAiQuestions,
                              activeColor: AppColors.teacherAccent,
                              onChanged: (val) => setState(() => _generateAiQuestions = val ?? true),
                            ),
                            Expanded(
                              child: Text(
                                'Créer automatiquement des questions de compréhension orale avec l\'IA',
                                style: AppTypography.bodySmall.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.ink,
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (_generateAiQuestions) ...[
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.only(left: 44),
                            child: Row(
                              children: [
                                Text('Nombre de questions : ', style: AppTypography.caption),
                                DropdownButton<int>(
                                  value: _aiQuestionsCount,
                                  isDense: true,
                                  items: [2, 3, 4, 5, 6]
                                      .map((n) => DropdownMenuItem(value: n, child: Text('$n questions')))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _aiQuestionsCount = val);
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Submit
                  CustomButton(
                    text: 'Enregistrer et insérer la section audio',
                    icon: Icons.check,
                    height: 50,
                    width: double.infinity,
                    onPressed: _generatedFileId == null ? null : _saveAndFinish,
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
