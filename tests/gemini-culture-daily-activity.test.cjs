const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const world=require('../gemini-modules/living-world.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const source=fs.readFileSync(path.join(__dirname,'../gemini-modules/game.js'),'utf8');
const fragment=source.slice(source.indexOf('function cultureDailyActivity('),source.indexOf('function syncMarketToggle('));
const cultureDailyActivity=new Function(fragment+';return cultureDailyActivity;')();
const clock=(day,minute)=>({...world.fresh(),day,minute});

test('Mercado, Matriz e Rodoviária reutilizam as atividades das agendas reais do jogo',()=>{
 const names={mercado:'Francisco',igreja:'Lúcia',rodoviaria:'Bia'};
 const time=clock(2,10*60);
 for(const [id,name] of Object.entries(names)){
  const text=cultureDailyActivity(id,time,world,neighbors);
  assert.ok(text.includes(name+' — '),id);
  assert.match(text,/Na agenda deste horário:/);
 }
});

test('tarde aproveita vizinhos secundários sem inventar novas atividades',()=>{
 const names={mercado:'Ciça',igreja:'Nara',rodoviaria:'Téo'};
 const time=clock(2,16*60);
 for(const [id,name] of Object.entries(names)){
  const text=cultureDailyActivity(id,time,world,neighbors);
  assert.ok(text.includes(name+' — '),id);
  assert.ok(text.includes(neighbors.agenda(time,neighbors.RESIDENTS.find(p=>p.name===name)).activity));
 }
});

test('não apresenta morador à noite, durante viagem ou em local diferente',()=>{
 for(const id of ['mercado','igreja','rodoviaria'])assert.equal(cultureDailyActivity(id,clock(2,21*60),world,neighbors),null);
 assert.equal(cultureDailyActivity('desconhecido',clock(2,10*60),world,neighbors),null);
 const occupied={RESIDENTS:world.RESIDENTS,agenda:()=>({present:true,hub:'mercado',activity:'em viagem',travel:true})};
 const absent={RESIDENTS:neighbors.RESIDENTS,agenda:()=>({present:false,activity:'descansando'})};
 assert.equal(cultureDailyActivity('mercado',clock(2,10*60),occupied,absent),null);
});

test('informação é passageira no cartão e não modifica mapa nem salvamento',()=>{
 const time=clock(4,10*60),before=structuredClone(time);
 cultureDailyActivity('mercado',time,world,neighbors);
 assert.deepEqual(time,before);
 assert.match(source,/const activity=reachable\?cultureDailyActivity\(id,living,window\.RoncadorLivingWorld,window\.RoncadorSecondaryNeighbors\):null/);
 assert.doesNotMatch(source,/cultureDailyActivity\([^)]*\);save\(\)/);
});
