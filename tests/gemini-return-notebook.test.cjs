'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const world=require('../gemini-modules/living-world.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function restoreMicroStories('),end=source.indexOf('function closestNamedRoad(',start);
assert.ok(start>=0&&end>start);
const MICRO_STORIES={damiao:{choice:'sombra',title:'A sombra da feira'},lucia:{choice:'sementes',title:'Sementes de histórias'},bia:{choice:'bilhetes',title:'Uma página de chegadas'}};
const helpers=new Function('MICRO_STORIES',source.slice(start,end)+';return {restoreMicroStories,restoreLastJournalDay,notebookReturnSummary};')(MICRO_STORIES);

test('três novas gentilezas usam o limite diário e a agenda existente',()=>{
 for(const [id,story] of Object.entries(MICRO_STORIES)){
  assert.ok(world.CARE[id].some(choice=>choice.id===story.choice),id);
  const state=world.fresh(),result=world.care(state,id,story.choice);
  assert.equal(result.ok,true);
  assert.equal(world.care(state,id,story.choice).ok,false);
  assert.equal(state.people[id].lastCareKind,story.choice);
 }
});

test('micro-histórias antigas não são fabricadas e entradas malformadas são ignoradas',()=>{
 assert.deepEqual(helpers.restoreMicroStories(null,12),[]);
 assert.deepEqual(helpers.restoreMicroStories([
  {id:'damiao',day:3},{id:'damiao',day:3},{id:'lucia',day:5},
  {id:'inventado',day:6},{id:'bia',day:15},{id:'bia',day:-1}
 ],12),[{id:'damiao',day:3},{id:'lucia',day:5}]);
});

test('resumo de retorno usa somente dias e fatos realmente registrados',()=>{
 assert.equal(helpers.restoreLastJournalDay(undefined,18),18);
 assert.equal(helpers.restoreLastJournalDay(9,18),9);
 assert.equal(helpers.restoreLastJournalDay(99,18),18);
 assert.match(helpers.notebookReturnSummary(3,10,[{day:8},{day:10},{day:2}]),/2 nova\(s\) lembrança\(s\)/);
 assert.match(helpers.notebookReturnSummary(3,10,[]),/sem novos registros/);
 assert.match(helpers.notebookReturnSummary(10,10,[]),/Tudo em seu tempo/);
});

test('o acabamento Canvas preserva personagens e acrescenta detalhes discretos',()=>{
 assert.match(source,/const wardrobe=named\?/);
 assert.match(source,/fabricLight=c\.createLinearGradient/);
 assert.match(source,/browLift=person\.social/);
 assert.match(source,/if\(damiao\).*wardrobe/s);
 assert.match(source,/if\(lucia\).*wardrobe/s);
 assert.match(source,/if\(bia\).*wardrobe/s);
});
