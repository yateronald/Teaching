import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/teacher/quizzes/screens/ai_quiz_generator_sheet.dart';
import 'package:mobile/features/teacher/quizzes/screens/audio_question_sheet.dart';
import 'package:mobile/features/teacher/quizzes/widgets/audio_clip_draft.dart';
import 'package:mobile/features/teacher/quizzes/widgets/question_editor_card.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
      final draft = QuizQuestionDraft(questionText: '   ', points: 2);
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
      expect(draft.validate(3), contains('au moins 1 réponse correcte'));

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

    test('Preserves fractional AI marks without truncating them to zero', () {
      final draft = QuizQuestionDraft(
        questionText: 'Complétez la phrase.',
        points: 0.5,
        options: [
          QuizOptionDraft(text: 'Réponse correcte', isCorrect: true),
          QuizOptionDraft(text: 'Distracteur', isCorrect: false),
        ],
      );

      expect(draft.toJson()['marks'], 0.5);
      expect(draft.validate(1), isNull);
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
    testWidgets(
      'Renders QuestionEditorCard and switches between single and yes/no',
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
            locale: const Locale('fr', 'FR'),
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [Locale('fr', 'FR')],
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

        // Verify the localized type dropdown label.
        expect(find.text('Choix unique'), findsOneWidget);

        // A completed manual question collapses into a readable summary and
        // can be reopened for editing.
        expect(find.text('Terminé'), findsOneWidget);
        await tester.tap(find.byKey(const ValueKey('question-done-0')));
        await tester.pumpAndSettle();
        expect(find.text('Énoncé de la question'), findsNothing);
        expect(find.text('Comment dit-on "Hello" ?'), findsOneWidget);
        expect(find.text('Bonjour'), findsOneWidget);

        await tester.tap(find.byKey(const ValueKey('question-edit-0')));
        await tester.pumpAndSettle();
        expect(find.text('Énoncé de la question'), findsOneWidget);
      },
    );

    testWidgets('Done keeps an incomplete manual question open', (
      WidgetTester tester,
    ) async {
      final draft = QuizQuestionDraft(questionText: '', points: 1);

      await tester.pumpWidget(
        MaterialApp(
          locale: const Locale('fr', 'FR'),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('fr', 'FR')],
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

      final doneButton = find.byKey(const ValueKey('question-done-0'));
      await tester.ensureVisible(doneButton);
      await tester.tap(doneButton);
      await tester.pump();
      expect(
        find.textContaining('le libellé de la question est requis'),
        findsOneWidget,
      );
      expect(find.text('Énoncé de la question'), findsOneWidget);
    });

    testWidgets('Generated question starts in completed summary mode', (
      WidgetTester tester,
    ) async {
      final draft = QuizQuestionDraft(
        questionText: 'Quelle expression convient ?',
        points: 0.5,
        startCollapsed: true,
        options: [
          QuizOptionDraft(text: 'La bonne expression', isCorrect: true),
          QuizOptionDraft(text: 'Une autre expression', isCorrect: false),
        ],
      );

      await tester.pumpWidget(
        MaterialApp(
          locale: const Locale('fr', 'FR'),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('fr', 'FR')],
          home: Scaffold(
            body: QuestionEditorCard(
              question: draft,
              index: 0,
              onDuplicate: () {},
              onDelete: () {},
              onChanged: () {},
            ),
          ),
        ),
      );

      expect(find.text('Quelle expression convient ?'), findsOneWidget);
      expect(find.text('La bonne expression'), findsOneWidget);
      expect(find.text('0.5 pts'), findsOneWidget);
      expect(find.text('Énoncé de la question'), findsNothing);

      await tester.tap(find.byKey(const ValueKey('question-edit-0')));
      await tester.pump();
      expect(find.text('Énoncé de la question'), findsOneWidget);
    });
  });

  testWidgets('AI generator exposes count, points, and tablet blueprint', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'app_language_code': 'fr'});
    tester.view.physicalSize = const Size(1100, 850);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          locale: const Locale('fr', 'FR'),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('fr', 'FR')],
          home: Scaffold(
            body: AiQuizGeneratorSheet(
              isDialog: true,
              onAddQuestions: (questions, title, description) {},
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Nombre de questions'), findsOneWidget);
    expect(find.text('Barème des points'), findsOneWidget);
    expect(find.text('PLAN DU QUIZ'), findsOneWidget);
    expect(find.text('10'), findsWidgets);
    expect(find.byType(TextFormField), findsAtLeastNWidgets(3));

    await tester.enterText(find.byType(TextFormField).at(1), '17');
    await tester.pump();
    expect(find.text('17'), findsAtLeastNWidgets(2));
    expect(tester.takeException(), isNull);
  });

  testWidgets('Listening studio gates questions and insertion behind audio', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({'app_language_code': 'fr'});

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          locale: const Locale('fr', 'FR'),
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('fr', 'FR')],
          home: Scaffold(body: AudioQuestionSheet(onSave: (_) {})),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Insérer dans le quiz'), findsNothing);
    expect(find.text('Générer les questions'), findsNothing);
    expect(find.text('Écouter l\'aperçu / Générer la voix'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
