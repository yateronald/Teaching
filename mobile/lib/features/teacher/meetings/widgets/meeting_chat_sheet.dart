import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';

class MeetingChatMessage {
  final String sender;
  final String text;
  final String time;
  final bool isMe;

  MeetingChatMessage({
    required this.sender,
    required this.text,
    required this.time,
    this.isMe = false,
  });
}

class MeetingChatSheet extends StatefulWidget {
  final List<MeetingChatMessage> messages;
  final Function(String text) onSendMessage;

  const MeetingChatSheet({
    super.key,
    required this.messages,
    required this.onSendMessage,
  });

  @override
  State<MeetingChatSheet> createState() => _MeetingChatSheetState();
}

class _MeetingChatSheetState extends State<MeetingChatSheet> {
  final _msgCtrl = TextEditingController();

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    widget.onSendMessage(text);
    _msgCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.chat_bubble_outline, color: AppColors.frenchNavy, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Messages en direct',
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),
          Expanded(
            child: widget.messages.isEmpty
                ? Center(
                    child: Text(
                      'Aucun message pour le moment.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: widget.messages.length,
                    itemBuilder: (context, idx) {
                      final m = widget.messages[idx];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Align(
                          alignment: m.isMe ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            constraints: BoxConstraints(
                              maxWidth: MediaQuery.of(context).size.width * 0.75,
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: m.isMe ? AppColors.frenchNavy : AppColors.surfaceSoft,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: m.isMe ? AppColors.frenchNavy : AppColors.borderSoft,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment:
                                  m.isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      m.sender,
                                      style: AppTypography.caption.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: m.isMe ? AppColors.frenchGold : AppColors.ink,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      m.time,
                                      style: AppTypography.caption.copyWith(
                                        fontSize: 10,
                                        color: m.isMe
                                            ? AppColors.pureWhite.withValues(alpha: 0.6)
                                            : AppColors.textSubtle,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  m.text,
                                  style: AppTypography.bodySmall.copyWith(
                                    color: m.isMe ? AppColors.pureWhite : AppColors.text,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: AppColors.borderSoft)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    decoration: InputDecoration(
                      hintText: 'Envoyer un message à la classe...',
                      hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textSubtle),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.send, color: AppColors.frenchNavy),
                  onPressed: _send,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
