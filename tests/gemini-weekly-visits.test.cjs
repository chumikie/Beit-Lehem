'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const world=require('../gemini-modules/living-world.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function restoreWeeklyVisits('),end=source.indexOf('function closestNamedRoad(',start);
assert.ok(start>=0&&end>start);
const {restoreWeeklyVisits,weeklyVisitEntry}=new Function(source.slice(start,end)+';return {restoreWeeklyVisits,weeklyVisitEntry};')();

test('o registro exige visita efetiva, proximidade e ambos os moradores presentes',()=>{
 const scene=world.weeklyReunion({day:10,minute:17*60+15});
 const pair=[{id:'bia',x:0,y:0},{id:'lucia',x:34,y:0}];
 assert.deepEqual(weeklyVisitEntry(scene,pair,{x:15,y:8}),{id:'lucia-visita-bia',day:10});
 assert.equal(weeklyVisitEntry(scene,pair,{x:100,y:100}),null);
 assert.equal(weeklyVisitEntry({...scene,phase:'approach'},pair,{x:15,y:8}),null);
 assert.equal(weeklyVisitEntry(scene,[pair[0]],{x:15,y:8}),null);
 assert.equal(weeklyVisitEntry(scene,[pair[0],{...pair[1],arriving:true}],{x:15,y:8}),null);
 assert.equal(weeklyVisitEntry(scene,[pair[0],{...pair[1],x:95}],{x:15,y:8}),null);
});

test('save elimina visitas inventadas, futuras e duplicadas',()=>{
 const data=[{id:'lucia-visita-bia',day:10},{id:'lucia-visita-bia',day:10},
  {id:'bia-visita-lucia',day:18},{id:'lucia-visita-bia',day:11},
  {id:'inexistente',day:10},{id:'lucia-visita-bia',day:99}];
 assert.deepEqual(restoreWeeklyVisits(data,20,world),[
  {id:'lucia-visita-bia',day:10},{id:'bia-visita-lucia',day:18}
 ]);
 assert.deepEqual(restoreWeeklyVisits(null,20,world),[]);
});

test('lembrança de visita é separada dos relatos de encontros existentes',()=>{
 assert.match(source,/weeklyVisitsSeen\.unshift\(entry\)/);
 assert.match(source,/Você presenciou uma visita de Bia e Lúcia/);
 assert.match(source,/Você também estava lá quando nos encontramos/);
 assert.match(source,/weeklyVisitsSeen=restoreWeeklyVisits/);
});
