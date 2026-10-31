/* V2.16 — Bia's fictional letter-writing chapter at the existing OSM bus terminal.
 * Story fragments are original fiction, not quotes from the CoLingPB recordings.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RoncadorBiaLetters=api;
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const THEMES=[
  {id:'saudade',title:'Para quando bater saudade',short:'Saudade',story:'Se um dia a saudade apertar, vou lembrar do burburinho da banca de Damião, das plantas de Lúcia e de quem me esperou para conversar.',reply:'Tem saudade que vira um mapa de volta para casa.'},
  {id:'planos',title:'Para os caminhos que virão',short:'Planos',story:'Quero conhecer caminhos novos, estudar e aprender. Levo comigo o cuidado de Lúcia, a coragem de Damião e o direito de mudar de ideia.',reply:'Um plano bonito também pode deixar espaço para surpresas.'},
  {id:'retorno',title:'Para o dia de voltar',short:'Retorno',story:'Quando eu voltar, quero saber das novidades da feira, encontrar o jardim de Lúcia mais crescido e contar tudo o que descobri pelo caminho.',reply:'Voltar também é uma aventura quando a gente encontra quem escuta.'}
 ];
 function fresh(){return{arrived:false,talked:false,opened:false,theme:null,sealed:false,claimed:false};}
 function canWrite(state){return state.talked&&state.opened&&!state.sealed;}
 function ready(state){return state.talked&&state.opened&&THEMES.some(t=>t.id===state.theme)&&state.sealed;}
 function restore(raw){
  const state=fresh();if(!raw||typeof raw!=='object')return state;
  state.arrived=raw.arrived===true;
  state.talked=state.arrived&&raw.talked===true;
  state.opened=state.talked&&raw.opened===true;
  if(state.opened&&THEMES.some(t=>t.id===raw.theme))state.theme=raw.theme;
  state.sealed=!!state.theme&&raw.sealed===true;
  state.claimed=ready(state)&&raw.claimed===true;
  return state;
 }
 function arrive(state){if(state.arrived)return false;state.arrived=true;return true;}
 function meet(state){if(state.talked)return false;state.arrived=true;state.talked=true;return true;}
 function openNotebook(state){if(!state.talked||state.opened||state.claimed)return false;state.opened=true;return true;}
 function chooseTheme(state,id){if(!canWrite(state)||!THEMES.some(t=>t.id===id))return false;state.theme=id;return true;}
 function seal(state){if(!canWrite(state)||!state.theme)return false;state.sealed=true;return true;}
 function claim(state){if(state.claimed||!ready(state))return false;state.claimed=true;return true;}
 function progress(state){return Number(state.arrived)+Number(state.talked)+Number(state.claimed);}
 function next(state){return !state.arrived?'arrival':!state.talked?'talk':!state.opened?'open':!state.theme?'theme':!state.sealed?'seal':!state.claimed?'thank':'next';}
 return{THEMES,fresh,restore,arrive,meet,openNotebook,chooseTheme,seal,claim,canWrite,ready,progress,next};
});
