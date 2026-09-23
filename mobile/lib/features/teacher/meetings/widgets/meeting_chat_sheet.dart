import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/translations.dart';

class MeetingChatMessage {
  final String id;
  final String sender;
  final String text;
  final String time;
  final bool isMe;

  MeetingChatMessage({
    String? id,
    required this.sender,
    required this.text,
    required this.time,
    this.isMe = false,
  }) : id = id ?? '${sender}_${DateTime.now().millisecondsSinceEpoch}';
}

/// Standalone chat view usable in both docked side panel (tablet) and bottom sheet (mobile).
class MeetingChatView extends StatefulWidget {
  final int meetingId;
  final List<MeetingChatMessage> messages;
  final Function(MeetingChatMessage msg) onNewMessage;
  final Future<bool> Function(String text)? onSendMessage;
  final io.Socket? socket;
  final bool isSocketConnected;
  final String myName;
  final String myIdentity;
  final bool isDark;
  final VoidCallback? onClose;
  final bool showHeader;

  const MeetingChatView({
    super.key,
    required this.meetingId,
    required this.messages,
    required this.onNewMessage,
    this.onSendMessage,
    this.socket,
    this.isSocketConnected = true,
    this.myName = 'Vous',
    this.myIdentity = '',
    this.isDark = true,
    this.onClose,
    this.showHeader = true,
  });

  @override
  State<MeetingChatView> createState() => _MeetingChatViewState();
}

