const assert=require('node:assert/strict');
const fair=require('../dist/fair-streets'),fruit=require('../dist/market-scene'),memory=require('../dist/affection-memory');
const map=require('../dist/map.json'),scenic=require('../dist/scenic-placement');
const raw=JSON.stringify(map),stalls=fair.layout(map,scenic.layout(map)),market=map.landmarks.find(p=>p.id==='mercado').p;
const stall=fair.featured(stalls,market);
assert(stalls.includes(stall),'uses an existing stall, never a new GIS location');
assert.equal(fair.featured([],market),null);assert.equal(fair.featured(stalls,null),null);
assert.deepEqual(fair.featured(stalls,market).p,stall.p,'selection is stable');
const basic=fair.appearance({work:[]},[]);assert(!basic.canopy&&!basic.baskets&&basic.fruits.every(x=>x===null));
const partial=fruit.place(null,'maca-1',4,true);const half=fair.appearance({work:['toldo']},partial);
assert(half.canopy&&!half.baskets);assert.equal(half.fruits[4],'maca-1');assert.equal(half.fruits.filter(Boolean).length,1,'street respects partial arrangement');
const complete=fair.appearance({work:['toldo','frutas','cestos'],claimed:true},undefined);
assert(complete.canopy&&complete.baskets&&complete.claimed);assert.equal(new Set(complete.fruits).size,6,'old completed saves render six fruits');
assert(fair.hit(stall,stall.p[0],stall.p[1]-20));assert(!fair.hit(stall,stall.p[0]+99,stall.p[1]));
const base={state:{claimed:true},witnessed:false,stall:{p:[0,0]},player:{x:0,y:0},visible:true,people:[{id:'cica',x:30,y:0}],route:()=>({distance:40})};
assert.equal(fair.witness(base).id,'cica');
for(const change of [{state:{claimed:false}},{witnessed:true},{visible:false},{player:{x:200,y:0}},{people:[]},{people:[{id:'cica',x:30,y:0,meeting:true}]},{people:[{id:'cica',x:30,y:0,travel:true}]},{people:[{id:'cica',x:30,y:0,arriving:true}]},{route:()=>null},{route:()=>({distance:300})}])assert.equal(fair.witness({...base,...change}),null,'reaction must respect context, road connection and one-time observation');
const recollection=memory.snapshot({living:{day:1,minute:600,people:{}},marketMorning:{claimed:true},marketWitnessed:true},'cica');
assert(recollection.line.includes('banca'),'Ciça remembers a comment actually witnessed');
assert(!memory.snapshot({living:{day:1,minute:600,people:{}},marketMorning:{claimed:true},marketWitnessed:false},'cica').line.includes('ajeitaram'),'no fabricated memory before observation');
const methods=['save','restore','translate','beginPath','ellipse','fill','fillRect','moveTo','lineTo','closePath','stroke','arc','strokeRect','fillText'];
const ops=[],c={};for(const name of methods)c[name]=(...args)=>{assert(args.filter(x=>typeof x==='number').every(Number.isFinite));ops.push([name,...args]);};
for(const look of [{work:[]},{work:['toldo']},{work:['toldo','cestos','frutas'],claimed:true}])fair.draw(c,[stall],{left:-Infinity,right:Infinity,top:-Infinity,bottom:Infinity},2,true,{stall,state:look,slots:partial});
assert(ops.some(([name,text])=>name==='fillText'&&text==='Damião'),'featured stall is recognisable');
assert.equal(JSON.stringify(map),raw,'world artwork cannot alter source map');
// Randomized movement checks supplement the focused V2.26 tests.
let slots=fruit.restore(),seed=11;for(let i=0;i<1000;i++){seed=(seed*1664525+1013904223)>>>0;const id=fruit.FRUITS[seed%6].id,index=(seed>>>8)%6;slots=fruit.place(slots,id,index,true);const filled=slots.filter(Boolean);assert.equal(new Set(filled).size,filled.length);assert.equal(slots.length,6);}
console.log('V2.27: existing-stall consequences, partial fruit positions, legacy saves, contextual one-time reaction, memories and 1000 fruit moves verified');
