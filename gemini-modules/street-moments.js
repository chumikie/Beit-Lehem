
/* V2.24 — tiny, fictional gestures while people wander mapped streets.
   These pauses imply neither surveyed benches nor exact shopfront locations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorStreetMoments=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const GESTURES={
  damiao:{kind:'rest',offset:0},lucia:{kind:'flower',offset:9},
  bia:{kind:'read',offset:17},cica:{kind:'ribbon',offset:5},
  nara:{kind:'sketch',offset:13},teo:{kind:'letter',offset:21}
 };
 const CYCLE=33,DURATION=3.4;
 let porches=[];
 function setHouses(houses){
  porches=Array.isArray(houses)?houses.filter(h=>h&&['matriz','joao','clovis'].includes(h.centralBlock)&&h.w>=18&&h.seed%7===2&&Number.isFinite(h.x)&&Number.isFinite(h.y)).map(h=>({x:h.x,y:h.y})):[];
  return porches.length;
 }
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function choose(person,elapsed,world){
  const config=GESTURES[person?.id];
  if(!config||person.meeting||person.travel||person.arriving||!Number.isFinite(elapsed)||!world||world.minute<7*60||world.minute>=20*60)return null;
  // An occasional fictional doorstep gesture at the cooler end of the day.
  // It changes only the resident's pose on an existing mapped path.
  const nearPorch=Number.isFinite(person.x)&&Number.isFinite(person.y)&&
   porches.some(h=>Math.hypot(h.x-person.x,h.y-person.y)<32);
  if(nearPorch&&world.minute>=16*60+45&&world.minute<18*60+5){
   const porchPhase=((elapsed+config.offset)%41+41)%41;
   if(porchPhase<3.2){
    const kind=['damiao','cica'].includes(person.id)?'sweep':['lucia','nara','teo'].includes(person.id)?'chair':'rest';
    return{kind,strength:smooth(Math.min(1,porchPhase/.55,(3.2-porchPhase)/.55)),phase:porchPhase,nearPorch:true};
   }
  }
  const phase=((elapsed+config.offset+(Math.max(1,world.day||1)-1)*2)%CYCLE+CYCLE)%CYCLE;
  if(phase>=DURATION)return null;
  const strength=smooth(Math.min(1,phase/.65,(DURATION-phase)/.65));
  return{kind:config.kind,strength,phase};
 }
 return{GESTURES,CYCLE,DURATION,choose,setHouses};
});

