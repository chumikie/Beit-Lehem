
/* V2.15 — narrative gardening with Dona Lúcia near the mapped Igreja.
 * A fictional shared planter, not an assertion of an actual public garden.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RoncadorLuciaGarden=api;
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const TASKS=[
  {id:'terra',title:'Preparar a terra',icon:'🍂',story:'A terra fica soltinha. Lúcia mostra como deixar espaço para as raízes respirarem.'},
  {id:'muda',title:'Acomodar a muda',icon:'🌱',story:'Uma mudinha imaginária encontra seu lugar. As primeiras folhas se abrem com cuidado.'},
  {id:'agua',title:'Regar devagar',icon:'💧',story:'A água chega mansinha e a plantinha se ergue, sem encharcar a terra.'}
 ];
 const MEMORIES=[
  {id:'quintal',title:'Um quintal de infância',story:'Uma lembrança inventada de quintais, sombra fresca e passos pequenos.'},
  {id:'conversa',title:'Uma conversa no portão',story:'Uma lembrança inventada de ouvir alguém querido sem olhar para o relógio.'},
  {id:'chuva',title:'O cheiro da primeira chuva',story:'Uma lembrança inventada de terra molhada e esperança depois do calor.'}
 ];
 function fresh(){return{arrived:false,talked:false,work:[],memory:null,claimed:false,claimedDay:0};}
 function readyForMemory(state){return state.talked&&state.work.length===TASKS.length;}
 function ready(state){return readyForMemory(state)&&MEMORIES.some(m=>m.id===state.memory);}
 function restore(raw){
  const state=fresh();if(!raw||typeof raw!=='object')return state;
  state.arrived=raw.arrived===true;
  state.talked=state.arrived&&raw.talked===true;
  if(state.talked&&Array.isArray(raw.work)){
   for(const task of TASKS){if(raw.work.includes(task.id)&&raw.work.indexOf(task.id)===state.work.length)state.work.push(task.id);else break;}
  }
  if(readyForMemory(state)&&MEMORIES.some(m=>m.id===raw.memory))state.memory=raw.memory;
  state.claimed=ready(state)&&raw.claimed===true;
  if(state.claimed&&Number.isInteger(raw.claimedDay)&&raw.claimedDay>=1&&raw.claimedDay<=9999)state.claimedDay=raw.claimedDay;
  return state;
 }
 function arrive(state){if(state.arrived)return false;state.arrived=true;return true;}
 function meet(state){if(state.talked)return false;state.arrived=true;state.talked=true;return true;}
 function doWork(state,id){if(!state.talked||state.claimed||id!==TASKS[state.work.length]?.id)return false;state.work.push(id);return true;}
 function chooseMemory(state,id){if(!readyForMemory(state)||state.claimed||!MEMORIES.some(m=>m.id===id))return false;state.memory=id;return true;}
 function claim(state,day){if(state.claimed||!ready(state))return false;state.claimed=true;state.claimedDay=Number.isInteger(day)&&day>=1&&day<=9999?day:0;return true;}
 function growth(state,day){
  if(!state?.claimed)return{stage:0,caption:'A mudinha ainda espera seu cuidado.',flower:false,scale:.66};
  // Saves anteriores à data de plantio mantêm a flor já conquistada.
  if(!Number.isInteger(state.claimedDay)||state.claimedDay<1)return{stage:3,caption:'Uma flor do jardim já guarda essa lembrança.',flower:true,scale:1};
  const days=Math.max(0,(Number.isInteger(day)?day:state.claimedDay)-state.claimedDay);
  const stage=days>=5?3:days>=3?2:days>=1?1:0;
  const captions=['A muda foi plantada hoje.','As primeiras folhas estão mais abertas.','Um botão de flor começa a aparecer.','A flor se abriu depois de alguns dias.'];
  return{stage,caption:captions[stage],flower:stage===3,scale:[.7,.82,.92,1][stage]};
 }
 function progress(state){return Number(state.arrived)+Number(state.talked)+Number(state.claimed);}
 function next(state){return !state.arrived?'arrival':!state.talked?'talk':!readyForMemory(state)?'work':!ready(state)?'memory':!state.claimed?'thank':'next';}
 return{TASKS,MEMORIES,fresh,restore,arrive,meet,doWork,chooseMemory,readyForMemory,ready,claim,growth,progress,next};
});

