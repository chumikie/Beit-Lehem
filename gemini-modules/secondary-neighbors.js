
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
    {id:'recado',label:'Escrever um recado gentil',reply:'“Volte quando puder.” Téo lê a mensagem e a guarda com carinho.'}]},
  {id:'celina',name:'Celina',hub:'mercado',variant:14,tone:'#b88f74',icon:'🍊',role:'A curiosa dos sabores',
   morning:'observa as frutas e imagina combinações de sabores',afternoon:'anota receitas inventadas num bloquinho',
   greeting:'Uma receita também pode ser uma lembrança. Hoje estou inventando uma bem colorida!',
   options:[{id:'sabores',label:'🍊 Imaginar uma combinação de frutas',reply:'Celina imagina uma mistura de frutas e ri: “Essa merece um nome bem bonito!”'},
    {id:'receita',label:'📒 Conversar sobre receitas de família',reply:'“Cada família tem seu jeitinho”, diz Celina. Vocês trocam ideias sem atribuir receitas a ninguém da cidade.'}]},
  {id:'davi',name:'Davi',hub:'igreja',variant:15,tone:'#89a6b8',icon:'🎵',role:'Amigo dos sons da rua',
   morning:'escuta os sons tranquilos do começo do dia',afternoon:'marca ritmos leves com as mãos',
   greeting:'Às vezes a rua parece ter uma música só dela. Você já parou para escutar?',
   options:[{id:'ritmo',label:'🎵 Inventar um ritmo suave',reply:'Davi acompanha duas batidas baixinho: “Pronto, uma música só nossa!”'},
    {id:'escuta',label:'👂 Prestar atenção aos sons ao redor',reply:'Vocês ficam em silêncio por um instante, percebendo os passos ilustrativos da cidade.'}]},
  {id:'iris',name:'Íris',hub:'igreja',variant:17,tone:'#b4a0c4',icon:'🍃',role:'Observadora da luz e do vento',
   morning:'repara na brisa e na claridade das ruas',afternoon:'observa as mudanças de sombra no passeio',
   greeting:'Tem dia que a mesma rua parece outra só porque a luz mudou.',
   options:[{id:'vento',label:'🍃 Fazer uma pausa para sentir a brisa',reply:'Íris sorri: “É bom ter um minuto sem pressa.”'},
    {id:'luz',label:'☀ Observar a claridade do caminho',reply:'Vocês observam o desenho da luz sobre o chão, sem registrar um acontecimento inventado.'}]},
  {id:'noel',name:'Noel',hub:'rodoviaria',variant:19,tone:'#9caa79',icon:'🧳',role:'Colecionador de caminhos imaginados',
   morning:'organiza no caderno nomes de lugares que gostaria de conhecer',afternoon:'descansa e pensa nos caminhos de volta',
   greeting:'Viajar pode começar com uma pergunta: para onde você gostaria de passear?',
   options:[{id:'destino',label:'🧳 Imaginar um passeio',reply:'Noel desenha um caminho fictício no caderno: “Um dia a gente inventa outras paradas.”'},
    {id:'volta',label:'🏡 Conversar sobre voltar para casa',reply:'“Às vezes o melhor da viagem é reconhecer o caminho de volta”, diz Noel.'}]},
  {id:'breno',name:'Breno',hub:'missao:0',variant:21,tone:'#85a99a',icon:'👟',role:'Companheiro de caminhadas',
   morning:'caminha com calma e conta os passos',afternoon:'faz uma pausa para alongar os braços',
   greeting:'Uma voltinha já muda meu dia. E você, gosta mais de andar cedo ou à tardinha?',
   options:[{id:'passos',label:'👟 Conversar sobre caminhadas',reply:'Breno sorri: “O importante é encontrar um ritmo bom para a gente.”'},
    {id:'pausa',label:'🌿 Fazer uma pausa no passeio',reply:'Vocês param por um instante no caminho mapeado, sem sair da rua.'}]},
  {id:'amelia',name:'Amélia',hub:'missao:1',variant:22,tone:'#c19b9a',icon:'📚',role:'Leitora de palavras bonitas',
   morning:'lê algumas linhas do próprio caderno',afternoon:'imagina pequenos versos sobre a cidade',
   greeting:'Gosto de inventar versos. Nenhum precisa ser perfeito para guardar um sentimento.',
   options:[{id:'verso',label:'📚 Inventar um versinho',reply:'Amélia inventa uma frase sobre o vento: “Essa fica no nosso caderno imaginário!”'},
    {id:'palavra',label:'✿ Escolher uma palavra para hoje',reply:'“Acolhimento”, escolhe Amélia. “É uma palavra que dá vontade de voltar.”'}]},
  {id:'nina',name:'Nina',hub:'missao:2',variant:23,tone:'#9fadd0',icon:'🐦',role:'Observadora de passarinhos ilustrativos',
   morning:'observa o céu e escuta pássaros imaginados',afternoon:'anota as cores que percebe no horizonte',
   greeting:'Eu gosto de olhar para cima, mas sempre fico no caminho. O céu muda sem avisar.',
   options:[{id:'ceu',label:'🐦 Contemplar o céu',reply:'Nina observa as nuvens ilustrativas: “Cada dia tem um desenho diferente!”'},
    {id:'cores',label:'🎨 Imaginar cores de pássaros',reply:'Vocês inventam cores para um passarinho de papel, sem identificar espécies reais.'}]},
  {id:'otavio',name:'Otávio',hub:'missao:0',variant:25,tone:'#ada185',icon:'♟️',role:'Amigo dos jogos de raciocínio',
   morning:'inventa desafios de lógica enquanto caminha',afternoon:'imagina movimentos de um jogo de tabuleiro',
   greeting:'Gosto de pensar nas escolhas, mas não precisa ter pressa para acertar.',
   options:[{id:'jogo',label:'♟️ Imaginar uma jogada',reply:'Otávio pensa um instante: “Essa jogada foi esperta, hein?”'},
    {id:'escolha',label:'◇ Conversar sobre decisões',reply:'“Às vezes mudar de ideia faz parte do jogo”, comenta Otávio.'}]},
  {id:'rute',name:'Rute',hub:'missao:1',variant:26,tone:'#b1a0c6',icon:'📷',role:'Colecionadora de enquadramentos imaginados',
   morning:'observa ângulos e sombras das ruas',afternoon:'descreve imagens que gostaria de desenhar',
   greeting:'Gosto de reparar nos pequenos detalhes. Eles cabem numa fotografia imaginada.',
   options:[{id:'quadro',label:'📷 Imaginar um enquadramento',reply:'Rute escolhe um recorte da paisagem sem afirmar que tirou uma foto real.'},
    {id:'detalhe',label:'👀 Escolher um detalhe para observar',reply:'“Olha como a luz muda a cor desse caminho”, diz Rute.'}]},
  {id:'luma',name:'Luma',hub:'rua:Rua Clovis Bezerra',variant:28,tone:'#9b9acb',icon:'🌙',role:'Curiosa do céu noturno ilustrativo',
   morning:'imagina desenhos de estrelas no caderno',afternoon:'observa as cores do céu ao entardecer',
   greeting:'Gosto de inventar constelações no papel. O céu de verdade tem muito mais mistérios.',
   options:[{id:'estrelas',label:'🌙 Imaginar uma constelação',reply:'Luma liga pontinhos num desenho fictício: “Parece um caminho para casa!”'},
    {id:'tarde',label:'🌅 Conversar sobre o anoitecer',reply:'“A luz muda devagar e a gente quase não percebe”, comenta Luma.'}]},
  {id:'tobias',name:'Tobias',hub:'rua:Rua Nunes',variant:29,tone:'#8fb2a0',icon:'🪁',role:'Inventor de pipas de papel',
   morning:'imagina formas de pipas no caderno',afternoon:'observa a direção da brisa na rua',
   greeting:'Uma pipa de papel começa com uma boa ideia. Nem precisa levantar voo de verdade.',
   options:[{id:'pipa',label:'🪁 Imaginar uma pipa colorida',reply:'Tobias desenha uma pipa fictícia e escolhe duas cores bem alegres.'},
    {id:'vento',label:'🍃 Conversar sobre o vento',reply:'“Melhor observar a brisa daqui mesmo”, diz Tobias, permanecendo no caminho.'}]},
  {id:'marta',name:'Marta',hub:'rua:Rua Antônio Borges de Lima',variant:30,tone:'#bf9f87',icon:'🧩',role:'Criadora de pequenos quebra-cabeças',
   morning:'imagina jogos de encaixar formas',afternoon:'desenha peças geométricas no bloquinho',
   greeting:'Quando duas peças se encontram, parece que uma história ficou completa.',
   options:[{id:'pecas',label:'🧩 Imaginar duas peças',reply:'Marta desenha duas formas que se encaixam: “Pronto, uma descoberta pequenininha!”'},
    {id:'formas',label:'◇ Procurar formas na paisagem',reply:'Vocês reparam em linhas e círculos das ilustrações, sem alterar as construções.'}]},
  {id:'gil',name:'Gil',hub:'rua:Rua Feliciano Pedrosa',variant:31,tone:'#a6ad7d',icon:'🕺',role:'Amigo das danças discretas',
   morning:'marca passos suaves enquanto passeia',afternoon:'imagina uma coreografia curta',
   greeting:'Dois passinhos e um sorriso já fazem meu dia ficar mais leve.',
   options:[{id:'passos',label:'🕺 Inventar dois passinhos',reply:'Gil marca um ritmo baixinho no lugar: “Sem atrapalhar quem está passando!”'},
    {id:'pausa',label:'♡ Conversar sobre dançar com calma',reply:'“Não precisa de palco; às vezes a alegria cabe num gesto”, diz Gil.'}]}
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
   def.id==='celina'?(minute>=7*60+30&&minute<11*60||minute>=15*60&&minute<17*60):
   def.id==='davi'?(minute>=9*60&&minute<12*60||minute>=16*60&&minute<19*60):
   def.id==='iris'?(minute>=7*60&&minute<10*60||minute>=15*60&&minute<18*60):
   def.id==='noel'?(minute>=10*60&&minute<12*60||minute>=16*60&&minute<20*60):
   def.id==='breno'?(minute>=7*60&&minute<10*60+30||minute>=16*60&&minute<18*60):
   def.id==='amelia'?(minute>=9*60&&minute<12*60||minute>=15*60&&minute<18*60):
   def.id==='nina'?(minute>=7*60+30&&minute<11*60||minute>=15*60&&minute<17*60):
   def.id==='otavio'?(minute>=10*60&&minute<12*60||minute>=17*60&&minute<20*60):
   def.id==='rute'?(minute>=8*60&&minute<11*60||minute>=14*60&&minute<17*60):
   def.id==='luma'?(minute>=9*60&&minute<11*60||minute>=17*60&&minute<21*60):
   def.id==='tobias'?(minute>=8*60&&minute<11*60||minute>=15*60&&minute<18*60):
   def.id==='marta'?(minute>=10*60&&minute<12*60||minute>=15*60&&minute<19*60):
   def.id==='gil'?(minute>=7*60+30&&minute<10*60||minute>=16*60&&minute<19*60):
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

