import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin, Calendar, Globe2, Building2, Church, Languages as LanguagesIcon,
  HeartPulse, GraduationCap, Briefcase, Ruler, BadgeCheck,
} from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { colors } from '@/shared/constants/theme';
import { useSearchFiltersStore } from '@/modules/search/stores/searchFiltersStore';

export function SearchFiltersHubScreen() {
  const router = useRouter();
  const filters = useSearchFiltersStore();

  const rows = [
    { icon: MapPin, label: 'Distance', value: `${filters.distanceKm} km`, href: '/search/distance' },
    { icon: Calendar, label: 'Âge', value: `${filters.ageMin} - ${filters.ageMax} ans`, href: '/search/age' },
    { icon: Globe2, label: 'Pays', value: filters.country, href: '/search/country' },
    { icon: Building2, label: 'Ville', value: filters.city, href: '/search/city' },
    { icon: Church, label: 'Religion', value: filters.religion, href: '/search/religion' },
    {
      icon: LanguagesIcon,
      label: 'Langues',
      value: filters.languages.length ? `${filters.languages.length} sélectionnées` : 'Peu importe',
      href: '/search/languages',
    },
    {
      icon: HeartPulse,
      label: 'Mode de vie',
      value: filters.lifestyle.length ? `${filters.lifestyle.length} sélectionnés` : 'Peu importe',
      href: '/search/lifestyle',
    },
    { icon: GraduationCap, label: 'Éducation', value: filters.education, href: '/search/education' },
    { icon: Briefcase, label: 'Profession', value: filters.profession || 'Peu importe', href: '/search/profession' },
    { icon: Ruler, label: 'Taille', value: `${filters.heightMin} - ${filters.heightMax} cm`, href: '/search/height' },
    { icon: BadgeCheck, label: 'Vérifié', value: filters.verifiedOnly ? 'Oui' : 'Peu importe', href: '/search/verified' },
  ] as const;

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(200,96,64,0.09)" top={-50} left={-50} duration={9500} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 68, paddingBottom: 28 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <Text style={{ fontSize: 19, color: colors.ink.DEFAULT }}>←</Text>
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Recherche avancée</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70">
            {rows.map((row, i) => (
              <Pressable
                key={row.label}
                className={`flex-row items-center justify-between px-4 py-3.5 ${
                  i === rows.length - 1 ? '' : 'border-b border-ink/[0.06]'
                }`}
                onPress={() => router.push(row.href as never)}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/[0.08]">
                    <row.icon size={16} color={colors.brand.DEFAULT} />
                  </View>
                  <Text className="font-heading-semibold text-[13.5px] uppercase text-ink">{row.label}</Text>
                </View>
                <Text className="font-body-medium text-[12px] text-ink-muted">{row.value}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <GradientButton
          label="Rechercher des profils"
          onPress={() => router.replace('/(tabs)/discover')}
          style={{ marginTop: 16 }}
        />
      </View>
    </View>
  );
}
