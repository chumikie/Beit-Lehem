const assert=require('node:assert/strict');
const {ARCHETYPES,variant,statistics,restoreSketches,recordSketch,draw,drawPreview}=require('../dist/facade-studio.js');
const blocks=['matriz','feira','joao','clovis','feliciano','vicente'];
const homes=blocks.flatMap((block,i)=>Array.from({length:20},(_,j)=>({x:i*100+j*4,y:10+j,w:12+(j%7),h:11+(j%5),seed:j,angle:.4,centralBlock:block})));
assert.equal(statistics(homes).total,120);
for(const block of blocks){assert.equal(statistics(homes)[block],20);assert.equal(new Set(homes.filter(h=>h.centralBlock===block).map(h=>variant(h).kind)).size,5);assert(ARCHETYPES[block].length>=5);}
assert.equal(variant({...homes[0],centralBlock:null}),null);assert.deepEqual(variant(homes[0]),variant({...homes[0]}));
function fakeCanvas(){const ops=[],c={};for(const fn of ['save','restore','translate','rotate','fillRect','strokeRect','beginPath','moveTo','lineTo','stroke','arc','ellipse','fill','clearRect'])c[fn]=(...args)=>ops.push([fn,...args]);return{c,canvas:{width:186,height:90,getContext:()=>c},ops};}
for(const phase of ['manha','tarde','anoitecer'])for(const home of homes){const {c,ops}=fakeCanvas(),before=JSON.stringify(home);assert(draw(c,home,phase,phase==='anoitecer'?19*60:9*60));assert(ops.some(x=>x[0]==='fillRect'));assert.equal(JSON.stringify(home),before);}
for(const block of blocks){const {canvas,ops}=fakeCanvas();assert(drawPreview(canvas,block));assert(ops.filter(x=>x[0]==='translate').length>=3);}
assert(!drawPreview(fakeCanvas().canvas,'not-a-real-block'));assert.equal(draw(fakeCanvas().c,{x:0,y:0,w:12,h:12,centralBlock:null}),false);
assert.deepEqual(restoreSketches(['matriz','feira','joao']),['matriz','feira','joao'],'progress from older saves survives');
const sketches=[];assert(!recordSketch(sketches,'feira',false).recorded);assert(recordSketch(sketches,'feira',true).recorded);assert(!recordSketch(sketches,'feira',true).recorded);assert(!recordSketch(sketches,'fake',true).recorded);assert(!recordSketch(sketches,'matriz',true).unlocked);assert(!recordSketch(sketches,'joao',true).unlocked);assert(recordSketch(sketches,'clovis',true).recorded);assert(recordSketch(sketches,'feliciano',true).recorded);assert(recordSketch(sketches,'vicente',true).unlocked);assert.deepEqual(restoreSketches(JSON.parse(JSON.stringify(sketches))),blocks);assert.deepEqual(restoreSketches(['fake','feira','feira']),['feira']);
console.log('Ateliê: seis áreas, cinco formas por setor, variação manhã/tarde/noite e diário antigo preservado.');
