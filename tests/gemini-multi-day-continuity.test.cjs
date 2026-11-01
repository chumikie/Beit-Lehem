const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const livingWorld=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function residentGestureWarmth('),source.indexOf('function drawStreetLife('));
const createPlayerPresenceGestures=new Function(fragment+';return createPlayerPresenceGestures;')();
const player={x:20,y:0};
const at=(id,extra={})=>({id,def:{id},x:0,y:0,...extra});

test('sete dias: interações comprovadas alimentam cinco reencontros sem criar fatos',()=>{
 const living=livingWorld.fresh(),sideNeighbors=neighbors.fresh();
 for(const id of ['damiao','lucia','bia'])assert.ok(livingWorld.talk(living,id)?.newMemory);
 for(const [id,choice] of [['cica','fitas'],['nara','desenho']]){
  const result=neighbors.interact(sideNeighbors,living,id,choice);
  assert.equal(result.ok,true,id);
 }
 const context={living,sideNeighbors,worldPause:null};
 const gesture=createPlayerPresenceGestures();
 const snapshots=JSON.stringify({living,sideNeighbors});
 for(const id of ['damiao','cica','lucia','nara','bia']){
  assert.equal(gesture(at(id),player,context,1).stage,'nearby',id);
  gesture(at(id),{x:80,y:0},context,3);
 }
 assert.equal(JSON.stringify({living,sideNeighbors}),snapshots);
 for(let i=0;i<2;i++)livingWorld.tomorrow(living);
 assert.equal(living.day,3);
 for(const id of ['damiao','cica','lucia','nara','bia']){
  const arrival=gesture(at(id),player,context,10);
  assert.equal(arrival.stage,'reunion',id);
  assert.equal(gesture(at(id),player,context,11).stage,'nearby',id);
  gesture(at(id),{x:80,y:0},context,12);
  assert.equal(gesture(at(id),player,context,13).stage,'nearby',id);
  gesture(at(id),{x:80,y:0},context,14);
 }
 for(let i=0;i<4;i++)livingWorld.tomorrow(living);
 assert.equal(living.day,7);
 for(const id of ['damiao','cica','lucia','nara','bia']){
  assert.equal(gesture(at(id,{walking:true}),player,context,30),null,id);
  assert.equal(gesture(at(id,{moment:{kind:'read'}}),player,context,30.1),null,id);
  assert.equal(gesture(at(id),player,context,31).stage,'reunion',id);
 }
});

test('novo jogo limpa memória transitória, sem alterar saves nem agenda',()=>{
 const gesture=createPlayerPresenceGestures();
 const state={living:{day:5,people:{lucia:{bond:2,lastConversationDay:1,lastCareDay:0}}},sideNeighbors:{seen:[],choices:{},lastHelp:{}},worldPause:null};
 const before=structuredClone(state);
 assert.equal(gesture(at('lucia'),player,state,20).stage,'reunion');
 gesture(at('lucia'),{x:80,y:0},state,21);
 assert.equal(gesture(at('lucia'),player,state,22).stage,'nearby');
 gesture.clear();
 assert.equal(gesture(at('lucia'),player,state,1).stage,'reunion');
 assert.deepEqual(state,before);
 assert.match(source,/function reset\(\)\{if\(!loaded\)return;playerPresenceGestures\.clear\(\)/);
});
