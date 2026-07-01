import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';

const OPTIONS = [
  { key: 'likes', label: 'Likes', description: 'Quand quelqu\'un aime votre profil' },
  { key: 'matches', label: 'Nouveaux matches', description: "Quand vous obtenez un nouveau match" },
  { key: 'messages', label: 'Messages', description: 'Nouveaux messages reçus' },
  { key: 'kyc', label: 'Vérification', description: 'Statut de votre dossier KYC' },
  { key: 'premium', label: 'Offres Premium', description: 'Promotions et rappels' },
  { key: 'marketing', label: 'Actualités AfroLove', description: "Nouveautés de l'application" },
];

export function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    likes: true,
    matches: true,
    messages: true,
    kyc: true,
    premium: true,
    marketing: false,
  });

  return (
    <EditScreenLayout title="Notifications" onSave={() => router.back()}>
      <View className="overflow-hidden rounded-2xl border-[1.5px] border-white/90 bg-white/70">
        {OPTIONS.map((option, i) => (
          <View
            key={option.key}
            className={`flex-row items-center justify-between px-4 py-3.5 ${
              i === OPTIONS.length - 1 ? '' : 'border-b border-ink/[0.06]'
            }`}
          >
            <View className="mr-3 flex-1">
              <Text className="mb-0.5 font-heading-semibold text-[13.5px] uppercase text-ink">{option.label}</Text>
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
