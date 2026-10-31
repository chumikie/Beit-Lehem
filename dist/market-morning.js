/* V2.14 — a self-contained, wholly fictional morning with Damião.
 * Uses the existing OSM market POI only as a place to meet; stall objects
 * are illustrative and never represent mapped vendor locations.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RoncadorMarketMorning=api;
})(typeof window==='undefined'?null:window,function(){
  'use strict';
  const TASKS=[
    {id:'toldo',title:'Estender o toldo',icon:'⛱',story:'O tecido ganha sombra suave sobre a banca. Damião ajeita o último cordão.'},
    {id:'frutas',title:'Separar as frutas',icon:'🍊',story:'As frutas imaginadas ficam organizadas por cor. A banca parece mais acolhedora.'},
    {id:'cestos',title:'Empilhar os cestos',icon:'🧺',story:'Os cestos encontram seu lugar e a passagem fica livre para quem chega.'}
  ];
  function fresh(){return{arrived:false,talked:false,work:[],claimed:false};}
  function restore(raw){
    const state=fresh();if(!raw||typeof raw!=='object')return state;
    state.arrived=raw.arrived===true;
    state.talked=state.arrived&&raw.talked===true;
    if(state.talked&&Array.isArray(raw.work))state.work=TASKS.map(t=>t.id).filter(id=>raw.work.includes(id));
    state.claimed=state.talked&&state.work.length===TASKS.length&&raw.claimed===true;
    return state;
  }
  function arrive(state){if(state.arrived)return false;state.arrived=true;return true;}
  function meet(state){if(state.talked)return false;state.arrived=true;state.talked=true;return true;}
  function doWork(state,id){
    if(!state.talked||state.claimed||!TASKS.some(t=>t.id===id)||state.work.includes(id))return false;
    state.work.push(id);return true;
  }
  function ready(state){return state.talked&&TASKS.every(t=>state.work.includes(t.id));}
  function claim(state){if(state.claimed||!ready(state))return false;state.claimed=true;return true;}
  function progress(state){return Number(state.arrived)+Number(state.talked)+Number(state.claimed);}
  function next(state){return !state.arrived?'arrival':!state.talked?'talk':!ready(state)?'work':!state.claimed?'thank':'next';}
  return{TASKS,fresh,restore,arrive,meet,doWork,ready,claim,progress,next};
});
