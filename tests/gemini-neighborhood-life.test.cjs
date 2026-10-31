const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs'),path=require('node:path');
const {plan,greet}=require('../gemini-modules/crowd-flow.js');

test('hábitos variam por hora e preservam âncoras existentes',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../references/gemini-2026-10-31/experimento-anonimizado.html.txt'),'utf8');
 const open='<script type="application/json" id="embedded-map-data">';
 const begin=source.indexOf(open),end=source.indexOf('</script>',begin+open.length);
 assert.ok(begin>=0&&end>begin);
 const map=JSON.parse(source.slice(begin+open.length,end));
 const known=new Set([...map.landmarks.map(x=>x.id),...map.missions.map((_,i)=>'missao:'+i)]);
 for(const minute of [6*60,9*60,13*60,18*60,21*60]){
  const list=plan({day:1,minute},false);
  assert.ok(list.every(x=>known.has(x.hub)));
  assert.ok(list.every(x=>typeof x.activity==='string'&&typeof x.localRole==='string'));
  assert.ok(list.every(x=>x.localRole!=='vitrine'||['sonho_doce','bar_prosa','parque_sao_luis'].includes(x.hub)));
 }
});
test('pausa espontânea é determinística sem bloquear o restante do mapa',()=>{
 const world={day:1,minute:8*60+12};
 const first=plan(world,false,0),second=plan(world,false,0);
 assert.deepEqual(first,second);
 assert.ok(first.some(x=>x.pause&&x.moment));
});
test('toque produz aceno temporário e não altera o relógio nem o mundo',()=>{
 const world={day:1,minute:9*60},before=JSON.stringify(world);
 assert.equal(greet('nome-inválido',1),false);
 assert.equal(greet('passeio-1',1),true);
 const waving=plan(world,false,1.25)[0];
 assert.equal(waving.social.pose,'wave');
 assert.ok(waving.greeting.age>0&&waving.pause);
 assert.equal(plan(world,false,6)[0].social,null);
 assert.equal(JSON.stringify(world),before);
});
test('gancho de toque está localizado no jogo Gemini, não no arquivo do mapa',()=>{
 const game=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
 assert.ok(game.includes('RoncadorCrowdFlow.greet(visitor.id,elapsed)'));
 assert.ok(game.includes('ambientHitTargets=ambientPeople'));
 assert.ok(!game.includes('localStorage.setItem(STORE,JSON.stringify({v:4'));
});
