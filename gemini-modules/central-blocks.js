
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
    {id:'joao',title:'Rua João Pessoa',kind:'street',radius:125,detail:'A orientação do trecho vem da via nomeada no OSM. Portas, telhas, grades, reboco e paleta são propostas artísticas.',source:'Traçado viário OpenStreetMap',reliability:'geometria viária apenas'},
    {id:'clovis',title:'Rua Clóvis Bezerra (Casa sem numeração particular & Escola Anita)',kind:'homeVaranda',radius:340,detail:'Corredor residencial completo da Rua Clóvis Bezerra e travessas (Antônio Borges de Lima, Antônio Alfredo Guedes e Nunes Guedes), com calçadas de paralelepípedo, cadeiras ao entardecer, porta de garagem prateada (sem número residencial), igreja encostada ao sem número residencial e EMEF Anita Barbosa.',source:'Traçado OSM + Memória Afetiva de Belém/PB',reliability:'via real OSM + detalhes afetivos'},
    {id:'feliciano',title:'Eixo Rua Feliciano Pedrosa (Sonho Doce)',kind:'bakery',radius:125,detail:'Avenida principal asfaltada cortando o Centro, com marquises comerciais, vitrines da Confeitaria Sonho Doce (nº 1401) e movimento urbano.',source:'Traçado viário OpenStreetMap',reliability:'via principal OSM + referências comerciais'},
    {id:'vicente',title:'Rua Vicente Cado (Bar da Prosa & Centro)',kind:'bar',radius:130,detail:'Trecho boêmio e histórico ligando a Igreja da Conceição ao Bar da Prosa (nº 354), com mesinhas amarelas na calçada, espetinhos e subida para o Bairro da Luz.',source:'Traçado viário OpenStreetMap',reliability:'via real OSM + ponto cultural'}
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
    const anchors={matriz:data.landmarks.find(l=>l.id==='igreja')?.p,feira:data.landmarks.find(l=>l.id==='mercado')?.p,joao:streetAnchor(data),clovis:[180,430],feliciano:data.landmarks.find(l=>l.id==='sonho_doce')?.p||[140.85,-45.07],vicente:data.landmarks.find(l=>l.id==='bar_prosa')?.p||[29.35,-249.25]};
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
    joao:['#e6d9c1','#e6dddb','#d9e5d8','#efe1cc'],
    clovis:['#f5ebd6','#dce8df','#f2dfd3','#e5e2d0'],
    feliciano:['#efe0c8','#e2dfd5','#f4d9c6','#d8e4dc'],
    vicente:['#f3e2c7','#ead8c8','#dfe6d8','#f0dfc8']
  };
  function draw(c,home,phase='manha') {
    if(!home.centralBlock)return;
    const block=home.centralBlock,seed=home.seed||0,wall=colors[block][seed%4];
    // Architectural details follow the upright illustrated facade, not the
    // rotated lot used for collision and routing.
    c.save();c.translate(home.x,home.y);
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
      // Existing illustrative awning: a shaded canvas edge and subtle fabric
      // rhythm, inspired by the 2007 market scene, not a current shop survey.
      const colors=['#d0a276','#7394a0','#cb846b'];
      c.fillStyle='#50483f32';c.fillRect(left-.8,base+1,home.w+1.6,1.6);
      c.fillStyle=colors[seed%3];c.fillRect(left-1.3,base-2.2,home.w+2.6,3.2);
      c.fillStyle='#fff7df56';c.fillRect(left-1.1,base-2,home.w+2.2,.7);
      c.fillStyle='#65564d36';c.fillRect(left-1.3,base+.25,home.w+2.6,.65);
      c.strokeStyle='#fff5dc';c.lineWidth=.65;
      for(let i=2;i<home.w;i+=4){c.beginPath();c.moveTo(left+i,base-2.2);c.lineTo(left+i,base+1);c.stroke();}
    }
    if(block==='feliciano'){
      // Fictional storefront study only: no brand, surveyed entrance or
      // pavement polygon is inferred from the commercial address listings.
      const storefront=seed%5!==0;
      const height=home.h*.36;
      c.fillStyle='#514b423d';c.fillRect(left+.8,base+1.1,home.w-1.6,1.35);
      if(storefront){
        const glassX=left+1.5,glassW=home.w*.49;
        c.fillStyle='#506f73';c.fillRect(glassX,base+2,glassW,height*.76);
        c.fillStyle='#a7d1cb90';c.fillRect(glassX+.65,base+2.5,glassW*.31,height*.62);
        c.fillStyle='#f8e9ce9c';c.fillRect(glassX+glassW*.58,base+2.5,.55,height*.61);
        c.fillStyle='#f4dfb7';c.fillRect(glassX,base+height*.72,glassW,.65);
      }
      // Three proportional awning heights create a modest commercial rhythm.
      const awningRise=[1.9,2.6,3.2][seed%3];
      c.fillStyle='#45443c32';c.fillRect(left-.45,base+.45,home.w+.9,1.25);
      c.fillStyle=['#bb8570','#849b8c','#c3a27b'][seed%3];
      c.fillRect(left-.3,base-awningRise,home.w+.6,awningRise+.45);
      c.fillStyle='#fff6df8a';c.fillRect(left-.1,base-awningRise+.2,home.w+.2,.55);
      c.fillStyle='#5f544533';c.fillRect(left-.2,base+.05,home.w+.4,.7);
      // Threshold sits within the illustrated facade, not the street.
      c.fillStyle='#ead9bb';c.fillRect(left+home.w*.61,base+height-.8,home.w*.25,.8);
      c.fillStyle='#715e4c66';c.fillRect(left+home.w*.61,base+height-.12,home.w*.25,.4);
    }
    if(block==='matriz'){
      // Quiet stucco reveals and eave shadows on existing illustrative houses.
      // These are material studies, not claims about any photographed private facade.
      c.fillStyle='#5d58451f';c.fillRect(left+.8,base+1.2,home.w-1.6,1.4);
      c.strokeStyle='#756d63';c.lineWidth=.65;c.strokeRect(left+.8,base-.2,home.w-1.6,home.h*.36+.2);
      c.fillStyle='#efeee0';c.fillRect(left+home.w*.55,base+1.5,1.2,home.h*.29);
      c.fillStyle='#fff9eb82';c.fillRect(left+home.w*.55+1.2,base+1.5,.6,home.h*.29);
      if(seed%3===0){
        c.fillStyle='#b6a68f';c.fillRect(left+home.w*.59,base+home.h*.25,home.w*.3,.7);
        c.fillStyle='#625b4b24';c.fillRect(left+home.w*.59,base+home.h*.25+.7,home.w*.3,.55);
      }
    }
    if(block==='joao'&&seed%3===0){
      c.fillStyle='#d3a895';c.fillRect(left+home.w*.48,base+1,1.3,home.h*.34);
      c.fillStyle='#76a68a';c.beginPath();c.ellipse(left+home.w+.3,base+home.h*.15,2.6,1.7,0,0,Math.PI*2);c.fill();
    }
    // Tiny fictional doorstep corners on a sparse subset of existing homes.
    // All details stay inside the drawn facade: no new buildings or path obstacles.
    const residential=(block==='matriz'||block==='joao'||block==='clovis');
    if(residential&&home.w>=18&&seed%7===2){
      const porchY=base+home.h*.31,porchX=left+home.w*.18;
      c.fillStyle='#8b735e';c.fillRect(porchX,porchY-2.1,3.1,.65);
      c.fillRect(porchX+.25,porchY-1.5,.55,1.5);
      c.fillRect(porchX+2.3,porchY-1.5,.55,1.5);
      c.fillStyle='#b68064';c.fillRect(porchX+5.2,porchY-2.1,2.4,.8);
      c.fillStyle='#7b9e7a';c.beginPath();
      c.ellipse(porchX+6.4,porchY-3.5,1.7,1.4,0,0,Math.PI*2);c.fill();
    }
    if(phase==='anoitecer'){
      c.fillStyle='#ffe3a55c';c.fillRect(left+1.8,base+2,3,home.h*.28);
    }
    c.restore();
  }
  return {BLOCKS,streetAnchor,prepare,draw};
});

