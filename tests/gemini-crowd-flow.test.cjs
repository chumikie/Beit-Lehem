const assert=require('node:assert/strict');
const test=require('node:test');
const {openSlot}=require('../gemini-modules/crowd-flow.js');

test('o pedestre usa a rota normal longe de cruzamentos',()=>{
 assert.deepEqual(openSlot(offset=>({x:offset,y:0}),[],[]),{x:0,y:0});
});
test('não para no miolo da esquina e procura trecho da mesma rota',()=>{
 const point=openSlot(offset=>({x:offset,y:0}),[],[{x:0,y:0}]);
 assert.deepEqual(point,{x:29,y:0});
});
test('mantém distância dos outros moradores',()=>{
 const point=openSlot(offset=>({x:offset,y:0}),[{x:29,y:0}],[{x:0,y:0}]);
 assert.deepEqual(point,{x:-29,y:0});
});
test('omite o figurante quando só existem pontos inseguros',()=>{
 assert.equal(openSlot(()=>({x:0,y:0}),[],[{x:0,y:0}]),null);
});
test('ignora amostras inválidas sem afetar os demais moradores',()=>{
 assert.deepEqual(openSlot(offset=>offset===0?{x:NaN,y:0}:{x:offset,y:0},[],[]),{x:14,y:0});
});

test('distribui mais gente por horários e por marcos existentes do mapa',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const raw=fs.readFileSync(path.join(__dirname,'../references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
 const match=/<script type="application\\/json" id="embedded-map-data">([\\s\\S]*?)<\\/script>/.exec(raw);
 assert.ok(match,'mapa original disponível');
 const map=JSON.parse(match[1]);
 const valid=new Set([...map.landmarks.map(p=>p.id),...map.missions.map((_,i)=>'missao:'+i)]);
 const {plan}=require('../gemini-modules/crowd-flow.js');
 for(const hour of [6,9,13,18,21]){
  const walkers=plan({day:1,minute:hour*60},false);
  assert.ok(walkers.length>=6&&walkers.length<=16);
  assert.equal(new Set(walkers.map(p=>p.hub)).size,walkers.length);
  assert.ok(walkers.every(p=>valid.has(p.hub)),'somente pontos reais do Gemini');
 }
 assert.equal(plan({day:1,minute:9*60},true).length,16);
 assert.deepEqual(plan({day:1,minute:23*60},false),[]);
 assert.notDeepEqual(plan({day:1,minute:9*60},false).map(p=>p.hub),plan({day:2,minute:9*60},false).map(p=>p.hub));
});
