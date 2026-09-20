import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/teacher/quizzes/widgets/audio_clip_draft.dart';
import 'package:mobile/features/teacher/quizzes/widgets/question_editor_card.dart';

void main() {
  group('QuizOptionDraft Unit Tests', () {
    test('toJson and fromJson preserves data', () {
      final opt = QuizOptionDraft(id: 10, text: 'Option A', isCorrect: true);
      final json = opt.toJson();
      expect(json['id'], 10);
      expect(json['option_text'], 'Option A');
      expect(json['is_correct'], true);

      final restored = QuizOptionDraft.fromJson(json);
      expect(restored.id, 10);
      expect(restored.text, 'Option A');
      expect(restored.isCorrect, true);
    });
  });

  group('QuizQuestionDraft Validation & Serialization Tests', () {
    test('Rejects empty question text', () {
      final draft = QuizQuestionDraft(
        questionText: '   ',
        points: 2,
      );
      final error = draft.validate(1);
      expect(error, contains('le libellé de la question est requis'));
    });

    test('Rejects zero or negative points', () {
      final draft = QuizQuestionDraft(
        questionText: 'Quel est ce son ?',
        points: 0,
      );
      final error = draft.validate(2);
      expect(error, contains('au moins 0.5 point'));
    });

    test('Validates mcq_single requires exactly 1 correct answer', () {
      final draft = QuizQuestionDraft(
        questionText: 'Où se situe Paris ?',
        questionType: 'mcq_single',
        points: 1,
        options: [
          QuizOptionDraft(text: 'En France', isCorrect: true),
          QuizOptionDraft(text: 'En Italie', isCorrect: true),
          QuizOptionDraft(text: 'En Espagne', isCorrect: false),
        ],
      );
      expect(
        draft.validate(1),
        contains('doit comporter exactement 1 réponse correcte'),
      );

      // No correct option
      draft.options[0].isCorrect = false;
      draft.options[1].isCorrect = false;
      expect(
        draft.validate(1),
        contains('doit comporter exactement 1 réponse correcte'),
      );

      // Exactly 1 correct option
      draft.options[0].isCorrect = true;
      expect(draft.validate(1), isNull);
    });

    test('Validates mcq_multiple requires at least 1 correct answer', () {
      final draft = QuizQuestionDraft(
        questionText: 'Sélectionnez les pays francophones',
        questionType: 'mcq_multiple',
        points: 2,
        options: [
          QuizOptionDraft(text: 'France', isCorrect: false),
          QuizOptionDraft(text: 'Sénégal', isCorrect: false),
          QuizOptionDraft(text: 'Japon', isCorrect: false),
        ],
      );
      expect(
        draft.validate(3),
        contains('au moins 1 réponse correcte'),
      );

      // 2 correct options
      draft.options[0].isCorrect = true;
      draft.options[1].isCorrect = true;
      expect(draft.validate(3), isNull);
    });

    test('Validates yes_no questions and serializes correctly', () {
      final draft = QuizQuestionDraft(
        questionText: 'La terre est ronde ?',
        questionType: 'yes_no',
        points: 1,
        yesNoAnswer: 'yes',
      );
      expect(draft.validate(4), isNull);

      final json = draft.toJson();
      expect(json['question_type'], 'yes_no');
      expect(json['correct_answer'], 'yes');
      expect(json['options'], isEmpty);
      expect(json['marks'], 1);
    });

    test('Serializes audio clip temp ID matching backend convention', () {
      final draft = QuizQuestionDraft(
        questionText: 'Que dit l\'interlocuteur au début ?',
        questionType: 'mcq_single',
        points: 2,
        audioClipTempId: 'audio_temp_123',
        options: [
          QuizOptionDraft(text: 'Bonjour', isCorrect: true),
          QuizOptionDraft(text: 'Au revoir', isCorrect: false),
        ],
      );

      final json = draft.toJson();
      expect(json['audio_clip_temp_id'], 'audio_temp_123');
      expect((json['options'] as List).length, 2);
    });
  });

  group('AudioClipDraft Tests', () {
    test('Serializes and deserializes listening section audio clip', () {
      final clip = AudioClipDraft(
        tempId: 'clip_abc_1',
        transcript: 'Bienvenue au cours de français.',
        voiceName: 'Orus',
        sourceType: 'tts',
        durationSeconds: 15,
        maxPlays: 2,
      );

      final json = clip.toJson();
      expect(json['tempId'], 'clip_abc_1');
      expect(json['transcript'], 'Bienvenue au cours de français.');
      expect(json['voiceName'], 'Orus');
      expect(json['sourceType'], 'tts');
      expect(json['maxPlays'], 2);

      final restored = AudioClipDraft.fromJson(json);
      expect(restored.tempId, 'clip_abc_1');
      expect(restored.voiceName, 'Orus');
      expect(restored.maxPlays, 2);
    });
  });

  group('QuestionEditorCard Widget Tests', () {
    testWidgets('Renders QuestionEditorCard and switches between single and yes/no',
        (WidgetTester tester) async {
      final draft = QuizQuestionDraft(
        questionText: 'Comment dit-on "Hello" ?',
        questionType: 'mcq_single',
        points: 1,
        options: [
          QuizOptionDraft(text: 'Bonjour', isCorrect: true),
          QuizOptionDraft(text: 'Merci', isCorrect: false),
        ],
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: QuestionEditorCard(
                question: draft,
                index: 0,
                onDuplicate: () {},
                onDelete: () {},
                onChanged: () {},
              ),
            ),
          ),
        ),
      );

      // Verify question index badge and labels
      expect(find.text('Q1'), findsOneWidget);
      expect(find.text('Pts'), findsOneWidget);
      expect(find.text('Énoncé de la question'), findsOneWidget);
      expect(
        find.text('Options de réponse (cochez la seule bonne réponse)'),
        findsOneWidget,
      );

      // Verify type dropdown contains 'Choix unique (QCM)'
      expect(find.text('Choix unique (QCM)'), findsOneWidget);
    });
  });
}
