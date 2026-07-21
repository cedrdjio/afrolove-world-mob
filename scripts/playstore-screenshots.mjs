// ============================================================================
// Captures d'écran Play Store — AfriLove World
// ----------------------------------------------------------------------------
// Génère des captures 1080x1920 (format téléphone exigé par Google Play) en
// pilotant l'app en version web via Playwright, connectée à la vraie base.
//
// PRÉREQUIS (à faire une seule fois, sur ta machine — pas dans le cloud) :
//   1. Avoir lancé le script SQL supabase/seed/demo_users.sql sur ta base
//      (crée le compte demo001@demo.afrilove.app / Demo!2026).
//   2. npm i -D playwright && npx playwright install chromium
//
// UTILISATION (2 terminaux) :
//   Terminal 1 :  npm run web           # démarre le serveur Expo web (:8081)
//   Terminal 2 :  node scripts/playstore-screenshots.mjs
//
// Les images atterrissent dans ./playstore-screenshots/
// ============================================================================

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.WEB_URL ?? 'http://localhost:8081';
const EMAIL = process.env.DEMO_EMAIL ?? 'demo001@demo.afrilove.app';
const PASSWORD = process.env.DEMO_PASSWORD ?? 'Demo!2026';
const OUT_DIR = 'playstore-screenshots';

// Viewport 432x768 x deviceScaleFactor 2.5 => image 1080x1920 (ratio 9:16).
const VIEWPORT = { width: 432, height: 768 };
const SCALE = 2.5;

mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  await sleep(1200); // laisse les animations/reanimated se poser
  await page.screenshot({ path: `${OUT_DIR}/${name}.png` });
  console.log(`  ✓ ${name}.png`);
}

async function goto(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(1500);
}

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: true,
    locale: 'fr-FR',
  });
  const page = await context.newPage();

  console.log('→ Ouverture de l\'app…');
  await goto(page, '/login');

  // --- Connexion en tant que compte démo -----------------------------------
  console.log('→ Connexion demo001…');
  try {
    await page.getByPlaceholder('Adresse email').fill(EMAIL);
    await page.getByPlaceholder('••••••••••').fill(PASSWORD);
    await shot(page, '00-login');
    await page.getByText('Se connecter', { exact: true }).click();
    await page.waitForURL(/discover|tabs|\/$/, { timeout: 20000 }).catch(() => {});
    await sleep(4000); // chargement du deck de découverte
  } catch (e) {
    console.warn('  ⚠ Étape de connexion à ajuster :', e.message);
  }

  // --- Écrans principaux ----------------------------------------------------
  const screens = [
    ['/discover', '01-decouverte'],
    ['/matches', '02-matchs'],
    ['/messages', '03-messages'],
    ['/profile', '04-mon-profil'],
  ];
  for (const [path, name] of screens) {
    console.log(`→ ${name}…`);
    await goto(page, path);
    await shot(page, name);
  }

  // --- Une fiche de profil détaillée (ouvre le 1er profil du deck) ----------
  try {
    console.log('→ fiche profil…');
    await goto(page, '/discover');
    await sleep(3000);
    // clic au centre de la carte pour ouvrir le profil
    await page.mouse.click(VIEWPORT.width / 2, VIEWPORT.height / 2);
    await sleep(2500);
    await shot(page, '05-fiche-profil');
  } catch (e) {
    console.warn('  ⚠ fiche profil à ajuster :', e.message);
  }

  await browser.close();
  console.log(`\n✅ Terminé. Images dans ./${OUT_DIR}/`);
  console.log('   Garde-en 4 à 8 pour la fiche Play Store (min. 2, 1080x1920).');
};

run().catch((e) => {
  console.error('Échec :', e);
  process.exit(1);
});
