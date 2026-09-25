import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_nav.dart';
import 'user_detail_panel.dart';
import 'user_editor_panel.dart';
import 'user_model.dart';

/// Every account of the school: search, filter by role and status, open a
/// profile, add, edit, reset, disable or delete.
class UsersScreen extends ConsumerStatefulWidget {
  const UsersScreen({super.key});

  @override
  ConsumerState<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends ConsumerState<UsersScreen> {
  List<AdminUser> _users = [];
  bool _loading = true;
  String? _error;
  String _search = '';
  String _role = 'all';
  String _status = 'all';
  int _limit = 40;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _users.isEmpty;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/users');
      if (!mounted) return;
      setState(() {
        _users = J.list(res.data, ['users']).map(AdminUser.fromJson).toList();
        _loading = false;
      });
      _takeIntent();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  List<AdminUser> get _filtered {
    final q = _search.trim().toLowerCase();
    return _users.where((u) {
      if (_role != 'all' && u.role != _role) return false;
      switch (_status) {
        case 'active':
          if (!u.isActive) return false;
        case 'disabled':
          if (u.isActive) return false;
        case 'attention':
          if (!u.needsAttention) return false;
        case 'new':
          if (!u.isNew) return false;
      }
      if (q.isEmpty) return true;
      return '${u.fullName} ${u.email} ${u.username}'.toLowerCase().contains(q);
    }).toList();
  }

  Future<void> _openUser(AdminUser u) async {
    await showAdminPanel(context, builder: (_) => UserDetailPanel(user: u, onChanged: _load));
  }

  /// Opens the form when the dashboard asked for it, once the list is
  /// ready (the screen may be opened for the first time by that request).
  void _takeIntent() {
    if (_loading || ref.read(adminIntentProvider) != AdminIntent.newUser) return;
    ref.read(adminIntentProvider.notifier).state = null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _create();
    });
  }

  Future<void> _create() async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => const UserEditorPanel());
    if (saved == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    // "Add user" on the dashboard opens the form here.
    ref.listen<AdminIntent?>(adminIntentProvider, (_, next) {
      if (next == AdminIntent.newUser) _takeIntent();
    });
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _users.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final list = _filtered;
    int count(String role) => _users.where((u) => u.role == role).length;
    final roles = [
      FilterOption('all', fr ? 'Tous' : 'All', count: _users.length),
      for (final r in AdminUser.roles) FilterOption(r, AdminUser.rolePlural(r, fr), count: count(r)),
    ];
    final statuses = [
      FilterOption('all', fr ? 'Tous les statuts' : 'Any status'),
      FilterOption('active', fr ? 'Actifs' : 'Active', count: _users.where((u) => u.isActive).length),
      FilterOption('disabled', fr ? 'Désactivés' : 'Disabled', count: _users.where((u) => !u.isActive).length),
      FilterOption('attention', fr ? 'À surveiller' : 'Needs attention', count: _users.where((u) => u.needsAttention).length),
      FilterOption('new', fr ? 'Nouveaux (30 j)' : 'New (30 days)', count: _users.where((u) => u.isNew).length),
    ];

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: AdminSearchField(
                  hint: fr ? 'Nom, e-mail ou identifiant' : 'Name, email or username',
                  onChanged: (v) => setState(() {
                    _search = v;
                    _limit = 40;
                  }),
                ),
              ),
              const SizedBox(width: 10),
              AdminButton(fr ? 'Ajouter' : 'Add', icon: Icons.person_add_alt_1, onPressed: _create),
            ],
          ),
          const SizedBox(height: 10),
          AdminFilterChips<String>(options: roles, selected: _role, onSelected: (v) => setState(() => _role = v)),
          const SizedBox(height: 6),
          AdminFilterChips<String>(options: statuses, selected: _status, onSelected: (v) => setState(() => _status = v)),
        ],
      ),
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Text(
            list.length == _users.length
                ? (fr ? '${_users.length} comptes' : '${_users.length} users')
                : (fr ? '${list.length} sur ${_users.length} comptes' : '${list.length} of ${_users.length} users'),
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
          ),
        ),
        if (list.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.person_search_outlined,
              title: _users.isEmpty
                  ? (fr ? 'Aucun compte pour le moment' : 'No users yet')
                  : (fr ? 'Aucun compte ne correspond' : 'No users match these filters'),
              message: _users.isEmpty
                  ? (fr ? 'Ajoutez un premier professeur ou étudiant.' : 'Add your first teacher or student.')
                  : (fr ? 'Essayez une autre recherche ou retirez les filtres.' : 'Try another search or clear the filters.'),
            ),
          )
        else
          LayoutBuilder(
            builder: (context, c) => c.maxWidth >= 720
                ? _UserTable(users: list.take(_limit).toList(), onOpen: _openUser)
                : Column(children: [for (final u in list.take(_limit)) _UserCard(user: u, onTap: () => _openUser(u))]),
          ),
        if (list.length > _limit)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Center(
              child: AdminButton(
                fr ? 'Afficher plus' : 'Show more',
                primary: false,
                onPressed: () => setState(() => _limit += 40),
              ),
            ),
          ),
      ],
    );
  }
}

