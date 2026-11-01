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
// Embed scripts independently, so adding a module does not silently break
// the standalone build's fragile all-in-one string replacement.
const embeddedData = `<script type="application/json" id="embedded-map-data">${map}</script>\n<script type="application/json" id="embedded-geology-data">${geology}</script>\n<script type="application/json" id="embedded-terrain-data">${terrain}</script>\n`;
html = html.replace('<script src="pathfinding.js"></script>', embeddedData + '<script src="pathfinding.js"></script>');
html = html.replace(/<script src="([\w-]+\.js)"><\/script>/g, (tag, name) => script(name));
for (const [file, mime] of [['igreja-conceicao-2007.jpg', 'image/jpeg'], ['feira-livre-2007.jpg', 'image/jpeg']]) {
  const source = `./assets/${file}`;
  // Historical image references are optional in the modular V2.27 entry.
  // Embed only images actually used, without reintroducing removed photos.
  if (!html.includes(source)) continue;
  const inline = `data:${mime};base64,${fs.readFileSync(path.join(dist, 'assets', file)).toString('base64')}`;
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
