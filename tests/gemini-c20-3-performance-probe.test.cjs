'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const harness = fs.readFileSync(path.join(root, 'scripts/visual-inspection.cjs'), 'utf8');
const game = fs.readFileSync(path.join(root, 'gemini-modules/game.js'), 'utf8');

test('C20.3.2: probes are CI-only and independently time movement, UI and drawing', () => {
  assert.match(harness, /const html = builtHtml\.replace\(renderCall/);
  assert.match(harness, /\.replace\(uiCall/);
  assert.match(harness, /window\.__ciMoveSamples/);
  assert.match(harness, /window\.__ciUiSamples/);
  assert.match(harness, /window\.__ciRenderSamples/);
  assert.match(harness, /for \(let round = 0; round < 3; round\+\+\)/);
  assert.match(harness, /over33ms/);
  assert.match(harness, /type: 'longtask'/);
  assert.doesNotMatch(game, /__ciMoveSamples|__ciUiSamples|__ciRenderSamples/);
});
