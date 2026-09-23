import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:local_auth/local_auth.dart';
import 'package:mobile/core/auth/app_lock.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/core/widgets/brand_logo.dart';
import 'package:mobile/core/responsive/responsive_layout.dart';
import 'package:mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Stands in for the phone's fingerprint sensor.
class _FakeBiometrics extends LocalAuthentication {
  bool accept = true;
  int prompts = 0;

  @override
  Future<bool> isDeviceSupported() async => true;

  @override
  Future<bool> get canCheckBiometrics async => true;

  @override
  Future<List<BiometricType>> getAvailableBiometrics() async => [BiometricType.fingerprint];

  @override
  Future<bool> authenticate({
    required String localizedReason,
    Iterable<dynamic> authMessages = const [],
    bool biometricOnly = false,
    bool sensitiveTransaction = true,
    bool persistAcrossBackgrounding = false,
  }) async {
    prompts++;
    return accept;
  }
}

void main() {
  testWidgets('Teacher App Smoke Test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    await tester.pumpWidget(
      ProviderScope(
        overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
        child: const LearnFrenchTeacherApp(),
      ),
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

  group('Fingerprint lock', () {
    late SharedPreferences prefs;
    late _FakeBiometrics sensor;
    late AppLockController lock;

    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      prefs = await SharedPreferences.getInstance();
      sensor = _FakeBiometrics();
      lock = AppLockController(prefs: prefs, auth: sensor);
      AppLockController.liveClassActive.value = false;
    });

    tearDown(() => lock.dispose());

    testWidgets('offered once per account, then locks a restored session', (tester) async {
      lock.signedIn('7', restored: false);
      expect(await lock.shouldOffer(), isTrue);
      expect(await lock.enable('confirm'), isTrue);
      expect(lock.isEnabled, isTrue);
      expect(lock.isLocked, isFalse, reason: 'no lock right after typing the password');
      expect(await lock.shouldOffer(), isFalse);

      // Next app launch on the saved session.
      lock.signedIn('7', restored: true);
      expect(lock.isLocked, isTrue);
      sensor.accept = false;
      expect(await lock.unlock('unlock'), isFalse);
      expect(lock.isLocked, isTrue);
      sensor.accept = true;
      expect(await lock.unlock('unlock'), isTrue);
      expect(lock.isLocked, isFalse);

      // Another teacher on the same phone has their own choice.
      lock.signedIn('8', restored: true);
      expect(lock.isEnabled, isFalse);
      expect(lock.isLocked, isFalse);
      expect(await lock.shouldOffer(), isTrue);
    });

    testWidgets('relocks after 5 minutes away, never during a class', (tester) async {
      lock.signedIn('7', restored: false);
      await lock.enable('confirm');

      lock.didChangeAppLifecycleState(AppLifecycleState.paused);
      lock.didChangeAppLifecycleState(AppLifecycleState.resumed);
      expect(lock.isLocked, isFalse, reason: 'a short absence does not lock');

      await tester.runAsync(() async {
        lock.didChangeAppLifecycleState(AppLifecycleState.paused);
      });
      // Simulate a long absence by pretending the pause happened earlier.
      AppLockController.liveClassActive.value = true;
      lock.debugBackdateHidden(const Duration(minutes: 6));
      lock.didChangeAppLifecycleState(AppLifecycleState.resumed);
      expect(lock.isLocked, isFalse, reason: 'a running class is never locked');

      AppLockController.liveClassActive.value = false;
      lock.didChangeAppLifecycleState(AppLifecycleState.paused);
      lock.debugBackdateHidden(const Duration(minutes: 6));
      lock.didChangeAppLifecycleState(AppLifecycleState.resumed);
      expect(lock.isLocked, isTrue);
    });
  });

  test('reads the claims of a stored token', () {
    // {"id":7,"app":"mobile","iat":1700000000}
    const token = 'x.eyJpZCI6NywiYXBwIjoibW9iaWxlIiwiaWF0IjoxNzAwMDAwMDAwfQ.y';
    final claims = TokenStorage.claimsOf(token)!;
    expect(claims['app'], 'mobile');
    expect(claims['iat'], 1700000000);
    expect(TokenStorage.claimsOf('not-a-token'), isNull);
  });
}
