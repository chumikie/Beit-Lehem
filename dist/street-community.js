/* Belém Viva V2.20 — fictional friendships on mapped walks, not real residents.
   All time and dialogue belong to the game's calendar; locations are existing OSM hubs. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RoncadorStreetCommunity=api;
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const EVENTS=Object.freeze([
  {id:'fitas-de-bom-dia',weekday:0,start:8*60+15,approach:10,visit:35,returning:10,from:'mercado',to:'mercado',host:'damiao',visitor:'cica',icon:'🧵',title:'Ciça e Damião · fitas na feira',summary:'Ciça organiza pequenas fitas e oferece uma para enfeitar o cesto de Damião.',lines:['Ciça: “Trouxe fitas para alegrar a banca!”','Damião: “Esse laço vai ficar bonito no cesto.”','Ciça: “Guarda um pedacinho dessa manhã!”'],gesture:'ribbons'},
  {id:'caderno-compartilhado',weekday:2,start:15*60+10,approach:15,visit:35,returning:15,from:'rodoviaria',to:'igreja',host:'nara',visitor:'bia',icon:'✏️',title:'Nara e Bia · páginas novas',summary:'Nara desenha uma janela e Bia escreve o que gostaria de contar quando voltar.',lines:['Nara: “Desenhei a janela que você descreveu.”','Bia: “Vou escrever uma carta nesta página!”','Nara: “Um desenho também pode guardar saudade.”'],gesture:'sketch'},
  {id:'memorias-do-jardim',weekday:3,start:10*60+10,approach:8,visit:32,returning:8,from:'igreja',to:'igreja',host:'lucia',visitor:'nara',icon:'🌿',title:'Nara e Lúcia · memórias em folhas',summary:'Lúcia mostra um vasinho fictício, e Nara transforma as folhas em desenho.',lines:['Lúcia: “Essa folha me lembra um quintal antigo.”','Nara: “Posso desenhar esse formato?”','Lúcia: “Assim a lembrança floresce duas vezes!”'],gesture:'leaf'},
  {id:'recado-da-feira',weekday:5,start:10*60+5,approach:18,visit:35,returning:18,from:'rodoviaria',to:'mercado',host:'damiao',visitor:'teo',icon:'✉️',title:'Téo e Damião · um recado',summary:'Téo atravessa a cidade com um bilhetinho para Damião, que o lê e sorri.',lines:['Téo: “Chegou uma notícia boa para você!”','Damião: “Um recado desses melhora a manhã.”','Téo: “Vou contar que você mandou um abraço!”'],gesture:'letter'},
  {id:'bilhete-de-volta',weekday:6,start:16*60+10,approach:8,visit:32,returning:8,from:'rodoviaria',to:'rodoviaria',host:'bia',visitor:'teo',icon:'💌',title:'Téo e Bia · caminhos de volta',summary:'Bia entrega um pequeno bilhete a Téo para que sua lembrança encontre outros amigos.',lines:['Bia: “Escrevi: volto com mais histórias.”','Téo: “Eu cuido desse recadinho!”','Bia: “Assim ninguém fica longe demais.”'],gesture:'letter'}
 ]);
 const participant=(scene,id)=>!!scene&&(scene.host===id||scene.visitor===id);
 function current(clock){
  if(!Number.isInteger(clock?.day)||clock.day<1||!Number.isFinite(clock.minute))return null;
  const weekday=(clock.day-1)%7;
  for(const event of EVENTS){
   if(event.weekday!==weekday)continue;
   const passed=clock.minute-event.start,duration=event.approach+event.visit+event.returning;
   if(passed<0||passed>=duration)continue;
   const phase=passed<event.approach?'approach':passed<event.approach+event.visit?'visit':'return';
   return {...event,passed,phase};
  }
  return null;
 }
 function next(clock){
  if(!Number.isInteger(clock?.day)||clock.day<1||!Number.isFinite(clock.minute))return null;
  const weekday=(clock.day-1)%7;
  return EVENTS.map(event=>{
   let wait=((event.weekday-weekday+7)%7)*1440+event.start-clock.minute;
   if(wait<0)wait+=7*1440;
   return {...event,wait};
  }).sort((a,b)=>a.wait-b.wait)[0]||null;
 }
 function agenda(clock,id){
  const event=current(clock);
  if(!participant(event,id))return null;
  const visitor=id===event.visitor;
  const phase=event.phase;
  const activity=phase==='visit'?{
   cica:'escolhendo fitas para Damião',damiao:event.gesture==='letter'?'lendo um recado de Téo':'recebendo um laço de Ciça',
   nara:event.gesture==='leaf'?'desenhando as plantas de Lúcia':'desenhando com Bia',
   bia:event.gesture==='letter'?'entregando um bilhete a Téo':'escrevendo no caderno de Nara',
   lucia:'mostrando folhas a Nara',teo:'entregando um bilhete'
  }[id]:(visitor?phase==='approach'?'seguindo para encontrar um amigo':'voltando com uma lembrança':'preparando uma visita acolhedora');
  return {present:true,hub:event.to,activity,meeting:phase==='visit',travel:visitor&&phase!=='visit'&&event.from!==event.to,encounter:event,community:true};
 }
 function line(clock,event){
  if(!event)return'';
  if(event.phase==='approach')return 'Uma visita está a caminho.';
  if(event.phase==='return')return 'A visita leva uma lembrança para casa.';
  const cycle=Math.floor((clock.minute-event.start-event.approach)/9);
  return event.lines[((cycle+Math.floor((clock.day-1)/7))%event.lines.length+event.lines.length)%event.lines.length];
 }
 function fresh(){return[];}
 function restore(raw){return Array.isArray(raw)?EVENTS.map(e=>e.id).filter(id=>raw.includes(id)):fresh();}
 function observe(state,event,withinReach){
  if(!event||event.phase!=='visit'||!withinReach||!EVENTS.some(e=>e.id===event.id)||state.includes(event.id))return{ok:false};
  state.push(event.id);
  return{ok:true,count:state.length,unlocked:state.length>=3};
 }
 return{EVENTS,current,next,agenda,line,participant,fresh,restore,observe};
});
