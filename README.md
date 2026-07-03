<div align="center">

# 💜 AfriLove World

### L'amour sans frontières — l'application de rencontres de la communauté afro‑européenne

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white)](https://docs.expo.dev/versions/v57.0.0/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_·_RLS_·_Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![NativeWind](https://img.shields.io/badge/NativeWind-Tailwind_RN-06B6D4?logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)

*Découverte par proximité · Messagerie temps réel · KYC · Premium · Modération — le tout sur une base de données solide, ACID et prête pour un dashboard admin.*

</div>

---

## 📑 Sommaire

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Architecture du projet](#-architecture-du-projet)
- [Base de données](#-base-de-données-supabase)
- [Prérequis](#-prérequis)
- [Installation & démarrage](#-installation--démarrage)
- [Variables d'environnement](#-variables-denvironnement)
- [Scripts disponibles](#-scripts-disponibles)
- [Build & installation mobile](#-build--installation-mobile-eas)
- [Mises à jour OTA](#-mises-à-jour-ota)
- [Supabase — migrations & fonctions](#-supabase--migrations--edge-functions)
- [Design system](#-design-system--charte-graphique)
- [Tests & qualité](#-tests--qualité)
- [État d'avancement](#-état-davancement)
- [Actions manuelles restantes](#-actions-manuelles-restantes)

---

## 🌍 Présentation

**AfriLove World** est une application mobile de rencontres (iOS + Android, via Expo) destinée à la communauté afro‑européenne. Elle met l'accent sur des rencontres **sincères et vérifiées** : profils authentifiés par pièce d'identité (KYC), modération réelle, et mise en relation par proximité géographique.

Le projet suit un principe directeur : **toute la logique métier vit dans la base de données** (contraintes, triggers, RLS, RPC). L'application mobile — et le futur **dashboard admin (Angular + NestJS)** — consomment la même source de vérité. Un client ne peut jamais contourner une règle : les limites de likes, la création des matches, la vérification KYC, le bannissement et le gating premium sont tous appliqués côté Postgres.

---

## ✨ Fonctionnalités

| Domaine | Détail |
| --- | --- |
| **Authentification** | Email/mot de passe + OTP, mot de passe oublié, liens expirés gérés, anti‑énumération, Google OAuth (optionnel) |
| **Onboarding** | Carrousel liquid glass, prénom, genre, orientation, date de naissance (18+ imposé en BD), bio, intérêts, mode de vie, photos, permissions localisation & notifications |
| **Découverte** | Deck de cartes swipe (like / pass / super like) trié par **proximité PostGIS**, filtres âge/distance/vérifié + chips Tous/Nouveaux/En ligne, score de compatibilité par intérêts communs |
| **Matches & messagerie** | Match créé par trigger sur like mutuel · chat **temps réel** (Supabase Realtime) · non‑lus, marquage lu, indicateur en ligne |
| **Profil** | Stats réelles (likes reçus, matches, taux), complétion calculée, badge vérifié, galerie photos |
| **KYC** | Upload CNI recto/verso + selfie vers un bucket **privé chiffré**, validation manuelle admin, badge « Vérifié » automatique |
| **Premium** | Catalogue de plans en BD, achat (stub dev remplaçable par Moneroo/Stripe), limites réelles (5 likes/j gratuit), « Qui vous a aimé », favoris |
| **Modération** | Signalements, blocages effectifs (disparition de la découverte/recherche/messagerie), bannissement avec écran « voyant », soft‑delete |
| **Notifications** | Notifications in‑app (triggers) + **push** (Expo Push via `pg_net`) sur match, message, like, KYC |
| **Légal & RGPD** | CGU/Politique en BD éditables, modale de consentement à l'inscription |
| **Production** | Mises à jour OTA (expo‑updates), Sentry (inerte tant que non configuré), rate‑limiting anti‑bots |

---

## 🛠 Stack technique

**Frontend mobile**
- **Expo SDK 57** + **React Native 0.81** (New Architecture)
- **Expo Router** — navigation par fichiers (`app/`)
- **NativeWind** (Tailwind CSS pour RN) + **theme.ts** (tokens sémantiques)
- **React Native Reanimated** + **Worklets** — animations 60 FPS
- **expo-blur** (glassmorphism), **react-native-svg** (halos radiaux), **lottie-react-native** (animations)
- **TanStack Query** — cache & synchronisation serveur
- **Zustand** — état local léger (stores)
- **React Hook Form** + **Zod** — formulaires & validation
- **lucide-react-native** — icônes

**Backend (Supabase)**
- **PostgreSQL** + **PostGIS** (géolocalisation) + **pg_net** (push HTTP)
- **Row Level Security** sur toutes les tables
- **Edge Functions** (Deno) pour les uploads S3
- **Realtime** pour la messagerie
- **Storage** (buckets photos, KYC privé, branding public)

**Outillage**
- **TypeScript** strict · **Jest** · **EAS Build/Submit/Update** · **GitHub Actions**

---

## 📁 Architecture du projet

```
afrolove-world-mob/
├── app/                        # Routes Expo Router (une route = un fichier)
│   ├── (auth)/                 #   welcome, login, register, verify-email, reset…
│   ├── (onboarding)/           #   carousel, name, gender, birthday, bio, photos…
│   ├── (tabs)/                 #   discover, matches, messages, profile
│   ├── chat/[id]/              #   conversation + emoji picker
│   ├── kyc/ · premium/ · settings/ · reports/ · legal/ · system/
│   └── _layout.tsx             #   racine (providers, deep links, push, Sentry)
│
├── src/
│   ├── modules/                # Découpage par domaine métier
│   │   ├── auth/               #   screens · hooks · services · stores · types
│   │   ├── discovery/          #   deck, swipe, filtres
│   │   ├── matches/ · messaging/ · profile/ · kyc/ · premium/
│   │   ├── notifications/ · reports/ · blocked-users/ · legal/ · settings/
│   │   └── onboarding/ · system/
│   │       (chaque module : screens/ · components/ · hooks/ · services/ · stores/ · types/)
│   │
│   ├── shared/
│   │   ├── components/         # ui/ (GlassSurface, GradientButton, Chip, Avatar…)
│   │   │                       # layout/ (ScreenBackground, GlowOrb, BottomNavBar)
│   │   │                       # feedback/ (Loader, EmptyState, ErrorState…)
│   │   ├── constants/          # theme.ts (couleurs, dégradés, verre), images, lifestyle
│   │   ├── services/           # supabase/client.ts, queryClient, monitoring (Sentry)
│   │   ├── hooks/ · stores/ · utils/ · types/  (supabase.ts généré)
│   │   └── styles/             # global.css (Tailwind)
│   │
│   └── assets/                 # images/ (logo), lottie/ (3 animations)
│
├── supabase/
│   ├── migrations/             # 25 migrations SQL versionnées
│   ├── functions/              # upload-photo, upload-kyc (Edge Functions Deno)
│   └── templates/              # emails HTML brandés (confirm, reset, change-email)
│
├── app.json                    # config Expo (nom, icônes, permissions, OTA, plugins)
├── eas.json                    # profils de build (development / preview / production)
├── tailwind.config.js          # tokens couleurs & polices
├── SPRINTS.md                  # journal de développement par sprint
└── STORE_CHECKLIST.md          # checklist de soumission stores (Data Safety, etc.)
```

**Convention** : chaque écran est un composant dans `src/modules/<domaine>/screens/`, exposé par un fichier fin dans `app/`. La logique réseau vit dans `services/` (appels Supabase) et `hooks/` (TanStack Query / mutations). Aucun appel Supabase directement dans un écran.

---

## 🗄 Base de données (Supabase)

Tout est piloté par la base — l'app n'est qu'un client. Projet : `xhpwmondzarbnzciruis`.

### Tables principales

| Table | Rôle |
| --- | --- |
| `profiles` | 1 ligne/utilisateur · statut de compte, localisation (PostGIS), vérification, préférences |
| `profile_photos` · `profile_interests` · `profile_languages` | Photos & catalogues liés au profil |
| `interests` · `languages` · `religions` · `education_levels` · `relationship_goals` | Catalogues de référence (éditables dashboard) |
| `swipes` | Signal brut like/pass/super_like (unicité par paire) |
| `matches` | Créés **par trigger** sur like mutuel — jamais par le client |
| `messages` | 1 conversation/match · **Realtime** · lu/non‑lu |
| `kyc_submissions` | Dossiers d'identité + statut (pending/approved/rejected) |
| `reports` · `blocks` | Modération |
| `notifications` · `push_tokens` | Notifications in‑app + jetons Expo Push |
| `premium_plans` · `subscriptions` | Catalogue d'offres + historique d'abonnements |
| `legal_documents` | CGU / Politique (versionnées, éditables) |

### Fonctions RPC exposées (SECURITY DEFINER, colonnes filtrées)

`search_profiles` · `get_public_profile` · `get_my_profile_stats` · `get_my_conversations` · `mark_messages_read` · `get_my_entitlements` · `get_my_favorites` · `get_my_likers` · `has_active_premium` · `purchase_subscription_dev` · `get_my_blocked_profiles` · `is_blocked_between`

### Règles appliquées côté BD (inviolables)

- **Matches** créés/dissous par trigger sur les swipes réciproques
- **Limites** : 5 likes/jour et 0 super like en gratuit ; illimité + 5 super likes/jour en premium
- **Anti‑abus** : 30 messages/min, 10 signalements/jour
- **KYC** : le passage à `approved` bascule `profiles.is_verified` via trigger
- **Bannissement** : un utilisateur ne peut jamais lever son propre bannissement
- **Confidentialité** : `privacy_prefs` respectées dans les RPC (visibilité, distance, âge, en ligne)

---

## ✅ Prérequis

- **Node.js** ≥ 20 et **npm**
- **Expo CLI** (via `npx`, rien à installer globalement)
- Un compte **Expo** (gratuit) pour les builds EAS
- **Android SDK / Xcode** uniquement si vous compilez en local (facultatif — EAS compile dans le cloud)
- Accès au projet **Supabase** (pour les migrations/fonctions)

---

## 🚀 Installation & démarrage

```bash
# 1. Cloner et installer
git clone https://github.com/cedrdjio/afrolove-world-mob.git
cd afrolove-world-mob
npm install

# 2. Configurer l'environnement (voir section suivante)
cp .env.example .env   # puis renseigner les valeurs

# 3. Lancer le serveur de développement
npm start
```

> ⚠️ **Expo Go ne suffit pas.** Ce projet utilise des modules natifs (blur, notifications push, secure store, image manipulator…). Pour tester sur téléphone, il faut un **development build** ou un **build preview** (voir [Build & installation](#-build--installation-mobile-eas)). Les **push notifications** en particulier ne fonctionnent **que** dans un vrai build, jamais dans Expo Go.

---

## 🔐 Variables d'environnement

Fichier `.env` à la racine (préfixe `EXPO_PUBLIC_` = exposé au client) :

```ini
# Supabase (obligatoire) — valeurs par défaut déjà dans le code
EXPO_PUBLIC_SUPABASE_URL=https://xhpwmondzarbnzciruis.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Google OAuth (optionnel — active le bouton "Continuer avec Google")
EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID=...

# Sentry (optionnel — crash reporting, inerte si absent)
EXPO_PUBLIC_SENTRY_DSN=
```

**Secrets serveur** (jamais dans le client, définis via `supabase secrets set`) :
`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` — utilisés par les Edge Functions d'upload.

---

## 📜 Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm start` | Démarre le serveur de développement Expo (Metro) |
| `npm run android` | Compile et lance sur un émulateur/appareil Android (local) |
| `npm run ios` | Compile et lance sur simulateur iOS (macOS) |
| `npm run web` | Version web (support partiel) |
| `npm run typecheck` | Vérifie le typage TypeScript (`tsc --noEmit`) |
| `npm test` | Lance la suite de tests Jest |
| `npm run test:watch` | Tests en mode watch |

---

## 📦 Build & installation mobile (EAS)

Les builds sont produits dans le cloud par **EAS Build** (aucun toolchain local requis). Profils définis dans `eas.json` :

| Profil | Sortie | Usage |
| --- | --- | --- |
| `development` | APK + dev client | Débogage avec rechargement |
| `preview` | APK | **Test interne** — installable directement, lien partageable |
| `production` | AAB | Soumission Google Play |

```bash
# Connexion (une fois)
npx eas login

# Build de test Android (APK partageable)
npx eas build --platform android --profile preview

# Build de production (AAB pour le Play Store)
npx eas build --platform android --profile production

# Soumission automatique au store
npx eas submit --platform android
```

### Installer sur un téléphone en USB

```bash
# Le téléphone doit avoir le "Débogage USB" activé
adb devices                          # vérifier qu'il est détecté
adb install chemin/vers/afrilove.apk # installer l'APK téléchargé depuis EAS
```

> À la fin d'un build EAS, un **lien de téléchargement** apparaît sur [expo.dev](https://expo.dev) — il peut être envoyé à n'importe quel testeur pour installation directe.

---

## 🔄 Mises à jour OTA

Grâce à `expo-updates`, les correctifs **JavaScript** (pas les modules natifs) partent en un instant sans repasser par les stores :

```bash
npx eas update --channel preview     --message "fix: …"   # canal de test
npx eas update --channel production  --message "fix: …"   # production
```

Les canaux `preview` / `production` sont reliés aux profils de build correspondants.

---

## 🧩 Supabase — migrations & Edge Functions

### Migrations

25 migrations versionnées dans `supabase/migrations/`, appliquées dans l'ordre chronologique. Elles couvrent : profils, catalogues, photos, swipes/matches, messagerie, KYC, modération, notifications, push, premium, légal, et deux passes d'optimisation/sécurité.

```bash
# Appliquer les migrations (CLI Supabase liée au projet)
supabase db push
```

### Edge Functions (Deno)

| Fonction | Rôle |
| --- | --- |
| `upload-photo` | Upload de photo de profil via protocole S3 (contourne les aléas RLS de storage) |
| `upload-kyc` | Upload chiffré des documents d'identité vers le bucket privé |

```bash
supabase functions deploy upload-photo
supabase functions deploy upload-kyc
```

### Réglages manuels dashboard

- **Auth → Emails** : coller les 3 templates de `supabase/templates/`
- **Auth → Passwords** : longueur min 8 + protection HaveIBeenPwned
- **Auth → Attack protection** : activer le captcha Turnstile
- **Storage → branding** : déposer `logo.png` (utilisé par les emails)

---

## 🎨 Design system & charte graphique

Identité **AfriLove World v1.0** — lavande chaleureuse, glassmorphism, Fluent Design.

| Token | Valeur | Usage |
| --- | --- | --- |
| Lavande | `#9B7EDE` | Couleur maîtresse |
| Violet profond | `#6A4FC0` | Boutons, liens, actions |
| Lilas | `#C3B1E1` | Illustrations, badges |
| Brume | `#E9E2F5` | Fonds, sections |
| Blanc lavande | `#FAF8FD` | Fond principal |
| Aubergine | `#2E2440` | Texte, fond sombre |
| Dégradé signature | `#8B69D6 → #5B3E9E` | CTA, héros |
| Verre | blanc 45 % · flou 24 px | Cartes, panneaux |

- **Typographies** : *Plus Jakarta Sans* (titres/logo, ExtraBold) + *Nunito* (texte courant)
- **Composants** centralisés dans `src/shared/components/ui/` — tout est thémé par `theme.ts` + `tailwind.config.js`, ce qui permet de rebrander sans toucher aux écrans
- **Animations** : halos radiaux SVG animés, Lottie (loader cœur, état vide, succès), transitions spring, entrées échelonnées, retours haptiques
- Charte complète : voir les fichiers HTML fournis + `src/shared/constants/theme.ts`

---

## 🧪 Tests & qualité

```bash
npm run typecheck   # 0 erreur TypeScript attendue
npm test            # suite Jest
```

- Tests unitaires sur le mapping d'erreurs et le client Supabase (timeout, refresh…)
- Le typage strict couvre l'ensemble du schéma BD via `src/shared/types/supabase.ts` (généré)
- CI GitHub Actions pour les builds EAS

---

## 📊 État d'avancement

Le détail sprint par sprint est dans **[SPRINTS.md](SPRINTS.md)**. Résumé :

| Lot | État |
| --- | --- |
| Fondations (auth, onboarding, BD, découverte, profil, KYC) | ✅ |
| Messagerie temps réel + matches | ✅ |
| Modération réelle (reports, blocks) | ✅ |
| Notifications in‑app + push | ✅ |
| Premium — logique métier complète (paiement simulé) | ✅ |
| Production (OTA, Sentry, anti‑abus, checklist stores) | ✅ |
| Rebrand lavande / glassmorphism / Lottie | ✅ |
| **Intégration paiement réelle (Moneroo/Stripe)** | ⏳ en attente des clés |
| **Dashboard admin (Angular + NestJS)** | ⏳ repo séparé à venir |

---

## 📋 Actions manuelles restantes

Ces éléments dépendent de comptes/clés externes (voir **[STORE_CHECKLIST.md](STORE_CHECKLIST.md)**) :

- [ ] Compte **Google Play Console** validé + fiche Data Safety
- [ ] Compte **RevenueCat / Moneroo / Stripe** → webhook de paiement (l'architecture l'attend, une ligne de `revoke` coupe le stub dev)
- [ ] Projet **Sentry** → `EXPO_PUBLIC_SENTRY_DSN` dans les secrets EAS + re‑ajout du plugin
- [ ] **SMTP custom** (serveur mail + DNS) — templates déjà prêts
- [ ] Texte légal **final** de l'avocat collé dans `legal_documents`
- [ ] **Logo** déposé dans le bucket `branding`
- [ ] Réglages dashboard : captcha Turnstile, protection mots de passe compromis

---

<div align="center">

**AfriLove World** — *Des rencontres sincères, des valeurs partagées.*

Développé avec 💜 · Charte graphique v1.0 · juillet 2026

</div>
