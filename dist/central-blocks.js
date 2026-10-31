/* Belém Viva V2.13 — typology studies attached to existing illustrative houses.
 * The street graph and OSM POIs locate the STUDY AREAS, not surveyed buildings.
 * Colors, storefronts, doors, awnings and individual lots are artistic proposals.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RoncadorCentralBlocks = api;
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const BLOCKS = [
    {id:'matriz',title:'Caminhos da Matriz',kind:'igreja',radius:128,detail:'Arcos, torre e contraste de pilastras vêm da fotografia da igreja em 2007; as casas vizinhas são inventadas.',source:'Foto histórica da igreja · 2007',reliability:'foto histórica do marco, não das casas'},
    {id:'feira',title:'Entorno da Feira',kind:'mercado',radius:122,detail:'Toldos e cestos retomam uma fotografia da feira de 2007; tipos de bancas e portas atuais não foram cadastrados.',source:'Foto histórica da feira · 2007',reliability:'foto histórica da atividade, não das fachadas'},
    {id:'joao',title:'Rua João Pessoa',kind:'street',radius:125,detail:'A orientação do trecho vem da via nomeada no OSM. Portas, telhas, grades, reboco e paleta são propostas artísticas.',source:'Traçado viário OpenStreetMap',reliability:'geometria viária apenas'}
  ];
  function streetAnchor(data) {
    const roads=data.roads.filter(r=>r.tags?.name==='Rua João Pessoa');
    const points=roads.flatMap(r=>r.p).filter(p=>Math.hypot(p[0]-data.start[0],p[1]-data.start[1])<370);
    const market=data.landmarks.find(l=>l.id==='mercado')?.p||data.start;
    const church=data.landmarks.find(l=>l.id==='igreja')?.p||data.start;
    if(!points.length)return [...data.start];
    return [...points].sort((a,b)=>score(b)-score(a))[0].slice();
    function score(p){return Math.min(Math.hypot(p[0]-market[0],p[1]-market[1]),Math.hypot(p[0]-church[0],p[1]-church[1]))-Math.hypot(p[0]-data.start[0],p[1]-data.start[1])*.08;}
  }
  function prepare(data,houses) {
    const anchors={matriz:data.landmarks.find(l=>l.id==='igreja')?.p,feira:data.landmarks.find(l=>l.id==='mercado')?.p,joao:streetAnchor(data)};
    const blocks=BLOCKS.map(b=>({...b,at:anchors[b.id]?[...anchors[b.id]]:null,count:0}));
    for(const house of houses){
      let best=null;
      for(const block of blocks){
        if(!block.at)continue;
        const distance=Math.hypot(house.x-block.at[0],house.y-block.at[1]);
        if(distance>block.radius)continue;
        const normalized=distance/block.radius;
        if(!best||normalized<best.distance)best={block,distance:normalized};
      }
      house.centralBlock=best?.block.id||null;
      if(best)best.block.count++;
    }
    return blocks;
  }
  const colors={
    matriz:['#f4e8d5','#e0dec8','#f4dfce','#dae3d5'],
    feira:['#e8d4b4','#e9dfcb','#dddbcb','#d7e6ce'],
    joao:['#e6d9c1','#e6dddb','#d9e5d8','#efe1cc']
  };
  function draw(c,home,phase='manha') {
    if(!home.centralBlock)return;
    const block=home.centralBlock,seed=home.seed||0,wall=colors[block][seed%4];
    c.save();c.translate(home.x,home.y);c.rotate(home.angle);
    const left=-home.w/2,top=-home.h/2,base=top+home.h*.63;
    // The visible strip faces its generative street, but it is not a real facade.
    c.fillStyle='#5b5b4a24';c.fillRect(left+1,base+2,home.w+1,home.h*.36+2);
    c.fillStyle=wall;c.fillRect(left+.7,base,home.w-1.4,home.h*.36);
    c.fillStyle=block==='matriz'?'#75675d':block==='feira'?'#af826a':'#b69b79';
    c.fillRect(left,base,home.w,1.65);
    if(seed%4===0){
      c.fillStyle='#6e7e75';c.fillRect(left+1.8,base+2,home.w*.48,home.h*.33);
      c.fillStyle='#ede6d0';for(let j=1;j<=2;j++)c.fillRect(left+1.9,base+2+j*1.9,home.w*.46,.48);
    }else{
      c.fillStyle=block==='joao'?'#6b9894':'#68817f';
      c.fillRect(left+1.8,base+2,3,home.h*.3);
      c.strokeStyle='#f7edd6';c.lineWidth=.55;c.strokeRect(left+1.9,base+2.1,2.8,home.h*.27);
    }
    c.fillStyle='#8c7d67';c.fillRect(left+home.w*.62,base+1.9,home.w*.25,home.h*.32);
    if(block==='feira'&&seed%3!==1){
      const colors=['#d0a276','#7394a0','#cb846b'];c.fillStyle=colors[seed%3];
      c.fillRect(left-1.3,base-2.2,home.w+2.6,3.2);
      c.strokeStyle='#fff5dc';c.lineWidth=.65;for(let i=2;i<home.w;i+=4){c.beginPath();c.moveTo(left+i,base-2.2);c.lineTo(left+i,base+1);c.stroke();}
    }
    if(block==='matriz'){
      c.strokeStyle='#756d63';c.lineWidth=.65;c.strokeRect(left+.8,base-.2,home.w-1.6,home.h*.36+.2);
      c.fillStyle='#efeee0';c.fillRect(left+home.w*.55,base+1.5,1.2,home.h*.29);
    }
    if(block==='joao'&&seed%3===0){
      c.fillStyle='#d3a895';c.fillRect(left+home.w*.48,base+1,1.3,home.h*.34);
      c.fillStyle='#76a68a';c.beginPath();c.ellipse(left+home.w+.3,base+home.h*.15,2.6,1.7,0,0,Math.PI*2);c.fill();
    }
    if(phase==='anoitecer'){
      c.fillStyle='#ffe3a55c';c.fillRect(left+1.8,base+2,3,home.h*.28);
    }
    c.restore();
  }
  return {BLOCKS,streetAnchor,prepare,draw};
});