class _UserCard extends StatelessWidget {
  final AdminUser user;
  final VoidCallback onTap;
  const _UserCard({required this.user, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
            child: Row(
              children: [
                InitialsAvatar(user.fullName, color: user.roleColor),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.fullName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 2),
                      Text(user.email, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          Pill(AdminUser.roleLabel(user.role, fr), color: user.roleColor),
                          _StatusPill(user: user),
                        ],
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.textSubtle),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final AdminUser user;
  const _StatusPill({required this.user});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Wrap(
      spacing: 6,
      children: [
        Pill(
          user.isActive ? (fr ? 'Actif' : 'Active') : (fr ? 'Désactivé' : 'Disabled'),
          color: user.isActive ? AppColors.good : AppColors.textMuted,
          icon: Icons.circle,
        ),
        if (user.failedLogins > 0)
          Pill('${user.failedLogins}', color: user.needsAttention ? AppColors.bad : AppColors.warn, icon: Icons.warning_amber_rounded),
      ],
    );
  }
}

/// Denser rows for tablets, like the web table.
class _UserTable extends StatelessWidget {
  final List<AdminUser> users;
  final ValueChanged<AdminUser> onOpen;
  const _UserTable({required this.users, required this.onOpen});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final head = AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w800, letterSpacing: 0.4);
    return AdminCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: AppColors.surfaceSoft,
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                Expanded(flex: 5, child: Text(fr ? 'UTILISATEUR' : 'USER', style: head)),
                Expanded(flex: 2, child: Text(fr ? 'RÔLE' : 'ROLE', style: head)),
                Expanded(flex: 3, child: Text(fr ? 'STATUT' : 'STATUS', style: head)),
                Expanded(flex: 2, child: Text(fr ? 'INSCRIT' : 'JOINED', style: head)),
                const SizedBox(width: 24),
              ],
            ),
          ),
          for (final u in users) ...[
            const Divider(height: 1, color: AppColors.borderSoft),
            InkWell(
              onTap: () => onOpen(u),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      flex: 5,
                      child: Row(
                        children: [
                          InitialsAvatar(u.fullName, size: 34, color: u.roleColor),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(u.fullName, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                                Text(u.email, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(flex: 2, child: Align(alignment: Alignment.centerLeft, child: Pill(AdminUser.roleLabel(u.role, fr), color: u.roleColor))),
                    Expanded(flex: 3, child: Align(alignment: Alignment.centerLeft, child: _StatusPill(user: u))),
                    Expanded(
                      flex: 2,
                      child: Text(AdminFmt.day(context, u.createdAt), style: AppTypography.caption.copyWith(color: AppColors.text)),
                    ),
                    const Icon(Icons.chevron_right, size: 20, color: AppColors.textSubtle),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
