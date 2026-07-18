import { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Lock } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { supabase } from '@/shared/services/supabase/client';
import { authService } from '@/modules/auth/services/authService';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const changePassword = useMutation({
    mutationFn: async () => {
      // Re-authenticate with the current password first: updateUser alone
      // would let anyone with an unlocked phone change the password.
      if (!user?.email) throw new Error('Session invalide');
      await authService.signInWithEmail({ email: user.email, password: current });
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
    },
    onSuccess: () => {
      // Retour visible : sans confirmation, l'écran se fermait en silence et
      // rien n'indiquait que le nouveau mot de passe était bien actif.
      Alert.alert('Mot de passe mis à jour', 'Votre nouveau mot de passe est actif dès maintenant.');
      router.back();
    },
  });
  const changeError = useAppError(changePassword.error);

  const isValid =
    current.length > 0 && next.length >= 8 && /[a-zA-Z]/.test(next) && /[0-9]/.test(next) && next === confirm;

  return (
    <EditScreenLayout
      title="Mot de passe"
      onSave={() => changePassword.mutate()}
      saveLabel="Mettre à jour"
      saveDisabled={!isValid}
      saving={changePassword.isPending}
      scrollable={false}
    >
      {changeError ? (
        <View className="mb-4">
          <ErrorState error={changeError} variant="inline" />
        </View>
      ) : null}
      <GlassInput
        label="Mot de passe actuel"
        icon={<Lock size={15} color="rgba(62,53,82,0.26)" />}
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />
      <GlassInput
        label="Nouveau mot de passe"
        icon={<Lock size={15} color="rgba(62,53,82,0.26)" />}
        secureTextEntry
        value={next}
        onChangeText={setNext}
        error={
          next.length > 0 && (next.length < 8 || !/[a-zA-Z]/.test(next) || !/[0-9]/.test(next))
            ? 'Au moins 8 caractères, avec lettres et chiffres'
            : undefined
        }
      />
      <GlassInput
        label="Confirmer le mot de passe"
        icon={<Lock size={15} color="rgba(62,53,82,0.26)" />}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={confirm.length > 0 && confirm !== next ? 'Les mots de passe ne correspondent pas' : undefined}
      />
    </EditScreenLayout>
  );
}
