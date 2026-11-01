/* V2.21 — pavement and true OSM junctions, without inventing road elevations.
   OSM highway/surface are facts present in map.json; decorative joints are art. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorRoadDetails=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const KNOWN=['asphalt','paved','unpaved','paving_stones','sett'];
 const PALETTE={asphalt:'#f0e7d9',paved:'#f5ead2',unpaved:'#a58863',paving_stones:'#baa388',sett:'#a58c78'};
 function prepare(roads,graph){
  const surfaceCounts=Object.fromEntries(KNOWN.map(k=>[k,0]));const osmSurfaceCounts=Object.fromEntries(KNOWN.map(k=>[k,0]));let inclineCount=0,localSurfaceCount=0;
  const textured=[];
  for(const r of roads){
   const type=KNOWN.includes(r.displayTags?.surface||r.tags?.surface)?(r.displayTags?.surface||r.tags.surface):null;
   if(type){surfaceCounts[type]++;if(KNOWN.includes(r.tags?.surface))osmSurfaceCounts[r.tags.surface]++;if(r.localReference?.fields?.includes('surface'))localSurfaceCount++;textured.push({type,points:r.p,bounds:r.bounds,road:r,source:r.localReference?'referencia_local':'osm'});}
   if(typeof r.tags?.incline==='string'&&r.tags.incline.trim())inclineCount++;
  }
  const junctions=[],taken=[];
  for(const vertex of graph.nodes||[]){
   const direction=new Set(vertex.neighbours.map(n=>{
    const other=graph.nodes[n.id],angle=Math.atan2(other.y-vertex.y,other.x-vertex.x);
    return Math.round((angle+Math.PI)/(Math.PI*2)*32);
   }));
   if(direction.size<3)continue;
   if(taken.some(p=>Math.hypot(vertex.x-p.x,vertex.y-p.y)<13))continue;
   const j={x:vertex.x,y:vertex.y,arms:direction.size};junctions.push(j);taken.push(j);
  }
  return{totalRoads:roads.length,knownSurface:textured.length,surfaceCounts,osmSurfaceCounts,localSurfaceCount,inclineCount,textured,junctions};
 }
 function draw(c,layer,view,zoom=1.85){
  if(!layer||zoom<1.15)return;
  c.save();c.lineCap='round';c.lineJoin='round';
  for(const entry of layer.textured){
   const b=entry.bounds;
   if(b&&(b[2]<view.left||b[0]>view.right||b[3]<view.top||b[1]>view.bottom))continue;
   const r=entry.points;
   if(entry.type==='asphalt'||entry.type==='paved'){
    c.strokeStyle=entry.type==='asphalt'?'#fdf7ed7a':'#eee2c478';c.lineWidth=.72;
    c.beginPath();r.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.setLineDash([4,5.5]);c.stroke();c.setLineDash([]);
    continue;
   }
   for(let i=1;i<r.length;i++){
    const [x1,y1]=r[i-1],[x2,y2]=r[i],dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    if(len<2)continue;
    const nx=-dy/len,ny=dx/len,step=entry.type==='unpaved'?13:5;
    if(Math.max(x1,x2)<view.left-10||Math.min(x1,x2)>view.right+10||Math.max(y1,y2)<view.top-10||Math.min(y1,y2)>view.bottom+10)continue;
    const count=Math.min(140,Math.floor(len/step));
    for(let n=1;n<=count;n++){
     const t=n/(count+1),x=x1+dx*t,y=y1+dy*t;
     if(entry.type==='unpaved'){
      const side=n%2?1:-1;
      c.fillStyle='#b89e76a0';c.beginPath();c.ellipse(x+nx*side*2.2,y+ny*side*2.2,1.9,.65,Math.atan2(dy,dx),0,Math.PI*2);c.fill();
      c.fillStyle='#f5e8bd85';c.beginPath();c.arc(x-nx*side,y-ny*side,.5,0,7);c.fill();
     }else{
      // Stylized stone joints stay *inside* segments explicitly tagged as paving_stones/sett.
      c.strokeStyle=PALETTE[entry.type];c.lineWidth=.75;c.beginPath();c.moveTo(x-nx*3.5,y-ny*3.5);c.lineTo(x+nx*3.5,y+ny*3.5);c.stroke();
      if(n%2===0){c.beginPath();c.moveTo(x-nx*3.5,y-ny*3.5);c.lineTo(x-nx*3.5+dx/len*2,y-ny*3.5+dy/len*2);c.stroke();}
     }
    }
   }
  }
  // Intersections are actual shared OSM vertices; these are soft edge accents,
  // not surveyed pavement, sidewalks or pedestrian-crossing markings.
  for(const j of layer.junctions){
   if(j.arms<4)continue; // quiet three-way turns; highlight only legible larger junctions.
   if(j.x<view.left-10||j.x>view.right+10||j.y<view.top-10||j.y>view.bottom+10)continue;
   c.fillStyle='#fff5d715';c.beginPath();c.ellipse(j.x,j.y,3.4,3.2,0,0,Math.PI*2);c.fill();
   c.strokeStyle='#8d9f813f';c.lineWidth=.6;c.beginPath();c.arc(j.x,j.y,3.3,-.2,1.5);c.stroke();
   if(zoom>2.45){c.fillStyle='#fff8df75';c.beginPath();c.arc(j.x-1.3,j.y-1,.55,0,7);c.fill();}
  }
  c.restore();
 }
 return{KNOWN,prepare,draw};
});
