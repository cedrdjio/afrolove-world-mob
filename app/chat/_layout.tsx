import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/emoji-picker" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
