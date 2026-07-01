import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Images, FileText, Sparkles, HeartPulse, Languages as LanguagesIcon,
  Church, GraduationCap, Briefcase, Ruler, SlidersHorizontal, ArrowLeft,
} from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { SettingsRow } from '@/shared/components/ui/SettingsRow';
import { colors } from '@/shared/constants/theme';

const SECTIONS = [
  {
    title: 'Profil',
    rows: [
      { icon: Images, label: 'Photos', href: '/edit-profile/photos' },
      { icon: FileText, label: 'Bio', href: '/edit-profile/bio' },
    ],
  },
  {
    title: 'Centres d\'intérêt',
    rows: [
      { icon: Sparkles, label: 'Intérêts', href: '/edit-profile/interests' },
      { icon: HeartPulse, label: 'Mode de vie', href: '/edit-profile/lifestyle' },
      { icon: LanguagesIcon, label: 'Langues', href: '/edit-profile/languages' },
    ],
  },
  {
    title: 'Informations',
    rows: [
      { icon: Church, label: 'Religion', href: '/edit-profile/religion' },
      { icon: GraduationCap, label: 'Éducation', href: '/edit-profile/education' },
      { icon: Briefcase, label: 'Profession', href: '/edit-profile/job' },
      { icon: Ruler, label: 'Taille', href: '/edit-profile/height' },
    ],
  },
  {
    title: 'Rencontres',
    rows: [{ icon: SlidersHorizontal, label: 'Préférences', href: '/edit-profile/preferences' }],
  },
] as const;

export function EditProfileHubScreen() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={230} color="rgba(200,96,64,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 68 }} showsVerticalScrollIndicator={false}>
        <View className="mb-7 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] uppercase text-ink">Modifier le profil</Text>
          <View style={{ width: 44 }} />
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} className="mb-5">
            <Text className="mb-2 font-heading text-[9.5px] uppercase tracking-widest text-ink/35">
              {section.title}
            </Text>
            <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70">
              {section.rows.map((row, i) => (
                <SettingsRow
                  key={row.label}
                  icon={<row.icon size={16} color={colors.brand.DEFAULT} />}
                  label={row.label}
                  isLast={i === section.rows.length - 1}
                  onPress={() => router.push(row.href as never)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
