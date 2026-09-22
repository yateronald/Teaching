import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';

class AudioPreviewPlayer extends StatefulWidget {
  final String? audioUrl;
  final String? audioPath;
  final String? title;
  final Map<String, String>? headers;

  const AudioPreviewPlayer({
    super.key,
    this.audioUrl,
    this.audioPath,
    this.title,
    this.headers,
  }) : assert(
         audioUrl != null || audioPath != null,
         'Either audioUrl or audioPath must be provided',
       );

  @override
  State<AudioPreviewPlayer> createState() => _AudioPreviewPlayerState();
}

class _AudioPreviewPlayerState extends State<AudioPreviewPlayer> {
  late AudioPlayer _player;
  bool _isInit = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _initAudio();
  }

  Future<void> _initAudio() async {
    try {
      if (widget.audioUrl != null && widget.audioUrl!.isNotEmpty) {
        await _player.setUrl(widget.audioUrl!, headers: widget.headers);
      } else if (widget.audioPath != null && widget.audioPath!.isNotEmpty) {
        await _player.setFilePath(widget.audioPath!);
      }
      if (mounted) {
        setState(() => _isInit = true);
      }
    } catch (e, st) {
      debugPrint('AudioPreviewPlayer error loading audio: $e\n$st');
      if (mounted) {
        setState(() => _error = 'Unable to load audio');
      }
    }
  }

  @override
  void didUpdateWidget(covariant AudioPreviewPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.audioUrl != widget.audioUrl ||
        oldWidget.audioPath != widget.audioPath ||
        oldWidget.headers != widget.headers) {
      _player.stop();
      _initAudio();
    }
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
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
            Text(
              _error!,
              style: AppTypography.caption.copyWith(color: AppColors.bad),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (widget.title != null) ...[
            Row(
              children: [
                const Icon(Icons.mic, size: 16, color: AppColors.frenchBlue),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    widget.title!,
                    style: AppTypography.label.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.ink,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          StreamBuilder<PlayerState>(
            stream: _player.playerStateStream,
            builder: (context, snapshot) {
              final playerState = snapshot.data;
              final processingState = playerState?.processingState;
              final playing = playerState?.playing ?? false;

              final isLoading =
                  processingState == ProcessingState.loading ||
                  processingState == ProcessingState.buffering;

              return Row(
                children: [
                  IconButton(
                    iconSize: 32,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 36,
                      minHeight: 36,
                    ),
                    icon: isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(strokeWidth: 2.2),
                          )
                        : Icon(
                            playing
                                ? Icons.pause_circle_filled
                                : Icons.play_circle_fill,
                            color: AppColors.frenchNavy,
                          ),
                    onPressed: _isInit
                        ? () {
                            if (playing) {
                              _player.pause();
                            } else {
                              if (processingState ==
                                  ProcessingState.completed) {
                                _player.seek(Duration.zero);
                              }
                              _player.play();
                            }
                          }
                        : null,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: StreamBuilder<Duration>(
                      stream: _player.positionStream,
                      builder: (context, posSnap) {
                        final position = posSnap.data ?? Duration.zero;
                        final duration = _player.duration ?? Duration.zero;
                        final maxVal = duration.inMilliseconds.toDouble();
                        final curVal = position.inMilliseconds.toDouble().clamp(
                          0.0,
                          maxVal > 0 ? maxVal : 0.0,
                        );

                        return Column(
                          children: [
                            SliderTheme(
                              data: SliderTheme.of(context).copyWith(
                                trackHeight: 4,
                                thumbShape: const RoundSliderThumbShape(
                                  enabledThumbRadius: 6,
                                ),
                                activeTrackColor: AppColors.frenchNavy,
                                inactiveTrackColor: AppColors.border,
                                thumbColor: AppColors.frenchNavy,
                                overlayShape: const RoundSliderOverlayShape(
                                  overlayRadius: 12,
                                ),
                              ),
                              child: Slider(
                                value: curVal,
                                max: maxVal > 0 ? maxVal : 1.0,
                                onChanged: (val) {
                                  _player.seek(
                                    Duration(milliseconds: val.toInt()),
                                  );
                                },
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _formatDuration(position),
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                  Text(
                                    _formatDuration(duration),
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
