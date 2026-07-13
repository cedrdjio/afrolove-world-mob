import { Redirect } from 'expo-router';

/**
 * Cible du deep link afrolove://premium/callback (retour de la page de
 * paiement CamerPay via payment-return). Quand la feuille de paiement est
 * encore ouverte, expo-web-browser intercepte ce lien avant la navigation ;
 * mais si l'app a été relancée par le lien (feuille fermée, app tuée…),
 * expo-router route ici. Sans cette route, le lien partait en « route
 * inconnue » et l'app plantait sur l'écran d'erreur.
 *
 * L'écran de résolution rafraîchit la session et renvoie au bon endroit ;
 * le statut du paiement, lui, est réglé côté serveur (webhook/status).
 */
export default function PremiumCallbackScreen() {
  return <Redirect href="/(auth)/resolving" />;
}
