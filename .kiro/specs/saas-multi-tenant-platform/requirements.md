# Document d'Exigences — Plateforme SaaS Multi-Tenant d'Enseignement du Français

## Introduction

Ce document définit les exigences pour la reconstruction de la plateforme existante d'enseignement du français en une solution SaaS multi-tenant professionnelle. La nouvelle plateforme permettra à plusieurs écoles ou enseignants indépendants de gérer leurs cours de français via des espaces isolés (tenants), avec deux formules d'abonnement (Full et Lite), une personnalisation par tenant (branding, sous-domaine), et une architecture moderne basée sur NestJS, Next.js, Prisma et PostgreSQL avec isolation par schéma.

La fonctionnalité de chat est explicitement exclue de cette plateforme.

## Glossaire

- **Plateforme** : L'application SaaS multi-tenant d'enseignement du français dans son ensemble
- **Tenant** : Une instance isolée de la plateforme attribuée à une école ou un enseignant indépendant, avec son propre schéma PostgreSQL
- **Super_Admin** : Le propriétaire de la plateforme SaaS qui gère les tenants, les licences et les abonnements
- **Admin** : L'administrateur d'un tenant en formule Full, responsable de la gestion des utilisateurs, lots et paramètres de son tenant
- **Enseignant** : Un utilisateur qui crée et gère des cours, quiz, ressources et emplois du temps
- **Étudiant** : Un utilisateur qui suit des cours, passe des quiz et consulte ses résultats
- **Lot** : Un groupe/classe d'étudiants assigné à un enseignant pour un niveau de français donné (équivalent de "batch")
- **Formule_Full** : Plan d'abonnement complet avec hiérarchie Super Admin → Admin → Enseignant → Lot → Étudiant
- **Formule_Lite** : Plan d'abonnement simplifié où l'Enseignant gère directement ses étudiants sans couche Admin
- **Schéma_Tenant** : Un schéma PostgreSQL dédié à un tenant, isolant ses données des autres tenants
- **Sous_Domaine** : Un sous-domaine personnalisé attribué à chaque tenant (ex: monecole.plateforme.com)
- **Branding** : La personnalisation visuelle d'un tenant (logo, couleurs, nom affiché)
- **Session_Cours** : Une occurrence individuelle d'un cours planifié, avec suivi de présence
- **Code_Accès** : Un code temporaire généré pour valider la présence d'un étudiant à une session
- **Demande_Démo** : Une demande soumise par un prospect via la page d'accueil pour essayer la plateforme
- **Résolveur_Tenant** : Le composant qui identifie le tenant à partir du sous-domaine de la requête HTTP

## Exigences

### Exigence 1 : Architecture Multi-Tenant avec Isolation par Schéma

**User Story :** En tant que Super_Admin, je veux que chaque tenant dispose de son propre schéma PostgreSQL, afin que les données de chaque client soient complètement isolées et sécurisées.

#### Critères d'Acceptation

1. WHEN un nouveau tenant est créé, THE Plateforme SHALL créer un schéma PostgreSQL dédié portant un identifiant unique dérivé du slug du tenant
2. WHEN une requête HTTP arrive, THE Résolveur_Tenant SHALL identifier le tenant à partir du sous-domaine de la requête et configurer la connexion Prisma vers le schéma correspondant
3. THE Plateforme SHALL utiliser un schéma PostgreSQL partagé nommé "public" pour stocker les données globales (tenants, abonnements, Super_Admin)
4. THE Plateforme SHALL utiliser un schéma PostgreSQL dédié par tenant pour stocker les données spécifiques (utilisateurs, lots, quiz, ressources, présences, emplois du temps)
5. IF un sous-domaine ne correspond à aucun tenant actif, THEN THE Résolveur_Tenant SHALL retourner une page d'erreur 404 avec un message explicatif
6. WHEN un tenant est suspendu ou désactivé, THE Plateforme SHALL refuser toute connexion et afficher un message indiquant que le compte est suspendu
7. THE Plateforme SHALL utiliser un pool de connexions PostgreSQL partagé avec sélection dynamique du schéma via la commande SET search_path

