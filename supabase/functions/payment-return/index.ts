// Pont de retour CamerPay → application. CamerPay exige une URL http(s)
// valide comme merchant_return_url (le scheme afrolove:// était rejeté avec
// « Le champ merchant return url doit être une URL valide » — tous les
// paiements échouaient à l'initiation). Cette fonction publique reçoit donc
// la redirection du navigateur après paiement et renvoie immédiatement vers
// le deep link de l'app (afrolove://premium/callback), en conservant les
// paramètres de requête. Une page HTML de secours s'affiche si le navigateur
// bloque la redirection vers un scheme personnalisé.
//
// verify_jwt DOIT être off (voir supabase/config.toml) : l'appelant est le
// navigateur du client redirigé par CamerPay, pas une session Supabase.
// Aucune donnée sensible ne transite ici — la source de vérité du paiement
// reste payment-webhook / payment-status.

const APP_RETURN_SCHEME = Deno.env.get('APP_RETURN_SCHEME') ?? 'afrolove://premium/callback';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve((req) => {
  const url = new URL(req.url);
  const target = url.search ? `${APP_RETURN_SCHEME}${url.search}` : APP_RETURN_SCHEME;
  const safeTarget = escapeHtml(target);

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${safeTarget}" />
    <title>Retour vers AfriLove World…</title>
    <style>
      body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
             background:#221937; color:#fff; font-family:-apple-system, Roboto, sans-serif; text-align:center; }
      a.btn { display:inline-block; margin-top:18px; padding:14px 28px; border-radius:999px;
              background:#6A4FC0; color:#fff; text-decoration:none; font-weight:600; }
      p { color:rgba(255,255,255,0.55); font-size:14px; }
    </style>
  </head>
  <body>
    <div>
      <h1 style="font-size:22px">Paiement terminé</h1>
      <p>Retour automatique vers l'application…</p>
      <a class="btn" href="${safeTarget}">Ouvrir AfriLove World</a>
    </div>
    <script>window.location.replace(${JSON.stringify(target)});</script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
});
