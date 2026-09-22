import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import 'audio_preview_player.dart';

/// Plays a protected API audio endpoint with the same bearer token as Dio.
class AuthenticatedAudioPlayer extends ConsumerStatefulWidget {
  final String endpoint;
  final String? title;

  const AuthenticatedAudioPlayer({
    super.key,
    required this.endpoint,
    this.title,
  });

  @override
  ConsumerState<AuthenticatedAudioPlayer> createState() =>
      _AuthenticatedAudioPlayerState();
}

class _AuthenticatedAudioPlayerState
    extends ConsumerState<AuthenticatedAudioPlayer> {
  late Future<String?> _tokenFuture;

  @override
  void initState() {
    super.initState();
    _tokenFuture = ref.read(apiClientProvider).tokenStorage.getToken();
  }

  @override
  void didUpdateWidget(covariant AuthenticatedAudioPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.endpoint != widget.endpoint) {
      _tokenFuture = ref.read(apiClientProvider).tokenStorage.getToken();
    }
  }

  @override
  Widget build(BuildContext context) {
    final client = ref.read(apiClientProvider);
    final baseUrl = client.dio.options.baseUrl.replaceFirst(RegExp(r'/$'), '');
    final endpoint = widget.endpoint.startsWith('/')
        ? widget.endpoint
        : '/${widget.endpoint}';

    return FutureBuilder<String?>(
      future: _tokenFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const LinearProgressIndicator(minHeight: 2);
        }
        final token = snapshot.data;
        return AudioPreviewPlayer(
          key: ValueKey('$endpoint:${token?.hashCode ?? 0}'),
          audioUrl: '$baseUrl$endpoint',
          title: widget.title,
          headers: token == null || token.isEmpty
              ? null
              : <String, String>{'Authorization': 'Bearer $token'},
        );
      },
    );
  }
}
