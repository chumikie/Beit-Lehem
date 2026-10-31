/* V2.22 — a tiny, deterministic theatre for existing fictional street visits.
   No new GPS points, encounters, save fields or character teleportation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorEncounterChoreography=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const STAGES=['hello','listen','offer','exchange','delight','farewell'];
 const CUTS=[0,.16,.34,.52,.68,.86,1];
 const clamp=v=>Math.max(0,Math.min(1,v));
 const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
 function timeline(clock,event){
  if(!event||event.phase!=='visit'||!Number.isFinite(clock?.minute)||!Number.isFinite(event.visit)||event.visit<=0)return null;
  const progress=clamp((clock.minute-event.start-event.approach)/event.visit);
  const index=STAGES.findIndex((_,i)=>progress<CUTS[i+1]);
  const stage=STAGES[index<0?STAGES.length-1:index];
  const exchange=clamp((progress-.48)/.23);
  // The last beat has a look, an actual wave, and a gentle turn away.
  const farewellBeat=clamp((progress-.86)/.14);
  const farewellPose=farewellBeat<.27?'look':farewellBeat<.79?'wave':'turn';
  const farewellStrength=stage==='farewell'?smooth(Math.min(1,(farewellBeat-.27)/.19,(.9-farewellBeat)/.12)):1;
  return{progress,stage,exchange:smooth(exchange),farewellBeat, farewellPose,
   farewellStrength:Math.max(0,farewellStrength),envelope:stage==='exchange'||stage==='delight',emphasis:stage==='hello'||stage==='offer'||stage==='delight'};
 }
 function current(clock){
  // The community scene takes precedence when two fictional itineraries overlap.
  const community=typeof window!=='undefined'?window.RoncadorStreetCommunity?.current(clock):null;
  const street=typeof window!=='undefined'?window.RoncadorStreetEncounters?.current(clock):null;
  return[community,street].find(e=>e?.phase==='visit')||null;
 }
 function apply(people,clock,event){
  const state=timeline(clock,event);if(!state)return null;
  const participants=event.cast||[event.host,event.visitor];
  const attendees=participants.map(id=>people.find(p=>p.id===id));
  if(attendees.some(p=>!p))return null;
  const [host,visitor]=attendees;
  for(const [i,person] of attendees.entries()){
   const partner=i===0?visitor:host;
   const facing=partner.x>=person.x?1:-1;
   const isGiver=i!==0;
   const pose=state.stage==='farewell'?(state.farewellPose==='wave'?'wave':'smile'):state.stage==='hello'?'wave':state.stage==='offer'||state.stage==='exchange'?(isGiver?'offer':'receive'):state.stage==='delight'?'smile':'listen';
   const turn=state.stage==='farewell'&&state.farewellPose==='turn';
   person.social={pose,facing:turn&&Number.isFinite(person.heading)?Math.cos(person.heading)>=0?1:-1:facing,
    intensity:state.stage==='farewell'?state.farewellStrength:1,stage:state.stage,
    emphasis:state.emphasis,react:state.stage==='delight'};
   if(state.stage==='hello'||state.stage==='farewell')person.walking=false;
  }
  return state;
 }
 function token(event){
  if(event.gesture==='ribbons')return'🎀';
  if(event.gesture==='sketch')return'✏️';
  if(event.gesture==='leaf')return'🌿';
  if(event.gesture==='letter')return'✉️';
  return event.icon||'♡';
 }
 function tokenPoint(state,host,visitor){
  if(!state)return null;
  const p=state.exchange;
  const from={x:visitor.x+(host.x>=visitor.x?10:-10),y:visitor.y-17};
  const to={x:host.x+(visitor.x>=host.x?10:-10),y:host.y-17};
  const x=from.x+(to.x-from.x)*p,y=from.y+(to.y-from.y)*p-5*Math.sin(Math.PI*p);
  return{x,y,progress:p};
 }
 function draw(c,time,event,people,clock,reduce){
  const state=timeline(clock,event);if(!state)return;
  const host=people.find(p=>p.id===event.host),visitor=people.find(p=>p.id===event.visitor);
  if(!host||!visitor)return;
  const p=tokenPoint(state,host,visitor);
  const show=state.progress>=.32&&state.progress<.87;
  if(!show)return;
  c.save();c.translate(p.x,p.y+(reduce?0:Math.sin(time*4)*.7));
  c.fillStyle='#364c3730';c.beginPath();c.ellipse(0,15,5.5,1.4,0,0,7);c.fill();
  c.fillStyle='#fff8e8';c.strokeStyle='#d4b79a';c.lineWidth=.7;c.beginPath();c.roundRect(-8.4,-9,16.8,15.4,3);c.fill();c.stroke();
  c.textAlign='center';c.textBaseline='middle';c.font='10px system-ui';c.fillText(token(event),0,-1.5);
  if(state.stage==='exchange'||state.stage==='delight'){
   c.fillStyle='#e4ad91';for(let i=0;i<2;i++){const angle=(i-.5)*1.7+(reduce?0:Math.sin(time*2+i)*.13);c.beginPath();c.arc(Math.cos(angle)*12,Math.sin(angle)*10-2,1.2,0,7);c.fill();}
  }
  c.restore();
 }
 return{STAGES,timeline,current,apply,token,tokenPoint,draw};
});
