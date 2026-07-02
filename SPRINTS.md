# AfriLove World — Plan de sprints vers la mise en ligne

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

## ✅ Sprint 4 — Monétisation, logique métier complète (terminé — paiement simulé)

- [x] Tables `premium_plans` (catalogue éditable dashboard) + `subscriptions` (historique, provider-agnostique)
- [x] Activation via `grant_subscription()` partagé : le stub dev l'appelle aujourd'hui, le webhook Moneroo/Stripe l'appellera demain (une seule ligne à révoquer pour couper le stub)
- [x] Contraintes réelles en BD : gratuit = 5 likes/jour, 0 super like ; premium = illimité + 5 super likes/jour (trigger inviolable)
- [x] Écran tarifs branché sur les plans BD, achat → succès/échec, prolongation si déjà premium
- [x] Limite quotidienne : vrai compte à rebours jusqu'à minuit, redirection auto quand la limite est atteinte
- [x] Favoris visibles dans l'onglet Matches : "Qui vous a aimé" (compteur réel, profils dévoilés si premium) + "Mes favoris" (mes likes en attente)
- [ ] Intégration Moneroo/Stripe réelle (VOTRE action : validation compte Google + clés Moneroo/Stripe)

## ✅ Sprint 5 — Production (terminé côté code — voir STORE_CHECKLIST.md)

- [x] OTA updates (expo-updates + runtimeVersion) : correctifs sans re-soumission stores
- [x] Sentry installé et initialisé (inerte tant que `EXPO_PUBLIC_SENTRY_DSN` absent — collez le DSN dans les secrets EAS)
- [x] Rate limiting BD anti-bots : messages (30/min) et signalements (10/jour) — likes déjà limités
- [x] Textes de permission iOS (localisation/caméra/photos) en français — exigés App Store
- [x] STORE_CHECKLIST.md : Data Safety pré-rempli, actions dashboard, assets, commandes build/submit
- [ ] VOS actions : captcha Turnstile (dashboard), texte légal final, logo branding, DSN Sentry, SMTP custom plus tard

## ⚪ Sprint 6 — Dashboard admin NestJS (chantier séparé, étape par étape)

- [ ] API NestJS (service_role) : KYC, bannissements, signalements, catalogues, légal
- [ ] La BD est déjà prête pour ça (statuts, RLS admin-only, tables versionnées)
