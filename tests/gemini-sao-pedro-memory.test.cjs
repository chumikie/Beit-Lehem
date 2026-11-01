const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','gemini-modules/game.js'),'utf8');
const definitions=source.slice(source.indexOf('const SAO_PEDRO_TALES='),source.indexOf('let saoPedroTales=[];'));
const functions=source.slice(source.indexOf('function restoreSaoPedroTales('),source.indexOf('function everydayConversationCandidate('));
const {tales,restoreSaoPedroTales,recordSaoPedroConversation}=new Function(definitions+functions+';return {tales:SAO_PEDRO_TALES,restoreSaoPedroTales,recordSaoPedroConversation};')();

test('Damião relata a memória após a feira, mas não fabrica uma visita ao palco',()=>{
 assert.equal(recordSaoPedroConversation('damiao',4,[],false),null);
 assert.equal(recordSaoPedroConversation('damiao',4,[],true),'ouvido-damiao');
 assert.match(tales['ouvido-damiao'].text,/artistas da própria terra/);
 assert.equal(tales['ouvido-damiao'].source,'ouvido');
});

test('Bia só conhece o relato depois que o jogador o compartilha em outro dia',()=>{
 assert.equal(recordSaoPedroConversation('bia',7,[],true),null);
 const heard=[{id:'ouvido-damiao',day:6,source:'ouvido'}];
 assert.equal(recordSaoPedroConversation('bia',6,heard,true),null);
 assert.equal(recordSaoPedroConversation('bia',7,heard,true),'contado-bia');
 assert.equal(recordSaoPedroConversation('bia',7,[...heard,{id:'contado-bia',day:7}],true),null);
});

test('save antigo não presume conversas nem eventos presenciados',()=>{
 assert.deepEqual(restoreSaoPedroTales(undefined,9),[]);
 const heard={id:'ouvido-damiao',day:2,source:'ouvido'};
 assert.deepEqual(restoreSaoPedroTales([{id:'contado-bia',day:4},heard,{id:'contado-bia',day:5},{id:'inventado',day:1},{id:'ouvido-damiao',day:8}],9),[heard,{id:'contado-bia',day:5,source:'compartilhado'}]);
 assert.match(source,/saoPedroTales=restoreSaoPedroTales\(saved\.saoPedroTales,living\.day\)/);
});
