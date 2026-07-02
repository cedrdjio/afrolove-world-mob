# Checklist de soumission stores — AfriLove World

App de rencontre = catégorie sensible : les stores vérifient ces points à la main.

## Déjà en place dans l'app ✅

- Signalement fonctionnel (obligatoire dating) — table `reports`
- Blocage effectif partout (découverte, recherche, messages) — table `blocks`
- Suppression de compte **depuis l'app** (obligatoire Apple 5.1.1(v)) — soft delete
- CGU + Politique de confidentialité affichées et acceptées à l'inscription
- Âge minimum 18 ans imposé en BD (contrainte `birth_date`)
- Textes de permission iOS (localisation, caméra, photos) en français
- Rate limiting anti-bots (likes, messages, signalements) en BD
- OTA updates (expo-updates) : corrections sans repasser par les stores
- Sentry prêt (inerte tant que `EXPO_PUBLIC_SENTRY_DSN` n'est pas défini)

## Actions à faire par vous avant soumission

### Comptes & clés
- [ ] Compte Google Play Console validé (en cours) — 25$ une fois
- [ ] Compte Apple Developer si iOS — 99$/an
- [ ] Projet Sentry (sentry.io, gratuit) → mettre le DSN dans les secrets EAS :
      `npx eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value <dsn>` (ou dashboard expo.dev)
- [ ] Clés Moneroo/Stripe → intégration webhook (voir SPRINTS.md Sprint 4)

### Dashboard Supabase (5 minutes)
- [ ] Authentication → Passwords : longueur min 8 + protection HaveIBeenPwned
- [ ] Authentication → Attack protection : activer le captcha Turnstile (clés Cloudflare gratuites)
- [ ] Storage → branding : uploader `logo.png` (utilisé par les emails)
- [ ] Table `legal_documents` : coller les textes finaux de l'avocat
- [ ] Authentication → Emails : coller les 3 templates de `supabase/templates/`

### Google Play — fiche Data Safety (réponses préparées)
- Localisation approximative + précise : collectée, non partagée, finalité "fonctionnalité de l'app"
- Photos : collectées, non partagées, finalité "fonctionnalité"
- Infos personnelles (nom, email, date de naissance, orientation) : collectées, non partagées
- Documents d'identité (KYC) : collectés, non partagés, supprimés après vérification
- Messages : collectés, non partagés
- Données chiffrées en transit : OUI · Suppression demandable : OUI (in-app)
- Classification du contenu : **18+ (Adultes uniquement / Mature 17+)**
- Catégorie : Rencontres

### App Store (si iOS)
- App Privacy : mêmes réponses que Data Safety
- Age rating : 17+
- Compte de démonstration pour la review (email+mot de passe d'un compte
  test avec profil complété) — exigé pour les apps à inscription

### Assets fiches
- [ ] 6-8 captures d'écran téléphone (1080×1920 min) : Découvrir, profil, match, chat, KYC, premium
- [ ] Icône 512×512 (Play) / 1024×1024 (App Store)
- [ ] Bannière "feature graphic" 1024×500 (Play)
- [ ] Description FR courte (80 car.) + longue (4000 car.)

## Build de production

```
npx eas build -p android --profile production   # AAB signé pour Play Store
npx eas submit -p android                        # envoi direct sur la console
```

Après le lancement, les correctifs JS partent en OTA sans re-soumission :
```
npx eas update --channel production --message "fix: …"
```
