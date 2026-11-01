'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const code=source.slice(source.indexOf('function revisitedLandscapeLine('),source.indexOf('function observe(){'));
const revisitedLandscapeLine=new Function(code+';return revisitedLandscapeLine;')();

test('paisagem já registrada identifica rua real próxima sem criar nova descoberta',()=>{
 const road={d:12,s:{road:{tags:{name:'Rua Feliciano Pedrosa'}}}};
 const line=revisitedLandscapeLine(road,1);
 assert.match(line,/Rua Feliciano Pedrosa/);
 assert.match(line,/já está no diário/);
 assert.doesNotMatch(line,/recompensa|novo selo|concluído/i);
 assert.equal(JSON.stringify(road),JSON.stringify({d:12,s:{road:{tags:{name:'Rua Feliciano Pedrosa'}}}}));
});

test('sem nome validado não inventa rua e roteiro completo não exige mais objetivos',()=>{
 for(const road of [null,{d:38,s:{road:{tags:{name:'Rua distante'}}}},{d:4,s:{road:{tags:{}}}}]){
  assert.doesNotMatch(revisitedLandscapeLine(road,3),/Rua distante|undefined|null/);
  assert.match(revisitedLandscapeLine(road,3),/siga passeando no seu ritmo/);
 }
 assert.match(source,/if\(observations\.has\(key\)\)\{notify\(revisitedLandscapeLine\(nearestRoad\(player\.x,player\.y\),observations\.size\)\);return;\}/);
});
