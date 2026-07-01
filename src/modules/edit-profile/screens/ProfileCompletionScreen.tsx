import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Check, Plus, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors, gradients } from '@/shared/constants/theme';

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const COMPLETION = 78;

const DONE_ITEMS = ['Photo de profil', 'Infos de base', "Centres d'intérêt"];
const TODO_ITEMS = [
  { title: 'Bio / Description', subtitle: 'Quelques mots sur vous', boost: '+15%', href: '/edit-profile/bio' },
  { title: '3 photos minimum', subtitle: 'Ajoutez encore 1 photo', boost: '+7%', href: '/edit-profile/photos' },
] as const;

export function ProfileCompletionScreen() {
  const router = useRouter();
  const dashOffset = CIRCUMFERENCE * (1 - COMPLETION / 100);

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(201,134,42,0.09)" bottom={-40} right={-40} duration={10000} />
      </ScreenBackground>

      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 68 }} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <View className="mb-6 items-center">
          <View className="mb-3.5 h-[116px] w-[116px] items-center justify-center">
            <Svg width={116} height={116} viewBox="0 0 116 116" style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
              <Defs>
                <SvgLinearGradient id="pgr" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={colors.brand.light} />
                  <Stop offset="100%" stopColor={colors.brand.dark} />
                </SvgLinearGradient>
              </Defs>
              <Circle cx={58} cy={58} r={RADIUS} stroke="rgba(44,20,8,0.07)" strokeWidth={9} fill="none" />
              <Circle
                cx={58}
                cy={58}
                r={RADIUS}
                stroke="url(#pgr)"
                strokeWidth={9}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </Svg>
            <Text className="font-display text-[30px] text-ink">{COMPLETION}%</Text>
            <Text className="font-body-medium text-[10px] text-ink-muted">complété</Text>
          </View>
          <Text className="mb-1.5 text-center font-display text-[26px] uppercase leading-[1.15] text-ink">
            Complétez pour{'\n'}
            <Text className="text-brand">plus de matches !</Text>
          </Text>
          <Text className="text-center font-body text-[12px] leading-[18px] text-ink-muted">
            Les profils complets reçoivent <Text className="font-heading-semibold">3× plus</Text> de likes.
          </Text>
        </View>

        <View className="mb-3.5 gap-2.5">
          {DONE_ITEMS.map((item) => (
            <View
              key={item}
              className="flex-row items-center gap-3 rounded-[17px] border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
            >
              <LinearGradient
                colors={gradients.brand}
                style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={13} color="#fff" strokeWidth={3} />
              </LinearGradient>
              <Text className="flex-1 font-heading-semibold text-[13px] uppercase text-ink">{item}</Text>
              <View className="flex-row items-center gap-1">
                <Text className="font-body-medium text-[10px] text-brand/60">Fait</Text>
                <Check size={10} color="rgba(200,96,64,0.6)" strokeWidth={3} />
              </View>
            </View>
          ))}

          {TODO_ITEMS.map((item) => (
            <View
              key={item.title}
              className="flex-row items-center gap-3 rounded-[17px] border-[1.5px] border-brand/[0.22] bg-white/55 px-4 py-3.5"
            >
              <View className="h-8 w-8 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-brand/30 bg-brand/10">
                <Plus size={14} color={colors.brand.DEFAULT} />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 font-heading-semibold text-[13px] uppercase text-ink">{item.title}</Text>
                <Text className="font-body text-[11px] text-ink-muted">{item.subtitle}</Text>
              </View>
              <Text className="rounded-lg bg-brand/10 px-2.5 py-1.5 font-heading text-[9.5px] text-brand">
                {item.boost}
              </Text>
            </View>
          ))}
        </View>

        <GradientButton
          label="Compléter maintenant"
          icon={<ArrowRight size={14} color="#fff" />}
          iconPosition="right"
          onPress={() => router.push('/edit-profile/bio')}
        />
      </ScrollView>
    </View>
  );
}
