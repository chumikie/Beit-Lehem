
/* Fictional neighbors: daily presence, small gestures and persistent memories.
   No placement claims a verified business, home or workplace in Belém/PB. */
(function(root){
 'use strict';
 const RESIDENTS=Object.freeze([
  {id:'cica',name:'Ciça',hub:'mercado',variant:6,tone:'#77a39b',icon:'🧵',role:'A artesã das fitas',
   morning:'separa fitas e dobra tecidos',afternoon:'ajeita cores para a próxima manhã',
   greeting:'Bom dia! Uma fita só ganha graça quando encontra a cor certa.',
   options:[{id:'fitas',label:'Ajudar a organizar as fitas',reply:'Ciça abre um sorriso e arruma as fitas por cor. “Agora dá gosto de olhar!”'},
    {id:'cores',label:'Escolher uma combinação de cores',reply:'“Sálvia e terracota combinam com o nosso passeio”, diz Ciça, mostrando duas fitas.'},
    {id:'banca',label:'🎀 Preparar uma fita para a banca de Francisco',reply:'“Francisco vai gostar desta fita!”, diz Ciça, separando um laço para a banca que vocês arrumaram.'}]},
  {id:'nara',name:'Nara',hub:'igreja',variant:7,tone:'#b99ab3',icon:'✏️',role:'A desenhista de janelas',
   morning:'desenha linhas no seu caderninho',afternoon:'repassa os traços das fachadas',
   greeting:'Toda janela tem uma forma bonita. Gosto de imaginar as histórias atrás delas.',
   options:[{id:'desenho',label:'Desenhar uma janelinha junto',reply:'Nara acrescenta uma janela de arco ao seu caderno. “Olha só como ficou acolhedora!”'},
    {id:'sombra',label:'Observar a luz das fachadas',reply:'“A sombra muda tudo ao longo do dia”, conta Nara, pintando uma página de dourado.'},
    {id:'janela-bia',label:'✏️ Desenhar uma janela para a carta de Bia',reply:'Nara desenha uma janela aberta ao lado da carta: “Para lembrar que sempre existe um caminho de volta.”'},
    {id:'paisagem-bia',label:'🌿 Desenhar a paisagem que Bia quer conhecer',reply:'Nara pinta um horizonte delicado: “Os sonhos também precisam de espaço no papel.”'}]},
  {id:'rosa',name:'Dona Rosa',hub:'sonho_doce',variant:10,tone:'#b78483',icon:'☕',role:'Vizinha das conversas tranquilas',
   morning:'observa o movimento e ajeita um pequeno caderno',afternoon:'descansa e troca notícias com quem passa',
   greeting:'Eu gosto de uma conversa sem pressa. As crianças me chamam de Tia Rosa; sempre tem uma história bonita nas ruas.',
   options:[{id:'prosa',label:'☕ Fazer uma pausa para conversar',reply:'Rosa escuta com atenção e diz: “Às vezes a melhor descoberta é ter tempo para alguém.”'},
    {id:'caderno',label:'📒 Anotar uma lembrança do passeio',reply:'Rosa abre o caderno e guarda uma frase sobre o dia: “Essa eu não quero esquecer.”'}]},
  {id:'zeca',name:'Zeca',hub:'escola_anita',variant:11,tone:'#88a386',icon:'🪴',role:'Vizinho que gosta de plantas',
   morning:'observa vasos e folhas perto do caminho',afternoon:'descansa à sombra e conversa sobre o quintal',
   greeting:'Planta e amizade têm uma coisa parecida: as duas melhoram com cuidado.',
   options:[{id:'vasos',label:'🪴 Conversar sobre os vasos',reply:'Zeca ajeita uma folhinha e sorri: “Cada vaso guarda um pouquinho de paciência.”'},
    {id:'sementes',label:'🌱 Trocar uma dica de plantio',reply:'Zeca conta uma dica imaginada de jardim e agradece a companhia.'},
    {id:'muda-lucia',label:'🌷 Contar da muda cuidada com Lúcia',reply:'“Lúcia vai gostar de saber que você voltou para olhar a planta”, diz Zeca, contente.'}]},
  {id:'mila',name:'Mila',hub:'bar_prosa',variant:12,tone:'#c394a6',icon:'🎨',role:'Criadora de cores e pequenos desenhos',
   morning:'reúne ideias e combina cores no caderno',afternoon:'observa detalhes de fachadas e tecidos',
   greeting:'Uma cor muda o jeito da gente lembrar de um dia. Qual foi a sua preferida hoje?',
   options:[{id:'cores',label:'🎨 Escolher uma cor para o caderno',reply:'Mila desenha uma pequena faixa colorida: “Essa combina com o nosso passeio.”'},
    {id:'tecidos',label:'🧵 Conversar sobre estampas',reply:'Mila mistura duas estampas imaginárias e ri: “Cada uma conta uma história!”'},
    {id:'amigas',label:'♡ Juntar uma ideia de Ciça e Nara',reply:'Mila imagina uma fita desenhada como uma janela: “Ciça e Nara iam adorar essa mistura!”'}]},
  {id:'teo',name:'Téo',hub:'rodoviaria',variant:8,tone:'#85a0c5',icon:'✉️',role:'O colecionador de recados',
   morning:'confere seu pequeno maço de bilhetes',afternoon:'reorganiza papéis e memórias',
   greeting:'Gosto de guardar recados de quem chega e de quem vai. Nenhuma partida precisa apagar uma amizade.',
   options:[{id:'envelope',label:'Ajudar a separar envelopes',reply:'Téo alinha os envelopes e coloca um coração no de cima. “Pronto, ninguém se perde!”'},
    {id:'recado',label:'Escrever um recado gentil',reply:'“Volte quando puder.” Téo lê a mensagem e a guarda com carinho.'}]}
 ]);
 const coreProgress=state=>['cica','nara','teo'].filter(id=>state?.seen?.includes(id)).length;
 const fresh=()=>({seen:[],lastHelp:{},choices:{},recados:{stage:0},connections:{damiaoTeo:false,biaTeo:false,zecaLucia:false,zecaLuciaDay:0},marketLegacy:{kind:null,day:0}});
 function restore(raw){
  const state=fresh();if(!raw||typeof raw!=='object')return state;
  state.seen=Array.isArray(raw.seen)?RESIDENTS.map(r=>r.id).filter(id=>raw.seen.includes(id)):[];
  for(const def of RESIDENTS){const day=Number(raw.lastHelp?.[def.id]);if(Number.isInteger(day)&&day>=1&&day<=100000)state.lastHelp[def.id]=day;
   if(def.options.some(o=>o.id===raw.choices?.[def.id]))state.choices[def.id]=raw.choices[def.id];}
  const stage=Number(raw.recados?.stage);
  if(Number.isInteger(stage)&&stage>=0&&stage<=3)state.recados.stage=stage;
  for(const key of ['damiaoTeo','biaTeo'])state.connections[key]=raw.connections?.[key]===true;
  state.connections.zecaLucia=raw.connections?.zecaLucia===true||state.choices.zeca==='muda-lucia';
  const zecaDay=Number(raw.connections?.zecaLuciaDay);
  if(Number.isInteger(zecaDay)&&zecaDay>=1&&zecaDay<=9999)state.connections.zecaLuciaDay=zecaDay;
  if(['fita','conversa'].includes(raw.marketLegacy?.kind)){
   const day=Number(raw.marketLegacy?.day);
   if(Number.isInteger(day)&&day>=1&&day<=9999)state.marketLegacy={kind:raw.marketLegacy.kind,day};
  }
  return state;
 }
 function rememberFairChoice(state,kind,day){
  if(!state||!['fita','conversa'].includes(kind)||!Number.isInteger(day)||day<1||day>9999)return false;
  if(['fita','conversa'].includes(state.marketLegacy?.kind))return false;
  state.marketLegacy={kind,day};return true;
 }
 function fairMemoryLine(state,person){
  const kind=state?.marketLegacy?.kind;
  if(kind==='fita')return person==='damiao'?'Francisco reconhece a fita preparada com Ciça: “Essa cor ficou na memória da feira.”':person==='cica'?'Ciça lembra do laço que vocês prepararam para a banca de Francisco.':'';
  if(kind==='conversa')return person==='damiao'?'Francisco lembra da conversa sem pressa que vocês tiveram depois de arrumar a banca.':person==='cica'?'Ciça comenta: “Francisco gostou tanto daquela conversa tranquila na feira.”':'';
  return '';
 }
 // The following-day reply is derived solely from a saved help choice.
 // It does not create a new memory, reward, or assertion of an unseen event.
 const NEXT_DAY_REPLIES={
  cica:{fitas:'As fitas que organizamos ontem continuam bem arrumadinhas. Obrigada!',cores:'Ainda estou pensando nas cores que escolhemos ontem.',banca:'A fita que preparamos ontem ficou guardada com carinho.'},
  nara:{desenho:'Voltei a olhar a janelinha que desenhamos ontem.',sombra:'A luz de hoje me fez lembrar das sombras que observamos ontem.','janela-bia':'Guardei o desenho da janela que fizemos ontem para a carta de Bia.','paisagem-bia':'Ainda lembro da paisagem que desenhamos ontem para os planos de Bia.'}
 };
 function nextDayReply(state,clock,id){
  const day=Number(clock?.day),last=state?.lastHelp?.[id],choice=state?.choices?.[id];
  if(!Number.isInteger(day)||!Number.isInteger(last)||day!==last+1)return '';
  return NEXT_DAY_REPLIES[id]?.[choice]||'';
 }
 function rememberConnection(state,key){
  if(!['damiaoTeo','biaTeo'].includes(key)||!state||typeof state!=='object')return false;
  state.connections=state.connections||{damiaoTeo:false,biaTeo:false};
  if(state.connections[key])return false;
  state.connections[key]=true;return true;
 }
 const RECADOS=Object.freeze([
  {id:'teo',choice:'recado',label:'✉️ Receber um recado de Téo',hub:'rodoviaria',story:'Téo confia a você um bilhete fictício para Rosa: uma pequena saudade que encontrou palavras.'},
  {id:'rosa',choice:'caderno',label:'☕ Ouvir a resposta de Rosa',hub:'sonho_doce',story:'Rosa lê o bilhete e escreve no caderno: “A amizade também sabe esperar.” Ela pede que você conte isso a Téo.'},
  {id:'teo',choice:'envelope',label:'✉️ Voltar com o recado a Téo',hub:'rodoviaria',story:'Téo guarda a resposta num envelope desenhado. “Agora esta lembrança tem caminho de ida e volta.”'}
 ]);
 function recadoStage(state){const n=Number(state?.recados?.stage);return Number.isInteger(n)?Math.max(0,Math.min(3,n)):0;}
 function recadoLine(state,id){
  const stage=recadoStage(state);
  if(id==='teo'&&stage===1)return 'Téo se lembra do bilhete que confiou a você. Rosa talvez tenha uma resposta.';
  if(id==='teo'&&stage===2)return 'Téo olha para o caminho: “Você conseguiu encontrar Rosa? Quero guardar a resposta.”';
  if(id==='rosa'&&stage>=2)return 'Rosa sorri: “Espero que Téo tenha guardado nossa conversa com carinho.”';
  if(id==='teo'&&stage===3)return 'Téo reconhece você: “Nosso recado já fez sua viagem de volta.”';
  return '';
 }
 // Day and hour are deliberately fictional; anchors are existing OSM landmark routes.
 // Fictional weekly variations; never claims residents' real schedules.
 const WEEKLY_ROUTINES={
  cica:{morning:['separa fitas para o passeio','confere as cores no caderno','dobra tecidos com calma'],afternoon:['observa as cores da feira','organiza as fitas que levou','descansa e escolhe uma combinação de tons']},
  nara:{morning:['esboça uma janela no caderno','observa a luz sobre as fachadas','compara desenhos de portas'],afternoon:['repassa os traços que guardou','descansa e observa as sombras','imagina novas formas para o caderno']},
  rosa:{morning:['observa o movimento e anota uma história','organiza seu caderninho de conversas','cumprimenta quem passa sem pressa'],afternoon:['faz uma pausa e relembra uma visita','procura uma frase bonita para guardar','descansa e troca notícias com conhecidos']},
  zeca:{morning:['confere as folhas de um vaso ilustrativo','observa a sombra sobre as plantas','separa ideias para cuidar de uma muda'],afternoon:['descansa e conta histórias de jardins','repara nas plantas ao longo do caminho','conversa sobre os cuidados do quintal']},
  mila:{morning:['experimenta cores no caderno','desenha formas de portas e janelas','separa ideias de fitas e tecidos'],afternoon:['observa padrões nas fachadas','compara cores de pequenos desenhos','imagina uma estampa para as amigas']}
 };
 function weeklyActivity(clock,def){
  const scenes=WEEKLY_ROUTINES[def.id];
  if(!scenes)return null;
  const weekday=(((Number(clock?.day)||1)-1)%7+7)%7;
  const morning=(Number(clock?.minute)||0)<12*60;
  return scenes[morning?'morning':'afternoon'][weekday%3];
 }
 function agenda(clock,def){
  const community=root?.RoncadorStreetCommunity?.agenda(clock,def.id);
  if(community)return community.present&&weeklyActivity(clock,def)?{...community,activity:weeklyActivity(clock,def)}:community;
  const minute=Math.max(0,Math.min(1440,Number(clock?.minute)||0));
  const weekday=((Number(clock?.day)||1)-1)%7;
  const open=def.id==='cica'?(minute>=8*60&&minute<18*60):
   def.id==='nara'?(minute>=8*60&&minute<18*60):
   def.id==='zeca'?(minute>=7*60+30&&minute<11*60+30||minute>=15*60&&minute<17*60+30):
   def.id==='mila'?(minute>=9*60&&minute<12*60||minute>=14*60&&minute<19*60):
   (minute>=8*60&&minute<12*60||minute>=14*60&&minute<18*60);
  if(!open || (def.id==='cica'&&weekday===6))return{present:false,activity:'descansando'};
  const morning=minute<12*60;
  return {present:true,hub:def.hub,activity:weeklyActivity(clock,def)||(morning?def.morning:def.afternoon),walking:minute%30<22};
 }
 // Mila occasionally follows a longer stretch of her EXISTING road itinerary,
 // pauses to observe, then rejoins her usual walk. No new POI, path or save key.
 function smallWalk(clock,def,duty){
  if(def?.id!=='mila'||!duty?.present||duty.meeting||duty.community||duty.travel||duty.encounter)return null;
  const day=Number(clock?.day),minute=Number(clock?.minute);
  if(!Number.isInteger(day)||!Number.isFinite(minute)||day%3!==1)return null;
  const phase=minute-(16*60+20);
  if(phase<0||phase>=16)return null;
  // The extra distance grows and shrinks continuously; only existing sampled
  // road vertices are used by the caller. During the pause the feet stay put.
  const offset=phase<6?phase/6*72:phase<9?72:72*(1-(phase-9)/7);
  return {offset,paused:phase>=6&&phase<9,stage:phase<6?'outbound':phase<9?'observe':'return'};
 }
 function availableOptions(def,context={}){
  return def?.options?.filter(choice=>{
   if(choice.id==='banca')return def.id==='cica'&&context.marketMorning?.claimed===true;
   if(choice.id==='janela-bia'||choice.id==='paisagem-bia')return def.id==='nara'&&context.biaLetters?.claimed===true;
   if(choice.id==='muda-lucia')return def.id==='zeca'&&context.luciaGarden?.claimed===true;
   if(choice.id==='amigas')return def.id==='mila'&&Boolean(context.sideNeighbors?.choices?.cica)&&Boolean(context.sideNeighbors?.choices?.nara);
   return true;
  })||[];
 }
 function interact(state,clock,id,choiceId,context={}){
  const def=RESIDENTS.find(r=>r.id===id),choice=def?.options.find(o=>o.id===choiceId);
  if(!def||!choice)return{ok:false,reason:'Escolha indisponível.'};
  if(!availableOptions(def,context).some(option=>option.id===choiceId))return{ok:false,reason:id==='nara'?'Conclua primeiro a carta com Bia para compartilhar esse desenho.':id==='zeca'?'Conclua primeiro o cuidado da muda com Lúcia.':id==='mila'?'Conheça primeiro as atividades de Ciça e Nara.':'Conclua primeiro a manhã com Francisco para preparar a fita da banca.'};
  if(!agenda(clock,def).present)return{ok:false,reason:'Essa pessoa já seguiu sua rotina. Volte em outro horário.'};
  if(state.lastHelp[id]===clock.day)return{ok:false,reason:'Vocês já compartilharam uma gentileza hoje. Amanhã haverá outro encontro.'};
  state.lastHelp[id]=clock.day;state.choices[id]=choiceId;
  if(id==='zeca'&&choiceId==='muda-lucia'){
   state.connections=state.connections||fresh().connections;
   state.connections.zecaLucia=true;state.connections.zecaLuciaDay=clock.day;
  }
  const first=!state.seen.includes(id);if(first)state.seen.push(id);
  const stage=recadoStage(state),step=RECADOS[stage];
  const threadAdvanced=!!step&&step.id===id&&step.choice===choiceId;
  if(threadAdvanced){state.recados=state.recados||{stage:0};state.recados.stage=stage+1;}
  return{ok:true,first,reply:choice.reply+(threadAdvanced?' ✉️ '+step.story:''),unlocked:coreProgress(state)===3,threadAdvanced,threadComplete:threadAdvanced&&stage===2};
 }
 root.RoncadorSecondaryNeighbors={RESIDENTS,RECADOS,fresh,restore,agenda,smallWalk,availableOptions,coreProgress,interact,recadoStage,recadoLine,rememberConnection,rememberFairChoice,fairMemoryLine,nextDayReply};
})(typeof window!=='undefined'?window:globalThis);

