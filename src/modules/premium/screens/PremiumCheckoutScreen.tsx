import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wallet,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { usePremiumPlans, usePurchasePlan } from '@/modules/premium/hooks/usePremium';
import { detectOperator, normalizeCmPhone } from '@/modules/premium/payments/mobileMoney';
import type { CheckoutMethod } from '@/modules/premium/payments';
import { colors } from '@/shared/constants/theme';

// Peg FCFA fixe — miroir de l'edge function, pour afficher le montant réel.
const EUR_TO_XAF = 655.957;

type MethodChoice = 'momo' | 'stripe' | 'paypal';

const METHOD_OPTIONS: { key: MethodChoice; label: string; sublabel: string; Icon: LucideIcon }[] = [
  { key: 'momo', label: 'Mobile Money', sublabel: 'MTN MoMo · Orange Money', Icon: Smartphone },
  { key: 'stripe', label: 'Carte bancaire', sublabel: 'Visa · Mastercard', Icon: CreditCard },
  { key: 'paypal', label: 'PayPal', sublabel: 'Compte PayPal', Icon: Wallet },
];

/** Choix de la méthode (Mobile Money, carte via Stripe, PayPal), saisie du
 *  numéro pour le mobile money, puis lancement du paiement CamerPay.
 *  Route ensuite vers succès / échec. */
