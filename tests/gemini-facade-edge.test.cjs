'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {draw,variant}=require('../gemini-modules/facade-studio.js');
function canvas(){
 const rectangles=[],ctx={};
 for(const name of ['save','restore','translate','rotate','strokeRect','beginPath','moveTo','lineTo','stroke','arc','ellipse','fill'])
  ctx[name]=()=>{};
 ctx.fillRect=(...args)=>rectangles.push(args);
 return {ctx,rectangles};
}
test('acabamento residencial mantém os lotes e varia sem repetir em todas as casas',()=>{
 for(const block of ['joao','clovis','vicente']){
  const seen=new Set();
  for(let seed=0;seed<12;seed++){
   const home={x:42,y:64,w:18,h:15,angle:.18,seed,centralBlock:block};
   const before=JSON.stringify(home),{ctx,rectangles}=canvas();
   assert.equal(draw(ctx,home,'tarde',16*60),true);
   assert.equal(JSON.stringify(home),before);
   assert.ok(rectangles.length>4);
   seen.add(variant(home).kind);
  }
  assert.ok(seen.size>=3,block+' deve preservar diversidade');
 }
});
test('acabamento residencial respeita noite e não altera área sem estudo',()=>{
 const home={x:15,y:23,w:17,h:14,angle:0,seed:6,centralBlock:'clovis'};
 for(const [phase,minute]of [['manha',9*60],['anoitecer',20*60]]){
  const {ctx,rectangles}=canvas();
  assert.equal(draw(ctx,home,phase,minute),true);
  assert.ok(rectangles.length>5);
 }
 const {ctx}=canvas();
 assert.equal(draw(ctx,{...home,centralBlock:null},'manha'),false);
});
