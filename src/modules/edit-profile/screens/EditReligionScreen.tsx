import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ChoiceListEditor } from '@/modules/edit-profile/components/ChoiceListEditor';
import { EditScreenLayout } from '@/modules/edit-profile/components/EditScreenLayout';

const OPTIONS = ['Chrétienne', 'Musulmane', 'Traditionnelle africaine', 'Autre', 'Préfère ne pas dire'];

export function EditReligionScreen() {
  const router = useRouter();
  const [value, setValue] = useState('Chrétienne');

  return (
    <EditScreenLayout title="Religion" onSave={() => router.back()}>
      <ChoiceListEditor options={OPTIONS} value={value} onChange={setValue} />
    </EditScreenLayout>
  );
}