### Exigence 2 : Gestion des Abonnements et Formules

**User Story :** En tant que Super_Admin, je veux proposer deux formules d'abonnement (Full et Lite), afin de répondre aux besoins variés des écoles et enseignants indépendants.

#### Critères d'Acceptation

1. THE Plateforme SHALL proposer exactement deux formules d'abonnement : Formule_Full et Formule_Lite
2. WHILE un tenant est abonné à la Formule_Full, THE Plateforme SHALL activer la hiérarchie complète : Admin, Enseignant, Lot, Étudiant
3. WHILE un tenant est abonné à la Formule_Lite, THE Plateforme SHALL permettre à l'Enseignant de gérer directement ses étudiants sans couche Admin ni notion de Lot
4. WHEN un abonnement expire, THE Plateforme SHALL passer le tenant en mode lecture seule pendant une période de grâce de 15 jours
5. IF la période de grâce expire sans renouvellement, THEN THE Plateforme SHALL suspendre le tenant et empêcher tout accès
6. WHEN le Super_Admin crée un nouveau tenant, THE Plateforme SHALL exiger la sélection d'une formule d'abonnement
7. THE Plateforme SHALL intégrer Stripe pour le traitement des paiements récurrents mensuels et annuels
8. WHEN un paiement Stripe échoue, THE Plateforme SHALL notifier le tenant par email et réessayer le paiement selon la politique de relance de Stripe

### Exigence 3 : Tableau de Bord Super Admin

**User Story :** En tant que Super_Admin, je veux un tableau de bord centralisé pour gérer tous les tenants, licences et abonnements, afin de superviser l'ensemble de la plateforme SaaS.

#### Critères d'Acceptation

1. THE Plateforme SHALL fournir au Super_Admin un tableau de bord affichant le nombre total de tenants, les revenus mensuels, les abonnements actifs et les tenants en période de grâce
2. WHEN le Super_Admin accède à la liste des tenants, THE Plateforme SHALL afficher pour chaque tenant : nom, sous-domaine, formule, statut, date de création et date d'expiration de l'abonnement
3. THE Plateforme SHALL permettre au Super_Admin de créer un nouveau tenant en spécifiant : nom, sous-domaine, formule, branding initial et email de l'administrateur du tenant
4. THE Plateforme SHALL permettre au Super_Admin de suspendre, réactiver ou supprimer un tenant
5. WHEN le Super_Admin modifie le branding d'un tenant, THE Plateforme SHALL appliquer les changements (logo, couleurs primaire et secondaire, nom affiché) au tenant concerné
6. THE Plateforme SHALL permettre au Super_Admin de consulter les statistiques d'utilisation de chaque tenant (nombre d'utilisateurs, de lots, de quiz créés)
7. IF le Super_Admin tente de supprimer un tenant avec un abonnement actif, THEN THE Plateforme SHALL demander une confirmation explicite et archiver les données avant suppression

### Exigence 4 : Personnalisation par Tenant (Branding et Sous-Domaine)

**User Story :** En tant que Super_Admin, je veux personnaliser l'apparence de chaque tenant avec un logo, des couleurs et un sous-domaine, afin que chaque école ait sa propre identité visuelle.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre la configuration d'un sous-domaine unique par tenant au format {slug}.plateforme.com
2. WHEN un utilisateur accède à un sous-domaine de tenant, THE Plateforme SHALL charger dynamiquement le branding du tenant (logo, couleur primaire, couleur secondaire, nom affiché)
3. THE Plateforme SHALL appliquer le branding du tenant à toutes les pages : page de connexion, tableau de bord, en-tête de navigation et emails transactionnels
4. THE Plateforme SHALL stocker les logos des tenants dans un service de stockage objet (Cloudflare R2 ou AWS S3)
5. IF aucun branding personnalisé n'est configuré pour un tenant, THEN THE Plateforme SHALL utiliser le branding par défaut de la plateforme
6. WHEN le Super_Admin modifie le sous-domaine d'un tenant, THE Plateforme SHALL vérifier l'unicité du nouveau sous-domaine et mettre à jour la configuration DNS

