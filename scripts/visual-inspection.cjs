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
      '#touchPad', '#mobileRoute', '.mini-wrap', '#destination', '#location',
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
    const hudSelectors = ['#touchPad', '#mobileRoute', '#interact', '#observe',
      '.street-pulse', '.mini-wrap', '#zoomIn', '#zoomOut'];
    const hudRects = hudSelectors.map(selector => {
      const element = document.querySelector(selector), box = element?.getBoundingClientRect();
      const style = element && getComputedStyle(element);
      return box && style?.display !== 'none' && style?.visibility !== 'hidden' &&
        box.width > 0 && box.height > 0 ? { selector, box } : null;
    }).filter(Boolean);
    const hudCollisions = [];
    for (let i = 0; i < hudRects.length; i++) for (let j = i + 1; j < hudRects.length; j++) {
      const a = hudRects[i], b = hudRects[j];
      const width = Math.max(0, Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left));
      const height = Math.max(0, Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top));
      const ratio = width * height / Math.min(a.box.width * a.box.height, b.box.width * b.box.height);
      if (ratio > .12) hudCollisions.push({ a: a.selector, b: b.selector, ratio: +ratio.toFixed(2) });
    }
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
      label, rects, overflow, canvasInk, hudCollisions,
      locationLabel: document.querySelector('#location')?.textContent?.trim() || null,
      locationLabelClipped: (() => {
        const element = document.querySelector('#location');
        return !!element && element.scrollWidth > element.clientWidth + 1;
      })(),
      welcomeVisible: (() => {
        const element = document.querySelector('#welcome');
        const style = element && getComputedStyle(element);
        return !!element && style.display !== 'none' && style.visibility !== 'hidden';
      })(),
      touchControlsVisible: (() => {
        const element = document.querySelector('#touchPad');
        const style = element && getComputedStyle(element);
        const rect = element?.getBoundingClientRect();
        return !!element && style.display !== 'none' && style.visibility !== 'hidden' &&
          rect.width > 0 && rect.height > 0;
      })()
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

  // C19.2: attempt the actual nearby E/touch conversation, without teleporting
  // a resident or changing the simulated day. A missing reachable speaker is
  // reported as such, not manufactured as a successful encounter.
  const conversation = { available: false, opened: false, dialog: null, returned: false };
  const nearbyInteract = page.locator('#interact');
  conversation.available = await nearbyInteract.isVisible().catch(() => false);
  if (conversation.available) {
    await nearbyInteract.click();
    conversation.dialog = await page.locator('#guideDialog, #secondaryDialog, #lifeDialog')
      .evaluateAll(nodes => nodes.find(dialog => dialog.open)?.id || null);
    conversation.opened = !!conversation.dialog;
    if (conversation.opened) {
      assert.equal(await page.locator('dialog[open]').count(), 1,
        name + ': conversa real não deve sobrepor outras janelas');
      await page.keyboard.press('Escape');
      conversation.returned = await page.locator('dialog[open]').count() === 0;
      assert.ok(conversation.returned, name + ': Escape deve devolver à caminhada');
    }
  }

  // Follow the in-game resident notebook's existing "Encontrar pelo mapa"
  // action. This uses the live street schedule and pathfinder, never injected
  // coordinates, clock changes, teleportation or scripted dialogue outcomes.
  const residentEncounters = [];
  if (name !== 'mobile-narrow') {
    const candidates = await page.evaluate(() => {
      const state = expeditionState;
      const ids = new Set(window.RoncadorLivingWorld.RESIDENTS.map(person => person.id));
      return state.streetResidents.filter(person => ids.has(person.id))
        .map(person => ({ id: person.id,
          distance: Math.round(Math.hypot(person.x - state.position.x, person.y - state.position.y)) }))
        .sort((a, b) => a.distance - b.distance).slice(0, 3);
    });
    for (const candidate of candidates) {
      if (residentEncounters.filter(item => item.talked).length >= 2) break;
      const encounter = { id: candidate.id, initialDistance: candidate.distance,
        routed: false, reached: false, talked: false, reason: null };
      if (mobile) await page.locator('#mobileRoute').click();
      await page.locator('#openLife').click();
      const cardIndex = await page.evaluate(id =>
        window.RoncadorLivingWorld.RESIDENTS.findIndex(person => person.id === id), candidate.id);
      const action = page.locator('#residentGrid .resident-card').nth(cardIndex).locator('button');
      if (cardIndex < 0 || await action.isDisabled()) {
        encounter.reason = 'morador indisponível na rotina atual';
        await page.keyboard.press('Escape');
        residentEncounters.push(encounter);
        continue;
      }
      const previousBond = await page.evaluate(id => expeditionState.residentBonds[id], candidate.id);
      await action.click();
      const openDialogIds = () => page.locator('dialog[open]').evaluateAll(nodes => nodes.map(dialog => dialog.id));
      let activeDialogs = await openDialogIds();
      if (activeDialogs.length) {
        // Close-range actions may open secondaryDialog, not only the resident notebook.
        encounter.reached = true;
      } else {
        encounter.routed = (await page.evaluate(() => expeditionState.routeRemaining)) > 0;
        if (encounter.routed) {
          encounter.reached = await page.waitForFunction(id => {
            const state = expeditionState;
            const resident = state.streetResidents.find(person => person.id === id);
            return resident && Math.hypot(resident.x - state.position.x, resident.y - state.position.y) < 39;
          }, candidate.id, { timeout: 18000 }).then(() => true).catch(() => false);
          if (encounter.reached) {
            // Exercise the exact notebook button reported as apparently inert,
            // not only the E shortcut. No NPC or player position is injected.
            if (mobile) await page.locator('#mobileRoute').click();
            await page.locator('#openLife').click();
            const talkButton = page.locator('#residentGrid .resident-card').nth(cardIndex).locator('button');
            encounter.talkButtonVisible = (await talkButton.textContent()).includes('💬');
            if (encounter.talkButtonVisible) {
              await talkButton.click();
              await page.waitForTimeout(150);
              encounter.replyFocused = await page.locator('#lifeConversation').evaluate(el =>
                document.activeElement === el && !!el.textContent?.trim());
            } else await page.keyboard.press('Escape');
          }
        }
      }
      if (encounter.reached) {
        activeDialogs = await openDialogIds();
        const currentBond = await page.evaluate(id => expeditionState.residentBonds[id], candidate.id);
        encounter.dialog = activeDialogs.at(-1) || null;
        encounter.talked = !!encounter.dialog && currentBond > previousBond;
        if (encounter.talkButtonVisible && encounter.talked)
          assert.ok(encounter.replyFocused, name + ': Falar deve destacar a resposta no Caderno');
        // Escape the actual existing conversation dialog before selecting another resident.
        for (let attempt = 0; attempt < 3 && (await openDialogIds()).length; attempt++) {
          await page.keyboard.press('Escape');
        }
      }
      if (!encounter.talked) encounter.reason = encounter.routed
        ? 'não alcançado durante a janela de caminhada' : 'sem rota acessível neste momento';
      residentEncounters.push(encounter);
    }
  }

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

  // Inspect the densest facade scale as a separate capture. Zoom is transient
  // presentation state: no world geometry, route or save data is rewritten.
  let closeupZoomClicks = 0;
  if (await zoomIn.isVisible().catch(() => false)) {
    for (let i = 0; i < 5; i++) {
      await zoomIn.click();
      closeupZoomClicks++;
      await page.waitForTimeout(90);
    }
  }
  const closeup = await collectLayout(page, name + '-closeup');
  await page.screenshot({
    path: path.join(outputDir, name + '-closeup.png'),
    fullPage: false,
    animations: 'disabled'
  });
  assert.equal(closeup.overflow.document, false,
    name + ': zoom próximo não deve criar overflow horizontal');
  assert.ok(closeup.canvasInk > 0,
    name + ': a inspeção próxima precisa conter desenho visível');

  // Check that the label beside the player is a canonical OSM street name.
  const label = gameplay.locationLabel;
  const canonicalNames = new Set(map.roads.map(road => road.tags.name).filter(Boolean));
  const streetLabelValid = !label ||
    ['Caminho sem nome mapeado', 'Um caminho de Belém', 'Pelos caminhos de Belém'].includes(label) ||
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
  assert.ok(mapDialog.opened, name + ': mapa da expedição precisa abrir');
  let routeSelection = { selected: false, message: null };
  if (mapDialog.opened) {
    await page.screenshot({
      path: path.join(outputDir, name + '-map.png'),
      fullPage: false,
      animations: 'disabled'
    });
    assert.ok(mapDialog.canvas?.width > 240, name + ': mapa ampliado precisa ter largura útil');
    assert.ok(mapDialog.canvas?.height > 180, name + ': mapa ampliado precisa ter altura útil');

    const mapCanvas = page.locator('#bigmap');
    const mapBox = await mapCanvas.boundingBox();
    assert.ok(mapBox, name + ': mapa ampliado precisa aceitar interação');
    for (const target of [[0.64, 0.55], [0.42, 0.65], [0.72, 0.38]]) {
      await mapCanvas.click({
        position: { x: mapBox.width * target[0], y: mapBox.height * target[1] }
      });
      await page.waitForTimeout(260);
      const routeState = await page.evaluate(() => ({
        dialogOpen: !!document.querySelector('#mapDialog')?.open,
        message: document.querySelector('#toast')?.textContent?.trim() || '',
        distance: document.querySelector('#distance')?.textContent?.trim() || ''
      }));
      if (routeState.message.includes('Caminho marcado pelas ruas')) {
        routeSelection = {
          selected: true,
          message: routeState.message,
          distance: routeState.distance,
          target
        };
        break;
      }
      if (!routeState.dialogOpen) {
        if (await mapButton.isVisible().catch(() => false)) await mapButton.click();
        else await page.keyboard.press('m');
        await page.waitForTimeout(180);
      }
    }
    assert.ok(routeSelection.selected,
      name + ': selecionar um trecho do mapa deve marcar uma rota pelas ruas');
  }

  // C19: verify real control transitions and recovery before resumed walking.
  const interactionAudit = { album: false, help: false, observation: false, mobileRoute: false,
    mapEscape: false, sidebarEscape: false, modalIsolation: false, saveRestored: false,
    residentNotebook: false, culturalActivity: false, contactsShortcut: false,
    routeBeforeNotebook: null, routeDuringNotebook: null, routePreserved: null,
    cameraShortcutPreservesRoute: false };
  if (mobile) {
    if (await page.locator('#mobileRoute').isVisible()) {
      await page.locator('#mobileRoute').click();
      interactionAudit.mobileRoute = await page.locator('#sidebar').evaluate(el => el.classList.contains('open'));
      assert.ok(interactionAudit.mobileRoute, name + ': rota móvel deve abrir o painel');
      await page.locator('#closeRoute').click();
      assert.equal(await page.locator('#sidebar').evaluate(el => el.classList.contains('open')),
        false, name + ': painel móvel deve fechar');
      await page.locator('#mobileRoute').click();
      interactionAudit.routeBeforeNotebook = await page.evaluate(() => expeditionState.routeRemaining);
      await page.locator('#openLife').click();
      interactionAudit.residentNotebook = await page.locator('#lifeDialog').evaluate(el => el.open);
      assert.ok(interactionAudit.residentNotebook, name + ': Caderno deve abrir pelo diário tátil');
      interactionAudit.routeDuringNotebook = await page.evaluate(() => expeditionState.routeRemaining);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#lifeDialog').evaluate(el => el.open), false,
        name + ': Escape deve devolver ao diário após abrir o Caderno');
      await page.locator('#mobileRoute').click();
      await page.keyboard.press('Escape');
      interactionAudit.sidebarEscape = !(await page.locator('#sidebar').evaluate(el => el.classList.contains('open')));
      assert.ok(interactionAudit.sidebarEscape, name + ': Escape deve fechar o roteiro móvel');
    }
  } else {
    const beforeObservation = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem('roncador-expedition-v2-referencias-gemini') || '{}');
      return { observations:saved.observations||[], worldMoments:saved.worldMoments||[],
        waterMemories:saved.waterMemories||[], ruaNovaPaths:saved.ruaNovaPaths||[],
        streetVignettes:saved.streetVignettes||[], seasonalMemories:saved.seasonalMemories||[],
        everydayMemories:saved.everydayMemories||[], camucaStories:saved.camucaStories||[],
        morningEncounters:saved.morningEncounters||[], waterTalks:saved.waterTalks||[],
        notes:saved.living?.notes||[] };
    });
    const previousToast=(await page.locator('#toast').textContent()||'').trim();
    await page.locator('#observe').click();
    await page.waitForTimeout(120);
    const observationResult=await page.evaluate(before=>{
      const saved=JSON.parse(localStorage.getItem('roncador-expedition-v2-referencias-gemini')||'{}');
      const collections=['observations','worldMoments','waterMemories','ruaNovaPaths','streetVignettes',
        'seasonalMemories','everydayMemories','camucaStories','morningEncounters','waterTalks'];
      const persisted=collections.some(key=>JSON.stringify(saved[key]||[])!==JSON.stringify(before[key]||[]))||
        JSON.stringify(saved.living?.notes||[])!==JSON.stringify(before.notes||[]);
      const toast=document.querySelector('#toast');
      return {persisted,toastVisible:!!toast?.classList.contains('visible'),toastText:toast?.textContent?.trim()||''};
    },beforeObservation);
    interactionAudit.observation=observationResult.persisted||
      (observationResult.toastVisible&&!!observationResult.toastText&&observationResult.toastText!==previousToast);
    interactionAudit.observationMode=observationResult.persisted?'saved':'contextual-pause';
    assert.ok(interactionAudit.observation, 'Observar deve guardar uma lembrança ou iniciar a pausa contextual existente');
    await page.locator('.extras-cabinet > summary').click();
    await page.locator('#openAlbum').click();
    interactionAudit.album = await page.locator('#albumDialog').evaluate(el => el.open);
    assert.ok(interactionAudit.album, 'álbum deve abrir');
    interactionAudit.modalIsolation = await page.locator('dialog[open]').count() === 1;
    assert.ok(interactionAudit.modalIsolation, 'álbum não deve abrir sobre outra janela');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#albumDialog').evaluate(el => el.open), false,
      'Escape deve fechar o álbum');
    await page.locator('#help').click();
    interactionAudit.help = await page.locator('#helpDialog').evaluate(el => el.open);
    assert.ok(interactionAudit.help, 'ajuda deve abrir');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#helpDialog').evaluate(el => el.open), false,
      'Escape deve fechar a ajuda');
    interactionAudit.routeBeforeNotebook = await page.evaluate(() => expeditionState.routeRemaining);
    await page.locator('#openLife').click();
    interactionAudit.residentNotebook = await page.locator('#lifeDialog').evaluate(el => el.open);
    assert.ok(interactionAudit.residentNotebook, 'Caderno dos moradores deve abrir');
    interactionAudit.routeDuringNotebook = await page.evaluate(() => expeditionState.routeRemaining);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#lifeDialog').evaluate(el => el.open), false,
      'Escape deve fechar o Caderno');
    await page.locator('#openFestival').click();
    interactionAudit.culturalActivity = await page.locator('#festivalDialog').evaluate(el => el.open);
    assert.ok(interactionAudit.culturalActivity, 'atividade cultural deve abrir');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#festivalDialog').evaluate(el => el.open), false,
      'Escape deve fechar a atividade cultural');
    await page.keyboard.press('c');
    interactionAudit.contactsShortcut = await page.locator('#contactsDialog').evaluate(el => el.open);
    assert.ok(interactionAudit.contactsShortcut, 'atalho C deve abrir contatos');
    await page.keyboard.press('Escape');
  }
  interactionAudit.routePreserved = interactionAudit.routeBeforeNotebook === 0 ||
    interactionAudit.routeDuringNotebook === interactionAudit.routeBeforeNotebook;
  assert.ok(interactionAudit.routePreserved, name + ': o Caderno não deve descartar destino ativo');

  // The expanded map must also recover via Escape without losing the selected route.
  if (await mapButton.isVisible().catch(() => false)) await mapButton.click();
  else await page.keyboard.press('m');
  assert.equal(await page.locator('#mapDialog').evaluate(el => el.open), true,
    name + ': mapa deve reabrir após definir uma rota');
  await page.keyboard.press('Escape');
  interactionAudit.mapEscape = !(await page.locator('#mapDialog').evaluate(el => el.open));
  assert.ok(interactionAudit.mapEscape, name + ': Escape deve fechar o mapa');
  const routeBeforeRecenter = await page.evaluate(() => expeditionState.routeRemaining);
  await page.keyboard.press('r');
  const routeAfterRecenter = await page.evaluate(() => expeditionState.routeRemaining);
  interactionAudit.cameraShortcutPreservesRoute = routeBeforeRecenter === 0 || routeAfterRecenter > 0;
  assert.ok(interactionAudit.cameraShortcutPreservesRoute,
    name + ': R não deve descartar o destino de caminhada');

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
  const cameraBefore = await page.evaluate(() => {
    const state=expeditionState;
    return Math.hypot(state.position.x-state.cameraPosition.x,state.position.y-state.cameraPosition.y);
  });
  await page.keyboard.press('r');
  await page.waitForTimeout(80);
  const cameraAfter = await page.evaluate(() => {
    const state=expeditionState;
    return Math.hypot(state.position.x-state.cameraPosition.x,state.position.y-state.cameraPosition.y);
  });
  const cameraAudit = { before: cameraBefore, after: cameraAfter,
    recentered: cameraAfter <= cameraBefore + 3 };
  assert.ok(cameraAudit.recentered, name + ': R deve recentrar a câmera no jogador');
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

  // Reload is a real persistence boundary; dialogs and touch controls must not corrupt saves.
  await page.reload({ waitUntil: 'load' });
  await page.locator('#world').waitFor({ state: 'visible' });
  interactionAudit.saveRestored = await page.evaluate(expected => {
    const data = JSON.parse(localStorage.getItem('roncador-expedition-v2-referencias-gemini') || '{}');
    return data.v === expected.version && data.mapSource === expected.source &&
      Number.isFinite(data.player?.x) && Number.isFinite(data.player?.y);
  }, { version: movement.saveVersion, source: movement.saveMapSource });
  assert.ok(interactionAudit.saveRestored, name + ': recarregar deve manter save e posição válidos');

  const finalLayout = await collectLayout(page, name + '-after-input');
  await page.screenshot({
    path: path.join(outputDir, name + '-after-input.png'),
    fullPage: false,
    animations: 'disabled'
  });

  const result = {
    viewport, mobile, initial, gameplay,
    closeup: { ...closeup, zoomClicks: closeupZoomClicks },
    finalLayout,
    streetLabel: label,
    streetLabelIsCanonical: streetLabelValid,
    mapDialog, routeSelection, movement, interactionAudit, conversation, residentEncounters, cameraAudit
  };
  report.viewports[name] = result;

  assert.ok(gameplay.rects['#world']?.visible, name + ': canvas do jogo precisa estar visível');
  assert.ok(gameplay.canvasInk > 0, name + ': canvas precisa conter desenho');
  assert.ok(streetLabelValid, name + ': rótulo de rua não corresponde a nome OSM');
  assert.equal(gameplay.locationLabelClipped, false, name + ': o nome completo da rua não pode ficar truncado');
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
    await captureViewport(browser, baseUrl, 'mobile-narrow', { width: 320, height: 640 }, true);
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
