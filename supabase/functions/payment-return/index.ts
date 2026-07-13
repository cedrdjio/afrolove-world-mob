// Pont de retour CamerPay → application. CamerPay exige une URL http(s)
// valide comme merchant_return_url (le scheme afrolove:// était rejeté avec
// « Le champ merchant return url doit être une URL valide » — tous les
// paiements échouaient à l'initiation). Cette fonction publique reçoit donc
// la redirection du navigateur après paiement et renvoie vers le deep link
// de l'app (afrolove://premium/callback) en conservant les paramètres.
//
// Redirection 302 directe : la première version renvoyait une page HTML,
// que certains navigateurs affichaient en code source brut (Content-Type
// perdu en route) sans jamais exécuter la redirection JS. Le 302 est suivi
// nativement — expo-web-browser (openAuthSessionAsync) intercepte le scheme
// et referme la feuille de paiement ; app fermée, l'OS ouvre l'app via le
// deep link (route app/premium/callback).
//
// verify_jwt DOIT être off (voir supabase/config.toml) : l'appelant est le
// navigateur du client redirigé par CamerPay, pas une session Supabase.
// Aucune donnée sensible ne transite ici — la source de vérité du paiement
// reste payment-webhook / payment-status.

const APP_RETURN_SCHEME = Deno.env.get('APP_RETURN_SCHEME') ?? 'afrolove://premium/callback';

Deno.serve((req) => {
  const url = new URL(req.url);
  const target = url.search ? `${APP_RETURN_SCHEME}${url.search}` : APP_RETURN_SCHEME;

  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      'Cache-Control': 'no-store',
    },
  });
});
