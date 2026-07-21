# Fiche Play Store — AfriLove World

Récapitulatif prêt-à-copier pour la mise en ligne sur Google Play.

---

## 1. Accès à l'appli (identifiants pour les examinateurs Google)

Google demande un compte de test car l'app est derrière une connexion. Le repo
contient déjà un jeu de comptes démo : `supabase/seed/demo_users.sql`.

**À faire une fois :** Supabase → SQL Editor → coller le contenu de
`supabase/seed/demo_users.sql` → Run. Cela crée 100 comptes connectables et
complets (onboarding fait, photos, ville, bio…).

**Compte à donner à Google :**

| Champ | Valeur |
|-------|--------|
| Nom de l'ensemble d'identifiants | `Reviewer account` |
| Nom d'utilisateur (email) | `demo001@demo.afrilove.app` |
| Mot de passe | `Demo!2026` |

### Rendre ce compte PREMIUM (pour cocher « accès complet au contenu payant »)

Après avoir lancé le seed, exécute ceci dans le SQL Editor pour donner 1 an de
premium au compte reviewer :

```sql
select public.grant_subscription(
  (select id from public.profiles where email = 'demo001@demo.afrilove.app'),
  'year_1y',
  'admin',
  'google-review'
);
```

### Texte à coller dans le champ « Toute autre information requise pour l'accès »
(⚠️ en anglais, comme l'exige Google)

```
Sign in with the demo account below (email + password, no 2FA, no biometrics):

  Email:    demo001@demo.afrilove.app
  Password: Demo!2026

This account has completed onboarding and has an active premium subscription,
so all features and paid content are unlocked. After signing in you land
directly on the discovery screen. Location access is optional — the app works
without granting it. No QR code, one-time code, membership or geo-restriction
is required.
```

Puis **coche** la case « Les informations de connexion fournies dans cette
déclaration donnent un accès complet à toutes les fonctionnalités et à tout le
contenu de cette appli, y compris le contenu premium ou payant ».

---

## 2. Questionnaire — Fiche Play Store (langue par défaut : Français – France)

### Nom de l'application (30 car. max)
```
AfriLove World
```

### Brève description (80 car. max)
```
Rencontres sérieuses pour la diaspora africaine, ici et partout dans le monde.
```

### Description complète (4000 car. max)
```
AfriLove World, c'est l'application de rencontres pensée pour la diaspora
africaine et tous ceux qui partagent cet amour de la culture — que vous soyez
à Douala, Dakar, Paris, Bruxelles, Montréal ou Londres.

Ici, les frontières ne comptent plus. Notre algorithme met en avant des profils
de votre pays d'origine comme de votre pays d'accueil, pour des rencontres qui
vous ressemblent vraiment.

POURQUOI AFRILOVE WORLD ?

• Rencontres par pays et diaspora — retrouvez des personnes de votre communauté,
  près de chez vous ou à l'autre bout du monde.
• Profils authentiques — badge « vérifié » pour les membres qui confirment leur
  identité, pour des échanges en confiance.
• Statut en ligne en temps réel — voyez qui est disponible pour discuter
  maintenant.
• Filtres précis — âge, distance, ville, pays, centres d'intérêt, langues,
  style de vie… trouvez exactement la personne que vous cherchez.
• Messagerie fluide et sécurisée — discutez, likez, enregistrez vos favoris.
• Une communauté bienveillante — modération et signalement pour une expérience
  saine et respectueuse.

COMMENT ÇA MARCHE ?

1. Créez votre profil en quelques minutes : prénom, photos, centres d'intérêt.
2. Parcourez les profils recommandés selon votre pays et vos préférences.
3. Likez ceux qui vous plaisent — en cas de match, lancez la conversation !

PREMIUM

Passez en illimité pour liker sans limite, envoyer des super likes et voir qui
vous a aimé. Plusieurs formules disponibles, de la journée à l'année.

Rejoignez AfriLove World et faites de belles rencontres, sans frontières. ❤️
```

---

## 3. Captures d'écran

**Format exigé par Google :** téléphone, min. 2 captures (idéalement 4 à 8),
PNG ou JPEG, entre 320 px et 3840 px de côté. Cible recommandée : **1080 x 1920**.

Comme cet environnement cloud ne peut pas joindre Supabase, les captures se
génèrent **sur ta machine** (le réseau y atteint la base) avec le script fourni :

```bash
# 1. seed la base (voir §1) pour avoir des profils à afficher
# 2. installe Playwright une fois
npm i -D playwright && npx playwright install chromium

# Terminal 1
npm run web            # sert l'app web sur http://localhost:8081

# Terminal 2
node scripts/playstore-screenshots.mjs
```

Les images sortent dans `./playstore-screenshots/` (découverte, matchs,
messages, profil, fiche détaillée). Sélectionne-en 4 à 8 pour la fiche.

> Astuce : les sélecteurs du script (placeholders « Adresse email », bouton
> « Se connecter ») correspondent à l'écran de login actuel. Si tu modifies ces
> libellés, ajuste-les dans le script.

---

## 4. Ordre de mise en ligne conseillé

1. Créer/compléter la fiche Play Store (ce doc, §2 + §3).
2. Renseigner « Accès à l'appli » (§1).
3. Uploader le **premier AAB à la main** (Play Console → Production → Créer une
   release) — Google l'exige pour la 1ʳᵉ version.
4. Ensuite, `eas submit --platform android --profile production` pour toutes les
   mises à jour suivantes (voir `eas.json`).
