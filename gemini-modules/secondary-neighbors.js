
/* Three fictional neighbors: daily presence, small gestures and persistent memories.
   No placement claims a verified business, home or workplace in Belém/PB. */
(function(root){
 'use strict';
 const RESIDENTS=Object.freeze([
  {id:'cica',name:'Ciça',hub:'mercado',variant:6,tone:'#77a39b',icon:'🧵',role:'A artesã das fitas',
   morning:'separa fitas e dobra tecidos',afternoon:'ajeita cores para a próxima manhã',
   greeting:'Bom dia! Uma fita só ganha graça quando encontra a cor certa.',
   options:[{id:'fitas',label:'Ajudar a organizar as fitas',reply:'Ciça abre um sorriso e arruma as fitas por cor. “Agora dá gosto de olhar!”'},
    {id:'cores',label:'Escolher uma combinação de cores',reply:'“Sálvia e terracota combinam com o nosso passeio”, diz Ciça, mostrando duas fitas.'},
    {id:'banca',label:'🎀 Preparar uma fita para a banca de Damião',reply:'“Damião vai gostar desta fita!”, diz Ciça, separando um laço para a banca que vocês arrumaram.'}]},
  {id:'nara',name:'Nara',hub:'igreja',variant:7,tone:'#b99ab3',icon:'✏️',role:'A desenhista de janelas',
   morning:'desenha linhas no seu caderninho',afternoon:'repassa os traços das fachadas',
   greeting:'Toda janela tem uma forma bonita. Gosto de imaginar as histórias atrás delas.',
   options:[{id:'desenho',label:'Desenhar uma janelinha junto',reply:'Nara acrescenta uma janela de arco ao seu caderno. “Olha só como ficou acolhedora!”'},
    {id:'sombra',label:'Observar a luz das fachadas',reply:'“A sombra muda tudo ao longo do dia”, conta Nara, pintando uma página de dourado.'},
    {id:'janela-bia',label:'✏️ Desenhar uma janela para a carta de Bia',reply:'Nara desenha uma janela aberta ao lado da carta: “Para lembrar que sempre existe um caminho de volta.”'},
    {id:'paisagem-bia',label:'🌿 Desenhar a paisagem que Bia quer conhecer',reply:'Nara pinta um horizonte delicado: “Os sonhos também precisam de espaço no papel.”'}]},
  {id:'rosa',name:'Rosa',hub:'sonho_doce',variant:10,tone:'#b78483',icon:'☕',role:'Vizinha das conversas tranquilas',
   morning:'observa o movimento e ajeita um pequeno caderno',afternoon:'descansa e troca notícias com quem passa',
   greeting:'Eu gosto de uma conversa sem pressa. Sempre tem uma história bonita nas ruas.',
   options:[{id:'prosa',label:'☕ Fazer uma pausa para conversar',reply:'Rosa escuta com atenção e diz: “Às vezes a melhor descoberta é ter tempo para alguém.”'},
    {id:'caderno',label:'📒 Anotar uma lembrança do passeio',reply:'Rosa abre o caderno e guarda uma frase sobre o dia: “Essa eu não quero esquecer.”'}]},
  {id:'teo',name:'Téo',hub:'rodoviaria',variant:8,tone:'#85a0c5',icon:'✉️',role:'O colecionador de recados',
   morning:'confere seu pequeno maço de bilhetes',afternoon:'reorganiza papéis e memórias',
   greeting:'Gosto de guardar recados de quem chega e de quem vai. Nenhuma partida precisa apagar uma amizade.',
   options:[{id:'envelope',label:'Ajudar a separar envelopes',reply:'Téo alinha os envelopes e coloca um coração no de cima. “Pronto, ninguém se perde!”'},
    {id:'recado',label:'Escrever um recado gentil',reply:'“Volte quando puder.” Téo lê a mensagem e a guarda com carinho.'}]}
 ]);
 const coreProgress=state=>['cica','nara','teo'].filter(id=>state?.seen?.includes(id)).length;
 const fresh=()=>({seen:[],lastHelp:{},choices:{}});
 function restore(raw){
  const state=fresh();if(!raw||typeof raw!=='object')return state;
  state.seen=Array.isArray(raw.seen)?RESIDENTS.map(r=>r.id).filter(id=>raw.seen.includes(id)):[];
  for(const def of RESIDENTS){const day=Number(raw.lastHelp?.[def.id]);if(Number.isInteger(day)&&day>=1&&day<=100000)state.lastHelp[def.id]=day;
   if(def.options.some(o=>o.id===raw.choices?.[def.id]))state.choices[def.id]=raw.choices[def.id];}
  return state;
 }
 // Day and hour are deliberately fictional; anchors are existing OSM landmark routes.
 function agenda(clock,def){
  const community=root?.RoncadorStreetCommunity?.agenda(clock,def.id);
  if(community)return community;
  const minute=Math.max(0,Math.min(1440,Number(clock?.minute)||0));
  const weekday=((Number(clock?.day)||1)-1)%7;
  const open=minute>=8*60&&minute<12*60 || minute>=14*60&&minute<18*60;
  if(!open || (def.id==='cica'&&weekday===6))return{present:false,activity:'descansando'};
  const morning=minute<12*60;
  return {present:true,hub:def.hub,activity:morning?def.morning:def.afternoon,walking:minute%60<18};
 }
 function availableOptions(def,context={}){
  return def?.options?.filter(choice=>{
   if(choice.id==='banca')return def.id==='cica'&&context.marketMorning?.claimed===true;
   if(choice.id==='janela-bia'||choice.id==='paisagem-bia')return def.id==='nara'&&context.biaLetters?.claimed===true;
   return true;
  })||[];
 }
 function interact(state,clock,id,choiceId,context={}){
  const def=RESIDENTS.find(r=>r.id===id),choice=def?.options.find(o=>o.id===choiceId);
  if(!def||!choice)return{ok:false,reason:'Escolha indisponível.'};
  if(!availableOptions(def,context).some(option=>option.id===choiceId))return{ok:false,reason:id==='nara'?'Conclua primeiro a carta com Bia para compartilhar esse desenho.':'Conclua primeiro a manhã com Damião para preparar a fita da banca.'};
  if(!agenda(clock,def).present)return{ok:false,reason:'Essa pessoa já seguiu sua rotina. Volte em outro horário.'};
  if(state.lastHelp[id]===clock.day)return{ok:false,reason:'Vocês já compartilharam uma gentileza hoje. Amanhã haverá outro encontro.'};
  state.lastHelp[id]=clock.day;state.choices[id]=choiceId;
  const first=!state.seen.includes(id);if(first)state.seen.push(id);
  return{ok:true,first,reply:choice.reply,unlocked:coreProgress(state)===3};
 }
 root.RoncadorSecondaryNeighbors={RESIDENTS,fresh,restore,agenda,availableOptions,coreProgress,interact};
})(typeof window!=='undefined'?window:globalThis);

