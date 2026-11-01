'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const world=require('../gemini-modules/living-world.js');
const map=require('../dist/map.json');

const clock=(day,hour)=>({day,minute:hour*60,people:world.fresh().people,notes:[]});

test('a primeira semana mantém os horários conhecidos',()=>{
 for(const day of [1,2,3,4,5,6,7])for(const id of ['damiao','lucia','bia']){
  assert.equal(world.weeklyVariation(clock(day,10.5),id),null);
 }
 assert.equal(world.agenda(clock(2,10.5),'damiao').hub,'mercado');
});

test('Damião alterna pausa curta com disponibilidade no Mercado',()=>{
 assert.match(world.agenda(clock(9,10.5),'damiao').activity,/descansando/);
 assert.equal(world.agenda(clock(9,9),'damiao').hub,'mercado');
 assert.equal(world.agenda(clock(9,16.5),'damiao').hub,'mercado');
 assert.equal(world.agenda(clock(16,10.5),'damiao').hub,'mercado');
 assert.match(world.lastWeekRoutine(clock(15,9),'damiao'),/semana passada/);
 assert.equal(world.lastWeekRoutine(clock(9,9),'damiao'),'');
});

test('visitas de Lúcia e Bia usam somente núcleos já existentes no mapa',()=>{
 assert.equal(world.agenda(clock(10,17.25),'lucia').hub,'rodoviaria');
 assert.equal(world.agenda(clock(10,10),'lucia').hub,'igreja');
 assert.equal(world.agenda(clock(18,11.25),'bia').hub,'igreja');
 assert.equal(world.agenda(clock(18,16),'bia').hub,'rodoviaria');
 const hubs=['mercado','igreja','rodoviaria'];
 for(const hub of hubs)assert.ok(map.landmarks.some(p=>p.id===hub),hub);
 assert.match(world.lastWeekRoutine(clock(22,10),'bia'),/Lúcia/);
});

test('visitas possuem chegada, conversa e retorno sem sobrepor encontro de quarta à tarde',()=>{
 assert.equal(world.weeklyReunion(clock(10,15.5)),null);
 assert.equal(world.weeklyReunion(clock(10,16.8)).phase,'approach');
 assert.equal(world.weeklyReunion(clock(10,17.25)).phase,'visit');
 assert.equal(world.weeklyReunion(clock(10,17.6)).phase,'return');
 assert.equal(world.weeklyReunion(clock(10,18)),null);
 assert.equal(world.weeklyVisitAgenda(clock(10,17.25),'bia').meeting,true);
 assert.equal(world.weeklyVisitAgenda(clock(10,17.25),'lucia').meeting,true);
 assert.equal(world.weeklyVisitAgenda(clock(10,17.25),'damiao'),null);
 assert.equal(world.weeklyReunion(clock(18,11.25)).id,'bia-visita-lucia');
});

test('rotinas são estáveis após salvar e restaurar o relógio fictício',()=>{
 const state=world.fresh();state.day=18;state.minute=630;
 const restored=world.restore(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(world.agenda(restored,'bia'),world.agenda(state,'bia'));
 assert.deepEqual(world.weeklyVariation(restored,'bia'),world.weeklyVariation(state,'bia'));
});
