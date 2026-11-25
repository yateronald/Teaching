import 'package:intl/intl.dart';
import 'package:timezone/data/latest_10y.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

/// Shared IANA timezone initialization, wall-clock <-> UTC conversion (DST-aware),
/// GMT offset formatting, and multi-zone comparison helpers for mobile scheduling.
class ScheduleTz {
  ScheduleTz._();

  static bool _initialized = false;

  static const List<String> popularZones = [
    'UTC',
    'Africa/Abidjan',
    'Africa/Algiers',
    'Africa/Cairo',
    'Africa/Casablanca',
    'Africa/Dakar',
    'Africa/Douala',
    'Africa/Johannesburg',
    'Africa/Kinshasa',
    'Africa/Lagos',
    'Africa/Nairobi',
    'Africa/Tunis',
    'America/Chicago',
    'America/Denver',
    'America/Halifax',
    'America/Los_Angeles',
    'America/Mexico_City',
    'America/Montreal',
    'America/New_York',
    'America/Sao_Paulo',
    'America/Toronto',
    'America/Vancouver',
    'Asia/Beirut',
    'Asia/Dubai',
    'Asia/Ho_Chi_Minh',
    'Asia/Kolkata',
    'Asia/Manila',
    'Asia/Riyadh',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/Berlin',
    'Europe/Brussels',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Paris',
    'Europe/Rome',
    'Europe/Zurich',
    'Pacific/Auckland',
  ];

  static void ensureInitialized() {
    if (_initialized) return;
    tzdata.initializeTimeZones();
    _initialized = true;
  }

  static tz.Location? location(String? iana) {
    final trimmed = iana?.trim() ?? '';
    if (trimmed.isEmpty) return null;
    ensureInitialized();
    if (trimmed.toUpperCase() == 'UTC') return tz.UTC;
    try {
      return tz.getLocation(trimmed);
    } catch (_) {
      return null;
    }
  }

  static bool isValid(String? iana) => location(iana) != null;

  static List<String> allZones() {
    ensureInitialized();
    final seen = <String>{};
    final out = <String>[];
    for (final z in popularZones) {
      if (isValid(z) && seen.add(z)) out.add(z);
    }
    final rest = tz.timeZoneDatabase.locations.keys
        .where((k) => !seen.contains(k) && (k == 'UTC' || (k.contains('/') && !k.startsWith('Etc/'))))
        .toList()
      ..sort();
    out.addAll(rest);
    return out;
  }

  static String defaultZone(String? profileTz, {String? fallbackTz}) {
    final cleanProfile = profileTz?.trim() ?? '';
    if (cleanProfile.isNotEmpty && cleanProfile != 'UTC' && isValid(cleanProfile)) {
      return cleanProfile;
    }
    final cleanFallback = fallbackTz?.trim() ?? '';
    if (cleanFallback.isNotEmpty && isValid(cleanFallback)) {
      return cleanFallback;
    }
    final deviceOffset = DateTime.now().timeZoneOffset;
    for (final z in popularZones) {
      if (z == 'UTC') continue;
      final loc = location(z);
      if (loc != null && Duration(milliseconds: tz.TZDateTime.now(loc).timeZoneOffset.inMilliseconds) == deviceOffset) {
        return z;
      }
    }
    return isValid('UTC') && deviceOffset == Duration.zero ? 'Europe/London' : 'UTC';
  }

  static DateTime wallClockToUtc(DateTime wallClock, String iana) {
    final loc = location(iana);
    if (loc == null) return wallClock.toUtc();
    return tz.TZDateTime(loc, wallClock.year, wallClock.month, wallClock.day, wallClock.hour, wallClock.minute).toUtc();
  }

  static DateTime utcToWallClock(DateTime instant, String iana) {
    final loc = location(iana);
    if (loc == null) {
      final local = instant.toLocal();
      return DateTime(local.year, local.month, local.day, local.hour, local.minute);
    }
    final zoned = tz.TZDateTime.from(instant.toUtc(), loc);
    return DateTime(zoned.year, zoned.month, zoned.day, zoned.hour, zoned.minute);
  }

  static DateTime convertWallClock(DateTime wallClock, String fromIana, String toIana) {
    return utcToWallClock(wallClockToUtc(wallClock, fromIana), toIana);
  }

  static String offsetLabel(String iana, [DateTime? at]) {
    final loc = location(iana);
    final ref = at ?? DateTime.now().toUtc();
    final Duration offset = loc != null
        ? tz.TZDateTime.from(ref.toUtc(), loc).timeZoneOffset
        : DateTime.now().timeZoneOffset;
    final totalMin = offset.inMinutes;
    if (totalMin == 0) return 'GMT+0';
    final sign = totalMin > 0 ? '+' : '-';
    final absMin = totalMin.abs();
    final h = absMin ~/ 60;
    final m = absMin % 60;
    return m == 0 ? 'GMT$sign$h' : 'GMT$sign$h:${m.toString().padLeft(2, '0')}';
  }

  static String displayName(String iana) => iana.replaceAll('_', ' ');

  static String cityLabel(String iana) {
    final clean = iana.replaceAll('_', ' ');
    final idx = clean.indexOf('/');
    if (idx < 0) return clean;
    final region = clean.substring(0, idx);
    final city = clean.substring(idx + 1).replaceAll('/', ', ');
    return '$city ($region)';
  }

  static String formatWallClock(DateTime wallClock, String iana, {bool fr = false}) {
    final datePart = _safeDatePart(wallClock, fr: fr);
    final timePart = _safeTimePart(wallClock, fr: fr);
    final offset = offsetLabel(iana, wallClockToUtc(wallClock, iana));
    return '$datePart · $timePart ($offset)';
  }

  static String formatInstantInZone(DateTime utcInstant, String iana, {bool fr = false}) {
    final wall = utcToWallClock(utcInstant, iana);
    return formatWallClock(wall, iana, fr: fr);
  }

  static String _safeDatePart(DateTime d, {required bool fr}) {
    try {
      return DateFormat(fr ? 'EEE d MMM' : 'EEE, MMM d', fr ? 'fr_FR' : 'en_US').format(d);
    } catch (_) {
      const wdEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const wdFr = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
      const moEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const moFr = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      final wd = (fr ? wdFr : wdEn)[(d.weekday - 1) % 7];
      final mo = (fr ? moFr : moEn)[(d.month - 1) % 12];
      return fr ? '$wd ${d.day} $mo' : '$wd, $mo ${d.day}';
    }
  }

  static String _safeTimePart(DateTime d, {required bool fr}) {
    if (fr) {
      return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    }
    final h12 = d.hour % 12 == 0 ? 12 : d.hour % 12;
    final ampm = d.hour >= 12 ? 'PM' : 'AM';
    return '$h12:${d.minute.toString().padLeft(2, '0')} $ampm';
  }
}
