import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';

// These keys are read by the search/profile RPCs in the database —
// switching one off has a real effect on what other members see.
const OPTIONS = [
  { key: 'showOnDiscovery', label: 'Visible sur Découvrir', description: 'Votre profil apparaît dans les suggestions' },
  { key: 'showDistance', label: 'Afficher la distance', description: 'Montrer votre distance approximative' },
  { key: 'showOnline', label: 'Statut en ligne', description: 'Afficher quand vous êtes actif(ve)' },
  { key: 'showAge', label: "Afficher l'âge", description: 'Montrer votre âge sur votre profil' },
];

export function PrivacySettingsScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();

  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const stored = profileQuery.data?.privacyPrefs ?? {};
    return Object.fromEntries(OPTIONS.map((o) => [o.key, stored[o.key] ?? true]));
  });

  const save = () => {
    updateProfile.mutate({ privacy_prefs: settings }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout title="Visibilité" onSave={save} saving={updateProfile.isPending}>
      <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45]">
        {OPTIONS.map((option, i) => (
          <View
            key={option.key}
            className={`flex-row items-center justify-between px-4 py-3.5 ${
              i === OPTIONS.length - 1 ? '' : 'border-b border-ink/[0.06]'
            }`}
          >
            <View className="mr-3 flex-1">
              <Text className="mb-0.5 font-heading-semibold text-[13.5px] text-ink">{option.label}</Text>
              <Text className="font-body text-[11px] text-ink-muted">{option.description}</Text>
            </View>
            <ToggleSwitch
              value={settings[option.key]}
              onChange={(v) => setSettings((prev) => ({ ...prev, [option.key]: v }))}
            />
          </View>
        ))}
      </View>
    </EditScreenLayout>
  );
}
