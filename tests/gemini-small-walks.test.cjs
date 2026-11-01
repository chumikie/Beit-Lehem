'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const world=require('../gemini-modules/living-world.js');
const map=require('../dist/map.json');
const graph=require('../dist/pathfinding.js').buildGraph(map.roads);
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const clock=(day,minute)=>({day,minute,people:world.fresh().people,notes:[]});
const starts=[9,18,27];

test('uma visita breve a cada semana usa hubs documentados e mantém a primeira semana',()=>{
 for(let day=1;day<=7;day++)assert.equal(world.smallWalkForDay(day),null);
 for(const [index,day] of starts.entries()){
  const event=world.smallWalkForDay(day);assert.ok(event);
  const from=map.landmarks.find(p=>p.id===event.from),to=map.landmarks.find(p=>p.id===event.to);
  assert.ok(from&&to,'somente marcos já existentes');
  const a=graph.nearest(from.p),b=graph.nearest(to.p);
  assert.ok(a.distance<65&&b.distance<65&&a.component===b.component);
  const route=graph.route([graph.nodes[a.id].x,graph.nodes[a.id].y],[graph.nodes[b.id].x,graph.nodes[b.id].y],{maxSnapMetres:0});
  assert.ok(route&&route.distance<1800&&route.points.length>1&&!route.usedSharedComponentFallback);
  assert.deepEqual(['bia-jardim','damiao-caderno','lucia-feira'][index],event.id);
  assert.equal(world.smallWalkOccurred(day)?.id,event.id);
 }
});

test('aproximação, conversa e despedida são fases contínuas e não bloqueiam outros horários',()=>{
 for(const day of starts){
  const e=world.smallWalkForDay(day);
  assert.equal(world.smallWalkAt(clock(day,e.start-1)),null);
  assert.equal(world.smallWalkAt(clock(day,e.start)).phase,'approach');
  assert.equal(world.smallWalkAt(clock(day,e.start+14)).phase,'visit');
  assert.equal(world.smallWalkAt(clock(day,e.start+33)).phase,'return');
  assert.equal(world.smallWalkAt(clock(day,e.start+48)),null);
  assert.equal(world.agenda(clock(day,e.start+20),e.visitor).hub,e.to);
  assert.equal(world.agenda(clock(day,e.start+20),e.host).meeting,true);
  assert.equal(world.agenda(clock(day,e.start-1),e.visitor).smallWalk,undefined);
 }
 const original=world.fresh();original.day=18;original.minute=990;
 assert.deepEqual(world.agenda(world.restore(JSON.parse(JSON.stringify(original))),'damiao'),world.agenda(original,'damiao'));
});

function extract(name){
 const start=source.indexOf('function '+name+'(');assert.ok(start>=0);
 const open=source.indexOf('{',start);let depth=0,end=open;
 for(;end<source.length;end++){if(source[end]==='{')depth++;else if(source[end]==='}'&&!--depth)break;}
 return source.slice(start,end+1);
}
const ctx=vm.createContext({window:{RoncadorLivingWorld:world}});
vm.runInContext(extract('restoreSmallWalkRecords'),ctx);
const restore=(items,day,source)=>JSON.parse(JSON.stringify(vm.runInContext('restoreSmallWalkRecords(records,day,kind)',Object.assign(ctx,{records:items,day,kind:source}))));

test('salvamento não inventa passeios presenciados ou relatos fora de ordem',()=>{
 assert.deepEqual(restore([{id:'bia-jardim',day:9,source:'presenciado'},{id:'bia-jardim',day:9,source:'presenciado'},{id:'bia-jardim',day:18,source:'presenciado'},{id:'inexistente',day:9,source:'presenciado'}],25,'presenciado'),[{id:'bia-jardim',day:9,source:'presenciado'}]);
 assert.deepEqual(restore([{id:'damiao-caderno',day:18,heardDay:19,from:'bia',source:'ouvido'},{id:'damiao-caderno',day:18,heardDay:18,from:'damiao',source:'ouvido'},{id:'damiao-caderno',day:18,heardDay:19,from:'lucia',source:'ouvido'}],20,'ouvido'),[{id:'damiao-caderno',day:18,heardDay:19,from:'bia',source:'ouvido'}]);
 assert.deepEqual(restore(null,20,'ouvido'),[]);
});
test('um evento prioritário cancela o passeio sem gerar relato posterior falso',()=>{
 const prior=global.window;
 try{
  global.window={RoncadorStreetCommunity:{agenda:(s,id)=>s.day===9&&id==='bia'?{present:true,hub:'mercado',activity:'evento comunitário'}:null}};
  assert.equal(world.smallWalkOccurred(9),null);
 }finally{if(prior===undefined)delete global.window;else global.window=prior;}
});

test('diário distingue presenciado e ouvido, sem prêmio e com reset persistente',()=>{
 assert.match(source,/smallWalksSeen=restoreSmallWalkRecords\(saved\.smallWalksSeen,living\.day,'presenciado'\)/);
 assert.match(source,/smallWalkReports=restoreSmallWalkRecords\(saved\.smallWalkReports,living\.day,'ouvido'\)/);
 assert.match(source,/smallWalksSeen=\[\];smallWalkReports=\[\]/);
 assert.match(source,/Presenciou:.*smallWalkForDay/);
 assert.match(source,/Ouviu de .*smallWalkForDay/);
 assert.doesNotMatch(extract('observeSmallWalk')+extract('rememberSmallWalk'),/reward|coins|friendship\+\+|setRoute\(/);
});
