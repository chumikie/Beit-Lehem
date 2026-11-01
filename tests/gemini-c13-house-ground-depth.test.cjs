'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const helper=game.slice(game.indexOf('function houseVisualBounds('),game.indexOf('function streetLabelBlocked('));
const {bounds,depth}=vm.runInNewContext(helper+';({bounds:houseVisualBounds,depth:houseGroundDepth})',{Math});

test('C13: profundidade segue o chão da fachada, não o envelope de recorte girado',()=>{
 const home={x:100,y:200,w:22,h:14,seed:7};
 for(const angle of [0,Math.PI/6,Math.PI/2,-Math.PI/3]){
  const house={...home,angle};
  const frontBottom=home.y+home.h*.13+7+(home.seed%4);
  assert.equal(depth(house),frontBottom);
  assert.ok(bounds(house).bottom>frontBottom);
  // An actor behind the frontage remains covered; one past its foot is visible.
  assert.ok(depth(house)>frontBottom-1);
  assert.ok(depth(house)<frontBottom+1);
 }
 assert.match(game,/renderables\.push\(\{sortY:houseGroundDepth\(b\),draw:\(\)=>house\(ctx,b\)\}\)/);
});

test('C13: recorte, colisão girada e exceção de rota mapeada ficam separados',()=>{
 assert.match(game,/const bounds=houseVisualBounds\(b\)/);
 assert.match(game,/bounds\.right<=left\|\|bounds\.left>=right/);
 assert.match(game,/function blockedByHouse\(x,y\)/);
 assert.match(game,/function mayAdvanceOnMappedRoute\(/);
 assert.doesNotMatch(helper,/localStorage|data\.roads\s*=|houses\.push/);
});
