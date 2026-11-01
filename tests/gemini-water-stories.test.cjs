const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('gemini-modules/game.js','utf8');
const logic=source.slice(source.indexOf('function waterConversationCandidate('),source.indexOf('function nearestWaterView('));
const context=vm.createContext({Math,Number,Array,Object});
vm.runInContext(logic,context);
test('moradores só conhecem a água depois do jogador observar e contar',()=>{
 const candidate=context.waterConversationCandidate;
 assert.equal(candidate('bia',3,[],[]),null);
 assert.equal(candidate('bia',1,[{id:'way/1',day:1}],[]),null);
 assert.equal(candidate('bia',2,[{id:'way/1',day:1}],[]).step,'shared');
 const shared=[{id:'bia',step:'shared',day:2}];
 assert.equal(candidate('bia',3,[{id:'way/1',day:1}],shared),null);
 assert.equal(candidate('bia',5,[{id:'way/1',day:1}],shared).step,'remembered');
 assert.equal(candidate('bia',9,[{id:'way/1',day:1}],[...shared,{id:'bia',step:'remembered',day:5}]),null);
 assert.equal(candidate('ze',5,[{id:'way/1',day:1}],[]),null);
});
test('restauração rejeita relatos sem observação e lembranças inventadas',()=>{
 const records=[{id:'bia',step:'remembered',day:3},{id:'bia',step:'shared',day:2},{id:'bia',step:'shared',day:3},{id:'bia',step:'remembered',day:5},{id:'lucia',step:'shared',day:7}];
 assert.equal(context.restoreWaterTalks(records,10,[]).length,0);
 const restored=context.restoreWaterTalks(records,6,[{id:'way/1',day:1}]);
 assert.deepEqual(Array.from(restored,r=>r.step),['shared','remembered']);
 assert.deepEqual(Array.from(restored,r=>r.day),[2,5]);
});
test('diário separa observação e relato, com reset sem recompensas',()=>{
 assert.match(source,/waterTalks=restoreWaterTalks\(saved\.waterTalks,living\.day,waterMemories\)/);
 assert.match(source,/const waterTalk=rememberWaterConversation\(id\)/);
 assert.match(source,/waterMemories=\[\];waterTalks=\[\];seasonalMemories=\[\]/);
 assert.match(source,/Relatos da paisagem/);
 assert.match(source,/drawCordeiroCactus/);
 assert.match(source,/pedra_cordeiro/);
});
