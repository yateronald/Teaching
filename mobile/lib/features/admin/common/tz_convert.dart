import 'package:timezone/data/latest_10y.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

/// Time zone maths for recurring classes: a batch stores its slots in its own
/// time zone, and the admin sees them in theirs (as on the web).
class TzConvert {
  TzConvert._();

  static bool _ready = false;

  static tz.Location? location(String? name) {
    if (name == null || name.isEmpty) return null;
    if (!_ready) {
      tzdata.initializeTimeZones();
      _ready = true;
    }
    try {
      return tz.getLocation(name);
    } catch (_) {
      return null;
    }
  }

  /// A weekly slot (weekday 0 = Sunday, minutes from midnight in [from]) as
  /// it falls this week in [to]: its weekday and minutes there.
  static (int day, int minutes) slot(int day, int minutes, String? from, String? to) {
    final src = location(from);
    final dst = location(to);
    if (src == null || dst == null || src.name == dst.name) return (day, minutes);
    final now = tz.TZDateTime.now(src);
    final today = now.weekday % 7;
    final at = tz.TZDateTime(src, now.year, now.month, now.day + (day - today), minutes ~/ 60, minutes % 60);
    final there = tz.TZDateTime.from(at, dst);
    return (there.weekday % 7, there.hour * 60 + there.minute);
  }
}
