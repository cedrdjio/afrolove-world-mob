import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { HeartHandshake } from 'lucide-react-native';
import { Chip } from '@/shared/components/ui/Chip';
import { EditScreenLayout } from '@/modules/profile/components/EditScreenLayout';
import { LIFESTYLE_CATEGORIES, EMPTY_LIFESTYLE, isLifestyleComplete, type LifestyleValues } from '@/shared/constants/lifestyle';
import { colors } from '@/shared/constants/theme';
import { useProfileQuery } from '@/modules/profile/hooks/useProfileQuery';
import { useRelationshipGoalsQuery } from '@/modules/profile/hooks/useReferenceData';
import { useUpdateProfile } from '@/modules/profile/hooks/useUpdateProfile';

export function EditLifestyleScreen() {
  const router = useRouter();
  const profileQuery = useProfileQuery();
  const relationshipGoalsQuery = useRelationshipGoalsQuery();
  const updateProfile = useUpdateProfile();
  const [choices, setChoices] = useState<LifestyleValues>(EMPTY_LIFESTYLE);
  const [relationshipGoalId, setRelationshipGoalId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profileQuery.data && !initialized) {
      setChoices({
        smoking: profileQuery.data.smoking,
        drinking: profileQuery.data.drinking,
        gymHabit: profileQuery.data.gymHabit,
        hasPets: profileQuery.data.hasPets,
        wantsChildren: profileQuery.data.wantsChildren,
      });
      setRelationshipGoalId(profileQuery.data.relationshipGoalId);
      setInitialized(true);
    }
  }, [profileQuery.data, initialized]);

  const handleSave = () => {
    updateProfile.mutate(
      {
        smoking: choices.smoking,
        drinking: choices.drinking,
        gym_habit: choices.gymHabit,
        has_pets: choices.hasPets,
        wants_children: choices.wantsChildren,
        relationship_goal_id: relationshipGoalId,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <EditScreenLayout
      title="Mode de vie"
      onSave={handleSave}
      saveDisabled={!isLifestyleComplete(choices)}
      saveLabel={updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {LIFESTYLE_CATEGORIES.map((category) => (
          <View key={category.key} className="mb-5">
            <View className="mb-2.5 flex-row items-center gap-1.5">
              <category.Icon size={12} color={colors.ink.muted} />
              <Text className="font-heading text-[10px] uppercase tracking-widest text-ink/40">
                {category.label}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {category.options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={choices[category.key] === option.value}
                  onPress={() => setChoices((prev) => ({ ...prev, [category.key]: option.value }))}
                />
              ))}
            </View>
          </View>
        ))}

        <View className="mb-5">
          <View className="mb-2.5 flex-row items-center gap-1.5">
            <HeartHandshake size={12} color={colors.ink.muted} />
            <Text className="font-heading text-[10px] uppercase tracking-widest text-ink/40">
              Objectif relationnel
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {relationshipGoalsQuery.data?.map((goal) => (
              <Chip
                key={goal.id}
                label={goal.label}
                selected={relationshipGoalId === goal.id}
                onPress={() => setRelationshipGoalId(goal.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </EditScreenLayout>
  );
}
