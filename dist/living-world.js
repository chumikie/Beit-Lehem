/* Belém Viva V2.13 — fictional routines, conversations and neighbourly gestures. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.RoncadorLivingWorld = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const DAYS = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const RESIDENTS = [
    {id:'damiao',name:'Seu Damião',role:'Feirante fictício',likes:'conversa, comércio e café',hub:'mercado',icon:'🧺',tone:'#b47b5d',topic:'Como anda a feira?',reply:'A feira tem seu próprio ritmo. Gosto de ouvir as histórias de quem chega por aqui.'},
    {id:'lucia',name:'Dona Lúcia',role:'Vizinha fictícia',likes:'plantas, visitas e costura',hub:'igreja',icon:'🌷',tone:'#9a83af',topic:'Conversar sobre memórias',reply:'Eu gosto de guardar coisas pequenas: uma conversa, uma flor, uma tarde tranquila.'},
    {id:'bia',name:'Bia',role:'Jovem estudante fictícia',likes:'leitura, música e amizades',hub:'rodoviaria',icon:'📚',tone:'#d8a35c',topic:'Falar sobre sonhos',reply:'Às vezes viajar faz parte de aprender. Depois a gente volta cheio de novas histórias.'}
  ];
  const CARE = {
    damiao:[{id:'cestos',label:'🧺 Ajudar com os cestos',effect:'Um gesto simples tornou o trabalho mais leve. Damião agradece e guarda uma fruta para o intervalo.',fatigue:-14,company:-9},{id:'historias',label:'☕ Ouvir histórias da feira',effect:'Entre uma conversa e outra, Damião compartilha uma história inventada sobre os dias de feira.',fatigue:-5,company:-17}],
    lucia:[{id:'mudas',label:'🌿 Cuidar das mudinhas',effect:'Vocês ajeitam um pequeno vaso ilustrativo. Lúcia sorri ao ver as folhas se levantarem.',fatigue:-12,company:-10},{id:'lembrancas',label:'📮 Trocar uma lembrança',effect:'Lúcia conta por que guarda pequenas coisas no caderno: cada uma lembra alguém querido.',fatigue:-4,company:-18}],
    bia:[{id:'caderno',label:'📚 Revisar o caderno',effect:'Bia encontra uma ideia nova depois de vocês organizarem juntos suas anotações.',fatigue:-12,company:-9},{id:'planos',label:'✨ Conversar sobre sonhos',effect:'Vocês desenham planos imaginários e concordam em contar mais novidades num próximo encontro.',fatigue:-4,company:-18}]
  };
  const DIALOGUES = {
    damiao:['Uma boa feira é feita das pessoas que chegam e dos encontros que ficam.','Hoje eu separo os cestos com calma. Cada conversa também faz parte do caminho.','Quando a rua acorda, eu gosto de escutar as novidades e oferecer um bom dia.'],
    lucia:['Tem planta que pede sombra, tem conversa que pede tempo. As duas merecem cuidado.','Meu caderno está cheio de memórias pequenas: um passeio, uma flor, um sorriso.','Uma vizinhança fica mais bonita quando alguém se lembra de perguntar como a gente está.'],
    bia:['Fiz uma lista de lugares que sonho conhecer. Também escrevi tudo o que gosto daqui.','O melhor de estudar é descobrir perguntas novas e depois dividir com alguém.','Ficar um pouco na rua ajuda a organizar as ideias antes de voltar aos livros.']
  };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  function fresh() {
    return {day:1,minute:8*60+30,people:Object.fromEntries(RESIDENTS.map(p=>[p.id,{bond:0,hunger:24,fatigue:18,company:32,lastConversationDay:0,lastMealSlot:'',lastCareDay:0,careCount:0,lastCareKind:''}])),notes:[]};
  }
  function restore(raw) {
    const s=fresh();if(!raw||typeof raw!=='object')return s;
    s.day=clamp(Math.floor(Number(raw.day)||1),1,9999);
    s.minute=clamp(Math.floor(Number(raw.minute)||0),0,1439);
    if(raw.people&&typeof raw.people==='object')for(const p of RESIDENTS){
      const old=raw.people[p.id];if(!old||typeof old!=='object')continue;
      for(const key of ['bond','hunger','fatigue','company'])if(Number.isFinite(old[key]))s.people[p.id][key]=clamp(old[key],0,key==='bond'?4:100);
      if(Number.isInteger(old.lastConversationDay))s.people[p.id].lastConversationDay=clamp(old.lastConversationDay,0,s.day);
      if(typeof old.lastMealSlot==='string'&&old.lastMealSlot.length<32)s.people[p.id].lastMealSlot=old.lastMealSlot;
      if(Number.isInteger(old.lastCareDay))s.people[p.id].lastCareDay=clamp(old.lastCareDay,0,s.day);
      if(Number.isInteger(old.careCount))s.people[p.id].careCount=clamp(old.careCount,0,9999);
      if(typeof old.lastCareKind==='string'&&CARE[p.id].some(option=>option.id===old.lastCareKind))s.people[p.id].lastCareKind=old.lastCareKind;
    }
    if(Array.isArray(raw.notes))s.notes=raw.notes.slice(0,12).filter(n=>n&&typeof n.text==='string'&&n.text.length<=160&&Number.isInteger(n.day)&&n.day>=1&&n.day<=s.day).map(n=>({text:n.text,day:n.day}));
    return s;
  }
  function label(s){const minute=Math.floor(s.minute);return 'Dia '+s.day+' · '+DAYS[(s.day-1)%7]+' · '+String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');}
  // Fictional vignette inspired by the documented traditional Monday market.
  // Do not interpret this interval as the city's real operating hours in 2026.
  function isMarketMorning(s){return (s.day-1)%7===0&&s.minute>=7*60&&s.minute<14*60;}
  function agenda(s,id){
    const hour=s.minute/60,weekday=(s.day-1)%7;
    if(hour<8||hour>=20)return{present:false,activity:'descansando em casa',hub:null};
    // Encounter itineraries are deterministic fiction based on the in-game day.
    // Each visit reuses the OSM graph and never implies a real resident schedule.
    const community=typeof window!=='undefined'&&window.RoncadorStreetCommunity?.agenda(s,id);
    if(community)return community;
    const encounter=typeof window!=='undefined'&&window.RoncadorStreetEncounters?.agenda(s,id);
    if(encounter)return encounter;
    if(typeof window==='undefined'&&weekday===4&&hour>=16.5&&hour<17)
      return{present:true,hub:'mercado',activity:'encontrando amigos na feira',meeting:true};
    if(id==='damiao')return hour<13||hour>=16&&hour<18?{present:true,hub:'mercado',activity:weekday===0?'organizando a feira':'conversando no mercado'}:{present:false,hub:null,activity:'fazendo uma pausa e almoçando'};
    // Fictional half-past-eight start keeps the Matriz chapter accessible just
    // after the Mercado morning; it does not claim a real local resident schedule.
    if(id==='lucia')return hour>=8.5&&hour<12||hour>=15&&hour<17?{present:true,hub:'igreja',activity:hour<12?'observando os jardins':'trocando histórias e cuidando das flores'}:{present:false,hub:null,activity:'em casa, entre plantas e costuras'};
    if(id==='bia')return hour>=8&&hour<11||hour>=15&&hour<19?{present:true,hub:'rodoviaria',activity:hour<11?'lendo enquanto espera':'estudando e planejando novos caminhos'}:{present:false,hub:null,activity:'em casa, lendo e fazendo uma pausa'};
    return{present:false,hub:null,activity:'em sua rotina'};
  }
  function mood(s,id){
    const n=s.people[id];
    if(n.fatigue>75)return'😴 cansado';
    if(n.hunger>70)return'🍲 com fome';
    if(n.company>68)return'💬 querendo companhia';
    if(n.bond>=3)return'✨ muito amigo';
    return'🌿 tranquilo';
  }
  function advance(s,minutes){
    if(!Number.isFinite(minutes)||minutes<=0)return s;
    let remaining=Math.min(minutes,43200);
    while(remaining>0){
      const step=Math.min(remaining,1440-s.minute,10),oldMinute=s.minute;
      for(const p of RESIDENTS){
        const n=s.people[p.id],asleep=oldMinute<8*60||oldMinute>=20*60;
        n.hunger=clamp(n.hunger+step*(asleep?.018:.045),0,100);
        n.company=clamp(n.company+step*(asleep?-.025:.026),0,100);
        n.fatigue=clamp(n.fatigue+step*(asleep?-.13:.045),0,100);
        const atLunch=oldMinute>=12*60&&oldMinute<14*60;
        const atDinner=oldMinute>=18*60&&oldMinute<20*60;
        const slot=atLunch?'almoço':atDinner?'jantar':null;
        if(slot&&n.hunger>42&&n.lastMealSlot!==s.day+slot){n.hunger=clamp(n.hunger-42,0,100);n.lastMealSlot=s.day+slot;}
      }
      s.minute+=step;remaining-=step;
      if(s.minute>=1440){s.minute=0;s.day++;}
    }
    s.minute=Math.round(s.minute*1000)/1000;
    return s;
  }
  function tomorrow(s){const remaining=1440-s.minute+8*60+30;return advance(s,remaining);}
  function event(s){
    const day=(s.day-1)%7;
    return [
      'Segunda de encontros na feira — cena narrativa, não horário oficial.',
      'Terça de conversas e pequenas descobertas.',
      'Quarta de visitas e lembranças compartilhadas.',
      'Quinta de flores, histórias e trabalho tranquilo.',
      'Sexta de ensaios e boas ideias entre amigos.',
      'Sábado de música e um fim de tarde acolhedor.',
      'Domingo de descanso e cuidado com a casa.'
    ][day];
  }
  function talk(s,id){
    const p=RESIDENTS.find(p=>p.id===id);if(!p)return null;
    const n=s.people[id],firstToday=n.lastConversationDay!==s.day;
    if(firstToday){n.lastConversationDay=s.day;n.bond=clamp(n.bond+1,0,4);n.company=clamp(n.company-25,0,100);s.notes.unshift({day:s.day,text:'Você conversou com '+p.name+' sobre '+p.likes+'.'});s.notes=s.notes.slice(0,12);}
    const choices=DIALOGUES[id];
    return{friendship:n.bond,newMemory:firstToday,text:firstToday?choices[(s.day+Math.max(0,n.bond)-2)%choices.length]:'Que bom rever você! Ainda lembro da nossa conversa de hoje.'};
  }
  function care(s,id,kind){
    if(!s?.people?.[id]||!CARE[id])return{ok:false,text:'Encontro não encontrado.'};
    const choice=CARE[id].find(option=>option.id===kind);
    if(!choice)return{ok:false,text:'Escolha um gesto possível.'};
    if(!agenda(s,id).present)return{ok:false,text:'Esse morador está em outra atividade agora.'};
    const person=s.people[id];
    if(person.lastCareDay===s.day)return{ok:false,text:'Vocês já compartilharam um cuidado hoje. Amanhã haverá novas histórias.'};
    person.lastCareDay=s.day;person.lastCareKind=kind;person.careCount=clamp(person.careCount+1,0,9999);
    person.fatigue=clamp(person.fatigue+choice.fatigue,0,100);
    person.company=clamp(person.company+choice.company,0,100);
    s.notes.unshift({day:s.day,text:'Um gesto com '+RESIDENTS.find(p=>p.id===id).name+': '+choice.label.replace(/^[^\p{L}]+/u,'')+'.'});
    s.notes=s.notes.slice(0,12);
    return{ok:true,text:choice.effect,progress:careProgress(s)};
  }
  function careProgress(s){return RESIDENTS.filter(person=>Number(s?.people?.[person.id]?.careCount)>0).length;}
  return{DAYS,RESIDENTS,CARE,fresh,restore,label,isMarketMorning,agenda,mood,advance,tomorrow,event,talk,care,careProgress};
});
