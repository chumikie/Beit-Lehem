'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const { buildGeminiPreview } = require('./build-gemini-preview.cjs');
const { extractEmbeddedMap } = require('./current-geodata.cjs');

const root = path.resolve(__dirname, '..');
const outputDir = path.join(
  process.env.RUNNER_TEMP || os.tmpdir(),
  'beit-lehem-visual-review'
);
fs.mkdirSync(outputDir, { recursive: true });

const htmlPath = path.join(os.tmpdir(), 'beit-lehem-visual-temporary.html');
const result = buildGeminiPreview(root, path.relative(root, htmlPath));
const html = fs.readFileSync(result.outputPath, 'utf8');
const map = extractEmbeddedMap(html);

assert.equal(map.roads.length, 462);
assert.equal(map.areas.length, 20);
assert.equal(map.points.length, 9);
assert.equal(map.localPlaces.length, 9);
assert.equal(map.streetNameCount, 86);

const pageErrors = [];
const consoleErrors = [];
const report = {
  buildBytes: result.bytes,
  map: {
    roads: map.roads.length,
    areas: map.areas.length,
    osmPoints: map.points.length,
    localPlaces: map.localPlaces.length,
    streetNames: map.streetNameCount,
    localPlaceExamples: map.localPlaces.slice(0, 4).map(place => place.displayName)
  },
  viewports: {},
  pageErrors,
  consoleErrors,
  generatedFiles: ['temporary build outside the repository'],
  versionedPreviewsWritten: false
};

