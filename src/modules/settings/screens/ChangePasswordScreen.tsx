import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';

export function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const isValid = current.length > 0 && next.length >= 6 && next === confirm;

  return (
    <EditScreenLayout
      title="Mot de passe"
      onSave={() => router.back()}
      saveLabel="Mettre à jour"
      saveDisabled={!isValid}
      scrollable={false}
    >
      <GlassInput
        label="Mot de passe actuel"
        icon={<Lock size={15} color="rgba(44,20,8,0.26)" />}
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />
      <GlassInput
        label="Nouveau mot de passe"
        icon={<Lock size={15} color="rgba(44,20,8,0.26)" />}
        secureTextEntry
        value={next}
        onChangeText={setNext}
      />
      <GlassInput
        label="Confirmer le mot de passe"
        icon={<Lock size={15} color="rgba(44,20,8,0.26)" />}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== next ? 'Les mots de passe ne correspondent pas' : undefined}
      />
    </EditScreenLayout>
  );
}
