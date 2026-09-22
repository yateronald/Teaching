import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';
import '../../../../core/widgets/authenticated_audio_player.dart';
import '../../../../core/widgets/audio_preview_player.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../widgets/question_editor_card.dart';

class AudioResult {
  final String tempId;
  final String sourceType; // 'tts' | 'upload'
  final String kdriveFileId;
  final String? localFilePath;
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
    this.localFilePath,
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
  bool _isGeneratingQuestions = false;
  String? _errorMessage;

  String? _generatedFileId;
  String? _previewAudioPath;
  int? _durationSeconds;
  String? _uploadedFileName;
  String? _generatedTranscript;
  String? _generatedVoice;
  String? _questionsTranscript;
  List<QuizQuestionDraft> _generatedQuestions = [];

  final List<Map<String, String>> _voices = [
    {'value': 'Kore', 'label': 'Kore', 'desc': 'Féminin · clair, neutre'},
    {
      'value': 'Aoede',
      'label': 'Aoede',
      'desc': 'Féminin · chaleureux, expressif',
    },
    {'value': 'Leda', 'label': 'Leda', 'desc': 'Féminin · doux, calme'},
    {'value': 'Zephyr', 'label': 'Zephyr', 'desc': 'Féminin · léger, naturel'},
    {'value': 'Puck', 'label': 'Puck', 'desc': 'Masculin · dynamique, amical'},
    {
      'value': 'Charon',
      'label': 'Charon',
      'desc': 'Masculin · posé, autoritaire',
    },
    {'value': 'Fenrir', 'label': 'Fenrir', 'desc': 'Masculin · énergique, net'},
    {'value': 'Orus', 'label': 'Orus', 'desc': 'Masculin · profond, formel'},
  ];

  @override
  void dispose() {
    _transcriptCtrl.dispose();
    super.dispose();
  }

  int _calculateSpokenSeconds(String text) {
    final words = text
        .trim()
        .split(RegExp(r'\s+'))
        .where((w) => w.isNotEmpty)
        .length;
    return (words / 2.5).ceil();
  }

  bool get _audioIsStale =>
      _sourceType == 'tts' &&
      _generatedFileId != null &&
      (_generatedTranscript != _transcriptCtrl.text.trim() ||
          _generatedVoice != _selectedVoice);

  bool get _audioReady => _generatedFileId != null && !_audioIsStale;

  bool get _questionsReady =>
      !_generateAiQuestions ||
      (_generatedQuestions.isNotEmpty &&
          _questionsTranscript == _transcriptCtrl.text.trim());

  void _clearGeneratedQuestions() {
    _generatedQuestions = [];
    _questionsTranscript = null;
  }

  String _errorText(Object error, {required bool isFr}) {
    dynamic payload;
    if (error is DioException) payload = error.response?.data;
    String? message;
    if (payload is Map) {
      message = (payload['message'] ?? payload['error'])?.toString();
    }
    message ??= error.toString().replaceFirst('Exception: ', '');
    try {
      final decoded = jsonDecode(message);
      if (decoded is Map) {
        final nested = decoded['error'];
        message = nested is Map
            ? (nested['message'] ?? nested['status'])?.toString()
            : (decoded['message'] ?? nested)?.toString();
      }
    } catch (_) {
      // Plain server message.
    }
    if (RegExp(
      r'high demand|temporar|unavailable|overload|rate limit',
      caseSensitive: false,
    ).hasMatch(message ?? '')) {
      return isFr
          ? 'Le service IA est momentanément très sollicité. Patientez quelques secondes puis réessayez.'
          : 'The AI service is temporarily busy. Wait a few seconds and try again.';
    }
    return message?.isNotEmpty == true
        ? message!
        : (isFr ? 'Une erreur est survenue.' : 'Something went wrong.');
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
      final res = await client.post(
        '/quizzes/audio/generate',
        data: {
          'transcript': text,
          'voiceName': _selectedVoice,
          'quizTitle': widget.quizTitle ?? 'Quiz Studio',
        },
      );

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
        final file = File(
          '${tempDir.path}/tts_${DateTime.now().millisecondsSinceEpoch}.wav',
        );
        await file.writeAsBytes(bytes);
        tempPath = file.path;
      }

