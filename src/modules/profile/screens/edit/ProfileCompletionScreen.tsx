import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Check, Plus, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb, ScreenHeader } from '@/shared/components/layout';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { FullScreenLoader } from '@/shared/components/feedback';
import { colors, gradients } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { computeProfileCompletion, type ProfileCompletionStatus } from '@/modules/profile/types/profile';

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CHECKLIST: {
  key: keyof ProfileCompletionStatus['missing'];
  title: string;
  subtitle: string;
  href: Href;
}[] = [
  { key: 'bio', title: 'Bio / Description', subtitle: 'Quelques mots sur vous', href: '/edit-profile/bio' },
  { key: 'photos', title: '2 photos minimum', subtitle: 'Montrez votre plus beau profil', href: '/edit-profile/photos' },
  { key: 'interests', title: "3 centres d'intérêt minimum", subtitle: 'Ce qui vous passionne', href: '/edit-profile/interests' },
  { key: 'lifestyle', title: 'Mode de vie', subtitle: 'Tabac, alcool, sport, animaux, enfants', href: '/edit-profile/lifestyle' },
  { key: 'gender', title: 'Genre', subtitle: 'Comment vous identifiez-vous', href: '/edit-profile' },
  { key: 'lookingFor', title: 'Vous recherchez', subtitle: 'Qui souhaitez-vous rencontrer', href: '/edit-profile' },
  { key: 'birthDate', title: 'Date de naissance', subtitle: 'Votre âge sur le profil', href: '/edit-profile' },
];

export function ProfileCompletionScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();

  if (!profileQuery.data) return <FullScreenLoader />;

  const status = computeProfileCompletion(profileQuery.data);
  const doneItems = CHECKLIST.filter((item) => !status.missing[item.key]);
  const todoItems = CHECKLIST.filter((item) => status.missing[item.key]);
  const completionPercent = Math.round((doneItems.length / CHECKLIST.length) * 100);
  const dashOffset = CIRCUMFERENCE * (1 - completionPercent / 100);
  const nextHref = todoItems[0]?.href ?? '/edit-profile';

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
            <Text className="font-display text-[30px] text-ink">{completionPercent}%</Text>
            <Text className="font-body-medium text-[10px] text-ink-muted">complété</Text>
          </View>
          <Text className="mb-1.5 text-center font-display text-[26px] uppercase leading-[1.15] text-ink">
            {status.isComplete ? 'Profil complet !' : 'Complétez pour'}
            {'\n'}
            <Text className="text-brand">{status.isComplete ? 'Bravo !' : 'plus de matches !'}</Text>
          </Text>
          <Text className="text-center font-body text-[12px] leading-[18px] text-ink-muted">
            {status.isComplete
              ? 'Votre profil est prêt à être découvert par la communauté.'
              : 'Les profils complets reçoivent 3× plus de likes.'}
          </Text>
        </View>

        <View className="mb-3.5 gap-2.5">
          {doneItems.map((item) => (
            <View
              key={item.key}
              className="flex-row items-center gap-3 rounded-[17px] border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5"
            >
              <LinearGradient
                colors={gradients.brand}
                style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={13} color="#fff" strokeWidth={3} />
              </LinearGradient>
              <Text className="flex-1 font-heading-semibold text-[13px] uppercase text-ink">{item.title}</Text>
              <View className="flex-row items-center gap-1">
                <Text className="font-body-medium text-[10px] text-brand/60">Fait</Text>
                <Check size={10} color="rgba(200,96,64,0.6)" strokeWidth={3} />
              </View>
            </View>
          ))}

          {todoItems.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href)}
              className="flex-row items-center gap-3 rounded-[17px] border-[1.5px] border-brand/[0.22] bg-white/55 px-4 py-3.5"
            >
              <View className="h-8 w-8 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-brand/30 bg-brand/10">
                <Plus size={14} color={colors.brand.DEFAULT} />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 font-heading-semibold text-[13px] uppercase text-ink">{item.title}</Text>
                <Text className="font-body text-[11px] text-ink-muted">{item.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {!status.isComplete ? (
          <GradientButton
            label="Compléter maintenant"
            icon={<ArrowRight size={14} color="#fff" />}
            iconPosition="right"
            onPress={() => router.push(nextHref)}
          />
        ) : (
          <GradientButton label="Découvrir l'application" onPress={() => router.replace('/(tabs)/discover')} />
        )}
      </ScrollView>
    </View>
  );
}
