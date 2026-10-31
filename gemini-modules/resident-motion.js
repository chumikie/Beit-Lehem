
/* V2.23 — continuity of fictional walkers. All detours use the existing OSM
   road graph. In-game coordinates, schedules and save records stay unchanged. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorResidentMotion=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 function create(graph){
  const states=new Map(),visuals=new Map();
  let holds=new Set();
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const safe=n=>Number.isFinite(n)?n:0;
  function resolve(person,elapsed,day){
   const target={x:person.x,y:person.y},now=safe(elapsed);
   if(!Number.isFinite(target.x)||!Number.isFinite(target.y))return person;
   let s=states.get(person.id);
   if(!s||day!==s.day||now<s.last-.001||now-s.last>18){
    s={x:target.x,y:target.y,day,last:now,heading:0,stride:0,pace:0,bridge:null,bridgeIndex:1,blockedUntil:0};states.set(person.id,s);
    return{...person,heading:0,stridePhase:0,arriving:false};
   }
   if(now===s.last&&s.result)return{...person,...s.result};
   const dt=Math.min(.09,Math.max(0,now-s.last));s.last=now;
   const held=holds.has(person.id)&&!person.meeting&&!person.travel;
   const from={x:s.x,y:s.y},gap=distance(from,target);
   if(!held&&!person.pause&&!s.bridge&&gap>11&&graph?.route&&now>=s.blockedUntil){
    const route=graph.route([s.x,s.y],[target.x,target.y]);
    // In disconnected OSM components there is no verified pedestrian route;
    // never draw a fictional connector through a house or private parcel.
    if(route?.points?.length&&route.distance<1600){
     s.bridge=[{x:s.x,y:s.y},...route.points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))];
     s.bridgeIndex=1;s.blockedUntil=0;
    }else{s.blockedUntil=now+1.5;}
   }
   // A short, optional roadside gesture holds the *same* mapped location.
   // Never interrupt a resident already following a bridging road route.
   const waitingForPath=gap>11&&!s.bridge&&(!graph?.route||s.blockedUntil>now);
   const resting=(!!person.pause||held||waitingForPath)&&!s.bridge;
   const intent=!resting&&(!!s.bridge||gap>.035);
   s.pace+=(Number(intent)-s.pace)*(1-Math.exp(-dt*(intent?5.5:7)));
   let remaining=resting?0:dt*(person.meeting?37:person.travel?82:43)*(.38+.62*s.pace);
   if(s.bridge){
    while(s.bridgeIndex<s.bridge.length&&remaining>0){
     const next=s.bridge[s.bridgeIndex],d=distance(s,next);
     if(d<.001){s.bridgeIndex++;continue;}
     const n=Math.min(remaining,d);s.x+=(next.x-s.x)*n/d;s.y+=(next.y-s.y)*n/d;remaining-=n;
     if(n>=d-.001)s.bridgeIndex++;
    }
    if(s.bridgeIndex>=s.bridge.length){s.bridge=null;s.bridgeIndex=1;}
   }else if(!resting&&gap>0){
    const speed=person.travel?145:person.walking?27:17;
    const length=Math.min(gap,dt*speed*(.38+.62*s.pace));
    if(length>0){s.x+=(target.x-s.x)*length/gap;s.y+=(target.y-s.y)*length/gap;}
   }
   const moved=distance(from,s);
   // The route stays on mapped streets; only the sprite's facing direction
   // eases around corners instead of snapping instantly between headings.
   const desired=moved>.06?Math.atan2(s.y-from.y,s.x-from.x):s.heading;
   const delta=Math.atan2(Math.sin(desired-s.heading),Math.cos(desired-s.heading));
   const heading=s.heading+delta*(1-Math.exp(-dt*9));
   // Pace the foot animation even during a catch-up stroll on a longer route.
   s.heading=heading;s.stride+=Math.min(moved,dt*2.5);
   s.result={x:s.x,y:s.y,walking:!resting&&(moved>.08||!!person.walking&&gap>.08),arriving:!!s.bridge,
    heading,stridePhase:s.stride*4.2,travelDistance:moved,pace:s.pace,walkBlend:s.pace};
   return{...person,...s.result};
  }
  function present(person,now,reduce){
   // A subtle reach uses the existing gesture renderer and carried props:
   // Damião's basket, Lúcia's flower and Bia's notebook. Never move their feet.
   const gestures={damiao:{kind:'rest',pose:'offer',facing:1},
    lucia:{kind:'flower',pose:'receive',facing:1},
    bia:{kind:'read',pose:'receive',facing:-1}};
   const cue=gestures[person.id],moment=person.moment;
   if(cue&&moment?.kind===cue.kind&&!person.social&&!person.walking&&!person.arriving&&!person.meeting&&!person.travel){
    person.social={pose:cue.pose,facing:cue.facing,intensity:Math.min(.55,Math.max(0,moment.strength)*.55),react:false,stage:'routine'};
   }
   const desired=person.social?.facing?person.social.facing*.65:person.walking&&Number.isFinite(person.heading)?Math.cos(person.heading)*.76:0;
   let v=visuals.get(person.id);
   if(!v||now<v.last||now-v.last>10){v={gaze:desired,lean:0,last:now,socialStrength:0,lastSocial:null};visuals.set(person.id,v);}
   const dt=Math.max(0,Math.min(.09,now-v.last));v.last=now;
   // Gentle entrance and exit of a greeting; do not wave while feet are moving.
   const requested=person.social?Math.max(0,Math.min(1,Number(person.social.intensity??1))):0;
   v.socialStrength=(v.socialStrength||0)+(requested-(v.socialStrength||0))*(1-Math.exp(-dt*(requested?8:6)));
   if(person.social){
    person.social={...person.social,intensity:reduce?requested:v.socialStrength};
    v.lastSocial={...person.social};
   }else if(!reduce&&!person.walking&&v.socialStrength>.045&&v.lastSocial&&(person.walkBlend||0)<.3){
    person.social={...v.lastSocial,pose:'wave',stage:'farewell',react:false,intensity:v.socialStrength};
   }

   v.gaze=reduce?desired:v.gaze+(desired-v.gaze)*(1-Math.exp(-dt*10));
   person.gaze=v.gaze;
   // Ease the body's slight lean as the walker slows, turns, or greets someone.
   const targetLean=reduce?0:Math.cos(person.heading||0)*.025*(person.walkBlend??Number(!!person.walking));
   v.lean=reduce?0:(v.lean||0)+(targetLean-(v.lean||0))*(1-Math.exp(-dt*7));
   person.lean=v.lean;
   return person;
  }
  return{resolve,present,hold:ids=>{holds=new Set(ids);},clear:()=>{states.clear();visuals.clear();holds.clear();},snapshot:()=>[...states].map(([id,s])=>({id,x:s.x,y:s.y,arriving:!!s.bridge}))};
 }
 return{create};
});

