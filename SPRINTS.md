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

## 🔵 Sprint 1 — Modération réelle + boutons morts (EN COURS)

Objectif : plus aucun bouton visible qui ne fait rien ; exigences stores "dating".

- [ ] Tables `reports` + `blocks` (RLS), filtrage des bloqués dans recherche/conversations/messages
- [ ] Écran Signaler branché (envoi réel → confirmation)
- [ ] Écran Profils bloqués branché (liste réelle + déblocage)
- [ ] Bloquer depuis la conversation (menu long-press) ; Supprimer la conversation = unmatch réel
- [ ] Settings : changement de mot de passe et d'email fonctionnels
- [ ] Boutons sans fonction masqués ou reliés (audit écran par écran)

## 🟠 Sprint 2 — Premier build installable + retours à distance

Objectif : APK sur votre téléphone + lien d'installation partageable.

- [ ] `npx expo login` (VOTRE action — compte Expo requis, gratuit)
- [ ] `npx eas init` puis `npx eas build -p android --profile preview`
- [ ] Lien d'installation expo.dev partagé au testeur distant
- [ ] Corrections des retours du premier test réel
- [ ] Notifications in-app réelles (table + triggers match/message) ou écran masqué

## 🟡 Sprint 3 — Push + rétention

- [ ] Enregistrement des tokens Expo Push en BD
- [ ] Edge Function d'envoi (nouveau match, nouveau message) via triggers/webhooks
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
