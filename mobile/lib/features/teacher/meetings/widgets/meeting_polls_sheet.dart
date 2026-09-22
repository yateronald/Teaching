import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';

class MeetingPollsSheet extends ConsumerStatefulWidget {
  final int meetingId;
  final bool isHost;
  final bool isDark;
  final bool isSheet;
  final bool showHeader;
  final VoidCallback? onClose;

  const MeetingPollsSheet({
    super.key,
    required this.meetingId,
    required this.isHost,
    this.isDark = false,
    this.isSheet = true,
    this.showHeader = true,
    this.onClose,
  });

  @override
  ConsumerState<MeetingPollsSheet> createState() => _MeetingPollsSheetState();
}

class _MeetingPollsSheetState extends ConsumerState<MeetingPollsSheet> {
  static const List<Color> _pollColors = [
    Color(0xFF10B981),
    Color(0xFF6366F1),
    Color(0xFFF59E0B),
    Color(0xFFEF4444),
    Color(0xFFEC4899),
    Color(0xFF14B8A6),
    Color(0xFF8B5CF6),
    Color(0xFFF97316),
  ];

  bool _isLoading = true;
  Timer? _refreshTimer;
  Map<String, dynamic>? _activePoll;
  int? _myVote;
  List<Map<String, dynamic>> _closedPolls = [];

