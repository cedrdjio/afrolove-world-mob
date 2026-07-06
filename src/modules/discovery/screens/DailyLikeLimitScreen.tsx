import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock, Heart, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { gradients } from '@/shared/constants/theme';

/** The DB limit resets at local midnight (date_trunc('day') in the swipe
 *  guard trigger) — show the real time remaining, not a hardcoded value. */
function timeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const minutes = Math.max(1, Math.round((midnight.getTime() - now.getTime()) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}min` : `${m} min`;
}

/** Écran de plafond gratuit — swipes du jour épuisés ou favoris pleins.
 *  Dans les deux cas la sortie est la même : prendre un forfait. */
export function DailyLikeLimitScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const isFavorites = reason === 'favorites';

  return (
    <View className="flex-1">
      <ScreenBackground theme="deep">
        <GlowOrb size={260} color="rgba(106,79,192,0.2)" bottom={140} right={-40} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 items-center justify-center px-8">
        <Pressable onPress={() => router.back()} className="absolute right-6 top-16">
          <View className="h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/[0.12]">
            <X size={16} color="rgba(255,255,255,0.55)" />
          </View>
        </Pressable>

        <LinearGradient
          colors={gradients.brand}
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            shadowColor: '#6A4FC0',
            shadowOpacity: 0.4,
            shadowRadius: 26,
            shadowOffset: { width: 0, height: 12 },
          }}
        >
          {isFavorites ? (
            <Heart size={38} color="#fff" strokeWidth={1.8} />
          ) : (
            <Clock size={38} color="#fff" strokeWidth={1.8} />
          )}
        </LinearGradient>

        {isFavorites ? (
          <>
            <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
              Favoris{'\n'}au complet
            </Text>
            <Text className="mb-10 text-center font-body text-[13.5px] leading-[21px] text-white/50">
              Un compte gratuit peut garder 10 favoris en attente de réponse.{'\n'}
              Passez à un forfait pour liker sans limite.
            </Text>
          </>
        ) : (
          <>
            <Text className="mb-3 text-center font-display-black text-[28px] uppercase text-white">
              Limite quotidienne{'\n'}atteinte
            </Text>
            <Text className="mb-2 text-center font-body text-[13.5px] leading-[21px] text-white/50">
              Vous avez utilisé vos 15 swipes gratuits pour aujourd'hui.
            </Text>
            <Text className="mb-10 font-heading-semibold text-[12px] uppercase tracking-widest text-gold">
              Réinitialisation dans {timeUntilMidnight()}
            </Text>
          </>
        )}

        <GradientButton
          label="Voir les forfaits"
          onPress={() => router.replace('/premium/pricing')}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <Pressable onPress={() => router.back()}>
          <Text className="font-body-medium text-[13px] text-white/40">
            {isFavorites ? 'Continuer sans forfait' : 'Revenir demain'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
