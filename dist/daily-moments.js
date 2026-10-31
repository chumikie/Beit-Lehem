/* V2.12 — fictional time-window scenes anchored to existing OSM POIs.
 * Schedules are gameplay, not claims of actual opening hours or events.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.RoncadorDailyMoments=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const MOMENTS=[
  {id:'manha',hub:'mercado',start:7*60,end:12*60,icon:'🧺',title:'Manhã de conversas',caption:'O movimento da feira inspira uma cena de bancas, cestos e encontros imaginados.',memory:'No começo do dia, você observou um pouco da vida perto do Mercado.'},
  {id:'tarde',hub:'rodoviaria',start:12*60,end:17*60,icon:'📚',title:'Tarde de idas e voltas',caption:'Um caderno, uma espera tranquila e sonhos de quem vai estudar em outra cidade.',memory:'Na parte da tarde, você guardou uma história fictícia de viagens.'},
  {id:'entardecer',hub:'igreja',start:17*60,end:20*60,icon:'🌼',title:'Luz entre os arcos',caption:'A memória da igreja encontra flores, conversas e a luz morna do fim do dia.',memory:'No fim do dia, você contemplou os arcos da igreja.'}
 ];
 function current(living){return MOMENTS.find(m=>living?.minute>=m.start&&living?.minute<m.end)||null;}
 function restore(value){return Array.isArray(value)?[...new Set(value.filter(id=>MOMENTS.some(m=>m.id===id)))]:[];}
 function record(value,id){if(!MOMENTS.some(m=>m.id===id))return false;if(value.includes(id))return false;value.push(id);return true;}
 function progress(value){return restore(value).length;}
 function nextWindowMinutes(living){const minute=Math.max(0,Math.min(1439,Number(living?.minute)||0));const future=MOMENTS.find(m=>m.start>minute+.1);return future?future.start-minute:1440-minute+MOMENTS[0].start;}
 return{MOMENTS,current,restore,record,progress,nextWindowMinutes};
});
