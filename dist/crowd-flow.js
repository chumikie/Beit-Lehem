/* V2.23: fictional foot traffic spread across documented OSM street anchors.
   These are artistic routines, not measured pedestrian traffic. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorCrowdFlow=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 function plan(world,isFair){
  const hour=(Number(world?.minute)||0)/60,day=Math.max(1,Math.floor(Number(world?.day)||1));
  if(hour<7||hour>=20)return[];
  const busy=hour<11||hour>=16,number=isFair?5:busy?4:3;
  // The centre retains a passer-by, but other neighbours visit the Matriz,
  // Rodoviária and different streets. Only existing mission/POI anchors used.
  const hubs=['mercado','igreja','rodoviaria','missao:'+((day-1)%3),isFair?'mercado':'inicio'];
  return hubs.slice(0,number).map((hub,i)=>({id:'passeio-'+(i+1),variant:i+1,hub,def:null}));
 }
 // Prefer an uncrowded place along the SAME mapped itinerary. With no safe
 // slot, a purely decorative passer may be omitted for this frame.
 function openSlot(sample,people=[],junctions=[],clearance=23){
  const offsets=[0,14,-14,29,-29,45,-45,61,-61];
  for(const offset of offsets){
   const p=sample(offset);
   if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
   if(people.some(other=>Math.hypot(p.x-other.x,p.y-other.y)<clearance))continue;
   if(junctions.some(j=>Math.hypot(p.x-j.x,p.y-j.y)<11))continue;
   return p;
  }
  // No safe sidewalk composition: omit the decorative passer this frame.
  return null;
 }
 return{plan,openSlot};
});
