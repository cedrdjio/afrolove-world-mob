import '@/shared/styles/global.css';
import '@/shared/utils/register-css-interop';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from '@/shared/hooks/useAppFonts';
import { colors } from '@/shared/constants/theme';
import { queryClient } from '@/shared/services/queryClient';
import { OfflineOverlay } from '@/shared/components/feedback';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useInitializeAuth } from '@/modules/auth/hooks/useAuth';
import { useAuthDeepLink } from '@/modules/auth/hooks/useAuthDeepLink';
import { usePushNavigation } from '@/modules/notifications/hooks/usePush';
import { initMonitoring } from '@/shared/services/monitoring';

SplashScreen.preventAutoHideAsync().catch(() => {});
initMonitoring();

function AppBootstrap() {
  useInitializeAuth();
  useAuthDeepLink();
  usePushNavigation();
  return null;
}

export default function RootLayout() {
  const { loaded, error } = useAppFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AppBootstrap />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.cream.DEFAULT },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="profile-completion" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="discover-filters" options={{ presentation: 'modal' }} />
              <Stack.Screen name="discover-like-limit" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="profile" />
              <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
              <Stack.Screen name="chat" />
              <Stack.Screen name="matches" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="matches-search" options={{ presentation: 'modal' }} />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="search" options={{ presentation: 'modal' }} />
              <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
              <Stack.Screen name="kyc" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="reports" options={{ presentation: 'modal' }} />
              <Stack.Screen name="legal/[key]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="blocked-users" />
              <Stack.Screen name="system" />
            </Stack>
            <OfflineOverlay />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
