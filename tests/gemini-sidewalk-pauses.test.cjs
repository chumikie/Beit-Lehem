'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const begin=source.indexOf('const SIDEWALK_PAUSE_LINES='),end=source.indexOf('function recordStreetVignette(',begin);
const context=vm.runInNewContext(source.slice(begin,end)+';({nearbySidewalkPause,SIDEWALK_PAUSE_LINES})');

test('pausas locais usam somente coordenadas existentes e distância inferior a 28m',()=>{
 const map={landmarks:[{id:'sonho_doce',p:[100,90]},{id:'parque_sao_luis',p:[400,200]}],cultureReferences:[{id:'praca_6_setembro',p:[60,60]}]};
 assert.equal(context.nearbySidewalkPause(map,{x:115,y:90}).id,'sonho_doce');
 assert.equal(context.nearbySidewalkPause(map,{x:400,y:200}).id,'parque_sao_luis');
 assert.equal(context.nearbySidewalkPause(map,{x:60,y:60}).id,'praca_6_setembro');
 assert.equal(context.nearbySidewalkPause(map,{x:128,y:90}),null);
 assert.equal(context.nearbySidewalkPause(map,{x:0,y:0}),null);
 assert.equal(Object.keys(context.SIDEWALK_PAUSE_LINES).length,4);
 assert.match(context.SIDEWALK_PAUSE_LINES.bar_prosa,/Vicente Cado/);
});

test('pausa dá aviso, não cria memória e zoom é apenas temporário e suavizado',()=>{
 const observe=source.slice(source.indexOf('function observeWorldMoment(){'),source.indexOf('function camucaHas('));
 const render=source.slice(source.indexOf('function render(time){'),source.indexOf('function explorationBounds('));
 assert.match(observe,/beginWorldPause\(nearby\.id\);notify\(SIDEWALK_PAUSE_LINES\[nearby\.id\]\)/);
 assert.match(render,/const effectiveZoom=zoom\*\(worldPause\?1\.08:1\)/);
 assert.match(render,/pauseVisualZoom\+=\(effectiveZoom-pauseVisualZoom\)/);
 assert.match(render,/ctx\.scale\(frameZoom,frameZoom\)/);
 assert.match(source,/let worldPause=null/);
 assert.match(source,/skyMode==='chuvisco'\?2\.8:4\.3/);
 assert.match(source,/if\(dx\|\|dy\)\{worldPause=null;waypoint=null;/);
});
