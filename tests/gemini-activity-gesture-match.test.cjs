'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const world=require('../gemini-modules/living-world.js');
const moments=require('../gemini-modules/street-moments.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');

function gesture(person,clock){
 const offset=moments.GESTURES[person.id].offset;
 return moments.choose(person,(33-offset+1)%33,clock);
}

test('gestos existentes acompanham ocupações reais dos cinco moradores',()=>{
 const clock={day:1,minute:10*60};
 const francisco=world.agenda(clock,'damiao');
 assert.equal(gesture({id:'damiao',hub:francisco.hub,activity:francisco.activity},clock).kind,'rest');
 const cica=neighbors.RESIDENTS.find(p=>p.id==='cica'),cicaDuty=neighbors.agenda(clock,cica);
 assert.equal(gesture({id:'cica',hub:cica.hub,activity:cicaDuty.activity},clock).kind,'ribbon');
 const lucia=world.agenda(clock,'lucia');
 assert.equal(gesture({id:'lucia',hub:lucia.hub,activity:lucia.activity},clock).kind,'flower');
 const nara=neighbors.RESIDENTS.find(p=>p.id==='nara'),naraDuty=neighbors.agenda(clock,nara);
 assert.equal(gesture({id:'nara',hub:nara.hub,activity:naraDuty.activity},clock).kind,'sketch');
 const afternoon={day:1,minute:16*60},bia=world.agenda(afternoon,'bia');
 assert.equal(gesture({id:'bia',hub:bia.hub,activity:bia.activity},afternoon).kind,'read');
});

test('atividade de observação continua usando pausa de observação, sem novo gesto',()=>{
 assert.equal(moments.routineKind({id:'damiao',activity:'observando o movimento da feira'},'look'),'look');
 assert.equal(moments.routineKind({id:'bia',activity:'observando as chegadas e despedidas'},'rest'),'rest');
 assert.equal(moments.routineKind({id:'rosa',activity:'observa o movimento'},'look'),'look');
});

test('encontros mantêm prioridade; integração não toca em horários, posições ou saves',()=>{
 const clock={day:1,minute:10*60},person={id:'cica',hub:'mercado',activity:'separa fitas'};
 assert.equal(moments.choose({...person,meeting:true},1,clock),null);
 assert.equal(moments.choose({...person,travel:true},1,clock),null);
 assert.match(game,/const behavior=\{id:def\.id,meeting:!!schedule\.meeting,travel:!!schedule\.travel,activity:schedule\.activity\}/);
 assert.match(game,/hub:duty\.hub,activity:duty\.activity,meeting:/);
 const before=world.fresh(),saved=JSON.stringify(before);
 for(const id of ['damiao','lucia','bia'])world.agenda(clock,id);
 assert.equal(JSON.stringify(before),saved);
});