class _MeetingChatViewState extends State<MeetingChatView> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  @override
  void didUpdateWidget(covariant MeetingChatView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.messages.length > oldWidget.messages.length) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    }
    if (widget.socket != oldWidget.socket ||
        widget.isSocketConnected != oldWidget.isSocketConnected) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _send() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);

    var sent = false;
    try {
      if (widget.onSendMessage != null) {
        sent = await widget.onSendMessage!(text);
      }
    } catch (e) {
      debugPrint('[MeetingChat] Send failed: $e');
    }

    if (!mounted) return;
    setState(() => _isSending = false);
    if (!sent) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              context.isFrench
                  ? 'Message non envoyé. Reconnexion en cours — réessayez.'
                  : 'Message not sent. Reconnecting — please try again.',
            ),
            behavior: SnackBarBehavior.floating,
          ),
        );
      return;
    }

    // Add local message immediately for responsive feel
    final now = TimeOfDay.now();
    final timeStr =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    widget.onNewMessage(
      MeetingChatMessage(
        sender: widget.myName,
        text: text,
        time: timeStr,
        isMe: true,
      ),
    );

    _msgCtrl.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final isDark = widget.isDark;
    final isConnected = widget.isSocketConnected;

    final bgColor = isDark ? const Color(0xFF171B22) : AppColors.pureWhite;
    final borderColor = isDark ? const Color(0x1FFFFFFF) : AppColors.borderSoft;

    return Container(
      color: bgColor,
      child: Column(
        children: [
          // Header (if enabled)
          if (widget.showHeader) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.chat_bubble_outline,
                        color: isDark
                            ? const Color(0xFFE7EAEE)
                            : AppColors.frenchNavy,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isFr ? 'Messages en direct' : 'Live Chat',
                        style: TextStyle(
                          color: isDark
                              ? const Color(0xFFE7EAEE)
                              : AppColors.ink,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      // Status indicator
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: isConnected
                              ? const Color(0xFF10B981).withValues(alpha: 0.16)
                              : const Color(0xFFF59E0B).withValues(alpha: 0.16),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: isConnected
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isConnected
                                  ? (isFr ? 'En direct' : 'Live')
                                  : (isFr ? 'Hors ligne' : 'Offline'),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: isConnected
                                    ? const Color(0xFF10B981)
                                    : const Color(0xFFF59E0B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (widget.onClose != null) ...[
                        const SizedBox(width: 6),
                        IconButton(
                          icon: Icon(
                            Icons.close,
                            color: isDark
                                ? const Color(0xFF9AA4B1)
                                : AppColors.textMuted,
                            size: 20,
                          ),
                          onPressed: widget.onClose,
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Divider(height: 1, color: borderColor),
          ],

          // Messages List
          Expanded(
            child: widget.messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 44,
                          color: isDark
                              ? const Color(0xFF6B7482).withValues(alpha: 0.5)
                              : AppColors.textSubtle.withValues(alpha: 0.4),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          isFr
                              ? 'Aucun message pour le moment'
                              : 'No messages yet',
                          style: TextStyle(
                            color: isDark
                                ? const Color(0xFF9AA4B1)
                                : AppColors.textMuted,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          isFr
                              ? 'Envoyez un message à tous'
                              : 'Send a message to everyone',
                          style: TextStyle(
                            color: isDark
                                ? const Color(0xFF6B7482)
                                : AppColors.textSubtle,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    itemCount: widget.messages.length,
                    itemBuilder: (context, idx) {
                      final m = widget.messages[idx];
                      return _buildMessage(m, isDark);
                    },
                  ),
          ),

          // Input field
          Container(
            padding: EdgeInsets.only(
              left: 12,
              right: 12,
              top: 10,
              bottom: 10 + MediaQuery.of(context).viewInsets.bottom,
            ),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: borderColor)),
              color: isDark ? const Color(0xFF171B22) : AppColors.pureWhite,
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    textInputAction: TextInputAction.send,
                    style: TextStyle(
                      color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                      fontSize: 13,
                    ),
                    decoration: InputDecoration(
                      hintText: isFr
                          ? 'Envoyer un message à tous...'
                          : 'Send a message to everyone...',
                      hintStyle: TextStyle(
                        color: isDark
                            ? const Color(0xFF6B7482)
                            : AppColors.textSubtle,
                        fontSize: 12.5,
                      ),
                      filled: true,
                      fillColor: isDark
                          ? const Color(0xFF1F242D)
                          : const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(
                          color: isDark
                              ? const Color(0x2AFFFFFF)
                              : AppColors.border,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(
                          color: isDark
                              ? const Color(0x2AFFFFFF)
                              : AppColors.border,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(
                          color: Color(0xFF10B981),
                          width: 1.5,
                        ),
                      ),
                      isDense: true,
                    ),
                    enabled: !_isSending,
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: _isSending ? null : _send,
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: const BoxDecoration(
                      color: Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                    child: _isSending
                        ? const Padding(
                            padding: EdgeInsets.all(10),
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.pureWhite,
                            ),
                          )
                        : const Icon(
                            Icons.send,
                            color: AppColors.pureWhite,
                            size: 17,
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessage(MeetingChatMessage m, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Align(
        alignment: m.isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.75,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: m.isMe
                ? (isDark ? const Color(0xFF065F46) : AppColors.frenchNavy)
                : (isDark ? const Color(0xFF1F242D) : AppColors.surfaceSoft),
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(14),
              topRight: const Radius.circular(14),
              bottomLeft: Radius.circular(m.isMe ? 14 : 4),
              bottomRight: Radius.circular(m.isMe ? 4 : 14),
            ),
            border: (!m.isMe && !isDark)
                ? Border.all(color: AppColors.borderSoft)
                : null,
          ),
          child: Column(
            crossAxisAlignment: m.isMe
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    m.sender,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: m.isMe
                          ? const Color(0xFF6EE7B7)
                          : (isDark ? const Color(0xFFE7EAEE) : AppColors.ink),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    m.time,
                    style: TextStyle(
                      fontSize: 9.5,
                      color: m.isMe
                          ? Colors.white.withValues(alpha: 0.7)
                          : (isDark
                                ? const Color(0xFF6B7482)
                                : AppColors.textSubtle),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                m.text,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.35,
                  color: m.isMe
                      ? const Color(0xFFECFDF5)
                      : (isDark ? const Color(0xFFE7EAEE) : AppColors.text),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Bottom sheet wrapper for mobile phones
class MeetingChatSheet extends StatelessWidget {
  final int meetingId;
  final ValueListenable<List<MeetingChatMessage>> messagesListenable;
  final ValueListenable<bool> connectionListenable;
  final Function(MeetingChatMessage msg) onNewMessage;
  final Future<bool> Function(String text)? onSendMessage;
  final io.Socket? socket;
  final String myName;
  final String myIdentity;

  const MeetingChatSheet({
    super.key,
    required this.meetingId,
    required this.messagesListenable,
    required this.connectionListenable,
    required this.onNewMessage,
    this.onSendMessage,
    this.socket,
    this.myName = 'Vous',
    this.myIdentity = '',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      clipBehavior: Clip.antiAlias,
      decoration: const BoxDecoration(
        color: Color(0xFF171B22),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 4),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0x3AFFFFFF),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          Expanded(
            child: ValueListenableBuilder<List<MeetingChatMessage>>(
              valueListenable: messagesListenable,
              builder: (context, currentMessages, _) =>
                  ValueListenableBuilder<bool>(
                    valueListenable: connectionListenable,
                    builder: (context, connected, _) => MeetingChatView(
                      meetingId: meetingId,
                      messages: currentMessages,
                      onNewMessage: onNewMessage,
                      onSendMessage: onSendMessage,
                      socket: socket,
                      isSocketConnected: connected,
                      myName: myName,
                      myIdentity: myIdentity,
                      isDark: true,
                      onClose: () => Navigator.pop(context),
                      showHeader: true,
                    ),
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
