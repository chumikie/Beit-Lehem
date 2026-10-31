/* V2.25 — spontaneous greetings among established fictional friends.
   Proximity and the existing road graph trigger these; no quest, reward or save. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorStreetGreetings=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const LINKS=['damiao:lucia','bia:damiao','cica:damiao','bia:nara','lucia:nara','damiao:teo','bia:teo'];
 const key=(a,b)=>[a,b].sort().join(':');
 const known=new Set(LINKS.map(p=>key(...p.split(':'))));
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function create(graph){
  let active=null,last=-1,day=null,nextCheck=0;
  const cooldown=new Map(),personal=new Map();
  function apply(people,now,clock){
   if(!Number.isFinite(now)||!Number.isFinite(clock?.minute))return[];
   if(clock.day!==day||now<last||now-last>10){active=null;nextCheck=0;cooldown.clear();personal.clear();day=clock.day;}
   last=now;
   const eligible=p=>p&&!p.meeting&&!p.travel&&!p.arriving;
   if(clock.minute<7*60||clock.minute>=20*60)active=null;
   if(active){
    const pair=active.ids.map(id=>people.find(p=>p.id===id));
    if(pair.some(p=>!eligible(p))||now-active.start>=3.8){active=null;}
   }
   if(!active&&now>=nextCheck&&clock.minute>=7*60&&clock.minute<20*60){
    nextCheck=now+.4;
    const sorted=people.filter(eligible).slice().sort((a,b)=>a.id.localeCompare(b.id));
    outer:for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
     const a=sorted[i],b=sorted[j],k=key(a.id,b.id),d=Math.hypot(a.x-b.x,a.y-b.y);
     if(!known.has(k)||d<23||d>64||now<(cooldown.get(k)||0)||now<(personal.get(a.id)||0)||now<(personal.get(b.id)||0))continue;
     // Friends on separate streets or opposite sides of a block cannot greet
     // through buildings. No new connector or destination is invented.
     const road=graph?.route?.([a.x,a.y],[b.x,b.y]);
     if(!road||!Number.isFinite(road.distance)||road.distance>d*1.3+3)continue;
     active={ids:[a.id,b.id],start:now};cooldown.set(k,now+55);
     for(const id of active.ids)personal.set(id,now+18);
     break outer;
    }
   }
   if(!active)return[];
   const age=now-active.start,pair=active.ids.map(id=>people.find(p=>p.id===id));
   for(let i=0;i<2;i++){
    const person=pair[i],friend=pair[1-i];
    person.moment=null;person.walking=false;
    const intensity=smooth(Math.min((age-.65)/.5,(3.3-age)/.6));
    person.social={pose:age<.65?'listen':age<3.3?'wave':'smile',facing:friend.x>=person.x?1:-1,intensity,react:age>1.1&&age<2.8,spontaneous:true};
    person.greeting={friend:friend.def?.name||friend.id,age};
   }
   return active.ids.slice();
  }
  return{apply,snapshot:()=>active?{ids:active.ids.slice(),start:active.start}:null};
 }
 return{LINKS,create};
});
