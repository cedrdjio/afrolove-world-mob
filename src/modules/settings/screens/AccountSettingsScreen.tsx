import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';

export function AccountSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useProfileQuery();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState(profileQuery.data?.firstName ?? '');
  const [lastName, setLastName] = useState(profileQuery.data?.lastName ?? '');

  const save = () => {
    updateProfile.mutate(
      { first_name: firstName.trim() || null, last_name: lastName.trim() || null },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <EditScreenLayout
      title="Infos personnelles"
      onSave={save}
      saving={updateProfile.isPending}
      saveDisabled={firstName.trim().length < 2}
    >
      <GlassInput
        label="Prénom"
        icon={<User size={15} color="rgba(62,53,82,0.26)" />}
        value={firstName}
        onChangeText={setFirstName}
      />
      <GlassInput
        label="Nom"
        icon={<User size={15} color="rgba(62,53,82,0.26)" />}
        placeholder="Optionnel — jamais montré aux autres membres"
        value={lastName}
        onChangeText={setLastName}
      />
      <View className="mt-1 rounded-2xl border-[1.5px] border-white/90 bg-white/70 px-4 py-3.5">
        <View className="flex-row items-center gap-2.5">
          <Mail size={15} color="rgba(62,53,82,0.26)" />
          <View className="flex-1">
            <Text className="mb-0.5 font-heading text-[10px] uppercase tracking-widest text-ink/35">Email</Text>
            <Text className="font-body text-[13.5px] text-ink">{user?.email ?? '—'}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings/change-email')}
            className="rounded-xl bg-brand/10 px-3 py-2 active:opacity-70"
          >
            <Text className="font-heading text-[10.5px] uppercase text-brand">Changer</Text>
          </Pressable>
        </View>
      </View>
    </EditScreenLayout>
  );
}
