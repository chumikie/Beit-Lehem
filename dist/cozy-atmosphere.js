/* V2.11 — playful sky and garden watering, never a real weather forecast. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.RoncadorAtmosphere = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const MODES = ['sol', 'nuvens', 'chuvisco'];
  const LABELS = {sol:'☀ Sol manso', nuvens:'☁ Céu de algodão', chuvisco:'☂ Chuvisco'};
  function restore(value) {return MODES.includes(value)?value:'sol';}
  function next(current) {return MODES[(MODES.indexOf(restore(current))+1)%MODES.length];}
  function waterGarden(step, minutes, mode, accrued=0) {
    if(step!==2)return{step,accrued:0,watered:false};
    const delta=mode==='chuvisco'&&Number.isFinite(minutes)?Math.max(0,Math.min(minutes,60)):0;
    const total=Math.min(8,Math.max(0,Number(accrued)||0)+delta);
    return{step:total>=8?3:2,accrued:total>=8?0:total,watered:total>=8};
  }
  return{MODES,LABELS,restore,next,waterGarden};
});