### Exigence 5 : Authentification et Contrôle d'Accès

**User Story :** En tant qu'utilisateur de la plateforme, je veux un système d'authentification sécurisé avec gestion des rôles, afin que chaque utilisateur accède uniquement aux fonctionnalités autorisées.

#### Critères d'Acceptation

1. THE Plateforme SHALL implémenter l'authentification via NextAuth.js avec des sessions JWT
2. THE Plateforme SHALL supporter quatre rôles : Super_Admin (global), Admin (par tenant, Formule_Full uniquement), Enseignant (par tenant) et Étudiant (par tenant)
3. WHEN un utilisateur se connecte, THE Plateforme SHALL vérifier ses identifiants, le statut de son compte et le statut du tenant associé
4. THE Plateforme SHALL hacher les mots de passe avec bcrypt et un facteur de coût de 12
5. WHEN un utilisateur échoue 5 tentatives de connexion consécutives, THE Plateforme SHALL verrouiller le compte pendant 30 minutes
6. IF un compte est désactivé par un Admin ou le Super_Admin, THEN THE Plateforme SHALL refuser la connexion et afficher un message indiquant que le compte est désactivé
7. WHEN un utilisateur se connecte pour la première fois avec un mot de passe temporaire, THE Plateforme SHALL forcer le changement de mot de passe avant d'accéder à l'application
8. THE Plateforme SHALL expirer les mots de passe après 90 jours et forcer le renouvellement
9. THE Plateforme SHALL implémenter la protection CSRF, les en-têtes de sécurité HTTP (via Helmet) et le rate limiting sur les endpoints d'authentification
10. WHEN un token JWT expire, THE Plateforme SHALL rediriger l'utilisateur vers la page de connexion du tenant approprié

### Exigence 6 : Gestion des Utilisateurs (Admin Tenant)

**User Story :** En tant qu'Admin d'un tenant en Formule_Full, je veux gérer les enseignants et étudiants de mon école, afin de contrôler les accès et les inscriptions.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre à l'Admin de créer des comptes Enseignant et Étudiant avec : prénom, nom, email, nom d'utilisateur et rôle
2. WHEN l'Admin crée un nouvel utilisateur, THE Plateforme SHALL générer un mot de passe temporaire et envoyer un email de bienvenue contenant les identifiants de connexion
3. THE Plateforme SHALL permettre à l'Admin de lister, rechercher, modifier et désactiver les comptes utilisateurs de son tenant
4. THE Plateforme SHALL permettre à l'Admin de réinitialiser le mot de passe d'un utilisateur, générant un nouveau mot de passe temporaire envoyé par email
5. IF l'Admin tente de supprimer un Enseignant assigné à des lots actifs, THEN THE Plateforme SHALL afficher un avertissement et exiger la réassignation des lots avant suppression
6. THE Plateforme SHALL valider l'unicité de l'email et du nom d'utilisateur au sein du tenant lors de la création d'un compte
7. WHILE un tenant est en Formule_Lite, THE Plateforme SHALL masquer la fonctionnalité de gestion des utilisateurs Admin et permettre uniquement à l'Enseignant de gérer ses étudiants directement

### Exigence 7 : Gestion des Lots (Batches)

**User Story :** En tant qu'Admin ou Enseignant, je veux créer et gérer des lots d'étudiants par niveau de français, afin d'organiser les cours efficacement.

#### Critères d'Acceptation

