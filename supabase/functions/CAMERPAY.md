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
                     ▼
                   CamerPay ──▶ renvoie pay_url ──▶ l'app ouvre la page (WebBrowser)
                     │
   (paiement du client sur la page hébergée CamerPay)
                     │
                     ▼
                   CamerPay ──(callback signé HMAC)──▶ payment-webhook (Edge, PUBLIC)
                                                          │  vérifie la signature,
                                                          │  settle_camerpay_payment()
                                                          │  → grant_subscription()
                                                          ▼
                                                        Premium actif
```

L'app **poll** `payment_transactions.status` (RLS : lignes propres) après la
fermeture du navigateur : le webhook est la source de vérité, jamais le client.

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

```bash
# Token API CamerPay (sandbox fourni ; remplacer par le live en prod)
supabase secrets set CAMERPAY_API_TOKEN="<token_api_camerpay>"

# Secret webhook = celui défini sur le dashboard CamerPay (/client/api).
# Sert à vérifier la signature HMAC-SHA256 des callbacks. OBLIGATOIRE.
supabase secrets set CAMERPAY_WEBHOOK_SECRET="<secret_webhook_camerpay>"

# Optionnels :
#   CAMERPAY_BASE_URL    (défaut https://camerpay.biz)
#   CAMERPAY_RETURN_URL  (défaut afrolove://premium/callback — mettre une URL
#                         https si CamerPay refuse les schemes personnalisés)
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` sont injectés
automatiquement par la plateforme — ne pas les définir.

## 3. Déploiement des fonctions

Le `verify_jwt` par fonction est déclaré dans `supabase/config.toml`
(`payment-webhook` = **false**, obligatoire car l'appelant est CamerPay).

```bash
supabase functions deploy payment-initiate
supabase functions deploy payment-webhook
# (si config.toml n'est pas pris en compte : ajouter --no-verify-jwt au webhook)
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
