import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

export function ChangeEmailScreen() {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <EditScreenLayout
      title="Changer l'email"
      subtitle="Votre email actuel : amira.diallo@email.com"
      onSave={() => router.back()}
      saveLabel="Mettre à jour"
      saveDisabled={!newEmail || !password}
      scrollable={false}
    >
      <GlassInput
        label="Nouvel email"
        icon={<Mail size={15} color="rgba(44,20,8,0.26)" />}
        placeholder="nouvel.email@exemple.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={newEmail}
        onChangeText={setNewEmail}
      />
      <GlassInput
        label="Mot de passe actuel"
        icon={<Lock size={15} color="rgba(44,20,8,0.26)" />}
        placeholder="Confirmez votre mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
    </EditScreenLayout>
  );
}
