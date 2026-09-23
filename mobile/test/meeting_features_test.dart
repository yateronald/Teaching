import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/teacher/meetings/widgets/join_with_id_sheet.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_chat_sheet.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_controls.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_participants_sheet.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_share_sheet.dart';

void main() {
  testWidgets('Phone chat updates while its sheet is open', (tester) async {
    final messages = ValueNotifier<List<MeetingChatMessage>>([]);
    final connection = ValueNotifier<bool>(true);
    addTearDown(messages.dispose);
    addTearDown(connection.dispose);
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: MeetingChatSheet(
              meetingId: 1,
              messagesListenable: messages,
              connectionListenable: connection,
              onNewMessage: (message) {
                messages.value = [...messages.value, message];
              },
            ),
          ),
        ),
      ),
    );

    messages.value = [
      MeetingChatMessage(
        sender: 'Sophie',
        text: 'Bonjour depuis la classe',
        time: '10:30',
      ),
    ];
    await tester.pumpAndSettle();
    expect(find.text('Bonjour depuis la classe'), findsOneWidget);

    connection.value = false;
    await tester.pumpAndSettle();
    expect(find.text('Offline'), findsOneWidget);
  });

  testWidgets('Chat keeps an unconfirmed message editable', (tester) async {
    final messages = ValueNotifier<List<MeetingChatMessage>>([]);
    final connection = ValueNotifier<bool>(true);
    addTearDown(messages.dispose);
    addTearDown(connection.dispose);
    var accepted = false;
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: MeetingChatSheet(
              meetingId: 1,
              messagesListenable: messages,
              connectionListenable: connection,
              onSendMessage: (_) async => accepted,
              onNewMessage: (message) {
                messages.value = [...messages.value, message];
              },
            ),
          ),
        ),
      ),
    );

    await tester.enterText(find.byType(TextField), 'Salut');
    await tester.tap(find.byIcon(Icons.send));
    await tester.pumpAndSettle();
    expect(messages.value, isEmpty);
    expect(find.text('Salut'), findsOneWidget);

    accepted = true;
    await tester.tap(find.byIcon(Icons.send));
    await tester.pumpAndSettle();
    expect(messages.value.single.text, 'Salut');
  });

  testWidgets('JoinWithIdSheet renders fields and labels', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: Scaffold(body: JoinWithIdSheet())),
      ),
    );

    expect(find.text('REJOINDRE UNE CLASSE'), findsOneWidget);
    expect(find.text('Identifiant de réunion (Meeting ID)'), findsOneWidget);
    expect(find.text('Code secret (Passcode)'), findsOneWidget);
    expect(find.text('Vérifier & Rejoindre la classe'), findsOneWidget);
  });

  testWidgets('MeetingParticipantsSheet displays waiting room admissions', (
    WidgetTester tester,
  ) async {
    int? admittedId;
    int? declinedId;

    final admissions = [
      {'userId': 42, 'userName': 'Sophie Martin', 'role': 'student'},
    ];

    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('fr'),
        supportedLocales: const [Locale('fr'), Locale('en')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: Scaffold(
          body: MeetingParticipantsSheet(
            participants: const [],
            admissions: admissions,
            onAdmit: (id) => admittedId = id,
            onDecline: (id) => declinedId = id,
          ),
        ),
      ),
    );

    // Verify waiting room header
    expect(find.text('En salle d\'attente (1)'), findsOneWidget);
    expect(find.text('Sophie Martin'), findsOneWidget);
    expect(find.text('Admettre'), findsOneWidget);
    expect(find.text('Refuser'), findsOneWidget);

    // Tap Admettre
    await tester.tap(find.text('Admettre'));
    expect(admittedId, 42);

    // Tap Refuser
    await tester.tap(find.text('Refuser'));
    expect(declinedId, 42);
  });

  testWidgets('MeetingShareSheet displays meeting ID and full invitation', (
    WidgetTester tester,
  ) async {
    final meeting = {
      'id': 101,
      'code': 'abc-defg-hij',
      'title': 'Atelier Conversation B2',
      'batch_name': 'Cohorte Alpha',
      'passcode': 'W8K2P9',
    };

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          home: Scaffold(body: MeetingShareSheet(meeting: meeting)),
        ),
      ),
    );

    expect(find.text('Détails d\'invitation'), findsOneWidget);
    expect(find.text('Atelier Conversation B2'), findsOneWidget);
    expect(find.text('abc-defg-hij'), findsOneWidget);
    expect(find.text('Copier l\'invitation complète'), findsOneWidget);
  });

  testWidgets('Phone control bar fits small screens, Leave included', (
    WidgetTester tester,
  ) async {
    for (final width in [320.0, 360.0, 393.0, 412.0]) {
      tester.view.physicalSize = Size(width, 800);
      tester.view.devicePixelRatio = 1;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Stack(
              children: [
                Positioned(
                  bottom: 16,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: MeetingControls(
                      isMicOn: true,
                      isCamOn: true,
                      isHandRaised: false,
                      isTablet: false,
                      meetingTitle: 'Classe',
                      participantCount: 3,
                      onToggleMic: () {},
                      onToggleCam: () {},
                      onFlipCam: () {},
                      onToggleHand: () {},
                      onSendReaction: (_) {},
                      onOpenChat: () {},
                      onOpenParticipants: () {},
                      onOpenMore: () {},
                      onLeave: () {},
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      expect(tester.takeException(), isNull, reason: 'overflow at $width');
      final leave = tester.getRect(find.byIcon(Icons.call_end));
      expect(leave.right, lessThanOrEqualTo(width), reason: 'at $width');
      expect(leave.left, greaterThanOrEqualTo(0), reason: 'at $width');
    }
    addTearDown(tester.view.reset);
  });
}
