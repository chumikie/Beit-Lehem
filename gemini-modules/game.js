
'use strict';
(()=>{
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),mini=$('minimap'),mc=mini.getContext('2d'),big=$('bigmap'),bc=big.getContext('2d');
const STORE='roncador-expedition-v2-referencias-gemini',keys=new Set(),touches=new Map(),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
let data,roads=[],segments=[],houses=[],labels=[],areas=[],missions=[],player={x:0,y:0,dir:1,moving:false},camera={x:0,y:0},zoom=matchMedia('(max-width:800px)').matches?1.85:2.3,w=0,h=0,dpr=1,active=false,paused=false,collected=new Set(),target=0,elapsed=0,last=0,waypoint=null,near=-1,sound=false,audio=null,particles=[],toastTimer,fullMap=false,saveClock=0,uiClock=0,step=0,loaded=false,mapTransform=null,dragStart=null,marketDay=false;
// Source-attributed polygons are inlined during the Gemini preview build.
// This visual overlay never modifies the road graph or saved map source.
const VERIFIED_HYDRO_GEOJSON=null;
let verifiedWater=[];
let waterMemories=[];
let waterTalks=[];
// Histórias preparatórias: não representam entrada ou caminhada na Serra do Camucá.
let camucaStories=[];
let ambientHitTargets=[];
let pathfinder=null,residentMotion=null,streetGreetings=null,guide={x:0,y:0},nearGuide=false,friendship=0,chapter=0,observations=new Set(),photos={};
let nearCulture=null,cultureActiveId=null,cultureNotes={},gardenStep=0,gardenHarvests=0,scenicScenes=[],showScenery=true,festivalCelebrated=false,lightPhase='manha',showWildlife=true,wildlife=[],showGeology=false,geologyPoints=[],streetPaths=new Map(),nearResident=null,fairStalls=[];
let living=window.RoncadorLivingWorld.fresh();
let fairQuest=window.RoncadorCozyQuests.fresh();
let marketMorning=window.RoncadorMarketMorning.fresh();
let marketFruitSlots=Array(6).fill(null),marketScene=null,storageWarning=false,marketWitnessed=false,marketReaction=null,marketStall=null;
let luciaGarden=window.RoncadorLuciaGarden.fresh();
let biaLetters=window.RoncadorBiaLetters.fresh();
let skyMode='sol',rainCare=0;
let floraLayer={greenPolygons:0,points:[]},showGroundedFlora=true,momentsSeen=[],roadDetails=null,terrainData=null,terrainLayer=null,showTerrain=true;
let centralBlocks=[],detailedFacades=true,careResidentId=null,nearSecondary=null,selectedSecondaryId=null,facadeSketches=[],communitySeen=[];
let sideNeighbors=window.RoncadorSecondaryNeighbors.fresh();
const RUA_NOVA_ROADS=['Rua da Cruz','Rua Ramiro Alves','Rua Independência'];
const RUA_NOVA_STORIES={
 'Rua da Cruz':{icon:'✉️',title:'A passagem',memory:'Você parou na Rua da Cruz e guardou a ideia de que toda viagem começa com uma escolha de caminho.',resident:'bia'},
 'Rua Ramiro Alves':{icon:'🌿',title:'O tempo das coisas',memory:'Na Rua Ramiro Alves, você reservou um instante para observar como um lugar pode mudar sem perder suas lembranças.',resident:'lucia'},
 'Rua Independência':{icon:'🧺',title:'O que levamos',memory:'Na Rua Independência, você pensou nas histórias que atravessam a cidade de pessoa em pessoa.',resident:'damiao'}
};
let ruaNovaPaths=[],ruaNovaShared=false,ruaNovaDays={},cityKnowledge={},cityLinks=[],cityConsequences=[];
let cityReports=[];
let weeklyVisitsSeen=[];
let smallWalksSeen=[],smallWalkReports=[];
let friendshipTraditions=[];
let storyEndings=[];
const MICRO_STORIES={damiao:{choice:'sombra',title:'A sombra da feira'},lucia:{choice:'sementes',title:'Sementes de histórias'},bia:{choice:'bilhetes',title:'Uma página de chegadas'}};
let microStories=[],lastJournalDay=1;
const WORLD_MOMENTS={
 mercado:{title:'Uma pausa na feira',icon:'🧺',story:'Você observa o movimento da banca ilustrativa e escuta o ritmo tranquilo da feira. Nenhum objeto real é atribuído a um vendedor.'},
 igreja:{title:'O jardim de passagem',icon:'🌷',story:'Você para perto da Matriz e percebe como plantas e conversas podem tornar uma caminhada mais acolhedora.'},
 rodoviaria:{title:'Entre chegadas e despedidas',icon:'✉️',story:'Você respira devagar perto da Rodoviária e pensa em quantas histórias uma viagem pode carregar.'},
 mato:{title:'Um instante de paisagem',icon:'🌳',story:'Você descansa por um instante perto da área verde identificada como Mato na base cartográfica, observando sem recolher nada.'}
};
let worldMoments=[];
const CAMUCA_STAGES=['chuva','claridade','terra','bia-ouviu','lembranca'];
const CAMUCA_TEXT={
 chuva:'Você observa a vegetação durante o chuvisco ilustrativo, num caminho já existente. A serra continua distante: esta não é a Trilha do Camucá.',
 claridade:'Em outro dia, você volta ao mesmo lugar e encontra a paisagem sob outra luz. A lembrança da chuva mudou seu olhar.',
 terra:'Você conta a Francisco o que observou. Ele fala, numa história fictícia, dos cuidados e ritmos do trabalho rural; não afirma conhecer uma trilha autorizada.',
 'bia-ouviu':'Você conta pessoalmente a Bia sobre o contraste entre chuva e claridade; agora ela conhece essa história porque a ouviu de você.',
 lembranca:'Dias depois, Bia recorda a paisagem que você contou a Francisco e agora compartilha com ela. Seu caderno guarda o relato como conversa, não como uma visita à serra.'
};
const STREET_VIGNETTES={
 'mercado-escuta':{place:'mercado',title:'O som da feira',text:'Entre passos e vozes fictícias, você percebe que a feira também conta histórias quando ninguém pede nada.'},
 'mercado-sorda':{place:'mercado',title:'A Padaria da Tia',text:'Você pensa no pão francês, no pão doce de coco e nas histórias afetivas da Padaria da Tia. Esta cestinha é ilustrativa; a posição da padaria ainda não foi confirmada.'},
 'mercado-cuidado':{place:'mercado',title:'O gesto que ficou',text:'Ao passar novamente pela feira, você se lembra do cuidado que compartilhou com Francisco.'},
 'igreja-memoria':{place:'igreja',title:'A memória da padroeira',text:'Você se lembra do registro cultural da Procissão de Nossa Senhora da Conceição, sem confundir essa lembrança com ter presenciado a celebração.'},
 'igreja-folhas':{place:'igreja',title:'Folhas novas',text:'As primeiras folhas da muda de Lúcia lembram que algumas histórias crescem sem pressa.'},
 'igreja-flor':{place:'igreja',title:'A flor e os dias',text:'A flor que realmente desabrochou no jardim de Lúcia faz você lembrar os dias de cuidado.'},
 'rodoviaria-cartas':{place:'rodoviaria',title:'Palavras que ficam',text:'Perto das viagens, você recorda a carta que escreveu com Bia e aquilo que decidiram guardar.'},
 'mato-chuvisco':{place:'mato',title:'A paisagem na garoa',text:'O chuvisco ilustrativo muda a maneira de olhar a área verde; você observa sem sair do caminho.'},
 'mato-claridade':{place:'mato',title:'Um pouco de claridade',text:'Na luz tranquila, você descobre que a mesma paisagem pode guardar um sentimento diferente.'}
};
let streetVignettes=[];
const EVERYDAY_STORIES={
 'damiao-cestos':{name:'A feira volta',text:'Francisco sorri: “Outro dia lembrei de quando você ajudou por aqui. A gente arruma os cestos, mas as conversas ficam.”'},
 'lucia-tempo':{name:'O tempo da muda',text:'Lúcia olha o jardim: “Lembra de quando cuidamos da muda? Os dias passaram, e o carinho ainda está aqui.”'},
 'bia-reencontro':{name:'Um encontro lembrado',text:'Bia comenta: “Lembra quando você viu nossa visita? Voltei a pensar naquelas palavras depois.”'},
 'rua-clovis-tarde':{name:'Uma tarde na Clovis Bezerra',text:'Você observa o movimento tranquilo da Rua Clovis Bezerra ao entardecer. As conversas de vizinhança são uma cena fictícia inspirada no cotidiano descrito pelo autor.'},
 'rua-nunes-tarde':{name:'A hora da Rua Nunes',text:'Na Rua Nunes, você percebe o ritmo mais calmo do fim da tarde. O caminho é mapeado; a lembrança narrada é fictícia.'},
 'rua-borges-tarde':{name:'Passos na Antônio Borges de Lima',text:'Os passos parecem desacelerar na Rua Antônio Borges de Lima. Você guarda uma memória imaginada do fim do dia, sem atribuí-la a moradores reais.'}
};
let everydayMemories=[];
// Fictional reflection inspired by the documented 2026 São Pedro program;
// the player does not witness the historical festival or visit an invented stage.
const SAO_PEDRO_TALES={
 'ouvido-damiao':{source:'ouvido',text:'Francisco comenta: “Quando penso no São Pedro, lembro das noites de forró e de como é bonito dar espaço aos artistas da própria terra, além das atrações maiores.”'},
 'contado-bia':{source:'compartilhado',text:'Você conta a Bia a lembrança que Francisco compartilhou. Ela sorri: “Vou anotar isso. As músicas da nossa terra também guardam caminhos.”'}
};
let saoPedroTales=[];
// Ficção sobre o trabalho e a panificação, sem atribuir parentesco a pessoas reais.
const BREAD_STORIES={
 'ouvido-damiao':{source:'ouvido',text:'Francisco sorri: “Belém tem nome de casa do pão. O cheiro do pão francês de manhã lembra que muita gente começa a trabalhar antes da cidade acordar.”'},
 'ouvido-lucia':{source:'ouvido',text:'Lúcia conta uma história inventada de família: “Minha tia dizia que alguém lá de casa ajudava a preparar massas e biscoitos. Cada fornada tinha o esforço de muitas mãos.”'},
 'contado-bia':{source:'compartilhado',text:'Você conta a Bia as duas conversas que realmente ouviu. “Vou guardar no caderno: o pão da manhã e o trabalho de gerações fazem parte da memória desta cidade.”'}
};
let breadStories=[];
// Conversas matinais opcionais: fatos vividos ficam no save, nunca atribuídos
// à rotina ou à profissão de pessoas reais de Belém/PB.
const MORNING_GREETING_LINES={
 damiao:['“O pão francês chegando cedinho combina com o movimento da feira.”','“Um pedaço de pão doce de coco torna uma pausa mais gostosa.”','“Rosquinhas e café são uma boa desculpa para cumprimentar os vizinhos.”'],
 lucia:['“O jardim também acorda devagar, como o cheiro de bolo caseiro.”','“Gosto de ver a vizinhança se encontrando antes de começar o dia.”','“O carinho de uma conversa às vezes dura mais do que a manhã.”'],
 bia:['“Antes de abrir o caderno, gosto de observar quem segue seu caminho.”','“Na minha história de hoje, até uma rosquinha pode lembrar uma despedida bonita.”','“Um bom dia é uma mensagem pequena que a gente entrega sem envelope.”']
};
let morningEncounters=[];
// Names match the user's TsuLiPa World catalog. Only Halloween has an
// explicitly experimental local window; other dates await source verification.
const SEASONAL_THEMES={
 natal:{name:'Natal',icon:'🎄',months:[]},
 ano_novo:{name:'Ano Novo',icon:'🥂',months:[]},
 verao:{name:'Verão',icon:'🌞',months:[]},
 valentine:{name:'Valentine',icon:'💝',months:[]},
 outono:{name:'Outono',icon:'🍁',months:[]},
 sakura:{name:'Sakura',icon:'🌸',months:[]},
 inverno:{name:'Inverno',icon:'❄️',months:[]},
 tanabata:{name:'Tanabata',icon:'🎋',months:[]},
 primavera:{name:'Primavera',icon:'🌼',months:[]},
 halloween:{name:'Halloween',icon:'🎃',months:[[10,25,31],[11,1,3]]},
 dia_criancas:{name:'Dia das Crianças',icon:'🎈',months:[]},
 aniversario_brs48:{name:'Aniversário do BRS48',icon:'🎂',months:[]}
};
let seasonalMemories=[];
// A pause is a short-lived pose, not a saved quest or a claim about a mapped bench.
let worldPause=null;
let belemContacts=window.RoncadorBelemContacts.fresh();
let kawaiiState=window.RoncadorKawaiiMoto.fresh(),emojiParticles=[],engineTick=0;
const treeCache=new Map();
// Optional transport/time controls must not cover the opening action on phones.
// These controls remain fully available as soon as the expedition begins.
const openingHudStyle=document.createElement('style');
openingHudStyle.textContent='@media (max-width:800px){.game:has(#welcome:not([hidden])) .kawaii-hud-bar{display:none!important}}';
document.head.appendChild(openingHudStyle);
const mobileHudStyle=document.createElement('style');
mobileHudStyle.textContent='@media (max-width:800px){.sidebar .kawaii-hud-bar{position:static;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:14px 0;padding:10px;border:1px solid #e9dccb;background:#fffaf1;border-radius:13px;max-height:none;overflow:visible;box-shadow:none}.sidebar .kawaii-pill-btn{justify-content:center;min-width:0;white-space:normal;font-size:11px;padding:7px 8px}.sidebar .kawaii-pill-btn kbd{display:none}}';
document.head.appendChild(mobileHudStyle);
// The archived HTML keeps historical IDs; visible labels now refer only to
// fictional bakery gifts, without implying a verified Padaria da Tia address.
$('sordaHudBtn').title='Padaria da Tia · pães e doces ilustrativos';
$('sordaHudCount').textContent='Pães e doces';
$('kawaiiStyleTitle').textContent='Motinha Cozy, Padaria da Tia & Estilo';
$('sordaDialogStatus').previousElementSibling.textContent='🥖 Padaria da Tia & passeios especiais';
$('refillSordaBtn').textContent='🥖 Preparar mais pães e doces na cestinha (+3)';
let saved=null;try{saved=JSON.parse(localStorage.getItem(STORE)||'null');}catch{storageWarning=true;}
const hash=(x,y=0)=>{let n=Math.imul((x|0)^0x9e3779b9,0x85ebca6b)^Math.imul((y|0)^0x7f4a7c15,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967295;};
function affectionSnapshot(id){return window.RoncadorAffectionMemory.snapshot({living,communitySeen,sideNeighbors,marketMorning,luciaGarden,biaLetters,marketWitnessed},id);}
const distance=(a,b)=>Math.hypot(a.x-b[0],a.y-b[1]);
function syncSceneryToggle(){const b=$('sceneryToggle');b.setAttribute('aria-pressed',String(showScenery));b.innerHTML=showScenery?'⌂ <span>Cenários</span>':'◈ <span>Mapa limpo</span>';$('sceneryNote').hidden=!showScenery;}
function syncLightButton(){const b=$('lightButton'),labels={manha:'☀ Manhã →',tarde:'◐ Tarde →',anoitecer:'☾ Anoitecer →'};b.textContent=labels[lightPhase];b.setAttribute('aria-label','Luz ilustrativa: '+lightPhase+'. Alternar para o próximo período.');}
function syncSkyButton(){const b=$('skyMood');b.textContent=window.RoncadorAtmosphere.LABELS[skyMode]+' ↻';b.dataset.sky=skyMode;b.setAttribute('aria-label','Céu fictício: '+window.RoncadorAtmosphere.LABELS[skyMode]+'. Mudar a atmosfera do jogo.');b.title='O céu é uma simulação artística, não uma previsão real.';}
function isMarketMorning(){return window.RoncadorLivingWorld.isMarketMorning(living);}
function fairAtmosphere(){return marketDay||isMarketMorning();}
function syncFairUI(){const automatic=isMarketMorning(),note=$('fairDayNote');note.textContent='🧺 '+(marketMorning.claimed?'Manhã de Francisco completa ✓':'A manhã de Francisco · '+window.RoncadorMarketMorning.progress(marketMorning)+'/3')+' ↗';const status=$('fairStatus');status.textContent=automatic?'✿ Segunda de feira! Barracas ilustrativas aparecem nas ruas do entorno do mercado.':marketDay?'✿ Feira ilustrativa ativada por você, fora do calendário fictício.':'✿ Na manhã de segunda, a feira imaginada transforma o entorno do mercado.';}
function save(){if(!loaded)return;try{localStorage.setItem(STORE,JSON.stringify({v:3,mapSource:data.source,collected:[...collected],player:{x:player.x,y:player.y},elapsed,target,friendship,chapter,observations:[...observations],photos,marketDay,cultureNotes,gardenStep,gardenHarvests,showScenery,festivalCelebrated,lightPhase,showWildlife,showGeology,living,fairQuest,marketMorning,luciaGarden,biaLetters,skyMode,rainCare,showGroundedFlora,showTerrain,momentsSeen,detailedFacades,sideNeighbors,facadeSketches,communitySeen,marketFruitSlots,marketWitnessed,belemContacts,kawaiiState,ruaNovaPaths,ruaNovaShared,ruaNovaDays,cityKnowledge,cityLinks,cityConsequences,cityReports,weeklyVisitsSeen,smallWalksSeen,smallWalkReports,friendshipTraditions,storyEndings,microStories,lastJournalDay,worldMoments,streetVignettes,seasonalMemories,everydayMemories,saoPedroTales,breadStories,morningEncounters,waterMemories,waterTalks,camucaStories}));}catch{storageWarning=true;}}
function notify(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500);}
function note(freq=440,delay=0,length=.12){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+length);}catch{}}
function pointSegment(x,y,s){let t=Math.max(0,Math.min(1,((x-s.ax)*s.dx+(y-s.ay)*s.dy)/s.len2));let px=s.ax+t*s.dx,py=s.ay+t*s.dy;return{d:Math.hypot(x-px,y-py),x:px,y:py,t};}
function nearestRoad(x,y){let best={d:Infinity,s:null};for(const s of segments){const p=pointSegment(x,y,s);if(p.d<best.d)best={...p,s};}return best;}
function inside(x,y,ring){let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function applyUserPublicPlaceCorrections(){
 // Positions supplied by the author, checked against existing road/park geometry.
 // Keep OSM source and private residential anchors untouched.
 const positions=[
  {id:'sagrada_familia',name:'Igreja Matriz Sagrada Família',p:[145,125]},
  {id:'prefeitura',name:'Prefeitura Municipal',p:[-241.8,392]},
  {id:'sonho_doce',name:'Confeitaria Sonho Doce',p:[106.5,95]},
  {id:'pedra_cordeiro',name:'Mirante da Pedra do Cordeiro',geo:[-6.6984919,-35.5472188]},
  {id:'parque_sao_luis',name:'Parque Artesanal São Luís',geo:[-6.7129197,-35.5237656]}
 ];
 for(const place of positions){
  const landmark=data.landmarks.find(p=>p.id===place.id);
  if(!landmark)continue;
  const prior=landmark.p;
  const projection=data.projection;
  const corrected=place.geo?[(place.geo[1]-projection.originLon)*projection.metersPerDegreeLon,
   (place.geo[0]-projection.originLat)*projection.metersPerDegreeLat]:place.p;
  landmark.p=corrected.slice();
  landmark.positionStatus=place.geo?'user_google_maps_pin':'user_reference_proposed';
  for(const point of data.points){
   if(point.tags?.name===landmark.name&&
    Math.hypot(point.p[0]-prior[0],point.p[1]-prior[1])<1){
    point.p=corrected.slice();
   }
  }
 }
 // A segunda escola tem um ponto OSM público. A posição marca apenas a referência,
 // não certifica o contorno, a fachada nem a entrada do prédio.
 if(!data.landmarks.some(place=>place.id==='escola_felinto')){
  const projection=data.projection;
  data.landmarks.push({id:'escola_felinto',name:'Escola Felinto Elizio',kind:'school',
   p:[(-35.5373344-projection.originLon)*projection.metersPerDegreeLon,
      (-6.6984949-projection.originLat)*projection.metersPerDegreeLat],
   positionStatus:'osm_public_school_point',artStatus:'marcador ilustrativo; edifício e entrada não verificados'});
 }
 const plaza=data.cultureReferences?.find(p=>p.id==='praca_6_setembro');
 if(plaza){
  plaza.p=[139.7,145.5];
  plaza.visualReference=plaza.p.slice();
  plaza.positionStatus='user_reference_proposed';
  plaza.artStatus='posição proposta no polígono de parque existente; desenho ainda conceitual';
 }
}
function preprocess(){
 areas=data.areas;roads=data.roads;missions=data.missions;
 verifiedWater=projectVerifiedWater(VERIFIED_HYDRO_GEOJSON,data.projection);
 const used=new Set();for(const road of roads){let length=0;const xs=road.p.map(p=>p[0]),ys=road.p.map(p=>p[1]);road.bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];for(let i=1;i<road.p.length;i++){const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.05)continue;segments.push({ax:a[0],ay:a[1],dx,dy,len2:len*len,len,road});length+=len;}
 if(road.tags.name&&!used.has(road.tags.name)&&length>40){used.add(road.tags.name);const i=Math.max(1,Math.floor(road.p.length/2));let a=road.p[i-1],b=road.p[i];labels.push({x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,name:road.tags.name,angle:Math.atan2(b[1]-a[1],b[0]-a[0])});}}
 scenicScenes=window.RoncadorScenicPlacement.layout(data);
 const occupied=[];let id=1;const center=data.urbanCenter||data.start;for(const s of segments){if(!['residential','primary','secondary','tertiary','unclassified'].includes(s.road.tags.highway)||houses.length>=1350)continue;const isClovisArea=s.ay>120&&s.ay<750&&s.ax>-180&&s.ax<380;const step=isClovisArea?19:28,startV=isClovisArea?10:16;for(let v=startV;v<s.len;v+=step){let t=v/s.len;for(const side of [-1,1]){let r=hash(id++,side),offset=(isClovisArea?16:19)+r*6,x=s.ax+s.dx*t-s.dy/s.len*offset*side,y=s.ay+s.dy*t+s.dx/s.len*offset*side;if(Math.hypot(x-center[0],y-center[1])>1900)continue;if(nearestRoad(x,y).d<(isClovisArea?11.5:14.5)||occupied.some(p=>Math.hypot(x-p[0],y-p[1])<(isClovisArea?14.5:18)))continue;if(scenicScenes.some(scene=>window.RoncadorScenicPlacement.contains(window.RoncadorScenicPlacement.bounds(scene,9),x,y)))continue;if(areas.some(a=>a.tags.leisure==='pitch'&&inside(x,y,a.p[0])))continue;occupied.push([x,y]);houses.push({x,y,angle:Math.atan2(s.dy,s.dx),side,w:10+r*8,h:10+hash(id,2)*8,color:Math.floor(hash(id,3)*5),seed:id});}}}
 centralBlocks=window.RoncadorCentralBlocks.prepare(data,houses);
 fairStalls=window.RoncadorFairStreets.layout(data,scenicScenes,houses);
 marketStall=window.RoncadorFairStreets.featured(fairStalls,data.landmarks.find(p=>p.id==='mercado')?.p);
 floraLayer=window.RoncadorGroundedFlora.sample(data,houses,scenicScenes);
 pathfinder=window.RoncadorPathfinding.buildGraph(roads);
 residentMotion=window.RoncadorResidentMotion.create(pathfinder);
 streetGreetings=window.RoncadorStreetGreetings.create(pathfinder);
 streetGreetings.setHouses(houses);
 window.RoncadorStreetMoments.setHouses(houses);
 roadDetails=window.RoncadorRoadDetails.prepare(roads,pathfinder);
 streetGreetings.setJunctions(roadDetails?.junctions||[]);
 terrainLayer=window.RoncadorTerrainRelief.prepare(data,terrainData);
 streetPaths.clear();
 wildlife=prepareWildlife();
 player.x=data.start[0];player.y=data.start[1];
 const guideRoad=nearestRoad(data.start[0]+22,data.start[1]-12);
 guide={x:guideRoad.x+9,y:guideRoad.y-8};
 if(saved&&(saved.v===2||saved.v===3)){collected=new Set((Array.isArray(saved.collected)?saved.collected:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<missions.length));if(saved.v===3&&saved.mapSource===data.source&&saved.player&&Number.isFinite(saved.player.x)&&Number.isFinite(saved.player.y)&&saved.player.x>=data.bounds[0]&&saved.player.x<=data.bounds[2]&&saved.player.y>=data.bounds[1]&&saved.player.y<=data.bounds[3]){player.x=saved.player.x;player.y=saved.player.y;}elapsed=Math.max(0,Math.min(86400,Number(saved.elapsed)||0));target=Number.isInteger(saved.target)?Math.max(0,Math.min(5,saved.target)):0;if(collected.has(target))target=missions.findIndex((_,i)=>!collected.has(i));friendship=Math.max(0,Math.min(3,Number(saved.friendship)||0));chapter=Math.max(0,Math.min(3,Number(saved.chapter)||0));marketDay=!!saved.marketDay;showScenery=saved.showScenery!==false;observations=new Set((Array.isArray(saved.observations)?saved.observations:[]).filter(v=>['vila','campo','mata'].includes(v)));if(saved.photos&&typeof saved.photos==='object'){for(const name of ['vila','campo','mata'])if(typeof saved.photos[name]==='string'&&saved.photos[name].startsWith('data:image/')&&saved.photos[name].length<150000)photos[name]=saved.photos[name];}if(saved.cultureNotes&&typeof saved.cultureNotes==='object'){for(const id of ['igreja','mercado','rodoviaria'])if(typeof saved.cultureNotes[id]==='string'&&saved.cultureNotes[id].length<80)cultureNotes[id]=saved.cultureNotes[id];}gardenStep=Math.max(0,Math.min(3,Math.floor(Number(saved.gardenStep)||0)));festivalCelebrated=!!saved.festivalCelebrated;lightPhase=['manha','tarde','anoitecer'].includes(saved.lightPhase)?saved.lightPhase:'manha';$('start').innerHTML='Continuar expedição <span>↗</span>';}
 syncSceneryToggle();
 if(saved&&(saved.v===2||saved.v===3)){
  gardenHarvests=Math.max(0,Math.min(9999,Math.floor(Number(saved.gardenHarvests)||0)));
  showWildlife=saved.showWildlife!==false;
  showGeology=!!saved.showGeology;
  living=window.RoncadorLivingWorld.restore(saved.living);
  fairQuest=window.RoncadorCozyQuests.restore(saved.fairQuest);
  marketMorning=window.RoncadorMarketMorning.restore(saved.marketMorning);
  marketFruitSlots=window.RoncadorMarketScene.restore(saved.marketFruitSlots,marketMorning.work.includes('frutas'));
  marketWitnessed=marketMorning.claimed&&saved.marketWitnessed===true;
  luciaGarden=window.RoncadorLuciaGarden.restore(saved.luciaGarden);
  biaLetters=window.RoncadorBiaLetters.restore(saved.biaLetters);
  skyMode=window.RoncadorAtmosphere.restore(saved.skyMode);
  rainCare=gardenStep===2?Math.max(0,Math.min(7.999,Number(saved.rainCare)||0)):0;
  showGroundedFlora=saved.showGroundedFlora!==false;
  showTerrain=saved.showTerrain!==false;
  momentsSeen=window.RoncadorDailyMoments.restore(saved.momentsSeen);
  detailedFacades=saved.detailedFacades!==false;
  sideNeighbors=window.RoncadorSecondaryNeighbors.restore(saved.sideNeighbors);
  ruaNovaPaths=restoreRuaNovaPaths(saved.ruaNovaPaths);
  ruaNovaShared=ruaNovaPaths.length>0&&saved.ruaNovaShared===true;
  ruaNovaDays=restoreRuaNovaDays(saved.ruaNovaDays,ruaNovaPaths);
  cityKnowledge=restoreCityKnowledge(saved.cityKnowledge,ruaNovaPaths,living.day);
  cityLinks=restoreCityLinks(saved.cityLinks,cityKnowledge);
  cityConsequences=restoreCityConsequences(saved.cityConsequences,{cityKnowledge,luciaGarden,biaLetters,sideNeighbors,marketMorning});
  facadeSketches=window.RoncadorFacadeStudio.restoreSketches(saved.facadeSketches);
  communitySeen=window.RoncadorStreetCommunity.restore(saved.communitySeen);
  cityReports=restoreCityReports(saved.cityReports,living.day,window.RoncadorStreetCommunity.EVENTS);
  weeklyVisitsSeen=restoreWeeklyVisits(saved.weeklyVisitsSeen,living.day,window.RoncadorLivingWorld);
  smallWalksSeen=restoreSmallWalkRecords(saved.smallWalksSeen,living.day,'presenciado');
  smallWalkReports=restoreSmallWalkRecords(saved.smallWalkReports,living.day,'ouvido');
  friendshipTraditions=restoreFriendshipTraditions(saved.friendshipTraditions,{living,sideNeighbors,marketMorning,luciaGarden,weeklyVisitsSeen,growthAt:day=>window.RoncadorLuciaGarden.growth(luciaGarden,day).stage});
  storyEndings=restoreStoryEndings(saved.storyEndings,{friendshipTraditions,cityConsequences,living});
  microStories=restoreMicroStories(saved.microStories,living.day);
  lastJournalDay=restoreLastJournalDay(saved.lastJournalDay,living.day);
  worldMoments=restoreWorldMoments(saved.worldMoments,living.day);
  streetVignettes=restoreStreetVignettes(saved.streetVignettes,living.day);
  everydayMemories=restoreEverydayMemories(saved.everydayMemories,living.day);
  saoPedroTales=restoreSaoPedroTales(saved.saoPedroTales,living.day);
  breadStories=restoreBreadStories(saved.breadStories,living.day);
  morningEncounters=restoreMorningEncounters(saved.morningEncounters,living.day);
  waterMemories=restoreWaterMemories(saved.waterMemories,living.day,verifiedWater);
  waterTalks=restoreWaterTalks(saved.waterTalks,living.day,waterMemories);
  camucaStories=restoreCamucaStories(saved.camucaStories,living.day);
  seasonalMemories=restoreSeasonalMemories(saved.seasonalMemories,living.day,new Date().getFullYear());
  belemContacts=window.RoncadorBelemContacts.restore(saved.belemContacts);
  kawaiiState=window.RoncadorKawaiiMoto.restore(saved.kawaiiState);
 }
 syncLightButton();
 syncSkyButton();
 camera.x=player.x;camera.y=player.y;renderMissions();updateUI();
}
function syncRoute(){const open=$('sidebar').classList.contains('open');$('sidebar').inert=matchMedia('(max-width:800px)').matches&&!open;$('mobileRoute').setAttribute('aria-expanded',String(open));}
function placeKawaiiHud(){
 const hud=document.querySelector('.kawaii-hud-bar');
 if(!hud)return;
 const phone=matchMedia('(max-width:800px)').matches;
 const destination=phone?$('sidebar'):document.querySelector('.game');
 if(hud.parentElement===destination)return;
 if(phone)destination.insertBefore(hud,destination.querySelector('.sidebar-footer'));
 else destination.appendChild(hud);
}
function resize(){placeKawaiiHud();syncRoute();let r=canvas.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if($('mapDialog').open)drawBig();}
function path(c,pts,close=false){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(close)c.closePath();}
function roundRect(c,x,y,ww,hh,r,fill,stroke){c.beginPath();c.roundRect(x,y,ww,hh,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function drawTree(c,x,y,r,seed,tone='street'){
 c.save();
 c.fillStyle=lightPhase==='anoitecer'?'#283e3235':lightPhase==='tarde'?'#4a513226':'#29493729';c.beginPath();c.ellipse(x+5,y+6,r*.93,r*.45,-.2,0,Math.PI*2);c.fill();
 roundRect(c,x-1.7,y-r*.2,3.4,r*.7,1,'#9c8969');
 const colors=tone==='shade'?['#78977e','#7d9d82','#6f8e70','#8ca889','#76977b']:
  tone==='canopy'?['#7ca06e','#7fa579','#719365','#94ad80','#88a579']:
  ['#779d68','#719c77','#628d5e','#8da77b','#90ad79'];
 c.fillStyle=colors[seed%5];c.beginPath();c.arc(x,y-r*.39,r*.72,0,7);c.arc(x-r*.39,y-r*.67,r*.56,0,7);c.arc(x+r*.37,y-r*.68,r*.58,0,7);c.fill();
 c.fillStyle=lightPhase==='tarde'?'#e2d59b4a':lightPhase==='anoitecer'?'#98b28e38':'#bad2a05e';c.beginPath();c.ellipse(x-r*.22,y-r*.87,r*.37,r*.24,-.2,0,7);c.fill();
 c.fillStyle='#eff3cc70';for(let i=0;i<4;i++){const a=i*2.25+seed*.29;c.beginPath();c.arc(x+Math.cos(a)*r*.39,y-r*.56+Math.sin(a)*r*.3,1.05,0,7);c.fill();}
 c.restore();
}
function drawCordeiroCactus(c,x,y,r,seed){
 // Xique-xique/mandacaru-inspired illustration only near the documented
 // Pedra do Cordeiro landscape; not a field survey of individual plants.
 c.save();c.translate(x,y);
 c.fillStyle='#38523a33';c.beginPath();c.ellipse(3,2,r*.6,r*.2,0,0,Math.PI*2);c.fill();
 c.strokeStyle='#537d58';c.lineCap='round';c.lineWidth=3;
 const h=r*(seed%2?1.35:.75);
 c.beginPath();c.moveTo(0,0);c.lineTo(0,-h);c.moveTo(0,-h*.42);c.quadraticCurveTo(-r*.5,-h*.35,-r*.5,-h*.75);c.moveTo(0,-h*.6);c.quadraticCurveTo(r*.47,-h*.55,r*.45,-h*.93);c.stroke();
 c.strokeStyle='#b1be83';c.lineWidth=.65;
 for(const side of [-1,1]){c.beginPath();c.moveTo(side*1.4,-h*.15);c.lineTo(side*1.4,-h*.95);c.stroke();}
 c.restore();
}
function drawRuralShrub(c,x,y,r,seed){
 // Low, irregular scrub is an artistic variant, not a surveyed plant location.
 const far=zoom<1.15;
 c.save();c.translate(x,y);
 c.fillStyle='#36503b26';c.beginPath();c.ellipse(2,3,r*.78,r*.28,0,0,Math.PI*2);c.fill();
 const palette=['#728e60','#809a66','#637f58','#92a778'];
 const color=palette[seed%palette.length];
 c.fillStyle=color;c.beginPath();
 c.ellipse(-r*.33,-r*.2,r*.48,r*.38,-.3,0,Math.PI*2);
 c.ellipse(r*.25,-r*.24,r*.53,r*.42,.25,0,Math.PI*2);
 c.ellipse(0,-r*.43,r*.47,r*.43,0,0,Math.PI*2);c.fill();
 if(!far){
  c.strokeStyle='#526d4c';c.lineWidth=.85;c.lineCap='round';
  c.beginPath();c.moveTo(0,0);c.lineTo(-r*.28,-r*.38);
  c.moveTo(0,0);c.lineTo(r*.31,-r*.42);c.stroke();
  c.fillStyle='#b8c99b88';
  for(const [dx,dy] of [[-.38,-.48],[.17,-.64],[.42,-.24]]){
   c.beginPath();c.arc(dx*r,dy*r,1.1,0,Math.PI*2);c.fill();
  }
 }
 c.restore();
}
function house(c,b){
 c.save();c.translate(b.x,b.y);c.rotate(b.angle);
 // Both rows face the same street: mirror only the illustrated facade on the
 // left side. Centres, OSM segments and collision rectangles remain untouched.
 if(b.side===1)c.scale(1,-1);
 const x=-b.w/2,y=-b.h/2,shop=b.seed%9===0,flat=b.seed%4===0;
 const roofType=b.seed%3,doorLeft=b.seed%2===0,far=zoom<1.3;
 // A soft ground-contact shadow gives the house weight without inventing a
 // surveyed footprint or adding another object to the mapped street.
 c.fillStyle='#3b514321';c.beginPath();c.ellipse(1.5,b.h*.4,b.w*.57,b.h*.24,0,0,Math.PI*2);c.fill();
 roundRect(c,x+2,y+3,b.w+1,b.h+1,2,'#32503b20');
 const walls=['#f2e6cb','#e9dfc7','#e7d8bd','#f3e7d3'];
 roundRect(c,x,y,b.w,b.h,1.6,walls[b.seed%walls.length],'#ad9e8560');
 const roofs=['#c98268','#c39a75','#a2a492','#d19a83','#829c94'];
 roundRect(c,x-1,y-(roofType===1?2:1),b.w+2,b.h*(roofType===2?.56:.62),roofType===1?2.5:1.5,roofs[b.color]);
 // Tiny overlapping tile rhythm and warm edge highlight: stylized, not surveyed facades.
 c.strokeStyle='#fff4d244';c.lineWidth=.65;
 if(!far)for(let row=2;row<b.h*.54;row+=roofType===2?4.2:3.3){c.beginPath();c.moveTo(x+1,y+row);c.lineTo(x+b.w-1,y+row);c.stroke();}
 if(!far){
  // A slight ridge, a shaded overhang and varied gable treatment separate
  // individual roofs without changing their shape or size.
  c.strokeStyle='#fff7db80';c.lineWidth=.85;c.beginPath();c.moveTo(x+1,y+.7);c.lineTo(x+b.w-1,y+.7);c.stroke();
  c.strokeStyle='#704b4650';c.lineWidth=1.5;c.beginPath();c.moveTo(x-.7,y+b.h*.59);c.lineTo(x+b.w+.7,y+b.h*.59);c.stroke();
  if(roofType===2){c.fillStyle='#fff1d075';c.beginPath();c.moveTo(x+b.w*.5,y+1.5);c.lineTo(x+b.w*.5,y+b.h*.48);c.lineTo(x+b.w*.55,y+b.h*.48);c.closePath();c.fill();}
 }
 c.fillStyle='#fff4d9a8';c.fillRect(x,y+b.h*.57,b.w,1.2);
 // A slim illustrated foundation/step remains INSIDE the decorative lot;
 // it is not a mapped sidewalk and never adds a walkable road crossing.
 if(!far){c.fillStyle='#937e6760';c.fillRect(x+.4,y+b.h-1.6,b.w-.8,1.1);
 c.fillStyle='#fff6d7a0';c.fillRect(x+.8,y+b.h-2.5,b.w-1.6,.6);}
 if(!far){
  // The roof overhang casts a slim shadow on the illustrated front wall;
  // a shaded return face suggests volume without extending the lot.
  c.fillStyle='#52443930';c.fillRect(x+.7,y+b.h*.62,b.w-1.4,Math.min(2,b.h*.1));
  c.fillStyle='#574b3b25';c.fillRect(x+b.w-1.5,y+b.h*.64,1,b.h*.3);
 }
 if(flat){roundRect(c,x-1,y+b.h*.48,b.w+2,2.7,.5,'#f8e1bc','#ad9882');}
 if(shop){
  roundRect(c,x+1,y+b.h*.61,b.w-2,3.3,.6,'#f9e7bf');
  c.fillStyle='#9fb9a3';c.fillRect(x+2,y+b.h*.65,b.w-4,2.4);
  c.fillStyle='#f4d5a1';for(let k=0;k<3;k++)c.fillRect(x+2+k*(b.w-4)/3,y+b.h*.59,(b.w-4)/5,1.6);
 }else{
  const windowX=x+b.w*(doorLeft?.58:.2),doorX=x+b.w*(doorLeft?.17:.61);
  const glass=['#779d9a','#83a8a4','#9eaca0'][b.seed%3];
  c.fillStyle=glass;c.fillRect(windowX,y+b.h*.7,3.2,2.7);
  if(!far){
   c.strokeStyle='#f8f2df';c.lineWidth=.6;c.beginPath();c.moveTo(windowX+1.6,y+b.h*.7);c.lineTo(windowX+1.6,y+b.h*.7+2.7);c.stroke();
   if(b.seed%3===0){c.fillStyle='#a1847188';c.fillRect(windowX-1,y+b.h*.7,1,3.2);c.fillRect(windowX+3.4,y+b.h*.7,1,3.2);}
   if(b.w>19&&b.seed%5===0){const second=windowX+(doorLeft?-5.1:5.1);c.fillStyle=glass;c.fillRect(second,y+b.h*.7,2.5,2.7);}
  }
  if(!far){c.fillStyle='#53453730';c.fillRect(doorX-.7,y+b.h*.685,b.w*.19+1.4,b.h*.3);}
  roundRect(c,doorX,y+b.h*.7,b.w*.19,b.h*.28,1,roofType===2?'#967e6c':'#8a7b67');
  if(!far){
   c.fillStyle='#f9edcfbd';c.fillRect(doorX+.7,y+b.h*.77,.7,1.3);
   c.fillStyle='#a59b8066';c.fillRect(doorX-1,y+b.h*.96,b.w*.19+2,1.2);
   if(b.seed%7===0){c.fillStyle='#e8c59b';c.fillRect(doorX-.6,y+b.h*.64,b.w*.19+1.2,1.2);}
  }
 }
 c.fillStyle='#eabbb0';c.beginPath();c.arc(x+b.w+2,y+b.h*.78,1.8,0,7);c.fill();
 c.fillStyle='#67977b';c.beginPath();c.ellipse(x+b.w+2,y+b.h*.66,2.6,1.4,-.5,0,7);c.fill();
 if(b.seed%11===0){c.fillStyle='#f4e2c4';c.beginPath();c.arc(x+b.w*.38,y+b.h*.92,2.6,0,7);c.fill();c.fillStyle='#9c8f7e';c.fillRect(x+b.w*.38-1,y+b.h*.86,2,.9);}
 c.restore();
 if(detailedFacades){
  window.RoncadorCentralBlocks.draw(c,b,lightPhase);
  window.RoncadorFacadeStudio.draw(c,b,lightPhase,living.minute,zoom);
 }
}
function region(c,detail){for(const a of areas){const ring=a.p[0];path(c,ring,true);if(a.tags.landuse==='residential'){c.fillStyle='#bec59b';c.fill();c.strokeStyle='#adba8c';c.lineWidth=2;c.stroke();}else if(a.tags.landuse==='forest'||a.tags.leisure==='nature_reserve'){c.fillStyle='#8cba7c77';c.fill();if(!detail){c.strokeStyle='#61894d88';c.lineWidth=3;c.setLineDash([8,6]);c.stroke();c.setLineDash([]);}}else if(a.tags.landuse==='grass'||a.tags.landuse==='meadow'||a.tags.leisure==='park'||a.tags.leisure==='garden'){c.fillStyle='#b4cf8d';c.fill();}else if(a.tags.leisure==='pitch'){c.fillStyle='#88ab6c';c.fill();c.lineWidth=1.1;c.strokeStyle='#e7edd2b0';c.stroke();let xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),ww=Math.max(...xs)-x,hh=Math.max(...ys)-y;const cx=x+ww/2,cy=y+hh/2;c.strokeRect(x+4,y+4,ww-8,hh-8);c.beginPath();c.moveTo(x+4,cy);c.lineTo(x+ww-4,cy);c.stroke();c.beginPath();c.arc(cx,cy,Math.min(ww,hh)*.16,0,Math.PI*2);c.stroke();}}
}
function projectVerifiedWater(geo,projection){
 if(geo?.metadata?.CD_MUN!=='2501906'||!Array.isArray(geo.features)||!projection)return [];
 const result=[];
 for(const feature of geo.features){
  if(feature.properties?.natural!=='water'||!/^way\/\d+$/.test(feature.id)||feature.geometry?.type!=='Polygon')continue;
  const ring=feature.geometry.coordinates?.[0];if(!Array.isArray(ring)||ring.length<4||ring.length>5000)continue;
  if(ring.some(p=>!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<-35.56||p[0]>-35.49||p[1]<-6.72||p[1]>-6.66))continue;
  if(ring[0][0]!==ring.at(-1)[0]||ring[0][1]!==ring.at(-1)[1])continue;
  const p=ring.map(([lon,lat])=>[(lon-projection.originLon)*projection.metersPerDegreeLon,(lat-projection.originLat)*projection.metersPerDegreeLat]);
  result.push({id:feature.id,p});
 }
 return result;
}
function drawVerifiedWater(c,shores=true){
 for(const water of verifiedWater){
  path(c,water.p,true);c.fillStyle='#87bed0';c.fill();
  c.strokeStyle='#dce7c2';c.lineWidth=shores?6:3;c.stroke();
  path(c,water.p,true);c.strokeStyle='#648fa3';c.lineWidth=shores?1.8:2;c.stroke();
  if(!shores)continue;
  c.save();path(c,water.p,true);c.clip();
  // Original ripples are clipped to mapped shoreline, never a guessed lake.
  for(let i=7;i<water.p.length;i+=22){const [x,y]=water.p[i];c.strokeStyle='#ddf1e47a';c.lineWidth=.9;c.beginPath();c.ellipse(x+9,y+5,12,3,-.12,0,Math.PI);c.stroke();}
  c.restore();
  for(let i=8;i<water.p.length;i+=13){const [x,y]=water.p[i];if(nearestRoad(x,y).d<16)continue;
   c.strokeStyle='#638f67b0';c.lineWidth=1.15;c.beginPath();c.moveTo(x,y);c.lineTo(x-2.5,y-7);c.moveTo(x,y);c.lineTo(x+2.6,y-5);c.stroke();}
 }
}
function drawRoads(c,z=1,simple=false,viewport=null){c.lineCap='round';c.lineJoin='round';for(const r of roads){if(viewport&&r.bounds&&(r.bounds[2]<viewport.left||r.bounds[0]>viewport.right||r.bounds[3]<viewport.top||r.bounds[1]>viewport.bottom))continue;let major=/^(primary|secondary|trunk)/.test(r.tags.highway),trail=['path','footway','track','steps'].includes(r.tags.highway);
 const widths={primary:15,secondary:14,tertiary:11.7,primary_link:10.7,residential:9.6,unclassified:10,service:6.5,path:4.5,footway:4.5,track:5.5,steps:4};
 const width=widths[r.tags.highway]||10,materials={asphalt:'#cecfc1',paved:'#e2d9be',unpaved:'#d0c39a',paving_stones:'#e8d8ba',sett:'#deccaf'};
 path(c,r.p);
 if(simple){c.strokeStyle='#91a079';c.lineWidth=width+2;c.stroke();c.strokeStyle='#e6ddbc';c.lineWidth=width;c.stroke();continue;}
 // Close-up illustration only: give urban carriageways breathing room without
 // changing OSM geometry, navigation, sidewalks' coordinates or collision.
 const street= !trail && r.tags.highway!=='service';
 const pavementWidth=width*(street?1.2:1);
 // The offset shadow reads as a shallow curb, beneath the same road centreline.
 c.save();c.translate(0,street?.85:.3);
 c.strokeStyle=trail?'#9d9c7950':'#5863483e';c.lineWidth=pavementWidth+3.5;c.stroke();c.restore();
 // Pale shoulders and a fine warm curb make the road a place, not a map line.
 c.strokeStyle=trail?'#9d9c7950':'#f1e3c6a0';c.lineWidth=pavementWidth+2.5;c.stroke();
 c.strokeStyle=trail?'#c8ba96a8':'#b9ad938a';c.lineWidth=pavementWidth+1.15;c.stroke();
 c.strokeStyle=materials[r.tags.surface]||(major?'#d7cdad':'#e6ddbc');c.lineWidth=pavementWidth;c.stroke();
 if(z>=1.35&&!trail){
  // Residential streets have no repeated centre dashes; the softly shaded
  // curb edges carry the depth cue, without pretending to be road signage.
  if(z>=1.85){c.strokeStyle='#9c998310';c.lineWidth=Math.max(1,pavementWidth-4);c.stroke();}
 }
 if(major){c.strokeStyle='#f2edcf88';c.lineWidth=.65;c.setLineDash([7,8]);c.stroke();c.setLineDash([]);}
 if(trail){c.strokeStyle='#b5a87c99';c.lineWidth=.85;c.setLineDash([2,5]);c.stroke();c.setLineDash([]);}}
}
function drawMappedPlaces(c,viewport){
 if(zoom<1.1)return;
 const market=data.landmarks?.find(l=>l.id==='mercado');
 for(const place of data.points){
  if(data.landmarks?.some(l=>l.name===place.tags.name))continue;
  const [x,y]=place.p;if(x<viewport.left||x>viewport.right||y<viewport.top||y>viewport.bottom)continue;
  c.fillStyle='#fffaf0';c.strokeStyle='#587960';c.lineWidth=1.5;c.beginPath();c.arc(x,y,5.5,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='#587960';c.beginPath();c.arc(x,y,2.3,0,Math.PI*2);c.fill();
  // Keep the real mapped POI, but reserve lettering for closer inspection in
  // the busy market. Its precise coordinate and click target are unchanged.
  const busyMarket=market&&Math.hypot(x-market.p[0],y-market.p[1])<115;
  const mayLabel=zoom>(busyMarket?1.9:1.45)&&(!busyMarket||Math.hypot(player.x-x,player.y-y)<85);
  if(mayLabel){c.font='600 7px system-ui';c.textAlign='center';c.textBaseline='middle';c.lineWidth=2.5;c.strokeStyle='#fff9e5';c.strokeText(place.tags.name,x,y-13);c.fillStyle='#4d6d53';c.fillText(place.tags.name,x,y-13);}
 }
}
function drawPin(c,m,i,time,miniMode=false,subtle=false){const p=m.p,done=collected.has(i);if(miniMode){c.fillStyle=done?'#5d8052':i===target?'#d4a642':'#eee6bb';c.strokeStyle='#fff6de';c.lineWidth=1.5;c.beginPath();c.arc(p[0],p[1],done?4:5,0,Math.PI*2);c.fill();c.stroke();return;}
 c.save();c.translate(p[0],p[1]);if(subtle){c.globalAlpha*=.68;c.scale(.72,.72);}const pulse=reduce?0:Math.sin(time*2+i)*2;c.fillStyle=done?'#70975d40':'#eccb6d30';c.beginPath();c.ellipse(0,6,18+pulse,9+pulse*.4,0,0,Math.PI*2);c.fill();if(!done&&!subtle){c.strokeStyle='#f5de9b50';c.lineWidth=1;c.beginPath();c.ellipse(0,6,23+pulse,12+pulse*.4,0,0,Math.PI*2);c.stroke();}c.fillStyle='#866f42';c.fillRect(-1.2,-20,2.4,24);roundRect(c,-9,-29-pulse,18,18,5,done?'#718e54':'#eac76f',done?'#e7edc0':'#fff2bd');c.fillStyle=done?'#f0f2d6':'#80672d';c.font='bold 11px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(done?'✓':String(i+1),0,-20-pulse);c.restore();}
function spawnEmojiBurst(x,y,list=['✨','🌸','💖','⭐'],count=5){
 if(reduce)count=Math.min(2,count);
 for(let i=0;i<count;i++){
  const ang=-Math.PI/2+(Math.random()-.5)*1.9,spd=14+Math.random()*22;
  emojiParticles.push({x:x+(Math.random()-.5)*8,y:y-10+(Math.random()-.5)*6,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd-8,life:1.35+Math.random()*.45,maxLife:1.6,emoji:list[i%list.length],size:10+Math.random()*4});
 }
 if(emojiParticles.length>48)emojiParticles.splice(0,emojiParticles.length-48);
}
function playMotoHonk(){
 note(659,0,.09);note(880,.09,.14);note(1046,.20,.18);
 kawaiiState.honks++;
 spawnEmojiBurst(player.x,player.y-14,['📣','✨','💖','🌸','🎵','(o˘◡˘o)'],6);
 syncKawaiiUI();save();
}
function drawParkedMotosAndSorda(c,time,view){
 if(!showScenery)return;
 const api=window.RoncadorKawaiiMoto;
 // 1. Parked motorcycles along Rua Feliciano Pedrosa, Mercado & Xaviezão
 for(const m of api.PARKED_MOTOS){
  if(m.x<view.left-20||m.x>view.right+20||m.y<view.top-20||m.y>view.bottom+20)continue;
  c.save();c.translate(m.x,m.y);c.rotate(m.angle);
  c.fillStyle='#2a3d3033';c.beginPath();c.ellipse(0,3,7,2.4,0,0,7);c.fill();
  c.fillStyle='#3d3d3d';c.beginPath();c.arc(-4.2,1.5,2.2,0,7);c.arc(4.2,1.5,2.2,0,7);c.fill();
  roundRect(c,-4.5,-2.5,9,3.5,1.5,m.color,'#ffffff88');
  c.strokeStyle='#cfd6dc';c.lineWidth=1.1;c.beginPath();c.moveTo(2.5,-2);c.lineTo(4,-5.5);c.stroke();
  c.fillStyle='#fff4b8';c.beginPath();c.arc(4.4,-4.5,1.1,0,7);c.fill();
  c.restore();
 }
 // 2. Cestinhas ilustrativas de pães e doces (sem atribuir endereço à padaria real)
 for(const s of api.SORDA_SPOTS){
  if(s.x<view.left-30||s.x>view.right+30||s.y<view.top-30||s.y>view.bottom+30)continue;
  c.save();c.translate(s.x,s.y);
  c.fillStyle='#384d3b2e';c.beginPath();c.ellipse(0,5,10,3.5,0,0,7);c.fill();
  roundRect(c,-8,-3,16,7,2,'#c7955d','#7d5630');
  roundRect(c,-7,-4.5,14,2.5,1,'#fff3d6');
  for(let k=-4.5;k<=4.5;k+=3){
   c.fillStyle='#a86434';c.beginPath();c.arc(k,-3.2,1.5,0,7);c.fill();
  }
  const steam=reduce?0:Math.sin(time*3+s.x)*1.5;
  if(zoom>1.2){
   roundRect(c,-34,-22+steam*.3,68,12,5,'#fff9ebee','#d4a86a');
   c.fillStyle='#784c24';c.font='bold 6.8px system-ui';c.textAlign='center';c.textBaseline='middle';
   c.fillText('🥖 Pães da Tia',0,-16+steam*.3);
  }
  c.restore();
 }
 // 3. Ciclo Vivo de Calçada por Horário: 17h00 rodas de cadeiras na Clóvis Bezerra; 19h00 noite iluminada
 const hour=living.minute/60;
 if(hour>=16.5&&hour<19.5){
  const circleSpots=[]; // Posições de calçada residencial omitidas.
  for(const [cx,cy] of circleSpots){
   if(cx<view.left-30||cx>view.right+30||cy<view.top-30||cy>view.bottom+30)continue;
   c.save();c.translate(cx,cy);
   roundRect(c,-5,-2,3.6,3.6,1,'#e07a5f');roundRect(c,1.4,-2,3.6,3.6,1,'#5f8fa3');
   if(zoom>1.35){
    c.font='8px system-ui';c.textAlign='center';c.fillText('☕💬',0,-7+Math.sin(time*2+cx));
   }
   c.restore();
  }
 }
 if(hour>=18||lightPhase==='anoitecer'){
  // Floating karaoke musical notes at Bar da Prosa ([29.35, -249.25]) & lights at O Xaviezão ([-101.59, 533.98])
  const barP=[29.35,-249.25];
  if(barP[0]>view.left-50&&barP[0]<view.right+50&&barP[1]>view.top-50&&barP[1]<view.bottom+50){
   c.save();c.translate(barP[0],barP[1]-28);
   c.font='11px system-ui';c.textAlign='center';
   c.fillText('🎤 🎶 ✨',Math.sin(time*2.2)*4,-Math.abs(Math.cos(time*2.2))*5);
   c.restore();
  }
 }
}
function drawPlayer(c,time){
 c.save();c.translate(player.x,player.y);const spriteScale=characterDrawScale(WORLD_CHARACTER_HEIGHT/34);c.scale(spriteScale,spriteScale);
 const riding=!!kawaiiState?.riding;
 const skin=window.RoncadorKawaiiMoto.currentSkin(kawaiiState);
 const acc=window.RoncadorKawaiiMoto.currentAccessory(kawaiiState);
 const contemplative=worldPause&&!riding&&!player.moving;
 const breath=contemplative&&!reduce?Math.sin(worldPause.age*2.2)*.65:0;
 const bob=player.moving&&!reduce?Math.sin(time*(riding?24:17))*(riding?.8:1.3):breath;
 const leg=player.moving&&!riding?Math.sin(time*17)*2:0;
 const face=player.dir||1;
 if(riding){
  // Warm headlight beam ahead of the kawaii scooter
  c.save();
  const beamGrad=c.createRadialGradient(face*10,-3,2,face*34,-3,34);
  beamGrad.addColorStop(0,'#fff6b888');beamGrad.addColorStop(1,'#fff6b800');
  c.fillStyle=beamGrad;c.beginPath();c.moveTo(face*8,-7);c.lineTo(face*42,-18);c.lineTo(face*42,12);c.closePath();c.fill();
  c.restore();
  // Scooter shadow
  c.fillStyle='#264a3638';c.beginPath();c.ellipse(0,8,14,4.5,0,0,Math.PI*2);c.fill();
  c.translate(0,bob);
  if(player.moving&&!reduce)c.rotate(face*0.045);
  // Wheels with spinning hubcaps
  for(const wx of [-8.5,8.5]){
   c.fillStyle='#3b3735';c.beginPath();c.arc(wx,4.5,4.2,0,Math.PI*2);c.fill();
   c.fillStyle='#fff8eb';c.beginPath();c.arc(wx,4.5,2.1,0,Math.PI*2);c.fill();
   c.strokeStyle=skin.body;c.lineWidth=.9;
   const spin=player.moving?time*14*face:0;
   c.beginPath();c.moveTo(wx+Math.cos(spin)*2,4.5+Math.sin(spin)*2);c.lineTo(wx-Math.cos(spin)*2,4.5-Math.sin(spin)*2);c.stroke();
  }
  // Scooter body, pastel fenders & plush seat
  roundRect(c,-11,-2,22,6.5,3.2,skin.body,'#ffffffaa');
  roundRect(c,-12,1,8,3.2,1.6,skin.fender);
  roundRect(c,4,1,8,3.2,1.6,skin.fender);
  roundRect(c,-6.5,-5.2,9.5,3.6,1.8,skin.seat);
  // Handlebar stem, cute mirror & basket with Sorda/flowers in front
  c.strokeStyle=skin.body;c.lineWidth=2.4;c.lineCap='round';
  c.beginPath();c.moveTo(face*6.5,-1);c.lineTo(face*8.5,-12);c.stroke();
  c.strokeStyle='#cfd8dc';c.lineWidth=1.5;
  c.beginPath();c.moveTo(face*6,-12);c.lineTo(face*10,-12);c.stroke();
  // Front woven basket with flowers & Sorda
  roundRect(c,face*8.5-(face>0?0:5.5),-10.5,5.5,5,1.2,'#d4a36a','#8c6238');
  c.fillStyle='#f4a6b8';c.beginPath();c.arc(face*10,-11,1.6,0,7);c.fill();
  // Glowing headlight
  c.fillStyle='#fff6a8';c.strokeStyle='#d4a84b';c.lineWidth=.8;
  c.beginPath();c.arc(face*9.8,-12,2.1,0,Math.PI*2);c.fill();c.stroke();
 }else{
  c.fillStyle='#264a3630';c.beginPath();c.ellipse(0,7,9,4,0,0,Math.PI*2);c.fill();
  c.translate(0,bob);
  roundRect(c,-7,0,5,7+leg,1.5,'#5c6554');roundRect(c,2,0,5,7-leg,1.5,'#5c6554');
 }
 // Character torso & backpack
 const bodyY=riding?-15:-13;
 roundRect(c,-8,bodyY,16,14,4.5,riding?skin.body:'#d97854','#fff5e666');
 roundRect(c,face>0?-11:7,bodyY+2,4,9,2,'#c06745');
 if(contemplative){
  // A slow hand-to-cheek observation pose, without inventing a physical seat.
  c.strokeStyle='#e9b99a';c.lineWidth=3;c.lineCap='round';c.beginPath();
  c.moveTo(face*8,bodyY+7);c.quadraticCurveTo(face*11,bodyY-2,face*7,-17+breath);c.stroke();
 }
 // Kawaii head with blushing cheeks & sparkling eyes (TsuLiPa⭐World vibe!)
 const headY=riding?-27:-24;
 roundRect(c,-6.8,headY,13.6,12.5,4.8,'#f1c8a5','#d9ab86');
 // Rosy kawaii cheeks
 c.fillStyle='#f2949c99';
 c.beginPath();c.ellipse(face>0?-1.5:-4.2,headY+7.8,1.7,1,0,0,Math.PI*2);c.ellipse(face>0?4.2:1.5,headY+7.8,1.7,1,0,0,Math.PI*2);c.fill();
 // Eyes with tiny white starlight highlight
 c.fillStyle='#3d352e';
 const ex1=face>0?0.5:-4.2,ex2=face>0?4.2:-0.5;
 c.beginPath();c.arc(ex1,headY+5.5,1.25,0,Math.PI*2);c.arc(ex2,headY+5.5,1.25,0,Math.PI*2);c.fill();
 c.fillStyle='#ffffff';
 c.beginPath();c.arc(ex1-.3,headY+5.1,.45,0,Math.PI*2);c.arc(ex2-.3,headY+5.1,.45,0,Math.PI*2);c.fill();
 if(contemplative){c.strokeStyle='#a97769';c.lineWidth=.75;c.beginPath();c.arc(face*1.5,headY+9,1.5,.2,Math.PI-.2);c.stroke();}
 // Helmet or Explorer Hat + TsuLiPa Accessory
 if(riding){
  c.fillStyle=skin.fender;c.strokeStyle=skin.body;c.lineWidth=1;
  c.beginPath();c.arc(0,headY+2.5,7.8,Math.PI,Math.PI*2);c.fill();c.stroke();
  // Cute cat ears on the kawaii helmet!
  c.fillStyle=skin.body;
  c.beginPath();c.moveTo(-6,headY-2);c.lineTo(-4,headY-7);c.lineTo(-1,headY-4);c.closePath();c.fill();
  c.beginPath();c.moveTo(6,headY-2);c.lineTo(4,headY-7);c.lineTo(1,headY-4);c.closePath();c.fill();
 }else{
  c.fillStyle='#6c7a49';c.beginPath();c.ellipse(0,headY,9,3,0,0,Math.PI*2);c.fill();
  c.fillStyle='#8c9c62';c.fillRect(-7,headY-2,14,2.4);
 }
 if(acc&&acc.id!=='none'){
  c.font='9px system-ui';c.textAlign='center';c.textBaseline='middle';
  c.fillText(acc.icon,face>0?-5:5,headY-2);
 }
 c.fillStyle='#f5e3af';c.fillRect(-4,bodyY+3,3,5);
 c.restore();
}
function drawFlowers(c,left,right,top,bottom){
 for(let gx=Math.floor(left/65);gx<right/65;gx++)for(let gy=Math.floor(top/65);gy<bottom/65;gy++){
  const seed=hash(gx*13,gy*19);
  if(seed<.84)continue;
  const x=gx*65+hash(gx+11,gy)*52,y=gy*65+hash(gx,gy+27)*52;
  if(verifiedWater.some(w=>inside(x,y,w.p)))continue;
  c.fillStyle='#708d5c8c';c.beginPath();c.ellipse(x+2,y+4,6,2,seed*3,0,7);c.fill();
  for(let i=0;i<3;i++){
   const fx=x+i*5,fy=y+(i%2)*4,shade=(gx+gy+i)%3;
   c.fillStyle=['#edc28f','#dca6a7','#f5e6ba'][Math.abs(shade)];
   for(let n=0;n<4;n++){const a=n*Math.PI/2;c.beginPath();c.arc(fx+Math.cos(a)*2,fy+Math.sin(a)*2,1.5,0,7);c.fill();}
   c.fillStyle='#d0a65e';c.beginPath();c.arc(fx,fy,.9,0,7);c.fill();
  }
 }
}
function drawGroundedFlora(c,view,time){
 if(!showGroundedFlora)return;
 for(const item of floraLayer.points){
  const {x,y,kind,seed}=item;
  if(x<view.left-22||x>view.right+22||y<view.top-23||y>view.bottom+23)continue;
  if(verifiedWater.some(w=>inside(x,y,w.p)))continue;
  if(kind==='canopy'||kind==='shade'){
   drawTree(c,x,y,kind==='canopy'?11+seed%4:7+seed%3,seed,kind);
   continue;
  }
  c.save();c.translate(x,y);
  const soil=kind==='meadow'?(seed%2?'#acbd9080':'#9fb98777'):
   seed%3===0?'#78916b6d':'#698f6770';
  c.fillStyle=soil;c.beginPath();c.ellipse(0,2,kind==='meadow'?8:6,3,seed*.1,0,7);c.fill();
  const stems=kind==='underbrush'?5:kind==='meadow'?7:4;
  for(let j=0;j<stems;j++){
   const px=(j-(stems-1)/2)*2.2,tip=kind==='underbrush'?7+(seed+j)%5:4+(seed+j)%4;
   c.strokeStyle=(j+seed)%3===0?'#79976b':(j+seed)%2?'#658a55':'#79a66c';c.lineWidth=1.1;c.beginPath();c.moveTo(px,1);c.quadraticCurveTo(px+1.4,-tip*.6,px+(j%2?2:-2),-tip);c.stroke();
   if(kind==='flowerbed'){c.fillStyle=['#f2cb95','#f4e8bf','#eab4ad'][j%3];c.beginPath();c.arc(px+(j%2?2:-2),-tip,.9+(seed%3)*.22,0,7);c.fill();}
  }
  c.restore();
 }
}

function drawClovisNeighborhoodScene(){ /* Cena associada a domicílio particular retirada desta cópia de referência. */ }
function drawDailyActivity(c,time,view){
 if(!showScenery)return;
 const moment=window.RoncadorDailyMoments.current(living);
 if(!moment)return;
 const hub=data.landmarks.find(p=>p.id===moment.hub);if(!hub)return;
 const [x,y]=hub.p;if(x<view.left-34||x>view.right+34||y<view.top-75||y>view.bottom+25)return;
 const bob=reduce?0:Math.sin(time*2.1)*1.3;
 c.save();c.translate(x+40,y-31+bob);
 c.fillStyle='#fff7e6ee';c.strokeStyle='#acc2a1';c.lineWidth=1;c.beginPath();c.roundRect(-13,-18,26,24,8);c.fill();c.stroke();
 c.fillStyle='#d9c8a0';c.beginPath();c.moveTo(-4,6);c.lineTo(0,10);c.lineTo(4,6);c.fill();
 c.font='13px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(moment.icon,0,-6);
 c.restore();
}
function prepareWildlife(){
 const found=[];
 const green=areas.filter(a=>['park','garden','nature_reserve'].includes(a.tags.leisure)||['grass','meadow','forest'].includes(a.tags.landuse));
 for(let i=0;i<green.length&&found.length<22;i++){
  const ring=green[i].p[0];if(!ring||ring.length<3)continue;
  const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  if(maxX-minX<11||maxY-minY<11)continue;
  let placed=0;
  for(let j=0;j<38&&placed<3&&found.length<22;j++){
   const x=minX+hash(i*187+j*31,17)*(maxX-minX),y=minY+hash(i*13+j*43,23)*(maxY-minY);
   if(!inside(x,y,ring)||!inside(x+3,y,ring)||!inside(x-3,y,ring)||!inside(x,y+3,ring)||!inside(x,y-3,ring))continue;
   if(nearestRoad(x,y).d<24||houses.some(b=>Math.hypot(x-b.x,y-b.y)<23))continue;
   if(scenicScenes.some(s=>window.RoncadorScenicPlacement.contains(window.RoncadorScenicPlacement.bounds(s,14),x,y)))continue;
   found.push({x,y,kind:(i+j)%3===0?'bird':'butterfly',phase:hash(i*37,j*29)*Math.PI*2});placed++;
  }
 }
 return found;
}
function drawWildlife(c,time,viewport){
 if(!showWildlife||living.minute<7*60||living.minute>=19*60)return;
 for(const b of wildlife){
  if(b.x<viewport.left-12||b.x>viewport.right+12||b.y<viewport.top-12||b.y>viewport.bottom+12)continue;
  const sway=reduce?0:Math.sin(time*.8+b.phase)*3,bob=reduce?0:Math.sin(time*1.3+b.phase)*2;
  c.save();c.translate(b.x+sway,b.y+bob);
  if(b.kind==='butterfly'){
   const flap=reduce?.8:.55+.35*Math.sin(time*9+b.phase);
   c.fillStyle='#f3c7a1';c.beginPath();c.ellipse(-3*flap,-2,3.7*flap,4.4,-.5,0,Math.PI*2);c.ellipse(3*flap,-2,3.7*flap,4.4,.5,0,Math.PI*2);c.fill();
   c.fillStyle='#b67f70';c.beginPath();c.ellipse(0,0,1.1,4,0,0,Math.PI*2);c.fill();
  }else{
   c.strokeStyle='#5b766b';c.lineWidth=1.2;c.lineCap='round';c.beginPath();const wing=reduce?2:2+Math.sin(time*5+b.phase)*1.5;c.moveTo(-6,-wing);c.quadraticCurveTo(-3,-5,0,0);c.quadraticCurveTo(3,-5,6,-wing);c.stroke();
  }
  c.restore();
 }
}
function drawPedraLandscape(c,x,y){
 // Illustrated mass of Pedra do Cordeiro, not an outcrop polygon or a walkable route.
 // Keep the separate landmark overlay responsible for the cruzeiro and its label.
 const distant=zoom<1.15;
 c.save();c.translate(x,y);
 // Ground contact and broad, irregular outline, kept legible at distant zoom.
 c.fillStyle='#514b4226';c.beginPath();c.ellipse(1,23,106,20,-.03,0,Math.PI*2);c.fill();
 const rock=c.createLinearGradient(-45,-56,58,26);
 rock.addColorStop(0,'#c6bdab');rock.addColorStop(.49,'#a49a89');rock.addColorStop(1,'#756f64');
 c.beginPath();
 c.moveTo(-103,21);c.lineTo(-91,4);c.lineTo(-84,-14);c.lineTo(-67,-20);
 c.lineTo(-55,-36);c.lineTo(-35,-42);c.lineTo(-19,-57);c.lineTo(-4,-64);
 c.lineTo(17,-51);c.lineTo(35,-48);c.lineTo(51,-35);c.lineTo(69,-31);
 c.lineTo(85,-11);c.lineTo(104,19);c.quadraticCurveTo(10,28,-103,21);
 c.closePath();c.fillStyle=rock;c.fill();
 c.strokeStyle='#716a5e';c.lineWidth=1.8;c.stroke();
 // Sunlit left face, cool recessed central fracture and shaded right escarpment.
 c.beginPath();c.moveTo(-91,9);c.lineTo(-68,-17);c.lineTo(-53,-28);
 c.lineTo(-35,-34);c.lineTo(-16,-54);c.lineTo(-4,-58);
 c.lineTo(-17,-29);c.lineTo(-31,-10);c.lineTo(-44,18);
 c.lineTo(-87,19);c.closePath();c.fillStyle='#d8cdb8';c.fill();
 c.beginPath();c.moveTo(-13,-50);c.lineTo(3,-57);c.lineTo(20,-43);
 c.lineTo(11,-21);c.lineTo(24,-7);c.lineTo(4,22);
 c.lineTo(-29,22);c.lineTo(-16,-6);c.lineTo(-21,-25);
 c.closePath();c.fillStyle='#847b70';c.fill();
 c.beginPath();c.moveTo(34,-42);c.lineTo(52,-30);c.lineTo(70,-24);
 c.lineTo(91,-2);c.lineTo(102,19);c.lineTo(45,21);
 c.lineTo(36,5);c.lineTo(42,-18);c.closePath();c.fillStyle='#77736b';c.fill();
 c.beginPath();c.moveTo(19,-42);c.lineTo(31,-38);c.lineTo(24,-14);
 c.lineTo(38,3);c.lineTo(31,21);c.lineTo(5,22);c.lineTo(17,-7);
 c.lineTo(10,-25);c.closePath();c.fillStyle='#b7ac9c';c.fill();
 // A few large seams survive a distant zoom; hairline cracks only appear nearby.
 c.strokeStyle='#695f55';c.lineWidth=distant?1.5:1.1;c.lineCap='round';
 c.beginPath();c.moveTo(-53,-24);c.lineTo(-47,-8);c.lineTo(-55,7);
 c.moveTo(-10,-46);c.lineTo(-4,-33);c.lineTo(-13,-18);c.lineTo(-8,-5);
 c.moveTo(51,-26);c.lineTo(44,-11);c.lineTo(54,5);c.stroke();
 if(!distant){
  c.strokeStyle='#e4d9c5';c.lineWidth=.85;c.beginPath();
  c.moveTo(-76,-5);c.lineTo(-63,-19);c.moveTo(-29,-40);c.lineTo(-17,-49);
  c.moveTo(20,-31);c.lineTo(26,-36);c.moveTo(58,-19);c.lineTo(72,-8);c.stroke();
  c.fillStyle='#655e5360';
  for(const [px,py,r] of [[-75,9,1.5],[-61,-6,1],[-36,8,1.6],[6,-16,1.2],[28,12,1.5],[64,6,1.7],[77,13,1]]){
   c.beginPath();c.ellipse(px,py,r*2,r,0,0,Math.PI*2);c.fill();
  }
 }
 // Caatinga vegetation: low scrub plus silhouettes of mandacaru and xique-xique.
 for(const [px,py,w] of [[-98,20,9],[-79,19,7],[-65,20,6],[67,21,8],[88,22,10]]){
  c.fillStyle='#627b55';c.beginPath();c.ellipse(px,py,w,4,0,0,Math.PI*2);c.fill();
 }
 c.strokeStyle='#4e7954';c.lineWidth=distant?2:2.3;c.lineCap='round';
 for(const [px,py,h] of [[-83,15,14],[84,17,17]]){
  c.beginPath();c.moveTo(px,py);c.lineTo(px,py-h);
  c.moveTo(px,py-5);c.quadraticCurveTo(px-7,py-5,px-7,py-12);
  c.moveTo(px,py-7);c.quadraticCurveTo(px+7,py-7,px+7,py-15);c.stroke();
 }
 if(!distant){
  c.strokeStyle='#5a865a';c.lineWidth=1.7;c.beginPath();
  c.moveTo(-64,20);c.lineTo(-64,11);c.moveTo(-64,16);c.lineTo(-69,13);
  c.moveTo(70,21);c.lineTo(70,12);c.moveTo(70,17);c.lineTo(75,13);c.stroke();
 }
 c.restore();
}
function drawScenicLayer(c,viewport,details=false){
 if(!showScenery)return;
 for(const scene of scenicScenes){const [x,y]=scene.at;
  if(x<viewport.left-110||x>viewport.right+110||y<viewport.top-110||y>viewport.bottom+110)continue;
  if(details&&scene.anchor){
   // Thin tether connects the artistic position to the exact OSM reference dot.
   c.save();c.strokeStyle='#5b7b6680';c.lineWidth=.85;c.setLineDash([2.2,3.4]);c.beginPath();c.moveTo(x,y+15*scene.scale);c.lineTo(...scene.anchor);c.stroke();c.setLineDash([]);c.restore();
  }
  if(scene.id==='pedra_cordeiro'&&details)drawPedraLandscape(c,x,y);
  c.save();c.translate(x,y);c.scale(scene.scale,scene.scale);
  const prop={p:[0,0],kind:scene.kind,name:scene.name};
  const sceneDistance=Math.hypot(player.x-x,player.y-y);
  if(details){window.RoncadorLandmarks.drawDetails(c,[prop],null,fairAtmosphere(),performance.now()/1000,lightPhase==='anoitecer'||living.minute>=18*60,{zoom,distance:sceneDistance});
   if(scene.positionStatus!=='osm_point'&&zoom>=1.85&&sceneDistance<=90){
    c.fillStyle='#fff9e8';c.strokeStyle='#ac986d';c.lineWidth=1;
    c.beginPath();c.roundRect(-48,49,96,13,4);c.fill();c.stroke();
    c.fillStyle='#806c47';c.font='bold 7px system-ui';c.textAlign='center';c.fillText('ILUSTRAÇÃO · SEM LOCAL EXATO',0,57);
   }
  }else window.RoncadorLandmarks.drawGround(c,[prop]);
  c.restore();
 }
}
function walkingPoint(id,hub,variant,shift=0){
 const place=hub==='inicio'?{p:data.start}:hub.startsWith('missao:')?{p:missions[Number(hub.slice(7))]?.p}:data.landmarks.find(l=>l.id===hub);
 if(!place?.p)return null;
 const key=id+':'+hub;
 if(!streetPaths.has(key))streetPaths.set(key,window.RoncadorStreetLife.itinerary(pathfinder,place.p,variant));
 const path=streetPaths.get(key);
 const awayFromMarker=id==='damiao'?28:id==='lucia'?20:id==='bia'?22:0;
 // Keep enlarged heads and props from sitting directly on OSM POI markers.
 return window.RoncadorStreetLife.sample(path,elapsed*(.72+variant*.07)+variant*12+awayFromMarker+shift);
}
function encounterRoadPoint(event){
 const cacheKey='visita:'+event.from+':'+event.to;
 if(!streetPaths.has(cacheKey)){
  const origin=data.landmarks.find(p=>p.id===event.from),destination=data.landmarks.find(p=>p.id===event.to);
  const route=origin&&destination?pathfinder.route(origin.p,destination.p):null;
  // The final point of route() may be an unconnected POI offset: only road
  // vertices become walking positions for our fictional characters.
  streetPaths.set(cacheKey,route?.points?.slice(0,-1)||[]);
 }
 return window.RoncadorStreetEncounters.alongRoad(streetPaths.get(cacheKey),window.RoncadorStreetEncounters.progress(event));
}
function communityMeetingPoint(id,hub){
 const landmark=data.landmarks.find(l=>l.id===hub);
 if(!landmark)return null;
 const key='comunidade:'+hub;
 if(!streetPaths.has(key))streetPaths.set(key,window.RoncadorStreetLife.itinerary(pathfinder,landmark.p,3,145));
 // One street route, staggered feet: the scene reads as a conversation, not a pile of sprites.
 const offset={damiao:9,lucia:9,bia:9,cica:44,nara:44,teo:44}[id]||9;
 const point=window.RoncadorStreetLife.sample(streetPaths.get(key),offset);
 return point?{...point,walking:false}:null;
}
function weeklyVisitPoint(id,hub){
 const landmark=data.landmarks.find(l=>l.id===hub);if(!landmark)return null;
 const key='visita-semanal:'+hub;
 if(!streetPaths.has(key))streetPaths.set(key,window.RoncadorStreetLife.itinerary(pathfinder,landmark.p,3,145));
 const point=window.RoncadorStreetLife.sample(streetPaths.get(key),id==='lucia'?12:46);
 return point?{...point,walking:false}:null;
}
function smallWalkRoadPoint(scene){
 const key='pequeno-passeio:'+scene.from+':'+scene.to;
 if(!streetPaths.has(key)){
  const from=data.landmarks.find(p=>p.id===scene.from),to=data.landmarks.find(p=>p.id===scene.to);
  const a=from&&pathfinder.nearest(from.p),b=to&&pathfinder.nearest(to.p);
  const usable=a&&b&&a.distance<65&&b.distance<65&&a.component===b.component;
  const route=usable?pathfinder.route([pathfinder.nodes[a.id].x,pathfinder.nodes[a.id].y],[pathfinder.nodes[b.id].x,pathfinder.nodes[b.id].y],{maxSnapMetres:0}):null;
  streetPaths.set(key,route?.distance<1800?route.points:[]);
 }
 const path=streetPaths.get(key);if(path.length<2)return null;
 const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y)),total=lengths.reduce((a,b)=>a+b,0);
 let remaining=total*scene.progress;
 for(let i=0;i<lengths.length;i++){
  if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?Math.max(0,Math.min(1,remaining/lengths[i])):0;
   return{x:path[i].x+(path[i+1].x-path[i].x)*t,y:path[i].y+(path[i+1].y-path[i].y)*t,walking:scene.phase!=='visit'};}
  remaining-=lengths[i];
 }
 return null;
}
function residentsInStreets(){
 const world=window.RoncadorLivingWorld;
 return world.RESIDENTS.flatMap((def,i)=>{
  const schedule=world.agenda(living,def.id);
  if(!schedule.present)return[];
  let point;
  if(schedule.smallWalk){
   const endpoint=smallWalkRoadPoint({...schedule.smallWalk,progress:1});
   point=def.id===schedule.smallWalk.visitor?smallWalkRoadPoint(schedule.smallWalk):endpoint;
   if(point&&schedule.smallWalk.phase==='visit'){
    const offset=def.id===schedule.smallWalk.visitor?-11:11;
    const near=window.RoncadorStreetLife.itinerary(pathfinder,[point.x,point.y],2,55);
    point=window.RoncadorStreetLife.sample(near,Math.max(0,offset+17))||point;
    point.walking=false;
   }
  }
  else if(schedule.reunion&&schedule.meeting){point=weeklyVisitPoint(def.id,schedule.hub);}
  else if(schedule.community&&schedule.meeting){point=communityMeetingPoint(def.id,schedule.hub);}
  else if(schedule.travel){point=encounterRoadPoint(schedule.encounter);}
  else if(schedule.meeting){
   const key='encontro:mercado',hub=data.landmarks.find(l=>l.id==='mercado');
   if(!streetPaths.has(key))streetPaths.set(key,window.RoncadorStreetLife.itinerary(pathfinder,hub.p,3,140));
   // Each person stands on a distinct, mapped street position (rather than
   // overlapping three enlarged sprites in the same few metres).
   const separation=schedule.encounter?.cast?13+i*27:def.id==='damiao'?13:41;
   point=window.RoncadorStreetLife.sample(streetPaths.get(key),separation+9);
   if(point)point.walking=false;
  }else{
   // Small continuous morning detour stays on the already mapped itinerary.
   // Scheduled reunions, community scenes and road travel keep priority.
   const morning=world.morningDeparture?.(living,def.id);
   point=walkingPoint(def.id,schedule.hub,i,morning?.shift||0);
  }
  const behavior={id:def.id,meeting:!!schedule.meeting,travel:!!schedule.travel};
  const moment=window.RoncadorStreetMoments.choose({...behavior,hub:schedule.hub,community:!!schedule.community,encounter:schedule.encounter,x:point?.x,y:point?.y},elapsed,living);
  return point?[residentMotion.resolve({...point,id:def.id,def,activity:schedule.activity,meeting:!!schedule.meeting,travel:!!schedule.travel,community:!!schedule.community,reunion:schedule.reunion||null,encounter:schedule.encounter||null,variant:i,pause:!!moment,moment},elapsed,living.day)]:[];
 });
}
function secondaryInStreets(primary=residentsInStreets()){
 const placed=[];
 for(const def of window.RoncadorSecondaryNeighbors.RESIDENTS){
  const duty=window.RoncadorSecondaryNeighbors.agenda(living,def);
  if(!duty.present)continue;
  const smallWalk=window.RoncadorSecondaryNeighbors.smallWalk?.(living,def,duty);
  let at=duty.community&&duty.meeting?communityMeetingPoint(def.id,duty.hub):duty.travel?encounterRoadPoint(duty.encounter):walkingPoint(def.id,def.hub,def.variant,smallWalk?.offset||0);
  // Reserve space against protagonists AND already placed neighbors.
  // All alternatives are sampled from the same mapped road itinerary.
  const occupied=primary.concat(placed);
  if(at&&!duty.meeting&&occupied.some(p=>Math.hypot(p.x-at.x,p.y-at.y)<30)){
   const roadPath=streetPaths.get(def.id+':'+def.hub);
   const base=elapsed*(.72+def.variant*.07)+def.variant*12;
   const offsets=[63,90,117,145];
   const next=roadPath?.length?offsets.map(delta=>window.RoncadorStreetLife.sample(roadPath,base+delta))
    .find(candidate=>candidate&&occupied.every(p=>Math.hypot(p.x-candidate.x,p.y-candidate.y)>23)):null;
   if(next)at=next;
  }
  if(!at)continue;
  const moment=window.RoncadorStreetMoments.choose({id:def.id,hub:duty.hub,meeting:!!duty.meeting,travel:!!duty.travel,community:!!duty.community,encounter:duty.encounter,x:at.x,y:at.y},elapsed,living);
  const person=residentMotion.resolve({...at,walking:!!at.walking&&!duty.meeting&&(duty.travel||duty.walking||!!smallWalk&&!smallWalk.paused),def,id:def.id,variant:def.variant,activity:duty.activity,meeting:!!duty.meeting,travel:!!duty.travel,community:!!duty.community,encounter:duty.encounter||null,secondary:true,pause:!!moment||!!smallWalk?.paused,moment},elapsed,living.day);
  // A narrow junction may lack a free roadside spot; omit this frame
  // rather than stacking two illustrated bodies over the same sidewalk.
  if(!duty.meeting&&occupied.some(p=>Math.hypot(p.x-person.x,p.y-person.y)<19))continue;
  placed.push(person);
 }
 return placed;
}
function drawSocialGesture(c,pose,time){
 if(!pose)return;
 const face=pose.facing||1,offer=pose.pose==='offer',take=pose.pose==='receive',wave=pose.pose==='wave';
 if(!(offer||take||wave||pose.pose==='smile'))return;
 const intensity=Math.max(0,Math.min(1,pose.intensity??1));if(intensity<.035)return;
 c.save();c.globalAlpha*=intensity;
 const bounce=reduce?0:Math.sin(time*4)*1.15;
 const reach=(offer?7:take?5:wave?3:2)*intensity;
 const handY=wave?-12-10*intensity+bounce:offer||take?-11-4*intensity+bounce:-11;
 c.strokeStyle='#d6a48c';c.lineWidth=3.2;c.lineCap='round';c.beginPath();
 c.moveTo(face*7,-10);c.quadraticCurveTo(face*(11+reach*.4),-11,face*(10+reach),handY);c.stroke();
 c.fillStyle='#e6b797';c.beginPath();c.arc(face*(10+reach),handY,2.2,0,7);c.fill();
 if(wave){c.fillStyle='#f4e4bd';c.beginPath();c.arc(face*(16+reach),handY-3,1.1,0,7);c.fill();}
 if(pose.pose==='smile'){c.fillStyle='#f2c5a7';c.beginPath();c.arc(face*11,-17,1.4,0,7);c.fill();}
 c.restore();
}
function drawDailyGesture(c,person,time){
 const moment=person.moment;if(!moment||person.arriving)return;
 const a=moment.strength;if(a<=.03)return;
 const sway=reduce?0:Math.sin(time*3.1+person.variant)*1.25;
 c.save();c.globalAlpha*=a;c.lineCap='round';c.lineWidth=2.1;c.strokeStyle='#c58f77';
 c.beginPath();
 if(moment.kind==='rest'){
  c.moveTo(-7,-9);c.quadraticCurveTo(-11,-4,-6,-2);
  c.moveTo(7,-9);c.quadraticCurveTo(10,-3,6,-2);
 }else if(moment.kind==='sweep'){
  c.moveTo(7,-8);c.quadraticCurveTo(13,-11,12,-14+sway*.45);
 }else if(moment.kind==='chair'){
  c.moveTo(7,-10);c.quadraticCurveTo(13,-8,12,-5+sway*.3);
 }else if(moment.kind==='flower'){
  c.moveTo(7,-10);c.quadraticCurveTo(13,-13,10,-16+sway*.35);
 }else if(moment.kind==='look'){
  // A quiet glance toward a storefront, without adding world geometry.
  c.moveTo(7,-10);c.quadraticCurveTo(10,-14,9,-19+sway*.3);
 }else if(moment.kind==='read'||moment.kind==='sketch'){
  c.moveTo(-7,-9);c.quadraticCurveTo(-12,-13,-8,-16+sway);
 }else if(moment.kind==='ribbon'){
  c.moveTo(8,-9);c.quadraticCurveTo(13,-12,12,-16+sway);
 }else if(moment.kind==='letter'){
  c.moveTo(7,-8);c.quadraticCurveTo(12,-13,13,-15+sway);
 }
 c.stroke();
 if(moment.kind==='sweep'){
  // A hand-held broom sweeps lightly; nothing is placed on the street.
  c.strokeStyle='#96744c';c.lineWidth=1.4;c.beginPath();
  c.moveTo(12,-14+sway*.45);c.lineTo(15+sway*.6,5);c.stroke();
  c.strokeStyle='#cda974';c.lineWidth=2.5;c.beginPath();
  c.moveTo(12+sway*.6,5);c.lineTo(18+sway*.6,5);c.stroke();
 }
 // Props are worn/carried, never placed as purported real-world objects.
 if(moment.kind==='ribbon'||moment.kind==='flower'||moment.kind==='letter'){
  const color=moment.kind==='flower'?'#deafb7':moment.kind==='ribbon'?'#79b8af':'#eec9a4';
  c.fillStyle=color;c.beginPath();c.arc(12,-17+sway*.4,1.9,0,7);c.fill();
 }
 c.restore();
}
// Keep characters in proportion to the tiny mapped houses even at maximum zoom.
// The same local transform holds faces, limbs and carried props together.
// Illustrative 14-unit facades and 23-unit characters share one world-scale family.
// This is a visual ratio, not an assertion about building measurements.
const WORLD_FACADE_HEIGHT=14,WORLD_CHARACTER_HEIGHT=WORLD_FACADE_HEIGHT*1.52;
function characterDrawScale(base){return base*(zoom<=2?1:1-.12*Math.min(1,(zoom-2)/1.5));}
// NPCs share a smaller visual scale; their accessories follow the same transform.
function residentDrawScale(base){return characterDrawScale(base)*.88;}
// Screen-space clutter is planned in world units so zoom changes cannot move
// a label across another resident's face. A label may move sideways or vanish.
function layoutResidentNameplates(people,playerPosition,scale,phone){
 const market=typeof data==='undefined'?null:data?.landmarks?.find(place=>place.id==='mercado');
 const marketCrowd=!!market&&Math.hypot(playerPosition.x-market.p[0],playerPosition.y-market.p[1])<145;
 // The market has stalls, POIs and interaction icons: show only the closest
 // resident's name there. The full cast is still available in the diary.
 const limit=marketCrowd?1:phone?2:3,placed=[],used=[];
 const nearby=people.filter(p=>p.def&&!p.meeting&&!p.greeting&&Math.hypot(playerPosition.x-p.x,playerPosition.y-p.y)<105)
  .sort((a,b)=>Math.hypot(playerPosition.x-a.x,playerPosition.y-a.y)-Math.hypot(playerPosition.x-b.x,playerPosition.y-b.y));
 const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 for(const p of nearby){
  if(placed.length>=limit||scale<(marketCrowd?1.65:1.3))break;
  if(marketCrowd&&Math.hypot(playerPosition.x-p.x,playerPosition.y-p.y)>65)continue;
  const width=p.def.name.length*5.6+14;
  for(const shift of [0,-24,24]){
   const x=p.x+shift,y=p.y-34;
   const box={left:x-width/2-2,right:x+width/2+2,top:y-7,bottom:y+7};
   // All nearby faces reserve space, not only those with names.
   if(people.some(other=>other.id!==p.id&&overlaps(box,{left:other.x-12,right:other.x+12,top:other.y-34,bottom:other.y-6})))continue;
   if(used.some(other=>overlaps(box,other)))continue;
   placed.push({id:p.id,name:p.def.name,x,y,width});used.push(box);break;
  }
 }
 return placed;
}
function drawDistantResident(c,person){
 // A tiny connected silhouette for the town-wide view, keeping the street legible.
 c.save();c.translate(person.x,person.y);
 const outfit=person.def?.tone||['#85a88f','#d6a16e','#b98c9d'][person.variant%3];
 c.fillStyle='#465c4538';c.beginPath();c.ellipse(0,2,4.3,1.6,0,0,Math.PI*2);c.fill();
 roundRect(c,-2.8,-7,5.6,8,2,outfit);
 c.fillStyle=person.id==='teo'?'#c18f73':'#e6b797';
 c.beginPath();c.arc(0,-9.3,3.25,0,Math.PI*2);c.fill();
 c.fillStyle='#665449';c.beginPath();c.arc(0,-10.9,3.2,Math.PI,Math.PI*2);c.fill();
 c.restore();
}
function drawKawaiiWalker(c,person,time){
 const phase=Number.isFinite(person.stridePhase)?person.stridePhase+person.variant:time*9+person.variant;
 const blend=person.walkBlend??Number(!!person.walking);
 const bob=reduce?0:Math.sin(phase)*1.05*blend+Math.sin(time*1.35+person.variant)*.4*(1-blend);
 const legs=reduce?0:Math.sin(phase)*2.15*blend;
 const named=!!person.def,damiao=person.id==='damiao',lucia=person.id==='lucia',bia=person.id==='bia';
 const feelings=named?living.people[person.id]:null,affection=named?affectionSnapshot(person.id):null;
 const wardrobe=named?Math.floor((living.day-1)/7)%3:person.variant%3;
 const gaze=Number.isFinite(person.gaze)?person.gaze:person.social?.facing?person.social.facing*.65:person.walking&&Number.isFinite(person.heading)?Math.cos(person.heading)*.76:0;
 // Common human scale: leads remain expressive without dwarfing facades.
 c.save();c.translate(person.x,person.y);const spriteScale=residentDrawScale(named?WORLD_CHARACTER_HEIGHT/31:.64);c.scale(spriteScale,spriteScale);
 c.fillStyle='#3853442b';c.beginPath();c.ellipse(0,6.9,person.walking?8.1:8.5,person.walking?2.25:2.7,0,0,7);c.fill();c.translate(0,bob);
 if(!reduce)c.rotate(person.lean??0);
 const outfit=person.def?.tone||['#85a88f','#d6a16e','#b98c9d'][person.variant%3];
 // Rounded shoes, alternating steps, and a subtle floor shadow.
 roundRect(c,-5.5,-1,4.4,8+legs,1.7,'#556251');roundRect(c,1.4,-1,4.4,8-legs,1.7,'#556251');
 roundRect(c,-6,5+legs,5.5,2.4,1.2,'#58483e');roundRect(c,1.2,5-legs,5.5,2.4,1.2,'#58483e');
 if(lucia){c.fillStyle='#ae92b8';c.beginPath();c.moveTo(-6,-7);c.lineTo(-9,3);c.quadraticCurveTo(0,6,9,3);c.lineTo(6,-7);c.fill();}
 roundRect(c,-7.8,-13,15.6,16,4.4,outfit,'#f7eedc8c');
 const fabricLight=c.createLinearGradient(-8,-13,8,4);fabricLight.addColorStop(0,'#fff7e52f');fabricLight.addColorStop(.55,'#ffffff00');fabricLight.addColorStop(1,'#342f3a24');
 roundRect(c,-7.1,-12.5,14.2,14.8,4,fabricLight);
 // Each fictional resident has an immediately recognisable job/interest.
 if(damiao){roundRect(c,-4.7,-12,9.4,12,2,'#f4dfb9');roundRect(c,-3.2,-10,6.4,1.4,1,'#ad866e');}
 if(lucia){roundRect(c,-2.4,-12,5,10,2,'#f8e0e4');c.fillStyle='#fff3b9';c.beginPath();c.arc(0,-8,1.6,0,7);c.fill();}
 if(bia){roundRect(c,-8,-12,4.4,13,2,'#9b6d77');roundRect(c,-2,-11,4,3,1,'#f5e4a5');}
 // Outfits keep their silhouettes recognisable at every zoom level.
 if(damiao){c.strokeStyle='#815f4d';c.lineWidth=1.6;c.beginPath();c.moveTo(-4,-11);c.lineTo(-4,0);c.moveTo(4,-11);c.lineTo(4,0);c.stroke();}
 if(lucia){roundRect(c,-7,-11,3.8,12,2,'#c3a5bd');roundRect(c,3.5,-11,3.8,12,2,'#c3a5bd');}
 if(bia){roundRect(c,4,-11,4.2,11,2,'#5b8285');c.strokeStyle='#f1d6ab';c.lineWidth=1.6;c.beginPath();c.moveTo(5,-10);c.lineTo(8,-2);c.stroke();}
 // Muted weekly accessories vary without replacing each resident's iconic silhouette.
 if(damiao){c.fillStyle=['#8dbaa0','#bd9b84','#8fa4c2'][wardrobe];c.beginPath();c.moveTo(-3,-13);c.lineTo(3,-13);c.lineTo(1,-9);c.lineTo(-1,-8);c.fill();}
 if(lucia){c.strokeStyle=['#f5d6a5','#e4b7c4','#b4cfb0'][wardrobe];c.lineWidth=.75;c.beginPath();c.moveTo(-6,-4);c.lineTo(-3,-4);c.moveTo(3,-4);c.lineTo(6,-4);c.stroke();}
 if(bia){roundRect(c,-3.5,-12.3,7,2,1,['#f0c5a2','#c0d5c0','#e5c2d1'][wardrobe]);}
 const wave=reduce?0:Math.sin(phase)*.9*blend+Math.sin(time*1.1+person.variant)*1.2*(1-blend);
 roundRect(c,-9.7,-9.5+wave,4.1,9.5,2,'#e6b797');roundRect(c,5.6,-9.5-wave,4.1,9.5,2,'#e6b797');
 // Head and large, blushing kawaii eyes.
 roundRect(c,-7,-25,14,15,5.5,'#eac09d','#d4a784');
 c.fillStyle=damiao?'#5b493e':lucia?'#584a53':person.localRole==='senhora'?'#b3a89c':'#59483d';
 c.beginPath();c.ellipse(0,-23,8,5.2,0,Math.PI,Math.PI*2);c.lineTo(7,-19);c.lineTo(5,-24);c.fill();
 if(damiao){c.fillStyle='#68564a';c.beginPath();c.ellipse(0,-27,7.9,2.4,0,Math.PI,Math.PI*2);c.fill();}
 if(lucia){c.fillStyle='#79576b';c.beginPath();c.arc(6,-26,4,0,7);c.fill();c.fillStyle='#e7b4ac';c.beginPath();c.arc(8,-28,2.1,0,7);c.fill();}
 if(bia){c.fillStyle='#635247';c.beginPath();c.arc(6,-25,3,0,7);c.fill();c.fillStyle='#f3d8ad';c.fillRect(-4,-25,8,1.2);}
 if(lucia){c.strokeStyle='#5d4857';c.lineWidth=.75;c.beginPath();c.arc(5,-28,3.8,-1.4,.6);c.stroke();}
 if(bia){c.strokeStyle=['#ebc49a','#acd0ba','#e1b6c6'][wardrobe];c.lineWidth=1.2;c.beginPath();c.arc(0,-24.5,7,Math.PI*1.1,Math.PI*1.85);c.stroke();}
 if(damiao){
  // A low straw hat, grey sideburns and soft moustache rather than generic hair.
  c.fillStyle='#b3a99b';c.fillRect(-7,-24,2,5);c.fillRect(5,-24,2,5);
  roundRect(c,-10,-28,20,3.4,1.5,'#e3c68d');roundRect(c,-6,-34,12,7,3,'#e8d19d');
  c.fillStyle='#ac8668';c.fillRect(-5,-28,10,1.3);
 }
 if(lucia){
  c.fillStyle='#766573';c.beginPath();c.ellipse(5,-29,5,4,0,0,7);c.fill();
  c.fillStyle='#e0b3b0';c.beginPath();c.arc(8,-30,2.6,0,7);c.fill();
  c.strokeStyle='#887462';c.lineWidth=.7;c.beginPath();c.arc(-3,-20,2.5,0,7);c.arc(3,-20,2.5,0,7);c.moveTo(-.5,-20);c.lineTo(.5,-20);c.stroke();
 }
 if(bia){
  c.fillStyle='#534a4b';c.beginPath();c.ellipse(-6,-22,3.3,7,.12,0,7);c.fill();
  c.fillStyle='#d4a36a';c.beginPath();c.ellipse(-1,-27,8,1.5,-.1,0,7);c.fill();
 }
 const blink=!reduce&&Math.floor(time*1.7+person.variant*2)%17===0;
 const surprised=person.greeting?.stage==='notice'&&!person.walking;
 const shy=affection?.expression==='warm'&&!person.walking&&!person.social?.react;
 const farewell=person.social?.stage==='farewell'||person.greeting?.stage==='wave';
 c.strokeStyle='#8e6558';c.lineWidth=.65;c.beginPath();
 const browLift=person.social?.react?1.2:feelings?.fatigue>76?-.9:.15;
 const expressiveBrowLift=surprised?-1.5:shy?.9:browLift;
 c.moveTo(-5,-22+expressiveBrowLift);c.quadraticCurveTo(-3,-23.4+expressiveBrowLift,-1,-22+expressiveBrowLift);
 c.moveTo(1,-22+expressiveBrowLift);c.quadraticCurveTo(3,-23.4+expressiveBrowLift,5,-22+expressiveBrowLift);c.stroke();
 c.fillStyle='#55473d';c.strokeStyle='#695349';c.lineWidth=.8;c.beginPath();
 if(blink||shy||farewell||person.social?.react||affection?.expression==='joy'&&!person.walking){c.moveTo(-4.4+gaze,-18.8);c.quadraticCurveTo(-3+gaze,-20.6,-1.6+gaze,-18.8);c.moveTo(1.6+gaze,-18.8);c.quadraticCurveTo(3+gaze,-20.6,4.4+gaze,-18.8);c.stroke();}
 else{c.arc(-3+gaze,-18.8,surprised?1.45:1.15,0,7);c.arc(3+gaze,-18.8,surprised?1.45:1.15,0,7);c.fill();}
 if(damiao){c.fillStyle='#a68672';c.beginPath();c.ellipse(-1.8,-15.8,2.4,.8,-.18,0,7);c.ellipse(1.8,-15.8,2.4,.8,.18,0,7);c.fill();}
 c.fillStyle='#da9792';c.beginPath();c.ellipse(-5,-16.7,2,1.25,0,0,7);c.ellipse(5,-16.7,2,1.25,0,0,7);c.fill();
 c.strokeStyle='#a06f61';c.lineWidth=.8;c.beginPath();
 if(surprised)c.ellipse(gaze*.33,-16.1,.85,1.2,0,0,Math.PI*2);
 else c.arc(gaze*.33,-16.4,farewell?2.5:shy?1.2:person.social?.react?3:feelings?.fatigue>76?.85:affection?.expression==='joy'?2.7:1.5,.2,Math.PI-.2);
 c.stroke();
 if(affection?.remembered&&!person.walking){c.fillStyle='#fff9e7';c.beginPath();c.arc(-5.3,-22.1,.65,0,7);c.fill();c.fillStyle='#f7d9ae';c.beginPath();c.arc(5,-22, .65,0,7);c.fill();}
 if(damiao){roundRect(c,8,-6,7,6,1.7,'#bc9563','#947655');c.strokeStyle='#947655';c.beginPath();c.arc(11.5,-6,3.5,Math.PI,Math.PI*2);c.stroke();c.fillStyle='#e7c19a';c.fillRect(9,-4,5,1);}
 if(lucia){c.strokeStyle='#5e9363';c.lineWidth=1.3;c.beginPath();c.moveTo(9,-7);c.lineTo(9,-1);c.stroke();c.fillStyle='#eac1cc';for(let j=0;j<5;j++){const a=j*Math.PI*2/5;c.beginPath();c.arc(9+Math.cos(a)*2,-8+Math.sin(a)*2,1.6,0,7);c.fill();}c.fillStyle='#e7cb77';c.beginPath();c.arc(9,-8,1.5,0,7);c.fill();}
 if(bia){roundRect(c,-12,-8,6,8,1,'#fff2cb','#987d65');c.fillStyle='#d0ae79';c.fillRect(-9,-7,1,6);c.strokeStyle='#b68d6b';c.lineWidth=.6;c.beginPath();c.moveTo(-9,-4);c.lineTo(-7,-4);c.stroke();}
 drawSocialGesture(c,person.social,time);
 drawDailyGesture(c,person,time);
 if(person.meeting||!person.walking){
  const badge=person.meeting||affection?.remembered||feelings?.bond>=3?'♥':damiao?'✿':lucia?'❀':bia?'♫':'·';
  c.fillStyle='#fff9e8';c.strokeStyle='#b5a887';c.lineWidth=.85;c.beginPath();c.arc(10,-36,6.5,0,7);c.fill();c.stroke();
  c.fillStyle='#9e755a';c.font='bold 9px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(badge,10,-36);
 }
 if(skyMode==='chuvisco'){
  c.strokeStyle='#6b7680';c.lineWidth=1.1;c.beginPath();c.moveTo(0,-39);c.lineTo(0,-4);c.stroke();
  c.fillStyle=person.variant%2?'#e2b389':'#85a8aa';c.beginPath();c.moveTo(-15,-38);c.quadraticCurveTo(0,-55,15,-38);c.closePath();c.fill();
  c.strokeStyle='#f4eee0';c.lineWidth=.8;c.beginPath();c.moveTo(-15,-38);c.quadraticCurveTo(0,-55,15,-38);c.stroke();
 }
 c.restore();
}
function drawSecondaryWalker(c,person,time){
 const cica=person.id==='cica',nara=person.id==='nara',teo=person.id==='teo';
 const affection=affectionSnapshot(person.id);
 const gaze=Number.isFinite(person.gaze)?person.gaze:person.social?.facing?person.social.facing*.6:person.walking&&Number.isFinite(person.heading)?Math.cos(person.heading)*.7:0;
 const phase=Number.isFinite(person.stridePhase)?person.stridePhase+person.variant:time*8+person.variant;
 const blend=person.walkBlend??Number(!!person.walking);
 const anim=reduce?0:Math.sin(phase)*blend+Math.sin(time*2+person.variant)*(1-blend),step=reduce?0:Math.sin(phase)*1.85*blend;
 const outfit=person.def.tone;
 c.save();c.translate(person.x,person.y);const spriteScale=residentDrawScale(.73);c.scale(spriteScale,spriteScale);
 c.fillStyle='#34544230';c.beginPath();c.ellipse(0,7.5,person.walking?7.8:8.1,person.walking?2.15:2.6,0,0,7);c.fill();
 c.translate(0,reduce?0:anim*.4);
 if(!reduce)c.rotate(person.lean??0);
 roundRect(c,-5,0,4.2,7+step,1.5,'#5b5a5c');roundRect(c,1,0,4.2,7-step,1.5,'#5b5a5c');
 roundRect(c,-5.5,5+step,5,2.2,1,'#6d6151');roundRect(c,.6,5-step,5,2.2,1,'#6d6151');
 roundRect(c,-7.5,-13,15,16,4,outfit,'#f5ead5');
 if(cica){roundRect(c,-5,-11,10,11,3,'#f3d2a8');c.fillStyle='#b3d2bf';c.fillRect(-4,-4,8,1.2);}
 if(nara){c.fillStyle='#f3e3d2';c.beginPath();c.moveTo(-6,-9);c.lineTo(-9,2);c.lineTo(8,2);c.lineTo(6,-9);c.fill();}
 if(teo){c.strokeStyle='#506e80';c.lineWidth=2;c.beginPath();c.moveTo(-6,-12);c.lineTo(7,1);c.stroke();}
 roundRect(c,-10,-10+anim*.7,4,10,2,'#bc866f');roundRect(c,6,-10-anim*.7,4,10,2,'#bc866f');
 roundRect(c,-7.5,-26,15,16,6,cica?'#ad755d':nara?'#d4a184':'#c18f73','#946e60');
 c.fillStyle=cica?'#4b3b3a':nara?'#70524a':'#4f463f';
 if(nara){for(const x of [-6,-1,4]){c.beginPath();c.arc(x,-26,4.6,0,7);c.fill();}}
 else{c.beginPath();c.ellipse(0,-24,8,5.5,0,Math.PI,Math.PI*2);c.lineTo(7,-21);c.fill();}
 if(cica){roundRect(c,-9,-29,18,4,2,'#5c9c9d');c.fillStyle='#78c0bb';c.beginPath();c.arc(9,-27,4,0,7);c.fill();}
 if(teo){roundRect(c,-9,-30,17,5,2,'#5e7eaf');roundRect(c,1,-27,11,2,1,'#53759e');}
 c.fillStyle='#473f3a';c.strokeStyle='#6b4f4b';c.lineWidth=.8;c.beginPath();
 if(person.social?.react||affection?.expression==='joy'&&!person.walking){c.moveTo(-4.2+gaze,-19);c.quadraticCurveTo(-3+gaze,-21,-1.8+gaze,-19);c.moveTo(1.8+gaze,-19);c.quadraticCurveTo(3+gaze,-21,4.2+gaze,-19);c.stroke();}
 else{c.arc(-3+gaze,-19,1.1,0,7);c.arc(3+gaze,-19,1.1,0,7);c.fill();}
 c.strokeStyle='#a06762';c.lineWidth=.85;c.beginPath();c.arc(0,-16.5,affection?.expression==='joy'?2.9:affection?.expression==='warm'?2.4:1.6,.15,Math.PI-.15);c.stroke();
 c.fillStyle='#db9a8e';c.beginPath();c.ellipse(-5,-17,1.8,1,0,0,7);c.ellipse(5,-17,1.8,1,0,0,7);c.fill();
 // Props tell the story: Ciça's ribbons, Nara's sketchbook, Téo's envelopes.
 if(cica){roundRect(c,7,-8,8,5,2,'#e6b884');c.strokeStyle='#78b8b0';c.lineWidth=1.3;c.beginPath();c.arc(10,-8+anim*.7,3,0,7);c.arc(13,-8-anim*.7,3,0,7);c.stroke();if(person.meeting){c.lineWidth=1.9;c.beginPath();c.moveTo(15,-7);c.quadraticCurveTo(22+anim*2,-18,18,-25);c.stroke();}}
 if(nara){roundRect(c,-14,-8,9,9,2,'#faefd9','#a28b77');c.strokeStyle='#b6a3b7';c.lineWidth=.8;c.beginPath();c.moveTo(-12,-5);c.lineTo(-9,-7);c.lineTo(-7,-3);c.stroke();c.strokeStyle='#84665c';c.beginPath();c.moveTo(9,-9);c.lineTo(12,-2+anim);c.stroke();if(person.meeting){c.strokeStyle='#bd8f9b';c.lineWidth=1.2;c.beginPath();c.moveTo(-12,-3);c.quadraticCurveTo(-9+anim,-7,-6,-4);c.stroke();}}
 if(teo){roundRect(c,7,-10,9,11,2,'#c99d74','#987958');roundRect(c,8,-6,7,5,1,'#fff1d7');c.strokeStyle='#be8d77';c.beginPath();c.moveTo(8,-6);c.lineTo(11.5,-3);c.lineTo(15,-6);c.stroke();if(person.meeting){c.save();c.translate(0,anim*1.2);roundRect(c,13,-14,8,6,1.2,'#fff8e6','#c29c76');c.restore();}}
 // The three newer neighbors carry props that echo their current daily routine.
 // A lowered accessory during rest avoids miming work while the journal says resting.
 const daily=(person.activity||'').toLowerCase(),resting=/descansa|pausa|repousa/.test(daily);
 const gesture=reduce?0:Math.sin(time*2.2+person.variant)*(resting?.25:1);
 const showing=!!(person.social?.react||person.social?.pose==='offer'||person.social?.pose==='receive');
 const carry=resting?5:showing?-3+gesture*.45:gesture;
 if(person.id==='rosa'){
  roundRect(c,7,-9+(carry),9,10,1.4,'#d8b78f','#80695d');
  c.strokeStyle='#8d7566';c.lineWidth=.65;c.beginPath();c.moveTo(11,-7+(carry));c.lineTo(11,0+(carry));c.stroke();
 }else if(person.id==='zeca'){
  roundRect(c,7,-6+(carry),9,7,2,'#bb8568','#8c6652');
  c.strokeStyle='#64875c';c.lineWidth=1.2;c.beginPath();c.moveTo(11,-6+(carry));c.lineTo(11,-14+(carry));c.stroke();
  for(const side of [-1,1]){c.fillStyle='#8db28a';c.beginPath();c.ellipse(11+side*3,-12+(carry),3.3,1.7,side*.4,0,7);c.fill();}
 }else if(person.id==='mila'){
  roundRect(c,7,-9+(carry),10,10,1.8,'#f5e2c8','#a6817a');
  for(const [i,color] of ['#c598aa','#89a9a5','#e7c18a'].entries()){c.fillStyle=color;c.beginPath();c.arc(10+i*2,-5+(carry),1.25,0,7);c.fill();}
 }

 drawSocialGesture(c,person.social,time);
 drawDailyGesture(c,person,time);
 if(!person.walking){c.fillStyle='#fffbec';c.beginPath();c.arc(8,-34,5,0,7);c.fill();c.fillStyle='#9e8764';c.font='8px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(affection?.remembered?'♥':'✧',8,-34);}
 c.restore();
}
function wrapEncounterSpeech(speech,limit,maxRows=3){
 const rows=[''];
 for(const word of speech.split(/\s+/)){
  let i=rows.length-1;
  if(rows[i]&&(rows[i]+' '+word).length>limit){rows.push(word);i++;}
  else rows[i]=(rows[i]+' '+word).trim();
 }
 if(rows.length>maxRows){rows.length=maxRows;rows[maxRows-1]=rows[maxRows-1].replace(/[.,;:!? ]+$/,'')+'…';}
 return rows;
}
function drawStreetEncounter(c,time,residents,view){
 const encounter=window.RoncadorStreetEncounters.current(living);
 if(!encounter||encounter.phase!=='visit')return;
 const ids=encounter.cast||[encounter.host,encounter.visitor];
 const guests=ids.map(id=>residents.find(p=>p.id===id));
 if(guests.some(p=>!p||p.arriving))return;
 const cx=guests.reduce((n,p)=>n+p.x,0)/guests.length;
 const cy=Math.min(...guests.map(p=>p.y));
 if(cx<view.left-155||cx>view.right+155||cy<view.top-145||cy>view.bottom+60)return;
 c.save();
 // A warm, animated gesture links actual street positions without asserting a
 // bench, market stall or residence at new coordinates.
 const a=guests[0],b=guests[1];
 window.RoncadorEncounterChoreography.draw(c,time,encounter,guests,living,reduce);
 c.strokeStyle='#d59b7ba0';c.lineWidth=1.5;c.setLineDash([3,4]);
 c.beginPath();c.moveTo(a.x,a.y-27);c.quadraticCurveTo((a.x+b.x)/2,Math.min(a.y,b.y)-44,b.x,b.y-27);c.stroke();c.setLineDash([]);
 const floating=reduce?0:Math.sin(time*2.8)*2;
 c.font='17px system-ui';c.textAlign='center';c.textBaseline='middle';
 c.fillText(encounter.icon,(a.x+b.x)/2,Math.min(a.y,b.y)-37+floating);
 if(guests.length===3)c.fillText('✧',(guests[1].x+guests[2].x)/2,Math.min(guests[1].y,guests[2].y)-36-floating);
 // Distant conversations are visible as a small social signal; the full
 // text appears only when Lia can actually overhear the people on that street.
 // A full speech card belongs to a close conversation, not to the entire
 // market skyline. The encounter continues normally when its card is hidden.
 if(zoom<1.6||Math.hypot(player.x-cx,player.y-cy)>76){c.restore();return;}
 const phrase=window.RoncadorStreetEncounters.line(living,encounter),colon=phrase.indexOf(':');
 const who=colon<0?'Encontro':phrase.slice(0,colon),spoken=colon<0?phrase:phrase.slice(colon+1).trim();
 const phone=matchMedia('(max-width:800px)').matches,rows=wrapEncounterSpeech(spoken,phone?21:28);
 const height=28+rows.length*10,top=cy-83-(reduce?0:Math.sin(time*1.4)*1.1),width=phone?119:151;
 c.shadowColor='#526c5938';c.shadowBlur=5;c.shadowOffsetY=2;
 roundRect(c,cx-width/2,top,width,height,8,'#fff9e9f5','#b7c6aa');
 c.shadowBlur=0;c.shadowOffsetY=0;
 c.fillStyle='#fff9e9';c.beginPath();c.moveTo(cx-5,top+height-1);c.lineTo(cx+3,top+height+7);c.lineTo(cx+10,top+height-1);c.fill();
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#6e8a72';c.font='bold 8px system-ui';c.fillText(who,cx,top+10);
 c.fillStyle='#58614e';c.font='7.3px system-ui';
 rows.forEach((line,i)=>c.fillText(line,cx,top+22+i*10));
 c.restore();
}
function drawCommunityEncounter(c,time,people,view){
 const event=window.RoncadorStreetCommunity.current(living);
 if(!event||event.phase!=='visit')return;
 const pair=[event.host,event.visitor].map(id=>people.find(person=>person.id===id));
 if(pair.some(p=>!p||p.arriving))return;
 const [a,b]=pair,cx=(a.x+b.x)/2,cy=Math.min(a.y,b.y);
 if(cx<view.left-100||cx>view.right+100||cy<view.top-160||cy>view.bottom+40)return;
 window.RoncadorEncounterChoreography.draw(c,time,event,pair,living,reduce);
 const bounce=reduce?0:Math.sin(time*2.2)*1.3;
 c.save();
 // The arc connects characters' props only; it does not invent an object or coordinate on the map.
 c.strokeStyle='#c49079a3';c.lineWidth=1.2;c.setLineDash([2.2,4]);c.beginPath();
 c.moveTo(a.x,a.y-19);c.quadraticCurveTo(cx,cy-31+bounce,b.x,b.y-19);c.stroke();c.setLineDash([]);
 c.font='14px system-ui';c.textAlign='center';c.textBaseline='middle';
 c.fillText(event.icon,cx,cy-33+bounce);
 c.fillStyle='#e8bc83';for(let i=0;i<3;i++){const ox=(i-1)*9;c.beginPath();c.arc(cx+ox,cy-46+(i%2)*4+bounce,.8+(i%2)*.4,0,7);c.fill();}
 if(zoom<1.6||Math.hypot(player.x-cx,player.y-cy)>76){c.restore();return;}
 const phrase=window.RoncadorStreetCommunity.line(living,event),separator=phrase.indexOf(':');
 const speaker=separator>=0?phrase.slice(0,separator):'Amigos',speech=separator>=0?phrase.slice(separator+1).trim():phrase;
 const phone=matchMedia('(max-width:800px)').matches,rows=wrapEncounterSpeech(speech,phone?20:26);
 const width=phone?108:124,height=27+rows.length*9,top=cy-87+bounce;
 c.shadowColor='#344c4230';c.shadowBlur=5;c.shadowOffsetY=2;
 roundRect(c,cx-width/2,top,width,height,9,'#fff9edf5','#d6b8a2');c.shadowBlur=0;c.shadowOffsetY=0;
 c.fillStyle='#fff9ed';c.beginPath();c.moveTo(cx-6,top+height-1);c.lineTo(cx,top+height+6);c.lineTo(cx+7,top+height-1);c.fill();
 c.fillStyle='#a46e65';c.font='bold 8px system-ui';c.fillText(speaker,cx,top+9);
 c.fillStyle='#5a6655';c.font='7px system-ui';rows.forEach((row,i)=>c.fillText(row,cx,top+21+i*9));
 c.restore();
}
function chooseConversationLayer(streetEvent,communityEvent,people,playerPosition){
 if(!streetEvent||streetEvent.phase!=='visit')return 'community';
 if(!communityEvent||communityEvent.phase!=='visit')return 'street';
 const distanceToEvent=(event)=>{
  const ids=event.cast||[event.host,event.visitor];
  const cast=ids.map(id=>people.find(p=>p.id===id));
  if(cast.some(p=>!p||p.arriving))return Infinity;
  const x=cast.reduce((sum,p)=>sum+p.x,0)/cast.length;
  const y=cast.reduce((sum,p)=>sum+p.y,0)/cast.length;
  return Math.hypot(playerPosition.x-x,playerPosition.y-y);
 };
 return distanceToEvent(streetEvent)<=distanceToEvent(communityEvent)?'street':'community';
}
function drawStreetLife(c,time,view){
 // Additional fictional passers-by use existing mapped road paths, not invented streets.
 const walkers=window.RoncadorCrowdFlow.plan(living,fairAtmosphere(),elapsed);
 const residents=residentsInStreets(),secondaries=secondaryInStreets(residents);
 const greeted=streetGreetings.apply(residents.concat(secondaries),elapsed,living);
 residentMotion.hold(greeted);
 const weeklyMeeting=window.RoncadorLivingWorld.weeklyReunion(living);
 if(weeklyMeeting?.phase==='visit'){
  const pair=[weeklyMeeting.host,weeklyMeeting.visitor].map(id=>residents.find(p=>p.id===id));
  if(pair.every(p=>p&&!p.arriving&&!p.walking)&&Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y)<78){
   const age=living.minute-(weeklyMeeting.start+15),farewell=age>=20;
   for(let i=0;i<2;i++){
    const person=pair[i],friend=pair[1-i];
    person.social={pose:farewell?'wave':i===0?'listen':'smile',facing:friend.x>=person.x?1:-1,intensity:farewell?Math.min(1,(25-age)/3):.6,stage:farewell?'farewell':'visit',react:!farewell};
   }
  }
 }
 const event=window.RoncadorEncounterChoreography.current(living);
 if(event&&residents.concat(secondaries).filter(p=>(event.cast||[event.host,event.visitor]).includes(p.id)).every(p=>!p.arriving&&!p.walking))window.RoncadorEncounterChoreography.apply(residents.concat(secondaries),living,event);
 const seasonalPlace=activeSeasonalTheme(new Date())&&worldMomentAt(data,player);
 if(seasonalPlace&&seasonalEncounter(seasonalPlace,residents.concat(secondaries),player,{
  marketClaimed:marketMorning.claimed,cicaKnown:sideNeighbors.seen.includes('cica'),
  gardenClaimed:luciaGarden.claimed,biaKnown:living.people.bia?.bond>0,
  letterClaimed:biaLetters.claimed,recadosClaimed:sideNeighbors.recados?.stage===3
 })){
  const partners={mercado:['damiao','cica'],igreja:['lucia','bia'],rodoviaria:['bia','teo']}[seasonalPlace]||[];
  for(const person of residents.concat(secondaries))if(partners.includes(person.id)&&!person.social&&!person.meeting&&!person.walking&&!person.arriving){
   const friend=residents.concat(secondaries).find(other=>partners.includes(other.id)&&other.id!==person.id);
   person.social={pose:'smile',stage:'seasonal',facing:friend?.x>=person.x?1:-1,intensity:reduce?1:.65,react:true};
  }
 }
 const ambientPeople=[];
 const conversationSpace=residents.concat(secondaries).filter(p=>greeted.includes(p.id));
 for(const passer of walkers){
  const occupied=residents.concat(secondaries,ambientPeople);
  const at=window.RoncadorCrowdFlow.openSlot(shift=>walkingPoint(passer.id,passer.hub,passer.variant,shift),occupied,roadDetails?.junctions||[],23,houses,passer.id,elapsed,conversationSpace);
  if(!at)continue;
  const passerNow=residentMotion.resolve({...passer,...at},elapsed,living.day);
  // A detour in progress keeps its walking pose; no mid-step wave or pause.
  if(passerNow.arriving||passerNow.walking){passerNow.moment=null;passerNow.social=null;}
  if(residents.concat(secondaries,ambientPeople).some(p=>Math.hypot(p.x-passerNow.x,p.y-passerNow.y)<22))continue;
  ambientPeople.push(passerNow);
 }
 ambientHitTargets=ambientPeople;
 const people=[...ambientPeople,...residents,...secondaries].sort((a,b)=>a.y-b.y);
 // Labels are a proximity aid, not a second layer of billboards over the town.
 const nameplates=layoutResidentNameplates(people,player,zoom,matchMedia('(max-width:800px)').matches);
 for(const person of people){
  if(marketReaction?.id===person.id&&elapsed<marketReaction.until&&!person.social&&!person.meeting&&!person.travel){
   const age=elapsed-(marketReaction.until-5.5);
   if(age<2)person.social={pose:'wave',facing:1,intensity:Math.max(0,Math.min(1,age/.3,(2-age)/.4)),react:true};
  }
  residentMotion.present(person,elapsed,reduce);
  // A nearby friend can share a quiet smile when already stopped; do not
  // interrupt a route, a scripted greeting or another resident's encounter.
  if(worldPause&&worldPause.age>.4&&worldPause.age<3.2&&person.def&&!person.arriving&&!person.walking&&!person.social&&!person.meeting&&living.people[person.id]?.bond>0&&Math.hypot(person.x-player.x,person.y-player.y)<42){
   person.social={pose:'smile',stage:'quiet',facing:player.x>=person.x?1:-1,intensity:reduce?1:Math.min(1,(worldPause.age-.4)*2),react:true};
  }
  if(person.x<view.left-25||person.x>view.right+25||person.y<view.top-25||person.y>view.bottom+25)continue;
  // One representation per frame avoids ghost outlines at intermediate zoom.
  if(zoom<1.15)drawDistantResident(c,person);
  else if(person.secondary)drawSecondaryWalker(c,person,time);
  else drawKawaiiWalker(c,person,time);
  if(zoom>=1.3&&person.greeting&&Math.hypot(player.x-person.x,player.y-person.y)<95){
   const greeting=person.greeting,parting=['look','wave','turn'].includes(greeting.stage);
   const afternoon=greeting.nearPorch&&living.minute>=16*60+30&&living.minute<18*60+30;
   const label=parting?'Até já! ♡':afternoon?'Boa tardinha ♡':'Oi! ♡';
   const width=afternoon&&!parting?72:parting?46:28;
   const opacity=Math.max(0,Math.min(1,greeting.age/.45,(4.4-greeting.age)/.35));
   c.save();c.globalAlpha*=opacity;
   c.fillStyle='#fff8e8';c.strokeStyle='#bda78e';c.lineWidth=.8;c.beginPath();
   c.roundRect(person.x-width/2,person.y-55,width,14,6);c.fill();c.stroke();
   c.fillStyle='#a77868';c.font='8px system-ui';c.textAlign='center';c.fillText(label,person.x,person.y-45);c.restore();
  }
  if(zoom>=1.2&&person.id==='bia'&&person.activity&&(person.activity.includes('lendo')||person.activity.includes('estudando')||person.encounter?.id==='caderno-na-feira')){
   // A page-turning pocket notebook follows Bia's fictional routine along the
   // mapped streets; no reading spot or bench is added at invented coordinates.
   const turn=!reduce&&Math.sin(time*1.75)>.83;
   c.save();c.translate(person.x,person.y);const spriteScale=residentDrawScale(.82);c.scale(spriteScale,spriteScale);c.translate(9,-10);c.scale(.84,.84);
   c.fillStyle='#547d91';c.beginPath();c.moveTo(-9,-6);c.quadraticCurveTo(-4,-9,0,-5);c.quadraticCurveTo(5,-9,9,-6);c.lineTo(9,4);c.quadraticCurveTo(4,1,0,4);c.quadraticCurveTo(-4,1,-9,4);c.closePath();c.fill();
   c.fillStyle='#fcf8e8';c.beginPath();c.moveTo(-7,-5);c.quadraticCurveTo(-3,-7,0,-3);c.lineTo(0,2);c.quadraticCurveTo(-4,0,-7,2);c.closePath();c.fill();
   c.beginPath();c.moveTo(0,-3);c.quadraticCurveTo(4,-7,7,-5);c.lineTo(7,2);c.quadraticCurveTo(3,0,0,2);c.closePath();c.fill();
   c.strokeStyle='#c9af9d';c.lineWidth=.65;for(const shift of [-5,2]){c.beginPath();c.moveTo(shift,-2);c.lineTo(shift+2,-2);c.stroke();}
   if(turn){c.fillStyle='#eadcc4';c.beginPath();c.moveTo(0,-3);c.lineTo(5,-7);c.lineTo(1,2);c.closePath();c.fill();}
   if(biaLetters.sealed){c.fillStyle='#f9d4d7';c.font='bold 7px system-ui';c.textAlign='center';c.fillText('♥',0,-12);}
   c.restore();
  }
  if(zoom>=1.2&&person.id==='lucia'&&person.activity&&(person.activity.includes('jardins')||person.activity.includes('flores'))){
   // Portable fictional flowerpot near Lúcia's hands; no asserted garden GPS.
   const nod=reduce?0:Math.sin(time*2.1)*.9;
   c.save();c.translate(person.x,person.y);const spriteScale=residentDrawScale(.82);c.scale(spriteScale,spriteScale);c.translate(11,-7);c.scale(.82,.82);
   c.fillStyle='#5e6f592c';c.beginPath();c.ellipse(0,13,8,3,0,0,7);c.fill();
   roundRect(c,-5,1,10,10,2,'#c68e80','#8f7268');
   c.strokeStyle='#65966c';c.lineWidth=1.6;c.beginPath();c.moveTo(0,2);c.lineTo(nod,-11);c.stroke();
   c.fillStyle='#87ac77';c.beginPath();c.ellipse(-3,-7,4,2,-.6,0,7);c.ellipse(3,-10,4,2,.6,0,7);c.fill();
   c.fillStyle='#e6b5cc';c.beginPath();c.arc(nod,-12,luciaGarden.claimed?3.8:2.6,0,7);c.fill();
   if(luciaGarden.work.includes('agua')){c.fillStyle='#94b6d0';c.beginPath();c.arc(9,-9+nod,1.2,0,7);c.arc(11,-5-nod,1,0,7);c.fill();}
   if(luciaGarden.claimed){c.fillStyle='#f5efd5';c.font='bold 8px system-ui';c.fillText('♥',-11,-17);}
   c.restore();
  }
  if(zoom>=1.2&&person.id==='damiao'&&(person.activity==='organizando a feira'||person.encounter?.phase==='visit')&&(!marketMorning.claimed||nearMarket(130)||person.encounter?.phase==='visit')){
   // Attached to the fictional character, not an invented vendor coordinate.
   const wiggle=reduce?0:Math.sin(time*2.5)*1.6;
   c.save();c.translate(person.x,person.y);const spriteScale=residentDrawScale(.82);c.scale(spriteScale,spriteScale);c.translate(11,-8);c.scale(.84,.84);
   c.fillStyle='#947458';c.beginPath();c.ellipse(3,8,10,3,0,0,7);c.fill();
   roundRect(c,-4,-5,15,11,2,'#b18b61','#806c4c');
   for(let k=0;k<3;k++){c.fillStyle=['#e7b85e','#c98c52','#97a66c'][k];c.beginPath();c.arc(-1+k*4,-7+wiggle*(k===1?1:0),2.5,0,7);c.fill();}
   c.fillStyle='#fff8e8';c.font='bold 6px system-ui';c.textAlign='center';c.fillText(marketMorning.claimed?'♥':'♪',3,-17);
   c.restore();
  }
  if(zoom>=1.2&&marketReaction?.id===person.id&&elapsed<marketReaction.until&&!person.meeting&&Math.hypot(player.x-person.x,player.y-person.y)<130){
   roundRect(c,person.x-49,person.y-79,98,16,6,'#fff8e9','#c4ae8c');c.font='7px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#7d7258';c.fillText('Ficou bonita, Francisco!',person.x,person.y-71);
  }
 }
 // Labels are the last resident layer: another passing sprite cannot cut them
 // in half, and the higher-priority conversation overlay comes after them.
 for(const label of nameplates){
  roundRect(c,label.x-label.width/2,label.y-6.5,label.width,13,5,'#fffcf1ed','#b4c2a1');
  c.font='750 8px system-ui';c.fillStyle='#526746';c.textAlign='center';c.textBaseline='middle';c.fillText(label.name,label.x,label.y);
 }
}
let boltMarketRoad=null;
function boltCityPoint(){
 if(boltMarketRoad===null){
  // Use the existing game start on the mapped road, never an absent private-house POI.
  const home={p:data.start};
  const market=data.landmarks.find(p=>p.id==='mercado');
  const route=home&&market&&pathfinder?.route(home.p,market.p);
  // The final point is a POI connector, not necessarily a street: stay on road vertices.
  const points=route?.points?.slice(0,-1);
  const valid=points?.length>=2&&points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
  boltMarketRoad=valid?points:false;
 }
 if(!boltMarketRoad)return walkingPoint('bolt','inicio',5)||{x:data.start[0],y:data.start[1],walking:false};
 const clock=living.minute;
 const going=clock>=8*60&&clock<9*60+15;
 const returning=clock>=10*60&&clock<11*60+15;
 const progress=going?(clock-8*60)/75:returning?1-(clock-10*60)/75:
  clock>=9*60+15&&clock<10*60?1:0;
 const points=boltMarketRoad;
 let total=0;
 for(let i=1;i<points.length;i++)total+=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
 if(total<1)return walkingPoint('bolt','inicio',5)||{x:data.start[0],y:data.start[1],walking:false};
 let remaining=Math.max(0,Math.min(1,progress))*total;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);
  if(remaining<=length||i===points.length-1){
   const t=length?Math.min(1,remaining/length):0;
   return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,walking:going||returning};
  }
  remaining-=length;
 }
 return {x:points[0].x,y:points[0].y,walking:false};
}
function boltRestingByGreen(at){
 if(!at||at.walking)return false;
 const nearby=(p,r)=>Math.hypot(p.x-at.x,p.y-at.y)<r;
 return floraLayer.points.some(p=>['canopy','shade','flowerbed'].includes(p.kind)&&nearby(p,27))||
  detailedFacades&&houses.some(h=>h.seed%7===2&&['matriz','joao','clovis'].includes(h.centralBlock)&&nearby(h,30));
}
function streetPetBehavior(pet,at,minute,weather,playerPoint,people=[]){
 // Pure, deterministic poses: no new coordinates, timers or saved state.
 const rain=weather==='chuvisco';
 const night=minute<7*60||minute>=20*60;
 const resting=!!pet.bolt&&boltRestingByGreen(at)||!at.walking&&(rain||pet.cat&&night);
 const curious=!rain&&!at.walking&&playerPoint&&Math.hypot(playerPoint.x-at.x,playerPoint.y-at.y)<34;
 const observing=!rain&&!at.walking&&people.some(person=>Number.isFinite(person?.x)&&Number.isFinite(person?.y)&&Math.hypot(person.x-at.x,person.y-at.y)<26);
 return {resting,curious:!!curious,observing,tailRate:curious?4:observing?2:resting?1.2:pet.cat?2.4:3.2,bounce:resting?.18:at.walking?.78:observing?.24:.45};
}
function streetPetVisualOffset(at,people){
 // Visual breathing room only: never change the animal's mapped road point.
 // Keep displacement bounded so pets cannot appear to jump into buildings.
 if(!at||!Array.isArray(people))return {x:0,y:0};
 let nearest=null,best=Infinity;
 for(const person of people){
  if(!Number.isFinite(person?.x)||!Number.isFinite(person?.y))continue;
  const dx=at.x-person.x,dy=at.y-person.y,d=Math.hypot(dx,dy);
  if(d<best){best=d;nearest={dx,dy};}
 }
 if(!nearest||best>=17)return {x:0,y:0};
 const amount=Math.min(4,(17-best)*.35);
 const length=best||1;
 return {x:best?nearest.dx/length*amount:amount,y:best?nearest.dy/length*amount:0};
}
function drawStreetPets(c,time,view,people=[]){
 const candidates=[{id:'bolt',name:'Bolt 🐕',hub:'inicio',variant:5,cat:false,bolt:true},{id:'gatinho',hub:'inicio',variant:7,cat:true},{id:'cachorrinho',hub:'mercado',variant:8,cat:false},{id:'gatinho-2',hub:'igreja',variant:9,cat:true}];
 const daylight=living.minute>=7*60&&living.minute<20*60;
  for(const pet of candidates){
  if(!daylight&&pet.variant!==7)continue;
  const at=pet.bolt?boltCityPoint():walkingPoint(pet.id,pet.hub,pet.variant);if(!at)continue;
  const greenRest=pet.bolt&&boltRestingByGreen(at),behavior=streetPetBehavior(pet,at,living.minute,skyMode,player,people);
  if(at.x<view.left-18||at.x>view.right+18||at.y<view.top-18||at.y>view.bottom+18)continue;
  const bounce=reduce?0:Math.sin(time*(behavior.resting?1.25:pet.cat?3.7:5.2)+pet.variant)*behavior.bounce;
   const offset=streetPetVisualOffset(at,people);
   c.save();c.translate(at.x+offset.x,at.y+offset.y+bounce);
  c.fillStyle='#3d58452f';c.beginPath();c.ellipse(0,3,8,2.3,0,0,7);c.fill();
  const fur=pet.bolt?'#eee0c3':pet.cat?'#f0d3ac':'#cd9870';
  if(zoom<1.15){
   // At wide zoom, avoid subpixel eyes, ears and overlapping fine outlines.
   c.strokeStyle='#8f765e';c.lineWidth=1.3;c.lineCap='round';
   c.beginPath();c.moveTo(4,-3);c.quadraticCurveTo(9,-9,7,-11);c.stroke();
   roundRect(c,-6,-7,12,8,3.5,fur,'#977861');
   c.fillStyle=fur;c.beginPath();c.arc(-4,-7,3.6,0,Math.PI*2);c.fill();
   if(pet.bolt){
    c.fillStyle='#75665e';c.beginPath();c.ellipse(-6,-8,1.8,2.7,-.4,0,Math.PI*2);c.fill();
    // Keep the familiar name readable even in the simplified far-zoom sprite.
    c.fillStyle='#fff9eb';c.strokeStyle='#9b8068';c.lineWidth=.6;
    roundRect(c,-12,-20,24,8,3,'#fff9eb','#9b8068');
    c.fillStyle='#5c4a38';c.font='bold 6px system-ui';c.textAlign='center';c.fillText('Bolt',0,-14);
   }
   c.restore();continue;
  }
  c.strokeStyle=fur;c.lineWidth=2.4;c.lineCap='round';c.beginPath();c.moveTo(4,-1);c.quadraticCurveTo(13,-11+(reduce?0:Math.sin(time*behavior.tailRate+pet.variant)*(behavior.resting?.7:2)),9,-13);c.stroke();
  roundRect(c,-6,-7,12,9,4,fur,'#9c846b');
  c.fillStyle=pet.bolt?'#d7bb91':fur;c.beginPath();c.arc(-3,-6,5,0,7);c.fill();
  if(pet.bolt){
   // Bolt's pale coat, darker floppy ears and charcoal muzzle come from the
   // author's photographs; the source photos stay outside the game/repository.
   c.fillStyle='#6d5d55';c.beginPath();c.ellipse(-6.5,-8,2.2,4,-.3,0,Math.PI*2);c.fill();
   c.fillStyle='#8d7868';c.beginPath();c.ellipse(-1,-7,2.6,3.2,.25,0,Math.PI*2);c.fill();
   c.fillStyle='#aa998b';c.beginPath();c.ellipse(-4.8,-4.1,3.7,2.2,0,0,Math.PI*2);c.fill();
   c.fillStyle='#393536';c.beginPath();c.arc(-7,-4.2,1.4,0,Math.PI*2);c.fill();
   c.strokeStyle='#4c4740';c.lineWidth=1.2;c.beginPath();c.moveTo(-5,-1.9);c.lineTo(3,-1.9);c.stroke();
  }
  if(pet.cat){c.beginPath();c.moveTo(-7,-9);c.lineTo(-7,-15);c.lineTo(-2,-11);c.moveTo(0,-11);c.lineTo(4,-15);c.lineTo(4,-8);c.fill();}
  else{roundRect(c,-8,-10,4,8,2,'#a47359');}
  const glance=behavior.curious?.4:behavior.observing?-.35:0;
  c.fillStyle='#51483e';c.beginPath();c.arc(-5+glance,-7,0.8,0,7);c.arc(-1+glance,-7,0.8,0,7);c.fill();
  c.strokeStyle='#a77a67';c.lineWidth=.6;c.beginPath();c.moveTo(-3,-5);c.lineTo(-3,-3);c.stroke();
  if(greenRest&&zoom>=1.15){
   // Bolt quietly watches the plants during a natural stop on his street route.
   c.fillStyle='#7aa275';c.beginPath();c.ellipse(9,-12,2.1,1.2,-.6,0,Math.PI*2);c.fill();
  }
  if(pet.name&&zoom>1.2){
   roundRect(c,-18,-22,36,10,4,'#fff9ebee','#b89f7d');
   c.fillStyle='#5c4a38';c.font='bold 6.5px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(pet.name,0,-17);
  }
  c.restore();
 }
}
function drawPuddles(c,time,view){
 if(skyMode!=='chuvisco')return;
 let shown=0;
 for(let i=0;i<segments.length&&shown<65;i++){
  const s=segments[i],seed=hash(i*19,13);if(seed<.82||s.len<12)continue;
  const x=s.ax+s.dx*.54,y=s.ay+s.dy*.54;
  if(x<view.left||x>view.right||y<view.top||y>view.bottom)continue;
  c.fillStyle='#90b9bc7d';c.beginPath();c.ellipse(x,y,5+seed*3,2.1,Math.atan2(s.dy,s.dx),0,7);c.fill();
  c.strokeStyle='#fffaf18c';c.lineWidth=.65;c.beginPath();c.ellipse(x,y,2.3+(reduce?0:Math.sin(time*3+i)*.5),.8,Math.atan2(s.dy,s.dx),0,7);c.stroke();shown++;
 }
}
function drawSkyWeather(time){
 if(skyMode==='sol')return;
 ctx.save();ctx.fillStyle=skyMode==='chuvisco'?'#5c8a9c22':'#afc0ae20';ctx.fillRect(0,0,w,h);
 for(let i=0;i<4;i++){
  const cx=w*(i+.3)/3.5+(reduce?0:Math.sin(time*.055+i)*25),cy=38+hash(i,92)*92;
  const gradient=ctx.createRadialGradient(cx,cy,2,cx,cy,135);
  gradient.addColorStop(0,skyMode==='chuvisco'?'#e0eaf68a':'#fff9de70');gradient.addColorStop(1,'#e7ead500');
  ctx.fillStyle=gradient;ctx.fillRect(cx-135,cy-135,270,270);
 }
 if(skyMode==='chuvisco'){
  ctx.lineWidth=1.1;ctx.strokeStyle='#e5f4fb9c';ctx.beginPath();
  for(let i=0;i<110;i++){
   const x=(hash(i*73,6)*w+(reduce?0:time*95))%(w+35)-17;
   const y=(hash(i*31,21)*h+(reduce?0:time*215))%(h+28)-14;
   ctx.moveTo(x,y);ctx.lineTo(x-4,y+12);
  }
  ctx.stroke();
 }
 ctx.restore();
}
function drawGeology(c,view){
 if(!showGeology)return;
 for(const p of geologyPoints){const [x,y]=p.p;if(x<view.left||x>view.right||y<view.top||y>view.bottom)continue;
  c.fillStyle='#fcf4dc';c.strokeStyle='#775b71';c.lineWidth=1.3;c.beginPath();c.arc(x,y,5.5,0,7);c.fill();c.stroke();
  c.fillStyle='#9b7889';c.beginPath();c.moveTo(x-3,y+2);c.lineTo(x,y-3);c.lineTo(x+3,y+2);c.closePath();c.fill();
  if(zoom>1.9){c.font='600 7px system-ui';c.textAlign='center';c.lineWidth=2.5;c.strokeStyle='#fff9e9';c.strokeText('SGB '+p.id,x,y-12);c.fillStyle='#715b63';c.fillText('SGB '+p.id,x,y-12);}
 }
}
function drawGuide(c,time){
 c.save();c.translate(guide.x,guide.y);const spriteScale=characterDrawScale(WORLD_CHARACTER_HEIGHT/38);c.scale(spriteScale,spriteScale);
 const bob=reduce?0:Math.sin(time*2.1)*1.2;
 c.fillStyle='#2947372d';c.beginPath();c.ellipse(0,8,11,5,0,0,7);c.fill();
 c.translate(0,bob);roundRect(c,-7,1,5,7,2,'#5b6474');roundRect(c,2,1,5,7,2,'#5b6474');
 roundRect(c,-9,-12,18,16,5,'#9fb8a1','#708a7b');roundRect(c,5,-10,7,12,3,'#b27e59');
 roundRect(c,-7,-25,14,15,6,'#dba988');
 c.fillStyle='#594e44';c.beginPath();c.arc(0,-24,8,Math.PI,Math.PI*2);c.fill();
 c.fillStyle='#433c35';c.fillRect(-3,-19,1.5,2);c.fillRect(2,-19,1.5,2);
 roundRect(c,-10,-32,20,7,3,'#b68e64');roundRect(c,-6,-37,12,9,3,'#c5a376');
 c.fillStyle='#e8efcc';c.fillRect(-9,-7,6,5);
 c.fillStyle='#fff9e3';c.strokeStyle='#cfaa63';c.lineWidth=1.2;c.beginPath();c.arc(0,-52,11,0,7);c.fill();c.stroke();
 c.fillStyle='#9d8351';c.font='bold 13px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(chapter>=3?'♥':'!',0,-52);
 c.restore();
}
function render(time){
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#aac18d';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.scale(zoom,zoom);ctx.translate(-camera.x,-camera.y);
 const left=camera.x-w/2/zoom-60,right=camera.x+w/2/zoom+60,top=camera.y-h/2/zoom-60,bottom=camera.y+h/2/zoom+60;
 region(ctx,true);
 if(showTerrain)window.RoncadorTerrainRelief.draw(ctx,terrainLayer,{left,right,top,bottom},zoom);
 // Small seeded ground details stay attached to the geographic world.
 for(let gx=Math.floor(left/44);gx<right/44;gx++)for(let gy=Math.floor(top/44);gy<bottom/44;gy++){let r=hash(gx,gy),x=gx*44+r*38,y=gy*44+hash(gy,gx)*38;ctx.fillStyle=r>.5?'#c3d19d60':'#819e6b25';ctx.beginPath();ctx.ellipse(x,y,5+r*13,3+r*5,r*3,0,Math.PI*2);ctx.fill();if(r>.83){ctx.fillStyle='#e4d3a6';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(x+j*3,y+(j%2)*3,1.3,0,7);ctx.fill();}}}
 drawVerifiedWater(ctx);
 drawFlowers(ctx,left,right,top,bottom);
 drawScenicLayer(ctx,{left,right,top,bottom},false);
 drawRoads(ctx,zoom,false,{left,right,top,bottom});
 window.RoncadorRoadDetails.draw(ctx,roadDetails,{left,right,top,bottom},zoom);
 drawPuddles(ctx,time,{left,right,top,bottom});
 drawMappedPlaces(ctx,{left,right,top,bottom});
 const visibleHouses=houses.filter(b=>b.x>left&&b.x<right&&b.y>top&&b.y<bottom);for(const b of visibleHouses)house(ctx,b);
 drawGroundedFlora(ctx,{left,right,top,bottom},time);
 // Trees are illustrative scenery. Keep roads, the field and homes clear.
 for(let gx=Math.floor(left/45);gx<right/45;gx++)for(let gy=Math.floor(top/45);gy<bottom/45;gy++){
  const key=gx+','+gy;let tree=treeCache.get(key);
  if(tree===undefined){
   let seed=Math.floor(hash(gx*7,gy*11)*10000),x=gx*45+hash(gx,gy)*32,y=gy*45+hash(gy+30,gx+2)*32;
   const village=areas.some(a=>a.tags.landuse==='residential'&&inside(x,y,a.p[0]));
   tree=null;
   if((seed%10)>=(village?8:2)&&nearestRoad(x,y).d>=22&&(!marketStall||Math.hypot(x-marketStall.p[0],y-marketStall.p[1])>=22)&&!houses.some(b=>Math.hypot(x-b.x,y-b.y)<20)&&!scenicScenes.some(scene=>window.RoncadorScenicPlacement.contains(window.RoncadorScenicPlacement.bounds(scene,12),x,y))&&!areas.some(a=>a.tags.leisure==='pitch'&&inside(x,y,a.p[0]))&&!verifiedWater.some(w=>inside(x,y,w.p)))tree={x,y,seed,r:10+seed%8,rural:!village};
   treeCache.set(key,tree);
  }
  if(tree){
   const cordeiro=data.landmarks.find(l=>l.id==='pedra_cordeiro')?.p;
   if(tree.rural&&cordeiro&&tree.seed%19===0&&Math.hypot(tree.x-cordeiro[0],tree.y-cordeiro[1])<360)
    drawCordeiroCactus(ctx,tree.x,tree.y,tree.r,tree.seed);
   else if(tree.rural&&tree.seed%5===0)drawRuralShrub(ctx,tree.x,tree.y,tree.r,tree.seed);
   else drawTree(ctx,tree.x,tree.y,tree.r,tree.seed);
  }
 }
 drawWildlife(ctx,time,{left,right,top,bottom});
 if(showScenery){
  const stalls=fairAtmosphere()?fairStalls:marketStallVisible()?[marketStall]:[];
  window.RoncadorFairStreets.draw(ctx,stalls,{left,right,top,bottom},time,reduce,marketMorning.talked&&marketStall?{stall:marketStall,state:marketMorning,slots:marketFruitSlots,label:zoom>1.2&&Math.hypot(player.x-marketStall.p[0],player.y-marketStall.p[1])<130}:null);
  // Decorative reward tied to the existing fictional market stall and saved choice.
  // It is not a mapped building, business sign or newly invented coordinate.
  if(marketStall&&stalls.includes(marketStall)&&marketMorning.claimed&&sideNeighbors.choices?.cica==='banca'){
   const [rx,ry]=marketStall.p;
   if(rx>=left-35&&rx<=right+35&&ry>=top-35&&ry<=bottom+35){
    ctx.save();ctx.translate(rx,ry-17);
    ctx.strokeStyle='#658d87';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(-5,-4);ctx.quadraticCurveTo(0,-1,5,-4);ctx.stroke();
    ctx.fillStyle='#79bbb3';ctx.strokeStyle='#477b74';ctx.lineWidth=.7;
    for(const flip of [-1,1]){ctx.beginPath();ctx.moveTo(0,-4);ctx.quadraticCurveTo(flip*9,-13,flip*10,-4);ctx.quadraticCurveTo(flip*8,3,0,-4);ctx.fill();ctx.stroke();}
    ctx.fillStyle='#e8ca8c';ctx.beginPath();ctx.arc(0,-4,2.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#76afa6';ctx.beginPath();ctx.moveTo(-2,-2);ctx.lineTo(-5,7);ctx.lineTo(-1,5);ctx.lineTo(1,-2);ctx.moveTo(1,-2);ctx.lineTo(4,7);ctx.lineTo(6,4);ctx.lineTo(2,-3);ctx.fill();
    ctx.restore();
   }
  }
 }
 drawScenicLayer(ctx,{left,right,top,bottom},true);
 drawClovisNeighborhoodScene(ctx,time,{left,right,top,bottom});drawParkedMotosAndSorda(ctx,time,{left,right,top,bottom});drawDailyActivity(ctx,time,{left,right,top,bottom});
 // OSM POIs remain small and separate from the artwork.
 window.RoncadorLandmarks?.drawMarkers(ctx,data.landmarks,{left,right,top,bottom},zoom);
 drawGeology(ctx,{left,right,top,bottom});
 // Low-key real street labels.
 ctx.textAlign='center';ctx.textBaseline='middle';for(const l of labels){if(l.x<left||l.x>right||l.y<top||l.y>bottom)continue;ctx.save();ctx.translate(l.x,l.y);let angle=l.angle;if(angle>Math.PI/2)angle-=Math.PI;if(angle<-Math.PI/2)angle+=Math.PI;ctx.rotate(angle);ctx.font=`500 ${Math.max(5,9/zoom)}px system-ui`;ctx.lineWidth=2/zoom;ctx.strokeStyle='#e5ddbd';ctx.strokeText(l.name,0,0);ctx.fillStyle='#7e8261';ctx.fillText(l.name,0,0);ctx.restore();}
 if(waypoint){const route=[{x:player.x,y:player.y},...waypoint.points.slice(waypoint.index)];ctx.strokeStyle='#f8f1cbbe';ctx.lineWidth=5/zoom;path(ctx,route.map(p=>[p.x,p.y]));ctx.stroke();ctx.strokeStyle='#487a5bc8';ctx.lineWidth=2.5/zoom;ctx.setLineDash([6/zoom,4/zoom]);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#426d4b';ctx.lineWidth=2/zoom;ctx.beginPath();ctx.arc(waypoint.x,waypoint.y,5,0,Math.PI*2);ctx.stroke();}
 // When a larger character crosses a mission marker, keep the GPS pin at its
 // exact mapped coordinate but draw it behind the sprite instead of across a
 // face. Pins away from characters keep their usual foreground contrast.
 const castNow=residentsInStreets(),pinsBehind=new Set();
 const peopleNearPins=[...castNow,...secondaryInStreets(castNow),player,guide];
 for(let i=0;i<missions.length;i++)if(peopleNearPins.some(p=>Math.hypot(missions[i].p[0]-p.x,missions[i].p[1]-p.y)<35)){drawPin(ctx,missions[i],i,time,false,true);pinsBehind.add(i);}
 drawStreetLife(ctx,time,{left,right,top,bottom});
  drawStreetPets(ctx,time,{left,right,top,bottom},peopleNearPins);
 for(let i=0;i<missions.length;i++)if(!pinsBehind.has(i))drawPin(ctx,missions[i],i,time);
 // The guide and player use the same distant scale as the other residents.
 const mapDetail=Math.max(0,Math.min(1,(zoom-.95)/.30));
 if(mapDetail<1){
  ctx.save();ctx.globalAlpha*=1-mapDetail;
  drawDistantResident(ctx,{x:guide.x,y:guide.y,def:{tone:'#9fb8a1'},id:'guide'});
  drawDistantResident(ctx,{x:player.x,y:player.y,def:{tone:'#d97854'},id:'player'});
  ctx.strokeStyle='#fff9e4';ctx.lineWidth=1.8/zoom;ctx.beginPath();ctx.arc(player.x,player.y-5,8,0,Math.PI*2);ctx.stroke();
  ctx.restore();
 }
 if(mapDetail>0){ctx.save();ctx.globalAlpha*=mapDetail;drawGuide(ctx,time);drawPlayer(ctx,time);ctx.restore();}
 for(const p of particles){ctx.globalAlpha=Math.min(1,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();}ctx.globalAlpha=1;
 for(const ep of emojiParticles){
  ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,ep.life/.45));
  ctx.font=Math.round(ep.size)+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(ep.emoji,ep.x,ep.y);ctx.restore();
 }
 // Conversation lettering stays above the pets, quest pins and player so none
 // of those animated objects can cover the words mid-sentence.
 const speakers=castNow.concat(secondaryInStreets(castNow));
 const conversationLayer=chooseConversationLayer(window.RoncadorStreetEncounters.current(living),window.RoncadorStreetCommunity.current(living),speakers,player);
 if(conversationLayer==='street')drawStreetEncounter(ctx,time,castNow,{left,right,top,bottom});
 else drawCommunityEncounter(ctx,time,speakers,{left,right,top,bottom});
 ctx.restore();
 // Purely pictorial daylight: no claim about the current sky, climate or lamp coordinates.
 if(lightPhase==='tarde'){
  const gold=ctx.createLinearGradient(0,0,w,h);gold.addColorStop(0,'#f9df9c3d');gold.addColorStop(.58,'#f9c89c22');gold.addColorStop(1,'#ba926519');
  ctx.fillStyle=gold;ctx.fillRect(0,0,w,h);
 }else if(lightPhase==='anoitecer'){
  ctx.fillStyle='#31465c83';ctx.fillRect(0,0,w,h);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const scene of scenicScenes){if(!showScenery)break;
   const sx=(scene.at[0]-camera.x)*zoom+w/2,sy=(scene.at[1]-camera.y)*zoom+h/2;
   if(sx < -150||sx > w+150||sy < -150||sy > h+150)continue;
   const radius=scene.kind==='square'?125:76;
   const glow=ctx.createRadialGradient(sx,sy,8,sx,sy,radius);
   glow.addColorStop(0,'#fcebb052');glow.addColorStop(.5,'#f6c9851b');glow.addColorStop(1,'#f6c98500');
   ctx.fillStyle=glow;ctx.fillRect(sx-radius,sy-radius,radius*2,radius*2);
  }
  ctx.restore();
 }
 drawSkyWeather(time);
}
function explorationBounds(){const radius=400;return{minX:player.x-radius,maxX:player.x+radius,minY:player.y-radius,maxY:player.y+radius};}
function wholeBounds(){if(wholeBounds.cache)return wholeBounds.cache;const pts=roads.flatMap(r=>r.p).concat(areas.flatMap(a=>a.p.flat()));return wholeBounds.cache={minX:Math.min(...pts.map(p=>p[0]))-100,maxX:Math.max(...pts.map(p=>p[0]))+100,minY:Math.min(...pts.map(p=>p[1]))-100,maxY:Math.max(...pts.map(p=>p[1]))+100};}
function overview(c,ww,hh,bounds,large){c.clearRect(0,0,ww,hh);c.fillStyle='#b8c79c';c.fillRect(0,0,ww,hh);let s=Math.min((ww-26)/(bounds.maxX-bounds.minX),(hh-26)/(bounds.maxY-bounds.minY)),ox=ww/2-(bounds.minX+bounds.maxX)/2*s,oy=hh/2-(bounds.minY+bounds.maxY)/2*s;c.save();c.translate(ox,oy);c.scale(s,s);region(c,false);drawVerifiedWater(c,false);drawRoads(c,s,true);c.restore();if(showGeology&&large){for(const rock of geologyPoints){const x=rock.p[0]*s+ox,y=rock.p[1]*s+oy;if(x<0||x>ww||y<0||y>hh)continue;c.fillStyle='#fff3df';c.strokeStyle='#7c6174';c.lineWidth=1;c.beginPath();c.arc(x,y,3,0,7);c.fill();c.stroke();}}for(let i=0;i<missions.length;i++){let m=missions[i],x=m.p[0]*s+ox,y=m.p[1]*s+oy,done=collected.has(i);c.fillStyle=done?'#6a8b51':i===target?'#d7ad50':'#f1e7b6';c.strokeStyle='#f9f8e4';c.lineWidth=large?2:1;c.beginPath();c.arc(x,y,large?12:4.5,0,7);c.fill();c.stroke();if(large){c.fillStyle=done?'#f9f8e4':'#745f32';c.font='600 11px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(done?'✓':i+1,x,y);}}
 // Map stays north-up; orientation is never tied to the character's heading.
 c.save();c.fillStyle='#3d6048';c.font=(large?'600 12px':'600 9px')+' system-ui';
 c.textAlign='right';c.textBaseline='top';c.fillText('N ↑',ww-7,6);c.restore();
 const px=player.x*s+ox,py=player.y*s+oy;c.fillStyle='#ce7758';c.strokeStyle='#fff4d5';c.lineWidth=2;c.beginPath();c.arc(px,py,large?6:4,0,7);c.fill();c.stroke();if(!large){c.strokeStyle='#496e4050';c.lineWidth=.8;c.strokeRect((camera.x-w/2/zoom)*s+ox,(camera.y-h/2/zoom)*s+oy,w/zoom*s,h/zoom*s);}return{s,ox,oy};}
function drawMini(){if(data)overview(mc,mini.width,mini.height,wholeBounds(),false);}
function drawBig(){if(!data)return;let r=big.getBoundingClientRect(),dd=Math.min(devicePixelRatio||1,2);big.width=Math.round(r.width*dd);big.height=Math.round(r.height*dd);bc.setTransform(dd,0,0,dd,0,0);mapTransform=overview(bc,r.width,r.height,fullMap?wholeBounds():explorationBounds(),true);$('fullMap').textContent=fullMap?'Voltar à expedição':'Ver todo o arquivo';$('mapScale').textContent=fullMap?'Mostrando a extensão completa dos dados.':'Uma região de aproximadamente 800 metros.';$('geologyLegend').hidden=!showGeology;}
function setRoute(x,y,stopRadius=0){
 const road=nearestRoad(x,y),end=[road.x,road.y];
 if(road.d>85){notify('Escolha um ponto mais próximo de uma rua ou trilha para marcar a rota.');return false;}
 const route=pathfinder?.route([player.x,player.y],end);
 if(!route){notify('Ainda não encontramos um caminho conectado até esse lugar.');return false;}
 waypoint={points:route.points,index:0,x:end[0],y:end[1],stopRadius};
 notify('Caminho marcado pelas ruas · '+Math.round(route.distance)+' m aproximadamente.');
 return true;
}
function blockedByHouse(x,y){
 for(const house of houses){
  if(Math.abs(x-house.x)>25||Math.abs(y-house.y)>25)continue;
  const dx=x-house.x,dy=y-house.y,cos=Math.cos(house.angle),sin=Math.sin(house.angle);
  const lx=dx*cos+dy*sin,ly=-dx*sin+dy*cos;
  if(Math.abs(lx)<house.w/2+5&&Math.abs(ly)<house.h/2+5)return true;
 }
 return false;
}
// Houses are artistic footprints, while road centerlines come from the mapped
// network. A route may stay on its road when a decorative house overlaps it;
// ordinary off-road movement still respects every house collision.
function mayAdvanceOnMappedRoute(houseBlocked,routeActive,fromRoadDistance,toRoadDistance){
 return !houseBlocked||(routeActive&&fromRoadDistance<=9&&toRoadDistance<=9);
}
function chapterUI(){
 const tasks=[
  'Encontre Lia perto do início da expedição e converse com ela.',
  collected.has(0)?'Você achou o primeiro selo! Volte para conversar com Lia.':'Encontre o selo dourado na Rua São José e depois volte para Lia.',
  'Registre uma paisagem nova com o botão ✿ Observar.',
  'Capítulo concluído! Continue a conhecer Roncador e descubra novas paisagens.'
 ];
 $('chapterTask').textContent=tasks[chapter];
 $('friendshipLevel').textContent=friendship+'/3 ♥';
 $('friendshipBar').style.width=(friendship/3*100)+'%';
 $('observationCount').textContent=observations.size+'/3';
 $('cultureCount').textContent=Object.keys(cultureNotes).length+'/3';
 renderFestivalStatus();
}
function festivalChecklist(){return{lia:friendship>=1,feira:!!cultureNotes.mercado,paisagem:observations.size>0};}
function recordFairQuest(step){
 if(!window.RoncadorCozyQuests.record(fairQuest,step))return;
 renderFairQuest();save();
 notify('🧺 Uma lembrança para a cesta! '+window.RoncadorCozyQuests.progress(fairQuest)+'/3 cuidados concluídos.');
}
// A guided first chapter, separate from the legacy three-part basket quest.
// The OSM point is a geographic anchor, not a surveyed stall location.
function marketReference(){return data?.landmarks?.find(p=>p.id==='mercado');}
function nearMarket(radius=85){const place=marketReference();return !!place&&Math.hypot(player.x-place.p[0],player.y-place.p[1])<=radius;}
function marketWorkerAvailable(){const schedule=window.RoncadorLivingWorld.agenda(living,'damiao');return schedule.present&&schedule.hub==='mercado'&&living.minute>=8*60&&living.minute<13*60;}
function observeMarketArrival(){
 if(!active||marketMorning.arrived||!nearMarket(85))return;
 if(window.RoncadorMarketMorning.arrive(marketMorning)){
  notify('☼ Você chegou ao Mercado! Procure Seu Francisco pelas ruas e diga bom dia.');
  note(523,0,.12);save();
 }
}
function renderMarketChapter(){
 const logic=window.RoncadorMarketMorning,next=logic.next(marketMorning),count=logic.progress(marketMorning);
 $('marketChapterBar').style.width=count/3*100+'%';
 $('marketChapterProgress').textContent=marketMorning.claimed?'Lembrança guardada ✓':count+'/3 momentos';
 $('marketChapterClock').textContent=window.RoncadorLivingWorld.label(living);
 const steps=[['marketArriveStep',marketMorning.arrived,'Chegar ao entorno da feira'],['marketTalkStep',marketMorning.talked,'Conversar com Francisco'],['marketWorkStep',marketMorning.claimed,'Preparar a banca juntos']];
 for(const [id,done,label] of steps){$(id).classList.toggle('done',done);$(id).textContent=(done?'✓ ':'○ ')+label;}
 const descriptions={arrival:'Siga as ruas mapeadas até o Mercado Público. A banca e os personagens são ilustrações.',talk:'Você chegou! Francisco caminha pelo entorno. Aproxime-se para ouvir o pedido dele.',work:'Francisco pediu ajuda: estenda o toldo, separe as frutas e empilhe os cestos.',thank:'A banca está pronta! Falta ouvir o agradecimento e guardar esta manhã no álbum.',next:'Uma lembrança nova entrou no álbum. O caminho da Matriz e Dona Lúcia esperam por você.'};
 $('marketChapterDescription').textContent=(next==='work'||next==='thank')&&!marketWorkerAvailable()?'Francisco já encerrou a manhã. As tarefas ficam guardadas; volte pela manhã do próximo dia imaginário.':descriptions[next];
 const action=$('marketChapterAction');
 action.disabled=!active;
 action.textContent=!active?'Comece a expedição ↗':({arrival:'⌖ Caminhar até o Mercado ↗',talk:'♡ Encontrar Seu Francisco ↗',work:'🧺 Preparar a banca ↗',thank:'♡ Ouvir o agradecimento ↗',next:'🌷 Próxima descoberta: Matriz ↗'})[next];
 $('marketChapter').classList.toggle('complete',marketMorning.claimed);
 $('marketReturnStreet').hidden=!marketMorning.work.length||!marketStall;
 $('marketReturnStreet').disabled=!active;
 $('marketStreetResult').hidden=!marketMorning.work.length;
 const legacy=sideNeighbors.marketLegacy?.kind;
 $('marketStreetResult').textContent=legacy==='fita'?'Ciça preparou uma fita para a banca. Francisco lembra a escolha que você fez.':legacy==='conversa'?'A conversa que você compartilhou com Francisco continua na memória da feira.':marketWitnessed?'Ciça também reparou na banca! Essa manhã ganhou mais uma história.':marketMorning.work.length?'Sua arrumação também aparece na banca de Francisco durante as manhãs no Mercado.':'';
}
function focusMarketChapter(){
 if(matchMedia('(max-width:800px)').matches)$('sidebar').classList.add('open');
 syncRoute();$('marketChapter').scrollIntoView({block:'center',behavior:reduce?'instant':'smooth'});
 $('marketChapterAction').focus({preventScroll:true});
}
function marketChapterAction(){
 if(!active){notify('Comece a expedição para conhecer essa manhã.');return;}
 const next=window.RoncadorMarketMorning.next(marketMorning);
 $('sidebar').classList.remove('open');syncRoute();
 if(next==='next'){
  const church=data.landmarks.find(p=>p.id==='igreja');
  if(church)setRoute(...church.p);
  else notify('A Matriz será nossa próxima descoberta.');
  return;
 }
 if(next==='work'||next==='thank'){
  if(!marketWorkerAvailable()){notify('☾ Francisco não está organizando a banca agora. Volte numa manhã do calendário do jogo.');return;}
  if(nearMarket(95)){showMarketWork();return;}
  const place=marketReference();if(place?.p)setRoute(...place.p);
  notify('Volte ao entorno do Mercado para preparar a banca com Francisco.');return;
 }
 if(next==='talk'){
  const resident=residentsInStreets().find(p=>p.id==='damiao');
  if(resident&&Math.hypot(player.x-resident.x,player.y-resident.y)<43){talkResident('damiao');return;}
  if(resident){setRoute(resident.x,resident.y);notify('Siga Francisco pelas ruas. Aproxime-se e toque em conversar.');return;}
  notify('Francisco está descansando. O caderno dos moradores mostra sua próxima rotina.');return;
 }
 const place=marketReference();if(place?.p){setRoute(...place.p);notify('Caminhe pelo trajeto verde até o entorno do Mercado Público.');}
}
function marketStallVisible(){return !!marketStall&&showScenery&&(fairAtmosphere()||marketMorning.talked&&marketWorkerAvailable());}
function visitMarketStall(){
 if(!active)return;
 $('sidebar').classList.remove('open');syncRoute();
 const place=marketReference();if(!place)return;
 setRoute(...place.p);notify(marketStallVisible()?'Volte ao Mercado e procure a pequena placa “Francisco”. Sua arrumação aparece na banca.':'A banca de Francisco aparece nas manhãs de trabalho. O trajeto leva ao entorno do Mercado.');
}
function observeMarketChange(people){
 if(!active||anyDialog())return;
 const reaction=window.RoncadorFairStreets.witness({state:marketMorning,witnessed:marketWitnessed,stall:marketStall,player,people,visible:marketStallVisible(),route:(a,b)=>pathfinder.route(a,b)});
 if(!reaction)return;
 marketWitnessed=true;marketReaction={id:reaction.id,until:elapsed+5.5};
 living.notes.unshift({day:living.day,text:'Ciça reparou na banca que você e Francisco organizaram.'});living.notes=living.notes.slice(0,12);
 save();notify(reaction.line);
}
function marketActivityAllowed(){return active&&marketMorning.talked&&nearMarket(95)&&marketWorkerAvailable();}
function setupMarketScene(){
 if(marketScene)return;
 marketScene=window.RoncadorMarketScene.create($('marketWorkScene'),{
  state:()=>marketMorning,slots:()=>marketFruitSlots,
  canUse:()=>marketActivityAllowed()&&$('marketWorkDialog').open,
  finishButton:$('marketFinish'),
  message:text=>{$('marketWorkLine').textContent=text;},
  drawPerson:(canvas,pose)=>{
   const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.save();c.translate(70,170);c.scale(3.4,3.4);
   const def=window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id==='damiao');
   drawKawaiiWalker(c,{x:0,y:0,id:'damiao',def,walking:false,variant:0,social:{pose:pose.wave?'wave':'smile',facing:1,intensity:pose.wave?Math.max(0,Math.min(1,pose.time/.25,(2.3-pose.time)/.4)):0,react:pose.happy}},pose.time+1.3);c.restore();
  },
  task:id=>{
   if(!marketActivityAllowed()||!$('marketWorkDialog').open||!['toldo','cestos'].includes(id)||!window.RoncadorMarketMorning.doWork(marketMorning,id))return;
   const task=window.RoncadorMarketMorning.TASKS.find(t=>t.id===id);save();renderMarketWork(task.story);note(587,0,.12);
  },
  change:slots=>{
   if(!marketActivityAllowed()||!$('marketWorkDialog').open||marketMorning.claimed)return;
   marketFruitSlots=window.RoncadorMarketScene.restore(slots);
   const full=window.RoncadorMarketScene.complete(marketFruitSlots);
   if(full)window.RoncadorMarketMorning.doWork(marketMorning,'frutas');
   save();renderMarketWork(full?'As frutas encontraram seu lugar. Ficou do seu jeito!':marketFruitSlots.filter(Boolean).length+'/6 frutas na banca. Escolha outra fruta ou reorganize as que já colocou.');
  }
 });
 $('marketWorkDialog').addEventListener('close',()=>marketScene.close());
}
function renderMarketWork(line){
 const logic=window.RoncadorMarketMorning;
 $('marketWorkProgress').textContent=marketMorning.work.length+'/3 detalhes arrumados';
 $('marketWorkLine').textContent=line||(marketMorning.claimed?'Sua ajuda está guardada no álbum.':logic.ready(marketMorning)?'Tudo em ordem! Francisco espera para agradecer.':'Estenda o toldo, organize as frutas e ajeite os cestos, sem pressa.');
 $('marketThanks').hidden=!marketMorning.claimed;
 $('marketSaveWarning').hidden=!storageWarning;
 $('marketWorkerSpeech').textContent=marketMorning.claimed?'Francisco: “Pronto, ficou bonito demais! Obrigado pela companhia.”':'Francisco: “Vamos ajeitar essa banca juntos? As frutas podem ficar do seu jeito.”';
 $('marketFinish').disabled=!logic.ready(marketMorning);
 $('marketFinish').textContent=marketMorning.claimed?'◫ Ver a lembrança no álbum ↗':logic.ready(marketMorning)?'♡ Ouvir Francisco e guardar a memória':'Arrume os três detalhes primeiro';
 marketScene?.sync();
}
function showMarketWork(){
 if(!active||!marketMorning.talked||!nearMarket(95)){notify('Converse com Francisco perto do Mercado primeiro.');return;}
 if(!marketWorkerAvailable()){notify('☾ Francisco descansa agora. Continue essa ajuda numa manhã do jogo.');return;}
 const damiao=window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id==='damiao');
 $('marketWorkerPortrait').replaceChildren(drawResidentPortrait(damiao,0));
 setupMarketScene();showDialog('marketWorkDialog');renderMarketWork();
}
function claimMarketMorning(){
 if(!active)return;
 if(marketMorning.claimed){$('marketWorkDialog').close();renderAlbum();showDialog('albumDialog');return;}
 if(!marketActivityAllowed()||!$('marketWorkDialog').open||!window.RoncadorMarketMorning.claim(marketMorning))return;
 living.notes.unshift({day:living.day,text:'Você ajudou Francisco a preparar a banca imaginária do Mercado.'});
 living.notes=living.notes.slice(0,12);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;particles.push({x:player.x,y:player.y-12,vx:Math.cos(a)*15,vy:Math.sin(a)*17-12,life:1.5,r:1.7,color:i%2?'#e8c878':'#91b98b'});}
 note(587,0,.13);note(784,.15,.17);note(988,.31,.21);
 save();renderMarketWork('Sua ajuda virou um cartão no álbum. O caminho da Matriz ficou ainda mais convidativo.');marketScene?.react();renderMarketChapter();
 notify('♡ Manhã com Francisco concluída! Seu álbum ganhou uma lembrança.');
}
// Chapter 02 is unlocked by the Mercado conclusion. The church OSM POI anchors
// walking; Lúcia's movable flowerpot and imagined garden are not mapped plots.
function churchReference(){return data?.landmarks?.find(p=>p.id==='igreja');}
function nearChurch(radius=85){const place=churchReference();return !!place&&Math.hypot(player.x-place.p[0],player.y-place.p[1])<=radius;}
function luciaAvailable(){const schedule=window.RoncadorLivingWorld.agenda(living,'lucia');return schedule.present&&schedule.hub==='igreja';}
function observeLuciaArrival(){
 if(!active||!marketMorning.claimed||luciaGarden.arrived||!nearChurch(90))return;
 if(window.RoncadorLuciaGarden.arrive(luciaGarden)){
  notify('🌷 Chegou à Matriz! Dona Lúcia costuma trazer flores e histórias para este caminho imaginado.');
  note(659,0,.13);save();
 }
}
function renderLuciaChapter(){
 const unlock=marketMorning.claimed||luciaGarden.arrived;
 $('luciaChapter').hidden=!unlock;
 if(!unlock)return;
 const logic=window.RoncadorLuciaGarden,next=logic.next(luciaGarden),count=logic.progress(luciaGarden);
 $('luciaChapterBar').style.width=count/3*100+'%';
 $('luciaChapterProgress').textContent=luciaGarden.claimed?'Lembrança floresceu ✓':count+'/3 momentos';
 $('luciaChapterClock').textContent=window.RoncadorLivingWorld.label(living);
 for(const [id,done,label] of [['luciaArriveStep',luciaGarden.arrived,'Chegar à Matriz'],['luciaTalkStep',luciaGarden.talked,'Ouvir uma memória de Lúcia'],['luciaGardenStep',luciaGarden.claimed,'Cuidar de uma muda juntos']]){
  $(id).classList.toggle('done',done);$(id).textContent=(done?'✓ ':'○ ')+label;
 }
 const descriptions={arrival:'Depois da feira, siga pelas ruas mapeadas até a Igreja e procure Dona Lúcia.',talk:'Você chegou. Lúcia caminha por perto; aproxime-se para conhecer sua história.',work:'Lúcia pediu ajuda: prepare a terra, plante uma muda e regue sem pressa.',memory:'Agora escolha uma pequena lembrança para dedicar à mudinha.',thank:'A planta está cuidada e a memória escolhida. Lúcia tem algo para lhe dizer.',next:'Uma memória florida já está no álbum. Bia costuma ler perto da Rodoviária.'};
 const growth=logic.growth(luciaGarden,living.day);
 $('luciaChapterDescription').textContent=luciaGarden.claimed?growth.caption+' Volte para conversar com Lúcia e acompanhar a memória do jardim.':['work','memory','thank'].includes(next)&&!luciaAvailable()?'Lúcia saiu para seus compromissos. Seus cuidados estão guardados; volte quando ela estiver no entorno da Matriz.':descriptions[next];
 const action=$('luciaChapterAction');action.disabled=!active;
 action.textContent=!active?'Comece a expedição ↗':({arrival:'⌖ Caminhar até a Matriz ↗',talk:'♡ Encontrar Dona Lúcia ↗',work:'🌱 Cuidar da mudinha ↗',memory:'♡ Escolher uma memória ↗',thank:'🌷 Ouvir Dona Lúcia ↗',next:'📚 Próxima descoberta: Bia ↗'})[next];
 $('luciaChapter').classList.toggle('complete',luciaGarden.claimed);
}
function luciaChapterAction(){
 if(!active){notify('Comece a expedição para visitar Dona Lúcia.');return;}
 $('sidebar').classList.remove('open');syncRoute();
 const next=window.RoncadorLuciaGarden.next(luciaGarden);
 if(next==='next'){
  const bus=data.landmarks.find(p=>p.id==='rodoviaria');if(bus)setRoute(...bus.p);
  else notify('A Rodoviária será nossa próxima descoberta.');return;
 }
 if(['work','memory','thank'].includes(next)){
  if(!luciaAvailable()){notify('☾ Lúcia está em outro compromisso. A rotina dela aparece no caderno dos moradores.');return;}
  if(nearChurch(100)){showLuciaGarden();return;}
  const church=churchReference();if(church?.p)setRoute(...church.p);
  notify('Volte ao entorno da Matriz para terminar de cuidar das mudinhas.');return;
 }
 if(next==='talk'){
  const resident=residentsInStreets().find(p=>p.id==='lucia');
  if(resident&&Math.hypot(player.x-resident.x,player.y-resident.y)<43){talkResident('lucia');return;}
  if(resident){setRoute(resident.x,resident.y);notify('Siga Dona Lúcia pelas ruas e aproxime-se para conversar.');return;}
  notify('Lúcia está em outra atividade. Volte mais tarde ou consulte o caderno de rotinas.');return;
 }
 const church=churchReference();if(church?.p){setRoute(...church.p);notify('Siga o caminho verde até a referência da Matriz no mapa.');}
}
function renderLuciaGarden(line){
 const logic=window.RoncadorLuciaGarden;
 const current=logic.TASKS[luciaGarden.work.length];
 for(const b of document.querySelectorAll('[data-lucia-work]')){
  const done=luciaGarden.work.includes(b.dataset.luciaWork);
  b.disabled=done||luciaGarden.claimed||b.dataset.luciaWork!==current?.id;
  b.classList.toggle('done',done);b.setAttribute('aria-pressed',String(done));
 }
 $('luciaGardenProgress').textContent=luciaGarden.work.length+'/3 cuidados feitos';
 $('luciaGardenLine').textContent=line||(luciaGarden.claimed?logic.growth(luciaGarden,living.day).caption:logic.readyForMemory(luciaGarden)?'A muda está cuidada. Escolha uma lembrança para dedicar a ela.':current?'Agora: '+current.title.toLowerCase()+'. Um gesto abre o próximo.':'O canteiro já está pronto.');
 $('luciaMemoryPanel').hidden=!logic.readyForMemory(luciaGarden)||luciaGarden.claimed;
 for(const b of document.querySelectorAll('[data-lucia-memory]'))b.setAttribute('aria-pressed',String(b.dataset.luciaMemory===luciaGarden.memory));
 $('luciaGardenThanks').hidden=!luciaGarden.claimed;
 const chosen=logic.MEMORIES.find(m=>m.id===luciaGarden.memory);
 $('luciaGardenFarewell').textContent=chosen?'Lúcia: “'+chosen.title+'... Uma lembrança assim merece crescer com carinho. Obrigada por dividir este instante comigo.”':'Lúcia sorri ao ver as primeiras folhas.';
 $('luciaWorkerSpeech').textContent=luciaGarden.claimed?'Lúcia: “'+gardenStageDialogue('lucia',logic.growth(luciaGarden,living.day))+'”':'Lúcia: “Minha mãe dizia que uma plantinha cresce junto das nossas histórias. Vamos cuidar desta?”';
 $('luciaGardenFinish').disabled=!logic.ready(luciaGarden);
 $('luciaGardenFinish').textContent=luciaGarden.claimed?'◫ Ver a lembrança no álbum ↗':logic.ready(luciaGarden)?'♡ Guardar a memória com Lúcia':'Cuide da planta e escolha uma memória';
}
function showLuciaGarden(){
 if(!active||!marketMorning.claimed||!luciaGarden.talked||!nearChurch(100)){notify('Converse com Lúcia perto da Matriz primeiro.');return;}
 if(!luciaAvailable()){notify('☾ Lúcia não está no jardim imaginário agora. Consulte seu horário no caderno.');return;}
 const lucia=window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id==='lucia');
 $('luciaWorkerPortrait').replaceChildren(drawResidentPortrait(lucia,1));
 renderLuciaGarden();showDialog('luciaGardenDialog');
}
function claimLuciaGarden(){
 if(!active)return;
 if(luciaGarden.claimed){$('luciaGardenDialog').close();renderAlbum();showDialog('albumDialog');return;}
 if(!nearChurch(100)||!luciaAvailable()||!window.RoncadorLuciaGarden.claim(luciaGarden))return;
 const chosen=window.RoncadorLuciaGarden.MEMORIES.find(m=>m.id===luciaGarden.memory);
 living.notes.unshift({day:living.day,text:'Você cuidou de uma mudinha fictícia com Dona Lúcia e escolheu a memória: '+chosen.title+'.'});
 living.notes=living.notes.slice(0,12);
 for(let i=0;i<17;i++){const a=i*Math.PI*2/17;particles.push({x:player.x,y:player.y-15,vx:Math.cos(a)*16,vy:Math.sin(a)*16-9,life:1.6,r:1.5,color:i%2?'#ccbad9':'#b5d2a0'});}
 note(587,0,.13);note(698,.13,.16);note(880,.27,.23);
 renderLuciaGarden(chosen.story+' Um novo cartão entrou no álbum.');renderLuciaChapter();save();
 notify('🌷 Um jardim de lembranças! O álbum ganhou seu cartão com Dona Lúcia.');
}
// Chapter 03 — the terminal point is existing OSM data, while Bia's notebook,
// themes and handwritten letter are original narrative compositions.
function busReference(){return data?.landmarks?.find(p=>p.id==='rodoviaria');}
function nearBus(radius=95){const place=busReference();return !!place&&Math.hypot(player.x-place.p[0],player.y-place.p[1])<=radius;}
function biaAvailable(){const schedule=window.RoncadorLivingWorld.agenda(living,'bia');return schedule.present&&schedule.hub==='rodoviaria';}
function observeBiaArrival(){
 if(!active||!luciaGarden.claimed||biaLetters.arrived||!nearBus(95))return;
 if(window.RoncadorBiaLetters.arrive(biaLetters)){
  notify('📚 Você chegou à Rodoviária! Bia guarda um caderno de caminhos e ideias.');
  note(660,0,.12);save();
 }
}
function renderBiaChapter(){
 const unlock=luciaGarden.claimed||biaLetters.arrived;
 $('biaChapter').hidden=!unlock;
 if(!unlock)return;
 const logic=window.RoncadorBiaLetters,next=logic.next(biaLetters),count=logic.progress(biaLetters);
 $('biaChapterBar').style.width=count/3*100+'%';
 $('biaChapterProgress').textContent=biaLetters.claimed?'Carta guardada ✓':count+'/3 momentos';
 $('biaChapterClock').textContent=window.RoncadorLivingWorld.label(living);
 for(const [id,done,label] of [['biaArriveStep',biaLetters.arrived,'Chegar à Rodoviária'],['biaTalkStep',biaLetters.talked,'Conversar sobre ir e voltar'],['biaLetterStep',biaLetters.claimed,'Escrever e selar uma carta']]){
  $(id).classList.toggle('done',done);$(id).textContent=(done?'✓ ':'○ ')+label;
 }
 const descriptions={arrival:'Depois do jardim, vá pela malha de ruas até a Rodoviária e procure Bia.',talk:'Bia lê por perto. Aproxime-se dela para falar sobre saudade e novos caminhos.',open:'Bia convidou você a abrir um caderno ilustrado e escrever com calma.',theme:'O caderno está aberto. Escolha uma mensagem de saudade, planos ou reencontro.',seal:'Sua mensagem está escrita. Falta fechar o envelope com um selo.',thank:'A carta está pronta. Ouça Bia e guarde esta lembrança no álbum.',next:'A carta de Bia se juntou às memórias de Francisco e Lúcia. Três histórias do mesmo lugar.'};
 $('biaChapterDescription').textContent=['open','theme','seal','thank'].includes(next)&&!biaAvailable()?'Bia saiu para outra atividade. Sua carta continua salva; retome quando ela voltar à Rodoviária.':descriptions[next];
 const action=$('biaChapterAction');action.disabled=!active;
 action.textContent=!active?'Comece a expedição ↗':({arrival:'⌖ Caminhar até a Rodoviária ↗',talk:'♡ Encontrar Bia ↗',open:'📖 Abrir o caderno ↗',theme:'✎ Escolher uma mensagem ↗',seal:'✉ Selar a carta ↗',thank:'♡ Ouvir o agradecimento ↗',next:'◫ Rever as três memórias ↗'})[next];
 $('biaChapter').classList.toggle('complete',biaLetters.claimed);
}
function biaChapterAction(){
 if(!active){notify('Comece a expedição para conhecer Bia.');return;}
 $('sidebar').classList.remove('open');syncRoute();
 const next=window.RoncadorBiaLetters.next(biaLetters);
 if(next==='next'){renderAlbum();showDialog('albumDialog');return;}
 if(['open','theme','seal','thank'].includes(next)){
  if(!biaAvailable()){notify('☾ Bia está em outro compromisso. Veja a rotina dela no caderno dos moradores.');return;}
  if(nearBus(110)){showBiaLetter();return;}
  const place=busReference();if(place?.p)setRoute(...place.p);
  notify('Volte à Rodoviária para continuar a carta com Bia.');return;
 }
 if(next==='talk'){
  const resident=residentsInStreets().find(p=>p.id==='bia');
  if(resident&&Math.hypot(player.x-resident.x,player.y-resident.y)<43){talkResident('bia');return;}
  if(resident){setRoute(resident.x,resident.y);notify('Siga Bia pelas ruas; aproxime-se para conversar.');return;}
  notify('Bia não está por aqui agora. Consulte os horários no caderno dos moradores.');return;
 }
 const place=busReference();if(place?.p){setRoute(...place.p);notify('Siga a rota verde até a referência mapeada da Rodoviária.');}
}
function renderBiaLetter(line){
 const logic=window.RoncadorBiaLetters,theme=logic.THEMES.find(t=>t.id===biaLetters.theme);
 const scene=$('biaLetterScene');scene.classList.toggle('opened',biaLetters.opened);scene.classList.toggle('themed',!!theme);scene.classList.toggle('sealed',biaLetters.sealed);
 $('biaLetterProgress').textContent=Number(biaLetters.opened)+Number(!!theme)+Number(biaLetters.sealed)+'/3 gestos';
 $('biaLetterLine').textContent=line||(biaLetters.claimed?'Bia guardou sua carta junto das histórias que viveu com você.':biaLetters.sealed?'O envelope está fechado. Bia espera para agradecer.':theme?'Sua carta já tem palavras. Agora escolha selar.':biaLetters.opened?'Escolha o assunto da carta para ver as palavras nascerem no papel.':'Comece abrindo o caderno de Bia.');
 $('biaPaperText').textContent=theme?theme.story:'As páginas estão prontas. Qual história vai caber aqui?';
 $('biaNotebookOpen').disabled=biaLetters.opened;
 $('biaThemePanel').hidden=!biaLetters.opened||biaLetters.sealed;
 for(const b of document.querySelectorAll('[data-bia-theme]')){b.setAttribute('aria-pressed',String(b.dataset.biaTheme===biaLetters.theme));b.disabled=biaLetters.sealed;}
 $('biaLetterSeal').disabled=!theme||biaLetters.sealed;$('biaLetterSeal').hidden=biaLetters.sealed;
 $('biaLetterSeal').textContent=theme?'✉ Selar a carta e fechar o envelope':'✉ Escolha o texto para selar a carta';
 $('biaLetterThanks').hidden=!biaLetters.claimed;
 $('biaLetterFarewell').textContent=theme?'Bia: “'+theme.reply+' Obrigada por me ajudar a escrever esta carta.”':'Bia sorri ao fechar o envelope.';
 $('biaReaderSpeech').textContent=biaLetters.claimed?'Bia: “Agora tenho mais uma história para levar comigo.”':'Bia: “Às vezes dá medo de ir e vontade de ficar. E se a gente escrevesse uma carta para lembrar do que importa?”';
 $('biaLetterFinish').disabled=!logic.ready(biaLetters);
 $('biaLetterFinish').textContent=biaLetters.claimed?'◫ Ver as três memórias no álbum ↗':logic.ready(biaLetters)?'♡ Guardar a carta com Bia':'Termine a carta para guardar a memória';
}
function showBiaLetter(){
 if(!active||!luciaGarden.claimed||!biaLetters.talked||!nearBus(110)){notify('Converse com Bia perto da Rodoviária primeiro.');return;}
 if(!biaAvailable()){notify('☾ Bia está em outro lugar agora. Consulte a rotina dela no caderno.');return;}
 const bia=window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id==='bia');
 $('biaReaderPortrait').replaceChildren(drawResidentPortrait(bia,2));
 renderBiaLetter();showDialog('biaLetterDialog');
}
function claimBiaLetter(){
 if(!active)return;
 if(biaLetters.claimed){$('biaLetterDialog').close();renderAlbum();showDialog('albumDialog');return;}
 if(!nearBus(110)||!biaAvailable()||!window.RoncadorBiaLetters.claim(biaLetters))return;
 const theme=window.RoncadorBiaLetters.THEMES.find(t=>t.id===biaLetters.theme);
 living.notes.unshift({day:living.day,text:'Com Bia você guardou uma carta fictícia: '+theme.title+'.'});
 living.notes=living.notes.slice(0,12);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;particles.push({x:player.x,y:player.y-12,vx:Math.cos(a)*17,vy:Math.sin(a)*16-10,life:1.5,r:1.5,color:i%2?'#a0bdc7':'#e7d1a2'});}
 note(587,0,.15);note(740,.14,.16);note(988,.3,.23);
 renderBiaLetter(theme.reply+' Uma carta original entrou no álbum.');renderBiaChapter();save();
 notify('📮 Uma carta para lembrar! As três histórias estão juntas no álbum.');
}
function renderFairQuest(){
 const logic=window.RoncadorCozyQuests,count=logic.progress(fairQuest);
 const markers=[['fairQuestDamiao','damiao','♡ Conversar com Seu Francisco'],['fairQuestMercado','mercado','◇ Guardar uma memória do Mercado'],['fairQuestColheita','colheita','✿ Fazer uma colheita no canteiro']];
 for(const [id,step,label] of markers){const item=$(id);item.textContent=(fairQuest[step]?'✓ ':'○ ')+label.slice(2);item.classList.toggle('done',fairQuest[step]);}
 $('fairQuestBar').style.width=count/3*100+'%';
 $('fairQuestProgress').textContent=fairQuest.claimed?'Cesta concluída · lembrança no álbum ✓':count+'/3 pequenas histórias';
 const next=logic.next(fairQuest),action=$('fairQuestAction');
 action.textContent=!active?'Comece a expedição ↗':fairQuest.claimed?'✿ Lembrança guardada ✓':next==='damiao'?'Encontrar Seu Francisco ↗':next==='mercado'?'Ir ao Mercado Público ↗':next==='colheita'?'Cuidar do canteiro ↗':'Guardar a cesta no álbum ✦';
 action.disabled=!active||fairQuest.claimed;
 $('fairQuestCard').classList.toggle('complete',fairQuest.claimed);
}
function claimFairQuest(){
 if(!window.RoncadorCozyQuests.claim(fairQuest))return;
 for(let i=0;i<18;i++){const a=i*Math.PI/9;particles.push({x:player.x,y:player.y-15,vx:Math.cos(a)*18,vy:Math.sin(a)*18-10,life:1.5,r:1.6,color:i%2?'#f1d48b':'#e2a7a0'});}
 note(659,0,.15);note(784,.12,.2);note(988,.25,.26);
 renderFairQuest();save();notify('🧺 Cesta de histórias completa! Um novo cartão foi guardado no álbum.');
}
function fairQuestNext(){
 if(!active){notify('Comece a expedição para viver essa história.');return;}
 if(window.RoncadorCozyQuests.ready(fairQuest)){claimFairQuest();return;}
 const next=window.RoncadorCozyQuests.next(fairQuest);
 $('sidebar').classList.remove('open');syncRoute();
 if(next==='damiao'){
  const person=residentsInStreets().find(p=>p.id==='damiao');
  if(person&&Math.hypot(player.x-person.x,player.y-person.y)<43)talkResident('damiao');
  else if(person){setRoute(person.x,person.y);notify('Siga pelas ruas para conversar com Seu Francisco.');}
  else notify('Francisco está em outra atividade. Descanse até outro dia e procure-o no Mercado.');
 }else if(next==='mercado'){
  const market=data.landmarks.find(p=>p.id==='mercado');
  if(market&&cultureWithinReach(market))showCulture('mercado');
  else if(market){setRoute(...market.p);notify('O Mercado Público tem histórias esperando por você.');}
 }else if(next==='colheita')showNature();
}
function focusFairQuest(){
 if(matchMedia('(max-width:800px)').matches)$('sidebar').classList.add('open');
 syncRoute();$('fairQuestCard').scrollIntoView({block:'center',behavior:reduce?'instant':'smooth'});
 $('fairQuestAction').focus({preventScroll:true});
}
function renderMomentsUI(){
 const logic=window.RoncadorDailyMoments,m=logic.current(living),count=logic.progress(momentsSeen);
 $('momentProgress').textContent=count+'/3 cenas';$('momentCalendarProgress').textContent=count===3?'3/3 · cartão no álbum ✓':count+'/3 lembranças';
 const label=m?m.icon+' '+m.title:'☾ Um intervalo de descanso nas ruas';
 $('momentNow').textContent=label;$('momentCalendarNow').textContent=m?m.title+' · '+m.caption:'As próximas cenas começam pela manhã. Avance o período no calendário fictício.';
 $('momentAction').textContent=!active?'Comece a expedição ↗':m?momentsSeen.includes(m.id)?'Revisitar esta cena ↗':'Conhecer esta cena ↗':'Ver os horários no diário ↗';
 $('momentAction').disabled=!active;
 $('momentOpen').disabled=!active||!m;
 $('momentOpen').textContent=m?(momentsSeen.includes(m.id)?'♡ Rever a cena registrada ↗':'⌖ Ir à cena deste horário ↗'):'☾ Espere o próximo período do jogo';
 $('momentWait').disabled=!active;
 $('streetMomentHint').textContent=m?'☼ '+m.title:'☾ Rua tranquila neste horário';
}
function exploreMoment(){
 if(!active)return;
 const m=window.RoncadorDailyMoments.current(living);
 if(!m){showLife();return;}
 const hub=data.landmarks.find(p=>p.id===m.hub);
 if(!hub){notify('Ainda falta um ponto cartográfico para esta cena.');return;}
 $('sidebar').classList.remove('open');syncRoute();
 if(!cultureWithinReach(hub)){setRoute(...hub.p);notify('Siga as ruas até '+hub.name+' e abra a cena novamente.');return;}
 $('momentArt').textContent=m.icon+' ✿';$('momentTitle').textContent=m.title;
 $('momentDescription').textContent=m.caption;
 $('momentCollect').disabled=momentsSeen.includes(m.id);
 $('momentCollect').textContent=momentsSeen.includes(m.id)?'✿ Esta lembrança já está no álbum ✓':'✿ Guardar este momento no álbum';
 showDialog('momentDialog');
}
function collectMoment(){
 const m=window.RoncadorDailyMoments.current(living),hub=data.landmarks.find(p=>p.id===m?.hub);
 if(!m||!cultureWithinReach(hub)||!window.RoncadorDailyMoments.record(momentsSeen,m.id))return;
 $('momentCollect').disabled=true;$('momentCollect').textContent='✿ Esta lembrança já está no álbum ✓';
 renderMomentsUI();save();note(659,0,.15);note(784,.15,.2);
 notify(window.RoncadorDailyMoments.progress(momentsSeen)===3?'☼ Um dia em Belém completo! Nova lembrança no álbum.':'☼ Uma pequena cena entrou no seu diário de viagem.');
}
function skipMomentPeriod(){
 if(!active)return;
 const minutes=window.RoncadorDailyMoments.nextWindowMinutes(living);
 window.RoncadorLivingWorld.advance(living,minutes);
 const watered=window.RoncadorAtmosphere.waterGarden(gardenStep,minutes,skyMode,rainCare);
 rainCare=watered.accrued;if(watered.watered)gardenStep=3;
 renderLife();lifeSummary();renderMomentsUI();save();
 $('lifeConversation').textContent='Um novo horário começou no calendário do jogo. As pessoas e as pequenas cenas mudaram de atividade.';
}
function renderFestivalStatus(){
 const tasks=festivalChecklist(),completed=Object.values(tasks).filter(Boolean).length,ready=completed===3;
 $('festivalCardProgress').textContent=festivalCelebrated?'Encontro guardado ✓':completed+'/3 preparativos';
 $('festivalCardIcon').textContent=festivalCelebrated?'✦':'♡';
 $('festivalBar').style.width=(completed/3*100)+'%';
 $('festivalFriendCheck').textContent=tasks.lia?'✓':'○';
 $('festivalMarketCheck').textContent=tasks.feira?'✓':'○';
 $('festivalPhotoCheck').textContent=tasks.paisagem?'✓':'○';
 $('festivalStage').classList.toggle('ready',ready);
 $('festivalStage').classList.toggle('celebrated',festivalCelebrated);
 $('festivalMessage').textContent=festivalCelebrated?'✦ A festa imaginária aconteceu! Você ganhou a lembrança “Noite de São Pedro” para seu caderno.':ready?'Tudo pronto! Lia está esperando para acender as luzes do nosso encontro.':'Os preparativos avançam enquanto você explora Belém. Não existe prazo para terminar.';
 $('festivalAction').disabled=!ready||festivalCelebrated;
 $('festivalAction').textContent=festivalCelebrated?'✦ Noite de São Pedro guardada ✓':'Celebrar nosso encontro ✦';
 $('festivalRoute').hidden=ready||festivalCelebrated;
 $('festivalRoute').disabled=!active;
 $('festivalRoute').textContent=!tasks.lia?'⌖ Encontrar Lia no mapa':!tasks.feira?'⌖ Traçar caminho para a feira':'✿ Registrar uma paisagem no diário';
}
function showFestival(){if(!loaded)return;renderFestivalStatus();showDialog('festivalDialog');}
function festivalNextStep(){
 if(!active)return;
 const tasks=festivalChecklist();$('festivalDialog').close();
 if(!tasks.lia){setRoute(guide.x,guide.y);notify('Siga para conversar com Lia e começar os preparativos.');}
 else if(!tasks.feira){const market=data.landmarks.find(p=>p.id==='mercado');if(market)setRoute(...market.p);else notify('Não encontramos o marcador do Mercado Público nesta base.');}
 else if(!tasks.paisagem){notify('Ao encontrar um lugar bonito, use ✿ Observar para registrá-lo no diário.');}
}
function celebrateFestival(){
 if(festivalCelebrated||!Object.values(festivalChecklist()).every(Boolean))return;
 festivalCelebrated=true;renderFestivalStatus();save();
 note(523,0,.18);note(659,.14,.18);note(784,.28,.27);
 notify('✦ Noite de São Pedro: uma nova lembrança foi guardada no seu caderno!');
}
function talkGuide(){
 if(!active||anyDialog())return;
 let message;
 if(chapter===0){
  chapter=1;friendship=Math.max(1,friendship);
  message='Oi! Sou Lia. Eu anoto as pequenas maravilhas que encontro por aqui. Que tal começarmos um caderno juntos? Procure o marco dourado na Rua São José e depois volte para me contar!';
  note(659,0,.18);note(784,.12,.22);
 }else if(chapter===1&&collected.has(0)){
  chapter=2;friendship=Math.max(2,friendship);
  message='Você conseguiu! A Rua São José já faz parte da nossa história. Agora escolha um cantinho especial e toque em Observar para registrar sua primeira paisagem no diário.';
  note(659,0,.18);note(880,.12,.25);
 }else if(chapter===1){
  message='O primeiro marco está na Rua São José. Siga o caminho verde quando marcar um destino. Sem pressa: toda caminhada tem seu próprio ritmo.';
 }else if(chapter===2){
  message='Que lugar vamos guardar na memória? O botão ✿ Observar fica ali em cima. Cada paisagem diferente vira uma lembrança no nosso diário.';
 }else{
  message='Nossa primeira história já está no caderno! Obrigada pela companhia. Volte sempre: ainda vamos conhecer tantos caminhos juntos. ♥';
 }
 $('guideMessage').textContent=message;
 $('guideHearts').textContent='♥ '.repeat(friendship)+'♡ '.repeat(3-friendship);
 chapterUI();save();showDialog('guideDialog');
}
function capturePhoto(){
 try{
  const thumbnail=document.createElement('canvas');thumbnail.width=320;thumbnail.height=200;
  const tc=thumbnail.getContext('2d');
  tc.drawImage(canvas,0,0,canvas.width,canvas.height,0,0,thumbnail.width,thumbnail.height);
  return thumbnail.toDataURL('image/jpeg',.7);
 }catch{return null;}
}
function renderAlbum(){
 const grid=$('albumGrid');grid.replaceChildren();
 for(const water of waterMemories){
  const article=document.createElement('article');article.className='album-card';
  const icon=document.createElement('div');icon.className='fair-memory-thumbnail';icon.textContent='💧 🌿 ♡';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Uma pausa junto ao açude';
  const desc=document.createElement('span');desc.textContent='Você observou um corpo d’água presente no mapa do OpenStreetMap. A vegetação ilustrada é ficcional e a água não é um novo caminho.';
  content.append(title,desc);article.append(icon,content);grid.append(article);
 }
 if(breadStories.some(entry=>entry.id==='contado-bia')){
  const article=document.createElement('article');article.className='album-card';
  const icon=document.createElement('div');icon.className='fair-memory-thumbnail';icon.textContent='🥖 🍞 ♡';
  const content=document.createElement('div');content.className='album-card-content';
  const heading=document.createElement('strong');heading.textContent='O cheiro do pão da manhã';
  const memory=document.createElement('span');memory.textContent='Você ouviu Francisco falar da tradição do pão, escutou de Lúcia uma memória familiar fictícia e contou ambas a Bia em dias diferentes. A lembrança pertence às conversas que aconteceram de verdade no seu jogo.';
  content.append(heading,memory);article.append(icon,content);grid.append(article);
 }
 const places=[['vila','Caminhos da vila','Ruas, casas e pequenas descobertas.'],['campo','Perto do campo','O horizonte e os caminhos abertos.'],['mata','Respiro da natureza','Verde, tranquilidade e novos olhares.']];
 for(const [key,title,description] of places){
  const article=document.createElement('article');article.className='album-card'+(observations.has(key)?'':' locked');
  if(photos[key]){const img=document.createElement('img');img.src=photos[key];img.alt='Registro da paisagem: '+title;article.append(img);}
  else{const placeholder=document.createElement('div');placeholder.className='album-placeholder';placeholder.textContent=observations.has(key)?'✿':'?';article.append(placeholder);}
  const content=document.createElement('div');content.className='album-card-content';const strong=document.createElement('strong');strong.textContent=title;
  const small=document.createElement('span');small.textContent=observations.has(key)?description:'Paisagem ainda não registrada.';
  content.append(strong,small);article.append(content);grid.append(article);
 }
 if(marketMorning.claimed){
  const article=document.createElement('article');article.className='album-card market-morning-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='⛱ 🍊 🧺';thumbnail.setAttribute('aria-label','Desenho original do toldo, das frutas e dos cestos arrumados');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Uma manhã ao lado de Francisco';
  const description=document.createElement('span');description.textContent='Vocês prepararam juntos uma banca fictícia perto do Mercado: a lembrança é da companhia, não só da tarefa.'+(sideNeighbors.marketLegacy?.kind==='fita'?' Depois, Ciça preparou uma fita para a banca.':sideNeighbors.marketLegacy?.kind==='conversa'?' Depois, vocês reservaram um tempo para ouvir histórias.':'');
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(luciaGarden.claimed){
  const chosen=window.RoncadorLuciaGarden.MEMORIES.find(m=>m.id===luciaGarden.memory);
  const article=document.createElement('article');article.className='album-card lucia-garden-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='🌷 🌱 ♡';thumbnail.setAttribute('aria-label','Desenho original de uma mudinha cuidada com Lúcia');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='O jardim das pequenas memórias';
  const description=document.createElement('span');description.textContent=chosen?'Com Dona Lúcia você cuidou de uma muda fictícia e guardou: '+chosen.title+'. '+chosen.story:'Um cuidado e uma conversa perto da Matriz.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(luciaGarden.claimed&&window.RoncadorLuciaGarden.growth(luciaGarden,living.day).flower){
  const article=document.createElement('article');article.className='album-card lucia-garden-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='🌸 🌷 ♡';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='A flor que esperou';
  const story=document.createElement('span');story.textContent='A muda cuidada com Lúcia floresceu depois da passagem dos dias do jogo. Esta lembrança aparece uma vez no álbum, mesmo após longas ausências.';
  content.append(title,story);article.append(thumbnail,content);grid.append(article);
 }
 if(sideNeighbors.seen.length===3){
  const article=document.createElement('article');article.className='album-card side-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='🧵 ✏️ ✉️';thumbnail.setAttribute('aria-label','Três pequenos desenhos: fitas, lápis e carta');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Três vizinhos, muitas histórias';
  const description=document.createElement('span');description.textContent='Ciça, Nara e Téo lembram que a cidade também é feita dos encontros breves. Personagens e gestos fictícios.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(colorTrailProgress(sideNeighbors)===3){
  const article=document.createElement('article');article.className='album-card side-memory';
  const art=document.createElement('div');art.className='fair-memory-thumbnail';art.textContent='☕ 🌱 🎨';
  art.setAttribute('aria-label','Três lembranças ilustrativas de Rosa, Zeca e Mila');
  const copy=document.createElement('div');copy.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Caderno das três cores';
  const story=document.createElement('span');story.textContent='Rosa guardou uma conversa, Zeca lembrou o cuidado e Mila transformou o passeio em cores. Três gentilezas fictícias em caminhos já existentes.';
  copy.append(title,story);article.append(art,copy);grid.append(article);
 }
 for(const name of ruaNovaPaths){
  const memory=RUA_NOVA_STORIES[name];
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent=memory.icon+' 🌳';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent=memory.title+' · '+name;
  const story=document.createElement('span');story.textContent=memory.memory+' Cena contemplativa fictícia sobre uma via nomeada existente no mapa.';
  content.append(title,story);article.append(thumbnail,content);grid.append(article);
 }
 if(ruaNovaPaths.length===RUA_NOVA_ROADS.length){
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='🌳 🗺️ ✿';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Três caminhos de Rua Nova';
  const story=document.createElement('span');story.textContent='Você registrou três trechos de ruas nomeadas existentes na malha OSM. É um caderno de percurso, não uma afirmação sobre limites do distrito ou imóveis.';
  content.append(title,story);article.append(thumbnail,content);grid.append(article);
 }
 if(cityLinks.length===2){
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const art=document.createElement('div');art.className='fair-memory-thumbnail';art.textContent='✉️ 🌷 🧺';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='O que a cidade guarda';
  const story=document.createElement('span');story.textContent='Você compartilhou suas descobertas com Bia, Lúcia e Francisco em conversas diferentes. Cada um conheceu sua parte da história por você; não há encontros presumidos entre eles.';
  content.append(title,story);article.append(art,content);grid.append(article);
 }
 for(const record of storyEndings){
  const ending=storyEndingFor(record.id==='feira-que-volta'?'damiao':record.id==='jardim-que-fica'?'lucia':'bia',{day:record.day,friendshipTraditions,cityConsequences});
  if(!ending)continue;
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const art=document.createElement('div');art.className='fair-memory-thumbnail';art.textContent=ending.icon+' ♡';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent=ending.title;
  const story=document.createElement('span');story.textContent=ending.text+' Desfecho ficcional registrado uma única vez.';
  content.append(title,story);article.append(art,content);grid.append(article);
 }
 if(window.RoncadorSecondaryNeighbors.recadoStage(sideNeighbors)===3){
  const article=document.createElement('article');article.className='album-card side-memory';
  const art=document.createElement('div');art.className='fair-memory-thumbnail';art.textContent='✉️ ☕ ♡';
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Um recado de ida e volta';
  const story=document.createElement('span');story.textContent='Uma mensagem fictícia saiu da Rodoviária, foi respondida por Rosa e voltou para o caderno de Téo. Os dois se lembram do encontro.';
  content.append(title,story);article.append(art,content);grid.append(article);
 }
 if(communitySeen.length>=3){
  const article=document.createElement('article');article.className='album-card community-memory';
  const illustration=document.createElement('div');illustration.className='fair-memory-thumbnail';illustration.textContent='🧵 ✎ ✉ ♡';illustration.setAttribute('aria-label','Ilustração de fitas, um desenho e uma carta entre amigos');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Os laços que cruzam Belém';
  const description=document.createElement('span');description.textContent='Você presenciou '+communitySeen.length+' encontros originais entre os amigos: fitas, desenhos, plantas e recados. Histórias ficcionais nos caminhos do mapa.';
  content.append(title,description);article.append(illustration,content);grid.append(article);
 }
 if(biaLetters.claimed){
  const theme=window.RoncadorBiaLetters.THEMES.find(t=>t.id===biaLetters.theme);
  const article=document.createElement('article');article.className='album-card bia-letter-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='📚 ✉ ♡';thumbnail.setAttribute('aria-label','Ilustração original: livro e uma carta com selo');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Uma carta de quem vai e volta';
  const description=document.createElement('span');description.textContent=theme?'Bia e você escreveram: '+theme.title+'. '+theme.story:'Uma carta fictícia de Belém guardada entre encontros.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(festivalCelebrated){
  const article=document.createElement('article');article.className='album-card festival-memory';
  const thumbnail=document.createElement('div');thumbnail.className='festival-memory-thumbnail';thumbnail.textContent='✦ ♡ ✦';thumbnail.setAttribute('aria-label','Arte original: lanternas de um São Pedro imaginário');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Noite de São Pedro';
  const description=document.createElement('span');description.textContent='Lia, feira e uma paisagem: a lembrança do nosso encontro fictício.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(fairQuest.claimed){
  const article=document.createElement('article');article.className='album-card fair-memory';
  const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent='🧺 ✿';thumbnail.setAttribute('aria-label','Cesta ilustrada com flores e produtos da feira imaginária');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='A cesta das pequenas histórias';
  const description=document.createElement('span');description.textContent='Um encontro, uma memória do Mercado e uma colheita no seu próprio ritmo.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(window.RoncadorNeighborhoodQuest.unlocked(living)){
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const thumbnail=document.createElement('div');thumbnail.className='neighbor-memory-thumbnail';thumbnail.textContent='🧺 🌷 📚';thumbnail.setAttribute('aria-label','Retrato ilustrativo de três amizades no bairro');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Uma roda de conversas';
  const description=document.createElement('span');description.textContent='Francisco, Lúcia e Bia: seis conversas em dias diferentes viraram uma amizade de verdade dentro da ficção.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(window.RoncadorDailyMoments.progress(momentsSeen)===3){
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const thumbnail=document.createElement('div');thumbnail.className='neighbor-memory-thumbnail';thumbnail.textContent='🧺 📚 🌼';thumbnail.setAttribute('aria-label','Cartão ilustrativo de três horários de Belém');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Um dia que ficou no caderno';
  const description=document.createElement('span');description.textContent='Manhã, tarde e entardecer: três cenas fictícias nos arredores de referências mapeadas da cidade.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
 if(window.RoncadorLivingWorld.careProgress(living)===3){
  const article=document.createElement('article');article.className='album-card neighbor-memory';
  const thumbnail=document.createElement('div');thumbnail.className='neighbor-memory-thumbnail';thumbnail.textContent='☕ 🌿 📚';thumbnail.setAttribute('aria-label','Três gestos de cuidado entre amigos imaginários');
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Gentilezas de um mesmo lugar';
  const description=document.createElement('span');description.textContent='Uma ajuda na feira, um cuidado com as plantas e uma conversa sobre sonhos.';
  content.append(title,description);article.append(thumbnail,content);grid.append(article);
 }
  if(window.RoncadorBelemContacts){
  for(const def of window.RoncadorBelemContacts.CONTACTS){
   if(!belemContacts?.items?.[def.id]?.metOnLocation)continue;
   const article=document.createElement('article');article.className='album-card neighbor-memory';
   const thumbnail=document.createElement('div');thumbnail.className='fair-memory-thumbnail';thumbnail.textContent=def.icon+' '+def.avatar+' ♥';
   const content=document.createElement('div');content.className='album-card-content';
   const title=document.createElement('strong');title.textContent=def.hangoutTitle;
   const description=document.createElement('span');description.textContent=def.hangoutStory;
   content.append(title,description);article.append(thumbnail,content);grid.append(article);
  }
 }
 if(facadeSketches.length===3){
  const article=document.createElement('article');article.className='album-card facade-memory';
  const preview=document.createElement('canvas');preview.width=186;preview.height=90;
  preview.className='facade-memory-preview';preview.setAttribute('role','img');preview.setAttribute('aria-label','Três casinhas imaginadas com portas, flores e toldos');
  window.RoncadorFacadeStudio.drawPreview(preview,'feira',lightPhase);
  const content=document.createElement('div');content.className='album-card-content';
  const title=document.createElement('strong');title.textContent='Um caderno de portas e janelas';
  const description=document.createElement('span');description.textContent='Você observou os três trechos do ateliê e imaginou suas fachadas: Matriz, Feira e Rua João Pessoa. A arte não representa casas reais identificadas.';
  content.append(title,description);article.append(preview,content);grid.append(article);
 }
}
function restoreRuaNovaPaths(raw){return RUA_NOVA_ROADS.filter(name=>Array.isArray(raw)&&raw.includes(name));}
function restoreRuaNovaDays(raw,paths){
 const result={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const name of paths)if(Number.isInteger(raw[name])&&raw[name]>=1&&raw[name]<=1000000)result[name]=raw[name];
 return result;
}
function restoreCityKnowledge(raw,paths,day){
 const result={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const name of paths){
  const id=RUA_NOVA_STORIES[name].resident,record=raw[id]?.[name];
  if(Number.isInteger(record)&&record>=1&&record<=day){
   (result[id]??={})[name]=record;
  }
 }
 return result;
}
function restoreCityLinks(raw,knowledge){
 if(!Array.isArray(raw))return [];
 const requirements={'bia-lucia':[['bia','Rua da Cruz'],['lucia','Rua Ramiro Alves']],
  'lucia-damiao':[['lucia','Rua Ramiro Alves'],['damiao','Rua Independência']]};
 return Object.keys(requirements).filter(key=>raw.includes(key)&&requirements[key].every(([id,name])=>knowledge[id]?.[name]));
}
function rememberCityStory(id,day){
 const name=RUA_NOVA_ROADS.find(road=>RUA_NOVA_STORIES[road].resident===id&&ruaNovaPaths.includes(road));
 if(!name)return {text:'',changed:false};
 const knownDay=cityKnowledge[id]?.[name];let changed=false,text='';
 if(!knownDay){
  (cityKnowledge[id]??={})[name]=day;changed=true;
  const first={bia:'Você conta a Bia o que observou na Rua da Cruz. Ela sugere guardar também suas perguntas.',
   lucia:'Você conta a Lúcia sobre a pausa na Rua Ramiro Alves. Ela gosta da ideia de observar sem pressa.',
   damiao:'Você compartilha com Francisco a lembrança da Rua Independência. Ele pensa nas histórias que passam de mão em mão.'};
  text=first[id];
 }else{
  const later=day>knownDay;
  const remembered={bia:'Bia lembra do que você contou sobre a Rua da Cruz.',lucia:'Lúcia lembra sua conversa sobre a Rua Ramiro Alves.',damiao:'Francisco recorda o que você contou da Rua Independência.'};
  text=remembered[id]+(later?' “É bonito quando um caminho continua na memória depois de outro dia.”':'');
 }
 const links={lucia:{key:'bia-lucia',prior:cityKnowledge.bia?.['Rua da Cruz'],line:'Você conta a Lúcia sobre sua conversa anterior com Bia. Lúcia percebe que caminhos diferentes também podem guardar o mesmo cuidado.'},
  damiao:{key:'lucia-damiao',prior:cityKnowledge.lucia?.['Rua Ramiro Alves'],line:'Você conta a Francisco o que conversou com Lúcia. Ele reconhece que a feira e os passeios também são feitos de histórias compartilhadas.'}};
 const link=links[id];
 if(link?.prior&&!cityLinks.includes(link.key)){
  cityLinks.push(link.key);changed=true;text+=' 🌿 '+link.line;
  living.notes.unshift({day,text:link.line});living.notes=living.notes.slice(0,12);
 }
 return {text,changed};
}
function cityConsequenceFor(id,context){
 const {cityKnowledge:knowledge,luciaGarden:garden,biaLetters:letters,sideNeighbors:neighbors,marketMorning:market,fairMorning,day,growthStage}=context;
 if(id==='lucia'&&knowledge.lucia?.['Rua Ramiro Alves']&&garden.claimed&&growthStage>=1){
  const stages=['','as primeiras folhas','o botão de flor','a flor aberta'];
  return {key:growthStage===3?'lucia-flor':null,text:'Lúcia relaciona a pausa que você compartilhou na Rua Ramiro Alves com '+stages[growthStage]+'. “As coisas crescem no seu tempo.”'};
 }
 if(id==='damiao'&&knowledge.damiao?.['Rua Independência']&&market.claimed&&fairMorning&&['fita','conversa'].includes(neighbors.marketLegacy?.kind)){
  const choice=neighbors.marketLegacy.kind;
  const line=choice==='fita'?'a fita que você preparou com Ciça':'a conversa tranquila que vocês escolheram na feira';
  const later=Number.isInteger(neighbors.marketLegacy.day)&&day>neighbors.marketLegacy.day;
  return {key:'damiao-feira-'+choice,text:'Nesta manhã de feira, Francisco lembra '+line+' e a Rua Independência que você lhe contou.'+(later?' “Passaram-se dias, mas a gentileza ficou.”':'')};
 }
 if(id==='bia'&&knowledge.bia?.['Rua da Cruz']&&letters.claimed){
  const themes={saudade:'a saudade que viaja conosco',planos:'os caminhos que ainda queremos conhecer',retorno:'a alegria de encontrar o caminho de volta'};
  if(!themes[letters.theme])return null;
  const later=day>knowledge.bia['Rua da Cruz'];
  return {key:'bia-carta-'+letters.theme,text:'Bia relaciona a Rua da Cruz, que você lhe contou, à carta sobre '+themes[letters.theme]+'.'+(later?' “Ainda lembro do que conversamos naquele dia.”':'')};
 }
 return null;
}
function restoreCityConsequences(raw,context){
 if(!Array.isArray(raw))return [];
 const possible=[
  context.cityKnowledge.lucia?.['Rua Ramiro Alves']&&context.luciaGarden.claimed?'lucia-flor':null,
  context.cityKnowledge.damiao?.['Rua Independência']&&context.marketMorning.claimed&&['fita','conversa'].includes(context.sideNeighbors.marketLegacy?.kind)?'damiao-feira-'+context.sideNeighbors.marketLegacy.kind:null,
  context.cityKnowledge.bia?.['Rua da Cruz']&&context.biaLetters.claimed?'bia-carta-'+context.biaLetters.theme:null
 ];
 return possible.filter(key=>key&&raw.includes(key));
}
function restoreCityReports(raw,currentDay,events){
 if(!Array.isArray(raw))return [];
 const restored=[];
 for(const report of raw){
  if(!report||typeof report!=='object'||!Number.isInteger(report.day)||report.day<1||report.day>=currentDay)continue;
  const event=events.find(e=>e.id===report.id&&e.weekday===(report.day-1)%7);
  if(!event||![event.host,event.visitor].includes(report.from)||restored.some(r=>r.id===report.id&&r.day===report.day))continue;
  restored.push({id:event.id,day:report.day,from:report.from,source:'ouvido'});
  if(restored.length===20)break;
 }
 return restored;
}
function cityReportCandidate(events,day,id,seen,heard){
 if(!Number.isInteger(day)||day<=1)return null;
 for(let past=day-1;past>=Math.max(1,day-6);past--){
  const event=events.find(e=>e.weekday===(past-1)%7&&[e.host,e.visitor].includes(id));
  if(event&&!seen.includes(event.id)&&!heard.some(r=>r.id===event.id&&r.day===past))return {event,day:past,from:id,source:'ouvido'};
 }
 return null;
}
function restoreWeeklyVisits(raw,currentDay,world){
 if(!Array.isArray(raw))return [];
 const restored=[];
 for(const item of raw){
  if(!item||!Number.isInteger(item.day)||item.day<1||item.day>currentDay)continue;
  const scenes=[17*60+15,11*60+20].map(minute=>world.weeklyReunion({day:item.day,minute}));
  if(!scenes.some(scene=>scene?.id===item.id&&scene.phase==='visit'))continue;
  if(restored.some(r=>r.id===item.id&&r.day===item.day))continue;
  restored.push({id:item.id,day:item.day});
  if(restored.length>=20)break;
 }
 return restored;
}
function weeklyVisitEntry(scene,people,playerPosition){
 if(!scene||scene.phase!=='visit')return null;
 const participants=[scene.host,scene.visitor].map(id=>people.find(p=>p.id===id));
 if(participants.some(p=>!p||p.arriving))return null;
 if(Math.hypot(participants[0].x-participants[1].x,participants[0].y-participants[1].y)>78)return null;
 if(!participants.some(p=>Math.hypot(playerPosition.x-p.x,playerPosition.y-p.y)<65))return null;
 return{id:scene.id,day:scene.day};
}
function friendshipTraditionFor(id,context){
 const {day,sideNeighbors:neighbors,marketMorning:market,luciaGarden:garden,growthStage,weeklyVisitsSeen:visits,fairMorning}=context;
 const kind=neighbors.marketLegacy?.kind,marketDay=neighbors.marketLegacy?.day;
 if(['damiao','cica'].includes(id)&&market.claimed&&['fita','conversa'].includes(kind)&&Number.isInteger(marketDay)&&day>=marketDay+7&&fairMorning){
  const gesture=kind==='fita'?'a fita preparada com Ciça':'a conversa tranquila depois de arrumar a banca';
  return {key:id+':feira-'+kind,text:(id==='cica'?'Ciça':'Francisco')+' mantém viva a lembrança de '+gesture+'. “Nossa feira também é feita de pequenos cuidados.”'};
 }
 if(['bia','lucia'].includes(id)){
  const visit=visits.find(v=>v.day<=day-7);
  if(visit)return {key:id+':visita',text:(id==='bia'?'Bia':'Lúcia')+' recorda a visita que vocês compartilharam: “Que bom ter uma amiga para trocar notícias, mesmo quando a semana muda.”'};
 }
 if(id==='zeca'&&garden.claimed&&growthStage===3&&neighbors.connections?.zecaLucia&&day>(neighbors.connections.zecaLuciaDay||0))
  return {key:'zeca:flor',text:'Zeca reconhece que a muda cuidada com Lúcia floresceu. “Eu me lembro de quando você contou daquele cuidado.”'};
 if(id==='teo'&&neighbors.recados?.stage===3&&Number.isInteger(neighbors.lastHelp?.teo)&&day>neighbors.lastHelp.teo)
  return {key:'teo:recados',text:'Téo reorganiza os bilhetes que vocês realmente entregaram. “Algumas mensagens encontram um caminho de volta.”'};
 return null;
}
function restoreFriendshipTraditions(raw,context){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const record of raw){
  if(!record||!Number.isInteger(record.day)||record.day<1||record.day>context.living.day||typeof record.key!=='string')continue;
  const id=record.key.split(':')[0],growthStage=context.growthAt?.(record.day)??0;
  const valid=friendshipTraditionFor(id,{...context,day:record.day,growthStage,fairMorning:true});
  if(!valid||valid.key!==record.key||result.some(r=>r.key===record.key))continue;
  result.push({key:record.key,day:record.day});
  if(result.length===8)break;
 }
 return result;
}
function hearFriendshipTradition(id){
 const story=friendshipTraditionFor(id,{day:living.day,sideNeighbors,marketMorning,luciaGarden,
  growthStage:window.RoncadorLuciaGarden.growth(luciaGarden,living.day).stage,
  weeklyVisitsSeen,fairMorning:isMarketMorning()});
 if(!story)return '';
 if(!friendshipTraditions.some(r=>r.key===story.key)){
  friendshipTraditions.push({key:story.key,day:living.day});friendshipTraditions=friendshipTraditions.slice(0,8);
  living.notes.unshift({day:living.day,text:'Tradição lembrada em conversa: '+story.text.slice(0,125)});living.notes=living.notes.slice(0,12);
  save();
 }
 return story.text;
}
function storyEndingFor(id,context){
 const {day,friendshipTraditions:traditions,cityConsequences:consequences}=context;
 const heard=key=>traditions.find(r=>r.key===key);
 const fair=heard('damiao:feira-fita')||heard('damiao:feira-conversa');
 if(['damiao','cica'].includes(id)&&fair){
  const kind=fair.key.split('-').at(-1),cica=heard('cica:feira-'+kind);
  if(cica&&day>=Math.max(fair.day,cica.day)+7)return {id:'feira-que-volta',title:'A feira que sempre volta',icon:'🧺',text:'Você reencontrou Francisco e Ciça depois de outras semanas. A gentileza que escolheram virou uma pequena tradição, sem precisar de outra recompensa.'};
 }
 const zeca=heard('zeca:flor');
 if(['lucia','zeca'].includes(id)&&zeca&&consequences.includes('lucia-flor')&&day>=zeca.day+7)
  return {id:'jardim-que-fica',title:'O jardim que continua',icon:'🌷',text:'Lúcia e Zeca guardaram a lembrança do cuidado que você realmente compartilhou. A flor cresceu; a amizade também ganhou tempo.'};
 const teo=heard('teo:recados');
 if(['bia','teo'].includes(id)&&teo&&consequences.some(key=>key.startsWith('bia-carta-'))&&day>=teo.day+7)
  return {id:'cartas-que-voltam',title:'Cartas que encontram casa',icon:'✉️',text:'Você retomou os recados de Téo e a carta concluída com Bia. São histórias diferentes, reunidas pelo cuidado de lembrar e responder.'};
 return null;
}
function restoreStoryEndings(raw,context){
 if(!Array.isArray(raw))return [];
 const restored=[];
 for(const entry of raw){
  if(!entry||!Number.isInteger(entry.day)||entry.day<1||entry.day>context.living.day)continue;
  const result=['damiao','lucia','bia'].map(id=>storyEndingFor(id,{...context,day:entry.day})).find(story=>story?.id===entry.id);
  if(result&&!restored.some(r=>r.id===entry.id))restored.push({id:entry.id,day:entry.day});
 }
 return restored;
}
function rememberStoryEnding(id){
 const ending=storyEndingFor(id,{day:living.day,friendshipTraditions,cityConsequences});
 if(!ending)return '';
 if(!storyEndings.some(record=>record.id===ending.id)){
  storyEndings.push({id:ending.id,day:living.day});
  living.notes.unshift({day:living.day,text:'Desfecho afetivo: '+ending.title+'. '+ending.text.slice(0,105)});living.notes=living.notes.slice(0,12);
  save();notify('♡ Uma história amadureceu: '+ending.title+'.');
  return ending.text;
 }
 return 'Vocês ainda guardam a lembrança de “'+ending.title+'”.';
}
function restoreMicroStories(raw,day){
 if(!Array.isArray(raw))return [];
 const entries=[];
 for(const item of raw){
  if(!item||!MICRO_STORIES[item.id]||!Number.isInteger(item.day)||item.day<1||item.day>day||entries.some(e=>e.id===item.id))continue;
  entries.push({id:item.id,day:item.day});
 }
 return entries;
}
function restoreLastJournalDay(raw,day){return Number.isInteger(raw)&&raw>=1&&raw<=day?raw:day;}
function notebookReturnSummary(previous,day,records){
 const days=Math.max(0,day-previous),fresh=records.filter(r=>r.day>previous&&r.day<=day);
 if(days===0)return 'Tudo em seu tempo: caminhe e volte quando tiver novidades.';
 return 'Passaram-se '+days+' dia(s) do calendário do jogo desde sua última leitura. '+(fresh.length?fresh.length+' nova(s) lembrança(s) registrada(s) nesse intervalo.':'Mesmo sem novos registros, os moradores seguiram suas rotinas fictícias.');
}
function restoreWorldMoments(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||!WORLD_MOMENTS[entry.id]||!Number.isInteger(entry.day)||entry.day<1||entry.day>day||result.some(r=>r.id===entry.id))continue;
  result.push({id:entry.id,day:entry.day});
 }
 return result;
}
function restoreStreetVignettes(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||!Object.hasOwn(STREET_VIGNETTES,entry.id)||!Number.isInteger(entry.day)||entry.day<1||entry.day>day||result.some(record=>record.id===entry.id))continue;
  result.push({id:entry.id,day:entry.day});
 }
 return result;
}
function restoreEverydayMemories(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const item of raw){
  if(!item||!Object.hasOwn(EVERYDAY_STORIES,item.id)||!Number.isInteger(item.day)||item.day<1||item.day>day||result.some(memory=>memory.id===item.id))continue;
  result.push({id:item.id,day:item.day});
 }
 return result;
}
function restoreSaoPedroTales(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||!Object.hasOwn(SAO_PEDRO_TALES,entry.id)||!Number.isInteger(entry.day)||entry.day<1||entry.day>day||result.some(record=>record.id===entry.id))continue;
  if(entry.id==='contado-bia'&&!result.some(record=>record.id==='ouvido-damiao'&&record.day<entry.day))continue;
  result.push({id:entry.id,day:entry.day,source:SAO_PEDRO_TALES[entry.id].source});
 }
 return result;
}
function recordSaoPedroConversation(id,day,records,marketClaimed){
 if(id==='damiao'&&marketClaimed&&!records.some(record=>record.id==='ouvido-damiao'))return 'ouvido-damiao';
 const heard=records.find(record=>record.id==='ouvido-damiao');
 if(id==='bia'&&heard&&day>heard.day&&!records.some(record=>record.id==='contado-bia'))return 'contado-bia';
 return null;
}
function rememberSaoPedroStory(id){
 const key=recordSaoPedroConversation(id,living.day,saoPedroTales,marketMorning.claimed);
 if(!key)return '';
 const tale=SAO_PEDRO_TALES[key];
 saoPedroTales.push({id:key,day:living.day,source:tale.source});
 living.notes.unshift({day:living.day,text:('São Pedro · '+tale.source+': '+tale.text).slice(0,160)});
 living.notes=living.notes.slice(0,12);save();return tale.text;
}
function breadStoryCandidate(id,day,records,marketClaimed){
 if(id==='damiao'&&marketClaimed&&!records.length)return 'ouvido-damiao';
 const first=records.find(r=>r.id==='ouvido-damiao');
 if(id==='lucia'&&first&&day>first.day&&!records.some(r=>r.id==='ouvido-lucia'))return 'ouvido-lucia';
 const second=records.find(r=>r.id==='ouvido-lucia');
 if(id==='bia'&&second&&day>second.day&&!records.some(r=>r.id==='contado-bia'))return 'contado-bia';
 return null;
}
function restoreBreadStories(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||!Object.hasOwn(BREAD_STORIES,entry.id)||!Number.isInteger(entry.day)||entry.day<1||entry.day>day||result.some(r=>r.id===entry.id))continue;
  const previous=result.at(-1);
  if(entry.id==='ouvido-damiao'&&result.length)continue;
  if(entry.id==='ouvido-lucia'&&(!previous||previous.id!=='ouvido-damiao'||entry.day<=previous.day))continue;
  if(entry.id==='contado-bia'&&(!previous||previous.id!=='ouvido-lucia'||entry.day<=previous.day))continue;
  result.push({id:entry.id,day:entry.day,source:BREAD_STORIES[entry.id].source});
 }
 return result;
}
function rememberBreadStory(id){
 const key=breadStoryCandidate(id,living.day,breadStories,marketMorning.claimed);
 if(!key)return '';
 const story=BREAD_STORIES[key];breadStories.push({id:key,day:living.day,source:story.source});
 living.notes.unshift({day:living.day,text:('O cheiro do pão da manhã · '+story.source+': '+story.text).slice(0,160)});
 living.notes=living.notes.slice(0,12);save();return story.text;
}
function restoreMorningEncounters(raw,day){
 if(!Array.isArray(raw))return [];
 const seen=new Set();
 return raw.filter(entry=>{
  if(!entry||!Object.hasOwn(MORNING_GREETING_LINES,entry.id)||!Number.isInteger(entry.day)||entry.day<1||entry.day>day)return false;
  const key=entry.day+':'+entry.id;
  if(seen.has(key))return false;
  seen.add(key);return true;
 }).slice(-90).map(entry=>({id:entry.id,day:entry.day}));
}
function morningGreetingCandidate(id,day,minute,records){
 if(!Object.hasOwn(MORNING_GREETING_LINES,id)||minute<8*60||minute>=10*60||records.some(entry=>entry.id===id&&entry.day===day))return null;
 const past=records.filter(entry=>entry.id===id&&entry.day<day);
 return {line:MORNING_GREETING_LINES[id][(day-1)%3],returning:past.length>0&&day>past.at(-1).day+1};
}
function rememberMorningGreeting(id){
 const greeting=morningGreetingCandidate(id,living.day,living.minute,morningEncounters);
 if(!greeting)return '';
 morningEncounters.push({id,day:living.day});morningEncounters=morningEncounters.slice(-90);
 save();return (greeting.returning?'“Que bom encontrar você de novo depois de alguns dias!” ':'')+greeting.line;
}
function everydayConversationCandidate(id,context){
 if(id==='damiao'&&context.marketClaimed&&context.careDay>0&&context.day>context.careDay)return 'damiao-cestos';
 if(id==='lucia'&&context.gardenClaimedDay>0&&context.day>=context.gardenClaimedDay+2&&context.gardenStage>=1)return 'lucia-tempo';
 if(id==='bia'&&context.letterClaimed&&context.witnessedVisitDays.some(day=>day<context.day))return 'bia-reencontro';
 return null;
}
function everydayStreetCandidate(roads,position,minute,seen){
 if(minute<17*60||minute>=19*60)return null;
 for(const [roadName,id] of [['Rua Clovis Bezerra','rua-clovis-tarde'],['Rua Nunes','rua-nunes-tarde'],['Rua Antônio Borges de Lima','rua-borges-tarde']]){
  if(seen.some(memory=>memory.id===id))continue;
  const point=closestNamedRoad(roads,position,roadName);
  if(point&&point.d<23)return id;
 }
 return null;
}
function rememberEverydayStory(id){
 if(!id||!EVERYDAY_STORIES[id]||everydayMemories.some(memory=>memory.id===id))return false;
 const story=EVERYDAY_STORIES[id];
 everydayMemories.push({id,day:living.day});
 living.notes.unshift({day:living.day,text:('Cotidiano de Belém: '+story.name+'. '+story.text).slice(0,160)});
 living.notes=living.notes.slice(0,12);save();return true;
}
function observeEverydayStreet(){
 const id=everydayStreetCandidate(roads,player,living.minute,everydayMemories);
 if(!id||!rememberEverydayStory(id))return false;
 notify('🏘️ '+EVERYDAY_STORIES[id].name+' · lembrança no diário, sem tarefa nem recompensa.');return true;
}
function nextStreetVignette(place,seen,context){
 const candidates={
  mercado:['mercado-escuta','mercado-sorda',context.marketClaimed?'mercado-cuidado':null],
  igreja:[context.churchKnown?'igreja-memoria':null,context.gardenStage>=1?'igreja-folhas':null,context.gardenStage===3?'igreja-flor':null],
  rodoviaria:[context.letterClaimed?'rodoviaria-cartas':null],
  mato:[context.raining?'mato-chuvisco':'mato-claridade']
 };
 return (candidates[place]||[]).find(id=>id&&!seen.some(record=>record.id===id))||null;
}
function activeSeasonalTheme(date){
 if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return null;
 const month=date.getMonth()+1,day=date.getDate();
 return Object.entries(SEASONAL_THEMES).find(([,theme])=>theme.months.some(([m,start,end])=>m===month&&day>=start&&day<=end))?.[0]||null;
}
function restoreSeasonalMemories(raw,day,year){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||!Object.hasOwn(SEASONAL_THEMES,entry.theme)||!['mercado','igreja','rodoviaria','mato'].includes(entry.place)||!['atmosphere','friends'].includes(entry.kind)||!Number.isInteger(entry.day)||entry.day<1||entry.day>day||!Number.isInteger(entry.year)||entry.year<2020||entry.year>year||result.some(record=>record.theme===entry.theme&&record.year===entry.year&&record.place===entry.place&&record.kind===entry.kind))continue;
  result.push({theme:entry.theme,place:entry.place,kind:entry.kind,day:entry.day,year:entry.year});
 }
 return result.slice(-60);
}
function seasonalEncounter(place,people,position,context){
 const pairs={
  mercado:['damiao','cica',context.marketClaimed&&context.cicaKnown,'Francisco e Ciça trocam um sorriso e lembram a gentileza que você compartilhou na feira.'],
  igreja:['lucia','bia',context.gardenClaimed&&context.biaKnown,'Lúcia mostra a Bia como o jardim cresceu desde os cuidados que vocês dividiram.'],
  rodoviaria:['bia','teo',context.letterClaimed&&context.recadosClaimed,'Bia e Téo recordam as cartas e os recados que realmente foram guardados.']
 };
 const pair=pairs[place];if(!pair||!pair[2])return null;
 const cast=pair.slice(0,2).map(id=>people.find(person=>person.id===id&&!person.walking&&!person.arriving));
 if(cast.some(person=>!person)||cast.some(person=>Math.hypot(person.x-position.x,person.y-position.y)>60)||Math.hypot(cast[0].x-cast[1].x,cast[0].y-cast[1].y)>65)return null;
 return pair[3];
}
function recordSeasonalMoment(place){
 const now=new Date(),themeId=activeSeasonalTheme(now);
 if(!themeId)return false;
 const theme=SEASONAL_THEMES[themeId],year=now.getFullYear();
 const people=residentsInStreets().concat(secondaryInStreets()),friends=seasonalEncounter(place,people,player,{
  marketClaimed:marketMorning.claimed,cicaKnown:sideNeighbors.seen.includes('cica'),
  gardenClaimed:luciaGarden.claimed,biaKnown:living.people.bia?.bond>0,
  letterClaimed:biaLetters.claimed,recadosClaimed:sideNeighbors.recados?.stage===3
 });
 const kind=friends?'friends':'atmosphere';
 if(seasonalMemories.some(entry=>entry.theme===themeId&&entry.year===year&&entry.place===place&&entry.kind===kind))return false;
 const locationName={mercado:'feira',igreja:'Matriz',rodoviaria:'Rodoviária',mato:'paisagem verde'}[place];
 const text=friends||('A época temática de '+theme.name+' inspira uma pequena pausa na '+locationName+'. O cenário e os encontros são ficcionais, sem atribuir essa festa à cidade real.');
 seasonalMemories.push({theme:themeId,year,place,kind,day:living.day});
 living.notes.unshift({day:living.day,text:('Cena sazonal '+theme.name+': '+text).slice(0,160)});living.notes=living.notes.slice(0,12);
 save();notify(theme.icon+' '+theme.name+' · '+text);return true;
}
function observeSeasonalEncounter(){
 if(!active||!activeSeasonalTheme(new Date())||anyDialog())return;
 const place=worldMomentAt(data,player);if(!place)return;
 const people=residentsInStreets().concat(secondaryInStreets());
 const witnessed=seasonalEncounter(place,people,player,{
  marketClaimed:marketMorning.claimed,cicaKnown:sideNeighbors.seen.includes('cica'),
  gardenClaimed:luciaGarden.claimed,biaKnown:living.people.bia?.bond>0,
  letterClaimed:biaLetters.claimed,recadosClaimed:sideNeighbors.recados?.stage===3
 });
 if(witnessed)recordSeasonalMoment(place);
}
function worldMomentAt(map,position){
 for(const id of ['mercado','igreja','rodoviaria']){
  const landmark=map.landmarks.find(l=>l.id===id);
  if(landmark&&Math.hypot(position.x-landmark.p[0],position.y-landmark.p[1])<65)return id;
 }
 const park=map.areas.find(a=>a.tags?.leisure==='park'&&a.tags?.name==='Mato'),ring=park?.p?.[0];
 if(ring?.length>=3&&(inside(position.x,position.y,ring)||ring.some(p=>Math.hypot(position.x-p[0],position.y-p[1])<30)))return 'mato';
 return null;
}
function pauseNeighborComment(id,people,position,context){
 const lines={
  mercado:{damiao:['Francisco','É bom ver você de novo por aqui. A feira também precisa de um respiro.','market']},
  igreja:{lucia:['Lúcia','A muda continua seguindo seu tempo, mesmo quando a gente para um instante.','garden']},
  rodoviaria:{bia:['Bia','Ainda guardo aquela carta. Algumas despedidas também são recomeços.','letter']}
 };
 for(const person of people){
  const line=lines[id]?.[person.id];
  if(!line||Math.hypot(person.x-position.x,person.y-position.y)>55)continue;
  if(line[2]==='market'&&!context.marketClaimed)continue;
  if(line[2]==='garden'&&!context.gardenClaimed)continue;
  if(line[2]==='letter'&&!context.letterClaimed)continue;
  if(!(context.bonds?.[person.id]>0))continue;
  return line[0]+': “'+line[1]+'”';
 }
 return null;
}
function beginWorldPause(id){
 if(kawaiiState?.riding){notify('Desça da motinha para fazer uma pausa tranquila.');return;}
 worldPause={id,age:0,comment:pauseNeighborComment(id,residentsInStreets(),player,{
  marketClaimed:marketMorning.claimed,gardenClaimed:luciaGarden.claimed,
  letterClaimed:biaLetters.claimed,bonds:Object.fromEntries(Object.entries(living.people).map(([key,value])=>[key,value.bond]))
 })};
 const focus=[...(showGroundedFlora?floraLayer.points:[]).filter(p=>p.kind==='flowerbed'),...houses]
  .filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.hypot(p.x-player.x,p.y-player.y)<38)
  .sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];
 if(focus)player.dir=focus.x>=player.x?1:-1;
 player.moving=false;
}
function recordStreetVignette(place){
 const id=nextStreetVignette(place,streetVignettes,{
  marketClaimed:marketMorning.claimed,
  churchKnown:!!cultureNotes.igreja,
  gardenStage:window.RoncadorLuciaGarden.growth(luciaGarden,living.day).stage,
  letterClaimed:biaLetters.claimed,raining:skyMode==='chuvisco'
 });
 if(!id)return false;
 const story=STREET_VIGNETTES[id];
 streetVignettes.push({id,day:living.day});
 living.notes.unshift({day:living.day,text:('Cena observada: '+story.title+'. '+story.text).slice(0,160)});
 living.notes=living.notes.slice(0,12);
 save();notify('✿ '+story.title+' — '+story.text);return true;
}
function observeWorldMoment(){
 const id=worldMomentAt(data,player);if(!id)return false;
 const moment=WORLD_MOMENTS[id];
 if(kawaiiState?.riding){notify('Desça da motinha para observar com calma.');return true;}
 beginWorldPause(id);
 if(worldMoments.some(record=>record.id===id)){
  if(recordStreetVignette(id))return true;
  if(recordSeasonalMoment(id))return true;
  notify(moment.icon+' Você revisita '+moment.title.toLowerCase()+'. Respire e aprecie a paisagem.');return true;
 }
 worldMoments.push({id,day:living.day});
 living.notes.unshift({day:living.day,text:'Pausa contemplativa: '+moment.story.slice(0,138)});living.notes=living.notes.slice(0,12);
 save();note(523,0,.13);notify(moment.icon+' '+moment.title+' · um instante para respirar. Lembrança guardada sem recompensa.');return true;
}
function camucaHas(stage){return camucaStories.some(r=>r.stage===stage);}
function restoreCamucaStories(raw,day){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const item of raw){
  if(!item||!CAMUCA_STAGES.includes(item.stage)||camucaHasRestored(result,item.stage)||!Number.isInteger(item.day)||item.day<1||item.day>day)continue;
  const prior=result.at(-1);
  if(item.stage!==CAMUCA_STAGES[result.length]||(prior&&item.day<=prior.day))continue;
  if(item.stage==='lembranca'&&item.day<prior.day+3)continue;
  if(item.stage==='chuva'&&item.weather!=='chuvisco')continue;
  result.push({stage:item.stage,day:item.day,...(item.stage==='chuva'?{weather:'chuvisco'}:{})});
 }
 return result;
}
function camucaHasRestored(rows,stage){return rows.some(r=>r.stage===stage);}
function recordCamucaStage(stage){
 if(camucaHas(stage))return false;
 camucaStories.push({stage,day:living.day,...(stage==='chuva'?{weather:'chuvisco'}:{})});
 living.notes.unshift({day:living.day,text:('Caderno de paisagem · '+CAMUCA_TEXT[stage]).slice(0,160)});
 living.notes=living.notes.slice(0,12);save();notify('🌿 Caderno dos caminhos · '+CAMUCA_TEXT[stage]);return true;
}
function observeCamucaPrelude(){
 // A observação acontece somente no ponto verde já jogável, nunca na crista da serra.
 if(worldMomentAt(data,player)!=='mato'||kawaiiState?.riding)return false;
 if(!camucaHas('chuva')&&skyMode==='chuvisco')return recordCamucaStage('chuva');
 const rain=camucaStories.find(r=>r.stage==='chuva');
 if(rain&&!camucaHas('claridade')&&skyMode==='sol'&&living.day>rain.day)return recordCamucaStage('claridade');
 return false;
}
function talkCamucaPrelude(id){
 if(!camucaHas('claridade'))return '';
 const stage=id==='damiao'?'terra':id==='bia'&&camucaHas('terra')?(!camucaHas('bia-ouviu')?'bia-ouviu':living.day>camucaStories.find(r=>r.stage==='bia-ouviu').day+2?'lembranca':''):'';
 if(!stage||camucaHas(stage)||living.day<=camucaStories.at(-1).day)return '';
 recordCamucaStage(stage);return CAMUCA_TEXT[stage];
}
function restoreWaterMemories(raw,day,water){
 if(!Array.isArray(raw))return [];
 const valid=new Set(water.map(w=>w.id)),seen=new Set();
 return raw.filter(r=>{
  if(!r||!valid.has(r.id)||seen.has(r.id)||!Number.isInteger(r.day)||r.day<1||r.day>day)return false;
  seen.add(r.id);return true;
 }).map(r=>({id:r.id,day:r.day}));
}
function waterConversationCandidate(id,day,memories,talks){
 if(!['damiao','lucia','bia'].includes(id)||!memories.length)return null;
 const first=Math.min(...memories.map(r=>r.day));
 if(day<=first)return null;
 const shared=talks.find(r=>r.id===id&&r.step==='shared');
 if(!shared)return{step:'shared',day};
 if(day>=shared.day+3&&!talks.some(r=>r.id===id&&r.step==='remembered'))return{step:'remembered',day};
 return null;
}
function restoreWaterTalks(raw,day,memories){
 if(!Array.isArray(raw)||!memories.length)return [];
 const result=[];
 for(const r of raw){
  if(!r||!['damiao','lucia','bia'].includes(r.id)||!['shared','remembered'].includes(r.step)||!Number.isInteger(r.day)||r.day<1||r.day>day)continue;
  const next=waterConversationCandidate(r.id,r.day,memories,result);
  if(next?.step===r.step)result.push({id:r.id,step:r.step,day:r.day});
 }
 return result;
}
function rememberWaterConversation(id){
 const next=waterConversationCandidate(id,living.day,waterMemories,waterTalks);
 if(!next)return '';
 const first=next.step==='shared';
 const lines={
  damiao:first?'Você conta sobre o açude que observou. O feirante responde: “A água também faz parte das histórias de trabalho e cuidado desta terra.”':'Ele recorda o açude que você mencionou dias atrás: “Algumas paisagens fazem a gente cuidar melhor do que tem.”',
  lucia:first?'Você conta a Lúcia da margem que contemplou. Ela responde: “Até o jardim me faz lembrar que a água pede atenção e tempo.”':'Lúcia se lembra do açude que você descreveu: “O cuidado fica, mesmo quando o tempo passa.”',
  bia:first?'Você conta a Bia da água que observou. Ela abre o caderno: “Posso guardar sua história sem fingir que eu também estive lá?”':'Bia lembra o relato que você compartilhou: “Seu passeio virou uma página bonita no meu caderno.”'
 };
 waterTalks.push({id,step:next.step,day:living.day});
 const text=lines[id];living.notes.unshift({day:living.day,text:('Águas da cidade · '+text).slice(0,160)});living.notes=living.notes.slice(0,12);
 save();return text;
}
function nearestWaterView(position,water,visited,nearRoad){
 if(!nearRoad||nearRoad.d>14)return null;
 let best=null;
 for(const shape of water){
  if(visited.some(r=>r.id===shape.id)||inside(position.x,position.y,shape.p))continue;
  for(let i=1;i<shape.p.length;i++){
   const a=shape.p[i-1],b=shape.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
   if(len2<.001)continue;
   const t=Math.max(0,Math.min(1,((position.x-a[0])*dx+(position.y-a[1])*dy)/len2));
   const d=Math.hypot(position.x-a[0]-t*dx,position.y-a[1]-t*dy);
   if(d<65&&(!best||d<best.d))best={id:shape.id,d};
  }
 }
 return best?.id||null;
}
function observeWater(){
 if(!verifiedWater.length||kawaiiState?.riding)return false;
 const id=nearestWaterView(player,verifiedWater,waterMemories,nearestRoad(player.x,player.y));
 if(!id)return false;
 waterMemories.push({id,day:living.day});
 living.notes.unshift({day:living.day,text:'Você contemplou a margem de um açude identificado no OpenStreetMap. O reflexo da água e a vegetação são interpretações artísticas; nenhuma entrada ou propriedade privada foi acessada.'});
 living.notes=living.notes.slice(0,12);save();
 notify('💧 Pausa junto à água · paisagem registrada no diário, sem recompensa.');return true;
}
function closestNamedRoad(roads,point,name){
 let best=null;
 for(const road of roads||[]){
  if(road.tags?.name!==name)continue;
  for(let i=1;i<road.p.length;i++){
   const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
   if(!len2)continue;
   const t=Math.min(1,Math.max(0,((point.x-a[0])*dx+(point.y-a[1])*dy)/len2));
   const x=a[0]+dx*t,y=a[1]+dy*t,d=Math.hypot(point.x-x,point.y-y);
   if(!best||d<best.d)best={x,y,d};
  }
 }
 return best;
}
function observeRuaNovaPath(){
 for(const name of RUA_NOVA_ROADS){
  if(ruaNovaPaths.includes(name))continue;
  const point=closestNamedRoad(roads,player,name);
  if(!point||point.d>27)continue;
  ruaNovaPaths.push(name);
  if(Number.isInteger(living.day)&&living.day>=1)ruaNovaDays[name]=living.day;
  living.notes.unshift({day:living.day,text:RUA_NOVA_STORIES[name].memory+' Trecho mapeado; personagens e interpretação são fictícios.'});
  living.notes=living.notes.slice(0,12);
  save();notify(RUA_NOVA_STORIES[name].icon+' '+RUA_NOVA_STORIES[name].title+' registrada! Caminhos: '+ruaNovaPaths.length+'/3.');
  return true;
 }
 return false;
}
function observe(){
 if(!active||anyDialog()){if(!active)notify('Comece a expedição para registrar suas paisagens.');return;}
 if(observeCamucaPrelude())return;
 if(observeWater())return;
 if(observeRuaNovaPath())return;
 if(observeEverydayStreet())return;
 let key='vila',label='A vila e seus caminhos';
 if(distance(player,missions[5].p)<145){key='mata';label='Os caminhos da natureza';}
 else if(distance(player,missions[2].p)<120){key='campo';label='Os arredores do campo';}
 if(observations.has(key)){if(observeWorldMoment())return;notify('Essa paisagem já está no diário. Explore outra região para descobrir mais!');return;}
 observations.add(key);
 const photo=capturePhoto();if(photo)photos[key]=photo;
 $('memoryFlash').classList.remove('active');void $('memoryFlash').offsetWidth;$('memoryFlash').classList.add('active');
 note(587,0,.16);note(784,.12,.28);
 if(chapter===2){chapter=3;friendship=Math.max(3,friendship);notify('✿ '+label+' registrada! Capítulo 01 concluído · amizade com Lia +1 ♥');}
 else notify('✿ '+label+' registrada no diário! '+observations.size+'/3 paisagens.');
 chapterUI();save();
}
function interactAction(){
 if(nearGuide){talkGuide();return;}
 if(nearResident?.meeting){talkResident(nearResident.id);return;}
 if(nearResident){talkResident(nearResident.id);return;}
 if(nearSecondary){talkSecondary(nearSecondary.id);return;}
 if(near>=0){collect();return;}
 if(nearCulture){showCulture(nearCulture.id);return;}
 collect();
}
function renderMissions(){const list=$('missions');list.replaceChildren();missions.forEach((m,i)=>{let li=document.createElement('li'),b=document.createElement('button');b.className='mission'+(collected.has(i)?' done':'')+(i===target?' active':'');b.setAttribute('aria-label',`${m.title}, ${m.name}${collected.has(i)?', concluído':''}`);b.setAttribute('aria-pressed',String(i===target));let stamp=document.createElement('span');stamp.className='stamp';stamp.textContent=collected.has(i)?'✓':String(i+1).padStart(2,'0');let words=document.createElement('span');let title=document.createElement('span');title.className='mission-name';title.textContent=m.title;let place=document.createElement('span');place.className='mission-place';place.textContent=m.name;words.append(title,place);let arrow=document.createElement('span');arrow.className='mission-arrow';arrow.textContent=collected.has(i)?'✧':'↗';b.append(stamp,words,arrow);b.onclick=()=>{target=i;renderMissions();updateUI();$('sidebar').classList.remove('open');syncRoute();notify(collected.has(i)?'Você já guardou essa descoberta.':`Siga até ${m.name}.`);save();};li.append(b);list.append(li);});}
function formatTime(n){let m=Math.floor(n/60),s=Math.floor(n%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
function observeCommunity(){
 if(!active)return;
 const story=window.RoncadorStreetCommunity.current(living);
 if(!story||story.phase!=='visit')return;
 const people=residentsInStreets().concat(secondaryInStreets());
 const cast=[story.host,story.visitor].map(id=>people.find(p=>p.id===id));
 if(cast.some(p=>!p)||Math.hypot(cast[0].x-cast[1].x,cast[0].y-cast[1].y)>82)return;
 const near=cast.some(p=>Math.hypot(player.x-p.x,player.y-p.y)<68);
 const result=window.RoncadorStreetCommunity.observe(communitySeen,story,near);
 if(result.ok){save();note(523,0,.12);note(659,.1,.15);notify(result.unlocked?'♡ Três encontros presenciados! Uma memória entrou no álbum.':'♡ Você guardou o encontro: '+story.title+' ('+result.count+'/3).');}
}
function observeWeeklyVisit(){
 if(!active)return;
 const scene=window.RoncadorLivingWorld.weeklyReunion(living);
 const entry=weeklyVisitEntry(scene,residentsInStreets(),player);
 if(!entry||weeklyVisitsSeen.some(r=>r.id===entry.id&&r.day===entry.day))return;
 weeklyVisitsSeen.unshift(entry);weeklyVisitsSeen=weeklyVisitsSeen.slice(0,20);
 living.notes.unshift({day:living.day,text:'Você presenciou uma visita entre Bia e Lúcia: '+scene.summary});living.notes=living.notes.slice(0,12);
 save();notify('♡ Você presenciou uma visita de Bia e Lúcia. A lembrança ficou no diário.');
}
function restoreSmallWalkRecords(raw,day,source){
 if(!Array.isArray(raw))return [];
 const result=[];
 for(const entry of raw){
  if(!entry||entry.source!==source||!Number.isInteger(entry.day)||entry.day<8||entry.day>day)continue;
  const event=window.RoncadorLivingWorld.smallWalkOccurred(entry.day);
  if(!event||entry.id!==event.id||result.some(r=>r.id===entry.id&&r.day===entry.day))continue;
  if(source==='ouvido'&&(!['damiao','lucia','bia'].includes(entry.from)||![event.visitor,event.host].includes(entry.from)||entry.heardDay<=entry.day||entry.heardDay>day))continue;
  result.push({id:entry.id,day:entry.day,source,...(source==='ouvido'?{from:entry.from,heardDay:entry.heardDay}:{})});
  if(result.length>=40)break;
 }
 return result;
}
function observeSmallWalk(){
 if(!active)return;
 const scene=window.RoncadorLivingWorld.smallWalkAt(living);
 if(!scene||scene.phase!=='visit'||smallWalksSeen.some(e=>e.id===scene.id&&e.day===scene.day))return;
 const people=residentsInStreets(),visitor=people.find(p=>p.id===scene.visitor),host=people.find(p=>p.id===scene.host);
 if(!visitor||!host||visitor.arriving||host.arriving||Math.hypot(visitor.x-host.x,visitor.y-host.y)>70)return;
 if(Math.min(Math.hypot(player.x-visitor.x,player.y-visitor.y),Math.hypot(player.x-host.x,player.y-host.y))>68)return;
 smallWalksSeen.unshift({id:scene.id,day:scene.day,source:'presenciado'});smallWalksSeen=smallWalksSeen.slice(0,40);
 living.notes.unshift({day:living.day,text:'Você presenciou: '+scene.title+'. Os moradores fizeram uma visita fictícia por ruas existentes.'});living.notes=living.notes.slice(0,12);
 save();notify('♡ Você presenciou um pequeno passeio. A lembrança entrou no diário.');
}
function rememberSmallWalk(id){
 const world=window.RoncadorLivingWorld;
 for(let d=living.day-1;d>=Math.max(8,living.day-14);d--){
  const event=world.smallWalkOccurred(d);
  if(!event||![event.visitor,event.host].includes(id)||smallWalkReports.some(r=>r.id===event.id&&r.day===d))continue;
  const witnessed=smallWalksSeen.some(r=>r.id===event.id&&r.day===d);
  const line=witnessed?'Você estava por perto naquele pequeno encontro. Foi uma conversa boa, dessas que ficam.':'Outro dia, fizemos uma visita breve para trocar notícias. Você não estava lá, mas agora posso contar.';
  smallWalkReports.unshift({id:event.id,day:d,heardDay:living.day,from:id,source:'ouvido'});smallWalkReports=smallWalkReports.slice(0,40);
  living.notes.unshift({day:living.day,text:('Relato de '+world.RESIDENTS.find(r=>r.id===id).name+': '+event.title+'. '+line).slice(0,160)});living.notes=living.notes.slice(0,12);
  save();return line;
 }
 return '';
}
function updateUI(){const count=collected.size;$('progressLabel').innerHTML=count+' <em>/ 6 selos</em>';$('progressBar').style.width=(count/6*100)+'%';$('progressText').textContent=count===0?'O primeiro passo já é uma aventura.':count===6?'Um passaporte cheio de boas histórias.':`Mais ${6-count} pequenos mundos para descobrir.`;$('mobileCount').textContent=count+'/6';$('timer').textContent=formatTime(elapsed);
 const approximateHeight=terrainLayer?.sample(player.x,player.y);
 $('terrainReadout').textContent=approximateHeight==null?'⛰ Fora da grade':'⛰ ≈'+Math.round(approximateHeight)+' m';
 $('terrainReadout').title='NASA SRTM ~30 m amostrado em grade de 140 m: altitude aproximada do terreno, não medição do piso.';
 if(target>=0&&missions[target]){const m=missions[target],d=distance(player,m.p);$('destination').hidden=false;$('destinationName').textContent=m.title;$('distance').textContent=d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m';let a=Math.atan2(m.p[1]-player.y,m.p[0]-player.x);document.querySelector('.destination-arrow').style.transform=`rotate(${a*180/Math.PI+45}deg)`;}else{$('destination').hidden=true;}
 near=-1;let nearest=32;missions.forEach((m,i)=>{if(collected.has(i))return;const d=distance(player,m.p);if(d<nearest){nearest=d;near=i;}});
 const guideDistance=Math.hypot(player.x-guide.x,player.y-guide.y);
 nearGuide=guideDistance<32;
 nearCulture=data.landmarks.find(l=>Math.hypot(player.x-l.p[0],player.y-l.p[1])<43)||null;
 const residentSnapshot=residentsInStreets(),secondarySnapshot=secondaryInStreets(residentSnapshot);
 // Select the nearest available speaker across both casts. Otherwise a
 // primary resident can hide a closer neighbour's conversation button.
 const closestSpeaker=residentSnapshot.concat(secondarySnapshot).reduce((best,p)=>{
  const d=Math.hypot(player.x-p.x,player.y-p.y);
  return d<42&&(!best||d<best.d)?{person:p,d}:best;
 },null);
 nearResident=closestSpeaker&&!closestSpeaker.person.secondary?closestSpeaker.person:null;
 nearSecondary=closestSpeaker?.person.secondary?closestSpeaker.person:null;
 if(closestSpeaker&&closestSpeaker.d<guideDistance)nearGuide=false;
 $('interact').hidden=!active||(near<0&&!nearGuide&&!nearCulture&&!nearResident&&!nearSecondary)||anyDialog();
 if(nearGuide)$('interact').innerHTML='♥ Conversar com Lia <kbd>E</kbd>';
 else if(nearResident?.meeting)$('interact').innerHTML='♡ Participar da conversa <kbd>E</kbd>';
 else if(nearResident)$('interact').innerHTML='♥ Falar com '+nearResident.def.name+' <kbd>E</kbd>';
 else if(nearSecondary)$('interact').innerHTML='✿ Conversar com '+nearSecondary.def.name+' <kbd>E</kbd>';
 else if(near>=0)$('interact').innerHTML='✦ '+missions[near].title+' <kbd>E</kbd>';
 else if(nearCulture)$('interact').innerHTML='✿ Visitar '+nearCulture.name+' <kbd>E</kbd>';
 $('cozyGuideHint').hidden=!active||w<600||zoom<1.15||guideDistance>85||guideDistance<32||Math.abs((guide.x-camera.x)*zoom)>w/2-30||Math.abs((guide.y-camera.y)*zoom)>h/2-30||anyDialog();
 const road=nearestRoad(player.x,player.y);$('location').textContent=road.d<35?(road.s.road.tags.name||'Um caminho de Belém'):'Pelos caminhos de Belém';observeMarketArrival();observeLuciaArrival();observeBiaArrival();observeCommunity();observeWeeklyVisit();observeSmallWalk();observeSeasonalEncounter();chapterUI();lifeSummary();renderMarketChapter();renderLuciaChapter();renderBiaChapter();renderFairQuest();renderMomentsUI();syncFairUI();syncContactsUI();syncKawaiiUI();observeMarketChange(secondarySnapshot);drawMini();}
function collect(){if(!active||anyDialog())return;updateUI();if(near<0){notify('Chegue perto de um marco dourado para guardar o selo.');return;}const i=near,m=missions[i];collected.add(i);target=missions.findIndex((_,j)=>!collected.has(j));for(let n=0;n<22;n++){const a=n/22*Math.PI*2;particles.push({x:m.p[0],y:m.p[1]-16,vx:Math.cos(a)*18,vy:Math.sin(a)*18-10,life:1.5,r:1.2+hash(n)*2,color:n%2?'#f3d586':'#faf0be'});}note(523,0,.2);note(659,.1,.2);note(784,.2,.35);notify('Selo '+(collected.size)+'/6 · '+m.name+' — '+m.description);renderMissions();updateUI();save();if(collected.size===missions.length)setTimeout(()=>{if(collected.size===6){$('winTime').textContent=formatTime(elapsed);showDialog('winDialog');note(1046,.1,.4);}},950);}
function gpsFor(p){const proj=data.projection;return{lat:proj.originLat-p[1]/proj.metersPerDegreeLat,lon:proj.originLon+p[0]/proj.metersPerDegreeLon};}
function locationLinks(p){const {lat,lon}=gpsFor(p),at=lat.toFixed(6)+','+lon.toFixed(6);return{maps:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(at),streetView:'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+encodeURIComponent(at)};}
const CULTURE={
 mercado:{title:'A feira é feita de encontros',kind:'market',description:'A Feira Livre é patrimônio cultural imaterial municipal reconhecido pela Lei 475/2019. A Padaria da Tia aparece como lembrança culinária ficcional do jogo, com pão francês, pão doce de coco, bolos e rosquinhas; sua localização não foi confirmada. A segunda-feira é o dia tradicional documentado da feira; as barracas e pessoas são ilustrações.',lead:'Escolha o que deseja registrar no caderno da feira:',choices:['A história dos alimentos','O trabalho de quem vende','As conversas entre bancas'],source:'https://www.belem.pb.gov.br/noticia/prefeita-renata-sanciona-lei-tornando-patrim-nio-cultural-imaterial-a-feira-livre-a-sorda-de-jo-o-de-deus-e-a-prociss-o-da-padroeira'},
 igreja:{title:'Memórias da Conceição',kind:'church',description:'A Procissão de Nossa Senhora da Conceição também é patrimônio cultural imaterial de Belém. A igreja desenhada é um cartão ilustrativo, não a orientação ou o tamanho real do edifício.',lead:'Qual detalhe do patrimônio você vai guardar?',choices:['A torre e os arcos','A memória da procissão','As histórias entre gerações'],source:'https://www.belem.pb.gov.br/noticia/prefeita-renata-sanciona-lei-tornando-patrim-nio-cultural-imaterial-a-feira-livre-a-sorda-de-jo-o-de-deus-e-a-prociss-o-da-padroeira'},
 rodoviaria:{title:'Cartas de quem vai e volta',kind:'terminal',description:'Os catálogos de entrevistas urbanas da UFPB mencionam deslocamento para estudar, trabalho, migração e planos para o futuro. Esta pequena atividade é ficcional; não reproduz a fala de nenhum entrevistado.',lead:'Qual tema será o seu cartão de viagem?',choices:['Estudar em outra cidade','Voltar para reencontrar amigos','Um sonho para o futuro'],source:'https://repositorio.ufpb.br/jspui/bitstream/123456789/23987/2/CoLingPB_Caracter%C3%ADsticas%20dos%20%C3%A1udios_t%C3%B3picos%20abordados_Agreste-Zona%20Urbana.pdf'},
 praca_6_setembro:{title:'Praça 6 de Setembro — jardim de encontros',kind:'square',description:'A reforma da Praça 6 de Setembro em 2023 trouxe cascata iluminada, anfiteatro e jardins suspensos, conforme notícia municipal. A nova cena artística usa esses três elementos, mas não reproduz a planta construída nem possui localização GPS confirmada.',lead:'A praça é uma descoberta documental nesta versão; não há rota até uma coordenada suposta.',choices:[],source:'https://belem.pb.gov.br/public/index.php/noticia/gestora-aline-barbosa-entrega-nova-praca-6-de-setembro-e-populacao-prestigia-o-cartao-postal-de-belem'},
 escola_anita:{title:'EMEF Anita de Melo Barbosa Lima',kind:'school',description:'Localizada na Rua Clóvis Bezerra, s/n, Centro (trajeto a confirmar). O prédio escolar faz parte do cotidiano da rua, das eleições e das lembranças de infância e juventude em Belém.',lead:'Qual lembrança da Escola Anita Barbosa você quer registrar?',choices:['Uma caminhada pela Clóvis Bezerra','O movimento do pátio e os reencontros de turma','As árvores e a fachada azul e branca da escola'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
 escola_felinto:{title:'Escola Felinto Elizio',kind:'school',description:'Uma escola estadual no Centro de Beit Lehem, representada por um ponto escolar público do OpenStreetMap. A localização é aproximada; entrada e fachada não foram verificadas. O desenho é fictício.',lead:'Que lembrança de uma escola da cidade você gostaria de imaginar?',choices:['O movimento de estudantes na saída','Amigos trocando novidades no caminho','Um dia de jogos entre turmas'],source:''},
 xaviezao:{title:'Ginásio Poliesportivo "O Xaviezão"',kind:'gym',description:'Situado entre a Rua Brasiliana da Costa, 40 e a Rua Nunes Guedes, ao lado da Câmara Municipal. Com sua cobertura metálica em arco, O Xaviezão reúne treinos, jogos escolares, futsal e encontros da galera.',lead:'O que vamos viver hoje no Xaviezão?',choices:['Torcer na arquibancada com os amigos','Bater bola na quadra sob o teto arqueado','Conferir o movimento ao lado da Câmara Municipal'],source:'http://cmbelem.pb.gov.br/'},
 bar_prosa:{title:"Bar da Prosa — Espetinhos, Calçada & Karaokê",kind:'bar',description:"Na Rua Vicente Cado, 354, Centro, o Bar da Prosa é o ponto clássico para reunir os amigos (Amigos fictícios e toda a turma) nas mesinhas amarelas da calçada, pedir espetinhos na brasa e soltar a voz no karaokê.",lead:"Qual momento no Bar da Prosa vai para o seu álbum?",choices:['Soltar a voz no karaokê com os amigos','Dividir espetinhos nas mesas da Rua Vicente Cado','Rir das histórias sob o varal de luzes quentes'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
 sonho_doce:{title:'Confeitaria & Padaria Sonho Doce',kind:'bakery',description:'Na Rua Feliciano Pedrosa, 1401, bem no coração comercial de Belém, a Sonho Doce é parada obrigatória para um café da tarde, fatias de bolo confeitado, doces e salgados depois de caminhar pelo Centro.',lead:'Escolha seu pedido favorito para recordar:',choices:['Dividir uma fatia de bolo confeitado com café','Escolher salgados e doces na vitrine iluminada','Observar o movimento da Rua Feliciano Pedrosa'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
 prefeitura:{title:'Prefeitura Municipal · Rua Flávio Ribeiro, 74',kind:'hall',description:'Localizada na Rua Flávio Ribeiro, 74, a sede municipal conecta o eixo cívico do Centro aos Correios (Praça 6 de Setembro, 61) e aos eventos culturais como a Sexta Cultural e o São Pedro de Belém.',lead:'Registre um olhar sobre o centro cívico de Belém:',choices:['As bandeiras na fachada da Rua Flávio Ribeiro','A caminhada entre a Prefeitura, Correios e Praça 6 de Setembro','Os preparativos da Sexta Cultural e do São Pedro'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
 sagrada_familia:{title:'Igreja Matriz Sagrada Família · R. Florânea com Clóvis Bezerra',kind:'chapel',description:'Situada no encontro da Rua Florânea com a Rua Clóvis Bezerra, a Igreja Matriz Sagrada Família marca a chegada da rua residencial ao miolo central de Belém.',lead:'Registre uma lembrança da esquina da Rua Florânea com a Clóvis Bezerra:',choices:['O encontro da Rua Clóvis Bezerra com a Rua Florânea','A fachada acolhedora da Matriz Sagrada Família','O caminho entre a escola, a igreja e os Correios'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
 hospital_santa_lucia:{title:'Hospital Santa Lúcia & Vizinhança Sul',kind:'hall',description:'Ponto mapeado no OpenStreetMap logo atrás da Rua Clóvis Bezerra e da Rua Antônio Alfredo Guedes, compondo a paisagem cotidiana de quem mora perto do sem número residencial.',lead:'Guarde um registro desta quadra da vizinhança:',choices:['A tranquilidade das ruas ao redor do Hospital Santa Lúcia','O cruzamento da Antônio Alfredo Guedes com a Rua Nunes','A caminhada de volta para a calçada da Casa da Varanda'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'},
  parque_sao_luis:{title:'Parque Artesanal São Luís · Roda-Gigante & Criatividade Popular',kind:'amusement',description:'Inspirado no famoso Parque de Diversões São Luís (Lagoa de Serra, Belém/PB), construído pelo Sr. José Luís com materiais reciclados e sucata. A roda-gigante colorida e o carrossel giram trazendo alegria para toda a cidade!',lead:'Escolha o que viver no Parque Artesanal São Luís:',choices:['Dar uma volta na Roda-Gigante artesanal 🎡','Admirar a engenhosidade dos brinquedos reciclados ✨','Tirar uma foto kawaii com os amigos no parque 📸'],source:'https://www.belem.pb.gov.br/public/index.php/noticia/turismo-projeto-destino-brejo-destaca-atrativos-do-munic-pio-de-bel-m'},
 pedra_cordeiro:{title:'Mirante da Pedra do Cordeiro · Fronteira Agreste–Brejo',kind:'rockview',description:'A oeste do centro de Belém, a Pedra do Cordeiro reúne um cruzeiro no alto, mandacarus, xique-xiques e vista panorâmica da cidade e das serras do Brejo. A trilha existe na documentação municipal, mas seu percurso ainda não foi mapeado no jogo.',lead:'Escolha um detalhe para registrar no caderno de referências (sem simular uma visita):',choices:['Conhecer a história do cruzeiro no alto ⛰','Reconhecer mandacarus e xique-xiques na encosta 🌵','Imaginar a vista de Belém e das serras ☀'],source:'https://www.belem.pb.gov.br/public/index.php/noticia/turismo-projeto-destino-brejo-destaca-atrativos-do-munic-pio-de-bel-m'},
 capela_luz:{title:'Capela Nossa Senhora da Luz & Bairro da Luz',kind:'chapel',description:'No alto da Rua Mário Barbosa (acessada pela Rua Vicente Cado e Rua Abdias Machado), a Capela da Luz guarda a devoção histórica do bairro e a tradição festiva do Bloco da Paz Risca Faca na segunda de Carnaval.',lead:'Qual memória do Bairro da Luz você quer guardar?',choices:['A subida pelas ruas Vicente Cado e Abdias Machado','A arquitetura acolhedora da Capela na Rua Mário Barbosa','A alegria tradicional do Bloco da Paz Risca Faca'],source:'https://www.belem.pb.gov.br/a-cidade/aspectos-gerais'}
};
function culturePlace(id){return data.landmarks.find(l=>l.id===id)||data.cultureReferences?.find(l=>l.id===id);}
function cultureWithinReach(place){return !!(active&&place?.p&&Math.hypot(player.x-place.p[0],player.y-place.p[1])<43);}
function syncMarketToggle(){const toggle=$('marketAtmosphere'),automatic=isMarketMorning();toggle.hidden=cultureActiveId!=='mercado';toggle.disabled=automatic;toggle.setAttribute('aria-pressed',String(fairAtmosphere()));toggle.textContent=automatic?'☀ A feira aparece automaticamente na segunda do jogo':marketDay?'✿ Encerrar feira ilustrativa adicional':'✿ Imaginar um dia de feira agora';}
function showCulture(id){if(!loaded||!CULTURE[id])return;const place=culturePlace(id),story=CULTURE[id];cultureActiveId=id;const documentary=id==='pedra_cordeiro';const reachable=documentary||cultureWithinReach(place);
 $('cultureTitle').textContent=story.title;$('cultureDescription').textContent=story.description;
 $('cultureReliability').textContent=documentary?'Pino público de referência · contorno e entrada da trilha não verificados':place?.p?'Marcador do OpenStreetMap · edifício e acesso não verificados':'Apenas referência documental · sem posição no mapa';
 $('cultureActionLead').textContent=reachable?story.lead:story.choices.length?'Caminhe até o marcador para realizar esta atividade. Você pode marcar a rota abaixo.':story.lead;
 const options=$('cultureOptions');options.replaceChildren();for(const choice of story.choices){const button=document.createElement('button');button.type='button';button.textContent=choice;button.disabled=!reachable;button.setAttribute('aria-pressed',String(cultureNotes[id]===choice));button.onclick=()=>{cultureNotes[id]=choice;chapterUI();if(id==='mercado')recordFairQuest('mercado');
 const contactMatch=window.RoncadorBelemContacts?.CONTACTS.find(c=>c.hub===id);
 if(contactMatch)window.RoncadorBelemContacts.completeHangout(belemContacts,contactMatch.id);
 syncContactsUI();save();showCulture(id);notify('Uma nova memória de Belém foi guardada no caderno!');};options.append(button);}
 $('cultureResult').textContent=cultureNotes[id]?'✿ No seu caderno: '+cultureNotes[id]+'.':documentary?'Registro documental: nenhuma caminhada ou chegada ao cruzeiro é simulada.':'As escolhas são do jogador, não depoimentos de moradores.';
 $('cultureRoute').hidden=documentary||!place?.p||!active||reachable;
 // Historical images and source URLs remain in the repository research archive,
 // but the in-world cultural postcard is always original Canvas artwork.
 $('cultureEvidence').hidden=true;
 $('cultureEvidenceImage').removeAttribute('src');
 syncMarketToggle();window.RoncadorLandmarks.drawPostcard($('cultureArtwork'),story.kind,fairAtmosphere());
 if(!$('cultureDialog').open)showDialog('cultureDialog');}
function openCultureFromGuide(id){if($('realCityDialog').open)$('realCityDialog').close();showCulture(id);}
function showNature(){if(!loaded)return;const phases=['🌱','🌿','💧','🌾'];const actions=['Preparar a terra ♧','Plantar macaxeira 🌱','Cuidar da água 💧','Colher e recomeçar 🌾'];const notes=['Um cantinho de terra para começar.','O cultivo começa com paciência.','Água é cuidado — e uma memória muito presente nas entrevistas.','A colheita ilustrativa está pronta! Depois podemos preparar a terra novamente.'];
 $('naturePlant').textContent=phases[gardenStep];$('natureSteps').textContent=gardenStep===3?'Pronto para colher':gardenStep+'/3 cuidados';$('natureStory').textContent=notes[gardenStep];$('natureAction').textContent=actions[gardenStep];$('natureAction').disabled=false;
 $('gardenHarvests').textContent=String(gardenHarvests);
 $('natureRainNote').textContent=skyMode==='chuvisco'&&gardenStep===2?'☂ O chuvisco imaginário está regando seu canteiro · '+Math.floor(rainCare)+'/8 minutos do jogo.':skyMode==='chuvisco'?'☂ Chuvisco ilustrativo ativo. Depois de plantar, ele poderá cuidar da rega por você.':'☀ Você pode escolher Chuvisco no botão Céu, no mapa, para experimentar a rega natural no jogo.';
 $('wildlifeToggle').setAttribute('aria-pressed',String(showWildlife));$('wildlifeToggle').textContent=showWildlife?'🦋 Ocultar bichinhos ilustrativos no mapa':'🦋 Mostrar bichinhos ilustrativos no mapa';
 $('groundedFloraToggle').setAttribute('aria-pressed',String(showGroundedFlora));$('groundedFloraToggle').textContent=showGroundedFlora?'♧ Ocultar floreios dentro das áreas verdes OSM':'♧ Mostrar floreios dentro das áreas verdes OSM';
 $('greenCoverage').textContent=`${floraLayer.greenPolygons} polígonos verdes identificados no OSM geraram ${floraLayer.points.length} detalhes ilustrativos internos, afastados das ruas e das casas. Eles representam textura vegetal artística, não pés de árvores cadastrados, espécies identificadas ou dados raster MapBiomas.`;
 $('wildlifeCoverage').textContent=`${wildlife.length} animações decorativas distribuídas apenas dentro dos polígonos verdes desta extração OSM e afastadas de ruas e fachadas. Não são pontos de avistamento ou identificação de espécies.`;
 const green=data.areas.filter(a=>a.tags.leisure==='park'||a.tags.landuse==='grass'||a.tags.leisure==='nature_reserve').length;
 const water=data.areas.filter(a=>a.tags.natural==='water'||a.tags.waterway).length,rock=data.areas.filter(a=>a.tags.natural==='bare_rock'||a.tags.natural==='scree').length,farmland=data.areas.filter(a=>a.tags.landuse==='farmland'||a.tags.landuse==='orchard').length;
 $('natureCoverage').textContent=`Nesta extração OSM municipal: ${green} áreas verdes ou de proteção mapeadas; ${water} polígonos de água; ${rock} de rocha; ${farmland} agrícolas. O atlas SGB acrescenta ${geologyPoints.length} observações geológicas pontuais verificáveis por coordenadas, sem inferir seu contorno. A ausência de polígonos não significa que esses elementos não existam em Belém. Não vamos desenhar lagos, pedras ou roçados em locais inventados.`;
 if(!$('natureDialog').open)showDialog('natureDialog');}
function lifeSummary(){
 if(!loaded)return;
 const world=window.RoncadorLivingWorld;
 $('lifeClock').textContent=world.label(living);
 $('lifeBrief').textContent=world.event(living);
 const encounters=window.RoncadorStreetEncounters,encounter=encounters.current(living),upcoming=encounters.next(living),community=window.RoncadorStreetCommunity.current(living);
 $('streetEncounter').classList.toggle('is-live',!!(community||encounter));
 $('streetEncounterIcon').textContent=(community||encounter||upcoming)?.icon||'♡';
 if(community){
  $('streetEncounterTitle').textContent=community.title+(community.phase==='visit'?' · conversando agora!':' · pelas ruas');
  $('streetEncounterLine').textContent=community.phase==='visit'?window.RoncadorStreetCommunity.line(living,community):community.summary;
 }else if(encounter){
  $('streetEncounterTitle').textContent=encounter.title+(encounter.phase==='visit'?' · juntos agora!':' · pelas ruas');
  $('streetEncounterLine').textContent=encounter.phase==='visit'?encounters.line(living,encounter):encounter.phase==='approach'?'Uma visita segue pelas ruas do centro até o Mercado.':'A visita volta para casa pelo mesmo caminho.';
 }else if(upcoming){
  const nextDay=world.DAYS[upcoming.weekday],at=String(Math.floor(upcoming.start/60)).padStart(2,'0')+':'+String(upcoming.start%60).padStart(2,'0');
  $('streetEncounterTitle').textContent='Próxima cena · '+upcoming.title;
  $('streetEncounterLine').textContent=nextDay+', '+at+' (hora fictícia). A cidade segue seu ritmo.';
 }
 const neighborCount=window.RoncadorNeighborhoodQuest.progress(living);
 $('neighborCount').textContent=neighborCount===3?'3/3 · cartão no álbum ✓':neighborCount+'/3 amizades';
 $('carePreview').textContent=world.careProgress(living)+'/3 gestos';
 const out=residentsInStreets();
 const other=secondaryInStreets(),number=out.length+other.length;
 $('sideProgress').textContent=sideNeighbors.seen.length+'/3 conhecidos';
 $('streetResidentsCount').textContent=number+' vizinhos pelas ruas';
 $('streetResidentsHint').textContent=community?community.icon+' '+community.title:encounter?encounter.icon+' '+encounter.title:number?out.concat(other).map(p=>p.def.name.replace('Seu ','').replace('Dona ','')).join(' · '):'Noite de descanso e boas lembranças';
 $('streetPulse').setAttribute('aria-label',number+' pessoas pela cidade. Abrir o caderno de rotinas fictícias.');
 for(const [id,tag] of [['damiao','castDamiao'],['lucia','castLucia'],['bia','castBia']]){
  const present=out.some(p=>p.id===id);
  $(tag).classList.toggle('is-out',present);
  $(tag).title=world.RESIDENTS.find(p=>p.id===id).name+(present?' · nas ruas':' · em outra atividade');
 }
}
function rememberedLandscapeLine(registered){
 if(registered?.has('mata'))return '✿ Você recorda a paisagem de natureza que fotografou no diário; a lembrança acompanha esta conversa.';
 if(registered?.has('campo'))return '✿ Você recorda os arredores do campo que registrou no diário.';
 return '';
}
function gardenStageDialogue(person,growth){
 if(!growth||!Number.isInteger(growth.stage))return '';
 const lucia=[
  'A mudinha ainda está se acostumando à terra. Vamos dar tempo a ela.',
  'As folhas estão mais abertas! Você percebe como os pequenos cuidados ficam?',
  'Um botão começou a surgir. Lembra de quando plantamos juntos?',
  'Olhe a flor! Nossa lembrança cresceu mesmo quando você estava longe.'
 ];
 const zeca=[
  'Ainda é cedo para a muda crescer, mas o cuidado já começou.',
  'Você viu as folhas da muda de Lúcia? Elas estão se abrindo.',
  'Parece que a muda de Lúcia ganhou um botão. O tempo fez sua parte.',
  'A flor de Lúcia abriu! Eu lembro da conversa que tivemos sobre os cuidados.'
 ];
 return (person==='zeca'?zeca:lucia)[Math.max(0,Math.min(3,growth.stage))];
}
function meetResident(id){
 const wasUnlocked=window.RoncadorNeighborhoodQuest.unlocked(living);
 const result=window.RoncadorLivingWorld.talk(living,id),def=window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id===id);
 if(id==='damiao')recordFairQuest('damiao');
 $('lifeConversation').textContent=def.name+': “'+result.text+'”'+(result.newMemory?' ♥ Uma lembrança entrou no diário.':'');
 const weekStory=result.newMemory?window.RoncadorLivingWorld.lastWeekRoutine(living,id):'';
 if(weekStory){
  $('lifeConversation').textContent+=' ☀ '+weekStory;
  const watched=weeklyVisitsSeen.some(r=>r.day>=living.day-13&&r.day<living.day&&r.id===(id==='bia'?'bia-visita-lucia':'lucia-visita-bia'));
  if(watched&&id!=='damiao')$('lifeConversation').textContent+=' ♡ Você também estava lá quando nos encontramos.';
 }
 const tradition=hearFriendshipTradition(id);
 if(tradition)$('lifeConversation').textContent+=' ♡ '+tradition;
 const ending=rememberStoryEnding(id);
 if(ending)$('lifeConversation').textContent+=' ✿ '+ending;
 const recados=window.RoncadorSecondaryNeighbors,recadoStage=recados.recadoStage(sideNeighbors);
 let connectionChanged=false;
 if(id==='damiao'&&recadoStage>=1){
  if(recados.rememberConnection(sideNeighbors,'damiaoTeo')){connectionChanged=true;$('lifeConversation').textContent+=' ✉️ Você conta a Francisco sobre o bilhete que recebeu de Téo. Ele sorri: “Uma gentileza também percorre a cidade.”';}
  else $('lifeConversation').textContent+=' ✉️ Francisco se lembra da conversa de vocês sobre o bilhete de Téo.';
 }
 if(id==='damiao'&&sideNeighbors.marketLegacy?.kind)$('lifeConversation').textContent+=' ♡ '+recados.fairMemoryLine(sideNeighbors,'damiao');
 if(id==='bia'&&recadoStage===3){
  if(recados.rememberConnection(sideNeighbors,'biaTeo')){connectionChanged=true;$('lifeConversation').textContent+=' ✉️ Você conta a Bia que o recado de Téo voltou à Rodoviária. Ela diz: “Uma boa despedida também sabe dar boas-vindas.”';}
  else $('lifeConversation').textContent+=' ✉️ Bia se lembra do recado de Téo que você contou.';
  if(biaLetters.claimed)$('lifeConversation').textContent+=' ♡ Ela também lembra a carta que vocês escreveram juntos.';
 }
 const cityStory=rememberCityStory(id,living.day);
 if(cityStory.text){
  $('lifeConversation').textContent+=' 🌳 '+cityStory.text;
  if(cityStory.changed)connectionChanged=true;
  if(id==='bia'&&!ruaNovaShared){ruaNovaShared=true;connectionChanged=true;}
 }
 const cityConsequence=cityConsequenceFor(id,{cityKnowledge,luciaGarden,biaLetters,sideNeighbors,marketMorning,fairMorning:isMarketMorning(),day:living.day,growthStage:window.RoncadorLuciaGarden.growth(luciaGarden,living.day).stage});
 if(cityConsequence){
  $('lifeConversation').textContent+=' ♡ '+cityConsequence.text;
  if(cityConsequence.key&&!cityConsequences.includes(cityConsequence.key)){
   cityConsequences.push(cityConsequence.key);connectionChanged=true;
   living.notes.unshift({day:living.day,text:cityConsequence.text.slice(0,160)});living.notes=living.notes.slice(0,12);
  }
 }
 const reported=cityReportCandidate(window.RoncadorStreetCommunity.EVENTS,living.day,id,communitySeen,cityReports);
 if(reported){
  const reportText='Você ouviu de '+def.name+' sobre '+reported.event.title+' no dia '+reported.day+'. Relato de uma rotina fictícia; você não presenciou esse encontro.';
  cityReports.unshift({id:reported.event.id,day:reported.day,from:id,source:'ouvido'});cityReports=cityReports.slice(0,20);
  $('lifeConversation').textContent+=' ✉️ '+def.name+' conta uma novidade de outro dia: “'+reported.event.summary+'” (Você soube por um relato, não presenciou.)';
  living.notes.unshift({day:living.day,text:reportText.slice(0,160)});living.notes=living.notes.slice(0,12);
  connectionChanged=true;
 }
 if(id==='lucia')$('lifeConversation').textContent+=' '+rememberedLandscapeLine(observations);
 if(id==='lucia'&&luciaGarden.claimed)$('lifeConversation').textContent+=' 🌷 '+gardenStageDialogue('lucia',window.RoncadorLuciaGarden.growth(luciaGarden,living.day));
 const encounter=window.RoncadorStreetEncounters.current(living);
 if(encounter?.phase==='visit'&&(encounter.cast||[encounter.host,encounter.visitor]).includes(id)){
  $('lifeConversation').textContent+=' ♡ Você encontrou os amigos conversando! '+encounter.summary+' '+window.RoncadorStreetEncounters.line(living,encounter);
 }
 const community=window.RoncadorStreetCommunity.current(living);
 if(community?.phase==='visit'&&window.RoncadorStreetCommunity.participant(community,id)){
  $('lifeConversation').textContent+=' ♡ '+community.summary+' '+window.RoncadorStreetCommunity.line(living,community);
 }
 if(id==='damiao'&&!marketMorning.talked&&nearMarket(115)){
  window.RoncadorMarketMorning.meet(marketMorning);
  $('lifeConversation').textContent+=' Francisco aponta para a banca imaginária: “Me ajuda a estender o toldo e organizar as frutas e os cestos? Depois eu te conto uma novidade.”';
  renderMarketChapter();save();
 }
 if(id==='lucia'&&marketMorning.claimed&&!luciaGarden.talked&&nearChurch(115)){
  window.RoncadorLuciaGarden.meet(luciaGarden);
  $('lifeConversation').textContent+=' Lúcia segura uma mudinha: “A gente cuida de uma planta e lembra de quem ama. Me ajuda a preparar a terra, plantar e regar? Depois escolhemos uma memória para ela.” Feche o caderno e abra a atividade no capítulo do Jardim, no diário de viagem.';
  renderLuciaChapter();save();
 }
 if(id==='bia'&&luciaGarden.claimed&&!biaLetters.talked&&nearBus(135)){
  window.RoncadorBiaLetters.meet(biaLetters);
  $('lifeConversation').textContent+=' Bia segura seu caderno: “Às vezes a gente sonha em ir longe e sente saudade antes mesmo de partir. Você me ajuda a escrever uma carta que guarde um caminho de volta?” Feche o caderno dos moradores e abra a atividade no capítulo das Cartas, no diário de viagem.';
  renderBiaChapter();save();
 }
 const recollection=affectionSnapshot(id);
 if(recollection?.remembered||recollection?.close){$('lifeConversation').textContent+=' ♡ '+def.name+' se recorda: “'+recollection.line+'”';}
 const saoPedroStory=rememberSaoPedroStory(id);
 if(saoPedroStory){$('lifeConversation').textContent+=' 🎶 '+saoPedroStory;connectionChanged=true;}
 const breadStory=rememberBreadStory(id);
 if(breadStory){$('lifeConversation').textContent+=' 🥖 '+breadStory;connectionChanged=true;}
 const morningGreeting=rememberMorningGreeting(id);
 if(morningGreeting){$('lifeConversation').textContent+=' ☀ '+morningGreeting;connectionChanged=true;}
 const waterTalk=rememberWaterConversation(id);
 if(waterTalk){$('lifeConversation').textContent+=' 💧 '+waterTalk;connectionChanged=true;}
 const smallWalkTalk=rememberSmallWalk(id);
 if(smallWalkTalk){$('lifeConversation').textContent+=' 🌳 '+smallWalkTalk;connectionChanged=true;}
 const camucaTalk=talkCamucaPrelude(id);
 if(camucaTalk){$('lifeConversation').textContent+=' 🌿 '+camucaTalk;connectionChanged=true;}
 const dailyStoryId=everydayConversationCandidate(id,{
  day:living.day,marketClaimed:marketMorning.claimed,careDay:living.people.damiao?.lastCareDay||0,
  gardenClaimedDay:luciaGarden.claimed?luciaGarden.claimedDay:0,
  gardenStage:window.RoncadorLuciaGarden.growth(luciaGarden,living.day).stage,
  letterClaimed:biaLetters.claimed,
  witnessedVisitDays:weeklyVisitsSeen.filter(entry=>entry.id==='bia-visita-lucia'||entry.id==='lucia-visita-bia').map(entry=>entry.day)
 });
 if(dailyStoryId&&rememberEverydayStory(dailyStoryId)){
  $('lifeConversation').textContent+=' 🏘️ '+EVERYDAY_STORIES[dailyStoryId].text;
  connectionChanged=true;
 }
 if(result.newMemory||connectionChanged){save();if(result.newMemory)note(659,0,.13);}
 if(!wasUnlocked&&window.RoncadorNeighborhoodQuest.unlocked(living))notify('♡ Nova lembrança! Uma roda de conversas já está no seu álbum.');
 return result;
}
function talkResident(id){
 if(!active)return;
 const person=residentsInStreets().find(p=>p.id===id);
 if(!person||Math.hypot(player.x-person.x,player.y-person.y)>=43){notify('Chegue perto do morador para conversar.');return;}
 careResidentId=id;
 meetResident(id);
 renderLife();showDialog('lifeDialog');
}
function drawResidentPortrait(def,index){
 const portrait=document.createElement('canvas');portrait.width=92;portrait.height=104;portrait.className='resident-portrait';
 portrait.setAttribute('role','img');portrait.setAttribute('aria-label','Retrato kawaii ilustrado de '+def.name);
 const pc=portrait.getContext('2d');pc.fillStyle='#f1eee3';pc.fillRect(0,0,92,104);
 pc.fillStyle=def.tone+'24';pc.beginPath();pc.ellipse(46,86,34,19,0,0,7);pc.fill();
 // Portrait cards need a readable face at sidebar sizes; this only affects
 // the offscreen portrait canvas, never the walking sprite or its world scale.
 pc.save();pc.translate(46,91);pc.scale(2.5,2.5);
 drawKawaiiWalker(pc,{x:0,y:0,id:def.id,def,walking:false,meeting:false,variant:index},1.3);
 pc.restore();
 return portrait;
}
function renderCareChoices(){
 const world=window.RoncadorLivingWorld,section=$('carePanel'),buttons=$('careChoices');
 const def=world.RESIDENTS.find(p=>p.id===careResidentId),person=def&&living.people[def.id];
 const nearby=def&&residentsInStreets().some(p=>p.id===def.id&&Math.hypot(player.x-p.x,player.y-p.y)<43);
 section.hidden=!nearby;
 if(!nearby)return;
 $('careName').textContent='Uma gentileza com '+def.name;
 $('careStatus').textContent=person.lastCareDay===living.day?'Vocês já compartilharam um gesto hoje. As próximas ideias ficam para amanhã.':'Escolha uma ação acolhedora. Cada morador pode compartilhar um gesto por dia.';
 buttons.replaceChildren();
 for(const choice of world.CARE[def.id]){
  const button=document.createElement('button');button.type='button';button.className='care-choice';button.textContent=choice.label;
  button.disabled=person.lastCareDay===living.day;
  button.onclick=()=>{
   const current=residentsInStreets().find(p=>p.id===def.id);
   if(!current||Math.hypot(player.x-current.x,player.y-current.y)>=43){$('lifeConversation').textContent='Você precisa estar ao lado de '+def.name+' para ajudar.';return;}
   const result=world.care(living,def.id,choice.id);
   $('lifeConversation').textContent=result.text;
   if(result.ok){
    const micro=MICRO_STORIES[def.id];
    const firstMicro=micro?.choice===choice.id&&!microStories.some(record=>record.id===def.id);
    if(firstMicro)microStories.push({id:def.id,day:living.day});
    const chosen=def.id==='damiao'&&choice.id==='historias'&&marketMorning.claimed&&
     window.RoncadorSecondaryNeighbors.rememberFairChoice(sideNeighbors,'conversa',living.day);
    note(659,0,.12);note(784,.1,.17);save();
    if(firstMicro)notify('✿ Nova micro-história no caderno: '+micro.title+'.');
    else if(chosen)notify('☕ A conversa com Francisco ficou guardada na história da feira.');
    else if(result.progress===3)notify('♡ Três gestos! Uma lembrança especial entrou no álbum.');
   }
   renderLife();
   $('careStatus').textContent=result.text+(result.ok?' ♥ Uma gentileza registrada para hoje.':'');
  };
  buttons.append(button);
 }
}
function colorTrailProgress(state){return ['rosa','zeca','mila'].filter(id=>state?.seen?.includes(id)).length;}
function renderColorTrail(){
 const list=$('sideJournalList');if(!list)return;
 let panel=$('colorTrailQuest');
 if(!panel){
  panel=document.createElement('section');panel.id='colorTrailQuest';panel.className='side-journal-entry';
  panel.setAttribute('aria-label','Missão Caderno das três cores');
  list.insertAdjacentElement('afterend',panel);
 }
 const names=[['rosa','☕ Rosa · uma conversa'],['zeca','🌱 Zeca · um cuidado'],['mila','🎨 Mila · uma cor']];
 const count=colorTrailProgress(sideNeighbors);
 const content=document.createElement('div'),heading=document.createElement('strong'),steps=document.createElement('small');
 heading.textContent=count===3?'✓ Caderno das três cores completo':'✿ Caderno das três cores · '+count+'/3';
 steps.textContent=names.map(([id,label])=>(sideNeighbors.seen.includes(id)?'✓ ':'○ ')+label).join(' · ');
 content.append(heading,steps);
 const button=document.createElement('button');button.type='button';
 button.textContent=count===3?'✿ Ver no álbum':'⌖ Encontrar o próximo';button.disabled=!active;
 button.onclick=()=>{
  if(count===3){renderAlbum();$('lifeDialog').close();showDialog('albumDialog');return;}
  const next=names.find(([id])=>!sideNeighbors.seen.includes(id));
  const person=secondaryInStreets().find(p=>p.id===next[0]);
  if(!person){notify(next[1].slice(2)+' está descansando agora. Volte em outro horário do jogo.');return;}
  $('lifeDialog').close();setRoute(person.x,person.y,27);
 };
 panel.replaceChildren(content,button);
}
function renderRecadoThread(){
 const list=$('sideJournalList');if(!list)return;
 let panel=$('recadoThreadQuest');
 if(!panel){panel=document.createElement('section');panel.id='recadoThreadQuest';panel.className='side-journal-entry';
  panel.setAttribute('aria-label','Missão Os recados de Téo');list.insertAdjacentElement('afterend',panel);}
 const logic=window.RoncadorSecondaryNeighbors,stage=logic.recadoStage(sideNeighbors),next=logic.RECADOS[stage];
 const content=document.createElement('div'),heading=document.createElement('strong'),hint=document.createElement('small');
 heading.textContent=stage===3?'✓ Os recados de Téo completos':'✉️ Os recados de Téo · '+stage+'/3';
 hint.textContent=stage===3?'Uma lembrança de ida e volta entrou no álbum.':next.label+' · atividades e horários fictícios';
 content.append(heading,hint);
 const button=document.createElement('button');button.type='button';button.disabled=!active;
 button.textContent=stage===3?'♡ Ver no álbum':'⌖ Seguir o recado';
 button.onclick=()=>{
  if(stage===3){renderAlbum();$('lifeDialog').close();showDialog('albumDialog');return;}
  const person=secondaryInStreets().find(p=>p.id===next.id);
  if(!person){notify('Esse encontro ainda não está disponível neste horário do jogo. Volte mais tarde.');return;}
  $('lifeDialog').close();setRoute(person.x,person.y,27);
 };
 panel.replaceChildren(content,button);
}
function renderRuaNovaJournal(){
 const list=$('sideJournalList');if(!list)return;
 let panel=$('ruaNovaJournal');
 if(!panel){panel=document.createElement('section');panel.id='ruaNovaJournal';panel.className='side-journal-entry';
  panel.setAttribute('aria-label','Caderno de caminhos de Rua Nova');list.insertAdjacentElement('afterend',panel);}
 const count=ruaNovaPaths.length,next=RUA_NOVA_ROADS.find(name=>!ruaNovaPaths.includes(name));
 const copy=document.createElement('div'),heading=document.createElement('strong'),details=document.createElement('small');
 heading.textContent=count===3?'✓ Três caminhos de Rua Nova':'🌳 Caminhos de Rua Nova · '+count+'/3';
 details.textContent=RUA_NOVA_ROADS.map(name=>(ruaNovaPaths.includes(name)?'✓ ':'○ ')+name+' — '+RUA_NOVA_STORIES[name].title).join(' · ')+(count===3?' · Álbum disponível.':'');
 if(count){
  const memory=document.createElement('small');memory.textContent=RUA_NOVA_ROADS.filter(name=>ruaNovaPaths.includes(name)).map(name=>RUA_NOVA_STORIES[name].icon+' '+RUA_NOVA_STORIES[name].memory).join(' ');
  copy.append(memory);
 }
 copy.prepend(heading,details);
 if(cityLinks.length){
  const connections=document.createElement('small');connections.textContent='♡ O que a cidade guarda · '+cityLinks.length+'/2 conversas conectadas'+(cityLinks.includes('bia-lucia')?' · Bia ↔ Lúcia':'')+(cityLinks.includes('lucia-damiao')?' · Lúcia ↔ Francisco':'');
  copy.append(connections);
 }
 if(cityConsequences.length){
  const echoes=document.createElement('small');echoes.textContent='✿ Ecos que permaneceram · '+cityConsequences.length+' lembrança(s) de jardim, feira ou carta';copy.append(echoes);
 }
 const button=document.createElement('button');button.type='button';button.disabled=!active;
 button.textContent=count===3?'✿ Ver no álbum':'⌖ Ir ao próximo trecho';
 button.onclick=()=>{
  if(count===3){renderAlbum();$('lifeDialog').close();showDialog('albumDialog');return;}
  const point=closestNamedRoad(roads,player,next);
  if(!point){notify('Este trecho ainda não está disponível na malha carregada.');return;}
  const route=pathfinder?.route([player.x,player.y],[point.x,point.y]);
  if(!route){notify('Não foi encontrada uma rota conectada até esse trecho.');return;}
  $('lifeDialog').close();setRoute(point.x,point.y,20);
  notify('Siga a rota existente e use ✿ Observar ao chegar ao trecho mapeado.');
 };
 panel.replaceChildren(copy,button);
}
function renderCityReportsJournal(){
 const list=$('sideJournalList');if(!list)return;
 let panel=$('cityReportsJournal');
 if(!panel){panel=document.createElement('section');panel.id='cityReportsJournal';panel.className='side-journal-entry';panel.setAttribute('aria-label','Memórias presenciadas e relatos ouvidos');
  ($('ruaNovaJournal')||list).insertAdjacentElement('afterend',panel);}
 const community=window.RoncadorStreetCommunity,heading=document.createElement('strong'),detail=document.createElement('small');
 heading.textContent='📖 Histórias vistas e contadas';
 const witnessed=community.EVENTS.filter(e=>communitySeen.includes(e.id)).map(e=>'👀 Presenciou: '+e.title);
 const heard=cityReports.slice(0,5).map(r=>{const e=community.EVENTS.find(event=>event.id===r.id);return '✉️ Ouviu: '+e.title+' · dia '+r.day;});
 const visits=weeklyVisitsSeen.slice(0,4).map(r=>'👀 Presenciou: reencontro de Bia e Lúcia · dia '+r.day);
 const littleSeen=smallWalksSeen.slice(0,4).map(r=>'👀 Presenciou: '+window.RoncadorLivingWorld.smallWalkForDay(r.day).title+' · dia '+r.day);
 const littleHeard=smallWalkReports.slice(0,4).map(r=>'✉️ Ouviu de '+window.RoncadorLivingWorld.RESIDENTS.find(p=>p.id===r.from).name+': '+window.RoncadorLivingWorld.smallWalkForDay(r.day).title+' · dia '+r.heardDay);
 const traditions=friendshipTraditions.slice(-4).map(r=>'♡ Ouviu uma tradição de '+({damiao:'Francisco',cica:'Ciça',bia:'Bia',lucia:'Lúcia',zeca:'Zeca',teo:'Téo'}[r.key.split(':')[0]]||'um morador')+' · dia '+r.day);
 const endings=storyEndings.map(r=>'✿ História amadurecida · '+({'feira-que-volta':'A feira que sempre volta','jardim-que-fica':'O jardim que continua','cartas-que-voltam':'Cartas que encontram casa'}[r.id])+' · dia '+r.day);
 detail.textContent=[...endings,...littleSeen,...littleHeard,...visits,...witnessed,...heard,...traditions].join(' · ')||'Ainda não há encontros presenciados nem relatos recebidos.';
 panel.replaceChildren(heading,detail);
}
function renderStoryTracker(){
 const list=$('sideJournalList');if(!list)return;
 let panel=$('storyTrackerJournal');
 if(!panel){panel=document.createElement('section');panel.id='storyTrackerJournal';panel.className='side-journal-entry';panel.setAttribute('aria-label','Novidades e histórias por personagem');
  ($('cityReportsJournal')||list).insertAdjacentElement('afterend',panel);}
 const title=document.createElement('strong');title.textContent='🌿 Caderno de retorno';
 const summary=document.createElement('small');
 summary.textContent=notebookReturnSummary(lastJournalDay,living.day,[...microStories,...storyEndings,...cityReports,...weeklyVisitsSeen,...smallWalksSeen,...smallWalkReports.map(r=>({...r,day:r.heardDay})),...friendshipTraditions,...worldMoments,...streetVignettes,...everydayMemories,...saoPedroTales,...breadStories,...morningEncounters,...waterMemories,...waterTalks,...camucaStories,...seasonalMemories]);
 const finished=document.createElement('small');finished.textContent='✿ Lembranças concluídas: '+storyEndings.length+' desfecho(s) · '+microStories.length+'/3 pequenas histórias. Nenhuma é obrigatória.';
 const pauses=document.createElement('small');pauses.textContent='🌳 Pausas observadas: '+worldMoments.length+'/4'+(worldMoments.length?' · '+worldMoments.map(e=>WORLD_MOMENTS[e.id].title).join(', '):' · descubra detalhes enquanto caminha');
 const scenes=document.createElement('small');scenes.textContent='✿ Pequenas cenas vividas: '+streetVignettes.length+' · '+(streetVignettes.length?streetVignettes.map(entry=>STREET_VIGNETTES[entry.id].title).join(', '):'aprecie novamente lugares conhecidos');
 const seasonId=activeSeasonalTheme(new Date()),season=document.createElement('small');
 season.textContent=seasonId?SEASONAL_THEMES[seasonId].icon+' Temporada temática: '+SEASONAL_THEMES[seasonId].name+' · '+seasonalMemories.filter(entry=>entry.theme===seasonId&&entry.year===new Date().getFullYear()).length+' cena(s) vivida(s) nesta edição. Observe um lugar conhecido para descobrir.':'✧ Sem temporada ativa neste momento · as lembranças anteriores continuam guardadas.';
 const neighborhood=document.createElement('small');neighborhood.textContent='🏘️ Cotidiano de Belém: '+everydayMemories.length+'/6 lembranças · '+(everydayMemories.length?everydayMemories.map(entry=>EVERYDAY_STORIES[entry.id].name).join(', '):'conversas e caminhadas no fim da tarde');
 const music=document.createElement('small');music.textContent='🎶 São Pedro · '+(saoPedroTales.some(entry=>entry.id==='contado-bia')?'história compartilhada com Bia':saoPedroTales.length?'relato ouvido de Francisco':'conversa ainda possível na feira');
 const bread=document.createElement('small');bread.textContent='🥖 O cheiro do pão da manhã · '+(breadStories.some(entry=>entry.id==='contado-bia')?'lembrança compartilhada com Bia e concluída':breadStories.length?'história em andamento · '+breadStories.length+'/3 conversas':'ouça Francisco depois de ajudar na feira');
 const mornings=document.createElement('small');mornings.textContent='☀ Bons-dias vividos · '+morningEncounters.length+' conversa(s) de manhã registradas; os moradores seguem seus trajetos habituais.';
 const water=document.createElement('small');water.textContent='💧 Águas contempladas · '+waterMemories.length+'/'+verifiedWater.length+' açude(s) com margens mapeadas; nenhum trajeto sobre a água.';
 const sharedWater=document.createElement('small');sharedWater.textContent='💬 Relatos da paisagem · '+waterTalks.filter(r=>r.step==='shared').length+' morador(es) conheceram sua história; '+waterTalks.filter(r=>r.step==='remembered').length+' lembraram dela dias depois.';
 const walks=document.createElement('small');
 let nextWalk=null;
 for(let day=living.day;day<=living.day+28;day++){
  const candidate=window.RoncadorLivingWorld.smallWalkForDay(day);
  if(candidate&&(day>living.day||living.minute<candidate.start)){nextWalk=candidate;break;}
 }
 const nextWalkHint=nextWalk?' Próxima possibilidade: dia '+nextWalk.day+', '+String(Math.floor(nextWalk.start/60)).padStart(2,'0')+':'+String(nextWalk.start%60).padStart(2,'0')+' — '+nextWalk.title+'. Outros acontecimentos podem alterar a rotina.':' Os encontros seguem o calendário fictício.';
 walks.textContent='🌳 Pequenos Passeios · '+smallWalksSeen.length+' encontro(s) presenciado(s), '+smallWalkReports.length+' novidade(s) contada(s) por moradores.'+nextWalkHint+' Sem tarefas obrigatórias.';
 const camuca=document.createElement('small');camuca.textContent='🌿 Os caminhos do Camucá (preparação, sem acesso à serra) · '+camucaStories.length+'/5 acontecimentos vividos · '+(camucaStories.length?camucaStories.map(r=>CAMUCA_STAGES.includes(r.stage)?r.stage:'').join(' → '):'observe a área verde existente num dia de chuvisco');
 panel.replaceChildren(title,summary,finished,pauses,scenes,neighborhood,music,bread,mornings,water,sharedWater,walks,camuca,season);
 const groups=[
  {id:'damiao',name:'🧺 Francisco',done:storyEndings.some(e=>e.id==='feira-que-volta'),started:marketMorning.claimed||microStories.some(e=>e.id==='damiao'),hint:'Feira, cestos e pequenas gentilezas'},
  {id:'lucia',name:'🌷 Lúcia',done:storyEndings.some(e=>e.id==='jardim-que-fica'),started:luciaGarden.claimed||microStories.some(e=>e.id==='lucia'),hint:'Muda, sementes e lembranças'},
  {id:'bia',name:'✉️ Bia',done:storyEndings.some(e=>e.id==='cartas-que-voltam'),started:biaLetters.claimed||microStories.some(e=>e.id==='bia'),hint:'Cartas, chegadas e caminhos'}
 ];
 for(const group of groups){
  const line=document.createElement('div');line.className='side-journal-entry';
  const copy=document.createElement('div'),name=document.createElement('strong'),hint=document.createElement('small');
  name.textContent=group.name+' · '+(group.done?'lembrança concluída':group.started?'história em andamento':'história ainda possível');
  hint.textContent=group.hint;copy.append(name,hint);
  const person=residentsInStreets().find(p=>p.id===group.id),button=document.createElement('button');button.type='button';
  button.textContent=person?'⌖ Encontrar':'☾ Voltar mais tarde';button.disabled=!active||!person;
  button.onclick=()=>{if(!person)return;$('lifeDialog').close();setRoute(person.x,person.y,27);};
  line.append(copy,button);panel.append(line);
 }
}
function renderSideJournal(){
 const library=window.RoncadorSecondaryNeighbors,grid=$('sideJournalList');grid.replaceChildren();
 $('sideJournalProgress').textContent=sideNeighbors.seen.length+'/3 conhecidos'+(sideNeighbors.seen.length===3?' · álbum ✓':'');
 for(const def of library.RESIDENTS){
  const duty=library.agenda(living,def),found=sideNeighbors.seen.includes(def.id),position=secondaryInStreets().find(p=>p.id===def.id),recollection=affectionSnapshot(def.id);
  const row=document.createElement('div');row.className='side-journal-entry';
  const text=document.createElement('div'),name=document.createElement('strong'),status=document.createElement('small');
  name.textContent=def.icon+' '+def.name+(found?' ♡':'');status.textContent=(duty.present?duty.activity:'descansando · volte de manhã ou à tarde')+(recollection?.remembered?' · lembra '+recollection.short:'');
  text.append(name,status);
  const button=document.createElement('button');button.type='button';button.textContent=duty.present?'⌖ Encontrar':'☾ Descansando';button.disabled=!duty.present||!active;
  button.onclick=()=>{if(!position)return;$('lifeDialog').close();setRoute(position.x,position.y,27);};
  row.append(text,button);grid.append(row);
 }
 renderColorTrail();
 renderRecadoThread();
 renderRuaNovaJournal();
 renderCityReportsJournal();
 renderStoryTracker();
}
function renderSecondaryDialog(def,feedback){
 const duty=window.RoncadorSecondaryNeighbors.agenda(living,def),already=sideNeighbors.lastHelp[def.id]===living.day;
 const scene=window.RoncadorStreetCommunity.current(living);
 const recollection=affectionSnapshot(def.id),greeting=recollection?.remembered||recollection?.close?recollection.line:def.greeting;
 $('secondaryName').textContent=def.name;
 $('secondaryRole').textContent=def.role+' · ficção cozy';
 $('secondaryActivity').textContent='Hoje: '+duty.activity+'.';
 const recadoMemory=window.RoncadorSecondaryNeighbors.recadoLine(sideNeighbors,def.id);
 const fairMemory=window.RoncadorSecondaryNeighbors.fairMemoryLine(sideNeighbors,def.id);
 const zecaRemembers=def.id==='zeca'&&sideNeighbors.connections?.zecaLucia===true&&
  window.RoncadorLuciaGarden.growth(luciaGarden,living.day).stage>=1&&living.day>(sideNeighbors.connections.zecaLuciaDay||0);
 const zecaLine=zecaRemembers?'🌱 '+gardenStageDialogue('zeca',window.RoncadorLuciaGarden.growth(luciaGarden,living.day)):'';
 $('secondaryLine').textContent=feedback||(fairMemory?'♡ '+fairMemory:zecaLine||recadoMemory?' '+zecaLine+(recadoMemory?' ✉️ '+recadoMemory:''):scene?.phase==='visit'&&window.RoncadorStreetCommunity.participant(scene,def.id)?scene.summary+' '+window.RoncadorStreetCommunity.line(living,scene)+(recollection?.remembered?' ♡ '+recollection.line:''):'“'+greeting+'”');
 $('secondaryStatus').textContent=already?'♥ Um gesto compartilhado hoje. Outros momentos chegam com o calendário fictício.':'Escolha uma gentileza para compartilhar uma vez neste dia.';
 const wrap=$('secondaryPortrait');wrap.replaceChildren();
 const portrait=document.createElement('canvas');portrait.width=110;portrait.height=107;portrait.setAttribute('role','img');portrait.setAttribute('aria-label','Ilustração original de '+def.name);
 const c=portrait.getContext('2d');c.fillStyle='#edf0e5';c.fillRect(0,0,110,107);c.save();c.translate(55,82);c.scale(1.7,1.7);drawSecondaryWalker(c,{x:0,y:0,id:def.id,def,walking:false,variant:def.variant},.3);c.restore();wrap.append(portrait);
 const options=$('secondaryChoices');options.replaceChildren();
 for(const choice of window.RoncadorSecondaryNeighbors.availableOptions(def,{marketMorning,biaLetters,luciaGarden,sideNeighbors})){
  const button=document.createElement('button');button.type='button';button.disabled=already;
  // A quiet cue appears only when a contextual story is actually available.
  const special=['banca','janela-bia','paisagem-bia','muda-lucia','amigas'].includes(choice.id);
  button.textContent=(special&&!already?'✦ ':'')+choice.label;
  button.onclick=()=>{
   const position=secondaryInStreets().find(p=>p.id===def.id);
   if(!position||Math.hypot(player.x-position.x,player.y-position.y)>=44){renderSecondaryDialog(def,'Caminhe até '+def.name+' novamente para continuar.');return;}
   const result=window.RoncadorSecondaryNeighbors.interact(sideNeighbors,living,def.id,choice.id,{marketMorning,biaLetters,luciaGarden,sideNeighbors});
   const fairChosen=result.ok&&def.id==='cica'&&choice.id==='banca'&&marketMorning.claimed&&
    window.RoncadorSecondaryNeighbors.rememberFairChoice(sideNeighbors,'fita',living.day);
   renderSecondaryDialog(def,result.ok?result.reply:result.reason);
   if(result.ok){
    note(590,0,.12);note(740,.09,.14);save();
    if(fairChosen)notify('🎀 A fita de Ciça ficou guardada na história da feira.');
    else if(result.threadAdvanced)notify(result.threadComplete?'✉️ O recado voltou para Téo! Uma nova lembrança está no álbum.':'✉️ Um recado avançou: '+window.RoncadorSecondaryNeighbors.recadoStage(sideNeighbors)+'/3.');
    else if(result.first&&['rosa','zeca','mila'].includes(def.id)){
     const count=colorTrailProgress(sideNeighbors);
     notify(count===3?'🎨 O Caderno das três cores está completo! Uma lembrança entrou no álbum.':'✿ Caderno das três cores: '+count+'/3 encontros guardados.');
    }else if(result.unlocked&&result.first)notify('♡ Três novos vizinhos conhecidos! Uma lembrança apareceu no álbum.');
   }
  };options.append(button);
 }
}
function talkSecondary(id){
 if(!active||anyDialog())return;
 const person=secondaryInStreets().find(p=>p.id===id);
 if(!person||Math.hypot(player.x-person.x,player.y-person.y)>=44){notify('Chegue mais perto para ouvir essa história.');return;}
 selectedSecondaryId=id;
 const tradition=hearFriendshipTradition(id);
 const ending=rememberStoryEnding(id);
 renderSecondaryDialog(person.def,[tradition?'♡ '+tradition:'',ending?'✿ '+ending:''].filter(Boolean).join(' ')||undefined);
 showDialog('secondaryDialog');
}
function renderLife(){
 if(!loaded)return;
 const world=window.RoncadorLivingWorld;
 $('lifeDialogClock').textContent=world.label(living);
 const nearbyStory=window.RoncadorStreetEncounters.current(living);
 $('lifeEvent').textContent=nearbyStory?nearbyStory.summary+' (cena ficcional)':'✿ '+world.event(living);
 const nextVisit=window.RoncadorStreetEncounters.next(living),watch=nearbyStory||nextVisit;
 $('encounterWatchTitle').textContent=watch?watch.icon+' '+watch.title:'♡ Vizinhos pelas ruas';
 $('encounterWatchInfo').textContent=nearbyStory?nearbyStory.summary:'Os vizinhos têm encontros pequenos e espontâneos, mesmo quando você está passeando por outro lugar.';
 const atMarket=nearMarket(105);
 $('encounterVisit').textContent=nearbyStory?.phase==='visit'&&!atMarket?'⌖ Ir até os amigos conversando ↗':nearbyStory?.phase==='visit'?'◷ Avançar para o próximo encontro ↗':'◷ Esperar e acompanhar o próximo encontro ↗';
 $('encounterVisit').disabled=!active||!watch;
 const community=window.RoncadorStreetCommunity,scene=community.current(living),upcomingScene=community.next(living),view=scene||upcomingScene;
 $('communityWatchTitle').textContent=view?view.icon+' '+view.title:'♡ Encontros de vizinhos';
 $('communityWatchInfo').textContent=scene?scene.summary+' '+(scene.phase==='visit'?community.line(living,scene):'Uma visita está se formando nas ruas.'):'Próxima cena: '+window.RoncadorLivingWorld.DAYS[view.weekday]+', '+String(Math.floor(view.start/60)).padStart(2,'0')+':'+String(view.start%60).padStart(2,'0')+' · horário do jogo.';
 $('communityWatchProgress').textContent=communitySeen.length+'/3 presenciados'+(communitySeen.length>=3?' · álbum ✓':'');
 $('communityWatchAction').textContent=scene?.phase==='visit'?'⌖ Caminhar até a conversa ↗':scene?.phase==='approach'?'◷ Acompanhar a chegada ↗':'◷ Ver o próximo encontro ↗';
 $('communityWatchAction').disabled=!active||!view;
 renderMomentsUI();
 const progress=window.RoncadorNeighborhoodQuest.progress(living),neighborComplete=progress===3;
 $('neighborProgress').textContent=neighborComplete?'Lembrança desbloqueada ✓':progress+' de 3 amizades';
 $('neighborBar').style.width=progress/3*100+'%';
 $('careProgress').textContent=world.careProgress(living)+'/3 gentilezas';
 $('neighborRoute').textContent=neighborComplete?'♡ Ver a lembrança no álbum ↗':window.RoncadorNeighborhoodQuest.next(living)?'⌖ Encontrar o próximo vizinho ↗':'☾ Já conversamos hoje · volte amanhã';
 $('neighborRoute').disabled=!active;
 const grid=$('residentGrid');grid.replaceChildren();
 for(const [index,def] of world.RESIDENTS.entries()){
  const agenda=world.agenda(living,def.id),person=living.people[def.id];
  const place=data.landmarks.find(l=>l.id===agenda.hub);
  const streetPerson=residentsInStreets().find(p=>p.id===def.id);
  const near=streetPerson&&Math.hypot(player.x-streetPerson.x,player.y-streetPerson.y)<43;
  const card=document.createElement('article');card.className='resident-card';
  const badge=drawResidentPortrait(def,index);
  const text=document.createElement('div');text.className='resident-copy';
  const name=document.createElement('strong');name.textContent=def.name;
  const role=document.createElement('small');role.textContent=def.role+' · ♥ '+person.bond+'/4';
  const activity=document.createElement('span');activity.textContent='✿ '+agenda.activity;
  const mood=document.createElement('small');mood.textContent=world.mood(living,def.id)+' · gosta de '+def.likes;
  const recollection=affectionSnapshot(def.id);
  const memory=document.createElement('small');memory.className='resident-remembrance';memory.textContent=recollection?.short?'♡ Lembra '+recollection.short:'✿ '+(living.people[def.id].bond>0?'A amizade está crescendo':'Uma história ainda por descobrir');
  const needs=document.createElement('small');needs.className='resident-needs';needs.textContent='Fome '+Math.round(person.hunger)+' · Cansaço '+Math.round(person.fatigue)+' · Companhia '+Math.round(person.company);
  const button=document.createElement('button');button.type='button';button.className='resident-action';
  button.disabled=!active||!agenda.present||!place;
  button.textContent=!active?'Comece a expedição':!agenda.present?'Em outra atividade':near?'💬 '+def.topic:'⌖ Encontrar pelo mapa';
  button.onclick=()=>{
   if(near){careResidentId=def.id;meetResident(def.id);renderLife();}
   else if(streetPerson){$('lifeDialog').close();setRoute(streetPerson.x,streetPerson.y);}
  };
  text.append(name,role,activity,mood,memory,needs);card.append(badge,text,button);grid.append(card);
 }
 renderSideJournal();
 const memories=$('lifeMemories');memories.replaceChildren();
 if(!living.notes.length){memories.textContent='O diário ainda espera sua primeira conversa.';}
 else for(const note of living.notes.slice(0,5)){const p=document.createElement('p');p.textContent='Dia '+note.day+' · '+note.text;memories.append(p);}
 renderCareChoices();
 $('lifeRest').disabled=!active;
}
function showLife(){if(!loaded)return;$('sidebar').classList.remove('open');syncRoute();renderLife();showDialog('lifeDialog');lastJournalDay=living.day;save();}
function visitStreetEncounter(){
 if(!active)return;
 const stories=window.RoncadorStreetEncounters,current=stories.current(living),next=stories.next(living);
 let advance=0;
 if(current?.phase==='approach')advance=current.start+current.approach-living.minute;
 else if(!current||current.phase==='return'||current.phase==='visit'&&nearMarket(105))advance=(next?.wait||0)+(next?.approach||0);
 if(advance>0)window.RoncadorLivingWorld.advance(living,advance);
 $('lifeDialog').close();
 const agora=stories.current(living),market=data.landmarks.find(p=>p.id==='mercado');
 if(market)setRoute(...market.p);
 notify((agora?.title||'Encontro')+' · A rota passa pelas ruas existentes. Observe os amigos se cumprimentando!');
 updateUI();save();
}
function visitCommunityEncounter(){
 if(!active)return;
 const api=window.RoncadorStreetCommunity,scene=api.current(living),next=api.next(living);
 let advance=0;
 if(scene?.phase==='approach')advance=scene.start+scene.approach+1-living.minute;
 else if(!scene||scene.phase==='return')advance=(next?.wait||0)+(next?.approach||0)+1;
 if(advance>0)window.RoncadorLivingWorld.advance(living,advance);
 const now=api.current(living)||scene,hub=data.landmarks.find(p=>p.id===now?.to);
 $('lifeDialog').close();
 if(hub)setRoute(...hub.p);
 notify((now?.title||'Encontro')+' · Chegue perto dos personagens para guardar a lembrança.');
 updateUI();save();
}
function visitNextNeighbor(){
 if(window.RoncadorNeighborhoodQuest.unlocked(living)){$('lifeDialog').close();renderAlbum();showDialog('albumDialog');return;}
 const residents=residentsInStreets(),id=window.RoncadorNeighborhoodQuest.next(living,residents),person=residents.find(p=>p.id===id);
 if(!id){$('lifeConversation').textContent='Você já conversou com todos os vizinhos disponíveis hoje. Descanse e volte no dia seguinte para fortalecer as amizades.';return;}
 if(!person){$('lifeConversation').textContent='Este vizinho está cuidando de outros assuntos agora. Descanse até um novo dia para reencontrá-lo pelas ruas.';return;}
 $('lifeDialog').close();
 if(Math.hypot(player.x-person.x,player.y-person.y)<43)talkResident(id);
 else{setRoute(person.x,person.y);notify('Encontre '+person.def.name+' pelo caminho e aperte E quando chegar perto.');}
}
function showGeologicalAtlas(){if(!loaded)return;
 $('geologyCount').textContent=geologyPoints.length+' pontos georreferenciados atribuídos a Belém/PB pelo SGB.';
 $('geologyToggle').setAttribute('aria-pressed',String(showGeology));
 $('geologyToggle').textContent=showGeology?'◆ Ocultar pontos no mapa':'◇ Mostrar pontos no mapa';
 const list=$('geologyList');list.replaceChildren();
 for(const p of geologyPoints){const item=document.createElement('li');item.className='geology-item';const name=document.createElement('strong');name.textContent=p.site||'Local sem topônimo';const small=document.createElement('small');small.textContent=`SGB ${p.id} · ${p.type} · ${p.rock} · ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`;item.append(name,small);list.append(item);}
 showDialog('geologyDialog');
}

function syncContactsUI(){
 if(!loaded||!$('contactsSidebarCount'))return;
 const api=window.RoncadorBelemContacts;
 const done=api.completedCount(belemContacts),hearts=api.totalHearts(belemContacts);
 $('contactsSidebarCount').textContent=done+'/6 encontros';
 $('contactsHeartsBadge').textContent=hearts+' ♥';
 const nextDef=api.CONTACTS.find(c=>!belemContacts.items[c.id]?.metOnLocation);
 $('contactsSidebarHint').textContent=nextDef?'Próximo encontro sugerido: '+nextDef.name+' ('+nextDef.street+').':'Todos os 6 encontros afetivos de Belém foram vividos e guardados no álbum! ♥';
}
function renderContactsDialog(){
 if(!loaded)return;
 const api=window.RoncadorBelemContacts,list=$('contactsList');
 list.replaceChildren();
 const done=api.completedCount(belemContacts),hearts=api.totalHearts(belemContacts);
 $('contactsSummaryProgress').textContent=done+'/6 encontros realizados nas ruas';
 $('contactsSummaryHearts').textContent=hearts+'/18 ♥ de amizade & contato';
 for(const def of api.CONTACTS){
  const entry=belemContacts.items[def.id],place=data.landmarks.find(l=>l.id===def.hub);
  const dist=place?.p?Math.round(Math.hypot(player.x-place.p[0],player.y-place.p[1])):999;
  const inReach=active&&place?.p&&dist<=55;
  const card=document.createElement('article');
  card.className='contact-item'+(entry.metOnLocation?' met':'');
  const head=document.createElement('div');head.className='contact-head';
  const titleWrap=document.createElement('div');titleWrap.className='contact-title';
  const avatar=document.createElement('div');avatar.className='contact-avatar';avatar.textContent=def.icon;
  const info=document.createElement('div');
  const strong=document.createElement('strong');strong.textContent=def.name;
  const groupSmall=document.createElement('small');groupSmall.style.display='block';groupSmall.textContent=def.group;
  const streetSpan=document.createElement('span');streetSpan.className='contact-street';streetSpan.textContent='📍 '+def.street+(place?.p?' · a '+dist+' m':'');
  info.append(strong,groupSmall,streetSpan);
  titleWrap.append(avatar,info);
  const heartPill=document.createElement('span');heartPill.className='contact-hearts';
  heartPill.textContent='♥ '.repeat(entry.hearts)+'♡ '.repeat(3-entry.hearts);
  head.append(titleWrap,heartPill);

  const status=document.createElement('div');status.className='contact-status';
  status.textContent='🟢 '+def.status;

  const logBox=document.createElement('div');logBox.className='contact-log';
  if(!entry.log.length){
   const emptyP=document.createElement('p');emptyP.textContent='Nenhuma mensagem enviada ainda. Mande um oi para combinar o encontro!';
   logBox.append(emptyP);
  }else{
   for(const item of entry.log){
    const p=document.createElement('p');
    const b=document.createElement('strong');b.textContent=item.who+': ';
    p.append(b,document.createTextNode(item.text));
    logBox.append(p);
   }
  }

  const actions=document.createElement('div');actions.className='contact-actions';
  const sordaBtn=document.createElement('button');sordaBtn.type='button';
  const bread=window.RoncadorKawaiiMoto.nextBakeryGood(kawaiiState);
  sordaBtn.textContent=kawaiiState.sordas>0?bread.icon+' Presentear '+bread.name+' ('+kawaiiState.sordas+' na cesta)':'🥖 Cestinha vazia (reponha pães no ateliê)';
  sordaBtn.disabled=kawaiiState.sordas<=0;
  sordaBtn.onclick=()=>{
   if(kawaiiState.sordas<=0)return;
   kawaiiState.sordas--;kawaiiState.sordasGifted++;
   entry.hearts=Math.min(3,entry.hearts+1);
   const reply='(o˘◡˘o) 💖 Hummm, '+bread.name+' da Padaria da Tia! Obrigado pelo carinho!';
   entry.log.push({who:'Você '+bread.icon,text:'Trouxe '+bread.name+' da Padaria da Tia para compartilhar!'});
   entry.log.push({who:def.name,text:reply});
   entry.log=entry.log.slice(-6);
   spawnEmojiBurst(player.x,player.y-12,['🍪','💖','✨','🌸'],6);
   note(587,0,.11);note(784,.10,.14);note(1046,.22,.18);
   save();syncKawaiiUI();syncContactsUI();renderContactsDialog();
   notify(bread.icon+' Você presenteou '+def.name+' com '+bread.name+' da Padaria da Tia! +1 ♥');
  };
  actions.append(sordaBtn);
    def.messages.forEach((msg,idx)=>{
   const msgBtn=document.createElement('button');msgBtn.type='button';
   msgBtn.textContent='💬 “'+msg.send.slice(0,30)+(msg.send.length>30?'…':'')+'”';
   msgBtn.onclick=()=>{
    const res=api.sendMessage(belemContacts,def.id,idx);
    if(res){note(659,0,.12);note(784,.1,.15);save();syncContactsUI();renderContactsDialog();notify('📱 Mensagem recebida de '+def.name+'! ♥');}
   };
   actions.append(msgBtn);
  });

  if(place?.p){
   const routeBtn=document.createElement('button');routeBtn.type='button';
   routeBtn.textContent=inReach?'📍 Você já está neste local!':'⌖ Marcar rota até '+def.street.split(',')[0];
   routeBtn.disabled=!active||inReach;
   routeBtn.onclick=()=>{
    $('contactsDialog').close();
    setRoute(place.p[0],place.p[1],28);
    notify('⌖ Seguindo pelas ruas de Belém até '+def.name+'!');
   };
   actions.append(routeBtn);

   const hangoutBtn=document.createElement('button');hangoutBtn.type='button';hangoutBtn.className='hangout-btn';
   hangoutBtn.disabled=!inReach;
   hangoutBtn.textContent=entry.metOnLocation?(inReach?'♥ Repetir encontro: '+def.hangoutAction:'✓ Encontro vivido (aproxime-se para repetir)'):(inReach?def.hangoutAction:'🔒 Chegue a 55m para: '+def.hangoutAction);
   hangoutBtn.onclick=()=>{
    const res=api.completeHangout(belemContacts,def.id);
    if(res){
     for(let i=0;i<18;i++){const a=i*Math.PI/9;particles.push({x:player.x,y:player.y-14,vx:Math.cos(a)*17,vy:Math.sin(a)*17-10,life:1.6,r:1.7,color:i%2?'#f3c978':'#e2876f'});}
     note(587,0,.14);note(740,.13,.16);note(880,.27,.22);
     if(place.id&&CULTURE[place.id]&&!cultureNotes[place.id]){cultureNotes[place.id]=CULTURE[place.id].choices[0]||'Encontro especial';chapterUI();}
     save();syncContactsUI();renderContactsDialog();
     notify('♥ '+def.hangoutTitle+' concluído! Memória guardada no Álbum.');
    }
   };
   actions.append(hangoutBtn);
  }
  card.append(head,status,logBox,actions);
  list.append(card);
 }
}

function syncKawaiiUI(){
 if(!loaded||!$('toggleMotoBtn'))return;
 const riding=!!kawaiiState.riding;
 const skin=window.RoncadorKawaiiMoto.currentSkin(kawaiiState);
 const acc=window.RoncadorKawaiiMoto.currentAccessory(kawaiiState);
 $('toggleMotoBtn').classList.toggle('active-moto',riding);
 $('motoBtnLabel').textContent=riding?'Pilotando · '+skin.name.split(' ')[1]:'Motinha Kawaii';
 $('sordaHudCount').textContent=kawaiiState.sordas+' pão'+(kawaiiState.sordas===1?'':'es');
 const stars=collected.size*10+window.RoncadorBelemContacts.totalHearts(belemContacts)*5+kawaiiState.sordasGifted*5+kawaiiState.ferrisRides*10;
 if($('kawaiiStatsBadge'))$('kawaiiStatsBadge').textContent='★ '+stars+' pts · '+acc.icon;
}
function toggleMoto(){
 if(!loaded)return;
 if(!active)start();
 worldPause=null;
 kawaiiState.riding=!kawaiiState.riding;
 const skin=window.RoncadorKawaiiMoto.currentSkin(kawaiiState);
 if(kawaiiState.riding){
  note(392,0,.08);note(523,.08,.10);note(659,.17,.16);
  spawnEmojiBurst(player.x,player.y-10,['🛵',...skin.trail],7);
  notify('🛵 ✨ (o˘◡˘o) Motinha Kawaii ('+skin.name+') ativada! Use G para buzinar Bi-Bi!');
 }else{
  note(523,0,.09);note(392,.09,.12);
  spawnEmojiBurst(player.x,player.y-10,['👟','✨','🌿'],4);
  notify('👟 Você desceu da Motinha Kawaii para caminhar pela calçada.');
 }
 syncKawaiiUI();save();
}
function renderKawaiiStyleDialog(){
 if(!loaded)return;
 const api=window.RoncadorKawaiiMoto;
 const skinGrid=$('motoSkinGrid');skinGrid.replaceChildren();
 for(const sk of api.MOTO_SKINS){
  const b=document.createElement('button');b.type='button';b.className='kawaii-choice-btn';
  b.setAttribute('aria-pressed',String(kawaiiState.skin===sk.id));
  b.textContent=sk.name;
  b.onclick=()=>{
   kawaiiState.skin=sk.id;kawaiiState.riding=true;
   spawnEmojiBurst(player.x,player.y-12,sk.trail,6);
   note(659,0,.12);note(880,.1,.15);
   syncKawaiiUI();renderKawaiiStyleDialog();save();
  };
  skinGrid.append(b);
 }
 const accGrid=$('accessoryGrid');accGrid.replaceChildren();
 for(const ac of api.ACCESSORIES){
  const b=document.createElement('button');b.type='button';b.className='kawaii-choice-btn';
  b.setAttribute('aria-pressed',String(kawaiiState.accessory===ac.id));
  b.textContent=ac.name;
  b.onclick=()=>{
   kawaiiState.accessory=ac.id;
   spawnEmojiBurst(player.x,player.y-14,[ac.icon,'✨','💖'],5);
   note(740,0,.12);
   syncKawaiiUI();renderKawaiiStyleDialog();save();
  };
  accGrid.append(b);
 }
 $('sordaDialogStatus').textContent='🥖 Padaria da Tia · '+kawaiiState.sordas+' pães e doces na cestinha · '+kawaiiState.sordasGifted+' presente(s) entregue(s) · '+kawaiiState.ferrisRides+' passeio(s) na Roda-Gigante do Parque São Luís.';
 syncKawaiiUI();
}
function showKawaiiStyle(){
 if(!loaded)return;
 $('sidebar').classList.remove('open');syncRoute();
 renderKawaiiStyleDialog();
 showDialog('kawaiiStyleDialog');
}
function showContacts(){
 if(!loaded)return;
 $('sidebar').classList.remove('open');syncRoute();
 renderContactsDialog();
 showDialog('contactsDialog');
}
function showRealCity(){if(!loaded)return;const n=data.streetNameCount||new Set(roads.map(r=>r.tags.name).filter(Boolean)).size;$('realCityStats').textContent=`${roads.length} trechos de vias · ${n} nomes de ruas · ${data.points.length} pontos nomeados dentro do limite municipal IBGE. Comece pelo centro e amplie o mapa para explorar os povoados.`;
 const road=nearestRoad(player.x,player.y);$('realCityCurrent').textContent=(road.s?.road.tags.name||'Caminho sem nome mapeado')+' · posição aproximada do personagem';const links=locationLinks([player.x,player.y]);$('currentMaps').href=links.maps;$('currentStreetView').href=links.streetView;
 const container=$('realCityPlaces');container.replaceChildren();const places=data.points.filter(p=>Math.hypot(p.p[0],p.p[1])<2500).sort((a,b)=>Math.hypot(...a.p)-Math.hypot(...b.p));for(const place of places){const card=document.createElement('article');card.className='real-city-place';const name=document.createElement('strong');name.textContent=place.tags.name;const desc=document.createElement('small');desc.textContent='Ponto do OpenStreetMap · sem fachada nem contorno cadastrado';const anchor=document.createElement('a');anchor.textContent='Consultar no mapa ↗';anchor.href=locationLinks(place.p).maps;anchor.target='_blank';anchor.rel='noopener noreferrer';card.append(name,desc,anchor);const landmark=data.landmarks.find(l=>l.name===place.tags.name);if(landmark){const visit=document.createElement('button');visit.type='button';visit.className='culture-visit';visit.textContent='✿ Abrir cena cultural';visit.onclick=()=>openCultureFromGuide(landmark.id);card.append(visit);}container.append(card);}const plaza=document.createElement('button');plaza.type='button';plaza.className='culture-visit';plaza.textContent='♧ Ver a Praça 6 de Setembro (sem localização confirmada)';plaza.onclick=()=>openCultureFromGuide('praca_6_setembro');container.append(plaza);showDialog('realCityDialog');}
function showCentralBlocks(){
 if(!loaded)return;
 const gallery=$('blockCards');gallery.replaceChildren();
 // The atelier uses original Canvas studies, never historical photographs.
 for(const block of centralBlocks){
  const card=document.createElement('article');card.className='central-block-card';
  const art=document.createElement('div');art.className='central-block-art '+block.id;
  const symbol=document.createElement('span');symbol.textContent='▥ ✿ ▣';art.append(symbol);
  const copy=document.createElement('div');copy.className='central-block-copy';
  const heading=document.createElement('h3');heading.textContent=block.title;
  const details=document.createElement('p');details.textContent=block.detail;
  const count=document.createElement('small');count.textContent=block.count+' casas decorativas refinadas · '+block.reliability;
  copy.append(heading,details,count);
  const miniature=document.createElement('canvas');miniature.width=186;miniature.height=90;
  miniature.className='facade-study-preview';miniature.setAttribute('role','img');
  miniature.setAttribute('aria-label','Amostra artística de três fachadas fictícias dos '+block.title);
  window.RoncadorFacadeStudio.drawPreview(miniature,block.id,lightPhase);
  const miniatureCaption=document.createElement('small');miniatureCaption.className='facade-preview-caption';
  miniatureCaption.textContent='✎ Casario V2.25 · beirais, platibandas, vitrines e detalhes de esquina';
  copy.append(miniature,miniatureCaption);

  const route=document.createElement('button');route.type='button';route.textContent='⌖ Caminhar até este trecho ↗';route.disabled=!active||!block.at;
  route.onclick=()=>{$('blockDialog').close();setRoute(block.at[0],block.at[1]);notify('A rota segue as ruas do OSM; as casas ilustrativas não têm endereço cadastrado.');};
  const nearBlock=block.at&&Math.hypot(player.x-block.at[0],player.y-block.at[1])<=95;
  const sketch=document.createElement('button');sketch.className='facade-sketch-action';sketch.type='button';
  const known=facadeSketches.includes(block.id);
  sketch.disabled=!active||!block.at||!nearBlock||known;
  sketch.textContent=known?'✓ Detalhe guardado no caderno':nearBlock?'✎ Desenhar uma lembrança deste trecho':'✎ Aproxime-se para desenhar';
  sketch.onclick=()=>{
   const inReach=active&&block.at&&Math.hypot(player.x-block.at[0],player.y-block.at[1])<=95;
   const result=window.RoncadorFacadeStudio.recordSketch(facadeSketches,block.id,inReach);
   if(!result.recorded)return;
   sketch.disabled=true;sketch.textContent='✓ Detalhe guardado no caderno';
   $('blockSketchStatus').textContent=facadeSketches.length+'/3 detalhes registrados'+(facadeSketches.length===3?' · cartão no álbum ✓':'');
   note(587,0,.13);note(784,.11,.17);save();
   notify(result.unlocked?'✿ Três quadras registradas! O cartão entrou no álbum.':'✎ Detalhe de '+block.title+' guardado · '+facadeSketches.length+'/3');
  };
  card.append(art,copy,route,sketch);gallery.append(card);
 }
 $('blockFacadesToggle').setAttribute('aria-pressed',String(detailedFacades));
 $('blockFacadesToggle').textContent=detailedFacades?'▦ Ocultar acabamentos nas casas ilustrativas':'▦ Mostrar acabamentos nas casas ilustrativas';
 $('blockCount').textContent=centralBlocks.reduce((sum,b)=>sum+b.count,0)+' casas ilustrativas em três áreas de estudo';
 $('blockSketchStatus').textContent=facadeSketches.length+'/3 detalhes registrados'+(facadeSketches.length===3?' · cartão no álbum ✓':'');
 $('roadEvidence').textContent=roadDetails?`OSM: ${roadDetails.totalRoads} trechos viários, ${roadDetails.knownSurface} com piso descrito (${roadDetails.surfaceCounts.asphalt} asfalto, ${roadDetails.surfaceCounts.paved} pavimentados, ${roadDetails.surfaceCounts.unpaved} sem pavimentação, ${roadDetails.surfaceCounts.paving_stones+roadDetails.surfaceCounts.sett} em pedra) e ${roadDetails.junctions.length} entroncamentos. Elevação: ${terrainLayer?`${terrainLayer.values.length} amostras SRTM (terreno de ${terrainLayer.min} a ${terrainLayer.max} m), grade 140 m, curvas estimadas de 10 em 10 m`:'indisponível'}. O modelo não comprova o declive de uma rua curta ou calçada. Nenhuma medição direta de ladeira consta nos trechos OSM.`:'Aguardando análise das ruas.';
 $('terrainToggle').setAttribute('aria-pressed',String(showTerrain));
 $('terrainToggle').textContent=showTerrain?'⛰ Ocultar curvas do terreno':'⛰ Mostrar curvas do terreno';
 showDialog('blockDialog');
}
function start(){if(!loaded)return;active=true;$('welcome').hidden=true;canvas.focus({preventScroll:true});last=performance.now();updateUI();notify(saved?'Bem-vindo de volta a Belém! Seu diário e suas amizades foram preservados.':'A aventura começa no centro de Belém! Encontre Lia para fazer uma nova amizade.');}
function reset(){if(!loaded)return;smallWalksSeen=[];smallWalkReports=[];for(const d of document.querySelectorAll('dialog[open]'))d.close();collected.clear();target=0;elapsed=0;waypoint=null;friendship=0;chapter=0;observations.clear();photos={};cultureNotes={};gardenStep=0;gardenHarvests=0;fairQuest=window.RoncadorCozyQuests.fresh();marketMorning=window.RoncadorMarketMorning.fresh();marketFruitSlots=Array(6).fill(null);marketWitnessed=false;marketReaction=null;marketScene?.close();luciaGarden=window.RoncadorLuciaGarden.fresh();biaLetters=window.RoncadorBiaLetters.fresh();sideNeighbors=window.RoncadorSecondaryNeighbors.fresh();ruaNovaPaths=[];ruaNovaShared=false;ruaNovaDays={};cityKnowledge={};cityLinks=[];cityConsequences=[];cityReports=[];weeklyVisitsSeen=[];friendshipTraditions=[];storyEndings=[];microStories=[];lastJournalDay=1;worldMoments=[];streetVignettes=[];everydayMemories=[];saoPedroTales=[];breadStories=[];morningEncounters=[];waterMemories=[];waterTalks=[];seasonalMemories=[];camucaStories=[];worldPause=null;belemContacts=window.RoncadorBelemContacts.fresh();facadeSketches=[];communitySeen=[];marketDay=false;living=window.RoncadorLivingWorld.fresh();showWildlife=true;festivalCelebrated=false;lightPhase='manha';skyMode='sol';rainCare=0;showGroundedFlora=true;momentsSeen=[];syncLightButton();syncSkyButton();player.x=data.start[0];player.y=data.start[1];camera.x=player.x;camera.y=player.y;particles=[];active=true;$('welcome').hidden=true;saved=null;renderMissions();updateUI();save();canvas.focus({preventScroll:true});notify('Um novo começo! Lia e os caminhos estão esperando por você.');}
function anyDialog(){return !!document.querySelector('dialog[open]')||$('sidebar').classList.contains('open');}
function showDialog(id){keys.clear();touches.clear();$(id).showModal();if(id==='mapDialog')requestAnimationFrame(drawBig);updateUI();}
function move(dt,time){
 const dialog=anyDialog();
 if(active&&!dialog&&!document.hidden){
  elapsed+=dt;
  window.RoncadorLivingWorld.advance(living,dt*2.5);
  const watering=window.RoncadorAtmosphere.waterGarden(gardenStep,dt*2.5,skyMode,rainCare);
  rainCare=watering.accrued;
  if(watering.watered){gardenStep=3;notify('☂ O chuvisco cuidou da rega. Seu canteiro está pronto para colher!');note(659,0,.14);save();}
  let dx=0,dy=0;
  for(const key of keys){
   if(key==='w'||key==='arrowup')dy--;
   if(key==='s'||key==='arrowdown')dy++;
   if(key==='a'||key==='arrowleft')dx--;
   if(key==='d'||key==='arrowright')dx++;
  }
  for(const direction of touches.values()){
   if(direction==='up')dy--;
   if(direction==='down')dy++;
   if(direction==='left')dx--;
   if(direction==='right')dx++;
  }
  if(worldPause){
   if(dx||dy){worldPause=null;waypoint=null;}
   else{
    worldPause.age+=dt;
    if(worldPause.comment&&!worldPause.commentShown&&worldPause.age>=1.35){
     notify('♡ '+worldPause.comment);worldPause.commentShown=true;
    }
    if(worldPause.age>=(skyMode==='chuvisco'?2.8:4.3))worldPause=null;
   }
  }
  if(dx||dy){waypoint=null;}
  else if(waypoint&&!worldPause){
   if(waypoint.stopRadius&&Math.hypot(waypoint.x-player.x,waypoint.y-player.y)<waypoint.stopRadius)waypoint=null;
   while(waypoint&&waypoint.index<waypoint.points.length){
    const p=waypoint.points[waypoint.index],d=Math.hypot(p.x-player.x,p.y-player.y);
    if(d>3){dx=(p.x-player.x)/d;dy=(p.y-player.y)/d;break;}
    waypoint.index++;
   }
   if(waypoint&&waypoint.index>=waypoint.points.length)waypoint=null;
  }
  const length=Math.hypot(dx,dy);
  player.moving=length>0;
  if(length){
   const road=nearestRoad(player.x,player.y);
   const speed=kawaiiState?.riding?(keys.has('shift')?210:155):(keys.has('shift')?105:67);
   const factor=waypoint||road.d<12?1:.78;
   const vx=dx/length*speed*factor*dt,vy=dy/length*speed*factor*dt;
   const nx=Math.max(data.bounds[0],Math.min(data.bounds[2],player.x+vx));
   const ny=Math.max(data.bounds[1],Math.min(data.bounds[3],player.y+vy));
   const onMappedRoute=!!waypoint;
   const fromRoadDistance=road.d;
   const xBlocked=blockedByHouse(nx,player.y);
   if(mayAdvanceOnMappedRoute(xBlocked,onMappedRoute,fromRoadDistance,xBlocked?nearestRoad(nx,player.y).d:0))player.x=nx;
   const yBlocked=blockedByHouse(player.x,ny);
   if(mayAdvanceOnMappedRoute(yBlocked,onMappedRoute,fromRoadDistance,yBlocked?nearestRoad(player.x,ny).d:0))player.y=ny;
   if(dx)player.dir=dx>0?1:-1;
   step+=dt;
   if(step>(kawaiiState?.riding?.16:.34)){
    step=0;
    const surf=road.s?.road?.tags?.surface||'paved';
    if(kawaiiState?.riding){
     const skin=window.RoncadorKawaiiMoto.currentSkin(kawaiiState);
     spawnEmojiBurst(player.x-player.dir*9,player.y+2,skin.trail,1);
     if(sound)note(surf==='asphalt'?135:115+(Math.floor(time*10)%3)*12,0,.04);
    }else if(sound&&keys.has('shift')){
     note(surf==='asphalt'?110:88+hash(Math.floor(time*3))*22,0,.03);
    }
   }
  }
 }else player.moving=false;
 const lerp=reduce?1:1-Math.exp(-7*dt);
 camera.x+=(player.x-camera.x)*lerp;camera.y+=(player.y-camera.y)*lerp;
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=10*dt;}
 particles=particles.filter(p=>p.life>0);
 for(const ep of emojiParticles){ep.life-=dt;ep.x+=ep.vx*dt+Math.sin(time*5+ep.size)*4*dt;ep.y+=ep.vy*dt;ep.vy-=6*dt;}
 emojiParticles=emojiParticles.filter(ep=>ep.life>0);
 uiClock+=dt;saveClock+=dt;
 if(uiClock>.15){updateUI();uiClock=0;}
 if(saveClock>3){save();saveClock=0;}
}
function frame(t){const dt=last?Math.min((t-last)/1000,.045):.016;last=t;if(loaded){move(dt,t/1000);render(t/1000);}requestAnimationFrame(frame);}
function clickWorld(e){
 if(!active||anyDialog())return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left-w/2)/zoom+camera.x,y=(e.clientY-r.top-h/2)/zoom+camera.y;
 if(Math.hypot(x-player.x,y-(player.y-12))<18){
  spawnEmojiBurst(player.x,player.y-16,['💖','✨','🌸','(o˘◡˘o)','⭐'],6);
  note(784,0,.1);note(988,.09,.14);
  notify('✨ (o˘◡˘o) ✨ Prontinho para explorar Belém! Aperte X para a Motinha Kawaii ou G para buzinar!');
  return;
 }
 const boltAt=boltCityPoint();
 if(boltAt&&Math.hypot(x-boltAt.x,y-boltAt.y)<20){
  spawnEmojiBurst(boltAt.x,boltAt.y-10,['🐕','🐾','💖','✨','🦴'],6);
  note(659,0,.09);note(880,.09,.13);
  notify(boltRestingByGreen(boltAt)?'🐕 🌿 Bolt descansou um instante perto das plantas e recebeu seu carinho!':'🐕 💕 Bolt abanou o rabo todo feliz com seu carinho!');
  return;
 }
 if(Math.hypot(x-guide.x,y-guide.y)<22&&Math.hypot(player.x-guide.x,player.y-guide.y)<32){talkGuide();return;}
 // Make the complete illustrated figure tappable, not just the feet anchor.
 const crowd=residentsInStreets().concat(secondaryInStreets()).filter(p=>Math.abs(x-p.x)<19&&y>=p.y-52&&y<=p.y+14);
 crowd.sort((a,b)=>Math.hypot(x-a.x,y-(a.y-21))-Math.hypot(x-b.x,y-(b.y-21)));
 if(crowd.length){
  const person=crowd[0];
  if(Math.hypot(player.x-person.x,player.y-person.y)<44){if(person.secondary)talkSecondary(person.id);else talkResident(person.id);}
  else setRoute(person.x,person.y,26);
  return;
 }
 // Fictional passers can answer a friendly tap; no mission or save change.
 const visitor=ambientHitTargets.filter(p=>Math.abs(x-p.x)<17&&y>=p.y-40&&y<=p.y+12)
  .sort((a,b)=>Math.hypot(x-a.x,y-(a.y-18))-Math.hypot(x-b.x,y-(b.y-18)))[0];
 if(visitor){
  if(Math.hypot(player.x-visitor.x,player.y-visitor.y)<54){
   window.RoncadorCrowdFlow.greet(visitor.id,elapsed);
   spawnEmojiBurst(visitor.x,visitor.y-18,['🌷','💛','✨'],4);
   note(659,0,.10);
   notify(window.RoncadorCrowdFlow.say(visitor,living)||'Oi, vizinhança! ♡');
  }else setRoute(visitor.x,visitor.y,26);
  return;
 }
 if(near>=0&&Math.hypot(x-missions[near].p[0],y-missions[near].p[1])<28){collect();return;}
 if(marketStallVisible()&&marketMorning.talked&&window.RoncadorFairStreets.hit(marketStall,x,y)){
  if(marketActivityAllowed())showMarketWork();else visitMarketStall();return;
 }
 if(showGeology&&geologyPoints.some(p=>Math.hypot(x-p.p[0],y-p.p[1])<9)){showGeologicalAtlas();return;}
 const scene=showScenery?scenicScenes.find(s=>window.RoncadorScenicPlacement.contains(window.RoncadorScenicPlacement.bounds(s,3),x,y)):null;
 if(scene){const place=culturePlace(scene.id);if(scene.id==='pedra_cordeiro')showCulture(scene.id);else if(place?.p){if(cultureWithinReach(place))showCulture(scene.id);else setRoute(...place.p);}else showCulture(scene.id);return;}
 const landmark=data.landmarks.find(l=>Math.hypot(x-l.p[0],y-l.p[1])<10);
 if(landmark){if(cultureWithinReach(landmark))showCulture(landmark.id);else setRoute(...landmark.p);return;}
 // Mapped points remain walkable destinations without opening a real-world guide.
 setRoute(x,y);canvas.focus({preventScroll:true});
}
$('start').onclick=start;$('interact').onclick=interactAction;$('observe').onclick=observe;$('realCity').onclick=showRealCity;$('natureAtlas').onclick=showNature;$('centralBlocks').onclick=showCentralBlocks;
$('blockFacadesToggle').onclick=()=>{detailedFacades=!detailedFacades;$('blockFacadesToggle').setAttribute('aria-pressed',String(detailedFacades));$('blockFacadesToggle').textContent=detailedFacades?'▦ Ocultar acabamentos nas casas ilustrativas':'▦ Mostrar acabamentos nas casas ilustrativas';save();};
$('natureAction').onclick=()=>{if(gardenStep===3){gardenStep=0;rainCare=0;gardenHarvests++;living.notes.unshift({day:living.day,text:'Você concluiu uma colheita no canteiro imaginário.'});living.notes=living.notes.slice(0,12);recordFairQuest('colheita');notify('🌾 Uma colheita guardada! A terra já pode receber novo plantio.');}else{gardenStep++;rainCare=0;}showNature();save();note(587,0,.15);};
$('wildlifeToggle').onclick=()=>{showWildlife=!showWildlife;showNature();save();};
$('groundedFloraToggle').onclick=()=>{showGroundedFlora=!showGroundedFlora;showNature();save();};
$('cultureRoute').onclick=()=>{const place=culturePlace(cultureActiveId);if(place?.p&&cultureActiveId!=='pedra_cordeiro'){$('cultureDialog').close();setRoute(...place.p);}};$('openAlbum').onclick=()=>{$('sidebar').classList.remove('open');syncRoute();renderAlbum();showDialog('albumDialog');};$('help').onclick=()=>showDialog('helpDialog');$('mapButton').onclick=()=>showDialog('mapDialog');$('restart').onclick=()=>showDialog('resetDialog');$('confirmReset').onclick=reset;$('playAgain').onclick=reset;$('keepExploring').onclick=()=>{$('winDialog').close();updateUI();canvas.focus({preventScroll:true});};
$('goHomeVaranda').onclick=()=>{
 const home=data?{p:data.start}:null;
 if(!home)return;
 if(!active)start();
 player.x=home.p[0];player.y=home.p[1];camera.x=player.x;camera.y=player.y;waypoint=null;
 updateUI();save();note(587,0,.12);note(784,.12,.18);
 notify('🏠 Você está na ponto inicial fictício!');
};
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h'&&!e.repeat&&!anyDialog()&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();$('goHomeVaranda').click();}});
$('toggleMotoBtn').onclick=toggleMoto;
$('honkMotoBtn').onclick=()=>{if(!active)start();playMotoHonk();notify('📣 Bi-Bi! ✨ (o˘◡˘o) Os vizinhos de Belém acenaram pra sua motinha!');};
$('sordaHudBtn').onclick=showKawaiiStyle;
$('openKawaiiBtn').onclick=showKawaiiStyle;
$('time17Btn').onclick=()=>{
 if(!active)start();
 living.minute=17*60;lightPhase='tarde';syncLightButton();updateUI();save();
 spawnEmojiBurst(player.x,player.y-12,['☕','🪑','☼','✨'],5);
 notify('🕔 17h00 em Belém! As cadeiras já estão nas calçadas da Rua Clóvis Bezerra.');
};
$('time19Btn').onclick=()=>{
 if(!active)start();
 living.minute=19*60;lightPhase='anoitecer';syncLightButton();updateUI();save();
 spawnEmojiBurst(player.x,player.y-12,['☾','🎤','✨','🎶'],5);
 notify('🕖 19h00 em Belém! Luzes acesas no Bar da Prosa, Ginásio O Xaviezão e Praça 6 de Setembro!');
};
$('refillSordaBtn').onclick=()=>{
 kawaiiState.sordas=Math.min(99,kawaiiState.sordas+3);
 spawnEmojiBurst(player.x,player.y-12,['🍪','✨','💖'],5);
 note(659,0,.11);note(880,.11,.15);
 renderKawaiiStyleDialog();save();
 notify('🥖 +3 pães e doces da Padaria da Tia guardados na cestinha da motinha!');
};
$('goParqueSaoLuisBtn').onclick=()=>{
 const p=data?.landmarks?.find(l=>l.id==='parque_sao_luis');
 if(!p)return;
 $('kawaiiStyleDialog').close();
 if(!active)start();
 if(setRoute(p.p[0],p.p[1]))notify('🎡 Caminho até a região do Parque São Luís marcado nas vias existentes. O parque é uma memória local, não uma atração confirmada como aberta.');
};
$('goPedraCordeiroBtn').onclick=()=>{
 $('kawaiiStyleDialog').close();
 if(!active)start();
 notify('⛰ Pedra do Cordeiro localizada no mapa. A trilha até o mirante ainda não está mapeada; nenhum atalho foi criado.');
};
window.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||anyDialog()||e.repeat)return;
 const k=e.key.toLowerCase();
 if(k==='x'){e.preventDefault();toggleMoto();}
 else if(k==='g'){e.preventDefault();playMotoHonk();notify('📣 Bi-Bi! ✨ (o˘◡˘o) Buzina Kawaii!');}
});
$('openContacts').onclick=showContacts;
$('openContactsSidebar').onclick=showContacts;
$('downloadHtmlLink').onclick=e=>{e.preventDefault();const blob=new Blob([document.documentElement.outerHTML],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Trilhas-do-Roncador-Cozy-V2-27 (1).html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);};
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='c'&&!e.repeat&&!anyDialog()&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();showContacts();}});
$('openLife').onclick=showLife;
$('encounterVisit').onclick=visitStreetEncounter;
$('communityWatchAction').onclick=visitCommunityEncounter;
$('momentAction').onclick=exploreMoment;
$('momentOpen').onclick=()=>{$('lifeDialog').close();exploreMoment();};
$('momentWait').onclick=skipMomentPeriod;
$('momentCollect').onclick=collectMoment;
$('neighborRoute').onclick=visitNextNeighbor;
$('skyMood').onclick=()=>{skyMode=window.RoncadorAtmosphere.next(skyMode);syncSkyButton();save();notify('☁ Céu do jogo: '+window.RoncadorAtmosphere.LABELS[skyMode]+'. Não é uma previsão do tempo de Belém.');};
$('fairQuestAction').onclick=fairQuestNext;
$('fairDayNote').onclick=()=>{if(marketMorning.claimed){$('sidebar').classList.remove('open');syncRoute();renderAlbum();showDialog('albumDialog');}else focusMarketChapter();};
$('marketChapterAction').onclick=marketChapterAction;
$('marketReturnStreet').onclick=visitMarketStall;

$('marketFinish').onclick=claimMarketMorning;
$('luciaChapterAction').onclick=luciaChapterAction;
document.querySelectorAll('[data-lucia-work]').forEach(button=>button.onclick=()=>{
 if(!active||!marketMorning.claimed||!luciaAvailable()||!nearChurch(100)||!window.RoncadorLuciaGarden.doWork(luciaGarden,button.dataset.luciaWork))return;
 const task=window.RoncadorLuciaGarden.TASKS.find(t=>t.id===button.dataset.luciaWork);
 renderLuciaGarden(task.story);renderLuciaChapter();save();note(554+luciaGarden.work.length*82,0,.15);
});
document.querySelectorAll('[data-lucia-memory]').forEach(button=>button.onclick=()=>{
 if(!active||!nearChurch(100)||!window.RoncadorLuciaGarden.chooseMemory(luciaGarden,button.dataset.luciaMemory))return;
 const memory=window.RoncadorLuciaGarden.MEMORIES.find(m=>m.id===luciaGarden.memory);
 renderLuciaGarden('Lúcia sorri: “'+memory.title+'... A gente pode guardar essa lembrança na terra e no coração.”');
 renderLuciaChapter();save();note(740,0,.15);
});
$('luciaGardenFinish').onclick=claimLuciaGarden;
$('biaChapterAction').onclick=biaChapterAction;
$('biaNotebookOpen').onclick=()=>{
 if(!active||!luciaGarden.claimed||!biaAvailable()||!nearBus(110)||!window.RoncadorBiaLetters.openNotebook(biaLetters))return;
 renderBiaLetter('Bia abre seu caderno. Uma folha em branco espera pelas palavras que vocês vão escolher.');renderBiaChapter();save();note(610,0,.14);
};
document.querySelectorAll('[data-bia-theme]').forEach(button=>button.onclick=()=>{
 if(!active||!biaAvailable()||!nearBus(110)||!window.RoncadorBiaLetters.chooseTheme(biaLetters,button.dataset.biaTheme))return;
 const theme=window.RoncadorBiaLetters.THEMES.find(t=>t.id===biaLetters.theme);
 renderBiaLetter('Bia lê baixinho: “'+theme.reply+'” Agora você pode selar a mensagem.');renderBiaChapter();save();note(710,0,.14);
});
$('biaLetterSeal').onclick=()=>{
 if(!active||!biaAvailable()||!nearBus(110)||!window.RoncadorBiaLetters.seal(biaLetters))return;
 renderBiaLetter('Um selo com coração fecha o envelope. Bia segura a carta pronta, com carinho.');renderBiaChapter();save();note(810,0,.15);
};
$('biaLetterFinish').onclick=claimBiaLetter;
$('streetPulse').onclick=showLife;
$('geologyAtlas').onclick=showGeologicalAtlas;
$('geologyToggle').onclick=()=>{showGeology=!showGeology;$('geologyToggle').setAttribute('aria-pressed',String(showGeology));$('geologyToggle').textContent=showGeology?'◆ Ocultar pontos no mapa':'◇ Mostrar pontos no mapa';save();drawBig();};
$('terrainToggle').onclick=()=>{showTerrain=!showTerrain;$('terrainToggle').setAttribute('aria-pressed',String(showTerrain));$('terrainToggle').textContent=showTerrain?'⛰ Ocultar curvas do terreno':'⛰ Mostrar curvas do terreno';save();drawBig();};
$('lifeRest').onclick=()=>{if(!active)return;window.RoncadorLivingWorld.tomorrow(living);$('lifeConversation').textContent='Um novo dia começou. As rotinas e o humor dos moradores mudaram.';renderLife();lifeSummary();save();note(784,0,.17);};
$('openFestival').onclick=()=>{$('sidebar').classList.remove('open');syncRoute();showFestival();};
$('festivalAction').onclick=celebrateFestival;
$('festivalRoute').onclick=festivalNextStep;
$('lightButton').onclick=()=>{const phases=['manha','tarde','anoitecer'];lightPhase=phases[(phases.indexOf(lightPhase)+1)%phases.length];syncLightButton();save();};
$('marketAtmosphere').onclick=()=>{if(isMarketMorning())return;marketDay=!marketDay;syncMarketToggle();syncFairUI();window.RoncadorLandmarks.drawPostcard($('cultureArtwork'),'market',fairAtmosphere());save();};
$('sceneryToggle').onclick=()=>{showScenery=!showScenery;syncSceneryToggle();syncFairUI();save();};
$('zoomIn').onclick=()=>{zoom=Math.min(3.5,zoom*1.2);drawMini();};$('zoomOut').onclick=()=>{zoom=Math.max(.65,zoom/1.2);drawMini();};$('recenter').onclick=()=>{camera.x=player.x;camera.y=player.y;zoom=matchMedia('(max-width:800px)').matches?1.85:2.3;};$('sound').onclick=()=>{sound=!sound;$('sound').classList.toggle('sound-on',sound);$('sound').setAttribute('aria-label',sound?'Desativar sons':'Ativar sons');$('sound').title=sound?'Desativar sons':'Ativar sons';if(sound){note(523,0,.15);note(784,.12,.2);}};
$('mobileRoute').onclick=()=>{$('sidebar').classList.add('open');syncRoute();keys.clear();$('closeRoute').focus();};$('closeRoute').onclick=()=>{$('sidebar').classList.remove('open');syncRoute();$('mobileRoute').focus();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{$(b.dataset.close).close();updateUI();});document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('close',()=>{keys.clear();updateUI();});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
$('fullMap').onclick=()=>{fullMap=!fullMap;drawBig();};big.addEventListener('click',e=>{if(!mapTransform||!active)return;const r=big.getBoundingClientRect();const x=Math.max(data.bounds[0],Math.min(data.bounds[2],(e.clientX-r.left-mapTransform.ox)/mapTransform.s)),y=Math.max(data.bounds[1],Math.min(data.bounds[3],(e.clientY-r.top-mapTransform.oy)/mapTransform.s));$('mapDialog').close();setRoute(x,y);});
canvas.addEventListener('pointerdown',e=>{dragStart={x:e.clientX,y:e.clientY};});canvas.addEventListener('pointerup',e=>{if(dragStart&&Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)<8)clickWorld(e);dragStart=null;});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(3.5,zoom*Math.exp(-e.deltaY*.001)));},{passive:false});
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='v'&&!e.repeat&&!anyDialog()&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();showNature();}});
for(const b of document.querySelectorAll('[data-move]')){b.addEventListener('pointerdown',e=>{e.preventDefault();if(!active)return;b.setPointerCapture(e.pointerId);touches.set(e.pointerId,b.dataset.move);waypoint=null;});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>touches.delete(e.pointerId));}
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(k==='escape'&&$('sidebar').classList.contains('open')){$('sidebar').classList.remove('open');syncRoute();return;}if(anyDialog())return;if(k==='enter'&&!active){start();e.preventDefault();return;}if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift'].includes(k)){keys.add(k);e.preventDefault();}if(e.repeat)return;if(k==='e'||k===' '){e.preventDefault();interactAction();}if(k==='f'){e.preventDefault();observe();}if(k==='m'){e.preventDefault();showDialog('mapDialog');}if(k==='r'){camera.x=player.x;camera.y=player.y;}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();touches.clear();save();});document.addEventListener('visibilitychange',()=>{keys.clear();touches.clear();last=0;if(document.hidden)save();});window.addEventListener('pagehide',save);new ResizeObserver(resize).observe(canvas);window.addEventListener('resize',()=>{if($('mapDialog').open)drawBig();});
const embeddedMap=$('embedded-map-data');
const mapPromise=Promise.resolve().then(()=>JSON.parse(embeddedMap.textContent));
const embeddedGeology=$('embedded-geology-data');
const geologyPromise=Promise.resolve().then(()=>embeddedGeology?JSON.parse(embeddedGeology.textContent):{points:[]}).catch(()=>({points:[]}));
const embeddedTerrain=$('embedded-terrain-data');
const terrainPromise=Promise.resolve().then(()=>embeddedTerrain?JSON.parse(embeddedTerrain.textContent):null).catch(()=>null);
Promise.all([mapPromise,geologyPromise,terrainPromise]).then(([map,geology,terrain])=>{data=map;applyUserPublicPlaceCorrections();terrainData=terrain;geologyPoints=Array.isArray(geology.points)?geology.points:[];preprocess();loaded=true;$('loading').hidden=true;resize();updateUI();requestAnimationFrame(frame);}).catch(err=>{console.error(err);document.querySelector('.game').classList.add('error');$('loading').replaceChildren();let text=document.createElement('p');text.textContent='Não foi possível abrir o mapa. Recarregue a página para tentar novamente.';let b=document.createElement('button');b.textContent='Tentar novamente';b.className='primary';b.onclick=()=>location.reload();$('loading').append(text,b);});
// Small read-only inspection surface for diagnostics; does not mutate game state.
Object.defineProperty(window,'expeditionState',{get:()=>({loaded,active,spontaneousGreeting:streetGreetings?.snapshot(),collected:[...collected],target,elapsed,position:{x:player.x,y:player.y},missionCount:missions.length,roadCount:roads.length,streetNameCount:data?.streetNameCount,pointCount:data?.points?.length,landmarkCount:data?.landmarks?.length,showScenery,scenicScenes:scenicScenes.map(s=>({id:s.id,at:[...s.at],scale:s.scale,positionStatus:s.positionStatus})),marketDay,marketAtmosphere:fairAtmosphere(),marketStreetStalls:fairStalls.length,marketWitnessed,marketStall:marketStall?{p:[...marketStall.p],visible:marketStallVisible()}:null,marketFruitSlots:[...marketFruitSlots],marketMorning:{...marketMorning,work:[...marketMorning.work]},marketNext:window.RoncadorMarketMorning.next(marketMorning),luciaGarden:{...luciaGarden,work:[...luciaGarden.work]},luciaNext:window.RoncadorLuciaGarden.next(luciaGarden),mapSource:data?.source,near,zoom,friendship,chapter,observations:[...observations],photoCount:Object.keys(photos).length,festivalCelebrated,festivalPrepared:Object.values(festivalChecklist()).filter(Boolean).length,lightPhase,skyMode,rainCare,showWildlife,wildlifeCount:wildlife.length,showGroundedFlora,greenPolygons:floraLayer.greenPolygons,floralDecorations:floraLayer.points.length,momentsSeen:[...momentsSeen],dailyMoment:window.RoncadorDailyMoments.current(living)?.id||null,centralBlocks:centralBlocks.map(b=>({id:b.id,count:b.count,at:b.at})),detailedFacades,careProgress:window.RoncadorLivingWorld.careProgress(living),gardenHarvests,gardenStep,neighborProgress:window.RoncadorNeighborhoodQuest.progress(living),lifeDay:living.day,lifeMinute:living.minute,residentBonds:Object.fromEntries(Object.entries(living.people).map(([id,p])=>[id,p.bond])),streetResidents:residentsInStreets().map(p=>({id:p.id,x:p.x,y:p.y,meeting:p.meeting})),geologyCount:geologyPoints.length,showGeology,routeRemaining:waypoint?waypoint.points.length-waypoint.index:0,guide:{...guide}})});
})();