1. WHILE un tenant est en Formule_Full, THE Plateforme SHALL permettre à l'Admin de créer des lots avec : nom, enseignant assigné, niveau de français (A1 à C2), dates de début et fin, mode de cours (en ligne/présentiel), fuseau horaire et lien de réunion
2. WHILE un tenant est en Formule_Lite, THE Plateforme SHALL masquer la gestion des lots et permettre à l'Enseignant de gérer ses étudiants directement sans notion de lot
3. THE Plateforme SHALL permettre l'inscription et la désinscription d'étudiants dans un lot
4. WHEN un étudiant est inscrit dans un lot, THE Plateforme SHALL envoyer un email de notification à l'étudiant avec les détails du lot
5. WHEN un enseignant est assigné à un lot, THE Plateforme SHALL envoyer un email de notification à l'enseignant avec les détails du lot
6. THE Plateforme SHALL permettre la configuration d'un emploi du temps récurrent par lot (jours de la semaine, heures de début et fin)
7. THE Plateforme SHALL fournir une page d'insights par lot affichant : nombre d'étudiants, taux de présence moyen, nombre de quiz et scores moyens

### Exigence 8 : Système de Quiz

**User Story :** En tant qu'Enseignant, je veux créer des quiz avec différents types de questions et les assigner à mes lots ou étudiants, afin d'évaluer la progression des étudiants.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre à l'Enseignant de créer des quiz avec : titre, description, instructions, durée en minutes, dates de début et fin, total des points
2. THE Plateforme SHALL supporter les types de questions suivants : choix multiple (une ou plusieurs réponses correctes), texte libre et vrai/faux
3. THE Plateforme SHALL permettre la configuration de l'ordre aléatoire des questions et des options de réponse par quiz
4. THE Plateforme SHALL permettre la soumission automatique du quiz à l'expiration du temps imparti
5. WHEN un quiz est publié, THE Plateforme SHALL envoyer une notification par email à tous les étudiants des lots assignés avec les détails du quiz
6. WHILE un étudiant passe un quiz, THE Plateforme SHALL sauvegarder automatiquement les réponses en cours pour éviter la perte de données
7. WHEN un étudiant soumet un quiz, THE Plateforme SHALL calculer automatiquement le score pour les questions à correction automatique (choix multiple, vrai/faux)
8. THE Plateforme SHALL fournir à l'Enseignant une vue des soumissions avec : étudiant, score, pourcentage, temps passé et statut
9. THE Plateforme SHALL fournir à l'Étudiant une vue de ses résultats de quiz avec le détail des réponses correctes et incorrectes
10. THE Plateforme SHALL fournir un relevé de notes (marksheet) à l'Étudiant récapitulant tous ses quiz et scores
11. WHEN un quiz approche de sa date limite (24h avant), THE Plateforme SHALL envoyer un rappel par email aux étudiants qui n'ont pas encore soumis
12. WHILE un tenant est en Formule_Lite, THE Plateforme SHALL permettre à l'Enseignant d'assigner des quiz directement à des étudiants individuels au lieu de lots

### Exigence 9 : Gestion des Ressources Pédagogiques

**User Story :** En tant qu'Enseignant, je veux partager des ressources pédagogiques (PDF, documents, présentations) avec mes étudiants, afin de compléter les cours.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre à l'Enseignant de téléverser des ressources avec : titre, description, fichier et lot assigné
2. THE Plateforme SHALL accepter les types de fichiers suivants : PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
3. THE Plateforme SHALL limiter la taille maximale d'un fichier téléversé à 50 Mo
4. THE Plateforme SHALL stocker les fichiers de ressources dans un service de stockage objet (Cloudflare R2 ou AWS S3) avec des URLs signées pour l'accès sécurisé
5. THE Plateforme SHALL permettre à l'Étudiant de consulter et télécharger les ressources assignées à ses lots
6. THE Plateforme SHALL permettre à l'Enseignant de supprimer une ressource, ce qui supprime le fichier du stockage et l'entrée en base de données
7. WHILE un tenant est en Formule_Lite, THE Plateforme SHALL permettre à l'Enseignant de partager des ressources directement avec des étudiants individuels

### Exigence 10 : Gestion des Emplois du Temps et Planification

