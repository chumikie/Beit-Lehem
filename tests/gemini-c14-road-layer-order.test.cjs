'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const map=require('../dist/map.json');
const {buildGraph}=require('../dist/pathfinding.js');
const game=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const source=game.slice(game.indexOf('function drawRoads('),game.indexOf('function drawMappedPlaces('));

test('C14: todas as bordas são desenhadas antes dos pavimentos nos cruzamentos',()=>{
 const roads=[
  {tags:{highway:'residential'},p:[[-20,0],[20,0]],bounds:[-20,0,20,0]},
  {tags:{highway:'residential'},p:[[0,-20],[0,20]],bounds:[0,-20,0,20]}
 ];
 const strokes=[];
 const c={lineCap:'',lineJoin:'',strokeStyle:'',lineWidth:0,beginPath(){},moveTo(){},lineTo(){},save(){},restore(){},translate(){},setLineDash(){},stroke(){strokes.push({color:this.strokeStyle,width:this.lineWidth});}};
 const draw=vm.runInNewContext(source+';drawRoads',{roads,path:(ctx,points)=>{ctx.beginPath();for(const p of points)ctx.lineTo(...p);}});
 draw(c,2.35,false,{left:-30,right:30,top:-30,bottom:30});
 const surface=strokes.findIndex(s=>s.color==='#e6ddbc');
 assert.ok(surface>0);
 assert.equal(strokes.filter(s=>s.color==='#e6ddbc').length,2);
 assert.ok(strokes.slice(0,surface).some(s=>s.width>15));
 assert.ok(strokes.slice(surface).every(s=>s.width<=11.52),'nenhuma borda larga pode apagar o pavimento já desenhado');
 assert.match(source,/for\(const pass of \[0,1\]\)for\(const r of visible\)/);
});

test('C14: a conectividade OSM dos quatro setores não depende do desenho',()=>{
 const graph=buildGraph(map.roads);
 const hubs=['igreja','mercado','rodoviaria'].map(id=>map.landmarks.find(p=>p.id===id)).filter(Boolean);
 const joaquim=map.roads.filter(r=>/São Joaquim/i.test(r.tags?.name||''));
 assert.ok(hubs.length===3&&joaquim.length>0);
 for(const hub of hubs){
  const nearby=graph.nodes.filter(n=>Math.hypot(n.x-hub.p[0],n.y-hub.p[1])<150&&n.neighbours.length>=3);
  assert.ok(nearby.length>0,`sem entroncamentos OSM próximos de ${hub.id}`);
  console.info(`C14 ${hub.id}: ${nearby.length} vértices de grau >=3 no raio 150`);
 }
 const vertices=joaquim.reduce((sum,r)=>sum+r.p.length,0);
 console.info(`C14 Rua São Joaquim: ${joaquim.length} trechos OSM, ${vertices} vértices de geometria`);
 assert.ok(vertices>=2);
 assert.doesNotMatch(source,/\.p\s*=|\.bounds\s*=|pathfinder|route\(/);
});
