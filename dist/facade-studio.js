/* Belém Viva V2.19 — hand-crafted-looking, deterministic facade microdetails.
 * Artistic interpretation only: building footprints and individual colors are
 * not surveyed. The input road geometry, house positions and scale are intact.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RoncadorFacadeStudio=api;
})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const ARCHETYPES=Object.freeze({
  matriz:['arcos','vasos','molduras','portao','portas'],
  feira:['toldo','portas','armazem','portao','molduras'],
  joao:['molduras','vasos','portas','portao','arcos'],
  clovis:['portao','vasos','molduras','arcos','portas'],
  feliciano:['toldo','armazem','portas','molduras','vasos'],
  vicente:['toldo','vasos','portas','arcos','portao']
 });
 const PALETTES=Object.freeze({
  matriz:{trim:'#b6a492',wall:'#eee5cf',plant:'#779b75',accent:'#a6bdb0'},
  feira:{trim:'#b48c70',wall:'#e8d8bc',plant:'#90a475',accent:'#c58769'},
  joao:{trim:'#a69b8a',wall:'#e2e8d9',plant:'#74a18e',accent:'#829ca5'},
  clovis:{trim:'#8c9ba5',wall:'#f3ead8',plant:'#6b9c78',accent:'#b8c4cc'},
  feliciano:{trim:'#b57a62',wall:'#f5e8d6',plant:'#88a372',accent:'#d47a63'},
  vicente:{trim:'#a87b5e',wall:'#f2e2ca',plant:'#7da178',accent:'#e0b04b'}
 });
 function variant(home){
  if(!home?.centralBlock||!ARCHETYPES[home.centralBlock])return null;
  const seed=Math.abs(Math.trunc(Number(home.seed)||0));
  const group=ARCHETYPES[home.centralBlock];
  return {block:home.centralBlock,kind:group[seed%group.length],shade:seed%4,detail:seed%3,roof:seed%3,returnWall:seed%4===1,shop:['feira','feliciano','vicente'].includes(home.centralBlock)&&seed%3!==2,seed};
 }
 function statistics(houses){
  const result={total:0,kinds:{}};for(const id of Object.keys(ARCHETYPES))result[id]=0;
  for(const home of houses){const style=variant(home);if(!style)continue;result.total++;result[style.block]++;result.kinds[style.kind]=(result.kinds[style.kind]||0)+1;}
  return result;
 }
 const SKETCH_IDS=Object.freeze(['matriz','feira','joao','clovis','feliciano','vicente']);
 function restoreSketches(raw){return Array.isArray(raw)?SKETCH_IDS.filter(id=>raw.includes(id)):[];}
 function recordSketch(state,id,nearby){
  if(!Array.isArray(state)||!SKETCH_IDS.includes(id)||!nearby||state.includes(id))return{recorded:false,unlocked:Array.isArray(state)&&restoreSketches(state).length>=SKETCH_IDS.length};
  state.push(id);return{recorded:true,unlocked:restoreSketches(state).length>=SKETCH_IDS.length,progress:restoreSketches(state).length,total:SKETCH_IDS.length};
 }
 function draw(c,home,phase='manha',minute=8*60){
  const style=variant(home);if(!style)return false;
  const palette=PALETTES[style.block],seed=style.seed,night=phase==='anoitecer'||minute>=18*60||minute<6*60;
  const width=home.w,height=home.h;
  c.save();c.translate(home.x,home.y);c.rotate(home.angle);
  const left=-width/2,top=-height/2,front=top+height*.63,faceH=height*.37;
  // Roof: one thin ridge + uneven ceramic joints; no added footprint.
  c.strokeStyle=style.shade%2?'#f8ddbb88':'#f2e7c988';c.lineWidth=.65;
  c.beginPath();c.moveTo(left+1,top+height*.15);c.lineTo(left+width-1,top+height*.15);c.stroke();
  for(let i=2+(seed%3);i<width-2;i+=4.2){c.beginPath();c.moveTo(left+i,top+height*.17);c.lineTo(left+i+1,top+height*.29);c.stroke();}
  // The roof casts a soft, narrow contact shadow across the wall.
  c.fillStyle='#584e462e';c.fillRect(left+.8,front-.25,width-1.6,1.3);
  c.fillStyle=[palette.wall,'#ead7c7','#d4ded1','#dfd6c5'][style.shade];c.fillRect(left+1,front+1,width-2,Math.max(1,faceH-2));
  c.fillStyle=palette.trim;c.fillRect(left+.75,front+1,1,faceH-1.5);
  c.fillRect(left+width-1.75,front+1,1,faceH-1.5);
  const windowY=front+2.05,windowH=Math.max(2.1,faceH-3.8),windowX=left+2.4;
  // Transparent warm interiors after dusk; daytime reads as cool glass.
  const glass=night?'#f5d99e':'#91b5b0';
  if(style.kind==='arcos'||style.kind==='molduras'||style.kind==='vasos'){
   c.fillStyle=glass;c.fillRect(windowX,windowY,Math.min(4.3,width*.31),windowH);
   c.strokeStyle=style.kind==='arcos'?'#f7efe1':'#d0bcad';c.lineWidth=.85;
   c.strokeRect(windowX-.5,windowY-.5,Math.min(5.3,width*.34),windowH+1);
   c.beginPath();c.moveTo(windowX+2,windowY);c.lineTo(windowX+2,windowY+windowH);c.stroke();
   if(style.kind==='arcos'){
    c.strokeStyle='#f8eee1';c.beginPath();c.arc(windowX+2,windowY,2.05,Math.PI,0);c.stroke();
   }
  }
  if(style.kind==='portas'||style.kind==='portao'){
   const doorW=Math.max(4,width*.36),doorX=left+width*.48;
   c.fillStyle=style.kind==='portao'?'#809a90':'#a58b73';c.fillRect(doorX,windowY,doorW,windowH+.8);
   c.strokeStyle='#f5ead8';c.lineWidth=.62;
   for(let i=1;i<doorW;i+=2.35){c.beginPath();c.moveTo(doorX+i,windowY+.2);c.lineTo(doorX+i,windowY+windowH+.5);c.stroke();}
  }
  if(style.kind==='toldo'||style.kind==='armazem'){
   const awning=style.kind==='toldo',from=left+1.2,topline=front-2.3;
   c.fillStyle=awning?palette.accent:'#aeb9ae';c.fillRect(from,topline,width-2.4,3);
   c.fillStyle='#f9ecd5';for(let i=2;i<width-2;i+=4)c.fillRect(left+i,topline,1.6,3);
   c.fillStyle=night?'#8b8982':glass;c.fillRect(left+2,front+2,width-4,Math.max(2,faceH-3.4));
   c.strokeStyle='#e7e3d3';c.lineWidth=.65;
   for(let i=3;i<width-2;i+=3){c.beginPath();c.moveTo(left+i,front+2);c.lineTo(left+i,front+faceH-1.1);c.stroke();}
   if(!night&&awning){c.fillStyle='#6d866e';c.fillRect(left+width*.45,front+2,width*.2,.75);}
  }
  // Regional visual vocabulary from real Belém/PB photographs: modest
  // parapets, tiled eaves and narrow shop bays. These are fictional designs.
  if(style.roof===1){
   c.fillStyle=palette.wall;c.fillRect(left+.5,front-3.5,width-1,3.6);
   c.fillStyle=palette.trim;c.fillRect(left+.5,front-3.7,width-1,.85);
   c.fillStyle='#fff4db';c.fillRect(left+1.2,front-2.5,width-2.4,.55);
  }else if(style.roof===2){
   c.fillStyle='#b47b61';c.fillRect(left+.4,front-1.7,width-.8,1.6);
   c.fillStyle='#e3b18a';for(let i=1.5;i<width-1;i+=2.4)c.fillRect(left+i,front-1.7,.8,1.1);
  }
  if(style.returnWall){
   // A shaded return face creates corner variety without extending the lot.
   c.fillStyle='#584e462c';c.fillRect(left+width-2.5,front-2,2,faceH+1.5);
   c.fillStyle='#f9e8cc';c.fillRect(left+width-2.6,front-2,.55,faceH+1.5);
  }
  if(style.shop){
   const fy=front+.4,bayW=width-4;
   c.fillStyle='#6e817a';c.fillRect(left+2,fy+1,bayW,Math.max(1,faceH-2.4));
   c.fillStyle=['#6c9188','#b47f69','#9d936f'][seed%3];c.fillRect(left+1.2,fy-1.2,width-2.4,2);
   // Small anonymous fascia strokes; no invented real business names.
   c.fillStyle='#f5e7c9';c.fillRect(left+width*.3,fy-.6,width*.4,.55);
   c.fillStyle=night?'#e7cfa0':'#c9d9cc';c.fillRect(left+2.5,fy+1.5,bayW*.43,Math.max(.8,faceH-3.4));
   c.fillStyle='#c8b498';c.fillRect(left+width*.51,fy+1,.7,Math.max(1,faceH-2.5));
   c.fillStyle='#d3ad7e';for(let i=0;i<3;i++)c.fillRect(left+3+i*1.5,fy+faceH-2.4,1,1);
   c.fillStyle='#f4e5cc';c.fillRect(left+2,fy+faceH-1.3,bayW,.65);
  }
  // Porch/potted plants stay INSIDE each illustrative building's tiny bounds.
  if(style.kind==='vasos'||style.kind==='arcos'&&seed%2===0){
   const px=left+width-3.1,py=front+faceH-2;
   c.fillStyle='#bd8d73';c.fillRect(px,py,2.1,2);
   c.fillStyle=palette.plant;c.beginPath();c.arc(px+1,py-.6,2.2,0,Math.PI*2);c.fill();
   c.fillStyle='#e7c9a8';c.beginPath();c.arc(px+.3,py-1.4,.6,0,Math.PI*2);c.fill();
  }
  if(style.kind==='molduras'&&seed%3===0){
   c.fillStyle=palette.accent;c.fillRect(left+width*.61,front+1.7,1,faceH-2.6);
   c.fillStyle='#fff7e3';c.fillRect(left+width*.68,front+2,1,1.3);
  }
  if(night){
   // Soft inset window light; there is intentionally no streetlight or false GIS pin.
   c.fillStyle='#ffd88620';c.fillRect(windowX-1,windowY-1,Math.min(6.6,width*.43),windowH+2);
  }
  // Authentic Belém/PB house micro-details: tile number plaque, meter box & rooftop water tank
  if(seed%2===0){
   c.fillStyle='#3b6e8c';c.fillRect(left+1.4,windowY-.3,2.1,1.3);
   c.fillStyle='#ffffff';c.fillRect(left+1.7,windowY,1.5,.6);
  }
  if(seed%3===1){
   c.fillStyle='#b8bec4';c.fillRect(left+width-2.8,windowY+.6,1.5,2.1);
   c.strokeStyle='#6e767d';c.lineWidth=.4;c.strokeRect(left+width-2.8,windowY+.6,1.5,2.1);
  }
  if(seed%5===0){
   c.fillStyle='#4a90c2';c.beginPath();c.ellipse(left+width*.72,top+height*.22,2.4,1.6,0,0,Math.PI*2);c.fill();
   c.strokeStyle='#2f658d';c.lineWidth=.45;c.stroke();
  }
  c.restore();return true;
 }
 function drawPreview(canvas,block,phase='manha'){
  const c=canvas.getContext('2d');if(!c||!PALETTES[block])return false;
  const w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  c.fillStyle='#e3ebdc';c.fillRect(0,0,w,h);
  c.fillStyle='#c7d2b5';c.fillRect(0,h*.78,w,h*.22);
  c.fillStyle='#eadfc3';c.fillRect(0,h*.78,w,2);
  for(let i=0;i<3;i++){
   const bw=35+i%2*2,bh=33+i%3*2,x=36+i*49,y=h*.78-bh*.45;
   c.save();c.translate(x,y);
   c.fillStyle='#3c5b4c26';c.fillRect(-bw/2+4,-bh/2+5,bw,bh);
   c.fillStyle=PALETTES[block].wall;c.fillRect(-bw/2,-bh/2,bw,bh);
   c.fillStyle=['#be866e','#9fa59a','#cc997b'][i];c.fillRect(-bw/2-1,-bh/2-1,bw+2,bh*.64);
   c.restore();
   // Distinct seed values force a small design range for each study area.
   draw(c,{x,y,w:bw,h:bh,angle:0,seed:i*7+block.length,centralBlock:block},phase,8*60);
  }
  return true;
 }
 return{ARCHETYPES,PALETTES,SKETCH_IDS,variant,statistics,restoreSketches,recordSketch,draw,drawPreview};
});