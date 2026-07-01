import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const MAX_LENGTH = 300;
const DEFAULT_BIO =
  "Passionnée de musique afrobeats et de voyages. Je cherche quelqu'un de sincère qui partage mes valeurs africaines.";

export function EditBioScreen() {
  const router = useRouter();
  const [bio, setBio] = useState(DEFAULT_BIO);

  return (
    <EditScreenLayout title="Bio" subtitle="Présentez-vous en quelques mots authentiques." onSave={() => router.back()}>
      <View className="rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-4" style={{ minHeight: 180 }}>
        <TextInput
          value={bio}
          onChangeText={(text) => setBio(text.slice(0, MAX_LENGTH))}
          multiline
          textAlignVertical="top"
          placeholder="Parlez de vous…"
          placeholderTextColor="rgba(26,8,4,0.25)"
          className="flex-1 font-body text-[14px] leading-[21px] text-ink"
        />
      </View>
      <Text className="mt-2 text-right font-body text-[11px] text-ink/30">
        {bio.length}/{MAX_LENGTH}
      </Text>
    </EditScreenLayout>
  );
}
