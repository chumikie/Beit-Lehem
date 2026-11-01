
/* Belém Viva V2.13 — fictional routines, conversations and neighbourly gestures. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.RoncadorLivingWorld = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  const DAYS = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const RESIDENTS = [
    {id:'damiao',name:'Seu Francisco',role:'Feirante fictício',likes:'conversa, comércio e café',hub:'mercado',icon:'🧺',tone:'#b47b5d',topic:'Como anda a feira?',reply:'A feira tem seu próprio ritmo. Gosto de ouvir as histórias de quem chega por aqui.'},
    {id:'lucia',name:'Dona Lúcia',role:'Vizinha fictícia',likes:'plantas, visitas e costura',hub:'igreja',icon:'🌷',tone:'#9a83af',topic:'Conversar sobre memórias',reply:'Eu gosto de guardar coisas pequenas: uma conversa, uma flor, uma tarde tranquila.'},
    {id:'bia',name:'Bia',role:'Jovem estudante fictícia',likes:'leitura, música e amizades',hub:'rodoviaria',icon:'📚',tone:'#d8a35c',topic:'Falar sobre sonhos',reply:'Às vezes viajar faz parte de aprender. Depois a gente volta cheio de novas histórias.'}
  ];
  const CARE = {
    damiao:[{id:'cestos',label:'🧺 Ajudar com os cestos',effect:'Um gesto simples tornou o trabalho mais leve. Francisco agradece e guarda uma fruta para o intervalo.',fatigue:-14,company:-9},{id:'historias',label:'☕ Ouvir histórias da feira',effect:'Entre uma conversa e outra, Francisco compartilha uma história inventada sobre os dias de feira.',fatigue:-5,company:-17},{id:'sombra',label:'🌤️ A sombra da feira',effect:'Vocês ajeitam um tecido ilustrativo para dar sombra aos cadernos da banca. Francisco conta como um gesto pequeno muda uma manhã.',fatigue:-9,company:-11}],
    lucia:[{id:'mudas',label:'🌿 Cuidar das mudinhas',effect:'Vocês ajeitam um pequeno vaso ilustrativo. Lúcia sorri ao ver as folhas se levantarem.',fatigue:-12,company:-10},{id:'lembrancas',label:'📮 Trocar uma lembrança',effect:'Lúcia conta por que guarda pequenas coisas no caderno: cada uma lembra alguém querido.',fatigue:-4,company:-18},{id:'sementes',label:'🌱 Sementes de histórias',effect:'Lúcia separa sementes imaginárias no caderno e pergunta qual lembrança mereceria um lugar no jardim.',fatigue:-8,company:-12}],
    bia:[{id:'caderno',label:'📚 Revisar o caderno',effect:'Bia encontra uma ideia nova depois de vocês organizarem juntos suas anotações.',fatigue:-12,company:-9},{id:'planos',label:'✨ Conversar sobre sonhos',effect:'Vocês desenham planos imaginários e concordam em contar mais novidades num próximo encontro.',fatigue:-4,company:-18},{id:'bilhetes',label:'✉️ Uma página de chegadas',effect:'Vocês organizam bilhetes em branco e Bia imagina que histórias poderão ser escritas neles quando alguém voltar.',fatigue:-7,company:-13}]
  };
  const DIALOGUES = {
    damiao:['Uma boa feira é feita das pessoas que chegam e dos encontros que ficam.','Hoje eu separo os cestos com calma. Cada conversa também faz parte do caminho.','Quando a rua acorda, eu gosto de escutar as novidades e oferecer um bom dia.'],
    lucia:['Tem planta que pede sombra, tem conversa que pede tempo. As duas merecem cuidado.','Meu caderno está cheio de memórias pequenas: um passeio, uma flor, um sorriso.','Uma vizinhança fica mais bonita quando alguém se lembra de perguntar como a gente está.'],
    bia:['Fiz uma lista de lugares que sonho conhecer. Também escrevi tudo o que gosto daqui.','O melhor de estudar é descobrir perguntas novas e depois dividir com alguém.','Ficar um pouco na rua ajuda a organizar as ideias antes de voltar aos livros.']
  };
  // Follow-ups depend only on already-saved care activity and day.
  // These are fictional neighbors, not quotations or accounts of real residents.
  const CARE_FOLLOW_UP={
    damiao:{
      cestos:'Os cestos que arrumamos ontem deixaram a banca pronta bem mais cedo. Obrigado pela força!',
      historias:'Ainda pensei naquela conversa de ontem. É bom ter quem escute com calma.',
      sombra:'O tecido que ajeitamos ajudou a deixar a banca mais acolhedora. Obrigado pela companhia!'
    },
    lucia:{
      mudas:'Olhe, a mudinha que cuidamos ontem parece mais viçosa. Cuidar junto faz diferença.',
      lembrancas:'Guardei com carinho o que conversamos ontem. Tem lembrança que floresce devagar.',
      sementes:'Voltei a olhar as sementes desenhadas no caderno. Algumas ideias precisam de tempo.'
    },
    bia:{
      caderno:'Revisei as anotações que organizamos ontem. Agora meus planos estão mais claros.',
      planos:'Fiquei pensando nos caminhos que imaginamos ontem. Já tenho outra ideia para contar!',
      bilhetes:'Separei uma página para os bilhetes que inventamos. Ainda há espaço para novas histórias.'
    }
  };
  // A neighbor may mention a recent kindness shown to someone else.
  // All accounts are original fictional dialogue, derived from existing save fields.
  const NEIGHBOR_FOLLOW_UP={
    damiao:[
      {friend:'lucia',kind:'mudas',text:'Lúcia me contou que você ajudou com a mudinha. É bom ver esse cuidado correndo pela cidade.'},
      {friend:'bia',kind:'caderno',text:'Bia disse que vocês organizaram o caderno dela. Esses planos merecem todo apoio.'}
    ],
    lucia:[
      {friend:'damiao',kind:'cestos',text:'Francisco comentou que você ajudou com os cestos. A feira fica mais bonita com essa atenção.'},
      {friend:'bia',kind:'planos',text:'Bia me falou dos planos que vocês imaginaram. É bonito ver alguém sonhar com carinho.'}
    ],
    bia:[
      {friend:'lucia',kind:'mudas',text:'Lúcia me contou da mudinha que vocês cuidaram. Queria desenhar como ela vai ficar.'},
      {friend:'damiao',kind:'historias',text:'Francisco disse que você parou para ouvir suas histórias. Também quero escutar uma delas.'}
    ]
  };
  function neighborFollowUp(s,id){
    return NEIGHBOR_FOLLOW_UP[id]?.find(({friend,kind})=>{
      const person=s.people?.[friend];
      return person?.lastCareKind===kind&&person.lastCareDay>0&&s.day-person.lastCareDay<=1;
    })?.text||null;
  }
  // Short, illustrated-album-ready diary captions; no new save fields.
  // They are fictional descriptions of player actions, not real local testimony.
  const CARE_DIARY={
    damiao:{
      cestos:'Na feira, você organizou os cestos com Francisco e deixou a passagem mais acolhedora.',
      historias:'Você parou para ouvir as histórias de Francisco, sem pressa de seguir caminho.',
      sombra:'Você ajudou Francisco a imaginar uma sombra acolhedora para os cadernos da banca.'
    },
    lucia:{
      mudas:'Perto da Matriz, você cuidou de uma pequena muda com Lúcia.',
      lembrancas:'Você e Lúcia dividiram uma lembrança tranquila, dessas que cabem no coração.',
      sementes:'Você e Lúcia imaginaram sementes e guardaram perguntas no caderno do jardim.'
    },
    bia:{
      caderno:'Na Rodoviária, você ajudou Bia a colocar suas anotações em ordem.',
      planos:'Você ouviu os sonhos de Bia e imaginou com ela caminhos para o futuro.',
      bilhetes:'Você e Bia organizaram bilhetes fictícios para futuras chegadas e despedidas.'
    }
  };
  const REUNION_DIARY={
    damiao:'Francisco se lembrou de uma gentileza sua. Uma conversa de ontem virou amizade hoje.',
    lucia:'Lúcia retomou um cuidado compartilhado. Pequenas coisas continuam crescendo entre amigos.',
    bia:'Bia lembrou de algo que vocês fizeram juntos. Até os planos guardam memórias.'
  };
  const CARE_TODAY={
    damiao:'Obrigado pela companhia de hoje! Depois a gente continua a conversa perto da banca.',
    lucia:'Gostei de cuidar dessas pequenas coisas com você hoje. Vamos ver como ficam amanhã?',
    bia:'Essa conversa me ajudou a colocar as ideias no papel. Depois te conto o que descobri!'
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
  // Weekly changes are deterministic fictional routines, not real local schedules.
  // Keep the opening week stable and let scheduled community encounters take priority.
  function weeklyVariation(s,id){
    const week=Math.floor((s.day-1)/7),weekday=(s.day-1)%7,hour=s.minute/60;
    if(week===0)return null;
    if(id==='damiao'&&week%3===1&&weekday===1&&hour>=10&&hour<11)
      return{present:false,hub:null,activity:'descansando em casa depois dos preparativos da feira'};
    return null;
  }
  function weeklyReunion(s){
    const week=Math.floor((s.day-1)/7),weekday=(s.day-1)%7;
    if(week===0)return null;
    const visit=week%2===1&&weekday===2
      ?{id:'lucia-visita-bia',host:'bia',visitor:'lucia',from:'igreja',to:'rodoviaria',start:16*60+45,summary:'Lúcia passou para conversar com Bia sobre caminhos e lembranças.'}
      :week%3===2&&weekday===3
      ?{id:'bia-visita-lucia',host:'lucia',visitor:'bia',from:'rodoviaria',to:'igreja',start:10*60+55,summary:'Bia visitou Lúcia para trocar ideias para o caderno.'}:null;
    if(!visit)return null;
    const elapsed=s.minute-visit.start;
    if(elapsed<0||elapsed>=55)return null;
    return {...visit,day:s.day,phase:elapsed<15?'approach':elapsed<40?'visit':'return'};
  }
  function weeklyVisitAgenda(s,id){
    const scene=weeklyReunion(s);
    if(!scene||![scene.host,scene.visitor].includes(id))return null;
    const visitor=id===scene.visitor,meeting=scene.phase==='visit';
    return {present:true,hub:visitor&&scene.phase==='return'?scene.from:scene.to,
      activity:meeting?'conversando com '+(id==='bia'?'Lúcia':'Bia'):visitor?scene.phase==='approach'?'a caminho de visitar uma amiga':'voltando da visita':'esperando a visita de uma amiga',
      reunion:scene,meeting};
  }
  // Uma visita curta por semana, sempre entre pontos conhecidos da malha.
  // Encontros comunitários e visitas de capítulos anteriores mantêm prioridade.
  const SMALL_WALKS=[
    {id:'bia-jardim',visitor:'bia',host:'lucia',from:'rodoviaria',to:'igreja',weekday:1,start:15*60+35,title:'Bia passa para dar notícias a Lúcia'},
    {id:'damiao-caderno',visitor:'damiao',host:'bia',from:'mercado',to:'rodoviaria',weekday:3,start:16*60+10,title:'Francisco visita Bia por alguns instantes'},
    {id:'lucia-feira',visitor:'lucia',host:'damiao',from:'igreja',to:'mercado',weekday:5,start:10*60+15,title:'Lúcia passa na feira para cumprimentar Francisco'}
  ];
  function smallWalkForDay(day){
    if(!Number.isInteger(day)||day<8)return null;
    const week=Math.floor((day-1)/7),def=SMALL_WALKS[(week-1)%SMALL_WALKS.length];
    return(day-1)%7===def.weekday?{...def,day}:null;
  }
  function smallWalkAt(s){
    const def=smallWalkForDay(s?.day);if(!def)return null;
    const elapsed=s.minute-def.start;if(elapsed<0||elapsed>=48)return null;
    return{...def,phase:elapsed<14?'approach':elapsed<33?'visit':'return',progress:elapsed<14?elapsed/14:elapsed<33?1:1-(elapsed-33)/15};
  }
  function smallWalkAgenda(s,id){
    const scene=smallWalkAt(s);if(!scene||![scene.visitor,scene.host].includes(id))return null;
    const visitor=id===scene.visitor,meeting=scene.phase==='visit';
    return{present:true,hub:visitor&&scene.phase==='return'?scene.from:scene.to,
      activity:meeting?'conversando com '+RESIDENTS.find(r=>r.id===(visitor?scene.host:scene.visitor)).name:visitor?scene.phase==='approach'?'seguindo para uma visita curta':'voltando à rotina':'recebendo uma visita breve',
      meeting,travel:visitor&&!meeting,smallWalk:scene};
  }
  function smallWalkOccurred(day){
    const event=smallWalkForDay(day);if(!event)return null;
    const s={day,minute:event.start+20};
    // Important: a prior community scene can cancel this optional outing.
    if(agenda(s,event.visitor).smallWalk?.id!==event.id||agenda(s,event.host).smallWalk?.id!==event.id)return null;
    return event;
  }
  function lastWeekRoutine(s,id){
    const lastWeek=Math.floor((s.day-1)/7)-1;
    if(lastWeek<1)return '';
    if(id==='damiao'&&lastWeek%3===1)return'Na semana passada, tirei uma manhã para descansar depois da feira. Voltei mais disposto a conversar.';
    if(id==='lucia'&&lastWeek%2===1)return'Na semana passada, passei pela Rodoviária para visitar Bia. Uma boa conversa também faz parte do cuidado.';
    if(id==='bia'&&lastWeek%3===2)return'Na semana passada, fui até a região da Matriz conversar com Lúcia. Voltei com mais perguntas para o caderno.';
    return '';
  }
  // Morning is an ordinary part of the existing mapped walking route, not a
  // simulated trip from a real home or an assertion about working hours.
  function morningDeparture(s,id){
    if(!s||s.minute<8*60||s.minute>=9*60)return null;
    const phase=(s.minute-8*60)/60;
    const activities={
      damiao:'chegando aos cestos e cumprimentando os conhecidos',
      lucia:'começando a manhã perto do jardim',
      bia:'chegando com o caderno e observando os caminhos'
    };
    if(!Object.hasOwn(activities,id))return null;
    return{activity:activities[id],shift:Math.sin(Math.PI*phase)*11};
  }
  function agenda(s,id){
    const hour=s.minute/60,weekday=(s.day-1)%7;
    if(hour<8||hour>=20)return{present:false,activity:'descansando em casa',hub:null};
    // Encounter itineraries are deterministic fiction based on the in-game day.
    // Each visit reuses the OSM graph and never implies a real resident schedule.
    const community=typeof window!=='undefined'&&window.RoncadorStreetCommunity?.agenda(s,id);
    if(community)return community;
    const encounter=typeof window!=='undefined'&&window.RoncadorStreetEncounters?.agenda(s,id);
    if(encounter)return encounter;
    const reunion=weeklyVisitAgenda(s,id);
    if(reunion)return reunion;
    const littleVisit=smallWalkAgenda(s,id);
    if(littleVisit)return littleVisit;
    const variation=weeklyVariation(s,id);
    if(variation)return variation;
    if(typeof window==='undefined'&&weekday===4&&hour>=16.5&&hour<17)
      return{present:true,hub:'mercado',activity:'encontrando amigos na feira',meeting:true};
    if(id==='damiao')return hour<13||hour>=16&&hour<18?{present:true,hub:'mercado',activity:morningDeparture(s,id)?.activity||(weekday===0?'organizando a feira':'conversando no mercado')}:{present:false,hub:null,activity:'fazendo uma pausa e almoçando'};
    // Fictional half-past-eight start keeps the Matriz chapter accessible just
    // after the Mercado morning; it does not claim a real local resident schedule.
    if(id==='lucia')return hour>=8.5&&hour<12||hour>=15&&hour<17?{present:true,hub:'igreja',activity:morningDeparture(s,id)?.activity||(hour<12?'observando os jardins':'trocando histórias e cuidando das flores')}:{present:false,hub:null,activity:'em casa, entre plantas e costuras'};
    if(id==='bia')return hour>=8&&hour<11||hour>=15&&hour<19?{present:true,hub:'rodoviaria',activity:morningDeparture(s,id)?.activity||(hour<11?'lendo enquanto espera':'estudando e planejando novos caminhos')}:{present:false,hub:null,activity:'em casa, lendo e fazendo uma pausa'};
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
    const yesterday=n.lastCareDay===s.day-1&&CARE_FOLLOW_UP[id]?.[n.lastCareKind];
    const today=n.lastCareDay===s.day&&n.lastCareKind;
    const neighbor=firstToday?neighborFollowUp(s,id):null;
    const text=firstToday
      ?(yesterday||neighbor||choices[(s.day+Math.max(0,n.bond)-2)%choices.length])
      :(today?CARE_TODAY[id]:'Que bom rever você! Ainda lembro da nossa conversa de hoje.');
    if(firstToday&&(yesterday||neighbor)){
      s.notes[0].text=yesterday?REUNION_DIARY[id]:
        'Um gesto seu chegou a outra pessoa: '+p.name+' comentou uma gentileza feita a um amigo.';
    }
    return{friendship:n.bond,newMemory:firstToday,text};
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
    s.notes.unshift({day:s.day,text:CARE_DIARY[id]?.[kind]||'Um gesto de cuidado com um amigo.'});
    s.notes=s.notes.slice(0,12);
    return{ok:true,text:choice.effect,progress:careProgress(s)};
  }
  function careProgress(s){return RESIDENTS.filter(person=>Number(s?.people?.[person.id]?.careCount)>0).length;}
  return{DAYS,RESIDENTS,CARE,fresh,restore,label,isMarketMorning,weeklyVariation,weeklyReunion,weeklyVisitAgenda,smallWalkForDay,smallWalkAt,smallWalkAgenda,smallWalkOccurred,lastWeekRoutine,morningDeparture,agenda,mood,advance,tomorrow,event,talk,care,careProgress};
});

