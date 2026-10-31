const assert=require('node:assert/strict');
const test=require('node:test');
const {openSlot}=require('../gemini-modules/crowd-flow.js');

test('o pedestre usa a rota normal longe de cruzamentos',()=>{
 assert.deepEqual(openSlot(offset=>({x:offset,y:0}),[],[]),{x:0,y:0});
});
test('não para no miolo da esquina e procura trecho da mesma rota',()=>{
 const point=openSlot(offset=>({x:offset,y:0}),[],[{x:0,y:0}]);
 assert.deepEqual(point,{x:29,y:0});
});
test('mantém distância dos outros moradores',()=>{
 const point=openSlot(offset=>({x:offset,y:0}),[{x:29,y:0}],[{x:0,y:0}]);
 assert.deepEqual(point,{x:-29,y:0});
});
test('omite o figurante quando só existem pontos inseguros',()=>{
 assert.equal(openSlot(()=>({x:0,y:0}),[],[{x:0,y:0}]),null);
});
test('ignora amostras inválidas sem afetar os demais moradores',()=>{
 assert.deepEqual(openSlot(offset=>offset===0?{x:NaN,y:0}:{x:offset,y:0},[],[]),{x:14,y:0});
});
