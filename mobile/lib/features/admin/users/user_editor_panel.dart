import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'user_model.dart';

/// Adds an account (a welcome e-mail with a temporary password is sent) or
/// edits one. Pops `true` once saved.
class UserEditorPanel extends ConsumerStatefulWidget {
  final AdminUser? user;
  const UserEditorPanel({super.key, this.user});

  @override
  ConsumerState<UserEditorPanel> createState() => _UserEditorPanelState();
}

class _UserEditorPanelState extends ConsumerState<UserEditorPanel> {
  final _form = GlobalKey<FormState>();
  late final _first = TextEditingController(text: widget.user?.firstName ?? '');
  late final _last = TextEditingController(text: widget.user?.lastName ?? '');
  late final _email = TextEditingController(text: widget.user?.email ?? '');
  late final _username = TextEditingController(text: widget.user?.username ?? '');
  late final _notes = TextEditingController(text: J.s(widget.user?.exam?['admin_notes']));
  late String _role = widget.user?.role ?? 'student';
  late bool _active = widget.user?.isActive ?? true;
  late bool _monitoring = widget.user?.canViewMonitoring ?? false;
  late String _exam = J.s(widget.user?.exam?['target_exam']).isEmpty ? 'tcf_canada' : J.s(widget.user?.exam?['target_exam']);
  late int? _nclc = widget.user?.exam?['target_nclc'] == null ? null : J.i(widget.user?.exam?['target_nclc']);
  late DateTime? _examDate = J.date(widget.user?.exam?['exam_date']);
  bool _usernameTouched = false;
  bool _saving = false;
  String? _error;

  bool get _editing => widget.user != null;
  bool get _ownAccount => _editing && ref.read(authNotifierProvider).user?.id == widget.user!.id;

  @override
  void initState() {
    super.initState();
    _usernameTouched = _editing;
    for (final c in [_first, _last, _email]) {
      c.addListener(_suggest);
    }
  }

  void _suggest() {
    if (_usernameTouched) return;
    final s = AdminUser.suggestUsername(_first.text, _last.text, _email.text);
    if (s != _username.text) _username.text = s;
  }

