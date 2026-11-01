const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('gemini-modules/game.js','utf8');
const definitions=source.slice(source.indexOf('const MORNING_GREETING_LINES='),source.indexOf('let morningEncounters=[];'));
const logic=source.slice(source.indexOf('function restoreMorningEncounters('),source.indexOf('function everydayConversationCandidate('));
const context=vm.createContext({Object,Number,Array,Set});
vm.runInContext(definitions+logic,context);
test('somente conversas reais entre 8h e 10h geram bons-dias únicos',()=>{
 const candidate=(id,day,minute,records)=>context.morningGreetingCandidate(id,day,minute,records);
 assert.equal(candidate('damiao',1,479,[]),null);
 assert.equal(candidate('bia',1,600,[]),null);
 assert.equal(candidate('nao_existe',1,510,[]),null);
 const first=candidate('damiao',1,510,[]);
 assert.match(first.line,/pão francês/);
 assert.equal(first.returning,false);
 assert.equal(candidate('damiao',1,530,[{id:'damiao',day:1}]),null);
 assert.equal(candidate('damiao',2,510,[{id:'damiao',day:1}]).returning,false);
 assert.equal(candidate('damiao',5,510,[{id:'damiao',day:1}]).returning,true);
});
test('salvamentos antigos, duplicados e futuros são filtrados',()=>{
 const restore=context.restoreMorningEncounters;
 assert.equal(restore(undefined,7).length,0);
 const records=restore([{id:'damiao',day:1},{id:'damiao',day:1},{id:'bia',day:1},{id:'bia',day:15},{id:'invalid',day:2}],7);
 assert.deepEqual(Array.from(records,r=>r.id),['damiao','bia']);
});
test('diário e restauração preservam registros sem recompensas',()=>{
 assert.match(source,/morningEncounters=restoreMorningEncounters\(saved\.morningEncounters,living\.day\)/);
 assert.match(source,/morningEncounters=\[\];waterMemories=\[\];waterTalks=\[\];seasonalMemories=\[\]/);
 assert.match(source,/const morningGreeting=rememberMorningGreeting\(id\)/);
 assert.match(source,/Bons-dias vividos/);
});
