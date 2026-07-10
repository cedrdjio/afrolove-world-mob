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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { usePremiumPlans, usePurchasePlan } from '@/modules/premium/hooks/usePremium';
import { detectOperator, normalizeCmPhone } from '@/modules/premium/payments/mobileMoney';
import { colors } from '@/shared/constants/theme';

// Peg FCFA fixe — miroir de l'edge function, pour afficher le montant réel.
const EUR_TO_XAF = 655.957;

/** Saisie du numéro Mobile Money, validation de l'opérateur, puis lancement
 *  du paiement CamerPay. Route ensuite vers succès / échec. */
export function PremiumCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ plan?: string; label?: string }>();
  const planKey = params.plan ?? '';
  const plansQuery = usePremiumPlans();
  const purchase = usePurchasePlan();
  const purchaseError = useAppError(purchase.error);

  const [phone, setPhone] = useState('');

  const plan = useMemo(
    () => (plansQuery.data ?? []).find((p) => p.key === planKey) ?? null,
    [plansQuery.data, planKey],
  );
  const planLabel = plan?.label ?? params.label ?? 'Premium';
  const amountXaf = plan ? Math.round((plan.priceCents / 100) * EUR_TO_XAF) : null;
  const operator = detectOperator(phone);
  const digits = normalizeCmPhone(phone);
  const showError = digits.length >= 9 && !operator;
  const canPay = !!operator && !!plan && !purchase.isPending;

  const handlePay = () => {
    if (!operator || !plan || purchase.isPending) return;
    purchase.mutate(
      { planKey: plan.key, phone: normalizeCmPhone(phone), paymentMethod: operator.paymentMethod },
      {
        onSuccess: (result) => {
          if (result.outcome === 'succeeded') {
            router.replace({ pathname: '/premium/success', params: { plan: planLabel } });
          } else if (result.outcome === 'pending') {
            Alert.alert(
              'Paiement en cours',
              'Validez le paiement sur votre téléphone. Votre accès Premium s’activera dès confirmation.',
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

  const formatXaf = (n: number) => n.toLocaleString('fr-FR').replace(/ /g, ' ');

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6" style={{ paddingTop: 60, paddingBottom: 28 }}>
          <View className="flex-row items-center">
            <IconButton variant="dark" onPress={() => router.back()}>
              <ArrowLeft size={19} color="#fff" strokeWidth={2} />
            </IconButton>
          </View>

          <View className="mt-6 mb-8">
            <Text className="mb-1 font-display text-[26px] text-white">Paiement Mobile Money</Text>
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

          {/* Champ numéro */}
          <Text className="mb-2 font-heading-semibold text-[11.5px] text-white/50">
            Numéro Mobile Money
          </Text>
          <View
            className="flex-row items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5"
            style={{
              borderColor: showError
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
              autoFocus
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
          ) : showError ? (
            <Text className="mt-2 font-body text-[12px] text-danger">
              Numéro invalide. Utilisez un numéro MTN (650-654, 67x, 68x) ou Orange (655-659, 69x).
            </Text>
          ) : (
            <Text className="mt-2 font-body text-[12px] text-white/35">
              MTN Mobile Money ou Orange Money.
            </Text>
          )}

          {purchaseError ? (
            <View className="mt-4">
              <ErrorState error={purchaseError} variant="inline" tone="onDark" />
            </View>
          ) : null}

          <View className="flex-1" />

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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
