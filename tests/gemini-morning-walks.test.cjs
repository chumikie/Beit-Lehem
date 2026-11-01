const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const world=require('../gemini-modules/living-world.js');
const game=fs.readFileSync('gemini-modules/game.js','utf8');
test('caminhada de chegada é contínua e utiliza os polos existentes',()=>{
 const s=world.fresh();
 for(const id of ['damiao','lucia','bia']){
  for(let minute=480;minute<=540;minute++){
   s.minute=minute;
   const approach=world.morningDeparture(s,id);
   if(minute===540)assert.equal(approach,null);
   else {assert.ok(approach.shift>=0&&approach.shift<=11);assert.ok(approach.activity.length>10);}
  }
 }
 s.minute=510;
 assert.equal(world.agenda(s,'damiao').hub,'mercado');
 assert.equal(world.agenda(s,'bia').hub,'rodoviaria');
 assert.equal(world.agenda(s,'lucia').present,true);
 assert.equal(world.agenda(s,'lucia').hub,'igreja');
 assert.match(game,/walkingPoint\(def\.id,schedule\.hub,i,morning\?\.shift\|\|0\)/);
});
test('não modifica caminhos, horários globais nem encontros agendados',()=>{
 const s=world.fresh();s.minute=481;
 assert.equal(world.agenda(s,'lucia').present,false);
 const offset=world.morningDeparture(s,'damiao');
 assert.ok(offset);
 assert.equal(world.agenda(s,'damiao').hub,'mercado');
 assert.equal(world.morningDeparture({...s,minute:650},'damiao'),null);
});
