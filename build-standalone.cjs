/* Package the complete static game as one downloadable, offline-capable HTML. */
const fs = require('node:fs');
const path = require('node:path');
const dist = path.join(__dirname, 'dist');
const read = name => fs.readFileSync(path.join(dist, name), 'utf8');
const styles = read('style.css') + '\n' + read('cozy.css');
const map = JSON.stringify(JSON.parse(read('map.json'))).replace(/</g, '\\u003c');
const geology = JSON.stringify(JSON.parse(read('geology.json'))).replace(/</g, '\\u003c');
const terrain = JSON.stringify(JSON.parse(read('terrain.json'))).replace(/</g, '\\u003c');
const script = name => `<script>\n${read(name).replace(/<\/script/gi, '<\\/script')}\n</script>`;
let html = read('index.html');
html=html.replace('<script src="market-scene.js"></script>',script('market-scene.js'));
html = html.replace('<link rel="stylesheet" href="style.css">', `<style id="cozy-inline-style">\n${styles}\n</style>`);
html = html.replace('<script src="street-moments.js"></script>',script('street-moments.js'));
html = html.replace('<script src="street-greetings.js"></script>',script('street-greetings.js'));
// Keep the legacy bundle list intact; inject these modules immediately before game.js.
html = html.replace('<script src="crowd-flow.js"></script><script src="resident-motion.js"></script>', '');
html = html.replace(
  '<script src="pathfinding.js"></script><script src="landmarks.js"></script><script src="scenic-placement.js"></script><script src="street-encounters.js"></script><script src="street-community.js"></script><script src="encounter-choreography.js"></script><script src="road-details.js"></script><script src="terrain-relief.js"></script><script src="affection-memory.js"></script><script src="living-world.js"></script><script src="street-life.js"></script><script src="fair-streets.js"></script><script src="cozy-quests.js"></script><script src="cozy-atmosphere.js"></script><script src="neighborhood-quest.js"></script><script src="central-blocks.js"></script><script src="grounded-flora.js"></script><script src="daily-moments.js"></script><script src="market-morning.js"></script><script src="lucia-garden.js"></script><script src="bia-letters.js"></script><script src="secondary-neighbors.js"></script><script src="facade-studio.js"></script><script src="cozy-ui.js"></script><script src="game.js"></script>',
  `<script type="application/json" id="embedded-map-data">${map}</script>\n<script type="application/json" id="embedded-geology-data">${geology}</script>\n<script type="application/json" id="embedded-terrain-data">${terrain}</script>\n${script('pathfinding.js')}\n${script('landmarks.js')}\n${script('scenic-placement.js')}\n${script('street-encounters.js')}\n${script('street-community.js')}\n${script('encounter-choreography.js')}\n${script('road-details.js')}\n${script('local-road-references.js')}\n${script('terrain-relief.js')}\n${script('affection-memory.js')}\n${script('living-world.js')}\n${script('street-life.js')}\n${script('fair-streets.js')}\n${script('cozy-quests.js')}\n${script('cozy-atmosphere.js')}\n${script('neighborhood-quest.js')}\n${script('central-blocks.js')}\n${script('grounded-flora.js')}\n${script('daily-moments.js')}\n${script('market-morning.js')}\n${script('lucia-garden.js')}\n${script('bia-letters.js')}\n${script('secondary-neighbors.js')}\n${script('facade-studio.js')}\n${script('cozy-ui.js')}\n${script('game.js')}`
);
html=html.replace(script('game.js'),`${script('crowd-flow.js')}\n${script('resident-motion.js')}\n${script('game.js')}`);
for (const [file, mime] of [['igreja-conceicao-2007.jpg', 'image/jpeg'], ['feira-livre-2007.jpg', 'image/jpeg']]) {
  const source = `./assets/${file}`;
  const inline = `data:${mime};base64,${fs.readFileSync(path.join(dist, 'assets', file)).toString('base64')}`;
  if (!html.includes(source)) throw Error(`Missing inline image reference: ${source}`);
  html = html.replaceAll(source, inline);
}
if (html.includes('<script src="game.js">') || html.includes('<script src="street-moments.js">') || html.includes('<link rel="stylesheet" href="style.css">')) {
  throw Error('Standalone build did not replace the expected assets');
}
const output = path.join(dist, 'Trilhas-do-Roncador-Cozy-V2-27.html');
fs.writeFileSync(output, html);
console.log(`Standalone HTML ready: ${output} (${Buffer.byteLength(html)} bytes)`);
// Dedicated phone-friendly entry retains the very same game state and OSM map.
const mobile = html.replace('<body>', '<body class="mobile-edition">')
 .replace('Belém tem histórias<br>para viver.', 'Belém cabe no seu bolso.<br>Vamos passear?')
 .replace('6 selos para encontrar · 1 nova amizade para começar', 'Toque no chão para ir · setas para andar · Passaporte para o diário');
const mobileOutput = path.join(dist, 'Trilhas-do-Roncador-Cozy-V2-27-Celular.html');
fs.writeFileSync(mobileOutput, mobile);
console.log(`Phone HTML ready: ${mobileOutput} (${Buffer.byteLength(mobile)} bytes)`);
