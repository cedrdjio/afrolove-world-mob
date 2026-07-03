import { useState } from 'react';
import { View, Text } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, MailCheck } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { supabase } from '@/shared/services/supabase/client';
import { authService } from '@/modules/auth/services/authService';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { AUTH_CALLBACK_URL } from '@/modules/auth/constants/authLinks';
import { colors } from '@/shared/constants/theme';

export function ChangeEmailScreen() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);

  const changeEmail = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error('Session invalide');
      // Re-authenticate before a sensitive change.
      await authService.signInWithEmail({ email: user.email, password });
      const { error } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: AUTH_CALLBACK_URL },
      );
      if (error) throw error;
    },
    onSuccess: () => setSent(true),
  });
  const changeError = useAppError(changeEmail.error);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim());

  if (sent) {
    return (
      <EditScreenLayout
        title="Changer l'email"
        onSave={() => setSent(false)}
        saveLabel="Modifier une autre adresse"
        scrollable={false}
      >
        <View className="flex-1 items-center justify-center px-2">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-[20px] bg-white/70">
            <MailCheck size={28} color={colors.brand.DEFAULT} strokeWidth={1.8} />
          </View>
          <Text className="mb-2 text-center font-display text-[22px] uppercase leading-tight text-ink">
            Confirmez votre{'\n'}nouvelle adresse
          </Text>
          <Text className="text-center font-body text-[13px] leading-[20px] text-ink-muted">
            Un lien de confirmation a été envoyé à {newEmail.trim()}. Votre email ne changera qu'après
            validation du lien.
          </Text>
        </View>
      </EditScreenLayout>
    );
  }

  return (
    <EditScreenLayout
      title="Changer l'email"
      subtitle={user?.email ? `Votre email actuel : ${user.email}` : undefined}
      onSave={() => changeEmail.mutate()}
      saveLabel="Mettre à jour"
      saveDisabled={!isValidEmail || !password}
      saving={changeEmail.isPending}
      scrollable={false}
    >
      {changeError ? (
        <View className="mb-4">
          <ErrorState error={changeError} variant="inline" />
        </View>
      ) : null}
      <GlassInput
        label="Nouvel email"
        icon={<Mail size={15} color="rgba(62,53,82,0.26)" />}
        placeholder="nouvel.email@exemple.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={newEmail}
        onChangeText={setNewEmail}
      />
      <GlassInput
        label="Mot de passe actuel"
        icon={<Lock size={15} color="rgba(62,53,82,0.26)" />}
        placeholder="Confirmez votre mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
    </EditScreenLayout>
  );
}
