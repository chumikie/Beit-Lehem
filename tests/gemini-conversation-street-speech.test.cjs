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
 assert.match(meeting,/until:0,pending:true/);
 assert.match(source,/\$\('lifeDialog'\)\.addEventListener\('close',[\s\S]*?streetConversation\.until=performance\.now\(\)\+6000/);
 assert.match(street,/!streetConversation\.pending&&performance\.now\(\)<streetConversation\.until/);
 assert.match(street,/person\.streetSpeech=streetConversation\.text/);
 assert.match(street,/speechOverlays\.push\(drawTalk\)/);
 assert.match(street,/speechWidth=Math\.min\(132,Math\.max\(50,view\.right-view\.left-12\)\)/);
 assert.match(street,/if\(speechActive&&speaker&&Math\.abs\(label\.x-speechX\)/);
 assert.match(street,/if\(!person\.streetSpeech&&zoom>=1\.3/);
 assert.match(street,/if\(!person\.streetSpeech&&zoom>=1\.2/);
 assert.doesNotMatch(meeting,/save\([^)]*streetSpeech/);
});
