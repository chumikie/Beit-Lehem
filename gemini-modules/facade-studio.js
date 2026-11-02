
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
  return {block:home.centralBlock,kind:group[seed%group.length],shade:seed%4,detail:seed%3,roof:seed%3,returnWall:seed%4===1,shop:home.centralBlock==='feira'&&seed%3!==2,seed};
 }
 function frontageMode(style){
  const seed=style.seed,block=style.block;
  if(block==='feira')return seed%5===0?'mixed':'commercial';
  if(block==='feliciano')return seed%4===0?'mixed':'commercial';
  if(block==='vicente')return seed%4===0?'commercial':seed%5===0?'mixed':'residential';
  if(block==='matriz')return seed%7===0?'mixed':'residential';
  return seed%6===0?'mixed':'residential';
 }
 function statistics(houses){
  const result={total:0,matriz:0,feira:0,joao:0,clovis:0,feliciano:0,vicente:0,kinds:{}};
  for(const home of houses){const style=variant(home);if(!style)continue;result.total++;result[style.block]++;result.kinds[style.kind]=(result.kinds[style.kind]||0)+1;}
  return result;
 }
 const SKETCH_IDS=Object.freeze(['matriz','feira','joao','clovis','feliciano','vicente']);
 function restoreSketches(raw){return Array.isArray(raw)?SKETCH_IDS.filter(id=>raw.includes(id)):[];}
 function recordSketch(state,id,nearby){
  if(!Array.isArray(state)||!SKETCH_IDS.includes(id)||!nearby||state.includes(id))return{recorded:false,unlocked:state?.length===SKETCH_IDS.length};
  state.push(id);return{recorded:true,unlocked:state.length===SKETCH_IDS.length,progress:state.length};
 }

 function drawFrontage(c,home,style,palette,night,distant){
  const width=home.w,height=home.h,seed=style.seed,left=-width/2;
  const front=-height/2+height*.63,faceH=height*.37;
  const ground=front+faceH-1.1;
  // The foreground is clipped to the existing illustrative house envelope.
  // It is a painted setback cue, never a parcel, building or collision shape.
  c.save();if(typeof c.rect==='function'&&typeof c.clip==='function'){c.beginPath();c.rect(left+.8,front+1,width-1.6,Math.max(1,faceH-1.5));c.clip();}
  const mode=frontageMode(style);
  if(mode==='commercial'){
   c.fillStyle=night?'#8c8b7550':'#c7b99a88';
   c.fillRect(left+1,ground,width-2,1.1);
   const bays=style.block==='feira'?3:style.block==='feliciano'?2:1;
   const bayWidth=(width-2)/bays;
   for(let i=0;i<bays;i++){
    const bx=left+1+i*bayWidth;
    c.fillStyle=['#78958c55','#c28b6d55','#b4a77c55'][((seed+i)%3)];
    c.fillRect(bx+1,front+2,Math.max(.8,bayWidth-2),Math.max(1,faceH-3.4));
    c.strokeStyle='#f5ead4a8';c.lineWidth=.55;
    c.strokeRect(bx+1,front+2,Math.max(.8,bayWidth-2),Math.max(1,faceH-3.4));
    if(!distant){
     c.fillStyle=style.block==='feira'?'#c58d69':'#b78368';
     c.fillRect(bx+.7,front+1.15,Math.max(1,bayWidth-1.4),1.35);
     c.fillStyle='#f8e8cf';c.fillRect(bx+.8,front+1.25,Math.max(.5,bayWidth-1.6),.28);
    }
   }
   if(!distant){
    c.strokeStyle='#8b7966a8';c.lineWidth=.8;
    for(let i=1;i<bays;i++){const x=left+1+i*bayWidth;c.beginPath();c.moveTo(x,front+1.5);c.lineTo(x,ground+.7);c.stroke();}
   }
  }else if(mode==='mixed'){
   // Transitional front: a low planted edge, short anonymous fascia and
   // offset path soften the shift between shop rhythm and residential gates.
   // The whole composition remains inside the same clipped house envelope.
   c.fillStyle=night?'#617d5d66':palette.plant+'77';
   c.fillRect(left+1.2,ground-1.05,width-2.4,.72);
   const side=seed%2?1:-1;
   const fasciaX=side>0?left+width*.48:left+1.2;
   const fasciaW=width*.34;
   c.fillStyle=style.block==='matriz'?'#b8a88b88':'#c39b7b88';
   c.fillRect(fasciaX,front+1.9,fasciaW,1.05);
   c.fillStyle='#f4e7d1a8';
   c.fillRect(fasciaX+.45,front+2.05,Math.max(.6,fasciaW-.9,.6),.24);
   c.strokeStyle='#9b8a73a8';c.lineWidth=.7;
   c.beginPath();c.moveTo(left+1,ground+.02);c.lineTo(left+width-1,ground+.02);c.stroke();
   const pathX=side>0?left+width*.28:left+width*.72;
   c.fillStyle='#ddc9a6';c.fillRect(pathX-.55,ground-1.9,1.1,1.9);
   c.fillStyle=palette.plant;c.beginPath();c.arc(side>0?left+width*.82:left+width*.18,ground-1.1,.85,0,Math.PI*2);c.fill();
  }else{
   // A narrow planted strip and stepping path suggest a private setback.
   // Both remain inside the already existing illustrative house envelope.
   c.fillStyle=night?'#617d5d88':palette.plant+'88';
   c.fillRect(left+1.2,ground-1.15,width-2.4,.85);
   const pathX=left+width*(seed%2?.68:.32);
   c.fillStyle='#ddc9a6';c.fillRect(pathX-.65,ground-2.05,1.3,2.15);
   c.fillStyle='#b8a88e';c.fillRect(pathX-.65,ground-1.05,1.3,.22);
   const gateWidth=Math.max(2.2,Math.min(4.8,width*.28));
   const gateCenter=left+width*(seed%2?.68:.32),gateLeft=gateCenter-gateWidth/2;
   const gateRight=gateCenter+gateWidth/2;
   c.strokeStyle=seed%3===0?'#7f927f':'#b5a58b';c.lineWidth=1.15;
   c.beginPath();c.moveTo(left+1,ground+.05);c.lineTo(gateLeft,ground+.05);
   c.moveTo(gateRight,ground+.05);c.lineTo(left+width-1,ground+.05);c.stroke();
   c.fillStyle='#d4c2a5';c.fillRect(left+1,ground-.35,Math.max(.6,gateLeft-left-1),.65);
   c.fillRect(gateRight,ground-.35,Math.max(.6,left+width-1-gateRight),.65);
   c.fillStyle='#a58d70';c.fillRect(gateLeft-.35,ground-.65,.55,1.1);
   c.fillRect(gateRight-.2,ground-.65,.55,1.1);
   if(!distant){
    c.strokeStyle='#758b81';c.lineWidth=.55;
    for(let x=gateLeft+.45;x<gateRight-.2;x+=.9){c.beginPath();c.moveTo(x,ground-.48);c.lineTo(x,ground+.35);c.stroke();}
    c.fillStyle=palette.plant;c.beginPath();c.arc(left+width*(seed%2?.22:.82),ground-1.25,1.05,0,Math.PI*2);c.fill();
    c.fillStyle='#b88b70';c.fillRect(left+width*(seed%2?.22:.82)-.65,ground-1,.95,.7);
   }
  }
  c.restore();
 }
 function draw(c,home,phase='manha',minute=8*60,zoomLevel=1.85){
  const style=variant(home);if(!style)return false;
  const palette=PALETTES[style.block],seed=style.seed,night=phase==='anoitecer'||minute>=18*60||minute<6*60;
  const width=home.w,height=home.h;
  // Only microdetails are reduced at distant zoom; facade and lot are unchanged.
  const distant=zoomLevel<1.15;
  // Keep windows and trim upright on screen at every street bearing.
  c.save();c.translate(home.x,home.y);
  const left=-width/2,top=-height/2,front=top+height*.63,faceH=height*.37;
  // Roof: one thin ridge + uneven ceramic joints; no added footprint.
  c.strokeStyle=style.shade%2?'#f8ddbb88':'#f2e7c988';c.lineWidth=.65;
  c.beginPath();c.moveTo(left+1,top+height*.15);c.lineTo(left+width-1,top+height*.15);c.stroke();
  if(!distant)for(let i=2+(seed%3);i<width-2;i+=4.2){c.beginPath();c.moveTo(left+i,top+height*.17);c.lineTo(left+i+1,top+height*.29);c.stroke();}
  // The roof casts a soft, narrow contact shadow across the wall.
  c.fillStyle=night?'#403b3b34':style.block==='matriz'?'#574c3f3c':'#584e462e';c.fillRect(left+.8,front-.25,width-1.6,style.block==='matriz'?1.65:1.3);
  c.fillStyle=[palette.wall,'#ead7c7','#d4ded1','#dfd6c5'][style.shade];c.fillRect(left+1,front+1,width-2,Math.max(1,faceH-2));
  // Residential edges ease from the warmer centre into quieter plaster and
  // limewashed lower walls. Every mark stays within the existing footprint.
  const residentialEdge=['joao','clovis','vicente'].includes(style.block);
  if(residentialEdge){
   c.fillStyle=night?'#8e88751f':'#fbf3dd52';
   c.fillRect(left+1.15,front+1.2,width-2.3,Math.max(.6,faceH*.29));
   c.fillStyle=style.shade%2?'#8d87772e':'#9a907c23';
   c.fillRect(left+1,front+faceH-1.45,width-2,Math.min(1.05,faceH*.16));
   if(!distant&&seed%4===2){
    // Sparse worn-plaster strokes, not identical damage on every facade.
    c.fillStyle='#f9edd76b';
    c.fillRect(left+width*.28,front+faceH-2.4,Math.min(2.4,width*.16),.45);
   }
  }
  if(style.block==='matriz'){
   // Illustrated plaster plinth and a soft side edge; no footprint change.
   c.fillStyle='#a995802c';c.fillRect(left+1,front+faceH-1.35,width-2,.8);
   c.fillStyle='#fff6e35c';c.fillRect(left+1.05,front+1,.55,Math.max(.5,faceH-2.6));
  }
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
   if(style.block==='matriz'){
    c.fillStyle='#68584930';c.fillRect(left+.8,front-.15,width-1.6,.65);
   }
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
  if(!distant&&seed%2===0){
   c.fillStyle='#3b6e8c';c.fillRect(left+1.4,windowY-.3,2.1,1.3);
   c.fillStyle='#ffffff';c.fillRect(left+1.7,windowY,1.5,.6);
  }
  if(!distant&&seed%3===1){
   c.fillStyle='#b8bec4';c.fillRect(left+width-2.8,windowY+.6,1.5,2.1);
   c.strokeStyle='#6e767d';c.lineWidth=.4;c.strokeRect(left+width-2.8,windowY+.6,1.5,2.1);
  }
  if(!distant&&seed%5===0){
   c.fillStyle='#4a90c2';c.beginPath();c.ellipse(left+width*.72,top+height*.22,2.4,1.6,0,0,Math.PI*2);c.fill();
   c.strokeStyle='#2f658d';c.lineWidth=.45;c.stroke();
  }
  drawFrontage(c,home,style,palette,night,distant);
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
 return{ARCHETYPES,PALETTES,SKETCH_IDS,variant,frontageMode,statistics,restoreSketches,recordSketch,draw,drawPreview};
});

