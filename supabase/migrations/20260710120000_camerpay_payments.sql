-- Sprint — real payments via CamerPay (Cameroon aggregator, mobile money + cards).
-- The premium business logic (stacking, expiry, limits, gating) already lives in
-- the database and is provider-agnostic: grant_subscription() is the shared core
-- the dev stub used and that every real provider webhook now calls. CamerPay is
-- wired here without touching entitlements or gating — a second provider (Google
-- Play / App Store / Stripe) plugs into the exact same core later.
--
-- Money note: plans are priced in EUR (premium_plans.price_cents) but CamerPay
-- charges in XAF (FCFA). The EUR→XAF conversion happens in the edge function at
-- the fixed CFA franc (BEAC) peg; the charged XAF amount is stored per payment
-- below so the webhook can cross-check it against what CamerPay reports.

-- ============================================================
-- 1. Allow 'camerpay' as a subscription provider.
-- ============================================================
alter table public.subscriptions drop constraint subscriptions_provider_check;
alter table public.subscriptions add constraint subscriptions_provider_check
  check (provider in ('dev', 'moneroo', 'stripe', 'google', 'apple', 'admin', 'camerpay'));

-- ============================================================
-- 2. Payment attempts — one row per checkout, source of truth for the webhook.
--    Append/update only through service_role (the edge functions); members may
--    read their own rows so the app can poll a checkout to completion.
-- ============================================================
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null references public.premium_plans (key),
  provider text not null default 'camerpay',
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'canceled')),
  -- Our own reference sent to CamerPay as merchant_invoice_id (unique, idempotent).
  invoice_id text not null unique,
  -- CamerPay's transaction_uuid, returned by /initiate and echoed on the webhook.
  provider_uuid text unique,
  -- The provider-side transaction id reported on the confirmation webhook.
  provider_tx_id text,
  -- Charged amount as sent to CamerPay (integer XAF) and its source EUR cents.
  amount int not null check (amount >= 0),
  currency text not null default 'XAF',
  amount_source_cents int,
  subscription_id uuid references public.subscriptions (id),
  payment_method text,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_transactions_profile_idx
  on public.payment_transactions (profile_id, created_at desc);

alter table public.payment_transactions enable row level security;

-- Members poll their own checkout; every write goes through service_role.
create policy "Members read their own payments"
  on public.payment_transactions for select to authenticated
  using (auth.uid() = profile_id);

-- Explicit, in case default privileges ever drift: the edge functions write
-- as service_role (RLS-exempt) and need table DML.
grant select, insert, update on public.payment_transactions to service_role;

-- ============================================================
-- 3. Settlement — idempotent, provider-agnostic, called by the webhook only.
--    Verifies the amount, activates premium through the shared core, and marks
--    the payment completed in one locked step. A replayed webhook (CamerPay
--    retries up to 5x) returns the already-granted subscription without
--    double-charging premium time.
-- ============================================================
create or replace function public.settle_camerpay_payment(
  p_provider_uuid text,
  p_amount int,
  p_provider_tx_id text default null,
  p_payment_method text default null,
  p_paid_at timestamptz default null,
  p_raw jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payment_transactions;
  v_sub_id uuid;
begin
  select * into v_payment
    from public.payment_transactions
    where provider_uuid = p_provider_uuid
    for update;
  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  -- Idempotent replay: already settled, hand back the same subscription.
  if v_payment.status = 'completed' then
    return v_payment.subscription_id;
  end if;

  -- The signature already binds the amount, but a mismatch means the row and
  -- the confirmation disagree — refuse rather than grant on bad data.
  if v_payment.amount <> p_amount then
    raise exception 'AMOUNT_MISMATCH';
  end if;

  v_sub_id := public.grant_subscription(
    v_payment.profile_id, v_payment.plan_key, 'camerpay', p_provider_uuid
  );

  update public.payment_transactions
    set status = 'completed',
        subscription_id = v_sub_id,
        provider_tx_id = coalesce(p_provider_tx_id, provider_tx_id),
        payment_method = coalesce(p_payment_method, payment_method),
        paid_at = coalesce(p_paid_at, now()),
        raw = coalesce(p_raw, raw),
        updated_at = now()
    where id = v_payment.id;

  return v_sub_id;
end;
$$;

-- Webhook runs as service_role; nobody else may settle payments.
revoke execute on function
  public.settle_camerpay_payment(text, int, text, text, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function
  public.settle_camerpay_payment(text, int, text, text, timestamptz, jsonb)
  to service_role;

-- ============================================================
-- 4. Non-success closure — mark a payment failed/canceled (webhook only).
-- ============================================================
create or replace function public.fail_camerpay_payment(
  p_provider_uuid text,
  p_status text,
  p_raw jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('failed', 'canceled') then
    raise exception 'INVALID_STATUS';
  end if;
  update public.payment_transactions
    set status = p_status,
        raw = coalesce(p_raw, raw),
        updated_at = now()
    where provider_uuid = p_provider_uuid
      and status = 'pending';  -- never downgrade an already-completed payment
end;
$$;

revoke execute on function public.fail_camerpay_payment(text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.fail_camerpay_payment(text, text, jsonb)
  to service_role;
