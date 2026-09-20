import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/widgets/brand_logo.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/tricolore_bar.dart';
import 'login_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  final List<Map<String, dynamic>> _features = [
    {
      'icon': Icons.video_call_outlined,
      'title': 'Classes en direct',
      'desc': 'Salles virtuelles immersives avec LiveKit & outils interactifs.',
      'color': AppColors.frenchBlue,
    },
    {
      'icon': Icons.school_outlined,
      'title': 'Préparation TCF & TEF',
      'desc': 'Suivi rigoureux des 4 compétences (CE, CO, EE, EO) selon le CECRL.',
      'color': AppColors.teacherAccent,
    },
    {
      'icon': Icons.psychology_outlined,
      'title': 'Quiz & Studios IA',
      'desc': 'Génération IA de questions et synthèses vocales natives pour la compréhension orale.',
      'color': AppColors.good,
    },
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 600;

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      body: SafeArea(
        child: Column(
          children: [
            const TricoloreBar(height: 4),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: isTablet ? 48.0 : 24.0,
                    vertical: 32.0,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 680),
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Official Brand Logo
                            const BrandLogo(
                              height: 84,
                              tight: true,
                              heroTag: 'brand_logo',
                            ),
                            const SizedBox(height: 22),

                            // Brand Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.teacherRoseBg,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: AppColors.teacherDot.withValues(alpha: 0.2)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: AppColors.teacherDot,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Espace Enseignant · Teacher Space',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.teacherDot,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Main Title
                            Text(
                              'Enseignez le français avec excellence',
                              style: AppTypography.displayMedium.copyWith(
                                color: AppColors.frenchNavy,
                                fontSize: isTablet ? 36 : 28,
                                height: 1.2,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),

                            // Subtitle
                            Text(
                              'Plateforme pédagogique tout-en-un pour gérer vos promotions, animer vos cours LiveKit et préparer vos étudiants aux examens officiels.',
                              style: AppTypography.bodyLarge.copyWith(
                                color: AppColors.textMuted,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 36),

                            // Feature cards
                            ..._features.map((feat) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 14),
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border, width: 1.1),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(alpha: 0.02),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      decoration: BoxDecoration(
                                        color: (feat['color'] as Color).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        feat['icon'] as IconData,
                                        color: feat['color'] as Color,
                                        size: 24,
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            feat['title'] as String,
                                            style: AppTypography.titleMedium.copyWith(
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.ink,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            feat['desc'] as String,
                                            style: AppTypography.bodySmall.copyWith(
                                              color: AppColors.textMuted,
                                              height: 1.4,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),

                            const SizedBox(height: 28),

                            // CTA Button
                            CustomButton(
                              text: 'Accéder à l\'espace Enseignant',
                              icon: Icons.arrow_forward,
                              height: 52,
                              width: double.infinity,
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => const LoginScreen(),
                                  ),
                                );
                              },
                            ),

                            const SizedBox(height: 16),
                            Text(
                              'Learn French with Natives © 2026',
                              style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
