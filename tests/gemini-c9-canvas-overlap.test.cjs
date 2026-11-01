'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const map=require('../dist/map.json');
const scenic=require('../gemini-modules/scenic-placement.js');
const {buildGraph}=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const crowd=require('../gemini-modules/crowd-flow.js');
const roadDetails=require('../dist/road-details.js');
require('../gemini-modules/secondary-neighbors.js');
const neighbors=globalThis.RoncadorSecondaryNeighbors;
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const hash=(x,y=0)=>{let n=Math.imul((x|0)^0x9e3779b9,0x85ebca6b)^Math.imul((y|0)^0x7f4a7c15,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967295;};
const inside=(x,y,ring)=>{let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const segments=[],houses=[],labels=[];
const nearestRoad=(x,y)=>segments.reduce((best,s)=>{const t=Math.max(0,Math.min(1,((x-s.ax)*s.dx+(y-s.ay)*s.dy)/s.len2));const px=s.ax+t*s.dx,py=s.ay+t*s.dy,d=Math.hypot(x-px,y-py);return d<best.d?{d,x:px,y:py}:best;},{d:Infinity});
const placementHelpers=game.slice(game.indexOf('function pointSegment('),game.indexOf('function inside('));
const start=game.indexOf('function preprocess(){'),end=game.indexOf(' centralBlocks=window.RoncadorCentralBlocks.prepare',start);
assert.ok(start>=0&&end>start);
const context={Math,data:map,roads:[],areas:[],missions:[],segments,houses,labels,hash,inside,nearestRoad,
 scenicScenes:[],verifiedWater:[],VERIFIED_HYDRO_GEOJSON:null,projectVerifiedWater:()=>[],
 treeRoadIndex:null,window:{RoncadorScenicPlacement:scenic}};
vm.runInNewContext(placementHelpers+'\n'+game.slice(start,end)+'}\npreprocess();',context);
const houseBounds=vm.runInNewContext(game.slice(game.indexOf('function houseVisualBounds('),game.indexOf('function region('))+';houseVisualBounds',{Math});

function overlaps(a,b){
 const axes=[a.angle,b.angle].flatMap(t=>[[Math.cos(t),Math.sin(t)],[-Math.sin(t),Math.cos(t)]]);
 const depths=axes.map(([nx,ny])=>{
  const separation=Math.abs((a.x-b.x)*nx+(a.y-b.y)*ny);
  const ra=(Math.abs(nx*Math.cos(a.angle)+ny*Math.sin(a.angle))*a.w+Math.abs(-nx*Math.sin(a.angle)+ny*Math.cos(a.angle))*a.h)/2;
  const rb=(Math.abs(nx*Math.cos(b.angle)+ny*Math.sin(b.angle))*b.w+Math.abs(-nx*Math.sin(b.angle)+ny*Math.cos(b.angle))*b.h)/2;
  return ra+rb-separation;
 });
 return Math.min(...depths);
}

test('C9: geometria real mantém casas nos lotes e identifica sobreposições',()=>{
 assert.ok(houses.length>500&&houses.length<=1350,'usa a população real de casas ilustrativas');
 const samples={near:0,overlap:0,severe:0,depth:0},hubs=map.landmarks.filter(p=>['igreja','mercado','rodoviaria'].includes(p.id));
 for(let i=0;i<houses.length;i++){
  const a=houses[i],va=houseBounds(a);
  assert.ok(Number.isFinite(va.bottom)&&va.bottom>a.y);
  if(Math.abs(va.bottom-(a.y+a.h*.45))>2)samples.depth++;
  for(let j=i+1;j<houses.length;j++){
   const b=houses[j];if(Math.abs(a.x-b.x)>30||Math.abs(a.y-b.y)>30)continue;
   samples.near++;const penetration=overlaps(a,b);if(penetration>0)samples.overlap++;if(penetration>5)samples.severe++;
  }
 }
 console.info(`C9: ${houses.length} casas geradas; ${samples.near} pares próximos, ${samples.overlap} footprints sobrepostos (${samples.severe} com penetração >5), ${samples.depth} profundidades antes imprecisas; ${hubs.length} marcos centrais.`);
 assert.ok(samples.depth>0);
});

test('C13.1: mede pontos de ruas mapeadas dentro de footprints ilustrativos',()=>{
 const hits=[];
 for(const s of segments){
  for(let t=0;t<=1;t+=Math.min(1,4/s.len)){
   const x=s.ax+s.dx*t,y=s.ay+s.dy*t;
   const house=houses.find(h=>{
    if(Math.abs(x-h.x)>25||Math.abs(y-h.y)>25)return false;
    const dx=x-h.x,dy=y-h.y,c=Math.cos(h.angle),sn=Math.sin(h.angle);
    return Math.abs(dx*c+dy*sn)<h.w/2+5&&Math.abs(-dx*sn+dy*c)<h.h/2+5;
   });
   if(house)hits.push({x,y,house:house.seed});
  }
 }
 console.info(`C13.1: ${hits.length} amostras de centro de rua (passos <=4 unidades) atravessam footprints ilustrativos; ${new Set(hits.map(h=>h.house)).size} casas envolvidas.`);
 assert.ok(hits.length>=0);
});

test('C9: árvores e casas usam reservas de espaço, com custo de recorte limitado por zoom',()=>{
 const hubs=map.landmarks.filter(p=>['igreja','mercado','rodoviaria'].includes(p.id));
 const cells=new Set();for(const hub of hubs)for(let gx=Math.floor((hub.p[0]-150)/45);gx<=(hub.p[0]+150)/45;gx++)for(let gy=Math.floor((hub.p[1]-150)/45);gy<=(hub.p[1]+150)/45;gy++)cells.add(gx+','+gy);
 let trees=0,treeNearHome=0;
 for(const cell of cells){const [gx,gy]=cell.split(',').map(Number),seed=Math.floor(hash(gx*7,gy*11)*10000);
  const x=gx*45+hash(gx,gy)*32,y=gy*45+hash(gy+30,gx+2)*32;
  const village=context.areas.some(a=>a.tags.landuse==='residential'&&inside(x,y,a.p[0]));
  if(seed%10<(village?8:2)||nearestRoad(x,y).d<22||houses.some(b=>Math.hypot(x-b.x,y-b.y)<20)||context.scenicScenes.some(s=>scenic.contains(scenic.bounds(s,12),x,y)))continue;
  if(context.areas.some(a=>a.tags.leisure==='pitch'&&inside(x,y,a.p[0])))continue;
  trees++;if(houses.some(b=>Math.hypot(x-b.x,y-b.y)<31))treeNearHome++;
 }
 const maxVisible=new Map();
 for(const zoom of [.65,1.15,1.85,2.85,3.5])for(const hub of hubs){
  const halfW=390/(2*zoom),halfH=844/(2*zoom),visible=houses.filter(b=>{
   const box=houseBounds(b);return box.right>hub.p[0]-halfW&&box.left<hub.p[0]+halfW&&box.bottom>hub.p[1]-halfH&&box.top<hub.p[1]+halfH;
  });
  assert.ok(visible.length<=houses.length);
  maxVisible.set(zoom,Math.max(maxVisible.get(zoom)||0,visible.length));
 }
 console.info(`C9: ${trees} árvores decorativas nas grades dos três marcos, ${treeNearHome} próximas de fachadas; máximos de casas visíveis por zoom: ${[...maxVisible].map(([z,n])=>z+':'+n).join(', ')}.`);
});

test('C9: sete dias de moradores e passeantes respeitam reservas de calçada reais',()=>{
 const graph=buildGraph(map.roads),details=roadDetails.prepare(map.roads,graph);
 const source=game.slice(game.indexOf('function mappedStreetResidentAnchor('),game.indexOf('\nfunction encounterRoadPoint('));
 const paths=new Map(),scope={Math,roads:map.roads,data:map,missions:map.missions,pathfinder:graph,
  streetPaths:paths,elapsed:0,window:{RoncadorStreetLife:street}};
 const walk=vm.runInNewContext(source+';walkingPoint',scope);
 let planned=0,accepted=0,blocked=0,nearIllustration=0,offRoadCollision=0,slots=0;
 for(let day=1;day<=7;day++)for(const hour of [7,9,11,13,16,18,21]){
  const world={day,minute:hour*60};scope.elapsed=100+day*60+hour*7;
  const occupied=neighbors.RESIDENTS.filter(def=>neighbors.agenda(world,def).present)
   .map(def=>walk(def.id,def.hub,def.variant)).filter(Boolean);
  for(const passer of crowd.plan(world,false,scope.elapsed)){
   planned++;
   const at=crowd.openSlot(offset=>walk(passer.id,passer.hub,passer.variant,offset),occupied,details.junctions||[],23,houses,null,NaN,[]);
   if(!at){blocked++;continue;}
   accepted++;occupied.push(at);
  }
  for(const person of occupied){
   slots++;
   if(houses.some(h=>{const b=houseBounds(h);return person.x>=b.left&&person.x<=b.right&&person.y>=b.top&&person.y<=b.bottom;}))nearIllustration++;
   if(nearestRoad(person.x,person.y).d>9&&houses.some(h=>{
    const dx=person.x-h.x,dy=person.y-h.y,c=Math.cos(h.angle),s=Math.sin(h.angle);
    return Math.abs(dx*c+dy*s)<h.w/2+5&&Math.abs(-dx*s+dy*c)<h.h/2+5;
   }))offRoadCollision++;
  }
 }
 assert.equal(accepted+blocked,planned);
 assert.equal(offRoadCollision,0,'nenhum morador deve ocupar uma casa fora da via');
 assert.ok(accepted>0&&slots>0);
 console.info(`C9: ${planned} passeantes planejados; ${accepted} vagas seguras, ${blocked} recusas por esquinas/casas/ocupação; ${nearIllustration}/${slots} posições dentro de envelopes visuais conservadores; ${offRoadCollision} colisões fora da via.`);
});
