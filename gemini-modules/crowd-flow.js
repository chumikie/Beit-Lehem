
/* V2.23: fictional foot traffic spread across documented OSM street anchors.
   These are artistic routines, not measured pedestrian traffic. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorCrowdFlow=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 function plan(world,isFair){
  const hour=(Number(world?.minute)||0)/60,day=Math.max(1,Math.floor(Number(world?.day)||1));
  if(hour<7||hour>=20)return[];
  const busy=hour<11||hour>=16,number=isFair?9:busy?8:7;
  // The centre retains a passer-by, but other neighbours visit the Matriz,
  // Rodoviária and different streets. Only existing mission/POI anchors used.
  const hubs=['casa_varanda','escola_anita','xaviezao','bar_prosa','mercado','igreja','rodoviaria','missao:'+((day-1)%3),isFair?'mercado':'sonho_doce'];
  return hubs.slice(0,number).map((hub,i)=>({id:'passeio-'+(i+1),variant:i+1,hub,def:null}));
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
 return{plan,openSlot};
});

