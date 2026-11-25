import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Position of each screen in the admin menu (see AdminShell).
class AdminTab {
  AdminTab._();
  static const dashboard = 0;
  static const users = 1;
  static const companies = 2;
  static const onlineCourses = 3;
  static const batches = 4;
  static const demoRequests = 5;
  static const meetings = 6;
  static const calendar = 7;
  static const marketing = 8;
  static const emails = 9;
  static const timetable = 10;
  static const attendance = 11;
  static const resources = 12;
  static const examPrep = 13;
  static const monitoring = 14;
  static const aiEngine = 15;
  static const settings = 16;
  static const profile = 17;
}

/// Something another screen asked to open once its tab is shown, e.g. the
/// dashboard's "New batch" opens the batch editor on the Batches screen.
enum AdminIntent { newUser, newBatch }

final adminIntentProvider = StateProvider<AdminIntent?>((ref) => null);
