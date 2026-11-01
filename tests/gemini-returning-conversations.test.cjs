'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const world=require('../gemini-modules/living-world.js');

const reopen=s=>world.restore(JSON.parse(JSON.stringify(s)));

test('Francisco, Lúcia e Bia retomam a conversa comum após reabrir no dia seguinte',()=>{
 for(const id of ['damiao','lucia','bia']){
  const state=world.fresh();
  const first=world.talk(state,id);
  assert.equal(first.newMemory,true);
  assert.doesNotMatch(first.text,/conversa de ontem/);
  state.day=2;
  const reopened=reopen(state);
  const next=world.talk(reopened,id);
  assert.equal(next.newMemory,true);
  assert.match(next.text,/lembro da nossa conversa de ontem/);
  assert.equal(reopened.people[id].bond,2);
  assert.equal(reopened.notes.length,2);
  assert.equal(world.talk(reopened,id).newMemory,false,'reencontro no mesmo dia não repete recompensa');
 }
});

test('reencontro após alguns dias reconhece visita anterior sem atribuir acontecimentos inventados',()=>{
 const state=world.fresh();
 world.talk(state,'lucia');
 state.day=5;
 const next=world.talk(reopen(state),'lucia');
 assert.match(next.text,/nossa última conversa/);
 assert.doesNotMatch(next.text,/ontem/);
});

test('lembrança de cuidado mantém prioridade e vínculo estruturado após fechar o jogo',()=>{
 const state=world.fresh();
 world.talk(state,'damiao');
 assert.equal(world.care(state,'damiao','cestos').ok,true);
 state.day=2;
 const reopened=reopen(state);
 const next=world.talk(reopened,'damiao');
 assert.match(next.text,/cestos que arrumamos ontem/);
 assert.doesNotMatch(next.text,/Que bom rever/);
 assert.equal(reopened.people.damiao.lastCareKind,'cestos');
 assert.equal(reopened.people.damiao.careCount,1);
 assert.equal(reopened.people.damiao.lastConversationDay,2);
});

test('primeiro encontro em saves antigos não inventa reencontros',()=>{
 const state=world.restore({day:18,minute:510,people:{damiao:{bond:2,lastConversationDay:0}},notes:[]});
 const first=world.talk(state,'damiao');
 assert.doesNotMatch(first.text,/Que bom rever/);
 assert.equal(state.people.damiao.bond,3);
});
