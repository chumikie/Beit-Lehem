'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function speakerWithinReach('),source.indexOf('function gpsFor('));
const reach=new Function('player',fragment+';return speakerWithinReach;');

test('os limites de conversa correspondem ao tipo de morador',()=>{
 const canTalk=reach({x:0,y:0});
 assert.equal(canTalk({x:42.5,y:0}),true,'Francisco/Lúcia/Bia dentro dos 43 m');
 assert.equal(canTalk({x:43,y:0}),false,'morador principal fora do limite');
 assert.equal(canTalk({x:43.5,y:0,secondary:true}),true,'Ciça/Nara dentro dos 44 m');
 assert.equal(canTalk({x:44,y:0,secondary:true}),false,'vizinho secundário fora do limite');
 assert.equal(canTalk(null),false);
});

test('aviso, tecla de interação e clique na figura aplicam o mesmo limite',()=>{
 assert.match(source,/return speakerWithinReach\(p\)&&\(!best\|\|d<best\.d\)/);
 assert.match(source,/function talkResident\(id\)[\s\S]*?if\(!speakerWithinReach\(person\)\)/);
 assert.match(source,/function talkSecondary\(id\)[\s\S]*?if\(!speakerWithinReach\(person\)\)/);
 assert.match(source,/if\(speakerWithinReach\(person\)\)\{if\(person\.secondary\)talkSecondary\(person\.id\);else talkResident\(person\.id\);\}/);
 assert.match(source,/else setRoute\(person\.x,person\.y,26\)/,'a aproximação distante continua pelas ruas existentes');
});
