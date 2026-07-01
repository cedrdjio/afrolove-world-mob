import { Stack } from 'expo-router';
import { RequireAuthForOnboarding } from '@/modules/auth/components/RequireAuthForOnboarding';

export default function OnboardingLayout() {
  return (
    <RequireAuthForOnboarding>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="carousel" options={{ animation: 'fade' }} />
        <Stack.Screen name="name" />
        <Stack.Screen name="birthday" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="looking-for" />
        <Stack.Screen name="location-permission" />
        <Stack.Screen name="notification-permission" />
        <Stack.Screen name="interests" />
        <Stack.Screen name="bio" />
        <Stack.Screen name="lifestyle" />
        <Stack.Screen name="upload-photos" />
        <Stack.Screen name="finish" options={{ animation: 'fade' }} />
      </Stack>
    </RequireAuthForOnboarding>
  );
}
