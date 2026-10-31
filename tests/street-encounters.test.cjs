const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const encounters=require('../dist/street-encounters.js');
const world=require('../dist/living-world.js');
const roads=require('../dist/pathfinding.js');
const street=require('../dist/street-life.js');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/map.json'),'utf8'));
const clock=(day,h,m)=>({day,minute:h*60+m});

assert.equal(encounters.current(clock(1,8,59)),null);
assert.equal(encounters.current(clock(1,9,0)).phase,'approach');
assert.equal(encounters.current(clock(1,9,20)).phase,'visit');
assert.equal(encounters.current(clock(1,9,55)).phase,'return');
assert.equal(encounters.current(clock(1,10,15)).id,'caderno-na-feira');
assert.equal(encounters.current(clock(1,10,39)).phase,'approach');
assert.equal(encounters.current(clock(1,10,40)).phase,'visit');
assert.equal(encounters.current(clock(1,11,10)).phase,'return');
assert.equal(encounters.current(clock(1,11,45)),null);
assert(world.isMarketMorning(clock(1,10,50)),'Bia visits while Monday stalls are active');
assert.deepEqual(encounters.current(clock(5,16,45)).cast,['damiao','lucia','bia']);
assert.equal(encounters.current(clock(5,17,0)),null);
assert.equal(encounters.current(clock(2,10,0)),null);

for(const [day,h,m,host,guest] of [[1,9,30,'damiao','lucia'],[1,10,50,'damiao','bia']]){
 const s=clock(day,h,m),a=encounters.agenda(s,host),b=encounters.agenda(s,guest);
 assert(a?.meeting&&b?.meeting,'both actors must really meet');
 assert.equal(a.hub,'mercado');assert.equal(b.hub,'mercado');
 assert(encounters.line(s,encounters.current(s)).includes('“'));
}
assert.equal(encounters.agenda(clock(1,9,30),'bia'),null,'Bia stays on her own routine during the flower meeting');
const approach=encounters.agenda(clock(1,10,25),'bia');
assert(approach.travel&&!approach.meeting);
assert(encounters.progress(approach.encounter)>0&&encounters.progress(approach.encounter)<1);
assert.equal(!!encounters.agenda(clock(1,10,50),'bia').travel,false);
assert.equal(encounters.agenda(clock(1,11,20),'bia').travel,true);
assert.equal(encounters.next(clock(1,8,30)).id,'flores-na-feira');
assert.equal(encounters.next(clock(1,10,10)).id,'caderno-na-feira');
assert.equal(encounters.next(clock(6,10,0)).id,'flores-na-feira');
assert.equal(encounters.current({day:0,minute:1}),null);
assert.equal(encounters.alongRoad([],0.5),null);

// No character is placed on an invented road: every interpolated point must
// lie exactly along a segment from the pre-existing OSM street graph.
const graph=roads.buildGraph(data.roads);
for(const from of ['igreja','rodoviaria']){
 const a=data.landmarks.find(p=>p.id===from).p;
 const b=data.landmarks.find(p=>p.id==='mercado').p;
 const route=graph.route(a,b);
 assert(route&&route.points.length>3,'an existing road route should connect these POIs');
 const points=route.points.slice(0,-1);
 for(const progress of [0,.17,.5,.83,1]){
  const at=encounters.alongRoad(points,progress);
  const onStreet=points.slice(1).some((v,i)=>{
   const p=points[i],dx=v.x-p.x,dy=v.y-p.y,t=Math.max(0,Math.min(1,((at.x-p.x)*dx+(at.y-p.y)*dy)/(dx*dx+dy*dy)));
   return Math.hypot(at.x-(p.x+dx*t),at.y-(p.y+dy*t))<.000001;
  });
  assert(onStreet,`travel ${from} at ${progress} must stay on OSM geometry`);
 }
}
const market=data.landmarks.find(p=>p.id==='mercado');
const sample=street.itinerary(graph,market.p,3,140);
const trio=[22,49,76].map(m=>street.sample(sample,m));
for(let i=1;i<trio.length;i++)assert(Math.hypot(trio[i].x-trio[i-1].x,trio[i].y-trio[i-1].y)>18,'enlarged sprites need separate street positions');

// V2.16 saves still restore unchanged; social event state is derived from the
// already-saved clock, not an incompatible new save field.
const legacy=world.restore({day:1,minute:10*60+50,people:{bia:{bond:3}}});
assert.equal(legacy.people.bia.bond,3);
assert.equal(encounters.current(legacy).id,'caderno-na-feira');
console.log('V2.17: three timed meetings, dialogue changes, wide OSM spacing, mapped travel, legacy clock save verified.');