**User Story :** En tant qu'Enseignant ou Admin, je veux planifier des cours avec des détails complets, afin que les étudiants connaissent leur emploi du temps.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre la création de cours planifiés avec : titre, description, date et heure de début, date et heure de fin, lot assigné, mode (en ligne/présentiel), lieu ou lien de réunion
2. THE Plateforme SHALL afficher les cours planifiés dans une vue calendrier (semaine et mois) pour les Enseignants, Admins et Étudiants
3. WHEN un cours est créé ou modifié, THE Plateforme SHALL envoyer une notification par email aux étudiants du lot concerné
4. WHEN un cours est annulé, THE Plateforme SHALL envoyer une notification d'annulation par email aux étudiants du lot concerné
5. THE Plateforme SHALL envoyer un rappel automatique par email 1 heure avant le début de chaque cours planifié
6. THE Plateforme SHALL permettre la configuration d'emplois du temps récurrents par lot (jours de la semaine, heures) qui génèrent automatiquement les sessions de cours
7. WHILE un tenant est en Formule_Lite, THE Plateforme SHALL permettre à l'Enseignant de planifier des cours pour des étudiants individuels

### Exigence 11 : Système de Présence (Attendance)

**User Story :** En tant qu'Enseignant, je veux suivre la présence de mes étudiants à chaque session de cours, afin de monitorer leur assiduité.

#### Critères d'Acceptation

1. WHEN un Enseignant démarre une session de cours, THE Plateforme SHALL générer un code d'accès temporaire à 6 chiffres avec une durée de validité configurable
2. WHEN un code d'accès est généré, THE Plateforme SHALL envoyer le code par email aux étudiants du lot concerné
3. WHEN un Étudiant saisit un code d'accès valide pendant la fenêtre de validité, THE Plateforme SHALL enregistrer sa présence avec l'horodatage du pointage
4. IF un Étudiant saisit un code d'accès expiré ou invalide, THEN THE Plateforme SHALL refuser le pointage et afficher un message d'erreur explicatif
5. WHEN un Enseignant termine une session de cours, THE Plateforme SHALL marquer automatiquement comme absents les étudiants qui n'ont pas pointé
6. THE Plateforme SHALL fournir des statistiques de présence par lot, par étudiant et par période (taux de présence, tendances)
7. THE Plateforme SHALL permettre à l'Admin de configurer les paramètres de présence : longueur du code, durée d'expiration, minutes de tolérance pour retard et fin automatique de session
8. THE Plateforme SHALL exécuter une tâche planifiée pour terminer automatiquement les sessions expirées et marquer les absences

### Exigence 12 : Système d'Emails Transactionnels

**User Story :** En tant qu'utilisateur de la plateforme, je veux recevoir des emails pertinents pour les événements importants, afin de rester informé de l'activité de mes cours.

#### Critères d'Acceptation

