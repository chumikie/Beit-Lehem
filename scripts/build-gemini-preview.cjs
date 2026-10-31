'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {applyOverrides}=require('./gemini-workbench.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_RELATIVE = path.join('references', 'gemini-2026-10-31', 'experimento-anonimizado.html.txt');
const OUTPUT_RELATIVE = path.join('previews', 'gemini-preview.html');
const OFFICIAL_SAVE_KEY = 'roncador-expedition-v2';

function replaceExactlyOnce(source, search, replacement, label) {
  const first = source.indexOf(search);
  if (first === -1 || source.indexOf(search, first + search.length) !== -1) {
    throw new Error(`${label}: esperado encontrar exatamente uma ocorrência; a fonte foi mantida intacta.`);
  }
  return source.slice(0, first) + replacement + source.slice(first + search.length);
}

function buildGeminiPreview(projectRoot = PROJECT_ROOT) {
  const sourcePath = path.join(projectRoot, SOURCE_RELATIVE);
  const outputPath = path.join(projectRoot, OUTPUT_RELATIVE);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Fonte experimental não encontrada: ${SOURCE_RELATIVE}`);
  }

  let html = fs.readFileSync(sourcePath, 'utf8');
  const workbench=applyOverrides(html,path.join(projectRoot,'gemini-modules'));
  html=workbench.html;
  // Extend the existing album, after its original cards, without editing the
  // archived Gemini file or adding a second album interface.
  html=replaceExactlyOnce(
    html,
    "content.append(title,description);article.append(preview,content);grid.append(article);\n }\n}\nfunction observe()",
    "content.append(title,description);article.append(preview,content);grid.append(article);\n }\n window.RoncadorAffectionMemory.appendSocialKeepsakes(grid,{marketMorning,luciaGarden,biaLetters,communitySeen},document);\n}\nfunction observe()",
    'Cartões afetivos no álbum existente'
  );
  // One extra fictional action at Ciça's EXISTING dialog, unlocked by the
  // already-saved Mercado chapter; no extra interface or save schema.
  html=replaceExactlyOnce(
    html,
    'for(const choice of def.options){',
    'for(const choice of window.RoncadorSecondaryNeighbors.availableOptions(def,{marketMorning})){',
    'Opções contextuais de Ciça'
  );
  html=replaceExactlyOnce(
    html,
    'window.RoncadorSecondaryNeighbors.interact(sideNeighbors,living,def.id,choice.id)',
    'window.RoncadorSecondaryNeighbors.interact(sideNeighbors,living,def.id,choice.id,{marketMorning})',
    'Condição da fita para Damião'
  );
  // Lúcia's existing planter ages with the fictional calendar. No new map points.
  html=replaceExactlyOnce(html,"window.RoncadorLuciaGarden.claim(luciaGarden)","window.RoncadorLuciaGarden.claim(luciaGarden,living.day)",'Crescimento de Lúcia');
  html=replaceExactlyOnce(html,"c.save();c.translate(person.x+11,person.y-7);c.scale(.82,.82);","const bloom=window.RoncadorLuciaGarden.growth(luciaGarden,living.day);\n   c.save();c.translate(person.x+11,person.y-7);c.scale(.82*bloom.scale,.82*bloom.scale);",'Crescimento de Lúcia');
  html=replaceExactlyOnce(html,"c.arc(nod,-12,luciaGarden.claimed?3.8:2.6,0,7)","c.arc(nod,-12,[1.1,1.7,2.6,3.8][bloom.stage],0,7)",'Crescimento de Lúcia');
  html=replaceExactlyOnce(html,"$('luciaWorkerSpeech').textContent=luciaGarden.claimed?'Lúcia: “O carinho que a gente planta permanece.”'","$('luciaWorkerSpeech').textContent=luciaGarden.claimed?'Lúcia: “'+logic.growth(luciaGarden,living.day).caption+' O carinho que a gente planta permanece.”'",'Crescimento de Lúcia');
  // The author's Bolt tribute replaces the old provisional dog name in legacy scenery.
  html=html.replace(/\bPingo\b/g,'Bolt').replace(/\bpingo\b/g,'bolt');
  if (!html.startsWith('<!-- ARQUIVO DE REFERÊNCIA DE BEIT LEHEM')) {
    throw new Error('A fonte não contém o cabeçalho de referência esperado; nenhuma prévia foi gerada.');
  }

  const saveKeys = [...html.matchAll(/const STORE='([^']+)'/g)];
  if (saveKeys.length !== 1) {
    throw new Error('A chave de salvamento experimental não pôde ser identificada sem ambiguidade.');
  }

  const experimentalSaveKey = saveKeys[0][1];
  if (
    experimentalSaveKey === OFFICIAL_SAVE_KEY ||
    !experimentalSaveKey.startsWith(`${OFFICIAL_SAVE_KEY}-`)
  ) {
    throw new Error('A prévia não está isolada do diário oficial; nenhuma prévia foi gerada.');
  }

  const brokenInitialization =
    'let belemContacts=window.RoncadorBelemContacts.fresh();kawaiiState=window.RoncadorKawaiiMoto.fresh();';
  const fixedInitialization =
    'let belemContacts=window.RoncadorBelemContacts.fresh();';

  if (html.includes(brokenInitialization)) {
    html = replaceExactlyOnce(html, brokenInitialization, fixedInitialization,
      'Correção pontual da inicialização de kawaiiState');
  } else if (!html.includes(fixedInitialization)) {
    throw new Error('Inicialização de kawaiiState desconhecida após sobreposição dos módulos.');
  }

  html = replaceExactlyOnce(
    html,
    '<title>Trilhas de Roncador — Expedição</title>',
    '<title>Beit Lehem — Prévia experimental Gemini</title>',
    'Identificação da aba da prévia'
  );

  // Brand only: the municipality remains Belém/PB in geographic data,
  // cultural descriptions and addresses. Do not rewrite those as game branding.
  const branding = [
    ['aria-label="Trilhas de Roncador"', 'aria-label="Beit Lehem"'],
    ['<span>TRILHAS<span class="brand-sub">de Roncador</span></span>',
     '<span>BEIT<span class="brand-sub">LEHEM</span></span>'],
    ["document.title = 'Trilhas do Roncador — Belém Viva · V2.27 Cozy';",
     "document.title = 'Beit Lehem — Belém/PB · Jogo cozy';"],
    ["document.querySelector('.brand-sub').textContent = 'do Roncador';",
     "document.querySelector('.brand-sub').textContent = 'LEHEM';"],
    ["document.querySelector('.edition').textContent = '☼ BELÉM VIVA · V2.27';",
     "document.querySelector('.edition').textContent = '☼ BEIT LEHEM · PRÉVIA';"],
    ["document.querySelector('.welcome h1').innerHTML = 'Belém tem histórias<br>para viver.';",
     "document.querySelector('.welcome h1').innerHTML = 'Beit Lehem tem histórias<br>para viver.';"],
    ["document.querySelector('.welcome-eyebrow').textContent = '☼ UM NOVO DIA EM BELÉM';",
     "document.querySelector('.welcome-eyebrow').textContent = '☼ UM NOVO DIA EM BEIT LEHEM';"],
    ['Explore os caminhos de Roncador e complete seu passaporte de aventura.',
     'Explore os caminhos de Beit Lehem e complete seu passaporte de aventura.'],
    ['<li><kbd>Vida em Belém</kbd>', '<li><kbd>Vida em Beit Lehem</kbd>']
  ];
  for (const [before, after] of branding) {
    html = replaceExactlyOnce(html, before, after, 'Identidade visual Beit Lehem');
  }

  if (html.includes(brokenInitialization)) {
    throw new Error('A inicialização incorreta de kawaiiState permaneceu na cópia gerada.');
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');

  return {
    outputPath,
    experimentalSaveKey,
    modulesUsed:workbench.used,
    bytes: Buffer.byteLength(html, 'utf8')
  };
}

if (require.main === module) {
  try {
    const result = buildGeminiPreview();
    console.log(`Prévia Gemini gerada: ${path.relative(PROJECT_ROOT, result.outputPath)} (${result.bytes} bytes).`);
    console.log(`Diário experimental isolado: ${result.experimentalSaveKey}`);
    console.log(`Módulos Gemini aplicados: ${result.modulesUsed.join(', ')||'nenhum'}`);
    console.log('A fonte .html.txt e a versão oficial V2.27 não foram modificadas.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildGeminiPreview };
