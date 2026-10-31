// DOM simulation only: no claim of browser rendering or layout coverage.
const assert=require('node:assert/strict');
const scene=require('../dist/market-scene'),market=require('../dist/market-morning');
let focus=null,frames=[],draws=[];
function element(){const classes=new Set();return{children:[],style:{},dataset:{},disabled:false,attrs:{},classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k)},setAttribute(k,v){this.attrs[k]=v;},appendChild(b){this.children.push(b);},focus(){if(!this.disabled)focus=this;},querySelector(){return this.icon||(this.icon={});}};}
const ids=Object.fromEntries(['scene','trayGrid','clothA','clothB','fruitLayer','fruitCount','marketScenePerson'].map(id=>[id,element()]));
const toldo=element(),cestos=element();toldo.dataset.work='toldo';cestos.dataset.work='cestos';const tasks=[toldo,cestos];
const handlers={};const root={getElementById:id=>ids[id],querySelectorAll:()=>tasks,querySelector:()=>tasks.find(t=>!t.disabled),addEventListener:(k,fn)=>handlers[k]=fn};
global.document={createElement:element};global.matchMedia=()=>({matches:false});global.requestAnimationFrame=fn=>{frames.push(fn);return frames.length;};global.cancelAnimationFrame=()=>{frames=[];};
let state=market.fresh(),slots=scene.restore(null),allowed=false,line='',finish=element();
const ui=scene.create({attachShadow:()=>root},{state:()=>state,slots:()=>slots,canUse:()=>allowed,finishButton:finish,message:t=>line=t,drawPerson:(c,p)=>draws.push(p),task:id=>market.doWork(state,id),change:next=>{slots=next;if(scene.complete(slots))market.doWork(state,'frutas');ui.sync();}});
ui.sync();const tray=ids.trayGrid.children,spaces=ids.scene.children;
assert.equal(spaces.length,6);assert.equal(tray.length,6);
tray[0].onclick();assert.equal(slots.filter(Boolean).length,0,'closed or unavailable activity cannot change');
market.meet(state);allowed=true;ui.sync();
tray[0].onclick();assert.equal(focus,spaces[0],'choosing a fruit focuses an empty destination');
let prevented=false;handlers.keydown({key:'Escape',preventDefault(){prevented=true;},stopPropagation(){}});assert(prevented);spaces[0].onclick();assert.equal(slots[0],null,'Escape cancels the selection');
for(let i=0;i<6;i++){tray[i].onclick();spaces[i].onclick();}
assert(scene.complete(slots));assert(state.work.includes('frutas'));
assert.equal(focus,toldo,'after fruit activity focus moves to an unfinished task');
toldo.onclick();cestos.onclick();ui.sync();assert(market.ready(state));
assert(market.claim(state));ui.sync();assert(tray.every(b=>b.disabled)&&spaces.every(b=>b.disabled),'claimed activity is read-only');
const saved=JSON.stringify({state,slots});ui.close();ui.sync();assert.equal(JSON.stringify({state,slots}),saved,'closing does not lose work');
ui.react();assert(frames.length);frames.shift()(performance.now()+2500);assert.equal(draws.at(-1).wave,false,'wave returns to resting pose');assert.equal(frames.length,0,'wave does not animate forever');
global.matchMedia=()=>({matches:true});ui.react();assert.equal(frames.length,0,'reduced motion starts no loop');assert.equal(draws.at(-1).wave,false);
ui.close();delete global.document;delete global.matchMedia;delete global.requestAnimationFrame;delete global.cancelAnimationFrame;
console.log('Market view simulation: action guards, focus, Escape, completion, retained work, finite wave and reduced motion verified');
