const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const moto=require('../gemini-modules/moto-experimental.js');
const game=fs.readFileSync(path.join(__dirname,'..','gemini-modules/game.js'),'utf8');
const crowd=fs.readFileSync(path.join(__dirname,'..','gemini-modules/crowd-flow.js'),'utf8');

test('Padaria da Tia tem pão francês, pão doce de coco, bolo e rosquinha',()=>{
 assert.deepEqual(moto.BAKERY_GOODS.map(item=>item.name),['pão francês','pão doce de coco','bolo caseiro','rosquinha']);
 for(let count=0;count<8;count++)assert.equal(moto.nextBakeryGood({sordasGifted:count}),moto.BAKERY_GOODS[count%4]);
});

test('migração mantém saldo e presentes das partidas antigas sem repetir prêmios',()=>{
 const before={sordas:7,sordasGifted:5,riding:false,skin:'brejo'};
 const after=moto.restore(before);
 assert.equal(after.sordas,7);
 assert.equal(after.sordasGifted,5);
 assert.equal(after.skin,'brejo');
 assert.equal(moto.nextBakeryGood(after).name,'pão doce de coco');
});

test('cestinhas antigas não são apresentadas como endereço confirmado da padaria',()=>{
 assert.equal(moto.SORDA_SPOTS.length,2);
 assert.ok(moto.SORDA_SPOTS.every(item=>/ilustrativo/.test(item.name)));
 assert.match(game,/Padaria da Tia · pães e doces ilustrativos/);
 assert.match(game,/localização não foi confirmada/);
 assert.match(crowd,/pão francês.*pão doce de coco/);
});

test('rótulos culinários e presentes agora mencionam Padaria da Tia',()=>{
 for(const fragment of ['Pães da Tia','Presentear ','Padaria da Tia','pães e doces'])assert.ok(game.includes(fragment),fragment);
 assert.doesNotMatch(game,/fillText\('🍪 Sorda Quentinha'/);
 assert.doesNotMatch(game,/Dar Sorda Quentinha/);
});
