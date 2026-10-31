const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const game = fs.readFileSync(path.join(root, 'gemini-modules/game.js'), 'utf8');
const landmarks = fs.readFileSync(path.join(root, 'gemini-modules/landmarks.js'), 'utf8');

const roads = game.slice(game.indexOf('function drawRoads('), game.indexOf('function drawMappedPlaces('));
assert.match(roads, /path\(c,r\.p\)/, 'Mapped road polylines remain the source of each visual stroke');
assert.match(roads, /const width=widths\[r\.tags\.highway\]\|\|10/, 'Mapped road widths stay unchanged');
assert.match(roads, /if\(simple\).*continue;/s, 'Simple minimap rendering is retained');
assert.match(roads, /width\+2\.5/, 'A narrow translucent verge blends road and terrain');
assert.match(roads, /z>=1\.35/, 'Wear details are only visible at closer zoom');

const market = landmarks.slice(landmarks.indexOf('function stall('), landmarks.indexOf('function drawTerminalGround('));
assert.match(market, /variant = 0/, 'Stall details are deterministic variants');
assert.match(market, /variant === 1/, 'A plain canvas canopy is available');
assert.match(market, /variant === 2/, 'A folded-edge canopy is available');
assert.match(market, /if \(marketDay\)/, 'Extra market stalls still follow the fair-day schedule');

const terminal = landmarks.slice(landmarks.indexOf('function drawTerminalGround('), landmarks.indexOf('function drawHomeVarandaGround('));
assert.match(terminal, /polygon\(c,\[\[-31,-16\]/, 'The bus station has a distinct roof silhouette');
assert.match(terminal, /for \(const x of \[-24,24\]\)/, 'The covered waiting area has two supports');
assert.match(landmarks, /c\.translate\(landmark\.p\[0\], landmark\.p\[1\]\)/, 'Landmarks remain anchored to existing coordinates');

console.log('Gemini visual finish: mapped roads, varied market canopies and original terminal anchor retained.');
