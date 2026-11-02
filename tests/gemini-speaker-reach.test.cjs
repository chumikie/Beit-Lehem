'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {buildGraph}=require('../dist/pathfinding.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function speakerWithinReach('),source.indexOf('function gpsFor('));
const reach=new Function('player','pathfinder','blockedByHouse','nearestRoad',fragment+';return speakerWithinReach;');
const plain=player=>reach(player,null,()=>false,()=>({d:0}));

test('os limites de conversa correspondem ao tipo de morador',()=>{
 const canTalk=plain({x:0,y:0});
 assert.equal(canTalk({x:42.5,y:0}),true,'Francisco/Lúcia/Bia dentro dos 43 m');
 assert.equal(canTalk({x:43,y:0}),false,'morador principal fora do limite');
 assert.equal(canTalk({x:43.5,y:0,secondary:true}),true,'Ciça/Nara dentro dos 44 m');
 assert.equal(canTalk({x:44,y:0,secondary:true}),false,'vizinho secundário fora do limite');
 assert.equal(canTalk({x:53.5,y:0,ambient:true}),true,'passante com cumprimento curto dentro de 54 m');
 assert.equal(canTalk({x:54,y:0,ambient:true}),false,'passante fora do limite');
 assert.equal(canTalk(null),false);
});

test('ruas desconectadas impedem conversa mesmo a poucos metros',()=>{
 const graph=buildGraph([{p:[[0,0],[0,50]]},{p:[[30,0],[30,50]]}]);
 const canTalk=reach({x:0,y:25},graph,()=>false,()=>({d:0}));
 assert.equal(canTalk({x:30,y:25}),false);
 const connected=buildGraph([{p:[[0,0],[0,50],[30,50],[30,0]]}]);
 const aroundCorner=reach({x:0,y:25},connected,()=>false,()=>({d:0}));
 assert.equal(aroundCorner({x:30,y:25}),true,'uma esquina conectada continua válida dentro do alcance');
});

test('casa entre jogador e morador bloqueia conversa, sem bloquear a rua mapeada',()=>{
 const house=(x,y)=>x>12&&x<18&&Math.abs(y)<7;
 const from={x:0,y:0},person={x:30,y:0};
 assert.equal(reach(from,null,house,()=>({d:15}))(person),false);
 assert.equal(reach(from,null,house,()=>({d:0}))(person),true,'uma fachada ilustrativa sobre a rua não corta a conversa');
 assert.equal(plain(from)(person),true,'sem obstáculo o alcance original permanece');
});

test('aviso, tecla de interação e clique na figura aplicam o mesmo limite',()=>{
 assert.match(source,/return speakerWithinReach\(p\)&&\(!best\|\|d<best\.d\)/);
 assert.match(source,/function talkResident\(id\)[\s\S]*?if\(!speakerWithinReach\(person\)\)/);
 assert.match(source,/function talkSecondary\(id\)[\s\S]*?if\(!speakerWithinReach\(person\)\)/);
 assert.match(source,/if\(speakerWithinReach\(person\)\)\{if\(person\.secondary\)talkSecondary\(person\.id\);else talkResident\(person\.id\);\}/);
 assert.match(source,/else setRoute\(person\.x,person\.y,26\)/,'a aproximação distante continua pelas ruas existentes');
});