export function PremiumCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string; label?: string }>();
  const planKey = params.plan ?? '';
  const plansQuery = usePremiumPlans();
  const purchase = usePurchasePlan();
  const purchaseError = useAppError(purchase.error);

  const [method, setMethod] = useState<MethodChoice>('momo');
  const [phone, setPhone] = useState('');

  const plan = useMemo(
    () => (plansQuery.data ?? []).find((p) => p.key === planKey) ?? null,
    [plansQuery.data, planKey],
  );
  const planLabel = plan?.label ?? params.label ?? 'Premium';
  const amountXaf = plan ? Math.round((plan.priceCents / 100) * EUR_TO_XAF) : null;
  const operator = detectOperator(phone);
  const digits = normalizeCmPhone(phone);
  const showPhoneError = method === 'momo' && digits.length >= 9 && !operator;
  const canPay = !!plan && !purchase.isPending && (method !== 'momo' || !!operator);

  const handlePay = () => {
    if (!plan || purchase.isPending) return;
    let paymentMethod: CheckoutMethod;
    let momoPhone: string | undefined;
    if (method === 'momo') {
      if (!operator) return;
      paymentMethod = operator.paymentMethod;
      momoPhone = normalizeCmPhone(phone);
    } else {
      paymentMethod = method;
    }
    purchase.mutate(
      { planKey: plan.key, paymentMethod, phone: momoPhone },
      {
        onSuccess: (result) => {
          if (result.outcome === 'succeeded') {
            router.replace({ pathname: '/premium/success', params: { plan: planLabel } });
          } else if (result.outcome === 'pending') {
            Alert.alert(
              'Paiement en cours',
              'Finalisez le paiement puis revenez dans l’app. Votre accès Premium s’activera dès confirmation.',
              [{ text: 'OK', onPress: () => router.replace('/(tabs)/discover') }],
            );
          } else if (result.outcome === 'failed') {
            router.replace('/premium/failed');
          }
          // 'canceled' → l'utilisateur a annulé, on reste sur l'écran.
        },
        onError: () => router.replace('/premium/failed'),
      },
    );
  };

  const formatXaf = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ');

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center">
            <IconButton variant="dark" onPress={() => router.back()}>
              <ArrowLeft size={19} color="#fff" strokeWidth={2} />
            </IconButton>
          </View>

          <View className="mt-6 mb-7">
            <Text className="mb-1 font-display text-[26px] text-white">Paiement</Text>
            <Text className="font-body text-[13px] leading-[19px] text-white/55">
              Forfait {planLabel}
              {amountXaf != null ? ` · ${formatXaf(amountXaf)} FCFA` : ''}
            </Text>
          </View>

          {/* Récapitulatif du montant */}
          <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-white/[0.14] bg-white/[0.07] px-4 py-4">
            <Text className="font-body text-[13px] text-white/70">Montant à payer</Text>
            <Text className="font-display text-[22px] text-white">
              {amountXaf != null ? `${formatXaf(amountXaf)} FCFA` : '—'}
            </Text>
          </View>

          {/* Choix de la méthode */}
          <Text className="mb-2 font-heading-semibold text-[11.5px] text-white/50">
            Méthode de paiement
          </Text>
          <View className="mb-5 gap-2.5">
            {METHOD_OPTIONS.map(({ key, label, sublabel, Icon }) => {
              const selected = method === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setMethod(key)}
                  className="flex-row items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5"
                  style={{
                    borderColor: selected ? colors.gold.DEFAULT : 'rgba(255,255,255,0.14)',
                    backgroundColor: selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: selected ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.08)' }}
                  >
                    <Icon size={18} color={selected ? colors.gold.DEFAULT : 'rgba(255,255,255,0.6)'} strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-heading text-[13.5px] text-white">{label}</Text>
                    <Text className="font-body text-[11.5px] text-white/45">{sublabel}</Text>
                  </View>
                  {selected ? (
                    <CheckCircle2 size={18} color={colors.gold.DEFAULT} strokeWidth={2.4} />
                  ) : (
                    <View className="h-[18px] w-[18px] rounded-full border-[1.5px] border-white/25" />
                  )}
                </Pressable>
              );
            })}
          </View>

          {method === 'momo' ? (
            <>
              {/* Champ numéro */}
              <Text className="mb-2 font-heading-semibold text-[11.5px] text-white/50">
                Numéro Mobile Money
              </Text>
              <View
                className="flex-row items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5"
                style={{
                  borderColor: showPhoneError
                    ? 'rgba(194,69,69,0.55)'
                    : operator
                      ? colors.gold.DEFAULT
                      : 'rgba(255,255,255,0.16)',
                  backgroundColor: 'rgba(255,255,255,0.07)',
                }}
              >
                <Text className="font-body text-[14px] text-white/45">+237</Text>
                <Smartphone size={16} color="rgba(255,255,255,0.4)" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="6 XX XX XX XX"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  keyboardType="phone-pad"
                  maxLength={17}
                  className="flex-1 font-body text-[15px] text-white"
                />
                {operator ? <CheckCircle2 size={18} color={colors.gold.DEFAULT} strokeWidth={2.4} /> : null}
              </View>

              {/* Opérateur détecté / erreur */}
              {operator ? (
                <View className="mt-2 flex-row items-center gap-1.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <Text className="font-body-medium text-[12px] text-gold">
                    {operator.label} détecté
                  </Text>
                </View>
              ) : showPhoneError ? (
                <Text className="mt-2 font-body text-[12px] text-danger">
                  Numéro invalide. Utilisez un numéro MTN (650-654, 67x, 68x) ou Orange (655-659, 69x).
                </Text>
              ) : (
                <Text className="mt-2 font-body text-[12px] text-white/35">
                  Vous validerez le paiement sur votre téléphone.
                </Text>
              )}
            </>
          ) : (
            <Text className="font-body text-[12px] leading-[18px] text-white/40">
              {method === 'stripe'
                ? 'Vous saisirez votre carte sur la page de paiement sécurisée CamerPay (Visa, Mastercard).'
                : 'Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité.'}
            </Text>
          )}

          {purchaseError ? (
            <View className="mt-4">
              <ErrorState error={purchaseError} variant="inline" tone="onDark" />
            </View>
          ) : null}

          <View className="flex-1" style={{ minHeight: 24 }} />

          {/* Sécurité + CTA */}
          <View className="mb-3 flex-row items-center justify-center gap-1.5">
            <ShieldCheck size={13} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            <Text className="font-body text-[11px] text-white/40">
              Paiement sécurisé via CamerPay
            </Text>
          </View>

          {purchase.isPending ? (
            <View className="items-center rounded-2xl bg-white/[0.08] py-4">
              <ActivityIndicator color={colors.gold.DEFAULT} />
              <Text className="mt-2 font-body text-[12px] text-white/55">
                Suivez les instructions de paiement…
              </Text>
            </View>
          ) : (
            <GradientButton
              label={
                amountXaf != null ? `Payer ${formatXaf(amountXaf)} FCFA` : 'Payer'
              }
              disabled={!canPay}
              onPress={handlePay}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