  // Create Poll State
  final _questionCtrl = TextEditingController();
  final List<TextEditingController> _optionCtrls = [
    TextEditingController(),
    TextEditingController(),
  ];
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchPolls();
    _refreshTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted) _fetchPolls(silent: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _questionCtrl.dispose();
    for (final c in _optionCtrls) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _fetchPolls({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/${widget.meetingId}/polls');
      final data = res.data;
      if (data is List && mounted) {
        Map<String, dynamic>? active;
        final List<Map<String, dynamic>> closed = [];
        for (final item in data) {
          if (item is Map<String, dynamic>) {
            if (item['is_active'] == true || item['is_active'] == 1) {
              active ??= item;
            } else {
              closed.add(item);
            }
          }
        }
        setState(() {
          _activePoll = active;
          if (active != null && active['my_vote'] != null) {
            _myVote = (active['my_vote'] as num).toInt();
          }
          _closedPolls = closed;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted && !silent) setState(() => _isLoading = false);
    }
  }

  Future<void> _createPoll() async {
    final q = _questionCtrl.text.trim();
    final opts = _optionCtrls.map((c) => c.text.trim()).where((s) => s.isNotEmpty).toList();
    if (q.isEmpty || opts.length < 2) return;

    setState(() => _isSubmitting = true);
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/${widget.meetingId}/polls', data: {
        'question': q,
        'options': opts,
      });
      _questionCtrl.clear();
      for (final c in _optionCtrls) {
        c.clear();
      }
      while (_optionCtrls.length > 2) {
        _optionCtrls.removeLast().dispose();
      }
      await _fetchPolls();
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _vote(int optionIndex) async {
    if (_activePoll == null) return;
    setState(() => _myVote = optionIndex);
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/polls/${_activePoll!['id']}/vote', data: {
        'option_index': optionIndex,
      });
      _fetchPolls(silent: true);
    } catch (_) {
      _fetchPolls(silent: true);
    }
  }

  Future<void> _closePoll() async {
    if (_activePoll == null) return;
    setState(() => _isSubmitting = true);
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/polls/${_activePoll!['id']}/close', data: {
        'show_results': true,
      });
      setState(() {
        _activePoll = null;
        _myVote = null;
      });
      _fetchPolls();
    } catch (_) {
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  List<String> _parseOptions(dynamic raw) {
    if (raw is List) return raw.map((e) => e.toString()).toList();
    return [];
  }

  List<Map<String, dynamic>> _parseVotes(dynamic raw) {
    if (raw is List) return raw.cast<Map<String, dynamic>>();
    return [];
  }

  int _getVoteCount(List<Map<String, dynamic>> votes, int idx) {
    final match = votes.firstWhere(
      (v) => (v['option_index'] as num?)?.toInt() == idx,
      orElse: () => {},
    );
    return (match['count'] as num?)?.toInt() ?? 0;
  }

  int _getTotalVotes(List<Map<String, dynamic>> votes) {
    int sum = 0;
    for (final v in votes) {
      sum += (v['count'] as num?)?.toInt() ?? 0;
    }
    return sum;
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final isDark = widget.isDark;

    final content = Column(
      children: [
        // Drag handle
        if (widget.isSheet) ...[
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 8, bottom: 4),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? const Color(0x3AFFFFFF) : AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Header
        if (widget.showHeader) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.poll_outlined,
                      color: isDark ? const Color(0xFFE7EAEE) : AppColors.frenchNavy,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isFr ? 'Sondages en direct' : 'Live Polls',
                      style: TextStyle(
                        color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(
                    Icons.close,
                    color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
                  ),
                  onPressed: widget.onClose ?? () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Divider(
            height: 1,
            color: isDark ? const Color(0x1FFFFFFF) : AppColors.borderSoft,
          ),
        ],

          // Content
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.frenchNavy))
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Active Poll Section
                        if (_activePoll != null) ...[
                          _buildActivePollCard(isFr),
                          const SizedBox(height: 24),
                        ],

                        // Host Create Poll Form (if host and no active poll)
                        if (widget.isHost && _activePoll == null) ...[
                          _buildCreatePollForm(isFr),
                          const SizedBox(height: 24),
                        ],

                        // Polls History
                        if (_closedPolls.isNotEmpty) ...[
                          Text(
                            isFr ? 'Historique des sondages' : 'Poll History',
                            style: AppTypography.titleSmall.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ..._closedPolls.map((p) => _buildClosedPollCard(p, isFr)),
                        ] else if (_activePoll == null && !widget.isHost) ...[
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 40),
                              child: Column(
                                children: [
                                  Icon(Icons.poll_outlined, size: 48, color: AppColors.textSubtle.withValues(alpha: 0.5)),
                                  const SizedBox(height: 12),
                                  Text(
                                    isFr ? 'Aucun sondage en cours' : 'No active polls',
                                    style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    isFr ? 'L\'enseignant lancera un sondage sous peu' : 'The teacher will launch a poll shortly',
                                    style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
          ),
        ],
      );

    if (widget.isSheet) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF171B22) : AppColors.pureWhite,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: content,
      );
    }
    return Container(
      color: isDark ? const Color(0xFF171B22) : AppColors.pureWhite,
      child: content,
    );
  }

  Widget _buildActivePollCard(bool isFr) {
    final q = _activePoll!['question']?.toString() ?? '';
    final options = _parseOptions(_activePoll!['options']);
    final votes = _parseVotes(_activePoll!['votes']);
    final totalVotes = _getTotalVotes(votes);
    final hasVoted = _myVote != null || widget.isHost;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.frenchBlue.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.good.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.good, shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text(
                      isFr ? 'EN COURS' : 'LIVE',
                      style: const TextStyle(color: AppColors.good, fontSize: 10, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Text(
                '$totalVotes ${isFr ? 'vote' : 'vote'}${totalVotes > 1 ? 's' : ''}',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            q,
            style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
          ),
          const SizedBox(height: 16),

          // Options
          ...List.generate(options.length, (idx) {
            final opt = options[idx];
            final count = _getVoteCount(votes, idx);
            final pct = totalVotes > 0 ? (count / totalVotes) : 0.0;
            final isSelected = _myVote == idx;
            final color = _pollColors[idx % _pollColors.length];

            if (hasVoted) {
              // Results bar
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            if (isSelected) ...[
                              const Icon(Icons.check_circle, size: 14, color: AppColors.frenchNavy),
                              const SizedBox(width: 4),
                            ],
                            Text(
                              opt,
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${(pct * 100).round()}% ($count)',
                          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: color),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: pct,
                        minHeight: 10,
                        backgroundColor: AppColors.borderSoft,
                        valueColor: AlwaysStoppedAnimation<Color>(color),
                      ),
                    ),
                  ],
                ),
              );
            } else {
              // Vote button
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    alignment: Alignment.centerLeft,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => _vote(idx),
                  child: Row(
                    children: [
                      Container(
                        width: 18,
                        height: 18,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          opt,
                          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.ink),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }
          }),

          if (widget.isHost) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.bad,
                  foregroundColor: AppColors.pureWhite,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.stop_circle_outlined, size: 16),
                label: Text(isFr ? 'Clôturer le sondage' : 'Close Poll'),
                onPressed: _isSubmitting ? null : _closePoll,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildCreatePollForm(bool isFr) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.add_circle_outline, color: AppColors.frenchNavy, size: 20),
              const SizedBox(width: 8),
              Text(
                isFr ? 'Créer un sondage' : 'Create a Poll',
                style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Question input
          TextField(
            controller: _questionCtrl,
            decoration: InputDecoration(
              labelText: isFr ? 'Question' : 'Question',
              hintText: isFr ? 'Posez votre question à la classe...' : 'Ask your question to the class...',
              filled: true,
              fillColor: AppColors.pureWhite,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              isDense: true,
            ),
          ),
          const SizedBox(height: 14),

          Text(
            isFr ? 'Options de réponse' : 'Answer Options',
            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMuted),
          ),
          const SizedBox(height: 8),

          // Option inputs
          ...List.generate(_optionCtrls.length, (idx) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _optionCtrls[idx],
                      decoration: InputDecoration(
                        hintText: '${isFr ? 'Option' : 'Option'} ${idx + 1}',
                        filled: true,
                        fillColor: AppColors.pureWhite,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        isDense: true,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ),
                  if (_optionCtrls.length > 2)
                    IconButton(
                      icon: const Icon(Icons.remove_circle_outline, color: AppColors.bad, size: 20),
                      onPressed: () {
                        setState(() {
                          _optionCtrls.removeAt(idx).dispose();
                        });
                      },
                    ),
                ],
              ),
            );
          }),

          // Add Option Button
          if (_optionCtrls.length < 8)
            TextButton.icon(
              icon: const Icon(Icons.add, size: 18),
              label: Text(isFr ? 'Ajouter une option' : 'Add Option'),
              onPressed: () {
                setState(() {
                  _optionCtrls.add(TextEditingController());
                });
              },
            ),

          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.frenchNavy,
                foregroundColor: AppColors.pureWhite,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: const Icon(Icons.rocket_launch, size: 16),
              label: Text(
                _isSubmitting ? (isFr ? 'Lancement...' : 'Launching...') : (isFr ? 'Lancer le sondage' : 'Launch Poll'),
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              onPressed: _isSubmitting ? null : _createPoll,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClosedPollCard(Map<String, dynamic> poll, bool isFr) {
    final q = poll['question']?.toString() ?? '';
    final options = _parseOptions(poll['options']);
    final votes = _parseVotes(poll['votes']);
    final totalVotes = _getTotalVotes(votes);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.textMuted.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isFr ? 'CLÔTURÉ' : 'CLOSED',
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                ),
              ),
              Text(
                '$totalVotes ${isFr ? 'votes' : 'votes'}',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(q, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ...List.generate(options.length, (idx) {
            final opt = options[idx];
            final count = _getVoteCount(votes, idx);
            final pct = totalVotes > 0 ? (count / totalVotes) : 0.0;
            return Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Expanded(child: Text(opt, style: AppTypography.caption.copyWith(fontSize: 11))),
                  Text(
                    '${(pct * 100).round()}%',
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 11),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
