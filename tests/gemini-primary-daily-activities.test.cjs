'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const clock=(day,minute)=>({day,minute});

test('Francisco, Lúcia e Bia variam ocupações sem sair de seus polos conhecidos',()=>{
 for(const [id,hub,morning,afternoon] of [
  ['damiao','mercado',10*60,16*60+30],
  ['lucia','igreja',10*60,16*60],
  ['bia','rodoviaria',10*60,16*60]
 ]){
  const mornings=[2,3,4].map(day=>world.agenda(clock(day,morning),id));
  const afternoons=[2,3,4].map(day=>world.agenda(clock(day,afternoon),id));
  assert.equal(new Set(mornings.map(a=>a.activity)).size,3,id+' manhã');
  assert.equal(new Set(afternoons.map(a=>a.activity)).size,3,id+' tarde');
  for(const duty of [...mornings,...afternoons]){
   assert.equal(duty.present,true);
   assert.equal(duty.hub,hub);
  }
  assert.notEqual(world.dailyActivity(clock(2,morning),id,'morning'),world.dailyActivity(clock(9,morning),id,'morning'),'semana seguinte não repete a mesma frase');
 }
 assert.equal(world.agenda(clock(1,10*60),'damiao').activity,'organizando a feira','segunda de feira preservada');
});

test('variação de atividade não muda horários, visitas ou estados salvos',()=>{
 const before=world.fresh();before.day=10;before.minute=10*60;
 const restored=world.restore(JSON.parse(JSON.stringify(before)));
 assert.deepEqual(world.agenda(restored,'damiao'),world.agenda(before,'damiao'));
 assert.equal(world.agenda(clock(10,17*60+15),'lucia').hub,'rodoviaria','visita tem prioridade');
 assert.equal(world.agenda(clock(2,13*60),'damiao').present,false);
 assert.equal(world.agenda(clock(2,12*60),'lucia').present,false);
 assert.equal(world.agenda(clock(2,12*60),'bia').present,false);
 assert.deepEqual(restored,before);
});

test('a rotina diária dos cinco moradores é derivada sem acrescentar memórias',()=>{
 const save=world.fresh(),secondary=neighbors.fresh();
 const snapshot=JSON.stringify({save,secondary});
 for(const day of [2,3,4,9]){
  for(const id of ['damiao','lucia','bia'])world.agenda(clock(day,10*60),id);
  for(const id of ['cica','nara'])neighbors.agenda(clock(day,10*60),neighbors.RESIDENTS.find(p=>p.id===id));
 }
 assert.equal(JSON.stringify({save,secondary}),snapshot);
});
