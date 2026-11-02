const assert=require('node:assert/strict');
const test=require('node:test');
const {create}=require('../gemini-modules/resident-motion.js');

test('amortece a direção visual nas esquinas sem desviar a rota',()=>{
 const motion=create(null);
 motion.resolve({id:'vizinho',x:0,y:0},0,1);
 const east=motion.resolve({id:'vizinho',x:6,y:0,walking:true},.05,1);
 const turning=motion.resolve({id:'vizinho',x:6,y:6,walking:true},.10,1);
 assert.equal(east.heading,0);
 assert.ok(turning.heading>0&&turning.heading<Math.PI/2,'giro progressivo');
 assert.ok(turning.y>east.y&&Number.isFinite(turning.stridePhase));
});
test('preserva pausa e recupera a caminhada depois',()=>{
 const motion=create(null);
 motion.resolve({id:'amiga',x:0,y:0},0,1);
 const pause=motion.resolve({id:'amiga',x:0,y:0,pause:true},.05,1);
 assert.equal(pause.walking,false);
 const walk=motion.resolve({id:'amiga',x:8,y:0,walking:true},.10,1);
 assert.ok(walk.x>pause.x&&walk.walking);
});
test('não muda campos de salvamento nem pontos do grafo',()=>{
 const graph={route:()=>null};
 const motion=create(graph);
 motion.resolve({id:'a',x:1,y:2},0,1);
 const point=motion.resolve({id:'a',x:4,y:2,walking:true},.05,1);
 assert.ok(Number.isFinite(point.heading));
 assert.equal(motion.snapshot().length,1);
});

test('cumprimentos começam e terminam suavemente sem acenar em movimento',()=>{
 const motion=create(null);
 motion.resolve({id:'rosa',x:0,y:0},0,1);
 const greeting={id:'rosa',x:0,y:0,walking:false,walkBlend:0,
  social:{pose:'wave',facing:1,intensity:1}};
 motion.present({...greeting},0,false);
 const entering=motion.present({...greeting},.05,false);
 assert.ok(entering.social.intensity>0&&entering.social.intensity<1);
 const leaving=motion.present({id:'rosa',x:0,y:0,walking:false,walkBlend:0},.10,false);
 assert.equal(leaving.social.pose,'wave');
 assert.ok(leaving.social.intensity<entering.social.intensity);
 const walking=motion.present({id:'rosa',x:0,y:0,walking:true,walkBlend:.2},.15,false);
 assert.equal(walking.social,undefined,'não acena com os pés já em movimento');
});
test('não cria atalho quando o próximo ponto pertence a trecho desconectado',()=>{
 const motion=create(null);
 motion.resolve({id:'zeca',x:0,y:0},0,1);
 const blocked=motion.resolve({id:'zeca',x:80,y:0,walking:true},.05,1);
 assert.equal(blocked.x,0);
 assert.equal(blocked.walking,false);
});
test('retomar uma aba inativa não teletransporta o morador para o destino',()=>{
 const graph={route:(from,to)=>({distance:80,points:[{x:from[0],y:from[1]},{x:40,y:0},{x:to[0],y:to[1]}]})};
 const motion=create(graph);
 motion.resolve({id:'lucia',x:0,y:0,walking:true},0,1);
 const resumed=motion.resolve({id:'lucia',x:80,y:0,walking:true},60,1);
 assert.ok(resumed.x<5,'a posição anterior é preservada ao retomar a aba');
 assert.equal(resumed.arriving,true,'o caminho do grafo é usado para retomar a caminhada');
 const later=motion.resolve({id:'lucia',x:80,y:0,walking:true},60.08,1);
 assert.ok(later.x>resumed.x&&later.x<80,'continua caminhando sem salto');
});
test('morador em esquina congestionada reaparece gradualmente',()=>{
 const motion=create(null);
 assert.equal(motion.appearance('rosa',true,0),1);
 const fading=motion.appearance('rosa',false,.08);
 assert.ok(fading>0&&fading<1);
 const returning=motion.appearance('rosa',true,.16);
 assert.ok(returning>fading&&returning<1);
});
