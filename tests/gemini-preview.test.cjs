'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildGeminiPreview } = require('../scripts/build-gemini-preview.cjs');
const { extractEmbeddedMap } = require('../scripts/current-geodata.cjs');

const SOURCE_RELATIVE = path.join('references', 'gemini-2026-10-31', 'experimento-anonimizado.html.txt');
const OUTPUT_RELATIVE = path.join('previews', 'gemini-preview.html');
const BROKEN_INITIALIZATION =
  'let belemContacts=window.RoncadorBelemContacts.fresh();kawaiiState=window.RoncadorKawaiiMoto.fresh();';

function createProject(t, source) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beit-lehem-gemini-preview-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sourcePath = path.join(root, SOURCE_RELATIVE);
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.writeFileSync(sourcePath, source, 'utf8');
  const osmPath=path.join(root,'source','belem-osm-2026.geojson');
  fs.mkdirSync(path.dirname(osmPath),{recursive:true});
  fs.copyFileSync(path.join(__dirname,'..','source','belem-osm-2026.geojson'),osmPath);
  const indexPath=path.join(root,'references','gemini-2026-10-31','INDICE.md');
  fs.copyFileSync(path.join(__dirname,'..','references','gemini-2026-10-31','INDICE.md'),indexPath);
  fs.cpSync(path.join(__dirname,'..','gemini-modules'),path.join(root,'gemini-modules'),{recursive:true});
  return { root, sourcePath, outputPath: path.join(root, OUTPUT_RELATIVE) };
}

function fixture(overrides = {}) {
  // Use the real archived source: the builder validates several exact
  // insertion sites which a tiny hand-written fixture cannot represent.
  const original=fs.readFileSync(path.join(__dirname,'..',SOURCE_RELATIVE),'utf8');
  return original.replace(
    "const STORE='roncador-expedition-v2-referencias-gemini'",
    "const STORE='"+(overrides.saveKey||'roncador-expedition-v2-referencias-gemini')+"'"
  );
}

test('gera uma prévia separada, corrige somente a inicialização e preserva o arquivo-fonte', t => {
  const source = fixture();
  const project = createProject(t, source);

  const result = buildGeminiPreview(project.root);
  const preview = fs.readFileSync(project.outputPath, 'utf8');

  const map = extractEmbeddedMap(preview);
  assert.equal(map.roads.length, 462);
  assert.equal(map.areas.length, 20);
  assert.equal(map.points.length, 9, 'only OSM points remain in the OSM collection');
  assert.equal(map.localPlaces.length, 9, 'author-curated POIs remain in their own layer');
  assert.equal(map.streetNameCount, 86);
  assert.ok(map.unverifiedRoadLabels.every(label => label.displayedAsStreetName === false));

  assert.equal(fs.readFileSync(project.sourcePath, 'utf8'), source);
  assert.equal(result.experimentalSaveKey, 'roncador-expedition-v2-referencias-gemini');
  assert.equal(result.outputPath, project.outputPath);
  assert.ok(result.bytes > 0);
  assert.ok(!preview.includes(BROKEN_INITIALIZATION));
  assert.ok(preview.includes('let belemContacts=window.RoncadorBelemContacts.fresh();'));
  assert.ok(preview.includes('let kawaiiState=window.RoncadorKawaiiMoto.fresh(),emojiParticles=[],engineTick=0;'));
  assert.ok(preview.includes('<title>Beit Lehem</title>'));
  assert.ok(preview.includes('id="mobile-street-name-fit"'));
  assert.ok(preview.includes('max-width:min(210px,calc(100vw - 152px))'));
  assert.ok(preview.includes("const STORE='roncador-expedition-v2-referencias-gemini',keys="));
});

test('pode gerar o HTML principal em destino explícito sem criar outra prévia',t=>{
 const source=fixture(),project=createProject(t,source);
 const canonical=path.join('previews','beit-lehem-development.html');
 const result=buildGeminiPreview(project.root,canonical);
 assert.equal(result.outputPath,path.join(project.root,canonical));
 assert.ok(fs.existsSync(result.outputPath));
 assert.equal(fs.existsSync(project.outputPath),false);
 assert.equal(fs.readFileSync(project.sourcePath,'utf8'),source);
 assert.match(fs.readFileSync(result.outputPath,'utf8'),/roncador-expedition-v2-referencias-gemini/);
});

function alterGame(project,search,replacement){
 const file=path.join(project.root,'gemini-modules','game.js');
 const before=fs.readFileSync(file,'utf8');
 assert.ok(before.includes(search),'marcador conhecido do módulo editável');
 fs.writeFileSync(file,before.replace(search,replacement),'utf8');
}

test('recusa um módulo que usaria a chave do diário oficial',t=>{
 const project=createProject(t,fixture());
 alterGame(project,"const STORE='roncador-expedition-v2-referencias-gemini'",
   "const STORE='roncador-expedition-v2'");
 assert.throws(()=>buildGeminiPreview(project.root),/não está isolada do diário oficial/);
 assert.equal(fs.existsSync(project.outputPath),false);
});

test('recusa um módulo com inicialização de contatos desconhecida',t=>{
 const project=createProject(t,fixture());
 alterGame(project,'let belemContacts=window.RoncadorBelemContacts.fresh();',
   'let belemContacts=null;');
 assert.throws(()=>buildGeminiPreview(project.root),/Inicialização de kawaiiState desconhecida/);
 assert.equal(fs.existsSync(project.outputPath),false);
});
