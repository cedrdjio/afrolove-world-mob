import { useState } from 'react';
import { useRouter } from 'expo-router';
import { User, Mail, Phone } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

export function AccountSettingsScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('Amira');
  const [email, setEmail] = useState('amira.diallo@email.com');
  const [phone, setPhone] = useState('+234 801 234 5678');

  return (
    <EditScreenLayout title="Infos personnelles" onSave={() => router.back()}>
      <GlassInput label="Prénom" icon={<User size={15} color="rgba(44,20,8,0.26)" />} value={firstName} onChangeText={setFirstName} />
      <GlassInput
        label="Email"
        icon={<Mail size={15} color="rgba(44,20,8,0.26)" />}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <GlassInput
        label="Téléphone"
        icon={<Phone size={15} color="rgba(44,20,8,0.26)" />}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
    </EditScreenLayout>
  );
}
