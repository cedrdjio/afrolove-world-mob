# AfroLove World — Plan de sprints vers la mise en ligne

Suivi vivant : cocher au fur et à mesure. Un sprint = un lot livrable et testable.

## ✅ Sprint 0 — Fondations (terminé)

- [x] Auth complète (inscription, OTP, mot de passe oublié, liens expirés, anti-énumération)
- [x] BD : profils, photos, catalogues, swipes, matches, messages, KYC, légal, statut de compte (PostGIS, RLS, triggers)
- [x] Découverte réelle (RPC filtres + proximité + texte), swipe → match → célébration
- [x] Messagerie temps réel (Realtime, non-lus, marquage lu)
- [x] Profil réel (stats, complétion, badge vérifié), accès settings
- [x] KYC de bout en bout (upload privé, validation manuelle admin)
- [x] Localisation capturée + rafraîchie, bannissement/soft-delete avec voyant
- [x] CGU/Politique en BD + modale de consentement
- [x] Templates email brandés, eas.json, proguard/shrink

## ✅ Sprint 1 — Modération réelle + boutons morts (terminé)

- [x] Tables `reports` + `blocks` (RLS), filtrage des bloqués dans recherche/conversations/messages
- [x] Écran Signaler branché (envoi réel → confirmation)
- [x] Écran Profils bloqués branché (liste réelle + déblocage)
- [x] Bloquer depuis la conversation ; Supprimer la conversation = unmatch réel
- [x] Settings : changement de mot de passe et d'email fonctionnels
- [x] Défilement des photos de profil réparé (tap gauche/droite), like réel depuis le profil

## ✅ Sprint 2 — Notifications in-app réelles (terminé)

- [x] Table `notifications` alimentée par triggers (match ×2, message regroupé, like/super-like, KYC)
- [x] Écran Notifications branché (filtres, tap → conversation, tout lire)
- [x] Pastille cloche réelle sur Découvrir
- [x] Recherche de matches sur données réelles

## ✅ Sprint 3 — Push notifications (terminé)

- [x] Table `push_tokens` + enregistrement du token (onboarding + ouverture app)
- [x] Envoi automatique via pg_net → API Expo Push sur chaque notification (match, message, like, KYC)
- [x] Tap sur push → bonne conversation / statut KYC (y compris démarrage à froid)
- [x] Nettoyage des tokens à la déconnexion
- ⚠️ Testable uniquement en build EAS (pas Expo Go) — build preview à relancer

## 🟠 Sprint 3bis — Build installable + retours (VOTRE action)

- [ ] Relancer un build : `npx eas build -p android --profile preview` (ou via la GitHub Action)
- [ ] Lien d'installation expo.dev partagé au testeur distant
- [ ] Corrections des retours du premier test réel
- [ ] Préférences de notifications réelles (écran settings branché)

## 🟢 Sprint 4 — Monétisation

- [ ] Compte RevenueCat + produits IAP (VOTRE action : comptes Apple/Google développeur)
- [ ] SDK react-native-purchases + table `subscriptions` + webhook RevenueCat
- [ ] Gating réel : limite de likes quotidienne en BD, "qui vous a aimé", super likes, boost
- [ ] Écrans premium branchés sur les vrais achats

## 🟣 Sprint 5 — Production & stores

- [ ] SMTP custom (votre serveur mail + DNS) — templates déjà prêts
- [ ] Sentry (crashs) + analytics de base
- [ ] Captcha Turnstile sur l'inscription + rate limiting BD
- [ ] Texte légal final de l'avocat collé dans `legal_documents` (dashboard)
- [ ] Logo dans le bucket `branding`, protection mots de passe compromis (dashboard)
- [ ] Build production AAB + fiches stores (Data Safety, privacy manifest, 18+, screenshots)

## ⚪ Sprint 6 — Dashboard admin NestJS (chantier séparé, étape par étape)

- [ ] API NestJS (service_role) : KYC, bannissements, signalements, catalogues, légal
- [ ] La BD est déjà prête pour ça (statuts, RLS admin-only, tables versionnées)
