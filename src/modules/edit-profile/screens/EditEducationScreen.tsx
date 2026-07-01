import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ChoiceListEditor } from '@/shared/components/ui/ChoiceListEditor';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const OPTIONS = ['Lycée', 'Licence', 'Master', 'Doctorat', 'Formation professionnelle'];

export function EditEducationScreen() {
  const router = useRouter();
  const [value, setValue] = useState('Master');

  return (
    <EditScreenLayout title="Éducation" onSave={() => router.back()}>
      <ChoiceListEditor options={OPTIONS} value={value} onChange={setValue} />
    </EditScreenLayout>
  );
}
