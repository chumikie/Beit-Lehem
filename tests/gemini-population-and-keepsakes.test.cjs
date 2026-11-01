'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=global.RoncadorSecondaryNeighbors;
const affection=require('../gemini-modules/affection-memory.js');
const moments=require('../gemini-modules/street-moments.js');

test('nove moradores nomeados, sem perder o álbum dos três vizinhos originais',()=>{
 const ids=neighbors.RESIDENTS.map(x=>x.id);
 assert.equal(ids.length,6);
 assert.equal(new Set(ids).size,6);
 assert.deepEqual(['cica','nara','teo'].map(x=>ids.includes(x)),[true,true,true]);
 const old=neighbors.restore({seen:['cica','nara','teo'],choices:{cica:'fitas',nara:'desenho',teo:'recado'}});
 assert.equal(neighbors.coreProgress(old),3);
 assert.deepEqual(old.seen.slice().sort(),['cica','nara','teo'].sort());
});

test('Rosa, Zeca e Mila têm rotinas, gestos e escolhas que não duplicam cuidados',()=>{
 const clock={day:1,minute:9*60},state=neighbors.fresh();
 for(const id of ['rosa','zeca','mila']){
  const person=neighbors.RESIDENTS.find(x=>x.id===id);
  assert.ok(person,'morador existente: '+id);
  assert.ok(neighbors.agenda(clock,person).present,'presença de manhã: '+id);
  assert.equal(neighbors.agenda({day:1,minute:23*60},person).present,false,'descanso noturno: '+id);
  assert.ok(person.options.length>=2,'escolhas: '+id);
  assert.ok(moments.GESTURES[id],'gesto próprio: '+id);
  assert.equal(neighbors.interact(state,clock,id,person.options[0].id).ok,true);
  assert.equal(neighbors.interact(state,clock,id,person.options[1].id).ok,false,'sem exploração de pontos diários');
 }
 const recovered=neighbors.restore(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(recovered.choices,state.choices);
 for(const id of ['rosa','zeca','mila'])
  assert.equal(affection.snapshot({sideNeighbors:recovered,living:clock},id).remembered,true);
});

test('histórias de Lúcia, Ciça e Nara desbloqueiam gentilezas conectadas',()=>{
 const zeca=neighbors.RESIDENTS.find(x=>x.id==='zeca');
 const mila=neighbors.RESIDENTS.find(x=>x.id==='mila');
 assert.equal(neighbors.availableOptions(zeca,{}).some(x=>x.id==='muda-lucia'),false);
 assert.equal(neighbors.availableOptions(zeca,{luciaGarden:{claimed:true}}).some(x=>x.id==='muda-lucia'),true);
 assert.equal(neighbors.availableOptions(mila,{}).some(x=>x.id==='amigas'),false);
 const known={choices:{cica:'fitas',nara:'desenho'}};
 assert.equal(neighbors.availableOptions(mila,{sideNeighbors:known}).some(x=>x.id==='amigas'),true);
 const state=neighbors.fresh();
 assert.equal(neighbors.interact(state,{day:1,minute:9*60},'zeca','muda-lucia',{luciaGarden:{claimed:true}}).ok,true);
 assert.equal(neighbors.interact(state,{day:1,minute:9*60},'mila','amigas',{sideNeighbors:known}).ok,true);
 const cards=affection.collection({luciaGarden:{claimed:true},sideNeighbors:state}).map(x=>x.id);
 assert.ok(cards.includes('zeca-lucia'));
 assert.ok(cards.includes('mila-cores'));
 assert.equal(new Set(cards).size,cards.length);
});

test('rotinas ficcionais de Rosa, Zeca e Mila variam por dia sem mudar os pontos de encontro',()=>{
 for(const id of ['rosa','zeca','mila']){
  const person=neighbors.RESIDENTS.find(p=>p.id===id);
  const days=[1,2,3].map(day=>neighbors.agenda({day,minute:9*60},person));
  assert.equal(new Set(days.map(x=>x.activity)).size,3,id+' deve ter três gestos matinais distintos');
  assert.ok(days.every(x=>x.present&&x.hub===person.hub));
  assert.equal(neighbors.agenda({day:2,minute:23*60},person).present,false);
 }
});
test('memórias comunitárias reconhecem atividades de outros moradores e laço da banca',()=>{
 const ribbon={marketMorning:{claimed:true},sideNeighbors:{choices:{cica:'banca'}}};
 const damiao=affection.snapshot(ribbon,'damiao');
 assert.equal(damiao.remembered,true);
 assert.match(JSON.stringify(damiao),/Ciça|laço/i);
 for(const [id,progress] of [
  ['rosa',{marketMorning:{claimed:true}}],
  ['zeca',{luciaGarden:{claimed:true}}],
  ['mila',{sideNeighbors:{choices:{cica:'banca'}}}]
 ]){
  const note=affection.snapshot(progress,id);
  assert.equal(note.remembered,true,id);
 }
});

test('laço de Ciça só é desenhado após a escolha salva e a manhã concluída',()=>{
 const fs=require('node:fs');
 const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 assert.match(game,/marketMorning\.claimed&&sideNeighbors\.choices\?\.cica==='banca'/);
 assert.match(game,/stalls\.includes\(marketStall\)/);
 assert.match(game,/ctx\.translate\(rx,ry-17\)/);
});
test('Rosa, Zeca e Mila têm acessórios relacionados às atividades em tela',()=>{
 const fs=require('node:fs');
 const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 for(const id of ['rosa','zeca','mila'])assert.ok(game.includes("person.id==='"+id+"'"));
 assert.match(game,/const daily=\(person\.activity\|\|''\)/);
 assert.match(game,/const gesture=reduce\?0:/);
});
test('sete dias de rotina preservam descanso noturno e encontros definidos',()=>{
 for(let day=1;day<=7;day++){
  for(const id of ['rosa','zeca','mila']){
   const def=neighbors.RESIDENTS.find(x=>x.id===id);
   const morning=neighbors.agenda({day,minute:9*60},def);
   const evening=neighbors.agenda({day,minute:16*60},def);
   assert.ok(morning.present&&evening.present,id+' dia '+day);
   assert.equal(morning.hub,def.hub);
   assert.equal(evening.hub,def.hub);
   assert.equal(neighbors.agenda({day,minute:23*60},def).present,false);
  }
 }
});

test('personagens secundários reservam espaço uns para os outros na rua',()=>{
 const fs=require('node:fs');
 const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 assert.match(game,/const occupied=primary\.concat\(placed\)/);
 assert.match(game,/const offsets=\[63,90,117,145\]/);
 assert.match(game,/if\(!duty\.meeting&&occupied\.some\(/);
});

test('três vizinhos que chegam à mesma calçada recebem espaço separado na própria rota',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 const start=source.indexOf('function secondaryInStreets(');
 const end=source.indexOf('\nfunction drawSocialGesture',start);
 assert.ok(start>=0&&end>start,'função de distribuição encontrada');
 const definitions=['rosa','zeca','mila'].map((id,i)=>({id,hub:'mercado',variant:10+i}));
 const context={
  living:{day:1},elapsed:0,
  window:{
   RoncadorSecondaryNeighbors:{RESIDENTS:definitions,agenda:()=>({present:true,hub:'mercado',walking:false})},
   RoncadorStreetLife:{sample:(_path,offset)=>({x:offset/2,y:0,walking:false})},
   RoncadorStreetMoments:{choose:()=>null}
  },
  communityMeetingPoint:()=>null,encounterRoadPoint:()=>null,
  walkingPoint:()=>({x:0,y:0,walking:false}),
  streetPaths:new Map([['zeca:mercado',[1]],['mila:mercado',[1]]]),
  residentMotion:{resolve:person=>person}
 };
 const distribute=vm.runInNewContext('('+source.slice(start,end)+')',context);
 const residents=distribute([]);
 assert.equal(residents.length,3);
 for(let i=0;i<residents.length;i++)for(let j=i+1;j<residents.length;j++)
  assert.ok(Math.hypot(residents[i].x-residents[j].x,residents[i].y-residents[j].y)>23,
   residents[i].id+' e '+residents[j].id+' separados');
});

test('balão comunitário mantém tamanho contido nas ruas e no celular',()=>{
 const fs=require('node:fs');
 const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 assert.match(game,/const width=phone\?108:124,height=27\+rows\.length\*9,top=cy-87\+bounce/);
 assert.match(game,/const phone=matchMedia\('\(max-width:800px\)'\)\.matches,rows=wrapEncounterSpeech\(speech,phone\?20:26\)/);
});

test('nomes priorizam proximidade sem cobrir rostos no desktop e no celular',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 const start=source.indexOf('function layoutResidentNameplates(');
 const end=source.indexOf('function drawDistantResident(',start);
 assert.ok(start>=0&&end>start,'seleção de nomes encontrada');
 const layout=vm.runInNewContext(source.slice(start,end)+';layoutResidentNameplates');
 const people=[
  {id:'rosa',def:{name:'Rosa'},x:10,y:0},
  {id:'mila',def:{name:'Mila'},x:55,y:40},
  {id:'zeca',def:{name:'Zeca'},x:85,y:-45},
  {id:'cica',def:{name:'Ciça'},x:120,y:0},
  {id:'nara',def:{name:'Nara'},x:140,y:0},
  {id:'bia',def:{name:'Bia'},x:10,y:50,meeting:true}
 ];
 for(const [phone,expected] of [[false,3],[true,2]]){
  const names=layout(people,{x:0,y:0},1.85,phone);
  assert.ok(names.length>0&&names.length<=expected);
  assert.equal(names.some(n=>n.id==='nara'),false,'distância evita nomes excessivos');
  assert.equal(names.some(n=>n.id==='bia'),false,'encontros priorizam a conversa');
  for(const label of names)for(const person of people.filter(p=>p.id!==label.id)){
   const faceCovered=label.x-label.width/2<person.x+12&&label.x+label.width/2>person.x-12&&label.y-7<person.y-6&&label.y+7>person.y-34;
   assert.equal(faceCovered,false,'o nome não pode cobrir outro rosto');
  }
 }
});
test('balões completos exigem zoom e proximidade sem remover as cenas',()=>{
 const fs=require('node:fs');
 const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 assert.equal(source.split('if(zoom<1.6||Math.hypot(player.x-cx,player.y-cy)>76)').length-1,2);
 assert.ok(source.includes('RoncadorEncounterChoreography.draw'));
});

test('Mercado limita nomes e legendas de pontos sem apagar moradores ou POIs',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
 const start=source.indexOf('function layoutResidentNameplates(');
 const end=source.indexOf('function drawDistantResident(',start);
 const layout=vm.runInNewContext(source.slice(start,end)+';layoutResidentNameplates',{
  data:{landmarks:[{id:'mercado',p:[0,0]}]}
 });
 const people=[
  {id:'a',def:{name:'Ana'},x:8,y:0},
  {id:'b',def:{name:'Bia'},x:60,y:0},
  {id:'c',def:{name:'Ciça'},x:92,y:0}
 ];
 assert.ok(layout(people,{x:0,y:0},1.85,false).length<=1);
 assert.equal(layout(people,{x:0,y:0},1.4,false).length,0);
 assert.ok(source.includes('const mayLabel=zoom>(busyMarket?1.9:1.45)'));
 assert.ok(source.includes('RoncadorLandmarks?.drawMarkers'));
});
