'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const world=require('../gemini-modules/living-world.js');

const roundTrip=state=>world.restore(JSON.parse(JSON.stringify(state)));
const notes=(count,day=7)=>Array.from({length:count},(_,i)=>({day,text:'Lembrança '+String(i+1).padStart(2,'0')}));

test('fechar e reabrir conserva 24 notas recentes e todas as memórias estruturadas',()=>{
 const state=world.fresh();
 state.day=7;
 state.notes=notes(24);
 state.people.damiao={...state.people.damiao,bond:3,lastConversationDay:6,lastCareDay:5,lastCareKind:'cestos',careCount:2};
 state.people.lucia={...state.people.lucia,bond:2,lastConversationDay:4,lastCareDay:3,lastCareKind:'mudas',careCount:1};
 const saved=JSON.parse(JSON.stringify(state));
 const reopened=roundTrip(state);
 assert.deepEqual(reopened.notes,saved.notes);
 assert.deepEqual(reopened.people,saved.people);
 assert.deepEqual(roundTrip(reopened),reopened,'uma segunda reabertura não altera as memórias');
});

test('save antigo com 12 notas continua compatível e pode crescer até 24',()=>{
 const older=world.fresh();
 older.day=7;
 older.notes=notes(12);
 const reopened=roundTrip(older);
 assert.deepEqual(reopened.notes,older.notes);
 for(let i=0;i<12;i++)reopened.notes.unshift({day:7,text:'Novo encontro '+i});
 assert.equal(roundTrip(reopened).notes.length,24);
 assert.deepEqual(roundTrip(reopened).notes.slice(-12),older.notes);
});

test('novas conversas e cuidados não descartam as notas 13 a 24',()=>{
 const state=world.fresh();
 state.day=7;
 state.notes=notes(24);
 const oldest=state.notes[23];
 const talked=world.talk(state,'damiao');
 assert.equal(talked.newMemory,true);
 assert.equal(state.notes.length,24);
 assert.deepEqual(state.notes[23],notes(24)[22]);
 assert.equal(world.care(state,'lucia','mudas').ok,true);
 assert.equal(state.notes.length,24);
 assert.deepEqual(state.notes[23],notes(24)[21]);
 assert.notDeepEqual(state.notes[23],oldest,'apenas a nota mais antiga sai quando o limite é atingido');
 const reopened=roundTrip(state);
 assert.deepEqual(reopened.notes,state.notes);
 assert.equal(reopened.people.damiao.bond,1);
 assert.equal(reopened.people.lucia.lastCareKind,'mudas');
 assert.equal(reopened.people.lucia.careCount,1);
});

test('restauração mantém validação original e teto de 24 notas',()=>{
 const state=world.fresh();
 state.day=7;
 state.notes=[
  {day:7,text:'válida'},
  {day:8,text:'futura'},
  {day:0,text:'dia inválido'},
  {day:7,text:'x'.repeat(161)},
  {day:7,text:42},
  ...notes(30)
 ];
 const reopened=roundTrip(state);
 assert.equal(reopened.notes.length,20,'somente as 24 entradas iniciais são consideradas, com validação');
 assert.deepEqual(reopened.notes[0],{day:7,text:'válida'});
 assert.equal(reopened.notes.at(-1).text,'Lembrança 19');
});

test('todos os produtores de notas do jogo respeitam o mesmo teto de 24',()=>{
 const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 const worldSource=fs.readFileSync(require.resolve('../gemini-modules/living-world.js'),'utf8');
 assert.doesNotMatch(game,/living\.notes\s*=\s*living\.notes\.slice\(0,12\)/);
 assert.doesNotMatch(worldSource,/\b(?:raw|s)\.notes\.slice\(0,12\)/);
 assert.ok((game.match(/living\.notes\s*=\s*living\.notes\.slice\(0,24\)/g)||[]).length>=23);
 assert.ok((worldSource.match(/\b(?:raw|s)\.notes\.slice\(0,24\)/g)||[]).length>=3);
});
