// bench_labo/benchmarks/bench_front.mjs
import { chromium } from 'playwright';

// Les 3 frontends que tu veux benchmarker
const apps = [
  { name: 'React',   url: 'http://localhost:4000' },
  { name: 'Vue',     url: 'http://localhost:4001' },
  { name: 'Angular', url: 'http://localhost:4002' },
];

async function benchApp(browser, app) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  const start = Date.now();
  await page.goto(app.url, { waitUntil: 'networkidle' });
  const end = Date.now();

  // Récupère toutes les infos de performance
  const navigationTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return nav ? nav.toJSON() : null;
  });

  const paints = await page.evaluate(() =>
    performance
      .getEntriesByType('paint')
      .map((e) => ({ name: e.name, startTime: e.startTime }))
  );

  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((r) => r.initiatorType === 'script' || r.initiatorType === 'link')
      .map((r) => ({
        name: r.name,
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        initiatorType: r.initiatorType,
      }))
  );

  await context.close();

  const firstPaint =
    paints.find((p) => p.name === 'first-paint')?.startTime ?? null;
  const firstContentfulPaint =
    paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;

  return {
    name: app.name,
    url: app.url,
    totalTimeMs: end - start,
    navigationTiming,
    firstPaint,
    firstContentfulPaint,
    resources,
  };
}

function printResult(result) {
  const nav = result.navigationTiming;

  console.log('==============================');
  console.log(`Frontend : ${result.name}`);
  console.log(`URL      : ${result.url}`);
  console.log('------------------------------');

  if (!nav) {
    console.log('⚠️  Pas de données navigation Performance API');
    return;
  }

  const ttfb = nav.responseStart - nav.startTime;
  const domContentLoaded = nav.domContentLoadedEventEnd - nav.startTime;
  const loadEvent = nav.loadEventEnd - nav.startTime;

  console.log(`TTFB (responseStart)      : ${ttfb.toFixed(1)} ms`);
  console.log(`DOM Content Loaded        : ${domContentLoaded.toFixed(1)} ms`);
  console.log(`Load Event End            : ${loadEvent.toFixed(1)} ms`);

  if (result.firstPaint != null) {
    console.log(`First Paint               : ${result.firstPaint.toFixed(1)} ms`);
  }
  if (result.firstContentfulPaint != null) {
    console.log(
      `First Contentful Paint    : ${result.firstContentfulPaint.toFixed(1)} ms`
    );
  }

  console.log(`Temps total (goto → idle) : ${result.totalTimeMs} ms`);

  const totalJs = result.resources
    .filter((r) => r.name.endsWith('.js'))
    .reduce((sum, r) => sum + (r.transferSize || r.encodedBodySize || 0), 0);

  console.log(`Taille approx. JS chargée : ${(totalJs / 1024).toFixed(1)} kB`);
  console.log('==============================\n');
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const app of apps) {
    try {
      const result = await benchApp(browser, app);
      printResult(result);
    } catch (err) {
      console.error(`Erreur pour ${app.name} (${app.url})`, err);
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
