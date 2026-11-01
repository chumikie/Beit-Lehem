'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function drawDailyActivity('),end=source.indexOf('function prepareWildlife(',start);
const drawSource=source.slice(start,end)+';drawDailyActivity';

function scene(minute,phase='manha'){
 const living={minute},houses=[{x:25,y:32,w:17,h:14,seed:9,centralBlock:'matriz'},
  {x:45,y:40,w:17,h:14,seed:9,centralBlock:'clovis'},
  {x:65,y:40,w:17,h:14,seed:8,centralBlock:'joao'}];
 const queues=[],overlays=[];
 const draw=vm.runInNewContext(drawSource,{
  living,lightPhase:phase,showScenery:true,reduce:true,
  roadDetails:{junctions:[{x:2,y:10},{x:6,y:10},{x:12,y:10}]},
  window:{RoncadorDailyMoments:{current:()=>null}},data:{landmarks:[]}
 });
 draw({},0,{left:-10,right:100,top:-10,bottom:100},houses,queues,overlays);
 return {queues,overlays};
}

test('adereços são determinísticos, situados junto a casas elegíveis, sem save',()=>{
 for(const minute of [540,1020]){
  const a=scene(minute),b=scene(minute);
  assert.equal(a.queues.length,4); // Two selected homes and two visible even junctions.
  assert.deepEqual(Array.from(a.queues,q=>q.sortY),Array.from(b.queues,q=>q.sortY));
  assert.equal(a.overlays.length,0);
 }
 assert.doesNotMatch(drawSource,/(?<!\.)save\(|localStorage|houses\.push|roads\.push/);
});

test('a tarde começa após as 15h e postes permanecem em esquinas existentes',()=>{
 assert.equal(scene(810).queues.length,2);
 assert.equal(scene(900,'tarde').queues.length,4);
 assert.match(drawSource,/i\+=2/);
 assert.match(drawSource,/x=j\.x\+7,y=j\.y/);
 const render=source.slice(source.indexOf('function render(time){'),source.indexOf('function explorationBounds('));
 assert.match(render,/living\.minute>=1040/);
 assert.match(render,/#fcebb044/);
 assert.ok(render.indexOf('for(const item of renderables)item.draw()')<render.indexOf('for(const draw of speechOverlays)draw()'));
});
