const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','gemini-modules','game.js'),'utf8');
const definitions=source.slice(source.indexOf('const SEASONAL_THEMES='),source.indexOf('let seasonalMemories=[];'));
const functions=source.slice(source.indexOf('function activeSeasonalTheme('),source.indexOf('function worldMomentAt('));
const {themes,activeSeasonalTheme,restoreSeasonalMemories,seasonalEncounter}=new Function(definitions+functions+';return {themes:SEASONAL_THEMES,activeSeasonalTheme,restoreSeasonalMemories,seasonalEncounter};')();

test('catálogo contém somente os doze nomes originais e não inventa calendários futuros',()=>{
 assert.deepEqual(Object.values(themes).map(theme=>theme.name),[
  'Natal','Ano Novo','Verão','Valentine','Outono','Sakura','Inverno','Tanabata','Primavera','Halloween','Dia das Crianças','Aniversário do BRS48'
 ]);
 for(const [id,theme] of Object.entries(themes))if(id!=='halloween')assert.deepEqual(theme.months,[],id);
});

test('Halloween funciona na virada de outubro para novembro, com data local',()=>{
 assert.equal(activeSeasonalTheme(new Date(2026,9,25)),'halloween');
 assert.equal(activeSeasonalTheme(new Date(2026,9,31)),'halloween');
 assert.equal(activeSeasonalTheme(new Date(2026,10,1)),'halloween');
 assert.equal(activeSeasonalTheme(new Date(2026,10,3)),'halloween');
 assert.equal(activeSeasonalTheme(new Date(2026,10,4)),null);
 assert.equal(activeSeasonalTheme(new Date(2026,11,24)),null);
 assert.equal(activeSeasonalTheme(new Date(2026,11,31)),null);
 assert.equal(activeSeasonalTheme(new Date('invalid')),null);
});

test('um encontro só existe se os dois personagens estiverem presentes e a memória o sustentar',()=>{
 const near=[{id:'damiao',x:0,y:0,walking:false},{id:'cica',x:12,y:5,walking:false}];
 const position={x:4,y:3};
 assert.match(seasonalEncounter('mercado',near,position,{marketClaimed:true,cicaKnown:true}),/Francisco e Ciça/);
 assert.equal(seasonalEncounter('mercado',near,position,{marketClaimed:false,cicaKnown:true}),null);
 assert.equal(seasonalEncounter('mercado',[near[0]],position,{marketClaimed:true,cicaKnown:true}),null);
 assert.equal(seasonalEncounter('mercado',[near[0],{...near[1],walking:true}],position,{marketClaimed:true,cicaKnown:true}),null);
 assert.equal(seasonalEncounter('mercado',[near[0],{...near[1],x:75}],position,{marketClaimed:true,cicaKnown:true}),null);
 assert.equal(seasonalEncounter('rodoviaria',[{id:'bia',x:0,y:0},{id:'teo',x:10,y:0}],position,{letterClaimed:false,recadosClaimed:true}),null);
});

test('salvamento elimina registros sazonais duplicados, futuros ou inventados',()=>{
 const good={theme:'halloween',place:'mercado',kind:'friends',day:3,year:2026};
 assert.deepEqual(restoreSeasonalMemories(undefined,5,2026),[]);
 assert.deepEqual(restoreSeasonalMemories([good,good,{...good,year:2027},{...good,day:9},{...good,theme:'unknown'}],5,2026),[good]);
 assert.match(source,/seasonalMemories=restoreSeasonalMemories\(saved\.seasonalMemories,living\.day/);
 assert.match(source,/observeWeeklyVisit\(\);observeSmallWalk\(\);observeSeasonalEncounter\(\)/);
});
