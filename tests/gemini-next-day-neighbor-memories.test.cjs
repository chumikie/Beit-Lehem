'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('Ciça e Nara retomam somente a gentileza realmente escolhida no dia anterior',()=>{
 const examples={cica:['fitas','cores','banca'],nara:['desenho','sombra','janela-bia','paisagem-bia']};
 for(const [id,choices] of Object.entries(examples))for(const choice of choices){
  const saved=neighbors.restore({lastHelp:{[id]:3},choices:{[id]:choice}});
  const reply=neighbors.nextDayReply(saved,{day:4},id);
  assert.ok(reply.includes('ontem'),id+':'+choice);
  assert.equal(neighbors.nextDayReply(saved,{day:3},id),'','não repete no dia da atividade');
  assert.equal(neighbors.nextDayReply(saved,{day:5},id),'','não repete indefinidamente');
  assert.equal(neighbors.nextDayReply(saved,{day:2},id),'','não antecipa uma lembrança');
 }
});

test('save antigo ou opção inexistente não inventam lembranças',()=>{
 for(const id of ['cica','nara','rosa','damiao','lucia','bia']){
  assert.equal(neighbors.nextDayReply(neighbors.restore({}),{day:4},id),'');
  assert.equal(neighbors.nextDayReply(neighbors.restore({lastHelp:{[id]:3},choices:{[id]:'inexistente'}}),{day:4},id),'');
 }
});

test('restauração e integração não alteram o contrato de salvamento',()=>{
 const saved=neighbors.restore({lastHelp:{cica:3,nara:3},choices:{cica:'fitas',nara:'desenho'}});
 const before=JSON.stringify(saved);
 assert.match(neighbors.nextDayReply(saved,{day:4},'cica'),/fitas/);
 assert.match(neighbors.nextDayReply(saved,{day:4},'nara'),/janelinha/);
 assert.equal(JSON.stringify(saved),before,'consultar a lembrança não modifica o save');
 assert.match(game,/nextDayReply\(sideNeighbors,living,def\.id\)/);
 assert.match(game,/nextDayMemory\?'♡ '\+nextDayMemory/);
});