      if (mounted) {
        setState(() {
          _generatedFileId = kdriveFileId;
          _previewAudioPath = tempPath;
          _durationSeconds = duration ?? _calculateSpokenSeconds(text);
          _generatedTranscript = text;
          _generatedVoice = _selectedVoice;
          _clearGeneratedQuestions();
          _isGeneratingAudio = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isGeneratingAudio = false;
          _errorMessage = _errorText(
            e,
            isFr: ref.read(appLocaleProvider).languageCode == 'fr',
          );
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
          _generatedTranscript = null;
          _generatedVoice = null;
          _clearGeneratedQuestions();
          _isUploadingAudio = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploadingAudio = false;
          _errorMessage = _errorText(
            e,
            isFr: ref.read(appLocaleProvider).languageCode == 'fr',
          );
        });
      }
    }
  }

  Future<void> _generateQuestions() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final transcript = _transcriptCtrl.text.trim();
    if (!_audioReady) {
      setState(
        () => _errorMessage = isFr
            ? 'Générez d\'abord l\'audio avant de créer les questions.'
            : 'Generate the audio before creating questions.',
      );
      return;
    }
    if (transcript.length < 20) {
      setState(
        () => _errorMessage = isFr
            ? 'Ajoutez une transcription d\'au moins une phrase pour générer les questions.'
            : 'Add a transcript of at least one sentence to generate questions.',
      );
      return;
    }

    setState(() {
      _isGeneratingQuestions = true;
      _errorMessage = null;
      _clearGeneratedQuestions();
    });

    try {
      final singleCount = (_aiQuestionsCount * 0.6).ceil().clamp(
        1,
        _aiQuestionsCount,
      );
      final payload = <String, dynamic>{
        'totalQuestions': _aiQuestionsCount,
        'singleChoiceCount': singleCount,
        'multipleChoiceCount': 0,
        'yesNoCount': _aiQuestionsCount - singleCount,
        'totalPoints': _aiQuestionsCount,
        'userPrompt':
            'Listening comprehension questions for a French audio recording. Students hear the audio but never see this transcript. Test key details, the main idea, vocabulary in context and simple inference. Every answer must be supported by the recording.\n\nTranscript:\n"""${transcript.substring(0, transcript.length > 700 ? 700 : transcript.length)}"""',
      };
      final client = ref.read(apiClientProvider);
      Response<dynamic>? response;
      Object? lastError;
      for (var attempt = 0; attempt < 2; attempt++) {
        try {
          response = await client.post(
            '/quizzes/ai-generate',
            data: payload,
            options: Options(
              receiveTimeout: const Duration(seconds: 150),
              sendTimeout: const Duration(seconds: 60),
            ),
          );
          break;
        } catch (error) {
          lastError = error;
          final status = error is DioException
              ? error.response?.statusCode
              : null;
          if (attempt == 1 || !{429, 500, 502, 503, 504}.contains(status)) {
            rethrow;
          }
          await Future<void>.delayed(const Duration(milliseconds: 1400));
        }
      }
      if (response == null) throw lastError ?? Exception('No response');

      final rawQuestions = response.data?['questions'] as List? ?? const [];
      final clipTempId = 'clip_${DateTime.now().millisecondsSinceEpoch}';
      final parsed = <QuizQuestionDraft>[];
      for (final raw in rawQuestions) {
        if (raw is! Map) continue;
        final typeValue = raw['question_type'] ?? raw['type'];
        final type = typeValue == 'yes_no' || typeValue == 'boolean'
            ? 'yes_no'
            : typeValue == 'mcq_multiple'
            ? 'mcq_multiple'
            : 'mcq_single';
        final options = <QuizOptionDraft>[];
        for (final option in (raw['options'] as List? ?? const [])) {
          if (option is Map) {
            options.add(
              QuizOptionDraft(
                text: (option['option_text'] ?? option['text'] ?? '')
                    .toString(),
                isCorrect:
                    option['is_correct'] == true || option['isCorrect'] == true,
              ),
            );
          }
        }
        final correct = raw['correct_answer'] ?? raw['correctAnswer'];
        final draft = QuizQuestionDraft(
          questionText: (raw['question_text'] ?? raw['question'] ?? '')
              .toString(),
          questionType: type,
          points: (raw['marks'] as num?) ?? (raw['points'] as num?) ?? 1,
          explanation: (raw['explanation'] ?? '').toString(),
          yesNoAnswer: correct == true || correct == 'true' || correct == 'yes'
              ? 'yes'
              : 'no',
          options: options,
          audioClipTempId: clipTempId,
          audioFileId: _generatedFileId,
          startCollapsed: true,
        );
        if (draft.validate(parsed.length + 1) == null) parsed.add(draft);
      }
      if (parsed.isEmpty) {
        throw Exception(
          isFr
              ? 'L\'IA n\'a retourné aucune question utilisable.'
              : 'The AI returned no usable questions.',
        );
      }

      if (mounted) {
        setState(() {
          _generatedQuestions = parsed;
          _questionsTranscript = transcript;
          _isGeneratingQuestions = false;
        });
      }
    } catch (error) {
      if (mounted) {
        setState(() {
          _isGeneratingQuestions = false;
          _errorMessage = _errorText(error, isFr: isFr);
        });
      }
    }
  }

  void _saveAndFinish() {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    if (!_audioReady || !_questionsReady) {
      setState(
        () => _errorMessage = isFr
            ? 'Terminez d\'abord les étapes audio et questions.'
            : 'Complete the audio and question steps first.',
      );
      return;
    }

    final clipTempId = _generateAiQuestions && _generatedQuestions.isNotEmpty
        ? _generatedQuestions.first.audioClipTempId!
        : 'clip_${DateTime.now().millisecondsSinceEpoch}';
    widget.onSave(
      AudioResult(
        tempId: clipTempId,
        sourceType: _sourceType,
        kdriveFileId: _generatedFileId!,
        localFilePath: _previewAudioPath,
        fileName: _uploadedFileName,
        durationSeconds: _durationSeconds,
        transcript: _transcriptCtrl.text.trim(),
        voiceName: _sourceType == 'tts' ? _selectedVoice : null,
        maxPlays: _maxPlays,
        questions: _generateAiQuestions
            ? List<QuizQuestionDraft>.from(_generatedQuestions)
            : const <QuizQuestionDraft>[],
      ),
    );

    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
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
                      child: const Icon(
                        Icons.headphones_outlined,
                        size: 20,
                        color: AppColors.teacherAccent,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      isFr
                          ? 'Studio Audio & Écoute'
                          : 'Audio & Listening Studio',
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
                        style: AppTypography.caption.copyWith(
                          color: AppColors.bad,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Source Type Tabs (TTS or Upload)
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 13,
                        backgroundColor: _audioReady
                            ? AppColors.good
                            : AppColors.frenchNavy,
                        foregroundColor: AppColors.pureWhite,
                        child: _audioReady
                            ? const Icon(Icons.check, size: 15)
                            : const Text(
                                '1',
                                style: TextStyle(fontWeight: FontWeight.w800),
                              ),
                      ),
                      const SizedBox(width: 9),
                      Text(
                        isFr ? 'Audio' : 'Audio',
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.frenchNavy,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
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
                            onTap: _generatedFileId != null
                                ? null
                                : () => setState(() => _sourceType = 'tts'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: _sourceType == 'tts'
                                    ? AppColors.pureWhite
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _sourceType == 'tts'
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.05,
                                          ),
                                          blurRadius: 4,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                isFr
                                    ? 'Synthèse Vocale IA (TTS)'
                                    : 'AI Voice Synthesis (TTS)',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: _sourceType == 'tts'
                                      ? AppColors.frenchNavy
                                      : AppColors.textMuted,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: _generatedFileId != null
                                ? null
                                : () => setState(() => _sourceType = 'upload'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: _sourceType == 'upload'
                                    ? AppColors.pureWhite
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: _sourceType == 'upload'
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.05,
                                          ),
                                          blurRadius: 4,
                                          offset: const Offset(0, 1),
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Text(
                                isFr
                                    ? 'Importer un Fichier Audio'
                                    : 'Upload Audio File',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: _sourceType == 'upload'
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
                  const SizedBox(height: 20),

                  if (_sourceType == 'tts') ...[
                    // Voice Picker (8 voices)
                    Text(
                      isFr ? 'Voix native française' : 'Native French Voice',
                      style: AppTypography.label.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedVoice,
                      decoration: const InputDecoration(
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                        ),
                      ),
                      items: _voices.map((v) {
                        return DropdownMenuItem(
                          value: v['value'],
                          child: Row(
                            children: [
                              Text(
                                v['label']!,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '· ${v['desc']}',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedVoice = val;
                            _clearGeneratedQuestions();
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 18),

                    // Transcript Text Field
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          isFr
                              ? 'Texte à synthétiser en audio (CO)'
                              : 'Text to synthesize into audio (CO)',
                          style: AppTypography.label.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (spokenSec > 0)
                          Text(
                            isFr
                                ? '~ $spokenSec s de parole'
                                : '~ ${spokenSec}s speaking time',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.teacherAccent,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    CustomTextField(
                      hintText: isFr
                          ? 'Collez le texte du dialogue, du document ou de la situation à écouter...'
                          : 'Paste the dialogue, document, or audio situation text to listen to...',
                      controller: _transcriptCtrl,
                      maxLines: 5,
                      onChanged: (_) => setState(_clearGeneratedQuestions),
                    ),
                    const SizedBox(height: 4),
                    Align(
                      alignment: Alignment.centerRight,
                      child: Text(
                        '${_transcriptCtrl.text.length} / 5 000',
                        style: AppTypography.caption.copyWith(
                          color: _transcriptCtrl.text.length > 5000
                              ? AppColors.bad
                              : AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    CustomButton(
                      text: _isGeneratingAudio
                          ? (isFr
                                ? 'Génération de la voix en cours...'
                                : 'Generating audio voice...')
                          : (isFr
                                ? 'Écouter l\'aperçu / Générer la voix'
                                : 'Listen preview / Generate voice'),
                      icon: Icons.mic,
                      variant: ButtonVariant.secondary,
                      isLoading: _isGeneratingAudio,
                      width: double.infinity,
                      onPressed:
                          text.isEmpty ||
                              text.length > 5000 ||
                              _isUploadingAudio ||
                              _isGeneratingQuestions
                          ? null
                          : _generateTTS,
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
                          const Icon(
                            Icons.cloud_upload_outlined,
                            size: 48,
                            color: AppColors.frenchBlue,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _uploadedFileName ??
                                (isFr
                                    ? 'Choisir un enregistrement audio'
                                    : 'Choose an audio recording'),
                            style: AppTypography.titleSmall.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isFr
                                ? 'Formats supportés : MP3, WAV, M4A, OGG (jusqu\'à 50 Mo)'
                                : 'Supported formats: MP3, WAV, M4A, OGG (up to 50 MB)',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 16),
                          CustomButton(
                            text: _isUploadingAudio
                                ? (isFr ? 'Envoi en cours...' : 'Uploading...')
                                : (isFr
                                      ? 'Sélectionner un fichier'
                                      : 'Select a file'),
                            icon: Icons.folder_open,
                            variant: ButtonVariant.secondary,
                            isLoading: _isUploadingAudio,
                            onPressed: _pickAndUploadAudio,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    CustomTextField(
                      label: isFr
                          ? 'Transcription de l\'enregistrement'
                          : 'Recording transcript',
                      hintText: isFr
                          ? 'Collez ce qui est dit dans l\'audio pour générer les questions...'
                          : 'Paste what is said so questions can be generated...',
                      controller: _transcriptCtrl,
                      maxLines: 4,
                      onChanged: (_) => setState(_clearGeneratedQuestions),
                    ),
                  ],

                  // Audio Preview Player
                  if (_generatedFileId != null) ...[
                    const SizedBox(height: 20),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(13),
                      decoration: BoxDecoration(
                        color: _audioIsStale
                            ? AppColors.warnBg
                            : AppColors.goodBg,
                        borderRadius: BorderRadius.circular(11),
                        border: Border.all(
                          color: _audioIsStale
                              ? AppColors.warnBorder
                              : AppColors.goodBorder,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _audioIsStale
                                ? Icons.warning_amber_rounded
                                : Icons.check_circle,
                            color: _audioIsStale
                                ? AppColors.warn
                                : AppColors.good,
                          ),
                          const SizedBox(width: 9),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _audioIsStale
                                      ? (isFr
                                            ? 'Le texte ou la voix a changé'
                                            : 'Text or voice changed')
                                      : (isFr ? 'Audio prêt' : 'Audio ready'),
                                  style: AppTypography.bodySmall.copyWith(
                                    color: _audioIsStale
                                        ? AppColors.warn
                                        : AppColors.good,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Text(
                                  _audioIsStale
                                      ? (isFr
                                            ? 'Régénérez l\'audio avant de continuer.'
                                            : 'Regenerate audio before continuing.')
                                      : '${_sourceType == 'tts' ? _selectedVoice : (_uploadedFileName ?? 'Audio')} · ${_durationSeconds ?? spokenSec} s',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TextButton(
                            onPressed: () => setState(() {
                              _generatedFileId = null;
                              _previewAudioPath = null;
                              _durationSeconds = null;
                              _uploadedFileName = null;
                              _generatedTranscript = null;
                              _generatedVoice = null;
                              _clearGeneratedQuestions();
                            }),
                            child: Text(isFr ? 'Supprimer' : 'Remove'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      isFr ? 'Aperçu de la piste audio' : 'Audio preview',
                      style: AppTypography.label.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_previewAudioPath != null)
                      AudioPreviewPlayer(
                        audioPath: _previewAudioPath,
                        title: 'Aperçu audio (${_sourceType.toUpperCase()})',
                      )
                    else
                      AuthenticatedAudioPlayer(
                        endpoint:
                            '/quizzes/audio/preview/${Uri.encodeComponent(_generatedFileId!)}',
                        title: isFr ? 'Écouter l\'audio' : 'Play audio',
                      ),
                  ],

                  if (_audioReady) ...[
                    const SizedBox(height: 24),

                    // Max Plays Limit
                    Row(
                      children: [
                        const CircleAvatar(
                          radius: 13,
                          backgroundColor: AppColors.frenchNavy,
                          foregroundColor: AppColors.pureWhite,
                          child: Text(
                            '2',
                            style: TextStyle(fontWeight: FontWeight.w800),
                          ),
                        ),
                        const SizedBox(width: 9),
                        Text(
                          isFr ? 'Conditions d\'écoute' : 'Playback rules',
                          style: AppTypography.titleSmall.copyWith(
                            color: AppColors.frenchNavy,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      isFr
                          ? 'Limite d\'écoutes autorisées'
                          : 'Allowed listen limit',
                      style: AppTypography.label.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ChoiceChip(
                          label: Text(isFr ? 'Illimité' : 'Unlimited'),
                          selected: _maxPlays == 0,
                          selectedColor: AppColors.frenchNavy,
                          backgroundColor: AppColors.pureWhite,
                          labelStyle: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _maxPlays == 0
                                ? AppColors.pureWhite
                                : AppColors.ink,
                          ),
                          side: BorderSide(
                            color: _maxPlays == 0
                                ? AppColors.frenchNavy
                                : AppColors.border,
                          ),
                          onSelected: (_) => setState(() => _maxPlays = 0),
                        ),
                        ChoiceChip(
                          label: Text(
                            isFr ? '1 fois (Examen)' : '1 time (Exam)',
                          ),
                          selected: _maxPlays == 1,
                          selectedColor: AppColors.frenchNavy,
                          backgroundColor: AppColors.pureWhite,
                          labelStyle: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _maxPlays == 1
                                ? AppColors.pureWhite
                                : AppColors.ink,
                          ),
                          side: BorderSide(
                            color: _maxPlays == 1
                                ? AppColors.frenchNavy
                                : AppColors.border,
                          ),
                          onSelected: (_) => setState(() => _maxPlays = 1),
                        ),
                        ChoiceChip(
                          label: Text(isFr ? '2 fois (TCF)' : '2 times (TCF)'),
                          selected: _maxPlays == 2,
                          selectedColor: AppColors.frenchNavy,
                          backgroundColor: AppColors.pureWhite,
                          labelStyle: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _maxPlays == 2
                                ? AppColors.pureWhite
                                : AppColors.ink,
                          ),
                          side: BorderSide(
                            color: _maxPlays == 2
                                ? AppColors.frenchNavy
                                : AppColors.border,
                          ),
                          onSelected: (_) => setState(() => _maxPlays = 2),
                        ),
                        ChoiceChip(
                          label: Text(isFr ? '3 fois' : '3 times'),
                          selected: _maxPlays == 3,
                          selectedColor: AppColors.frenchNavy,
                          backgroundColor: AppColors.pureWhite,
                          labelStyle: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _maxPlays == 3
                                ? AppColors.pureWhite
                                : AppColors.ink,
                          ),
                          side: BorderSide(
                            color: _maxPlays == 3
                                ? AppColors.frenchNavy
                                : AppColors.border,
                          ),
                          onSelected: (_) => setState(() => _maxPlays = 3),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // AI Questions from transcript toggle
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 13,
                          backgroundColor: _questionsReady
                              ? AppColors.good
                              : AppColors.frenchNavy,
                          foregroundColor: AppColors.pureWhite,
                          child: _questionsReady
                              ? const Icon(Icons.check, size: 15)
                              : const Text(
                                  '3',
                                  style: TextStyle(fontWeight: FontWeight.w800),
                                ),
                        ),
                        const SizedBox(width: 9),
                        Text(
                          isFr ? 'Questions' : 'Questions',
                          style: AppTypography.titleSmall.copyWith(
                            color: AppColors.frenchNavy,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
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
                                onChanged: _isGeneratingQuestions
                                    ? null
                                    : (val) => setState(
                                        () =>
                                            _generateAiQuestions = val ?? true,
                                      ),
                              ),
                              Expanded(
                                child: Text(
                                  isFr
                                      ? 'Générer automatiquement des questions de compréhension avec l\'IA'
                                      : 'Automatically generate comprehension questions with AI',
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
                                  Text(
                                    isFr
                                        ? 'Nombre de questions : '
                                        : 'Number of questions: ',
                                    style: AppTypography.caption,
                                  ),
                                  DropdownButton<int>(
                                    value: _aiQuestionsCount,
                                    isDense: true,
                                    items: [2, 3, 4, 5, 6]
                                        .map(
                                          (n) => DropdownMenuItem(
                                            value: n,
                                            child: Text('$n questions'),
                                          ),
                                        )
                                        .toList(),
                                    onChanged: (val) {
                                      if (val != null) {
                                        setState(() {
                                          _aiQuestionsCount = val;
                                          _clearGeneratedQuestions();
                                        });
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 12),
                            CustomButton(
                              text: _isGeneratingQuestions
                                  ? (isFr
                                        ? 'Création des questions...'
                                        : 'Writing questions...')
                                  : _generatedQuestions.isNotEmpty
                                  ? (isFr
                                        ? 'Régénérer les questions'
                                        : 'Regenerate questions')
                                  : (isFr
                                        ? 'Générer les questions'
                                        : 'Generate questions'),
                              icon: Icons.auto_awesome,
                              variant: ButtonVariant.secondary,
                              width: double.infinity,
                              isLoading: _isGeneratingQuestions,
                              onPressed:
                                  _transcriptCtrl.text.trim().length < 20 ||
                                      _isGeneratingAudio ||
                                      _isUploadingAudio
                                  ? null
                                  : _generateQuestions,
                            ),
                            if (_generatedQuestions.isNotEmpty &&
                                _questionsReady) ...[
                              const SizedBox(height: 12),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.goodBg,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: AppColors.goodBorder,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.check_circle,
                                          size: 18,
                                          color: AppColors.good,
                                        ),
                                        const SizedBox(width: 7),
                                        Text(
                                          isFr
                                              ? '${_generatedQuestions.length} questions prêtes à réviser dans le quiz'
                                              : '${_generatedQuestions.length} questions ready to review in the quiz',
                                          style: AppTypography.caption.copyWith(
                                            color: AppColors.good,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    ..._generatedQuestions
                                        .take(3)
                                        .map(
                                          (question) => Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 4,
                                            ),
                                            child: Text(
                                              '• ${question.questionText}',
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: AppTypography.caption
                                                  .copyWith(
                                                    color: AppColors.textMuted,
                                                  ),
                                            ),
                                          ),
                                        ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 28),

                  // Submit Buttons: Cancel and Insert
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
                      if (_audioReady && _questionsReady) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: CustomButton(
                            text: isFr
                                ? 'Insérer dans le quiz'
                                : 'Insert into quiz',
                            icon: Icons.check,
                            height: 48,
                            onPressed: _saveAndFinish,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