1. THE Plateforme SHALL envoyer les types d'emails suivants : bienvenue avec identifiants, réinitialisation de mot de passe, notification de quiz, rappel de quiz, notification de cours, rappel de cours, modification de cours, annulation de cours, inscription au lot, code de présence, planification de démo
2. THE Plateforme SHALL personnaliser chaque email avec le branding du tenant (logo, couleurs, nom de l'école)
3. THE Plateforme SHALL utiliser des templates HTML responsives pour tous les emails transactionnels
4. IF l'envoi d'un email échoue, THEN THE Plateforme SHALL journaliser l'erreur et réessayer l'envoi jusqu'à 3 fois avec un délai exponentiel
5. THE Plateforme SHALL intégrer un service d'envoi d'emails professionnel (Brevo, SendGrid ou équivalent) pour garantir la délivrabilité
6. THE Plateforme SHALL inclure un lien de désinscription dans chaque email non critique conformément aux réglementations anti-spam

### Exigence 13 : Réinitialisation et Changement de Mot de Passe

**User Story :** En tant qu'utilisateur, je veux pouvoir réinitialiser mon mot de passe si je l'oublie et changer mon email, afin de maintenir l'accès à mon compte.

#### Critères d'Acceptation

1. WHEN un utilisateur demande une réinitialisation de mot de passe, THE Plateforme SHALL envoyer un code OTP à 6 chiffres par email avec une validité de 15 minutes
2. WHEN un utilisateur soumet un code OTP valide, THE Plateforme SHALL permettre la saisie d'un nouveau mot de passe
3. IF un utilisateur dépasse 3 tentatives de saisie de code OTP, THEN THE Plateforme SHALL invalider la demande et exiger une nouvelle demande de réinitialisation
4. WHEN un utilisateur change son mot de passe avec succès, THE Plateforme SHALL envoyer un email de confirmation et mettre à jour la date d'expiration du mot de passe à 90 jours
5. THE Plateforme SHALL permettre le changement d'email avec vérification par code OTP envoyé à la nouvelle adresse
6. THE Plateforme SHALL valider que le nouveau mot de passe contient au minimum 8 caractères, une majuscule, une minuscule et un chiffre

### Exigence 14 : Demandes de Démo et Page d'Accueil

**User Story :** En tant que prospect, je veux pouvoir demander une démonstration de la plateforme via une page d'accueil publique, afin de découvrir les fonctionnalités avant de m'abonner.

#### Critères d'Acceptation

1. THE Plateforme SHALL fournir une page d'accueil publique (landing page) présentant les fonctionnalités, les formules d'abonnement et un formulaire de demande de démo
2. THE Plateforme SHALL collecter les informations suivantes dans le formulaire de démo : nom complet, email, téléphone, pays, expérience préalable en français, niveau actuel, niveau souhaité, objectifs d'apprentissage, disponibilités et fuseau horaire
3. WHEN une demande de démo est soumise, THE Plateforme SHALL enregistrer la demande avec le statut "nouveau" et notifier le Super_Admin
4. THE Plateforme SHALL permettre au Super_Admin de gérer les demandes de démo : consulter, filtrer par statut, assigner un enseignant, planifier une démo avec lien de réunion
5. WHEN une démo est planifiée, THE Plateforme SHALL envoyer un email de confirmation au prospect et à l'enseignant assigné avec les détails de la réunion
6. THE Plateforme SHALL permettre à l'Enseignant assigné de consulter ses démos planifiées via un tableau de bord dédié
7. THE Plateforme SHALL fournir des statistiques sur les demandes de démo : total, par statut, cette semaine, ce mois

### Exigence 15 : Tableaux de Bord par Rôle

**User Story :** En tant qu'utilisateur connecté, je veux un tableau de bord adapté à mon rôle, afin d'accéder rapidement aux informations et actions pertinentes.

#### Critères d'Acceptation

1. WHILE un utilisateur est connecté en tant qu'Admin (Formule_Full), THE Plateforme SHALL afficher un tableau de bord avec : nombre d'enseignants, nombre d'étudiants, nombre de lots actifs, quiz récents, taux de présence global et demandes de démo en attente
2. WHILE un utilisateur est connecté en tant qu'Enseignant, THE Plateforme SHALL afficher un tableau de bord avec : ses lots assignés, prochains cours, quiz en cours, taux de présence de ses lots et démos assignées
3. WHILE un utilisateur est connecté en tant qu'Étudiant, THE Plateforme SHALL afficher un tableau de bord avec : ses lots, prochains cours, quiz à passer, derniers résultats de quiz et taux de présence personnel
4. THE Plateforme SHALL adapter la navigation latérale en fonction du rôle de l'utilisateur connecté, affichant uniquement les menus autorisés
5. THE Plateforme SHALL afficher le branding du tenant (logo et nom) dans l'en-tête de navigation pour tous les rôles

### Exigence 16 : Profil Utilisateur et Paramètres

**User Story :** En tant qu'utilisateur, je veux pouvoir consulter et modifier mon profil, afin de maintenir mes informations à jour.

#### Critères d'Acceptation

1. THE Plateforme SHALL permettre à chaque utilisateur de consulter son profil : prénom, nom, email, nom d'utilisateur, rôle et date de création
2. THE Plateforme SHALL permettre à chaque utilisateur de modifier son prénom, nom et nom d'utilisateur
3. WHILE un utilisateur a le rôle Admin, THE Plateforme SHALL permettre la modification de l'email directement depuis le profil
4. WHILE un utilisateur a le rôle Enseignant ou Étudiant, THE Plateforme SHALL exiger une vérification par code OTP pour le changement d'email
5. THE Plateforme SHALL valider l'unicité du nom d'utilisateur et de l'email au sein du tenant lors de la modification du profil

### Exigence 17 : Paramètres Admin du Tenant

**User Story :** En tant qu'Admin d'un tenant, je veux configurer les paramètres de fonctionnement de mon école, afin d'adapter la plateforme à mes besoins.

#### Critères d'Acceptation

1. WHILE un tenant est en Formule_Full, THE Plateforme SHALL permettre à l'Admin de configurer les paramètres de présence : longueur du code d'accès, durée d'expiration du code, minutes de tolérance pour le démarrage anticipé, minutes de tolérance pour le retard et durée de fin automatique de session
2. THE Plateforme SHALL stocker les paramètres dans une table de configuration clé-valeur au sein du schéma du tenant
3. THE Plateforme SHALL appliquer des valeurs par défaut pour tous les paramètres lors de la création d'un nouveau tenant
4. WHEN l'Admin modifie un paramètre, THE Plateforme SHALL valider la valeur (type numérique, bornes min/max) avant de l'enregistrer

### Exigence 18 : Architecture Technique et Stack

**User Story :** En tant que développeur, je veux une architecture moderne et maintenable, afin de garantir la scalabilité et la qualité du code.

#### Critères d'Acceptation

1. THE Plateforme SHALL utiliser NestJS (TypeScript) comme framework backend avec une architecture modulaire (modules, contrôleurs, services, gardes)
2. THE Plateforme SHALL utiliser Prisma comme ORM avec support multi-schéma PostgreSQL pour l'isolation des tenants
3. THE Plateforme SHALL utiliser Next.js (React) comme framework frontend avec rendu côté serveur (SSR) pour le SEO et la résolution de tenant par sous-domaine
4. THE Plateforme SHALL utiliser Tailwind CSS et shadcn/ui comme bibliothèque de composants UI
5. THE Plateforme SHALL utiliser Redis pour la gestion des sessions, le cache des données fréquemment accédées et le rate limiting
6. THE Plateforme SHALL organiser le code en monorepo avec des dossiers séparés pour le backend, le frontend et les packages partagés (types, utilitaires)
7. THE Plateforme SHALL implémenter une validation des entrées sur toutes les routes API via les pipes de validation NestJS et class-validator
8. THE Plateforme SHALL implémenter une gestion centralisée des erreurs avec des codes d'erreur standardisés et des messages localisés en français et anglais

### Exigence 19 : Sécurité Renforcée

**User Story :** En tant que Super_Admin, je veux que la plateforme soit sécurisée selon les bonnes pratiques de l'industrie, afin de protéger les données des utilisateurs et renforcer la crédibilité de la plateforme.

#### Critères d'Acceptation

1. THE Plateforme SHALL chiffrer toutes les communications via HTTPS/TLS
2. THE Plateforme SHALL implémenter une protection CORS configurée par tenant, autorisant uniquement le sous-domaine du tenant
3. THE Plateforme SHALL implémenter un rate limiting global (100 requêtes par minute par IP) et renforcé sur les endpoints d'authentification (10 requêtes par minute par IP)
4. THE Plateforme SHALL utiliser des requêtes paramétrées exclusivement pour prévenir les injections SQL
5. THE Plateforme SHALL sanitiser toutes les entrées utilisateur pour prévenir les attaques XSS
6. THE Plateforme SHALL implémenter les en-têtes de sécurité HTTP : Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
7. THE Plateforme SHALL journaliser les événements de sécurité (connexions, échecs de connexion, modifications de rôle, accès non autorisés) dans un journal d'audit
8. THE Plateforme SHALL stocker les tokens de session dans des cookies HttpOnly, Secure et SameSite=Strict
9. IF une requête API contient un token JWT invalide ou expiré, THEN THE Plateforme SHALL retourner une erreur 401 avec un message explicatif sans révéler de détails d'implémentation

### Exigence 20 : Stockage de Fichiers et Médias

**User Story :** En tant qu'utilisateur, je veux que les fichiers téléversés soient stockés de manière sécurisée et accessible, afin de garantir la disponibilité des ressources pédagogiques.

#### Critères d'Acceptation

1. THE Plateforme SHALL stocker tous les fichiers téléversés (ressources pédagogiques, logos de tenants) dans un service de stockage objet compatible S3 (Cloudflare R2 ou AWS S3)
2. THE Plateforme SHALL organiser les fichiers par tenant dans le stockage objet avec un préfixe de chemin basé sur l'identifiant du tenant
3. THE Plateforme SHALL générer des URLs signées avec une durée de validité limitée pour l'accès aux fichiers
4. THE Plateforme SHALL valider le type MIME et la taille des fichiers avant le téléversement
5. WHEN un fichier est supprimé de la base de données, THE Plateforme SHALL supprimer le fichier correspondant du stockage objet
6. THE Plateforme SHALL limiter l'espace de stockage total par tenant en fonction de la formule d'abonnement

### Exigence 21 : Cache et Performance

**User Story :** En tant qu'utilisateur, je veux que la plateforme soit rapide et réactive, afin d'avoir une expérience utilisateur fluide.

#### Critères d'Acceptation

1. THE Plateforme SHALL utiliser Redis pour mettre en cache les données de branding des tenants avec une durée de vie de 1 heure
2. THE Plateforme SHALL utiliser Redis pour mettre en cache les résolutions de sous-domaine vers tenant avec une durée de vie de 5 minutes
3. THE Plateforme SHALL utiliser le rendu côté serveur (SSR) de Next.js pour les pages publiques (landing page, page de connexion) afin d'optimiser le SEO
4. THE Plateforme SHALL implémenter la pagination côté serveur pour toutes les listes (utilisateurs, lots, quiz, ressources, demandes de démo) avec un maximum de 50 éléments par page
5. THE Plateforme SHALL utiliser des index de base de données sur les colonnes fréquemment interrogées (clés étrangères, statuts, dates, rôles)
6. WHEN le branding d'un tenant est modifié, THE Plateforme SHALL invalider le cache Redis correspondant

### Exigence 22 : Tâches Planifiées et Automatisation

**User Story :** En tant que Super_Admin, je veux que certaines tâches soient exécutées automatiquement, afin de réduire la charge de travail manuelle.

#### Critères d'Acceptation

1. THE Plateforme SHALL exécuter une tâche planifiée toutes les 5 minutes pour terminer automatiquement les sessions de cours expirées et marquer les absences
2. THE Plateforme SHALL exécuter une tâche planifiée quotidienne pour envoyer les rappels de quiz aux étudiants dont les quiz expirent dans les 24 heures
3. THE Plateforme SHALL exécuter une tâche planifiée pour envoyer les rappels de cours 1 heure avant le début de chaque cours
4. THE Plateforme SHALL exécuter une tâche planifiée quotidienne pour vérifier les abonnements expirés et appliquer les périodes de grâce ou suspensions
5. THE Plateforme SHALL exécuter une tâche planifiée pour réconcilier les quiz en retard (marquer comme soumis les quiz dont la date limite est dépassée)
6. THE Plateforme SHALL journaliser l'exécution de chaque tâche planifiée avec le résultat (succès, erreur, nombre d'éléments traités)

### Exigence 23 : Internationalisation et Localisation

**User Story :** En tant qu'utilisateur francophone, je veux que l'interface soit disponible en français, afin de naviguer confortablement dans la plateforme.

#### Critères d'Acceptation

1. THE Plateforme SHALL fournir l'interface utilisateur en français par défaut
2. THE Plateforme SHALL supporter l'anglais comme langue secondaire
3. THE Plateforme SHALL permettre à chaque utilisateur de choisir sa langue préférée dans son profil
4. THE Plateforme SHALL utiliser un système d'internationalisation (i18n) basé sur des fichiers de traduction JSON pour le frontend
5. THE Plateforme SHALL localiser les formats de date, heure et nombres selon la locale de l'utilisateur
