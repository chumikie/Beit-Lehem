const assert = require('node:assert/strict');
const world = require('../dist/living-world.js');

const s = world.fresh();
assert.equal(world.RESIDENTS.length, 3);
assert.equal(world.label(s), 'Dia 1 · segunda-feira · 08:30');
assert.equal(world.isMarketMorning(s),true);
assert.equal(world.agenda(s, 'damiao').hub, 'mercado');
assert.equal(world.agenda(s, 'bia').hub, 'rodoviaria');
assert.equal(world.agenda(s, 'lucia').hub, 'igreja');

const first = world.talk(s, 'damiao');
assert.equal(first.newMemory, true);
assert.equal(s.people.damiao.bond, 1);
assert.equal(s.notes.length, 1);
assert.equal(world.talk(s, 'damiao').newMemory, false, 'one friendship reward per day');
assert.equal(s.people.damiao.bond, 1);
const gesture=world.care(s,'damiao','cestos');
assert.equal(gesture.ok,true);
assert.equal(s.people.damiao.careCount,1);
assert.equal(world.care(s,'damiao','historias').ok,false,'only one gesture per person per day');
assert.equal(world.careProgress(s),1);
const awayFromChurch=world.fresh();world.advance(awayFromChurch,4*60);
assert.equal(world.care(awayFromChurch,'lucia','mudas').ok,false,'must be present in the fictional schedule');
const kindnessDay=world.fresh();
assert.equal(world.care(kindnessDay,'damiao','historias').ok,true);
world.advance(kindnessDay,70);
assert.equal(world.care(kindnessDay,'lucia','mudas').ok,true);
assert.equal(world.care(kindnessDay,'bia','caderno').ok,true);
assert.equal(world.careProgress(kindnessDay),3,'one kindness with each resident yields the souvenir');
const remembered=world.restore(JSON.parse(JSON.stringify(kindnessDay)));
assert.equal(world.careProgress(remembered),3,'kindness reward persists after reload');

world.advance(s, 160);
assert.equal(world.agenda(s, 'lucia').hub, 'igreja');
assert.equal(world.agenda(s, 'damiao').hub, 'mercado');
assert.equal(world.agenda(s, 'bia').present, false);
assert(s.people.damiao.hunger >= 0 && s.people.damiao.hunger <= 100);
assert(s.people.damiao.fatigue >= 0 && s.people.damiao.fatigue <= 100);
world.tomorrow(s);
assert.equal(s.day, 2);
assert.equal(world.label(s), 'Dia 2 · terça-feira · 08:30');
assert.equal(world.talk(s, 'damiao').newMemory, true, 'social bonds can grow on a new day');
assert.equal(s.people.damiao.bond, 2);
assert.equal(world.care(s,'damiao','historias').ok,true,'a second day permits another gesture');
assert.equal(s.people.damiao.careCount,2);

const roundTrip = world.restore(JSON.parse(JSON.stringify(s)));
assert.equal(roundTrip.day, 2);
assert.equal(roundTrip.people.damiao.bond, 2);
assert.equal(roundTrip.people.damiao.lastCareDay,2);
assert.equal(roundTrip.people.damiao.careCount,2);
assert.equal(roundTrip.notes.length,4);
assert.equal(world.restore(null).day, 1, 'old V2.5 saves without social state migrate');

const bad = world.restore({day:Infinity,minute:-100,people:{bia:{bond:100,hunger:-9,fatigue:999,company:Infinity}},notes:[{text:'x'.repeat(200),day:1}]});
assert.equal(bad.minute, 0);
assert.equal(bad.people.bia.bond, 4);
assert.equal(bad.people.bia.hunger, 0);
assert.equal(bad.people.bia.fatigue, 100);
assert.equal(bad.notes.length, 0);
assert.equal(world.care(bad,'bia','fake').ok,false);

const late = world.fresh();world.advance(late, 14*60);
assert.equal(world.agenda(late, 'damiao').present, false);
assert.equal(world.agenda(late, 'lucia').present, false);
assert.equal(world.agenda(late, 'bia').present, false);

console.log('Vida em Belém: daily routines, moods, bonds, meals, rest, persistence and V2 save migration verified.');
