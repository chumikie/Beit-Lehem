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
 function fresh(){return{arrived:false,talked:false,work:[],memory:null,claimed:false};}
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
  return state;
 }
 function arrive(state){if(state.arrived)return false;state.arrived=true;return true;}
 function meet(state){if(state.talked)return false;state.arrived=true;state.talked=true;return true;}
 function doWork(state,id){if(!state.talked||state.claimed||id!==TASKS[state.work.length]?.id)return false;state.work.push(id);return true;}
 function chooseMemory(state,id){if(!readyForMemory(state)||state.claimed||!MEMORIES.some(m=>m.id===id))return false;state.memory=id;return true;}
 function claim(state){if(state.claimed||!ready(state))return false;state.claimed=true;return true;}
 function progress(state){return Number(state.arrived)+Number(state.talked)+Number(state.claimed);}
 function next(state){return !state.arrived?'arrival':!state.talked?'talk':!readyForMemory(state)?'work':!ready(state)?'memory':!state.claimed?'thank':'next';}
 return{TASKS,MEMORIES,fresh,restore,arrive,meet,doWork,chooseMemory,readyForMemory,ready,claim,progress,next};
});
