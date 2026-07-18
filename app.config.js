const fs = require('fs');
const path = require('path');

/**
 * Étend app.json sans le dupliquer : branche automatiquement le fichier
 * google-services.json (Firebase Cloud Messaging) quand il est présent.
 * Sans lui, un build Android ne peut PAS obtenir de token push — les
 * notifications restent dans l'onglet de l'app et n'atteignent jamais le
 * téléphone.
 *
 * Deux façons de fournir le fichier :
 *   · en local : déposer google-services.json à la racine du repo ;
 *   · sur EAS : créer un secret de type « file » nommé GOOGLE_SERVICES_JSON
 *     (eas secret:create --scope project --name GOOGLE_SERVICES_JSON \
 *      --type file --value ./google-services.json) — EAS matérialise le
 *     fichier au build et met son chemin dans la variable d'environnement.
 */
module.exports = ({ config }) => {
  const candidate = process.env.GOOGLE_SERVICES_JSON ?? path.join(__dirname, 'google-services.json');
  if (fs.existsSync(candidate)) {
    config.android = { ...config.android, googleServicesFile: candidate };
  }
  return config;
};
