/* V2.10 — Cozy quests with explicit triggers and one-time rewards.
 * Fully fictional narrative; does not create new geographic features.
 */
(function(root, factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RoncadorCozyQuests=api;
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const STEPS=['damiao','mercado','colheita'];
  function fresh(){return{damiao:false,mercado:false,colheita:false,claimed:false};}
  function restore(raw){const state=fresh();if(!raw||typeof raw!=='object')return state;
    for(const key of [...STEPS,'claimed'])state[key]=raw[key]===true;
    if(!ready(state))state.claimed=false;
    return state;
  }
  function record(state,step){if(!STEPS.includes(step)||state[step])return false;state[step]=true;return true;}
  function progress(state){return STEPS.filter(step=>state[step]).length;}
  function ready(state){return progress(state)===STEPS.length;}
  function claim(state){if(!ready(state)||state.claimed)return false;state.claimed=true;return true;}
  function next(state){return STEPS.find(step=>!state[step])||null;}
  return{STEPS,fresh,restore,record,progress,ready,claim,next};
});
