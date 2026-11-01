'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const draw=source.slice(source.indexOf('function drawParkedMotosAndSorda('),source.indexOf('function drawDailyActivity('));

test('plaquinha da cestinha respeita a janela da câmera sem mover a cestinha',()=>{
 assert.match(draw,/const visibleLeft=camera\.x-w\/\(2\*zoom\),visibleRight=camera\.x\+w\/\(2\*zoom\)/);
 assert.match(draw,/const labelX=Math\.max\(visibleLeft\+36,Math\.min\(visibleRight-36,s\.x\)\)/);
 assert.match(draw,/c\.translate\(labelX-s\.x,0\)/);
 assert.match(draw,/c\.fillText\('🥖 Pães da Tia',0,-16\+steam\*\.3\)/);
 const width=320,zoom=2.35,center=0,left=center-width/(2*zoom),right=center+width/(2*zoom);
 for(const spot of [left+2,right-2,0]){
  const labelX=Math.max(left+36,Math.min(right-36,spot));
  assert.ok(labelX-34>=left+2);
  assert.ok(labelX+34<=right-2);
 }
});
