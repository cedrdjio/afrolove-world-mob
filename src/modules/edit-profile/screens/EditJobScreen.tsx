import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Briefcase } from 'lucide-react-native';
import { GlassInput } from '@/shared/components/ui/GlassInput';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

export function EditJobScreen() {
  const router = useRouter();
  const [job, setJob] = useState('Chef de projet marketing');

  return (
    <EditScreenLayout title="Profession" onSave={() => router.back()} scrollable={false}>
      <GlassInput
        label="Métier"
        icon={<Briefcase size={15} color="rgba(44,20,8,0.26)" />}
        placeholder="Votre profession"
        value={job}
        onChangeText={setJob}
      />
    </EditScreenLayout>
  );
}
