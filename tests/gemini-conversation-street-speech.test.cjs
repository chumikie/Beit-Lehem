'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function meetResident(id){');
const end=source.indexOf('function talkResident(id){',start);
const meeting=source.slice(start,end);
const street=source.slice(source.indexOf('function drawStreetLife('),source.indexOf('let boltMarketRoad=',source.indexOf('function drawStreetLife(')));

test('conversa separa a fala dos desdobramentos e conserva 24 notas',()=>{
 assert.match(meeting,/const talkLine=def\.name/);
 assert.match(meeting,/\\n\\n✦ /);
 assert.doesNotMatch(meeting,/living\.notes\.slice\(0,12\)/);
 assert.equal((meeting.match(/living\.notes\.slice\(0,24\)/g)||[]).length,2);
});

test('balão temporário acompanha o morador por seis segundos sem persistir no save',()=>{
 assert.match(meeting,/streetPerson\.streetSpeech=talkLine/);
 assert.match(meeting,/performance\.now\(\)\+6000/);
 assert.match(street,/person\.streetSpeech=streetConversation\.text/);
 assert.match(street,/speechOverlays\.push\(drawTalk\)/);
 assert.doesNotMatch(meeting,/save\([^)]*streetSpeech/);
});
