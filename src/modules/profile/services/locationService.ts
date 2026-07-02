import * as Location from 'expo-location';
import { supabase } from '@/shared/services/supabase/client';

/**
 * Captures the device position and persists it on the profile row. The
 * database turns lat/lng into a PostGIS point (generated `location` column),
 * which powers the proximity ordering and distance filter of
 * `search_profiles` — so this is the single write that makes "près de chez
 * vous" work. City/country come from reverse geocoding so the profile shows
 * a human-readable place, not coordinates.
 *
 * Never throws: location is an enhancement, not a requirement — a denied
 * permission or a geocoder hiccup must not break onboarding or app start.
 */
async function captureAndSaveLocation(userId: string): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;

    let city: string | null = null;
    let country: string | null = null;
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      city = place?.city ?? place?.subregion ?? null;
      country = place?.country ?? null;
    } catch {
      // Coordinates alone are still enough for proximity search.
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        latitude,
        longitude,
        ...(city ? { city } : {}),
        ...(country ? { country } : {}),
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
    return !error;
  } catch {
    return false;
  }
}

/** Marks the user as recently active — feeds the "En ligne" discovery chip. */
async function touchLastActive(userId: string): Promise<void> {
  await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .then(() => {});
}

export const locationService = {
  captureAndSaveLocation,
  touchLastActive,
};
