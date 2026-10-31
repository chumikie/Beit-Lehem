'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {draw}=require('../gemini-modules/facade-studio.js');
function stage(){
 const events=[],c={};
 for(const key of ['save','restore','translate','rotate','strokeRect','beginPath','moveTo','lineTo','stroke','arc','ellipse','fill','fillRect']){
  c[key]=(...args)=>events.push([key,...args]);
 }
 return {c,events};
}
test('fachadas distantes simplificam microdetalhes mantendo o mesmo lote e posição',()=>{
 for(const block of ['matriz','feira','joao','clovis','vicente']){
  const home={x:42,y:64,w:18,h:15,angle:.18,seed:10,centralBlock:block};
  const before=JSON.stringify(home),near=stage(),far=stage();
  assert.equal(draw(near.c,home,'tarde',960,1.85),true);
  assert.equal(draw(far.c,home,'tarde',960,.8),true);
  assert.equal(JSON.stringify(home),before);
  assert.ok(far.events.length<near.events.length,block);
  const transforms=events=>events.filter(entry=>entry[0]==='translate'||entry[0]==='rotate');
  assert.deepEqual(transforms(far.events),transforms(near.events));
 }
});
test('fachadas sem estudo permanecem intocadas nos dois zooms',()=>{
 const home={x:20,y:30,w:18,h:15,angle:0,seed:2,centralBlock:null};
 for(const zoom of [.8,1.85]){
  const {c,events}=stage();
  assert.equal(draw(c,home,'manha',540,zoom),false);
  assert.equal(events.length,0);
 }
});
