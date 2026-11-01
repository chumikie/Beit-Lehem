'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const file=require.resolve('../gemini-modules/secondary-neighbors.js');
delete require.cache[file];require(file);
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

test('escolha duradoura da feira fica salva e não se duplica',()=>{
 const state=neighbors.fresh();
 assert.equal(neighbors.rememberFairChoice(state,'fita',3),true);
 assert.equal(neighbors.rememberFairChoice(state,'conversa',4),false);
 assert.equal(neighbors.rememberFairChoice(state,'fita',3),false);
 const recovered=neighbors.restore(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(recovered.marketLegacy,{kind:'fita',day:3});
 assert.match(neighbors.fairMemoryLine(recovered,'damiao'),/fita/);
 assert.match(neighbors.fairMemoryLine(recovered,'cica'),/laço/);
});
test('salvamento antigo não cria uma escolha fictícia',()=>{
 assert.deepEqual(neighbors.restore({}).marketLegacy,{kind:null,day:0});
 assert.deepEqual(neighbors.restore({marketLegacy:{kind:'fita',day:'erro'}}).marketLegacy,{kind:null,day:0});
 const state=neighbors.fresh();
 assert.equal(neighbors.rememberFairChoice(state,'invalido',1),false);
 assert.equal(neighbors.rememberFairChoice(state,'conversa',0),false);
 assert.equal(neighbors.fairMemoryLine(state,'damiao'),'');
});
test('consequência só nasce de ações reais após concluir a banca',()=>{
 assert.match(game,/def\.id==='damiao'&&choice\.id==='historias'&&marketMorning\.claimed/);
 assert.match(game,/result\.ok&&def\.id==='cica'&&choice\.id==='banca'&&marketMorning\.claimed/);
 assert.match(game,/if\(id==='damiao'&&sideNeighbors\.marketLegacy\?\.kind\)/);
 assert.match(game,/const legacy=sideNeighbors\.marketLegacy\?\.kind/);
});
