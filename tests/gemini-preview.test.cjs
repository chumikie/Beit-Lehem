'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildGeminiPreview } = require('../scripts/build-gemini-preview.cjs');

const SOURCE_RELATIVE = path.join('references', 'gemini-2026-10-31', 'experimento-anonimizado.html.txt');
const OUTPUT_RELATIVE = path.join('build', 'gemini-preview.html');
const BROKEN_INITIALIZATION =
  'let belemContacts=window.RoncadorBelemContacts.fresh();kawaiiState=window.RoncadorKawaiiMoto.fresh();';

function createProject(t, source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beit-lehem-gemini-preview-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourcePath = path.join(root, SOURCE_RELATIVE);
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.writeFileSync(sourcePath, source, 'utf8');
  return { root, sourcePath, outputPath: path.join(root, OUTPUT_RELATIVE) };
}

function fixture(overrides = {}) {
  return [
    '<!-- ARQUIVO DE REFERÊNCIA DE BEIT LEHEM; não executar como versão oficial. -->',
    '<title>Trilhas de Roncador — Expedição</title>',
    "const STORE='roncador-expedition-v2-referencias-gemini';",
    BROKEN_INITIALIZATION,
    'let kawaiiState=window.RoncadorKawaiiMoto.fresh(),emojiParticles=[],engineTick=0;',
    '</html>'
  ].join('\n').replace('roncador-expedition-v2-referencias-gemini', overrides.saveKey || 'roncador-expedition-v2-referencias-gemini');
}

test('gera uma prévia separada, corrige somente a inicialização e preserva o arquivo-fonte', t => {
  const source = fixture();
  const project = createProject(t, source);

  const result = buildGeminiPreview(project.root);
  const preview = fs.readFileSync(project.outputPath, 'utf8');

  assert.equal(fs.readFileSync(project.sourcePath, 'utf8'), source);
  assert.equal(result.experimentalSaveKey, 'roncador-expedition-v2-referencias-gemini');
  assert.equal(result.outputPath, project.outputPath);
  assert.ok(result.bytes > 0);
  assert.ok(!preview.includes(BROKEN_INITIALIZATION));
  assert.ok(preview.includes('let belemContacts=window.RoncadorBelemContacts.fresh();'));
  assert.ok(preview.includes('let kawaiiState=window.RoncadorKawaiiMoto.fresh(),emojiParticles=[],engineTick=0;'));
  assert.ok(preview.includes('<title>Beit Lehem — Prévia experimental Gemini</title>'));
  assert.ok(preview.includes("const STORE='roncador-expedition-v2-referencias-gemini';"));
});

test('recusa uma fonte que usaria a chave do diário oficial', t => {
  const project = createProject(t, fixture({ saveKey: 'roncador-expedition-v2' }));

  assert.throws(
    () => buildGeminiPreview(project.root),
    /não está isolada do diário oficial/
  );
  assert.equal(fs.existsSync(project.outputPath), false);
});

test('recusa a fonte se o bloqueio conhecido não estiver exatamente uma vez', t => {
  const source = fixture().replace(BROKEN_INITIALIZATION, '/* inicialização alterada */');
  const project = createProject(t, source);

  assert.throws(
    () => buildGeminiPreview(project.root),
    /esperado encontrar exatamente uma ocorrência/
  );
  assert.equal(fs.existsSync(project.outputPath), false);
});
