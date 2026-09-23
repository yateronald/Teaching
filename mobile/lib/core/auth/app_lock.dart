import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:local_auth/local_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Loaded in `main()` before the first frame, so the lock can cover the app
/// from its very first picture instead of flashing the content first.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw UnimplementedError('Override in main()'),
);

final appLockProvider = ChangeNotifierProvider<AppLockController>(
  (ref) => AppLockController(
    prefs: ref.watch(sharedPreferencesProvider),
    auth: LocalAuthentication(),
  ),
);

/// "Unlock with fingerprint": the six-month session stays on the phone, and
/// opening the app asks for the owner's fingerprint (or the phone's PIN).
///
/// The choice is per account on this phone, so a colleague signing in on the
/// same device is asked separately.
class AppLockController extends ChangeNotifier with WidgetsBindingObserver {
  AppLockController({required SharedPreferences prefs, required LocalAuthentication auth})
      : _prefs = prefs,
        _auth = auth {
    WidgetsBinding.instance.addObserver(this);
  }

  static const _enabledKey = 'app_lock_enabled_users';
  static const _offeredKey = 'app_lock_offered_users';

  /// Back in the app after this long away: fingerprint again.
  static const relockAfter = Duration(minutes: 5);

  /// True while a live class is open: returning to a class never shows the
  /// lock, even after a long time in another app.
  static final liveClassActive = ValueNotifier<bool>(false);

  final SharedPreferences _prefs;
  final LocalAuthentication _auth;

  String? _userId;
  bool _locked = false;
  bool _authenticating = false;
  DateTime? _hiddenAt;

  bool get isLocked => _locked;
  bool get isEnabled => _userId != null && _users(_enabledKey).contains(_userId);

  List<String> _users(String key) => _prefs.getStringList(key) ?? const [];

  Future<void> _setUser(String key, String userId, bool include) async {
    final users = {..._users(key)};
    include ? users.add(userId) : users.remove(userId);
    await _prefs.setStringList(key, users.toList());
  }

  /// A fingerprint (or face) is enrolled and usable on this phone.
  Future<bool> isAvailable() async {
    if (kIsWeb) return false;
    try {
      if (!await _auth.isDeviceSupported()) return false;
      if (!await _auth.canCheckBiometrics) return false;
      return (await _auth.getAvailableBiometrics()).isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  /// Someone is signed in. [restored] is true when the app opened on a saved
  /// session (then the lock applies), false right after typing the password.
  void signedIn(String userId, {required bool restored}) {
    _userId = userId;
    _hiddenAt = null;
    _locked = restored && isEnabled;
    notifyListeners();
  }

  void signedOut() {
    _userId = null;
    _hiddenAt = null;
    if (_locked) {
      _locked = false;
      notifyListeners();
    }
  }

  /// Shows the system fingerprint prompt. Returns true when it succeeded.
  Future<bool> authenticate(String reason) async {
    if (_authenticating) return false;
    _authenticating = true;
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        // The phone's PIN or pattern also works: a cut finger or wet hands
        // must not lock a teacher out of their class.
        biometricOnly: false,
        persistAcrossBackgrounding: true,
      );
    } catch (e) {
      debugPrint('[AppLock] Authentication failed: $e');
      return false;
    } finally {
      _authenticating = false;
      // The prompt itself may have paused the app; that is not "being away".
      _hiddenAt = null;
    }
  }

  Future<bool> unlock(String reason) async {
    if (!_locked) return true;
    final ok = await authenticate(reason);
    if (ok) {
      _locked = false;
      notifyListeners();
    }
    return ok;
  }

  /// Turns the lock on after confirming the fingerprint once.
  Future<bool> enable(String reason) async {
    final userId = _userId;
    if (userId == null || !await isAvailable()) return false;
    if (!await authenticate(reason)) return false;
    await _setUser(_enabledKey, userId, true);
    await _setUser(_offeredKey, userId, true);
    notifyListeners();
    return true;
  }

  Future<void> disable() async {
    final userId = _userId;
    if (userId == null) return;
    await _setUser(_enabledKey, userId, false);
    notifyListeners();
  }

  /// Whether to propose the lock after this first password sign-in.
  Future<bool> shouldOffer() async {
    final userId = _userId;
    if (userId == null || _users(_offeredKey).contains(userId)) return false;
    return isAvailable();
  }

  Future<void> markOffered() async {
    final userId = _userId;
    if (userId != null) await _setUser(_offeredKey, userId, true);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.hidden:
        if (!_authenticating) _hiddenAt ??= DateTime.now();
      case AppLifecycleState.resumed:
        final hiddenAt = _hiddenAt;
        _hiddenAt = null;
        if (hiddenAt == null || _locked || !isEnabled) return;
        if (liveClassActive.value) return;
        if (DateTime.now().difference(hiddenAt) >= relockAfter) {
          _locked = true;
          notifyListeners();
        }
      case AppLifecycleState.inactive:
      case AppLifecycleState.detached:
        break;
    }
  }

  /// Tests only: pretend the app was hidden [ago].
  @visibleForTesting
  void debugBackdateHidden(Duration ago) => _hiddenAt = DateTime.now().subtract(ago);

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
