'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const map=require('../dist/map.json');
const scenic=require('../gemini-modules/scenic-placement.js');
const hash=(x,y=0)=>{let n=Math.imul((x|0)^0x9e3779b9,0x85ebca6b)^Math.imul((y|0)^0x7f4a7c15,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967295;};
const inside=(x,y,ring)=>{let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
const segments=[],houses=[],labels=[];
const nearestRoad=(x,y)=>segments.reduce((best,s)=>{const t=Math.max(0,Math.min(1,((x-s.ax)*s.dx+(y-s.ay)*s.dy)/s.len2));const px=s.ax+t*s.dx,py=s.ay+t*s.dy,d=Math.hypot(x-px,y-py);return d<best.d?{d,x:px,y:py}:best;},{d:Infinity});
const start=source.indexOf('function preprocess(){'),end=source.indexOf(' centralBlocks=window.RoncadorCentralBlocks.prepare',start);
assert.ok(start>=0&&end>start);
vm.runInNewContext(source.slice(start,end)+'}\npreprocess();',{
 Math,data:map,roads:[],areas:[],missions:[],segments,houses,labels,hash,inside,nearestRoad,
 scenicScenes:[],verifiedWater:[],VERIFIED_HYDRO_GEOJSON:null,projectVerifiedWater:()=>[],
 prepareTreeRoadIndex:()=>({}),treeRoadIndex:null,window:{RoncadorScenicPlacement:scenic}
});
const guardCode=source.slice(source.indexOf('function streetLabelBlocked('),source.indexOf('function region(c,detail){'));
const guard=vm.runInNewContext(guardCode+'\nstreetLabelBlocked',{Math});
function formerGuard(l,width,height,visibleHouses,people){
 const cos=Math.abs(Math.cos(l.angle)),sin=Math.abs(Math.sin(l.angle));
 const halfX=(width*cos+height*sin)/2,halfY=(width*sin+height*cos)/2;
 const left=l.x-halfX,right=l.x+halfX,top=l.y-halfY,bottom=l.y+halfY;
 if(visibleHouses.some(b=>left<b.x+b.w/2+1&&right>b.x-b.w/2-1&&top<b.y+b.h*.13+11&&bottom>b.y-b.h*.5-1))return true;
 return people.some(p=>left<p.x+8&&right>p.x-8&&top<p.y+4&&bottom>p.y-20);
}
function coverage(x,y,zoom){
 // Matches the 760px game canvas's approximate world view. Font width is a
 // documented estimate (0.53 em per glyph), not a browser pixel measurement.
 const left=x-380/zoom,right=x+380/zoom,top=y-330/zoom,bottom=y+330/zoom;
 const visibleHouses=houses.filter(b=>b.x>left-30&&b.x<right+30&&b.y>top-30&&b.y<bottom+30);
 const visibleLabels=labels.filter(l=>l.x>=left&&l.x<=right&&l.y>=top&&l.y<=bottom);
 const size=Math.min(13,Math.max(4.2,12/zoom));
 const old=visibleLabels.filter(l=>formerGuard(l,l.name.length*size*.53,size,visibleHouses,[])).length;
 const now=visibleLabels.filter(l=>guard(l,l.name.length*size*.53,size,visibleHouses,[])).length;
 return {total:visibleLabels.length,oldHidden:old,newHidden:now,restored:old-now};
}
test('C11.8: geometria OSM real recupera nomes antes ocultados sem aumentar sobreposições',()=>{
 const locations=[['Vicente Cado',-12,-147,1.25],['Joaquim Rodrigues',-55,-69,1.85],['Matriz',11.5,-105.7,1.25],['Rodoviária',-55.2,584.8,1.85]];
 let recovered=0;
 for(const [name,x,y,zoom] of locations){
  const sample=coverage(x,y,zoom);
  console.info(`C11.8 ${name} zoom ${zoom}: ${sample.total} nomes candidatos, ${sample.oldHidden} omitidos antes, ${sample.newHidden} agora, ${sample.restored} recuperados (largura tipográfica estimada).`);
  assert.ok(sample.newHidden<=sample.oldHidden,name);
  assert.ok(sample.total>0,name);
  recovered+=sample.restored;
 }
 assert.ok(recovered>0,'a geometria orientada deve recuperar nomes na cidade real');
});
test('C11.8: retângulos girados evitam casas e personagens mesmo em diagonais',()=>{
 const label={x:0,y:0,angle:Math.PI/4},house={x:0,y:0,w:18,h:14};
 assert.equal(guard(label,90,8,[house],[]),true);
 assert.equal(guard(label,90,8,[],[{x:0,y:0}]),true);
 assert.equal(guard(label,90,8,[{...house,x:200}], [{x:200,y:200}]),false);
});
