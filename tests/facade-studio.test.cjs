const assert=require('node:assert/strict');
const {ARCHETYPES,variant,statistics,restoreSketches,recordSketch,draw,drawPreview}=require('../dist/facade-studio.js');
const blocks=['matriz','feira','joao'];
const homes=blocks.flatMap((block,i)=>Array.from({length:20},(_,j)=>({x:i*100+j*4,y:10+j,w:12+(j%7),h:11+(j%5),seed:j,angle:.4,centralBlock:block})));
assert.equal(statistics(homes).total,60);
for(const block of blocks){
 assert.equal(statistics(homes)[block],20);
 assert.equal(new Set(homes.filter(h=>h.centralBlock===block).map(h=>variant(h).kind)).size,5,'A street family should vary its buildings');
 assert(ARCHETYPES[block].length>=5);
}
assert.equal(variant({...homes[0],centralBlock:null}),null,'Do not invent central styling away from studied blocks');
assert.deepEqual(variant(homes[0]),variant({...homes[0]}),'Art selection must be deterministic across sessions');

function fakeCanvas(){
 const ops=[];const c={};
 for(const fn of ['save','restore','translate','rotate','fillRect','strokeRect','beginPath','moveTo','lineTo','stroke','arc','fill','clearRect'])c[fn]=(...args)=>ops.push([fn,...args]);
 const canvas={width:186,height:90,getContext:()=>c};return{c,canvas,ops};
}
for(const phase of ['manha','tarde','anoitecer'])for(const home of homes){
 const {c,ops}=fakeCanvas(),before=JSON.stringify(home);
 assert(draw(c,home,phase,phase==='anoitecer'?19*60:9*60));
 assert(ops.some(x=>x[0]==='fillRect'));
 assert.equal(JSON.stringify(home),before,'Rendering cannot move, resize or mutate a mapped house');
}
for(const block of blocks){
 const {canvas,ops}=fakeCanvas();
 assert(drawPreview(canvas,block));
 assert(ops.filter(x=>x[0]==='translate').length>=3,'Preview should contain three original facades');
}
assert(!drawPreview(fakeCanvas().canvas,'not-a-real-block'));
assert.equal(draw(fakeCanvas().c,{x:0,y:0,w:12,h:12,centralBlock:null}),false);
const empty=restoreSketches(undefined);
assert.deepEqual(empty,[],'V2.18 saves must remain valid with no sketches');
assert(!recordSketch(empty,'feira',false).recorded,'No reward when away from the hub');
assert(recordSketch(empty,'feira',true).recorded);
assert(!recordSketch(empty,'feira',true).recorded,'Only one drawing per study area');
assert(!recordSketch(empty,'fake',true).recorded,'Invalid locations cannot generate memories');
assert(!recordSketch(empty,'matriz',true).unlocked);
assert(recordSketch(empty,'joao',true).unlocked,'Three unique observations unlock the reward');
assert.deepEqual(restoreSketches(JSON.parse(JSON.stringify(empty))),['matriz','feira','joao'],'Full album reward survives reload');
assert.deepEqual(restoreSketches(['fake','feira','feira']),['feira'],'Untrusted or duplicated save values are ignored');
console.log('V2.19 facades: 3 distinct artistic street palettes, 5 deterministic types per street, day/dusk, sketches and unchanged house geometry verified.');
