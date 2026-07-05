import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Images, FileText, Sparkles, HeartPulse, Languages as LanguagesIcon,
  Church, GraduationCap, Briefcase, Ruler, SlidersHorizontal, ArrowLeft, IdCard, Eye, ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { SettingsRow } from '@/shared/components/ui/SettingsRow';
import { colors, gradients } from '@/shared/constants/theme';

const SECTIONS = [
  {
    title: 'Profil',
    rows: [
      { icon: IdCard, label: 'Informations de base', href: '/edit-profile/basic-info' },
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
        <GlowOrb size={230} color="rgba(106,79,192,0.09)" top={-50} right={-50} duration={9500} />
      </ScreenBackground>

      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 68 }} showsVerticalScrollIndicator={false}>
        <View className="mb-7 flex-row items-center justify-between">
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
          </IconButton>
          <Text className="font-display text-[20px] text-ink">Modifier le profil</Text>
          <View style={{ width: 44 }} />
        </View>

        <Pressable onPress={() => router.push('/edit-profile/preview')} className="mb-6">
          <LinearGradient
            colors={gradients.brand}
            style={{ borderRadius: 20, padding: 16 }}
            className="flex-row items-center gap-3"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Eye size={18} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="font-heading text-[13px] text-white">Aperçu du profil</Text>
              <Text className="font-body text-[11.5px] text-white/70">Voyez ce que les autres voient</Text>
            </View>
            <ChevronRight size={16} color="#fff" />
          </LinearGradient>
        </Pressable>

        {SECTIONS.map((section) => (
          <View key={section.title} className="mb-5">
            <Text className="mb-2 font-heading text-[11px] text-ink/35">
              {section.title}
            </Text>
            <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45]">
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
