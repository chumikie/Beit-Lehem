const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const game = fs.readFileSync(path.join(__dirname, '../gemini-modules/game.js'), 'utf8');

test('the Gemini opening screen hides optional HUD controls only on mobile', () => {
  const from = game.indexOf('const openingHudStyle=');
  const to = game.indexOf('document.head.appendChild(openingHudStyle);', from);
  assert.ok(from > 0 && to > from);
  let installed;
  const document = {
    createElement: name => ({ tag: name, textContent: '' }),
    head: { appendChild: node => { installed = node; } },
  };
  vm.runInNewContext(game.slice(from, to + 'document.head.appendChild(openingHudStyle);'.length), { document });
  assert.equal(installed.tag, 'style');
  assert.match(installed.textContent, /max-width:800px/);
  assert.match(installed.textContent, /#welcome:not\(\[hidden\]\)/);
  assert.match(installed.textContent, /\.kawaii-hud-bar\{display:none!important\}/);
  assert.doesNotMatch(installed.textContent, /#touchPad|#start/);
});

test('Kawaii motor state is initialized exactly once, without temporal dead-zone access', () => {
  const start = game.indexOf('let belemContacts=');
  const end = game.indexOf('const treeCache=', start);
  const declarations = game.slice(start, end);
  assert.match(declarations, /let kawaiiState=window\.RoncadorKawaiiMoto\.fresh\(\)/);
  assert.equal((declarations.match(/kawaiiState=/g) || []).length, 1);
});

test('the same HUD controls move to the mobile diary and back on desktop', () => {
  const from = game.indexOf('function placeKawaiiHud(){');
  const to = game.indexOf('function resize(){', from);
  assert.ok(from > 0 && to > from);
  const hud = { parentElement: null };
  const createParent = () => ({
    querySelector: () => null,
    insertBefore(node) { node.parentElement = this; },
    appendChild(node) { node.parentElement = this; },
  });
  const sidebar = createParent(), world = createParent();
  let mobile = true;
  const document = { querySelector: selector => selector === '.kawaii-hud-bar' ? hud : world };
  const place = vm.runInNewContext(`${game.slice(from, to)};placeKawaiiHud`, {
    document,
    matchMedia: () => ({ matches: mobile }),
    $: () => sidebar,
  });
  place();
  assert.equal(hud.parentElement, sidebar);
  mobile = false;
  place();
  assert.equal(hud.parentElement, world);
  assert.match(game, /\.sidebar \.kawaii-hud-bar\{position:static;display:grid/);
});
