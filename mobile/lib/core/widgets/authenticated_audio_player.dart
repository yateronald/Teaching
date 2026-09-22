import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_client.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import 'audio_preview_player.dart';

/// Plays a protected API audio endpoint by securely caching via authenticated Dio.
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
  String? _localPath;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAudio();
  }

  @override
  void didUpdateWidget(covariant AuthenticatedAudioPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.endpoint != widget.endpoint) {
      _loadAudio();
    }
  }

  Future<void> _loadAudio() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
      _localPath = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final token = await client.tokenStorage.getToken();
      final endpoint = widget.endpoint.startsWith('/')
          ? widget.endpoint
          : '/${widget.endpoint}';

      final safeKey = endpoint.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      final tempDir = Directory.systemTemp;
      final targetFile = File('${tempDir.path}/quiz_audio_$safeKey.wav');

      if (!await targetFile.exists() || (await targetFile.length()) == 0) {
        final res = await client.dio.get<List<int>>(
          endpoint,
          options: Options(
            responseType: ResponseType.bytes,
            headers: token != null && token.isNotEmpty
                ? {'Authorization': 'Bearer $token'}
                : null,
          ),
          queryParameters:
              token != null && token.isNotEmpty ? {'token': token} : null,
        );

        if (res.data != null && res.data!.isNotEmpty) {
          await targetFile.writeAsBytes(res.data!);
        } else {
          throw Exception('Fichier audio vide ou inaccessible.');
        }
      }

      if (mounted) {
        setState(() {
          _localPath = targetFile.path;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('AuthenticatedAudioPlayer error: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Impossible de charger l\'audio';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surfaceSoft,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border, width: 1.1),
        ),
        child: Row(
          children: [
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.frenchBlue,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Chargement de l\'audio...',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
      );
    }

    if (_error != null || _localPath == null) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.badBg,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.badBorder),
        ),
        child: Row(
          children: [
            const Icon(Icons.error_outline, size: 18, color: AppColors.bad),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _error ?? 'Impossible de charger l\'audio',
                style: AppTypography.caption.copyWith(color: AppColors.bad),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh, size: 18, color: AppColors.bad),
              tooltip: 'Réessayer',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: _loadAudio,
            ),
          ],
        ),
      );
    }

    return AudioPreviewPlayer(
      key: ValueKey(_localPath),
      audioPath: _localPath,
      title: widget.title,
    );
  }
}
