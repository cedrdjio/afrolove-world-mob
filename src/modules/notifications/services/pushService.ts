import { Platform } from 'react-native';
import { supabase } from '@/shared/services/supabase/client';

/**
 * Registers this device's Expo Push token for the signed-in user. The
 * database trigger `send_push_on_notification` then fans every in-app
 * notification out to all of the user's registered devices.
 *
 * expo-notifications is imported lazily everywhere in this app: on Android
 * Expo Go (SDK 53+), merely requiring the module throws because remote push
 * was removed from Expo Go — a development/preview build is required for
 * real pushes, and this function silently no-ops elsewhere.
 */
async function registerDevice(userId: string): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');

    // La permission est DEMANDÉE ici si elle ne l'a jamais été : beaucoup de
    // comptes existants n'ont jamais vu l'écran d'onboarding « notifications »
    // (ou l'ont passé) et aucun token n'était donc jamais enregistré — les
    // notifications n'arrivaient que dans l'onglet, jamais sur le téléphone.
    // Un refus explicite (canAskAgain=false) est respecté : on n'insiste pas.
    let { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' && canAskAgain) {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6A4FC0',
      });
    }

    const Constants = (await import('expo-constants')).default;
    const projectId: string | undefined = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return false;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return false;

    const { error } = await supabase.from('push_tokens').upsert(
      {
        token,
        profile_id: userId,
        platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' },
    );
    return !error;
  } catch {
    return false;
  }
}

/** Stops pushes to this user's devices — call before signing out. */
async function unregisterAllDevices(userId: string): Promise<void> {
  try {
    await supabase.from('push_tokens').delete().eq('profile_id', userId);
  } catch {
    // Logout must never be blocked by push cleanup.
  }
}

export const pushService = {
  registerDevice,
  unregisterAllDevices,
};
