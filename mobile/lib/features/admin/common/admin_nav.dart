import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Position of each screen in the admin menu (see AdminShell).
class AdminTab {
  AdminTab._();
  static const dashboard = 0;
  static const users = 1;
  static const companies = 2;
  static const batches = 3;
  static const demoRequests = 4;
  static const timetable = 5;
  static const attendance = 6;
  static const resources = 7;
  static const examPrep = 8;
  static const monitoring = 9;
  static const settings = 10;
  static const profile = 11;
}

/// Something another screen asked to open once its tab is shown, e.g. the
/// dashboard's "New batch" opens the batch editor on the Batches screen.
enum AdminIntent { newUser, newBatch }

final adminIntentProvider = StateProvider<AdminIntent?>((ref) => null);
