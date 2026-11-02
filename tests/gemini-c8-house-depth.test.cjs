'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const source=game.slice(game.indexOf('function houseVisualBounds('),game.indexOf('function region('));
const bounds=vm.runInNewContext(source+';houseVisualBounds',{Math});

test('C8: os extremos girados das casas participam da ordenação e do recorte',()=>{
 let previousMisses=0,depthCorrections=0,samples=0;
 for(const zoom of [.65,1.15,1.85,2.85,3.5])for(const angle of [0,Math.PI/6,Math.PI/3,Math.PI/2,-Math.PI/3]){
  const home={x:12,y:25,w:20,h:12,angle,side:1};
  const b=bounds(home);
  const xRadius=(20*Math.abs(Math.cos(angle))+12*Math.abs(Math.sin(angle)))/2;
  const yRadius=(20*Math.abs(Math.sin(angle))+12*Math.abs(Math.cos(angle)))/2;
  assert.ok(b.left<=home.x-xRadius&&b.right>=home.x+xRadius);
  assert.ok(b.top<=home.y-yRadius&&b.bottom>=home.y+yRadius);
  assert.ok(b.left<=home.x-home.w/2&&b.right>=home.x+home.w/2,'fachada vertical cabe no recorte');
  assert.ok(b.top<=home.y-home.h/2&&b.bottom>=home.y+home.h/2,'telhado vertical cabe no recorte');
  const viewport={left:home.x+xRadius-1,right:home.x+xRadius+2,top:home.y-2,bottom:home.y+2};
  const newVisible=b.right>viewport.left&&b.left<viewport.right&&b.bottom>viewport.top&&b.top<viewport.bottom;
  const oldVisible=home.x>viewport.left&&home.x<viewport.right&&home.y>viewport.top&&home.y<viewport.bottom;
  assert.equal(newVisible,true,`casa ${angle} no zoom ${zoom} não pode sumir na borda`);
  if(!oldVisible)previousMisses++;
  if(Math.abs(b.bottom-(home.y+home.h*.45))>2)depthCorrections++;
  samples++;
 }
 assert.ok(previousMisses>0,'recorte pelo centro omitia casas parcialmente visíveis');
 assert.ok(depthCorrections>0,'profundidade antiga ignorava orientação');
 console.info(`C8: ${samples} combinações de ângulo/zoom; ${previousMisses} recortes antigos incorretos; ${depthCorrections} ordenações com desvio >2 unidades.`);
});

test('C8: limites de zoom e malha viária não são reescritos por desenho de casas',()=>{
 assert.match(game,/zoom=Math\.max\(\.65,Math\.min\(3\.5,/);
 assert.match(game,/zoom=Math\.max\(\.65,zoom\/1\.2\)/);
 assert.match(game,/sortY:houseGroundDepth\(b\)/);
 assert.match(game,/bounds\.right<=left\|\|bounds\.left>=right/);
 assert.doesNotMatch(source,/data\.roads\s*=|houses\.push|localStorage|pathfinder\.route/);
});
