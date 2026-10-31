
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
  let porches=[],junctions=[];
  const cooldown=new Map(),personal=new Map();
  function setHouses(houses){
   // Match the same sparse, illustrated residential doorsteps as central-blocks.
   porches=Array.isArray(houses)?houses.filter(h=>
    h&&['matriz','joao','clovis'].includes(h.centralBlock)&&h.w>=18&&h.seed%7===2&&Number.isFinite(h.x)&&Number.isFinite(h.y)
   ).map(h=>({x:h.x,y:h.y})):[];
   return porches.length;
  }
  function setJunctions(points){
   junctions=Array.isArray(points)?points.filter(p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y)):[];
   return junctions.length;
  }
  function nearJunction(p){return junctions.some(j=>Math.hypot(j.x-p.x,j.y-p.y)<22);}
  function nearbyPorch(a,b){
   const x=(a.x+b.x)/2,y=(a.y+b.y)/2;
   return porches.some(h=>Math.hypot(h.x-x,h.y-y)<34&&
     Math.hypot(h.x-a.x,h.y-a.y)<57&&Math.hypot(h.x-b.x,h.y-b.y)<57);
  }
  function apply(people,now,clock){
   if(!Number.isFinite(now)||!Number.isFinite(clock?.minute))return[];
   if(clock.day!==day||now<last||now-last>10){active=null;nextCheck=0;cooldown.clear();personal.clear();day=clock.day;}
   last=now;
   const eligible=p=>p&&!p.meeting&&!p.travel&&!p.arriving;
   if(clock.minute<7*60||clock.minute>=20*60)active=null;
   if(active){
    const pair=active.ids.map(id=>people.find(p=>p.id===id));
    if(pair.some(p=>!eligible(p))||now-active.start>=(active.porch?5.2:4.4)){active=null;}
   }
   if(!active&&now>=nextCheck&&clock.minute>=7*60&&clock.minute<20*60){
    nextCheck=now+.4;
    const sorted=people.filter(eligible).slice().sort((a,b)=>a.id.localeCompare(b.id));
    outer:for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
     const a=sorted[i],b=sorted[j],k=key(a.id,b.id),d=Math.hypot(a.x-b.x,a.y-b.y);
     if(!known.has(k)||d<23||d>64||nearJunction(a)||nearJunction(b)||now<(cooldown.get(k)||0)||now<(personal.get(a.id)||0)||now<(personal.get(b.id)||0))continue;
     // Friends on separate streets or opposite sides of a block cannot greet
     // through buildings. No new connector or destination is invented.
     const road=graph?.route?.([a.x,a.y],[b.x,b.y]);
     if(!road||!Number.isFinite(road.distance)||road.distance>d*1.3+3)continue;
     active={ids:[a.id,b.id],start:now,porch:nearbyPorch(a,b)};cooldown.set(k,now+55);
     for(const id of active.ids)personal.set(id,now+18);
     break outer;
    }
   }
   if(!active)return[];
   const age=(now-active.start)*(active.porch?4.4/5.2:1),pair=active.ids.map(id=>people.find(p=>p.id===id));
   for(let i=0;i<2;i++){
    const person=pair[i],friend=pair[1-i];
    person.moment=null;person.walking=false;
    // A short conversation now ends in distinct beats: look, wave, turn, release.
    // Positions remain untouched; the resident motion system resumes its own route.
    const stage=age<.65?'notice':age<2.75?'chat':age<3.15?'look':age<3.85?'wave':'turn';
    const facing=friend.x>=person.x?1:-1;
    const outward=Number.isFinite(person.heading)?(Math.cos(person.heading)>=0?1:-1):facing;
    const intensity=stage==='wave'
      ?smooth(Math.min((age-3.15)/.18,(3.85-age)/.18))
      :stage==='chat'?smooth(Math.min((age-.65)/.35,(2.75-age)/.35)):1;
    person.social={pose:stage==='wave'?'wave':stage==='chat'?'listen':'smile',
      facing:stage==='turn'?outward:facing,intensity,
      stage:stage==='look'||stage==='wave'||stage==='turn'?'farewell':stage,
      react:stage==='chat'&&age>1.1&&age<2.5,spontaneous:true};
    person.greeting={friend:friend.def?.name||friend.id,age,stage,nearPorch:active.porch};
   }
   return active.ids.slice();
  }
  return{apply,setHouses,setJunctions,snapshot:()=>active?{ids:active.ids.slice(),start:active.start,porch:active.porch}:null};
 }
 return{LINKS,create};
});

