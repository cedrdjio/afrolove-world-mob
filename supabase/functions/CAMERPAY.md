# Paiement CamerPay — déploiement

Intégration de l'agrégateur **CamerPay** (mobile money + cartes, XAF/FCFA) pour
les abonnements Premium. La logique métier (activation, cumul de durée, limites)
reste en base : le webhook appelle le cœur partagé `grant_subscription()`.

## Architecture

L'app collecte d'abord le **numéro Mobile Money** du payeur et **détecte
l'opérateur** (MTN 650-654/67x/68x, Orange 655-659/69x) avant d'appeler
`payment-initiate` — écran `PremiumCheckoutScreen`, validation dans
`src/modules/premium/payments/mobileMoney.ts`.

```
App ──(planKey, phone, paymentMethod)──▶ payment-initiate (Edge, JWT)
                     │  lit le prix en base, EUR→XAF, crée un payment_transactions,
                     │  appelle CamerPay /api/payment/initiate avec le token secret
                     │  (merchant_return_url = payment-return, http(s) OBLIGATOIRE)
                     ▼
                   CamerPay ──▶ renvoie pay_url ──▶ l'app ouvre la page (WebBrowser)
                     │
   (paiement du client sur la page hébergée CamerPay)
                     │
        ┌────────────┴─────────────────────────────┐
        ▼                                          ▼
CamerPay ──(redirect navigateur)──▶        CamerPay ──(callback signé HMAC)──▶
payment-return (Edge, PUBLIC)              payment-webhook (Edge, PUBLIC)
  │  renvoie vers le deep link                │  vérifie la signature,
  │  afrolove://premium/callback              │  settle_camerpay_payment()
  ▼                                           │  → grant_subscription()
L'app reprend la main                         ▼
  │                                        Premium actif
  └──(poll)──▶ payment-status (Edge, JWT)
                 │  re-vérifie chez CamerPay /api/payment/{uuid}/status
                 │  et règle la transaction via les mêmes RPC idempotents
                 ▼
              statut fiable même sans webhook configuré
```

Après la fermeture du navigateur, l'app **poll** `payment-status` (fallback :
lecture directe de `payment_transactions`, RLS lignes propres). Le règlement
(webhook ou status-check) est la source de vérité, jamais le client.

> ⚠️ `merchant_return_url` doit être une URL **http(s)** valide : CamerPay
> rejette un scheme d'app (`afrolove://…`) avec « Le champ merchant return url
> doit être une URL valide » et le paiement échoue dès l'initiation. C'est le
> rôle du pont `payment-return`.

## 1. Migration

```bash
supabase db push
# applique 20260710120000_camerpay_payments.sql
#   - table payment_transactions (+ RLS lecture propre)
#   - settle_camerpay_payment()  (idempotent, service_role)
#   - fail_camerpay_payment()    (service_role)
#   - autorise le provider 'camerpay' sur subscriptions
```

## 2. Secrets (jamais dans le code / le repo)

Les fonctions lisent chaque secret **d'abord dans Supabase Vault** (RPC
`get_app_secret`, réservé au service_role — migration
`app_secrets_vault_accessor`), puis en repli dans les variables
d'environnement. Le Vault permet de poser/tourner les clés en SQL, sans CLI :

```sql
select vault.create_secret('<token_api_camerpay>', 'CAMERPAY_API_TOKEN');
select vault.create_secret('<secret_webhook_camerpay>', 'CAMERPAY_WEBHOOK_SECRET');
```

Équivalent CLI (variables d'environnement classiques) :

```bash
# Token API CamerPay (sandbox fourni ; remplacer par le live en prod)
supabase secrets set CAMERPAY_API_TOKEN="<token_api_camerpay>"

# Secret webhook = celui défini sur le dashboard CamerPay (/client/api).
# Sert à vérifier la signature HMAC-SHA256 des callbacks. OBLIGATOIRE.
supabase secrets set CAMERPAY_WEBHOOK_SECRET="<secret_webhook_camerpay>"

# Optionnels :
#   CAMERPAY_BASE_URL    (défaut https://camerpay.biz)
#   CAMERPAY_RETURN_URL  (défaut https://<project-ref>.supabase.co/functions/v1/payment-return ;
#                         doit être http(s) — les schemes personnalisés sont
#                         rejetés par CamerPay et sont ignorés par le code)
#   APP_RETURN_SCHEME    (défaut afrolove://premium/callback — deep link vers
#                         lequel payment-return renvoie le navigateur)
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sont injectés
automatiquement par la plateforme — ne pas les définir.

## 3. Déploiement des fonctions

Le `verify_jwt` par fonction est déclaré dans `supabase/config.toml`
(`payment-webhook` = **false**, obligatoire car l'appelant est CamerPay).

```bash
supabase functions deploy payment-initiate
supabase functions deploy payment-webhook
supabase functions deploy payment-status
supabase functions deploy payment-return
# (si config.toml n'est pas pris en compte : ajouter --no-verify-jwt au webhook
#  et à payment-return)
```

## 4. Dashboard CamerPay

- **URL de callback** attendue par nos comptes :
  `https://<project-ref>.supabase.co/functions/v1/payment-webhook`
  (elle est aussi envoyée à chaque `initiate` via `merchant_callback_url`).
- Définir le **secret webhook** sur `/client/api` et le reporter dans
  `CAMERPAY_WEBHOOK_SECRET` ci-dessus (les deux doivent être identiques).

## Notes

- **Devise** : les plans sont en EUR (`premium_plans.price_cents`) ; la conversion
  EUR→XAF se fait au peg FCFA fixe (1 € = 655,957 FCFA) dans `payment-initiate`.
  Le montant XAF facturé est stocké par transaction et recroisé à la réception.
- **Signature** : HMAC-SHA256 de `transaction_uuid|invoice_id|status|amount`.
- **Idempotence** : CamerPay réessaie jusqu'à 5 fois ; `settle_camerpay_payment`
  ne réactive jamais deux fois (renvoie l'abonnement déjà accordé).
- **customer_phone** : non transmis (le payeur saisit son numéro mobile money
  sur la page CamerPay). À ajouter dans `payment-initiate` si l'API l'exige.
- **Fallback dev** : `purchase_subscription_dev` reste en base mais n'est plus
  appelé par l'app. Le retirer (revoke) quand CamerPay est validé en prod.
```
