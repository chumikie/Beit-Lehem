const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('gemini-modules/game.js','utf8');
const definitions=source.slice(source.indexOf('const BREAD_STORIES='),source.indexOf('let breadStories=[];'));
const logic=source.slice(source.indexOf('function breadStoryCandidate('),source.indexOf('function everydayConversationCandidate('));
const context=vm.createContext({Object,Number,Array});
vm.runInContext(definitions+logic,context);
const candidate=(id,day,records,claimed)=>context.breadStoryCandidate(id,day,records,claimed);
const restore=(records,day)=>context.restoreBreadStories(records,day);
test('O cheiro do pão respeita feira, dias diferentes e conhecimento compartilhado',()=>{
 assert.equal(candidate('damiao',1,[],false),null);
 assert.equal(candidate('damiao',1,[],true),'ouvido-damiao');
 const first=[{id:'ouvido-damiao',day:1}];
 assert.equal(candidate('bia',2,first,true),null);
 assert.equal(candidate('lucia',1,first,true),null);
 assert.equal(candidate('lucia',2,first,true),'ouvido-lucia');
 const second=[...first,{id:'ouvido-lucia',day:2}];
 assert.equal(candidate('bia',2,second,true),null);
 assert.equal(candidate('bia',3,second,true),'contado-bia');
 assert.equal(candidate('bia',4,[...second,{id:'contado-bia',day:3}],true),null);
});
test('save antigo ou adulterado não cria memórias nem repete o capítulo',()=>{
 assert.equal(restore(undefined,10).length,0);
 const invalid=[{id:'contado-bia',day:1},{id:'ouvido-damiao',day:2},{id:'ouvido-lucia',day:2},{id:'ouvido-lucia',day:3},{id:'contado-bia',day:4},{id:'contado-bia',day:5}];
 assert.deepEqual(Array.from(restore(invalid,10),r=>r.id),['ouvido-damiao','ouvido-lucia','contado-bia']);
 assert.deepEqual(Array.from(restore(invalid,10),r=>r.day),[2,3,4]);
});
test('história permanece no diário, álbum e reset sem recompensa duplicada',()=>{
 assert.match(source,/breadStories=restoreBreadStories\(saved\.breadStories,living\.day\)/);
 assert.match(source,/saoPedroTales,breadStories,morningEncounters,waterMemories,waterTalks,camucaStories\}\)/);
 assert.match(source,/breadStories=\[\];morningEncounters=\[\];waterMemories=\[\];waterTalks=\[\];seasonalMemories=\[\]/);
 assert.match(source,/breadStories\.some\(entry=>entry\.id==='contado-bia'\)/);
 assert.match(source,/const breadStory=rememberBreadStory\(id\)/);
});
