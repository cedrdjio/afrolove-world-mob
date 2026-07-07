# Templates email Supabase Auth

Templates HTML brandés AfriLove World (fond crème, bouton dégradé brand,
logo distant). À coller manuellement dans le dashboard Supabase :

**Dashboard → Authentication → Emails (Templates)**

| Fichier | Template Supabase |
| --- | --- |
| `confirm-signup.html` | Confirm signup |
| `reset-password.html` | Reset password |
| `change-email.html` | Change email address |

> ⚠️ **Reset password** : le template affiche désormais le code `{{ .Token }}`
> en plus du lien. L'app mobile demande ce code (le lien navigateur ne
> ramenait pas dans l'app) — recollez impérativement la nouvelle version du
> template dans le dashboard, sinon les membres ne verront pas de code.

## Logo

Les templates pointent vers le bucket public `branding`. Le hero étant sombre
(dégradé lavande/aubergine), ils utilisent la variante sur fond sombre :

```
https://xhpwmondzarbnzciruis.supabase.co/storage/v1/object/public/branding/logo-fond-sombre.png
```

Variantes déjà disponibles dans le bucket (pour changer, remplacez le nom du
fichier dans l'URL des trois templates) :

| Fichier | Usage |
| --- | --- |
| `logo-fond-sombre.png` | Logo sur fond sombre — **utilisé ici** (hero sombre) |
| `logo-fond-lavande.png` | Logo sur fond lavande |
| `logo-fond-clair.png` | Logo sur fond clair |
| `logo-transparent.png` | Logo détouré (fond transparent) |
| `icone-app-cercle.png` | Icône de l'app, cercle |
| `icone-app-arrondie.png` | Icône de l'app, carré arrondi |

> Astuce : ces fichiers sont volumineux (700 Ko – 1 Mo). Pour un email, une
> version ~128×128 px allège nettement le chargement — optionnel.

## Objets d'email conseillés (champ "Subject")

- Confirm signup : `Bienvenue sur AfriLove World — confirmez votre email`
- Reset password : `Réinitialisation de votre mot de passe AfriLove World`
- Change email : `Confirmez votre nouvelle adresse email`

## SMTP

Le SMTP Supabase par défaut reste actif pour l'instant (limité à ~4 emails/h,
suffisant pour les tests). Quand le serveur mail sera prêt :
**Project Settings → Authentication → SMTP Settings** avec votre domaine —
les templates ci-dessus restent inchangés.
