import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/widgets/brand_logo.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Teacher App Smoke Test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: LearnFrenchTeacherApp(),
      ),
    );

    expect(find.byType(LearnFrenchTeacherApp), findsOneWidget);
  });

  testWidgets('BrandLogo renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: BrandLogo(height: 60),
        ),
      ),
    );

    expect(find.byType(BrandLogo), findsOneWidget);
  });

  testWidgets('BrandMark renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: BrandMark(size: 36),
        ),
      ),
    );

    expect(find.byType(BrandMark), findsOneWidget);
  });
}

