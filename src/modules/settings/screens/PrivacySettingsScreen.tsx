import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ToggleSwitch } from '@/shared/components/ui/ToggleSwitch';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const OPTIONS = [
  { key: 'showOnDiscovery', label: 'Visible sur Découvrir', description: "Votre profil apparaît dans les suggestions" },
  { key: 'showDistance', label: 'Afficher la distance', description: 'Montrer votre distance approximative' },
  { key: 'showOnline', label: 'Statut en ligne', description: 'Afficher quand vous êtes actif(ve)' },
  { key: 'showAge', label: "Afficher l'âge", description: 'Montrer votre âge sur votre profil' },
  { key: 'readReceipts', label: 'Accusés de lecture', description: 'Montrer quand vous avez lu un message' },
];

export function PrivacySettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    showOnDiscovery: true,
    showDistance: true,
    showOnline: true,
    showAge: true,
    readReceipts: false,
  });

  return (
    <EditScreenLayout title="Visibilité" onSave={() => router.back()}>
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
