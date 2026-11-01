'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function friendshipTraditionFor('),end=source.indexOf('function closestNamedRoad(',start);
assert.ok(start>=0&&end>start);
const {friendshipTraditionFor,restoreFriendshipTraditions}=new Function(source.slice(start,end)+';return {friendshipTraditionFor,restoreFriendshipTraditions};')();
const base={day:16,sideNeighbors:{marketLegacy:{kind:'fita',day:1},recados:{stage:3},lastHelp:{teo:7},connections:{zecaLucia:true,zecaLuciaDay:5}},marketMorning:{claimed:true},luciaGarden:{claimed:true},growthStage:3,weeklyVisitsSeen:[{id:'lucia-visita-bia',day:10}],fairMorning:true};

test('Ciça e Damião retomam apenas a escolha realmente feita na feira e depois de uma semana',()=>{
 assert.equal(friendshipTraditionFor('damiao',{...base,day:7}),null);
 assert.match(friendshipTraditionFor('damiao',base).text,/fita preparada com Ciça/);
 assert.match(friendshipTraditionFor('cica',base).text,/fita preparada com Ciça/);
 assert.equal(friendshipTraditionFor('cica',{...base,fairMorning:false}),null);
 assert.equal(friendshipTraditionFor('damiao',{...base,sideNeighbors:{...base.sideNeighbors,marketLegacy:{kind:null,day:0}}}),null);
});

test('Bia e Lúcia só retomam visitas presenciadas após passagem de dias',()=>{
 assert.equal(friendshipTraditionFor('bia',{...base,day:16}),null);
 assert.match(friendshipTraditionFor('bia',{...base,day:17}).text,/visita que vocês compartilharam/);
 assert.match(friendshipTraditionFor('lucia',{...base,day:17}).text,/visita que vocês compartilharam/);
 assert.equal(friendshipTraditionFor('lucia',{...base,day:17,weeklyVisitsSeen:[]}),null);
});

test('Zeca depende da flor real e Téo depende do recado concluído',()=>{
 assert.match(friendshipTraditionFor('zeca',base).text,/floresceu/);
 assert.equal(friendshipTraditionFor('zeca',{...base,growthStage:2}),null);
 assert.equal(friendshipTraditionFor('zeca',{...base,sideNeighbors:{...base.sideNeighbors,connections:{zecaLucia:false}}}),null);
 assert.match(friendshipTraditionFor('teo',base).text,/bilhetes/);
 assert.equal(friendshipTraditionFor('teo',{...base,sideNeighbors:{...base.sideNeighbors,recados:{stage:2}}}),null);
});

test('restauração mantém apenas tradições comprovadas e registradas uma vez',()=>{
 const context={living:{day:18},sideNeighbors:base.sideNeighbors,marketMorning:base.marketMorning,luciaGarden:base.luciaGarden,weeklyVisitsSeen:base.weeklyVisitsSeen,growthAt:()=>3};
 assert.deepEqual(restoreFriendshipTraditions([
  {key:'damiao:feira-fita',day:8},{key:'damiao:feira-fita',day:8},
  {key:'bia:visita',day:17},{key:'zeca:flor',day:16},
  {key:'teo:recados',day:12},{key:'teo:recados',day:99},{key:'inventado',day:9}
 ],context),[{key:'damiao:feira-fita',day:8},{key:'bia:visita',day:17},{key:'zeca:flor',day:16},{key:'teo:recados',day:12}]);
 assert.deepEqual(restoreFriendshipTraditions(null,context),[]);
 assert.deepEqual(restoreFriendshipTraditions([{key:'bia:visita',day:17}],{...context,weeklyVisitsSeen:[]}),[]);
});
