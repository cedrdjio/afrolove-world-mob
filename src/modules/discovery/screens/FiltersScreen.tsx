import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Minus, Plus, Globe2, Flag, Earth, Check } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { Chip } from '@/shared/components/ui/Chip';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { useFiltersStore } from '@/modules/discovery/stores/filtersStore';
import { useDiscoveryCount, useDiscoveryCountries } from '@/modules/discovery/hooks/useDiscovery';
import type { DiscoveryScope } from '@/modules/discovery/types/discovery';
import { colors } from '@/shared/constants/theme';

const SCOPE_OPTIONS: {
  key: DiscoveryScope;
  label: string;
  description: string;
  Icon: typeof Globe2;
}[] = [
  {
    key: 'international',
    label: 'Diaspora',
    description: 'Des profils vivant dans un autre pays que le vôtre — l’esprit AfriLove.',
    Icon: Globe2,
  },
  {
    key: 'country',
    label: 'Un pays précis',
    description: 'Choisissez le pays où vous voulez rencontrer quelqu’un.',
    Icon: Flag,
  },
  {
    key: 'all',
    label: 'Partout',
    description: 'Le monde entier, sans restriction de pays.',
    Icon: Earth,
  },
];

function Stepper({ value, onDecrement, onIncrement }: { value: number; onDecrement: () => void; onIncrement: () => void }) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable onPress={onDecrement}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Minus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
      <Text className="w-10 text-center font-display text-[22px] text-ink">{value}</Text>
      <Pressable onPress={onIncrement}>
        <GlassSurface variant="light" radius={16} style={{ width: 40, height: 40 }}>
          <View className="h-10 w-10 items-center justify-center">
            <Plus size={16} color={colors.ink.DEFAULT} />
          </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}

export function FiltersScreen() {
  const router = useRouter();
  const { scope, country, ageMin, ageMax, verifiedOnly, setScope, setCountry, setAgeRange, toggleVerifiedOnly } =
    useFiltersStore();
  const countriesQuery = useDiscoveryCountries();
  const countQuery = useDiscoveryCount();

  const applyLabel =
    countQuery.data != null
      ? countQuery.data > 0
        ? `Voir ${countQuery.data} profil${countQuery.data > 1 ? 's' : ''}`
        : 'Aucun profil — élargissez vos filtres'
      : 'Appliquer les filtres';

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />
      <ScrollView contentContainerClassName="px-6 pb-8" style={{ paddingTop: 24 }}>
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-display text-[26px] text-ink">Filtres</Text>
          <Pressable onPress={() => router.back()}>
            <GlassSurface variant="light" radius={15} style={{ width: 40, height: 40 }}>
              <View className="h-10 w-10 items-center justify-center">
                <X size={17} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
        </View>

        <Text className="mb-3 font-heading text-[11px] text-ink/40">Où chercher l'amour ?</Text>
        <View className="mb-4" style={{ gap: 10 }}>
          {SCOPE_OPTIONS.map(({ key, label, description, Icon }) => {
            const selected = scope === key;
            return (
              <Pressable
                key={key}
                onPress={() => setScope(key)}
                className={`flex-row items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 active:opacity-90 ${
                  selected ? 'border-brand/[0.45] bg-brand/[0.08]' : 'border-white/70 bg-white/[0.45]'
                }`}
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-xl ${
                    selected ? 'bg-brand/[0.14]' : 'bg-ink/[0.05]'
                  }`}
                >
                  <Icon size={18} color={selected ? colors.brand.DEFAULT : colors.ink.muted} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className={`font-heading text-[13px] ${selected ? 'text-brand' : 'text-ink'}`}>{label}</Text>
                  <Text className="mt-0.5 font-body text-[11px] leading-[15px] text-ink-muted">{description}</Text>
                </View>
                <View
                  className={`h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${
                    selected ? 'border-brand bg-brand' : 'border-ink/[0.18] bg-transparent'
                  }`}
                >
                  {selected ? <Check size={13} color="#fff" strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {scope === 'country' ? (
          <View className="mb-4 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-4">
            <Text className="mb-3 font-heading text-[11px] text-ink/40">Quel pays ?</Text>
            {countriesQuery.isLoading ? (
              <ActivityIndicator size="small" color={colors.brand.DEFAULT} />
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {(countriesQuery.data ?? []).map(({ country: name, memberCount }) => (
                  <Chip
                    key={name}
                    label={`${name} · ${memberCount}`}
                    selected={country === name}
                    onPress={() => setCountry(country === name ? null : name)}
                  />
                ))}
              </View>
            )}
            {!countriesQuery.isLoading && (countriesQuery.data ?? []).length === 0 ? (
              <Text className="font-body text-[12px] text-ink-muted">Aucun pays disponible pour le moment.</Text>
            ) : null}
          </View>
        ) : null}

        <Text className="mb-3 font-heading text-[11px] text-ink/40">Tranche d'âge</Text>
        <View className="mb-7 flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-5 py-4">
          <Stepper
            value={ageMin}
            onDecrement={() => setAgeRange(Math.max(18, ageMin - 1), ageMax)}
            onIncrement={() => setAgeRange(Math.min(ageMax, ageMin + 1), ageMax)}
          />
          <Text className="font-body-medium text-[12px] text-ink-muted">à</Text>
          <Stepper
            value={ageMax}
            onDecrement={() => setAgeRange(ageMin, Math.max(ageMin, ageMax - 1))}
            onIncrement={() => setAgeRange(ageMin, Math.min(99, ageMax + 1))}
          />
        </View>

        <View className="mb-8 flex-row items-center justify-between rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-5 py-4">
          <Text className="font-heading-semibold text-[13px] text-ink">Profils vérifiés uniquement</Text>
          <ToggleSwitch value={verifiedOnly} onChange={toggleVerifiedOnly} />
        </View>

        <GradientButton label={applyLabel} onPress={() => router.back()} />
      </ScrollView>
    </View>
  );
}
