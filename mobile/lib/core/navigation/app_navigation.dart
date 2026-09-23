import 'package:flutter/material.dart';

/// Lets sign-in and sign-out change screens from anywhere, e.g. when the
/// server ends the session while a deep screen is open.
final appNavigatorKey = GlobalKey<NavigatorState>();

/// Shows messages that must outlive the screen that caused them.
final appMessengerKey = GlobalKey<ScaffoldMessengerState>();

/// Builds the sign-in gate; set by `main.dart`.
WidgetBuilder? authGateBuilder;

/// Replaces everything with the gate, which then shows the right screen.
void showAuthGate() {
  final builder = authGateBuilder;
  if (builder == null) return;
  appNavigatorKey.currentState?.pushAndRemoveUntil(
    MaterialPageRoute(builder: builder),
    (route) => false,
  );
}
