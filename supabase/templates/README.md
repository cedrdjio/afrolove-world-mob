# Templates email Supabase Auth

Templates HTML brandés AfroLove World (fond crème, bouton dégradé brand,
logo distant). À coller manuellement dans le dashboard Supabase :

**Dashboard → Authentication → Emails (Templates)**

| Fichier | Template Supabase |
| --- | --- |
| `confirm-signup.html` | Confirm signup |
| `reset-password.html` | Reset password |
| `change-email.html` | Change email address |

## Logo

Les templates pointent vers le bucket public `branding` :

```
https://xhpwmondzarbnzciruis.supabase.co/storage/v1/object/public/branding/logo.png
```

Uploadez votre logo (PNG carré, idéalement 112×112 px pour le retina) dans
**Storage → branding → logo.png**. Tant que le fichier n'existe pas, les
clients email affichent le texte alternatif « AfroLove World ».
Si vous passez plus tard par un CDN, remplacez simplement l'URL de l'image
dans les trois fichiers avant de les recoller dans le dashboard.

## Objets d'email conseillés (champ "Subject")

- Confirm signup : `Bienvenue sur AfroLove World — confirmez votre email`
- Reset password : `Réinitialisation de votre mot de passe AfroLove World`
- Change email : `Confirmez votre nouvelle adresse email`

## SMTP

Le SMTP Supabase par défaut reste actif pour l'instant (limité à ~4 emails/h,
suffisant pour les tests). Quand le serveur mail sera prêt :
**Project Settings → Authentication → SMTP Settings** avec votre domaine —
les templates ci-dessus restent inchangés.