const server = http.createServer((req, res) => {
  if (req.url !== '/' && req.url !== '/index.html') {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(html);
});

async function collectLayout(page, label) {
  return page.evaluate(({ label }) => {
    const selectors = [
      '#world', '.topbar', '.layout', '.game', '#sidebar', '#welcome',
      '#touchPad', '#mobileRoute', '.mini-wrap', '#destination',
      '#mapButton', '#start', '#mapDialog', '#bigmap'
    ];
    const rects = Object.fromEntries(selectors.map(selector => {
      const element = document.querySelector(selector);
      if (!element) return [selector, null];
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return [selector, {
        visible: style.display !== 'none' && style.visibility !== 'hidden' &&
          rect.width > 0 && rect.height > 0,
        x: Math.round(rect.x), y: Math.round(rect.y),
        width: Math.round(rect.width), height: Math.round(rect.height),
        right: Math.round(rect.right), bottom: Math.round(rect.bottom)
      }];
    }));
    const overflow = {
      document: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      body: document.body.scrollWidth > document.documentElement.clientWidth,
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportHeight: document.documentElement.clientHeight,
      documentHeight: document.documentElement.scrollHeight
    };
    const canvas = document.querySelector('#world');
    let canvasInk = 0;
    if (canvas && canvas.width && canvas.height) {
      const ctx = canvas.getContext('2d');
      const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const stride = Math.max(4, Math.floor(sample.length / 12000 / 4) * 4);
      for (let i = 3; i < sample.length; i += stride) {
        if (sample[i] > 0) canvasInk++;
      }
    }
    return {
      label, rects, overflow, canvasInk,
      locationLabel: document.querySelector('#location')?.textContent?.trim() || null,
      welcomeVisible: visible(document.querySelector('#welcome')),
      touchControlsVisible: visible(document.querySelector('#touchPad'))
    };
  }, { label });
}

async function captureViewport(browser, baseUrl, name, viewport, mobile) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: 'light'
  });
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(name + ': ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(name + ': ' + message.text());
  });
  await page.route('https://**/*', route => route.abort());
  await page.goto(baseUrl, { waitUntil: 'load', timeout: 60000 });
  await page.locator('#world').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(900);
  const initial = await collectLayout(page, name + '-welcome');
  await page.screenshot({
    path: path.join(outputDir, name + '-welcome.png'),
    fullPage: false,
    animations: 'disabled'
  });

  await page.locator('#start').click({ timeout: 15000 });
  await page.waitForFunction(() => {
    const welcome = document.querySelector('#welcome');
    return welcome && getComputedStyle(welcome).display === 'none';
  }, null, { timeout: 15000 });
  await page.waitForTimeout(800);

  // Zoom one notch for a close inspection of houses, vegetation and street labels.
  const zoomIn = page.locator('#zoomIn');
  if (await zoomIn.isVisible().catch(() => false)) {
    await zoomIn.click();
    await page.waitForTimeout(200);
  }

  const gameplay = await collectLayout(page, name + '-game');
  await page.screenshot({
    path: path.join(outputDir, name + '-game.png'),
    fullPage: false,
    animations: 'disabled'
  });

  // Check that the label beside the player is a canonical OSM street name.
  const label = gameplay.locationLabel;
  const canonicalNames = new Set(map.roads.map(road => road.tags.name).filter(Boolean));
  const streetLabelValid = !label || label === 'Caminho sem nome mapeado' ||
    canonicalNames.has(label);

  // Check the real map dialog and its canvas, not merely the button markup.
  let mapDialog = { opened: false, canvas: null };
  const mapButton = page.locator('#mapButton');
  if (await mapButton.isVisible().catch(() => false)) {
    await mapButton.click();
  } else {
    await page.keyboard.press('m');
  }
  await page.waitForTimeout(350);
  mapDialog = await page.evaluate(() => {
    const dialog = document.querySelector('#mapDialog');
    const canvas = document.querySelector('#bigmap');
    const rect = canvas?.getBoundingClientRect();
    return {
      opened: !!dialog?.open,
      canvas: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null
    };
  });
  if (mapDialog.opened) {
    await page.screenshot({
      path: path.join(outputDir, name + '-map.png'),
      fullPage: false,
      animations: 'disabled'
    });
    assert.ok(mapDialog.canvas?.width > 240, name + ': mapa ampliado precisa ter largura útil');
    assert.ok(mapDialog.canvas?.height > 180, name + ': mapa ampliado precisa ter altura útil');
    await page.locator('[data-close="mapDialog"]').click();
  }

  let movement = { controlVisible: false, localStorageKeys: [], saveVersion: null, saveMapSource: null };
  if (mobile) {
    const right = page.locator('#touchPad [data-move="right"]');
    movement.controlVisible = await right.isVisible().catch(() => false);
    if (movement.controlVisible) {
      const box = await right.boundingBox();
      assert.ok(box, 'controle tátil precisa ter uma área clicável');
      const touch = await context.newCDPSession(page);
      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ id: 1, x: point.x, y: point.y, radiusX: 5, radiusY: 5, force: 1 }]
      });
      await page.waitForTimeout(650);
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await touch.detach();
    }
  } else {
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(650);
    await page.keyboard.up('ArrowRight');
  }
  await page.waitForTimeout(1500);
  movement = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const saveKey = keys.find(key => key === 'roncador-expedition-v2-referencias-gemini');
    let data = null;
    try { data = saveKey ? JSON.parse(localStorage.getItem(saveKey)) : null; } catch {}
    return {
      controlVisible: !!document.querySelector('#touchPad') &&
        getComputedStyle(document.querySelector('#touchPad')).display !== 'none',
      localStorageKeys: keys,
      saveVersion: data?.v ?? null,
      saveMapSource: data?.mapSource ?? null,
      playerCoordinatesFinite: Number.isFinite(data?.player?.x) && Number.isFinite(data?.player?.y)
    };
  });
  movement.saveValid = movement.saveVersion === 3 &&
    movement.saveMapSource === map.source && movement.playerCoordinatesFinite;

  const finalLayout = await collectLayout(page, name + '-after-input');
  await page.screenshot({
    path: path.join(outputDir, name + '-after-input.png'),
    fullPage: false,
    animations: 'disabled'
  });

  const result = {
    viewport, mobile, initial, gameplay, finalLayout,
    streetLabel: label,
    streetLabelIsCanonical: streetLabelValid,
    mapDialog, movement
  };
  report.viewports[name] = result;

  assert.ok(gameplay.rects['#world']?.visible, name + ': canvas do jogo precisa estar visível');
  assert.ok(gameplay.canvasInk > 0, name + ': canvas precisa conter desenho');
  assert.ok(streetLabelValid, name + ': rótulo de rua não corresponde a nome OSM');
  if (mobile) {
    assert.ok(movement.controlVisible, 'controles táteis precisam estar visíveis no celular');
  }
  assert.ok(movement.saveValid, name + ': save deve preservar versão, fonte do mapa e coordenadas');
  assert.equal(pageErrors.length, 0, 'erros de execução JavaScript durante visualização');
  await context.close();
  return result;
}

(async () => {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const baseUrl = 'http://127.0.0.1:' + address.port + '/';
  const browser = await chromium.launch({ headless: true });
  try {
    await captureViewport(browser, baseUrl, 'desktop', { width: 1440, height: 960 }, false);
    await captureViewport(browser, baseUrl, 'mobile', { width: 390, height: 844 }, true);
  } finally {
    await browser.close();
    server.close();
  }

  report.pageErrors = pageErrors;
  report.consoleErrors = consoleErrors;
  report.screenshots = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
  fs.writeFileSync(
    path.join(outputDir, 'visual-report.json'),
    JSON.stringify(report, null, 2) + '\n'
  );

  console.log('VISUAL_REPORT=' + JSON.stringify(report));
  console.log('Capturas temporárias: ' + report.screenshots.join(', '));
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
  try { server.close(); } catch {}
});
