'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));

test('entrada aproxima a câmera, mantendo o zoom manual panorâmico',()=>{
 assert.match(source,/zoom=matchMedia\('\(max-width:800px\)'\)\.matches\?2\.35:2\.85/);
 assert.match(source,/zoom=Math\.min\(3\.5,zoom\*1\.2\)/);
 assert.match(source,/zoom=Math\.max\(\.65,zoom\/1\.2\)/);
});

test('calçada clara e meio-fio são apenas traços Canvas nas vias urbanas',()=>{
 const roads=section('function drawRoads(', 'function drawMappedPlaces(');
 assert.match(roads,/const street= !trail && r\.tags\.highway!=='service'/);
 assert.match(roads,/street\?'#eadcc3'/);
 assert.match(roads,/pavementWidth\+\(street\?5\.2:1\.15\)/);
 assert.match(roads,/if\(street\)\{c\.strokeStyle='#a69b826b'/);
 assert.match(roads,/path\(c,r\.p\)/);
});

test('nomes das ruas permanecem sem placas opacas que ocultam casas e pessoas',()=>{
 const streets=section('// Low-key real street labels.', 'if(waypoint)');
 assert.doesNotMatch(streets,/roundRect\(ctx/);
 assert.match(streets,/Math\.min\(6,Math\.max\(3\.4,9\/zoom\)\)/);
 assert.match(streets,/ctx\.strokeText\(l\.name,0,0\)/);
 assert.match(streets,/ctx\.fillText\(l\.name,0,0\)/);
});

test('marco de madeira mantém o mesmo ponto de missão e o minimapa original',()=>{
 const pin=section('function drawPin(', 'function spawnEmojiBurst(');
 assert.match(pin,/const p=m\.p/);
 assert.match(pin,/if\(miniMode\)/);
 assert.match(pin,/c\.translate\(p\[0\],p\[1\]\)/);
 assert.match(pin,/roundRect\(c,-12,-31,24,17,3/);
 assert.match(pin,/c\.fillText\(done\?'✓':String\(i\+1\)/);
});
