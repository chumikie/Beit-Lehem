
/* V2.23: fictional foot traffic spread across documented OSM street anchors.
   These are artistic routines, not measured pedestrian traffic. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorCrowdFlow=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const waves=new Map();
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
   const phase=((Number(world?.minute)||0)+i*11)%43;
   const resting=phase<3&&(role==='senhora'||role==='vizinho'||role==='vitrine');
   const wavedUntil=waves.get(id)||0;
   const waving=Number.isFinite(now)&&now<wavedUntil;
   const waveAge=waving?3.8-(wavedUntil-now):0;
   const activity=role==='senhora'?(hour<10?'passeio matinal tranquilo':'passeando sem pressa'):
    role==='feira'?(hour<12?'indo à feira':'voltando do passeio'):
    role==='vitrine'?'olhando as vitrines':
    role==='vizinho'?'descansando um instante':'caminhando pelo bairro';
   const kind=role==='vitrine'?'read':role==='senhora'?'flower':'rest';
   return {id,variant:i+1,hub,def:null,localRole:role,activity,
    pause:resting||waving,moment:resting?{kind,strength:1}:null,
    social:waving?{pose:'wave',facing:1,intensity:Math.max(0,Math.min(1,waveAge/.35,(3.8-waveAge)/.5)),react:true}:null,
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
 return{plan,openSlot,greet};
});

