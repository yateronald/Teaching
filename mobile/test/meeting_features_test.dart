import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/features/teacher/meetings/widgets/join_with_id_sheet.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_participants_sheet.dart';
import 'package:mobile/features/teacher/meetings/widgets/meeting_share_sheet.dart';

void main() {
  testWidgets('JoinWithIdSheet renders fields and labels', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: Scaffold(
            body: JoinWithIdSheet(),
          ),
        ),
      ),
    );

    expect(find.text('REJOINDRE UNE CLASSE'), findsOneWidget);
    expect(find.text('Identifiant de réunion (Meeting ID)'), findsOneWidget);
    expect(find.text('Code secret (Passcode)'), findsOneWidget);
    expect(find.text('Vérifier & Rejoindre la classe'), findsOneWidget);
  });

  testWidgets('MeetingParticipantsSheet displays waiting room admissions', (WidgetTester tester) async {
    int? admittedId;
    int? declinedId;

    final admissions = [
      {
        'userId': 42,
        'userName': 'Sophie Martin',
        'role': 'student',
      },
    ];

    await tester.pumpWidget(
      MaterialApp(
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

  testWidgets('MeetingShareSheet displays meeting ID and full invitation', (WidgetTester tester) async {
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
          home: Scaffold(
            body: MeetingShareSheet(
              meeting: meeting,
            ),
          ),
        ),
      ),
    );

    expect(find.text('Détails d\'invitation'), findsOneWidget);
    expect(find.text('Atelier Conversation B2'), findsOneWidget);
    expect(find.text('abc-defg-hij'), findsOneWidget);
    expect(find.text('Copier l\'invitation complète'), findsOneWidget);
  });
}
