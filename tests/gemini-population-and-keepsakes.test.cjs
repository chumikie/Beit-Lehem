'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=global.RoncadorSecondaryNeighbors;
const affection=require('../gemini-modules/affection-memory.js');
const moments=require('../gemini-modules/street-moments.js');

test('nove moradores nomeados, sem perder o álbum dos três vizinhos originais',()=>{
 const ids=neighbors.RESIDENTS.map(x=>x.id);
 assert.equal(ids.length,6);
 assert.equal(new Set(ids).size,6);
 assert.deepEqual(['cica','nara','teo'].map(x=>ids.includes(x)),[true,true,true]);
 const old=neighbors.restore({seen:['cica','nara','teo'],choices:{cica:'fitas',nara:'desenho',teo:'recado'}});
 assert.equal(neighbors.coreProgress(old),3);
 assert.deepEqual(old.seen.slice().sort(),['cica','nara','teo'].sort());
});

test('Rosa, Zeca e Mila têm rotinas, gestos e escolhas que não duplicam cuidados',()=>{
 const clock={day:1,minute:9*60},state=neighbors.fresh();
 for(const id of ['rosa','zeca','mila']){
  const person=neighbors.RESIDENTS.find(x=>x.id===id);
  assert.ok(person,'morador existente: '+id);
  assert.ok(neighbors.agenda(clock,person).present,'presença de manhã: '+id);
  assert.equal(neighbors.agenda({day:1,minute:23*60},person).present,false,'descanso noturno: '+id);
  assert.ok(person.options.length>=2,'escolhas: '+id);
  assert.ok(moments.GESTURES[id],'gesto próprio: '+id);
  assert.equal(neighbors.interact(state,clock,id,person.options[0].id).ok,true);
  assert.equal(neighbors.interact(state,clock,id,person.options[1].id).ok,false,'sem exploração de pontos diários');
 }
 const recovered=neighbors.restore(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(recovered.choices,state.choices);
 for(const id of ['rosa','zeca','mila'])
  assert.equal(affection.snapshot({sideNeighbors:recovered,living:clock},id).remembered,true);
});

test('histórias de Lúcia, Ciça e Nara desbloqueiam gentilezas conectadas',()=>{
 const zeca=neighbors.RESIDENTS.find(x=>x.id==='zeca');
 const mila=neighbors.RESIDENTS.find(x=>x.id==='mila');
 assert.equal(neighbors.availableOptions(zeca,{}).some(x=>x.id==='muda-lucia'),false);
 assert.equal(neighbors.availableOptions(zeca,{luciaGarden:{claimed:true}}).some(x=>x.id==='muda-lucia'),true);
 assert.equal(neighbors.availableOptions(mila,{}).some(x=>x.id==='amigas'),false);
 const known={choices:{cica:'fitas',nara:'desenho'}};
 assert.equal(neighbors.availableOptions(mila,{sideNeighbors:known}).some(x=>x.id==='amigas'),true);
 const state=neighbors.fresh();
 assert.equal(neighbors.interact(state,{day:1,minute:9*60},'zeca','muda-lucia',{luciaGarden:{claimed:true}}).ok,true);
 assert.equal(neighbors.interact(state,{day:1,minute:9*60},'mila','amigas',{sideNeighbors:known}).ok,true);
 const cards=affection.collection({luciaGarden:{claimed:true},sideNeighbors:state}).map(x=>x.id);
 assert.ok(cards.includes('zeca-lucia'));
 assert.ok(cards.includes('mila-cores'));
 assert.equal(new Set(cards).size,cards.length);
});
