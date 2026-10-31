
/* V2.23: fictional foot traffic spread across documented OSM street anchors.
   These are artistic routines, not measured pedestrian traffic. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorCrowdFlow=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const waves=new Map();

 // Fictional conversations inspired by the author's Belém/PB references.
 // One short line per tap, varied locally; no network, personal data or save.
 const WORDS={
  mercado:[
   'Bom dia! O movimento da feira anima a semana inteira.',
   'O cheiro de sorda quentinha me lembra as manhãs daqui.',
   'Hoje vim olhar as frutas e encontrar os conhecidos.',
   'A feira é boa até pra quem vem só trocar dois dedos de prosa.'
  ],
  sonho_doce:[
   'Passar aqui dá uma vontade de levar um docinho pra casa!',
   'Já pensou num café com pão doce numa tarde tranquila?',
   'Eu gosto de olhar a vitrine antes de escolher.'
  ],
  bar_prosa:[
   'Fim de tarde é hora de sentar e conversar um bocadinho.',
   'Cada mesa daqui parece guardar uma história.',
   'O melhor do bairro é encontrar alguém conhecido pelo caminho.'
  ],
  escola_anita:[
   'Cedinho essas ruas ficam cheias de passos e conversas.',
   'Olhe como a rua muda quando o dia vai chegando ao fim.',
   'Depois das cinco, uma cadeira na calçada já vira convite pra conversa.'
  ],
  xaviezao:[
   'Quando tem jogo, o ginásio fica cheio de torcida e alegria.',
   'Escute só: parece até que a bola vai quicar de novo!',
   'Por aqui sempre tem alguém contando a partida de ontem.'
  ],
  rodoviaria:[
   'Tem gente chegando e gente indo, cada qual com uma história.',
   'Toda viagem boa merece alguém esperando na volta.',
   'A rodoviária sempre lembra encontro e despedida.'
  ],
  igreja:[
   'Gosto do sossego que dá caminhar por aqui de manhã.',
   'Esses caminhos me fazem lembrar das festas da padroeira.',
   'Hoje o céu está tão bonito para uma caminhada!'
  ],
  sagrada_familia:[
   'As igrejas guardam tantas lembranças das famílias daqui.',
   'A cidade muda, mas certos encontros a gente nunca esquece.'
  ],
  capela_luz:[
   'Esse trecho mais quietinho é bom para caminhar sem pressa.',
   'Uma brisinha já muda o jeito da tarde, não acha?'
  ],
  parque_sao_luis:[
   'Os brinquedos artesanais daqui parecem feitos com carinho.',
   'Uma volta no parque e a gente volta a ser criança!',
   'A criatividade do povo também faz parte da paisagem.'
  ],
  hospital_santa_lucia:[
   'Tomara que todo mundo que passou por aqui volte bem pra casa.',
   'Cuidar dos vizinhos também faz uma cidade acolhedora.'
  ],
  prefeitura:[
   'O centro tem um movimento diferente a cada hora.',
   'Que bom encontrar alguém conhecido no meio da rua!'
  ],
  pedra_cordeiro:[
   'Lá para os caminhos de pedra, a paisagem muda de cor.',
   'A serra e o Agreste têm belezas bem diferentes, viu?'
  ]
 };
 const GENERIC=[
  'Bom dia, minha filha! Vai passear um bocadinho?',
  'Vou ali e já volto. Depois a gente põe a conversa em dia!',
  'Que alegria encontrar gente boa pela rua!',
  'Essas calçadas já ouviram tanta história bonita.',
  'Se der tempo, sente um pouquinho e aproveite a brisa.',
  'Quando a tarde cai, dá vontade de ficar só olhando o movimento.'
 ];
 const talks=new Map();
 function say(person,world){
  if(!person?.id?.startsWith('passeio-'))return '';
  const pool=WORDS[person.hub]||GENERIC;
  const next=(talks.get(person.id)||0)+1;talks.set(person.id,next);
  const index=(next-1+Math.max(0,Math.floor(Number(world?.day)||1)-1))%pool.length;
  return '“'+pool[index]+'”';
 }

 function greet(id,now){
  if(typeof id!=='string'||!id.startsWith('passeio-')||!Number.isFinite(now))return false;
  waves.set(id,now+3.8);return true;
 }
 function plan(world,isFair,now=NaN){
  if(Number.isFinite(now))for(const [id,until] of waves)if(until<=now)waves.delete(id);
  const hour=(Number(world?.minute)||0)/60,day=Math.max(1,Math.floor(Number(world?.day)||1));
  if(hour<6||hour>=22)return[];
  const busy=hour>=8&&hour<12||hour>=16&&hour<20;
  const number=isFair?16:busy?14:hour>=20?7:hour<8?6:11;
  // Rotate locations across the real, already verified Gemini POI anchors:
  // neighbourhoods, schools, shops and quieter outer streets. Fixed IDs and
  // anchor assignment within a day prevent flicker or mid-walk teleportation.
  const hubs=['escola_anita','bar_prosa','rodoviaria','capela_luz',
   'mercado','parque_sao_luis','hospital_santa_lucia','xaviezao',
   'sagrada_familia','sonho_doce','igreja','prefeitura',
   'pedra_cordeiro','missao:5','missao:2','missao:1'];
  const rotation=(day-1)%hubs.length;
  return Array.from({length:number},(_,i)=>{
   const id='passeio-'+(i+1),hub=hubs[(i+rotation)%hubs.length];
   // Small fictional routines without simulation ticks or persistent saves.
   const shop=['sonho_doce','bar_prosa','parque_sao_luis'].includes(hub);
   const role=hub==='mercado'?'feira':shop&&i%3===0?'vitrine':
    i%5===0?'senhora':i%4===0?'vizinho':'passeante';
   // Time-driven short routines: different villagers linger at different moments.
   // Seconds provide a gentle rhythm without persistent schedules or timers.
   const cycle=Number.isFinite(now)?now:Number(world?.minute)||0;
   const phase=((cycle*.62+i*13)%59+59)%59;
   const resting=phase<5&&(role==='senhora'||role==='vizinho'||role==='vitrine'||role==='feira');
   const neighborWave=(role==='vizinho'||role==='senhora')&&phase>=11&&phase<14;
   const waveStrength=neighborWave?Math.min(1,(phase-11)/.7,(14-phase)/.7):0;
   const wavedUntil=waves.get(id)||0;
   const waving=Number.isFinite(now)&&now<wavedUntil;
   const waveAge=waving?3.8-(wavedUntil-now):0;
   const activity=role==='senhora'?(hour<10?'passeio matinal tranquilo':'passeando sem pressa'):
    role==='feira'?(resting?'observando as bancas':hour<12?'indo à feira':'voltando da feira'):
    role==='vitrine'?'observando a vitrine':
    role==='vizinho'?(resting?'descansando na calçada':'cumprimentando conhecidos'):'caminhando pelo bairro';
   const kind=(role==='vitrine'||role==='feira')?'look':'rest';
   return {id,variant:i+1,hub,def:null,localRole:role,activity,
    pause:resting||waving||neighborWave,moment:resting?{kind,strength:Math.min(1,phase/.8,(5-phase)/.8)}:null,
    social:waving?{pose:'wave',facing:1,intensity:Math.max(0,Math.min(1,waveAge/.35,(3.8-waveAge)/.5)),react:true}:
     neighborWave?{pose:'wave',facing:i%2?1:-1,intensity:waveStrength}:null,
    greeting:waving?{age:waveAge}:null};
  });
 }
 // Prefer an uncrowded place along the SAME mapped itinerary. With no safe
 // slot, a purely decorative passer may be omitted for this frame.
 function openSlot(sample,people=[],junctions=[],clearance=23){
  // Try nearby points first, then a few farther points along the same
  // mapped walking path. Never draw a decorative walker on a busy corner.
  const offsets=[0,14,-14,29,-29,45,-45,61,-61,78,-78,94,-94];
  const cornerRadius=20;
  const separation=Math.max(23,Number.isFinite(clearance)?clearance:23);
  for(const offset of offsets){
   const p=sample(offset);
   if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
   if(people.some(other=>Number.isFinite(other?.x)&&Number.isFinite(other?.y)&&Math.hypot(p.x-other.x,p.y-other.y)<separation))continue;
   if(junctions.some(j=>Number.isFinite(j?.x)&&Number.isFinite(j?.y)&&Math.hypot(p.x-j.x,p.y-j.y)<cornerRadius))continue;
   return p;
  }
  // Omitting an ambient passer is preferable to a pile-up at a junction.
  return null;
 }
 return{plan,openSlot,greet,say};
});

