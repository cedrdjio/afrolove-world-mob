import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';

const OPTIONS = [
  { key: 'likes', label: 'Likes', description: "Quand quelqu'un aime votre profil" },
  { key: 'matches', label: 'Nouveaux matches', description: 'Quand vous obtenez un nouveau match' },
  { key: 'messages', label: 'Messages', description: 'Nouveaux messages reçus' },
  { key: 'kyc', label: 'Vérification', description: 'Statut de votre dossier KYC' },
  { key: 'premium', label: 'Offres Premium', description: 'Promotions et rappels' },
  { key: 'marketing', label: 'Actualités AfriLove', description: "Nouveautés de l'application" },
];

export function NotificationSettingsScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();

  // Absent key = enabled, mirroring the DB push trigger's default.
  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    const stored = profileQuery.data?.notificationPrefs ?? {};
    return Object.fromEntries(OPTIONS.map((o) => [o.key, stored[o.key] ?? o.key !== 'marketing']));
  });

  const save = () => {
    updateProfile.mutate({ notification_prefs: settings }, { onSuccess: () => router.back() });
  };

  return (
    <EditScreenLayout title="Notifications" onSave={save} saving={updateProfile.isPending}>
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
