import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Venus, Mars, Sparkles } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { OptionCard } from '@/modules/onboarding/components/OptionCard';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { Skeleton, ErrorState } from '@/shared/components/feedback';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';
import { calculateAge } from '@/modules/profile/types/profile';
import { mapToAppError } from '@/shared/utils/errorMapping';
import { colors } from '@/shared/constants/theme';

type Gender = 'femme' | 'homme' | 'non-binaire';
type LookingForOption = 'femmes' | 'hommes' | 'les-deux';

const GENDER_OPTIONS: { value: Gender; Icon: LucideIcon; title: string; description: string }[] = [
  { value: 'femme', Icon: Venus, title: 'Femme', description: "Je m'identifie comme une femme" },
  { value: 'homme', Icon: Mars, title: 'Homme', description: "Je m'identifie comme un homme" },
  { value: 'non-binaire', Icon: Sparkles, title: 'Non-binaire', description: "Je m'identifie autrement" },
];

const LOOKING_FOR_OPTIONS: { value: LookingForOption; Icon: LucideIcon; title: string; description: string }[] = [
  { value: 'femmes', Icon: Venus, title: 'Des femmes', description: 'Afficher des profils féminins' },
  { value: 'hommes', Icon: Mars, title: 'Des hommes', description: 'Afficher des profils masculins' },
  { value: 'les-deux', Icon: Sparkles, title: 'Les deux', description: 'Afficher tous les profils' },
];

function DateField({
  label,
  value,
  onChangeText,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  maxLength: number;
}) {
  return (
    <View className="flex-1 items-center gap-2 rounded-[18px] border-2 border-white/90 bg-white/70 px-3 py-4">
      <TextInput
        value={value}
        onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={maxLength}
        placeholder={label}
        placeholderTextColor="rgba(26,8,4,0.2)"
        className="w-full text-center font-display text-[24px] text-ink"
      />
      <Text className="font-heading text-[9px] uppercase tracking-widest text-ink-faint">{label}</Text>
    </View>
  );
}

function toIsoBirthDate(day: string, month: string, year: string): string {
  const pad = (value: string) => value.padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

function isValidCalendarDate(day: string, month: string, year: string): boolean {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y || y < 1900) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function EditBasicInfoScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [lookingFor, setLookingFor] = useState<LookingForOption | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      const profile = profileQuery.data;
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      if (profile.birthDate) {
        const [y, m, d] = profile.birthDate.split('-');
        setYear(y ?? '');
        setMonth(m ?? '');
        setDay(d ?? '');
      }
      setGender((profile.gender as Gender | null) ?? null);
      setLookingFor((profile.lookingFor as LookingForOption | null) ?? null);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const validDate = isValidCalendarDate(day, month, year);
  const age = useMemo(() => {
    if (!validDate) return null;
    return calculateAge(toIsoBirthDate(day, month, year));
  }, [validDate, day, month, year]);

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    validDate &&
    age !== null &&
    age >= 18 &&
    Boolean(gender) &&
    Boolean(lookingFor);

  const handleSave = () => {
    if (!isValid || !gender || !lookingFor) return;
    updateProfile.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        looking_for: lookingFor,
        birth_date: toIsoBirthDate(day, month, year),
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <EditScreenLayout
      title="Informations de base"
      subtitle="Ces informations sont utilisées pour personnaliser votre expérience."
      onSave={handleSave}
      saveDisabled={!isValid}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      {updateProfile.isError ? (
        <View className="mb-4">
          <ErrorState error={mapToAppError(updateProfile.error)} variant="inline" onRetry={handleSave} />
        </View>
      ) : null}

      {profileQuery.isPending ? (
        <View className="gap-3">
          <Skeleton width="100%" height={64} radius={16} />
          <Skeleton width="100%" height={64} radius={16} />
          <Skeleton width="100%" height={90} radius={16} />
          <Skeleton width="100%" height={70} radius={16} />
          <Skeleton width="100%" height={70} radius={16} />
        </View>
      ) : (
        <>
          <GlassInput label="Prénom" placeholder="Prénom" value={firstName} onChangeText={setFirstName} />
          <GlassInput label="Nom" placeholder="Nom" value={lastName} onChangeText={setLastName} />

          <Text className="mb-2 font-heading-semibold text-[9.5px] uppercase tracking-widest text-ink-faint">
            Date de naissance
          </Text>
          <View className="mb-1 flex-row gap-3">
            <DateField label="Jour" value={day} onChangeText={setDay} maxLength={2} />
            <DateField label="Mois" value={month} onChangeText={setMonth} maxLength={2} />
            <View style={{ flex: 1.4 }}>
              <DateField label="Année" value={year} onChangeText={setYear} maxLength={4} />
            </View>
          </View>
          {age !== null ? (
            <Text className={`mb-4 mt-2 font-body text-[12px] ${age >= 18 ? 'text-ink-muted' : 'text-danger'}`}>
              {age >= 18 ? `Vous avez ${age} ans.` : 'Vous devez avoir au moins 18 ans.'}
            </Text>
          ) : (
            <View className="mb-4" />
          )}

          <Text className="mb-2 font-heading-semibold text-[9.5px] uppercase tracking-widest text-ink-faint">
            Je suis
          </Text>
          <View className="mb-5 gap-2.5">
            {GENDER_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                Icon={option.Icon}
                title={option.title}
                description={option.description}
                selected={gender === option.value}
                onPress={() => setGender(option.value)}
              />
            ))}
          </View>

          <Text className="mb-2 font-heading-semibold text-[9.5px] uppercase tracking-widest text-ink-faint">
            Je recherche
          </Text>
          <View className="gap-2.5">
            {LOOKING_FOR_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                Icon={option.Icon}
                title={option.title}
                description={option.description}
                selected={lookingFor === option.value}
                onPress={() => setLookingFor(option.value)}
              />
            ))}
          </View>
        </>
      )}
    </EditScreenLayout>
  );
}
