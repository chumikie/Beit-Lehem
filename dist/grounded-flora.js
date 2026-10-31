/* V2.12 — decorative foliage constrained to verified OSM green polygons.
 * Points are illustration samples, NOT mapped trees or species observations.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 root.RoncadorGroundedFlora=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const greenKind=tags=>tags?.leisure==='nature_reserve'?'reserve':tags?.leisure==='park'?'park':
  ['grass','meadow','forest'].includes(tags?.landuse)?'green':tags?.leisure==='garden'?'park':null;
 const hash=(x,y)=>{let n=Math.imul((x|0)^0x9e3779b9,0x85ebca6b)^Math.imul((y|0)^0x7f4a7c15,0xc2b2ae35);n^=n>>>16;return(n>>>0)/4294967295;};
 function inside(x,y,ring){let result=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;
 }return result;}
 function distanceToRoad(x,y,road){let closest=Infinity;for(let i=1;i<road.p.length;i++){
  const a=road.p[i-1],b=road.p[i],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy;
  if(len2<.01)continue;const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/len2));
  closest=Math.min(closest,Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t));
 }return closest;}
 function sample(data,houses=[],scenes=[]){
  const result=[];let greenPolygons=0;
  for(let i=0;i<data.areas.length;i++){
   const area=data.areas[i],kind=greenKind(area.tags),ring=area.p?.[0];if(!kind||!ring||ring.length<3)continue;
   greenPolygons++;
   const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);
   const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),width=maxX-minX,height=maxY-minY;
   if(width<9||height<9)continue;
   const areaEstimate=width*height,target=kind==='reserve'?Math.min(75,Math.max(12,Math.floor(areaEstimate/19000))):
    kind==='park'?Math.min(24,Math.max(3,Math.floor(areaEstimate/220))):Math.min(14,Math.max(2,Math.floor(areaEstimate/180)));
   const nearbyRoads=data.roads.filter(r=>r.p.some((p,j)=>j&&Math.min(p[0],r.p[j-1][0])<maxX+19&&Math.max(p[0],r.p[j-1][0])>minX-19&&Math.min(p[1],r.p[j-1][1])<maxY+19&&Math.max(p[1],r.p[j-1][1])>minY-19));
   const nearbyHomes=houses.filter(h=>h.x>minX-20&&h.x<maxX+20&&h.y>minY-20&&h.y<maxY+20);
   let placed=0;
   for(let attempt=0;attempt<target*75&&placed<target;attempt++){
    const x=minX+hash(i*911+attempt*43,13)*width,y=minY+hash(i*659+attempt*31,29)*height;
    if(!inside(x,y,ring))continue;
    if(nearbyRoads.some(road=>distanceToRoad(x,y,road)<(kind==='reserve'?13:7.5)))continue;
    if(nearbyHomes.some(h=>Math.hypot(x-h.x,y-h.y)<(kind==='reserve'?17:12)))continue;
    if(data.points?.some(p=>Math.hypot(x-p.p[0],y-p.p[1])<24)||data.landmarks?.some(p=>Math.hypot(x-p.p[0],y-p.p[1])<31))continue;
    if(scenes.some(s=>Math.abs(x-s.at[0])<60&&Math.abs(y-s.at[1])<66))continue;
    if(result.some(p=>p.area===i&&Math.hypot(x-p.x,y-p.y)<(kind==='reserve'?26:9)))continue;
    const roll=hash(i*67,attempt*17);
    result.push({x,y,area:i,kind:kind==='reserve'?(roll<.65?'canopy':'underbrush'):kind==='park'?(roll<.45?'shade':roll<.8?'flowerbed':'underbrush'):(roll<.65?'meadow':'flowerbed'),seed:Math.floor(roll*9999),origin:'osm-green-polygon'});
    placed++;
   }
  }
  return{greenPolygons,points:result};
 }
 return{greenKind,inside,sample};
});
