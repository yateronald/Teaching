import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_endpoints.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/auth/token_storage.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/brand_logo.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/language_switcher_button.dart';
import '../../../auth/models/user_model.dart';
import '../widgets/change_email_dialog.dart';
import '../widgets/change_password_dialog.dart';
import '../widgets/fingerprint_lock_tile.dart';
import '../widgets/signed_in_devices_section.dart';
import '../widgets/timezone_select_dialog.dart';

class ProfileSettingsScreen extends ConsumerStatefulWidget {
  const ProfileSettingsScreen({super.key});

  @override
  ConsumerState<ProfileSettingsScreen> createState() =>
      _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends ConsumerState<ProfileSettingsScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _firstNameFocus = FocusNode();

  String? _selectedTimezone;
  String? _initialFirstName;
  String? _initialLastName;
  String? _initialUsername;
  String? _initialTimezone;

  bool _isSavingProfile = false;
  bool _isUploadingPhoto = false;
  String? _authToken;

  Timer? _clockTimer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadAuthToken();
    _initUserData();
    _startLiveClock();
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _usernameCtrl.dispose();
    _firstNameFocus.dispose();
    super.dispose();
  }

  Future<void> _loadAuthToken() async {
    final token = await TokenStorage().getToken();
    if (mounted) setState(() => _authToken = token);
  }

  void _initUserData() {
    final user = ref.read(authNotifierProvider).user;
    if (user != null) {
      _firstNameCtrl.text = user.firstName;
      _lastNameCtrl.text = user.lastName;
      _usernameCtrl.text = user.username;
      _selectedTimezone = user.timezone ?? 'UTC';

      _initialFirstName = user.firstName;
      _initialLastName = user.lastName;
      _initialUsername = user.username;
      _initialTimezone = _selectedTimezone;
    }
    // Also fetch fresh profile from backend
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final fresh = await ref.read(authNotifierProvider.notifier).fetchProfile();
      if (fresh != null && mounted) {
        setState(() {
          _firstNameCtrl.text = fresh.firstName;
          _lastNameCtrl.text = fresh.lastName;
          _usernameCtrl.text = fresh.username;
          _selectedTimezone = fresh.timezone ?? 'UTC';

          _initialFirstName = fresh.firstName;
          _initialLastName = fresh.lastName;
          _initialUsername = fresh.username;
          _initialTimezone = _selectedTimezone;
        });
      }
    });
  }

  void _startLiveClock() {
    _clockTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  bool get _isDirty {
    return _firstNameCtrl.text.trim() != (_initialFirstName ?? '') ||
        _lastNameCtrl.text.trim() != (_initialLastName ?? '') ||
        _usernameCtrl.text.trim() != (_initialUsername ?? '') ||
        _selectedTimezone != (_initialTimezone ?? '');
  }

  void _discardChanges() {
    setState(() {
      _firstNameCtrl.text = _initialFirstName ?? '';
      _lastNameCtrl.text = _initialLastName ?? '';
      _usernameCtrl.text = _initialUsername ?? '';
      _selectedTimezone = _initialTimezone ?? 'UTC';
    });
  }

  Future<void> _saveProfile() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final first = _firstNameCtrl.text.trim();
    final last = _lastNameCtrl.text.trim();
    final user = _usernameCtrl.text.trim();

    if (first.isEmpty || last.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.bad,
          content: Text(
            isFr
                ? 'Veuillez renseigner votre prénom et nom.'
                : 'Please fill in your first and last name.',
          ),
        ),
      );
      return;
    }

    if (user.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.bad,
          content: Text(
            isFr
                ? 'Le nom d\'utilisateur doit contenir au moins 3 caractères.'
                : 'Username must be at least 3 characters.',
          ),
        ),
      );
      return;
    }

    setState(() => _isSavingProfile = true);

    final res = await ref.read(authNotifierProvider.notifier).updateProfile(
          firstName: first,
          lastName: last,
          username: user,
          timezone: _selectedTimezone,
        );

    if (!mounted) return;
    setState(() => _isSavingProfile = false);

    if (res['success'] == true) {
      setState(() {
        _initialFirstName = first;
        _initialLastName = last;
        _initialUsername = user;
        _initialTimezone = _selectedTimezone;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.good,
          content: Text(
            isFr ? 'Profil mis à jour avec succès.' : 'Profile updated successfully.',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.bad,
          content: Text(
            res['error'] ??
                (isFr ? 'Échec de la mise à jour.' : 'Failed to update profile.'),
          ),
        ),
      );
    }
  }

  Future<void> _pickAndUploadPhoto() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        withData: true,
      );

      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;

      if (file.size > 5 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppColors.bad,
              content: Text(
                isFr
                    ? 'L\'image doit faire moins de 5 Mo.'
                    : 'The image must be 5 MB or smaller.',
              ),
            ),
          );
        }
        return;
      }

      setState(() => _isUploadingPhoto = true);

      final res = await ref.read(authNotifierProvider.notifier).uploadProfilePhoto(
            bytes: file.bytes,
            filePath: file.path,
            filename: file.name,
          );

      if (!mounted) return;
      setState(() => _isUploadingPhoto = false);

      if (res['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.good,
            content: Text(
              isFr ? 'Photo de profil mise à jour.' : 'Profile photo updated.',
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.bad,
            content: Text(
              res['error'] ??
                  (isFr ? 'Échec de l\'envoi de la photo.' : 'Failed to upload photo.'),
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUploadingPhoto = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.bad,
            content: Text(isFr ? 'Erreur lors du choix du fichier.' : 'Error selecting file.'),
          ),
        );
      }
    }
  }

  Future<void> _removePhoto() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(isFr ? 'Supprimer la photo ?' : 'Remove profile photo?'),
        content: Text(
          isFr
              ? 'Votre photo de profil sera supprimée.'
              : 'Your profile photo will be removed.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(isFr ? 'Supprimer' : 'Remove'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isUploadingPhoto = true);
    final res = await ref.read(authNotifierProvider.notifier).removeProfilePhoto();
    if (!mounted) return;
    setState(() => _isUploadingPhoto = false);

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.good,
          content: Text(
            isFr ? 'Photo supprimée.' : 'Profile photo removed.',
          ),
        ),
      );
    }
  }

  Future<void> _logout() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(isFr ? 'Déconnexion' : 'Sign Out'),
        content: Text(
          isFr
              ? 'Souhaitez-vous vraiment vous déconnecter de l\'application ?'
              : 'Do you really want to sign out of the application?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: Text(isFr ? 'Se déconnecter' : 'Sign Out'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authNotifierProvider.notifier).logout();
      // The app returns to the sign-in screen on its own (main.dart).
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final user = ref.watch(authNotifierProvider).user;
    final isTablet = MediaQuery.of(context).size.width >= 768;
    final insets = ResponsiveLayout.pageInsets(context);

    if (isTablet) {
      return Stack(
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              insets.left,
              insets.top,
              insets.right,
              _isDirty ? 100 : insets.bottom,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1120),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPageHeader(isFr),
                    const SizedBox(height: 20),
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Left Identity Column: Fixed in place (scrolls internally only if height is very short)
                          SizedBox(
                            width: 320,
                            child: SingleChildScrollView(
                              physics: const ClampingScrollPhysics(),
                              child: _buildIdentityCard(user, isFr),
                            ),
                          ),
                          const SizedBox(width: 20),

                          // Right Main Column: Scrolls independently
                          Expanded(
                            child: SingleChildScrollView(
                              padding: const EdgeInsets.only(bottom: 40),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: _buildRightSections(user, isFr),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_isDirty) _buildFloatingSaveBar(isFr),
        ],
      );
    }

    return Stack(
      children: [
        SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            insets.left,
            insets.top,
            insets.right,
            _isDirty ? 100 : insets.bottom,
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPageHeader(isFr),
                  const SizedBox(height: 24),
                  _buildIdentityCard(user, isFr),
                  const SizedBox(height: 20),
                  ..._buildRightSections(user, isFr),
                ],
              ),
            ),
          ),
        ),
        if (_isDirty) _buildFloatingSaveBar(isFr),
      ],
    );
  }

  Widget _buildPageHeader(bool isFr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isFr ? 'Compte' : 'Account',
          style: AppTypography.caption.copyWith(
            color: const Color(0xFF4F46E5),
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          isFr ? 'Profil & Paramètres' : 'Profile & Settings',
          style: AppTypography.headlineMedium.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.frenchNavy,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          isFr
              ? 'Vos coordonnées, le fuseau horaire de vos cours et vos paramètres de sécurité.'
              : 'Your details, the time zone every schedule is shown in, and how you sign in.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
      ],
    );
  }

  Widget _buildFloatingSaveBar(bool isFr) {
    return Positioned(
      left: 20,
      right: 20,
      bottom: 20,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.25),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFBBF24),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isFr
                        ? 'Vous avez des modifications non enregistrées'
                        : 'You have unsaved changes',
                    style: const TextStyle(
                      color: Color(0xFFE2E8F0),
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFFE2E8F0),
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.25)),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    minimumSize: const Size(0, 36),
                  ),
                  onPressed: _isSavingProfile ? null : _discardChanges,
                  child: Text(isFr ? 'Ignorer' : 'Discard'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    minimumSize: const Size(0, 36),
                  ),
                  onPressed: _isSavingProfile ? null : _saveProfile,
                  child: _isSavingProfile
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : Text(
                          isFr ? 'Enregistrer' : 'Save changes',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  // LEFT COLUMN: IDENTITY CARD
  // ────────────────────────────────────────────────────────────
  Widget _buildIdentityCard(UserModel? user, bool isFr) {
    final photoUrl = user?.profilePhotoUrl ??
        (user != null && (user.profilePhotoKdriveFileId != null || user.hasPhoto)
            ? '${ApiEndpoints.baseUrl}/auth/profile-photo/${user.id}'
            : null);

    final hasPhoto = user?.hasPhoto == true || photoUrl != null;
    final hasNames = _firstNameCtrl.text.trim().isNotEmpty && _lastNameCtrl.text.trim().isNotEmpty;
    final hasTz = _selectedTimezone != null && _selectedTimezone != 'UTC';

    int doneCount = 0;
    if (hasPhoto) doneCount++;
    if (hasNames) doneCount++;
    if (hasTz) doneCount++;
    final completionPct = ((doneCount / 3) * 100).round();

    final timeFmt = DateFormat('h:mm a').format(_now);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Banner Cover Gradient matching webapp
          Container(
            height: 92,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF3730A3), Color(0xFF4F46E5), Color(0xFF818CF8)],
              ),
            ),
          ),

          // Overlapping Avatar with Camera Action
          Transform.translate(
            offset: const Offset(0, -46),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFEEF2FF),
                        border: Border.all(color: Colors.white, width: 4),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0F172A).withValues(alpha: 0.25),
                            blurRadius: 18,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: hasPhoto && photoUrl != null
                          ? CachedNetworkImage(
                              imageUrl: photoUrl,
                              httpHeaders: _authToken != null
                                  ? {'Authorization': 'Bearer $_authToken'}
                                  : {},
                              fit: BoxFit.cover,
                              placeholder: (context, url) => const Center(
                                child: CircularProgressIndicator(strokeWidth: 2),
                              ),
                              errorWidget: (context, url, error) => Center(
                                child: Text(
                                  user?.initials ?? 'YO',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF4F46E5),
                                  ),
                                ),
                              ),
                            )
                          : Center(
                              child: Text(
                                user?.initials ?? 'YO',
                                style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF4F46E5),
                                ),
                              ),
                            ),
                    ),
                    if (_isUploadingPhoto)
                      Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withValues(alpha: 0.5),
                        ),
                        child: const Center(
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),

                // Name & Role Badge
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    user?.fullName ?? 'YATE f OLIVERA',
                    textAlign: TextAlign.center,
                    style: AppTypography.titleMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.ink,
                      fontSize: 18,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF4F46E5),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        isFr ? 'Enseignant' : 'Teacher',
                        style: const TextStyle(
                          color: Color(0xFF4F46E5),
                          fontWeight: FontWeight.w700,
                          fontSize: 11.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Photo Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.ink,
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        minimumSize: const Size(0, 32),
                      ),
                      icon: const Icon(Icons.camera_alt_outlined, size: 14),
                      label: Text(
                        hasPhoto
                            ? (isFr ? 'Changer' : 'Change photo')
                            : (isFr ? 'Ajouter photo' : 'Add photo'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      onPressed: _isUploadingPhoto ? null : _pickAndUploadPhoto,
                    ),
                    if (hasPhoto) ...[
                      const SizedBox(width: 6),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.bad),
                        tooltip: isFr ? 'Supprimer la photo' : 'Remove photo',
                        onPressed: _isUploadingPhoto ? null : _removePhoto,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'JPG, PNG, WEBP or GIF · up to 5 MB',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSubtle,
                    fontSize: 10.5,
                  ),
                ),
                const SizedBox(height: 16),

                // Facts List (Email, Username, Member since, Time)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      const Divider(height: 1, color: AppColors.borderSoft),
                      const SizedBox(height: 12),
                      _buildFactItem(
                        icon: Icons.mail_outline,
                        label: isFr ? 'E-mail' : 'Email',
                        value: user?.email ?? '—',
                      ),
                      const SizedBox(height: 10),
                      _buildFactItem(
                        icon: Icons.person_outline,
                        label: isFr ? 'Nom d\'utilisateur' : 'Username',
                        value: '@${user?.username ?? ''}',
                      ),
                      const SizedBox(height: 10),
                      _buildFactItem(
                        icon: Icons.calendar_today_outlined,
                        label: isFr ? 'Membre depuis' : 'Member since',
                        value: user?.formattedJoinedDate(isFr) ?? '—',
                      ),
                      const SizedBox(height: 10),
                      _buildFactItem(
                        icon: Icons.access_time_outlined,
                        label: isFr ? 'Votre heure' : 'Your time',
                        value: '$timeFmt ${_selectedTimezone ?? 'UTC'}',
                      ),
                      const SizedBox(height: 16),

                      // Profile Completion Box
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.frenchPaper,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  isFr ? 'Profil' : 'Profile',
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.ink,
                                  ),
                                ),
                                Text(
                                  '$completionPct%',
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.ink,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(3),
                              child: LinearProgressIndicator(
                                value: completionPct / 100,
                                minHeight: 6,
                                backgroundColor: const Color(0xFFE2E8F0),
                                valueColor: const AlwaysStoppedAnimation(Color(0xFF4F46E5)),
                              ),
                            ),
                            const SizedBox(height: 10),
                            _buildChecklistItem(
                              isDone: hasPhoto,
                              label: isFr ? 'Ajouter une photo de profil' : 'Add a profile photo',
                              onTap: _pickAndUploadPhoto,
                            ),
                            const SizedBox(height: 6),
                            _buildChecklistItem(
                              isDone: hasNames,
                              label: isFr ? 'Renseigner prénom et nom' : 'Fill in your first and last name',
                              onTap: () => _firstNameFocus.requestFocus(),
                            ),
                            const SizedBox(height: 6),
                            _buildChecklistItem(
                              isDone: hasTz,
                              label: isFr ? 'Choisir votre fuseau horaire' : 'Choose your time zone',
                              onTap: () {
                                TimezoneSelectDialog.show(
                                  context: context,
                                  currentTimezone: _selectedTimezone,
                                  onSelected: (tz) => setState(() => _selectedTimezone = tz),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFactItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.textSubtle),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.ink,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChecklistItem({
    required bool isDone,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: isDone ? null : onTap,
      borderRadius: BorderRadius.circular(4),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          children: [
            Icon(
              isDone ? Icons.check_circle : Icons.error_outline,
              size: 14,
              color: isDone ? AppColors.good : const Color(0xFFF59E0B),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  color: isDone ? AppColors.textMuted : AppColors.ink,
                  decoration: isDone ? TextDecoration.none : TextDecoration.underline,
                  decorationColor: AppColors.textSubtle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  // RIGHT COLUMN: 4 MAIN SECTIONS
  // ────────────────────────────────────────────────────────────
  List<Widget> _buildRightSections(UserModel? user, bool isFr) {
    return [
      // 1. Personal Information Card
      _buildPersonalInfoCard(user, isFr),
      const SizedBox(height: 20),

      // 2. Time Zone Card (with Live Local Clock)
      _buildTimezoneCard(isFr),
      const SizedBox(height: 20),

      // 3. Sign-in & Security Card (Password + Email)
      _buildSecurityCard(user, isFr),
      const SizedBox(height: 20),

      // 4. Signed-in Devices Section
      const SignedInDevicesSection(),
      const SizedBox(height: 20),

      // 5. Language Preference Card
      _buildLanguageCard(isFr),
      const SizedBox(height: 20),

      // 6. About & Version Card
      _buildAboutCard(),
      const SizedBox(height: 20),

      // 7. Logout Session Card
      _buildLogoutCard(isFr),
    ];
  }

  // Card 1: Personal Info
  Widget _buildPersonalInfoCard(UserModel? user, bool isFr) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.badge_outlined,
                  color: Color(0xFF4F46E5),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Informations personnelles' : 'Personal information',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Comment votre nom apparaît auprès des élèves et collègues.'
                          : 'How your name appears to students and colleagues.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Fields Grid
          if (isTablet)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildFormField(
                    label: isFr ? 'Prénom' : 'First name',
                    controller: _firstNameCtrl,
                    focusNode: _firstNameFocus,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildFormField(
                    label: isFr ? 'Nom' : 'Last name',
                    controller: _lastNameCtrl,
                  ),
                ),
              ],
            )
          else ...[
            _buildFormField(
              label: isFr ? 'Prénom' : 'First name',
              controller: _firstNameCtrl,
              focusNode: _firstNameFocus,
            ),
            const SizedBox(height: 14),
            _buildFormField(
              label: isFr ? 'Nom' : 'Last name',
              controller: _lastNameCtrl,
            ),
          ],
          const SizedBox(height: 14),

          if (isTablet)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildFormField(
                    label: isFr ? 'Nom d\'utilisateur' : 'Username',
                    controller: _usernameCtrl,
                    prefixText: '@',
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildReadOnlyEmailField(user?.email ?? '', isFr),
                ),
              ],
            )
          else ...[
            _buildFormField(
              label: isFr ? 'Nom d\'utilisateur' : 'Username',
              controller: _usernameCtrl,
              prefixText: '@',
            ),
            const SizedBox(height: 14),
            _buildReadOnlyEmailField(user?.email ?? '', isFr),
          ],
        ],
      ),
    );
  }

  Widget _buildFormField({
    required String label,
    required TextEditingController controller,
    FocusNode? focusNode,
    String? prefixText,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          focusNode: focusNode,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            prefixText: prefixText,
            prefixStyle: const TextStyle(
              color: AppColors.textSubtle,
              fontWeight: FontWeight.w600,
            ),
            filled: true,
            fillColor: AppColors.frenchPaper,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildReadOnlyEmailField(String email, bool isFr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isFr ? 'E-mail' : 'Email',
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          height: 48,
          padding: const EdgeInsets.only(left: 14, right: 4),
          decoration: BoxDecoration(
            color: AppColors.frenchPaper,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  email,
                  style: const TextStyle(fontSize: 13, color: AppColors.ink),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              TextButton(
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF4F46E5),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                ),
                onPressed: () {
                  ChangeEmailDialog.show(
                    context: context,
                    currentEmail: email,
                    onSuccess: () => ref.read(authNotifierProvider.notifier).fetchProfile(),
                  );
                },
                child: Text(
                  isFr ? 'Modifier' : 'Change',
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12.5),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Card 2: Time Zone & Live Clock
  Widget _buildTimezoneCard(bool isFr) {
    final isTablet = MediaQuery.of(context).size.width >= 768;
    final timeStr = DateFormat('h:mm a').format(_now);
    final dayStr = DateFormat('EEEE, MMM d').format(_now);

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFEFF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.public,
                  color: Color(0xFF0E7490),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Fuseau horaire' : 'Time zone',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Les cours, quiz et échéances sont affichés selon ce fuseau partout sur la plateforme.'
                          : 'Classes, quiz windows and deadlines are shown in this zone everywhere in the platform.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Layout: Selector on left, Live Clock on right
          if (isTablet)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildTimezonePickerField(isFr),
                ),
                const SizedBox(width: 20),
                SizedBox(
                  width: 240,
                  child: _buildLiveClockBox(timeStr, dayStr, isFr),
                ),
              ],
            )
          else ...[
            _buildTimezonePickerField(isFr),
            const SizedBox(height: 16),
            _buildLiveClockBox(timeStr, dayStr, isFr),
          ],
        ],
      ),
    );
  }

  Widget _buildTimezonePickerField(bool isFr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isFr ? 'Votre fuseau horaire' : 'Your time zone',
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: AppColors.ink,
          ),
        ),
        const SizedBox(height: 6),
        InkWell(
          onTap: () {
            TimezoneSelectDialog.show(
              context: context,
              currentTimezone: _selectedTimezone,
              onSelected: (tz) => setState(() => _selectedTimezone = tz),
            );
          },
          borderRadius: BorderRadius.circular(10),
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.frenchPaper,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _selectedTimezone ?? 'UTC',
                    style: const TextStyle(fontSize: 13.5, color: AppColors.ink),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Icon(Icons.arrow_drop_down, color: AppColors.textMuted),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        InkWell(
          onTap: () {
            final devTz = DateTime.now().timeZoneName;
            setState(() => _selectedTimezone = devTz);
          },
          child: Text.rich(
            TextSpan(
              text: isFr ? 'Détecté : ' : 'Detected: ',
              style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
              children: [
                TextSpan(
                  text: DateTime.now().timeZoneName,
                  style: const TextStyle(
                    color: Color(0xFF4338CA),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextSpan(
                  text: isFr ? ' — toucher pour utiliser' : ' — click to use',
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLiveClockBox(String timeStr, String dayStr, bool isFr) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFECFEFF), Color(0xFFF0F9FF)],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFCFFAFE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            isFr ? 'Heure locale actuelle' : 'Local time there now',
            style: const TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0E7490),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            timeStr,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '$dayStr · ${_selectedTimezone ?? 'UTC'}',
            style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // Card 3: Sign-in & Security
  Widget _buildSecurityCard(UserModel? user, bool isFr) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  color: Color(0xFFB45309),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Connexion & sécurité' : 'Sign-in & security',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Protégez votre compte enseignant.'
                          : 'Keep your account protected.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Password Row
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.frenchPaper,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.lock_outline, size: 16, color: AppColors.textMuted),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Mot de passe' : 'Password',
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                    Text(
                      isFr
                          ? 'Utilisez un mot de passe long et unique.'
                          : 'Use a long password you don\'t use anywhere else.',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.ink,
                  side: const BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () => ChangePasswordDialog.show(context),
                child: Text(
                  isFr ? 'Modifier' : 'Change password',
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: AppColors.borderSoft),

          // Email Address Row
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.frenchPaper,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.mail_outline, size: 16, color: AppColors.textMuted),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Adresse e-mail' : 'Email address',
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                    Text(
                      '${user?.email ?? ''} — ${isFr ? 'pour la connexion et les notifications.' : 'used to sign in and for notifications.'}',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.ink,
                  side: const BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  ChangeEmailDialog.show(
                    context: context,
                    currentEmail: user?.email ?? '',
                    onSuccess: () => ref.read(authNotifierProvider.notifier).fetchProfile(),
                  );
                },
                child: Text(
                  isFr ? 'Changer l\'e-mail' : 'Change email',
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
          const Divider(height: 24, color: AppColors.borderSoft),

          // Fingerprint unlock (this phone)
          FingerprintLockTile(isFr: isFr),
        ],
      ),
    );
  }

  // Card 5: Language Preference
  Widget _buildLanguageCard(bool isFr) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isFr ? 'Langue de l\'application' : 'Application Language',
                  style: AppTypography.titleSmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.frenchNavy,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isFr
                      ? 'Basculez l\'interface entre Français et Anglais à tout moment.'
                      : 'Switch the user interface between French and English anytime.',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          const LanguageSwitcherButton(),
        ],
      ),
    );
  }

  // Card 6: About & Version
  Widget _buildAboutCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Column(
        children: [
          const BrandLogo(height: 52, tight: true),
          const SizedBox(height: 12),
          Text(
            'Learn French with Natives',
            style: AppTypography.titleSmall.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Application Enseignant · Version 1.0.0 (Build 1)',
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 8),
          Text(
            '© 2026 Learn French with Natives. Tous droits réservés.',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSubtle,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  // Card 7: Logout
  Widget _buildLogoutCard(bool isFr) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.1),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isFr ? 'Session Enseignant' : 'Teacher Session',
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isFr
                      ? 'Fermer la session sur cet appareil.'
                      : 'Sign out of your session on this device.',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          CustomButton(
            text: isFr ? 'Déconnexion' : 'Log Out',
            icon: Icons.logout,
            variant: ButtonVariant.danger,
            height: 42,
            onPressed: _logout,
          ),
        ],
      ),
    );
  }
}
