import { Redirect } from 'expo-router';

/**
 * Filet de sécurité pour tout deep link / URL qui ne correspond à aucune
 * route : on repasse par la racine (splash → résolution de session) au lieu
 * de laisser expo-router afficher un écran d'erreur « Unmatched route ».
 */
export default function NotFoundScreen() {
  return <Redirect href="/" />;
}
