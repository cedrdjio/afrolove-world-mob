import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { pushService } from '@/modules/notifications/services/pushService';

/** Mounted once inside the signed-in area: registers this device's push
 *  token (at most once per user per app session). */
export function usePushSync() {
  const { user } = useAuth();
  const registeredForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user || registeredForUser.current === user.id) return;
    registeredForUser.current = user.id;
    pushService.registerDevice(user.id);
  }, [user]);
}

/**
 * Mounted once at the app root: shows pushes received while the app is in
 * the foreground, and routes taps to the right screen (match/message pushes
 * carry match_id in their data payload — see send_push_on_notification).
 * All expo-notifications access is lazy: requiring the module on Android
 * Expo Go throws, and pushes only work in real builds anyway.
 */
export function usePushNavigation() {
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const Notifications = await import('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        const openFromData = (data: Record<string, unknown> | undefined) => {
          const matchId = data?.match_id;
          if (typeof matchId === 'string') {
            router.push(`/chat/${matchId}`);
          } else if (data?.type === 'kyc') {
            router.push('/kyc/pending');
          } else if (data?.type === 'like') {
            router.push('/notifications');
          }
        };

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          openFromData(response.notification.request.content.data as Record<string, unknown>);
        });

        // App launched cold from a push tap.
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          openFromData(lastResponse.notification.request.content.data as Record<string, unknown>);
        }

        cleanup = () => subscription.remove();
      } catch {
        // Expo Go / unsupported environment: silently skip push handling.
      }
    })();

    return () => cleanup?.();
  }, [router]);
}
