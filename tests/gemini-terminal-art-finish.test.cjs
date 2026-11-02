const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const landmarks = fs.readFileSync(path.join(__dirname, '../gemini-modules/landmarks.js'), 'utf8');
const placement = fs.readFileSync(path.join(__dirname, '../gemini-modules/scenic-placement.js'), 'utf8');
const terminal = landmarks.split('  function drawTerminalDetails(c) {')[1]
  .split('  function drawHomeVarandaGround(c) {')[0];

test('Rodoviária keeps original scale, roof envelope and bus geometry', () => {
  assert.match(placement, /terminal:\s*\{scale:\s*\.63,\s*extent:\s*\[-36, -27, 36, 42\]\}/);
  assert.match(terminal, /polygon\(c,\[\[-31,-16\],\[31,-16\],\[27,-8\],\[-27,-8\]\],'#75928f','#607e7a'\)/);
  assert.match(terminal, /rounded\(c,3,4,27,12,3\.5,'#e8dabb','#a7a28d'\)/);
  assert.match(terminal, /rounded\(c,5,5\.5,20,5\.7,1\.1,'#789a9d'\)/);
  assert.match(terminal, /for\(const x of \[9,24\]\)circle\(c,x,16,2\.7,'#67746a'\)/);
  assert.match(terminal, /fillText\('RODOVIÁRIA',0,-12\.5\)/);
});

test('Only interior roof accents and bench grain strengthen the waiting area', () => {
  assert.match(terminal, /rounded\(c,-26,-15\.1,52,\.7,\.3,'#e5ede2a8'\)/);
  assert.match(terminal, /rounded\(c,-26,-7\.8,52,\.7,\.3,'#4d6d6990'\)/);
  assert.match(terminal, /rounded\(c,-25,8,21,2\.5,1,'#b39b79'\)/);
  assert.match(terminal, /rounded\(c,-25,6\.3,21,1\.5,\.7,'#dbcaab'\)/);
  assert.match(terminal, /rounded\(c,-23,6\.8,17,\.4,\.2,'#f2dfba'\)/);
  assert.match(terminal, /rounded\(c,-23,8\.8,17,\.4,\.2,'#d7bc91'\)/);
  assert(terminal.indexOf("'#d7bc91'") < terminal.indexOf('Small illustrative bus'), 'bench must remain behind the unchanged bus');
});
