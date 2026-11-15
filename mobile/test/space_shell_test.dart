import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/core/navigation/space_shell.dart';
import 'package:mobile/core/widgets/tricolore_bar.dart';

/// No saved session, without touching the phone's secure storage.
class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
  @override
  Future<String?> getUserJson() async => null;
  @override
  Future<void> clearSession() async {}
}

/// A space with two pages, on a device whose status bar (top) and gesture bar
/// (bottom) are drawn over the window, as Android 15 does for every app.
Future<void> _shell(WidgetTester tester, Size size) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  tester.view.padding = const FakeViewPadding(top: 36, bottom: 24);
  tester.view.viewPadding = const FakeViewPadding(top: 36, bottom: 24);
  addTearDown(tester.view.reset);
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWithValue(ApiClient(customBaseUrl: 'http://test.invalid/api')),
        tokenStorageProvider.overrideWithValue(_NoSession()),
      ],
      child: MaterialApp(
        home: SpaceShell(
          spaceLabel: (_) => 'Admin console',
          accent: Colors.blue,
          accentBg: Colors.white,
          sections: [SpaceSection('main', (_) => 'MAIN')],
          items: [
            SpaceNavItem(section: 'main', icon: Icons.campaign_outlined, label: (_) => 'Marketing'),
            SpaceNavItem(section: 'main', icon: Icons.person, label: (_) => 'Me'),
          ],
          profileIndex: 1,
          fallbackName: (_) => 'Admin',
          pages: (_) => [
            ListView(children: [for (var i = 0; i < 60; i++) ListTile(title: Text('Row $i'))]),
            const Center(child: Text('Profile')),
          ],
        ),
      ),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('on a tablet, the menu and the top bar start below the status bar', (tester) async {
    await _shell(tester, const Size(1600, 1000));
    // The tricolour line is the first thing of the content column, the logo the first of the menu.
    expect(tester.getTopLeft(find.byType(TricoloreBar)).dy, greaterThanOrEqualTo(36), reason: 'nothing under the clock and the battery');
    expect(tester.getTopLeft(find.text('Marketing').first).dy, greaterThan(36));
    // The pages end above the gesture bar.
    expect(tester.getBottomLeft(find.byType(IndexedStack)).dy, lessThanOrEqualTo(1000 - 24));
    expect(tester.takeException(), isNull);
  });

  testWidgets('on a phone, the app bar clears the status bar and the pages clear the gesture bar', (tester) async {
    await _shell(tester, const Size(400, 860));
    expect(tester.getTopLeft(find.byType(AppBar)).dy, 0);
    expect(tester.getTopLeft(find.byType(TricoloreBar)).dy, greaterThan(36), reason: 'the app bar grows by the status bar');
    expect(tester.getBottomLeft(find.byType(IndexedStack)).dy, lessThanOrEqualTo(860 - 24));
    expect(tester.takeException(), isNull);
  });
}
