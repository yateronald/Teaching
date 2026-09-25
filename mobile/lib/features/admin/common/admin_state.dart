import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import 'admin_kit.dart';

/// New demo requests waiting to be contacted: the number beside "Demo
/// requests" in the admin menu. Refreshed by the admin screens that load
/// the requests, and when the admin space opens.
final newDemoRequestsProvider = StateProvider<int>((ref) => 0);

/// Asks the server for the current count (the statistics come with any page).
Future<void> refreshDemoBadge(WidgetRef ref) async {
  try {
    final res = await ref.read(apiClientProvider).get('/demo-requests', queryParameters: {'limit': 1});
    final stats = J.map(J.map(res.data)['statistics']);
    ref.read(newDemoRequestsProvider.notifier).state = J.i(stats['new_requests']);
  } catch (_) {
    // The badge is a convenience: it keeps its last value when offline.
  }
}
