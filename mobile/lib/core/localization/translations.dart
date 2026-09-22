import 'package:flutter/material.dart';

class AppTranslations {
  AppTranslations._();

  static const Map<String, Map<String, String>> _localizedValues = {
    'fr': {
      // General & Brand
      'app_title': 'Learn French with Natives',
      'teacher_space': 'Espace Enseignant',
      'faculty': 'Faculté Pédagogique',
      'welcome_title': 'Enseignez le français avec excellence',
      'welcome_subtitle':
          'Plateforme pédagogique tout-en-un pour gérer vos cohortes, animer vos classes en direct et préparer vos étudiants aux examens officiels.',
      'enter_teacher_space': 'Accéder à l\'espace enseignant',
      'login': 'Connexion',
      'logout': 'Déconnexion',
      'email': 'Adresse email',
      'password': 'Mot de passe',
      'forgot_password': 'Mot de passe oublié ?',
      'remember_me': 'Se souvenir de moi',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'cancel': 'Annuler',
      'confirm': 'Confirmer',
      'save': 'Enregistrer',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'search': 'Rechercher...',
      'all': 'Tous',
      'language': 'Langue',
      'french': 'Français',
      'english': 'English',

      // Navigation Items
      'nav_teaching': 'ENSEIGNEMENT',
      'nav_sessions': 'SÉANCES & DIRECT',
      'nav_account': 'COMPTE',
      'nav_dashboard': 'Tableau de bord',
      'nav_batches': 'Mes promotions',
      'nav_quizzes': 'Gestion des quiz',
      'nav_exam_prep': 'Préparation examens',
      'nav_resources': 'Ressources',
      'nav_schedule': 'Planning des cours',
      'nav_meetings': 'Classes en direct',
      'nav_assign_demo': 'Cours d\'essai',
      'nav_profile': 'Paramètres du compte',

      // Welcome Screen Features
      'feat_live_title': 'Classes en direct',
      'feat_live_desc': 'Salles virtuelles immersives avec visioconférence HD & outils interactifs.',
      'feat_exam_title': 'Préparation TCF & TEF',
      'feat_exam_desc': 'Suivi rigoureux des 4 compétences (CE, CO, EE, EO) selon le CECRL.',
      'feat_ai_title': 'Quiz & Studios IA',
      'feat_ai_desc': 'Génération IA de questions et synthèses vocales natives pour la compréhension orale.',

      // Login Screen
      'login_welcome_quote': '« Enseigner, c’est éveiller la curiosité et transmettre l’élégance d’une langue. »',
      'login_subtitle': 'Renseignez vos identifiants pour accéder à vos promotions et sessions.',
      'secure_space': 'Espace Enseignant Sécurisé',
      'secure_desc': 'Accès chiffré JWT & conformité pédagogique CECRL.',
      'kpi_tracking': 'Suivi Précis & Résultats en Direct',
      'kpi_desc': 'Visualisation détaillée des 4 compétences TCF/TEF.',

      // Dashboard
      'active_students': 'Étudiants actifs',
      'cohorts_managed': 'Cohortes gérées',
      'quizzes_published': 'Quiz publiés',
      'demo_sessions': 'Séances de démo',
      'monthly_progress': 'Progression mensuelle',
      'active_cohorts': 'Promotions actives',
      'recent_submissions': 'Dernières soumissions',

      // Meetings
      'join_with_id': 'Rejoindre avec identifiant',
      'create_meeting': 'Créer une classe',
      'waiting_room': 'Salle d\'attente',
      'admit': 'Admettre',
      'admit_all': 'Tout admettre',
      'decline': 'Refuser',
      'meeting_code': 'Code de réunion',
      'passcode': 'Code secret',
      'share_invite': 'Partager l\'invitation',

      // Profile Settings
      'profile_title': 'Profil & Paramètres',
      'change_password': 'Changer le mot de passe',
      'app_language_setting': 'Langue de l\'application',
      'app_language_desc': 'Choisissez la langue de l\'interface (Français ou Anglais).',
      'about_title': 'À propos de Learn French with Natives',
      'version': 'Version 1.0.0 (Build 1)',
      'rights_reserved': '© 2026 Learn French with Natives. Tous droits réservés.',
    },
    'en': {
      // General & Brand
      'app_title': 'Learn French with Natives',
      'teacher_space': 'Teacher Space',
      'faculty': 'Faculty Portal',
      'welcome_title': 'Teach French with Excellence',
      'welcome_subtitle':
          'All-in-one educational platform to manage your cohorts, host live classes, and prepare students for official French exams.',
      'enter_teacher_space': 'Enter Teacher Space',
      'login': 'Sign In',
      'logout': 'Sign Out',
      'email': 'Email Address',
      'password': 'Password',
      'forgot_password': 'Forgot password?',
      'remember_me': 'Remember me',
      'loading': 'Loading...',
      'error': 'Error',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search...',
      'all': 'All',
      'language': 'Language',
      'french': 'French',
      'english': 'English',

      // Navigation Items
      'nav_teaching': 'TEACHING',
      'nav_sessions': 'SESSIONS & LIVE',
      'nav_account': 'ACCOUNT',
      'nav_dashboard': 'Dashboard',
      'nav_batches': 'My Batches',
      'nav_quizzes': 'Quiz Studio',
      'nav_exam_prep': 'Exam Prep',
      'nav_resources': 'Resources',
      'nav_schedule': 'Class Schedule',
      'nav_meetings': 'Live Meetings',
      'nav_assign_demo': 'Demo Sessions',
      'nav_profile': 'Account Settings',

      // Welcome Screen Features
      'feat_live_title': 'Live Interactive Classes',
      'feat_live_desc': 'Immersive virtual classrooms with HD video and interactive tools.',
      'feat_exam_title': 'TCF & TEF Exam Prep',
      'feat_exam_desc': 'Thorough tracking across all 4 CEFR competencies (Reading, Listening, Writing, Speaking).',
      'feat_ai_title': 'AI Quiz & Audio Studio',
      'feat_ai_desc': 'AI question generation and native voice synthesis for listening comprehension.',

      // Login Screen
      'login_welcome_quote': '“To teach is to awaken curiosity and impart the elegance of a language.”',
      'login_subtitle': 'Enter your credentials to access your batches and live teaching sessions.',
      'secure_space': 'Secure Teacher Space',
      'secure_desc': 'JWT-encrypted access & CEFR pedagogical compliance.',
      'kpi_tracking': 'Precise Tracking & Live Insights',
      'kpi_desc': 'Detailed real-time breakdown of all 4 TCF/TEF skills.',

      // Dashboard
      'active_students': 'Active Students',
      'cohorts_managed': 'Cohorts Managed',
      'quizzes_published': 'Quizzes Published',
      'demo_sessions': 'Demo Sessions',
      'monthly_progress': 'Monthly Progress',
      'active_cohorts': 'Active Cohorts',
      'recent_submissions': 'Recent Submissions',

      // Meetings
      'join_with_id': 'Join with ID',
      'create_meeting': 'New Live Class',
      'waiting_room': 'Waiting Room',
      'admit': 'Admit',
      'admit_all': 'Admit All',
      'decline': 'Decline',
      'meeting_code': 'Meeting ID',
      'passcode': 'Passcode',
      'share_invite': 'Share Invitation',

      // Profile Settings
      'profile_title': 'Profile & Settings',
      'change_password': 'Change Password',
      'app_language_setting': 'App Language',
      'app_language_desc': 'Choose the interface language (French or English).',
      'about_title': 'About Learn French with Natives',
      'version': 'Version 1.0.0 (Build 1)',
      'rights_reserved': '© 2026 Learn French with Natives. All rights reserved.',
    },
  };

  static String tr(String key, {String lang = 'fr'}) {
    final values = _localizedValues[lang] ?? _localizedValues['fr']!;
    return values[key] ?? _localizedValues['fr']?[key] ?? key;
  }
}

extension AppTranslationsExtension on BuildContext {
  String tr(String key) {
    final locale = Localizations.maybeLocaleOf(this) ?? const Locale('fr', 'FR');
    final lang = locale.languageCode;
    return AppTranslations.tr(key, lang: lang);
  }

  bool get isFrench => (Localizations.maybeLocaleOf(this)?.languageCode ?? 'fr') == 'fr';
}
