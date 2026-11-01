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

test('fechar e reabrir após mudança de turno consulta a agenda atual sem criar um encontro',()=>{
 for(const id of ['mercado','igreja','rodoviaria']){
  const morning=clock(2,10*60),afternoon=clock(2,16*60),nextDay=clock(3,10*60);
  const states=[morning,afternoon,nextDay].map(s=>structuredClone(s));
  const first=cultureDailyActivity(id,morning,world,neighbors);
  const later=cultureDailyActivity(id,afternoon,world,neighbors);
  const tomorrow=cultureDailyActivity(id,nextDay,world,neighbors);
  assert.equal(cultureDailyActivity(id,morning,world,neighbors),first,id+' mantém a mesma leitura sem avançar tempo');
  assert.notEqual(later,first,id+' troca a atividade entre manhã e tarde');
  assert.equal(cultureDailyActivity(id,nextDay,world,neighbors),tomorrow,id+' reconsulta o novo dia');
  assert.deepEqual([morning,afternoon,nextDay],states,id+' não altera o relógio nem as memórias');
 }
 assert.match(source,/if\(active&&!dialog&&!document\.hidden\)\{/);
});