  @override
  void dispose() {
    for (final c in [_first, _last, _email, _username, _notes]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    if (!(_form.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    final payload = <String, dynamic>{
      'first_name': _first.text.trim(),
      'last_name': _last.text.trim(),
      'email': _email.text.trim(),
      'role': _role,
      'is_active': _active,
    };
    if (!_editing) payload['username'] = _username.text.trim();
    if (_ownAccount) {
      payload.remove('is_active');
      payload.remove('role');
    }
    if (_role == 'admin') payload['can_view_monitoring'] = _monitoring;
    if (_role == 'candidate') {
      payload['target_exam'] = _exam;
      payload['target_nclc'] = _nclc;
      payload['exam_date'] = _examDate == null
          ? null
          : '${_examDate!.year.toString().padLeft(4, '0')}-${_examDate!.month.toString().padLeft(2, '0')}-${_examDate!.day.toString().padLeft(2, '0')}';
      payload['admin_notes'] = _notes.text.trim().isEmpty ? null : _notes.text.trim();
    }
    try {
      final api = ref.read(apiClientProvider);
      if (_editing) {
        await api.put('/users/${widget.user!.id}', data: payload);
      } else {
        await api.post('/users', data: payload);
      }
      if (!mounted) return;
      adminToast(
        context,
        _editing
            ? (fr ? 'Profil mis à jour' : 'Profile updated')
            : _role == 'candidate'
                ? (fr ? "${_first.text.trim()} a été ajouté comme candidat : ouvrez-lui des contenus d'examen" : '${_first.text.trim()} was added as a candidate: open exam content to them')
                : (fr ? '${_first.text.trim()} a été ajouté : un e-mail de bienvenue part avec son mot de passe temporaire' : '${_first.text.trim()} was added: a welcome email with a temporary password is on its way'),
      );
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      var msg = apiErrorText(context, e);
      if (e is ApiException && RegExp('already exists', caseSensitive: false).hasMatch(e.message)) {
        msg = fr ? 'Cet e-mail ou cet identifiant est déjà utilisé.' : 'This email or username is already used by another account.';
      }
      setState(() {
        _error = msg;
        _saving = false;
      });
    }
  }

  Future<void> _pickExamDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _examDate ?? now.add(const Duration(days: 60)),
      firstDate: DateTime(2020),
      lastDate: DateTime(now.year + 5),
    );
    if (picked != null) setState(() => _examDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    String? required(String? v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null;

    return Form(
      key: _form,
      child: AdminPanel(
        title: _editing ? (fr ? 'Modifier le profil' : 'Edit profile') : (fr ? 'Nouvel utilisateur' : 'New user'),
        subtitle: _editing
            ? widget.user!.fullName
            : (fr ? 'Un e-mail de bienvenue avec un mot de passe temporaire est envoyé.' : 'A welcome email with a temporary password is sent.'),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop(false)),
          AdminButton(
            _editing ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Créer le compte' : 'Create account'),
            icon: _editing ? Icons.check : Icons.person_add_alt_1,
            busy: _saving,
            onPressed: _save,
          ),
        ],
        children: [
          PanelSection(fr ? 'Rôle' : 'Role'),
          if (_ownAccount)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                fr ? 'Vous ne pouvez pas changer votre propre rôle.' : 'You cannot change your own role.',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
            ),
          AdminGrid(
            minTileWidth: 150,
            maxColumns: 2,
            spacing: 8,
            children: [
              for (final r in AdminUser.roles)
                _RoleCard(
                  role: r,
                  selected: _role == r,
                  onTap: _ownAccount ? null : () => setState(() => _role = r),
                ),
            ],
          ),
          PanelSection(fr ? 'Identité' : 'Identity'),
          LayoutBuilder(
            builder: (context, c) {
              final first = AdminField(label: fr ? 'Prénom' : 'First name', controller: _first, validator: required);
              final last = AdminField(label: fr ? 'Nom' : 'Last name', controller: _last, validator: required);
              if (c.maxWidth < 380) return Column(children: [first, last]);
              return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: first), const SizedBox(width: 10), Expanded(child: last)]);
            },
          ),
          AdminField(
            label: fr ? 'Adresse e-mail' : 'Email address',
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            validator: (v) => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch((v ?? '').trim()) ? null : (fr ? 'E-mail invalide' : 'Enter a valid email'),
          ),
          Focus(
            onFocusChange: (f) {
              if (f) _usernameTouched = true;
            },
            child: AdminField(
              label: fr ? "Nom d'utilisateur" : 'Username',
              controller: _username,
              enabled: !_editing,
              validator: (v) => (v ?? '').trim().length < 3 ? (fr ? '3 caractères minimum' : 'At least 3 characters') : null,
            ),
          ),
          if (_role == 'candidate') ...[
            PanelSection(fr ? "Objectif d'examen" : 'Exam goal'),
            AdminSelect<String>(
              label: fr ? 'Examen' : 'Exam',
              value: _exam,
              options: [for (final e in AdminUser.examTargets.entries) FilterOption(e.key, e.value)],
              onChanged: (v) => setState(() => _exam = v ?? 'tcf_canada'),
            ),
            AdminSelect<int?>(
              label: fr ? 'Niveau visé' : 'Target level',
              value: _nclc,
              options: [
                FilterOption<int?>(null, fr ? 'Pas encore défini' : 'Not set yet'),
                for (var n = 4; n <= 10; n++) FilterOption<int?>(n, 'NCLC $n'),
              ],
              onChanged: (v) => setState(() => _nclc = v),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: InkWell(
                onTap: _pickExamDate,
                borderRadius: BorderRadius.circular(10),
                child: InputDecorator(
                  decoration: adminInputDecoration(
                    fr ? "Date d'examen" : 'Exam date',
                    suffix: _examDate == null
                        ? const Icon(Icons.event, color: AppColors.textMuted)
                        : IconButton(icon: const Icon(Icons.clear, size: 18), onPressed: () => setState(() => _examDate = null)),
                  ),
                  child: Text(_examDate == null ? (fr ? 'Non définie' : 'Not set') : AdminFmt.day(context, _examDate), style: AppTypography.bodyMedium),
                ),
              ),
            ),
            AdminField(
              label: fr ? 'Note privée (visible des admins seulement)' : 'Private note (admins only)',
              controller: _notes,
              maxLines: 3,
            ),
          ],
          PanelSection(fr ? 'Accès' : 'Access'),
          AdminCard(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            child: Column(
              children: [
                SwitchListTile(
                  value: _active,
                  onChanged: _ownAccount ? null : (v) => setState(() => _active = v),
                  activeThumbColor: AppColors.adminAccent,
                  title: Text(fr ? 'Compte actif' : 'Account active', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                  subtitle: Text(fr ? 'Peut se connecter' : 'Can sign in', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                ),
                if (_role == 'admin')
                  SwitchListTile(
                    value: _monitoring,
                    onChanged: (v) => setState(() => _monitoring = v),
                    activeThumbColor: AppColors.adminAccent,
                    title: Text(fr ? 'Suivi du site web' : 'Website monitoring', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      fr ? "Peut ouvrir l'espace de suivi des visites" : 'Can open the visitor monitoring space',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ),
              ],
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.badBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.badBorder)),
              child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
            ),
          ],
        ],
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String role;
  final bool selected;
  final VoidCallback? onTap;
  const _RoleCard({required this.role, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final color = AdminUser.colorFor(role);
    return Material(
      color: selected ? color.withValues(alpha: 0.08) : AppColors.pureWhite,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: selected ? color : AppColors.border, width: selected ? 1.6 : 1),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(AdminUser.roleIcon(role), color: color, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AdminUser.roleLabel(role, fr), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                    const SizedBox(height: 2),
                    Text(AdminUser.roleHint(role, fr), style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.3)),
                  ],
                ),
              ),
              if (selected) Icon(Icons.check_circle, color: color, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
