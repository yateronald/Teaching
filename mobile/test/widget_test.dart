import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/widgets/brand_logo.dart';
import 'package:mobile/core/responsive/responsive_layout.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('Teacher App Smoke Test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: LearnFrenchTeacherApp()),
    );

    expect(find.byType(LearnFrenchTeacherApp), findsOneWidget);
  });

  testWidgets('BrandLogo renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: BrandLogo(height: 60))),
    );

    expect(find.byType(BrandLogo), findsOneWidget);
  });

  testWidgets('BrandMark renders successfully', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: BrandMark(size: 36))),
    );

    expect(find.byType(BrandMark), findsOneWidget);
  });

  testWidgets('tablet layout uses compact persistent navigation', (
    WidgetTester tester,
  ) async {
    tester.view.physicalSize = const Size(1280, 800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    late bool hasPersistentNavigation;
    late bool expandsByDefault;
    late EdgeInsets pageInsets;

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            hasPersistentNavigation = ResponsiveLayout.hasPersistentNavigation(
              context,
            );
            expandsByDefault = ResponsiveLayout.defaultsToExpandedNavigation(
              context,
            );
            pageInsets = ResponsiveLayout.pageInsets(context);
            return const SizedBox.shrink();
          },
        ),
      ),
    );

    expect(hasPersistentNavigation, isTrue);
    expect(expandsByDefault, isFalse);
    expect(pageInsets.horizontal, 64);
  });

  testWidgets('wide content is centered and capped at a readable width', (
    WidgetTester tester,
  ) async {
    tester.view.physicalSize = const Size(1600, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    const contentKey = Key('adaptive-content-child');
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AdaptiveContent(child: SizedBox(key: contentKey, height: 100)),
        ),
      ),
    );

    expect(tester.getSize(find.byKey(contentKey)).width, 1180);
    expect(tester.getTopLeft(find.byKey(contentKey)).dx, 210);
  });
}
