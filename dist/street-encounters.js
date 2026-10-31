/* V2.17 — authored, fictional neighbours crossing paths on mapped streets.
 * The dates, gestures and dialogue are gameplay, not observed events in Belém.
 * All positioning is handled separately by the existing OSM road graph.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RoncadorStreetEncounters=api;
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const EVENTS=[
  {id:'flores-na-feira',weekday:0,start:9*60,approach:20,visit:35,returning:20,host:'damiao',visitor:'lucia',from:'igreja',to:'mercado',icon:'🌷',title:'Lúcia encontra Damião',summary:'Lúcia passa pela feira com um raminho; Damião separa uma fruta para agradecer.',lines:['Lúcia: “Trouxe uma flor pra alegrar o dia!”','Damião: “E eu separei uma fruta pra você!”','Lúcia: “Uma gentileza sempre puxa outra.”']},
  {id:'caderno-na-feira',weekday:0,start:10*60+15,approach:25,visit:30,returning:35,host:'damiao',visitor:'bia',from:'rodoviaria',to:'mercado',icon:'📚',title:'Bia passa pela feira',summary:'Bia visita as bancas ilustrativas para ouvir notícias; Damião pergunta pelos caminhos que ela sonha conhecer.',lines:['Bia: “Anotei um lugar novo no meu caderno.”','Damião: “Guarde espaço pras histórias daqui!”','Bia: “Eu volto pra contar as novidades.”']},
  {id:'roda-de-amigos',weekday:4,start:16*60+30,approach:0,visit:30,returning:0,host:'damiao',visitor:'lucia',from:'igreja',to:'mercado',icon:'♡',title:'Os três se encontram',summary:'Um breve encontro inventado no entorno do Mercado, com histórias, flores e cadernos.',lines:['Damião: “Olhe só quem chegou pra conversar!”','Lúcia: “Trouxe uma flor para a roda.”','Bia: “E eu trouxe uma história do caminho!”'],cast:['damiao','lucia','bia']}
 ];
 const validState=s=>s&&Number.isInteger(s.day)&&s.day>=1&&Number.isFinite(s.minute);
 function current(s){
  if(!validState(s))return null;
  const weekday=(s.day-1)%7;
  for(const event of EVENTS){
   if(event.weekday!==weekday)continue;
   const passed=s.minute-event.start,duration=event.approach+event.visit+event.returning;
   if(passed<0||passed>=duration)continue;
   const phase=passed<event.approach?'approach':passed<event.approach+event.visit?'visit':'return';
   return {...event,phase,passed,end:event.start+duration};
  }
  return null;
 }
 function next(s){
  if(!validState(s))return null;
  let best=null;
  for(const event of EVENTS){
   const ahead=((event.weekday-(s.day-1)%7+7)%7)*1440+event.start-s.minute;
   const wait=ahead<0?ahead+7*1440:ahead;
   if(!best||wait<best.wait)best={...event,wait};
  }
  return best;
 }
 function agenda(s,id){
  const event=current(s);if(!event)return null;
  if(event.cast){
   if(!event.cast.includes(id))return null;
   return{present:true,hub:event.to,activity:id==='damiao'?'recebendo amigas na feira':id==='lucia'?'trocando flores e notícias':'compartilhando anotações',meeting:true,encounter:event};
  }
  if(id===event.host)return{present:true,hub:event.to,activity:event.phase==='visit'?'conversando com '+(event.visitor==='lucia'?'Lúcia':'Bia'):'organizando a banca',meeting:event.phase==='visit',encounter:event};
  if(id===event.visitor)return{present:true,hub:event.to,activity:event.phase==='approach'?'caminhando para o encontro':event.phase==='visit'?'visitando a feira e conversando':'voltando pelo caminho',meeting:event.phase==='visit',encounter:event,travel:event.phase!=='visit'};
  return null;
 }
 function progress(event){
  if(!event)return 0;
  if(event.phase==='approach')return Math.min(1,Math.max(0,event.passed/event.approach));
  if(event.phase==='return')return Math.max(0,Math.min(1,1-(event.passed-event.approach-event.visit)/event.returning));
  return 1;
 }
 function line(s,event){
  if(!event)return '';
  if(event.phase==='approach')return event.visitor==='lucia'?'Lúcia segue para visitar a feira.':'Bia caminha com seu caderno.';
  if(event.phase==='return')return event.visitor==='lucia'?'Lúcia leva uma fruta e um sorriso.':'Bia guarda as novidades e segue viagem.';
  return event.lines[(Math.floor((s.minute-event.start-event.approach)/12)+Math.floor((s.day-1)/7))%event.lines.length];
 }
 // Linear sampling over *existing* graph vertices; never create side-street shortcuts.
 function alongRoad(points,fraction){
  if(!Array.isArray(points)||!points.length)return null;
  if(points.length===1)return{x:points[0].x,y:points[0].y,walking:false,direction:1};
  const segments=[];let distance=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b.x-a.x,b.y-a.y);if(len>0){distance+=len;segments.push({a,b,len});}}
  let remaining=distance*Math.min(1,Math.max(0,Number(fraction)||0));
  for(const seg of segments){if(remaining<=seg.len){const t=remaining/seg.len;return{x:seg.a.x+(seg.b.x-seg.a.x)*t,y:seg.a.y+(seg.b.y-seg.a.y)*t,walking:fraction>0&&fraction<1,direction:seg.b.x>=seg.a.x?1:-1};}remaining-=seg.len;}
  const last=points[points.length-1];return{x:last.x,y:last.y,walking:false,direction:1};
 }
 return{EVENTS,current,next,agenda,progress,line,alongRoad};
});
