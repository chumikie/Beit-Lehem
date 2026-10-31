/* V2.22: offline NASA SRTM terrain sampled for an explicitly bounded grid.
   Only macro terrain contours; never claim sidewalk grade or street-level steps. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorTerrainRelief=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 function prepare(map,terrain){
  if(!map?.projection||!terrain?.grid||!Array.isArray(terrain.values))return null;
  const g=terrain.grid,n=g.width*g.height;
  if(!Number.isInteger(g.width)||!Number.isInteger(g.height)||g.width<2||g.height<2||g.width>100||g.height>100||!Number.isFinite(g.x0)||!Number.isFinite(g.y0)||!Number.isFinite(g.step)||g.step<20||terrain.values.length!==n||terrain.values.some(v=>!Number.isFinite(v)))return null;
  for(const key of ['originLat','originLon','metersPerDegreeLon','metersPerDegreeLat'])if(Math.abs(map.projection[key]-terrain.projection?.[key])>.000001)return null;
  const values=terrain.values,min=Math.min(...values),max=Math.max(...values),contours=[];
  const height=(col,row)=>values[row*g.width+col];
  const sample=(x,y)=>{
   const col=(x-g.x0)/g.step,row=(y-g.y0)/g.step;
   if(col<0||row<0||col>g.width-1||row>g.height-1)return null;
   const i=Math.min(g.width-2,Math.floor(col)),j=Math.min(g.height-2,Math.floor(row));
   const tx=col-i,ty=row-j;
   return (1-ty)*((1-tx)*height(i,j)+tx*height(i+1,j))+ty*((1-tx)*height(i,j+1)+tx*height(i+1,j+1));
  };
  const crossing=(a,b,level)=>{
   if((a.h<level)===(b.h<level)||a.h===b.h)return null;
   const t=(level-a.h)/(b.h-a.h);
   return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
  };
  // Triangulation keeps the contours tied to measured samples rather than
  // adding smoothed pseudo-peaks in unknown places.
  for(let row=0;row<g.height-1;row++)for(let col=0;col<g.width-1;col++){
   const x=g.x0+col*g.step,y=g.y0+row*g.step;
   const a={x,y,h:height(col,row)},b={x:x+g.step,y,h:height(col+1,row)},
    c={x:x+g.step,y:y+g.step,h:height(col+1,row+1)},d={x,y:y+g.step,h:height(col,row+1)};
   for(let level=Math.ceil(Math.min(a.h,b.h,c.h,d.h)/10)*10;level<=Math.max(a.h,b.h,c.h,d.h);level+=10){
    for(const tri of [[a,b,c],[a,c,d]]){
     const pts=[[tri[0],tri[1]],[tri[1],tri[2]],[tri[2],tri[0]]].map(edge=>crossing(...edge,level)).filter(Boolean);
     if(pts.length===2)contours.push({level,from:pts[0],to:pts[1]});
    }
   }
  }
  return{grid:g,values,min,max,sample,contours,source:terrain.source};
 }
 function draw(c,layer,view,zoom=1.85){
  if(!layer||zoom<1.2)return;
  const g=layer.grid,cross=(x,y)=>x>=view.left-g.step&&x<=view.right+g.step&&y>=view.top-g.step&&y<=view.bottom+g.step;
  c.save();
  // Gentle highlights complement the existing sage ground without changing
  // the road network or creating a false 3-D street surface.
  for(let row=0;row<g.height;row+=2)for(let col=0;col<g.width;col+=2){
   const x=g.x0+col*g.step,y=g.y0+row*g.step;
   if(!cross(x,y))continue;
   const z=layer.values[row*g.width+col],high=(z-layer.min)/Math.max(1,layer.max-layer.min);
   if(high>.52){const gradient=c.createRadialGradient(x,y,10,x,y,g.step*1.8);gradient.addColorStop(0,`rgba(193,157,107,${(.07+high*.07).toFixed(3)})`);gradient.addColorStop(1,'rgba(193,157,107,0)');c.fillStyle=gradient;c.fillRect(x-g.step*1.8,y-g.step*1.8,g.step*3.6,g.step*3.6);}
  }
  c.lineCap='round';c.strokeStyle='#6480647c';c.lineWidth=1.05;
  c.beginPath();for(const seg of layer.contours){if(!cross(seg.from.x,seg.from.y)&&!cross(seg.to.x,seg.to.y))continue;c.moveTo(seg.from.x,seg.from.y);c.lineTo(seg.to.x,seg.to.y);}c.stroke();
  if(zoom>1.6){
   // Sparse contour elevation numbers, not the elevation of individual roads.
   c.textAlign='center';c.textBaseline='middle';c.font='6px system-ui';
   let printed=0;for(let i=0;i<layer.contours.length&&printed<5;i+=19){const seg=layer.contours[i];const x=(seg.from.x+seg.to.x)/2,y=(seg.from.y+seg.to.y)/2;if(!cross(x,y))continue;c.fillStyle='#f1e9d1ca';c.fillRect(x-8,y-3,16,6);c.fillStyle='#71896a';c.fillText(`${seg.level}m`,x,y);printed++;}
  }
  c.restore();
 }
 return{prepare,draw};
});
