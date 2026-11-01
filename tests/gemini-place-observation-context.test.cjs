'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const snippet=source.slice(source.indexOf('function observeWorldMoment(){'),source.indexOf('function camucaHas('));

function visit(id,activity){
 const notes=[],messages=[],seen=[],calls={save:0,pause:0};
 const moment={title:'Um lugar de Belém',icon:'✿',story:'Um momento tranquilo.'};
 const names=['nearbySidewalkPause','data','player','worldMomentAt','WORLD_MOMENTS','kawaiiState','cultureDailyActivity','living','window','beginWorldPause','worldMoments','recordStreetVignette','recordSeasonalMoment','notify','save','note'];
 const values=[()=>null,{},{} ,()=>id,{[id]:moment},null,()=>activity,{day:3,notes},
  {RoncadorLivingWorld:{},RoncadorSecondaryNeighbors:{}},()=>calls.pause++,seen,()=>false,()=>false,
  message=>messages.push(message),()=>calls.save++,()=>{}];
 const observe=new Function(...names,snippet+';return observeWorldMoment;')(...values);
 assert.equal(observe(),true);
 assert.equal(observe(),true);
 return {notes,messages,seen,calls};
}

test('Mercado, Matriz e Rodoviária mostram o contexto da agenda sem duplicar lembranças',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  const context='Na agenda deste horário: atividade existente de '+id+'.';
  const result=visit(id,context);
  assert.ok(result.messages.every(message=>message.includes(context)),id);
  assert.equal(result.notes.length,1);
  assert.equal(result.calls.save,1);
  assert.equal(result.calls.pause,2);
  assert.equal(result.seen.length,1);
 }
});

test('sem atividade local válida a pausa continua sem inventar personagem',()=>{
 const result=visit('mercado',null);
 assert.ok(result.messages.every(message=>!message.includes('Na agenda deste horário:')));
 assert.equal(result.notes.length,1);
 assert.match(source,/const dailyContext=id==='mato'\?'':cultureDailyActivity\(id,living,window\.RoncadorLivingWorld,window\.RoncadorSecondaryNeighbors\)\|\|''/);
});
