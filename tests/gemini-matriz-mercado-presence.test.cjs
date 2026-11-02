'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const secondary=global.RoncadorSecondaryNeighbors;

test('Lúcia permanece na Matriz no sino das 17h, sem alterar os saves',()=>{
 const clock=world.fresh(),before=JSON.stringify(clock);
 for(const minute of [870,1020,1109]){
  const duty=world.agenda({...clock,minute},'lucia');
  assert.equal(duty.present,true,`Lúcia presente às ${minute} min`);
  assert.equal(duty.hub,'igreja');
 }
 assert.equal(world.agenda({...clock,minute:1110},'lucia').present,false);
 assert.equal(JSON.stringify(clock),before);
});

test('Mercado e Matriz mantêm vizinhos nos horários de almoço',()=>{
 for(const minute of [720,750,780,810,839]){
  const clock={day:1,minute};
  for(const hub of ['mercado','igreja']){
   const def=secondary.RESIDENTS.find(r=>r.hub===hub);
   assert.equal(secondary.agenda(clock,def).present,true,`${hub} às ${minute} min`);
  }
 }
 const cica=secondary.RESIDENTS.find(r=>r.id==='cica');
 assert.equal(secondary.agenda({day:1,minute:8*60+21},cica).walking,true);
 assert.equal(secondary.agenda({day:1,minute:8*60+23},cica).walking,false);
});

test('encontro entre moradores não remove secundários da lista',()=>{
 const game=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
 const section=game.slice(game.indexOf('function secondaryInStreets('),game.indexOf('function drawSocialGesture('));
 assert.match(section,/placed\.push\(person\)/);
 assert.match(section,/person\.crowded=/);
 assert.doesNotMatch(section,/occupied\.some\([^\n]+\)\)continue/);
});
