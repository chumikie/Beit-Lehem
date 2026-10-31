
/* V2.21. Fictional affectionate responses derived from already-saved progress.
   No new save fields, real resident claims, or extracted interview dialogue. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RoncadorAffectionMemory=api;})(typeof window==='undefined'?null:window,function(){
 'use strict';
 const PROTAGONISTS=['damiao','lucia','bia'];
 const NAMES={damiao:'Damião',lucia:'Lúcia',bia:'Bia',cica:'Ciça',nara:'Nara',teo:'Téo',rosa:'Rosa',zeca:'Zeca',mila:'Mila'};
 const DEFAULT={damiao:['Hoje a banca acordou tranquila.','Uma conversa deixa o trabalho mais leve.'],lucia:['As folhas ficam mais bonitas quando a gente observa com calma.','Cada visita traz uma memória nova.'],bia:['Entre páginas e caminhos, há sempre coisa para descobrir.','Quero conhecer o mundo sem esquecer de onde saí.'],cica:['Estou separando as cores mais alegres de hoje.','Toda fita pode guardar um carinho.'],nara:['Meu caderninho já tem mais uma janela.','A sombra da tarde muda meu desenho.'],teo:['Uma boa notícia merece viajar de mão em mão.','As cartas sempre encontram quem se lembra delas.'],rosa:['Gosto de observar quem passa e ouvir novidades.','Uma conversa tranquila muda a cor da tarde.'],zeca:['As folhas me ensinam a ter paciência.','Depois da sombra, sempre encontro um cantinho verde.'],mila:['Hoje encontrei uma cor nova no caminho.','À tarde, gosto de desenhar o que vi pela cidade.']};
 // Permanent keepsakes are derived from existing quest completion flags.
 // Unlike the 12 recent diary notes, these achievements cannot scroll away.
 const KEEPSAKES=Object.freeze([
  {id:'manha-mercado',title:'Uma manhã de mãos dadas com a feira',icon:'🧺',caption:'Você ajudou Damião a preparar a banca, e a manhã ganhou outra história.',earned:s=>s?.marketMorning?.claimed===true},
  {id:'muda-matriz',title:'A flor que ficou na memória',icon:'🌱',caption:'Um cuidado partilhado com Lúcia perto da Matriz.',earned:s=>s?.luciaGarden?.claimed===true},
  {id:'carta-caminhos',title:'Uma carta para os caminhos',icon:'✉️',caption:'Você e Bia escreveram sobre saudade, planos e o que fica.',earned:s=>s?.biaLetters?.claimed===true},
  {id:'fitas-feira',title:'Fitas de bom-dia',icon:'🎀',caption:'Ciça e Damião dividiram um pequeno gesto de acolhimento.',earned:s=>s?.communitySeen?.includes('fitas-de-bom-dia')===true},
  {id:'desenho-jardim',title:'Uma folha desenhada',icon:'🎨',caption:'Uma lembrança de Nara e Lúcia encontrou lugar no caderno.',earned:s=>s?.communitySeen?.includes('memorias-do-jardim')===true},
  {id:'caderno-bia-nara',title:'Desenhos para os caminhos',icon:'📖',caption:'Nara desenhou uma janela ou paisagem inspirada na carta de Bia.',earned:s=>s?.biaLetters?.claimed===true&&['janela-bia','paisagem-bia'].includes(s?.sideNeighbors?.choices?.nara)},
  {id:'zeca-lucia',title:'Uma muda entre vizinhos',icon:'🪴',caption:'Zeca ouviu a história da muda cuidada com Lúcia.',earned:s=>s?.luciaGarden?.claimed===true&&s?.sideNeighbors?.choices?.zeca==='muda-lucia'},
  {id:'mila-cores',title:'Fitas, janelas e cores',icon:'🎨',caption:'Mila uniu ideias de Ciça e Nara num desenho imaginado.',earned:s=>s?.sideNeighbors?.choices?.mila==='amigas'},
  {id:'bilhete-volta',title:'Um bilhete de volta',icon:'💌',caption:'O recado de Bia e Téo ganhou um caminho de volta.',earned:s=>s?.communitySeen?.includes('bilhete-de-volta')===true}
 ]);
 function collection(raw){
  return KEEPSAKES.filter(item=>item.earned(raw)).map(({id,title,icon,caption})=>({id,title,icon,caption}));
 }
 function collectionProgress(raw){
  return{earned:collection(raw).length,total:KEEPSAKES.length};
 }
 function snapshot(raw,id){
  const clock=raw?.living||{day:1,minute:510},person=clock.people?.[id]||{};
  const seen=Array.isArray(raw?.communitySeen)?raw.communitySeen:[];
  const neighbors=raw?.sideNeighbors||{};
  const bond=Math.max(0,Math.min(4,Number(person.bond)||0));
  const close=PROTAGONISTS.includes(id)?bond>=2:Array.isArray(neighbors.seen)&&neighbors.seen.includes(id);
  const known=token=>seen.includes(token);
  let memory=null;
  switch(id){
   case 'damiao':
    if(known('recado-da-feira'))memory=['Guardei o bilhete de Téo junto das anotações da feira.','o recado de Téo','joy'];
    else if(raw?.marketMorning?.claimed&&neighbors.choices?.cica==='banca')memory=['Ciça me mostrou a fita que vocês prepararam para a banca. Guardei o laço com carinho!','o laço preparado com Ciça','joy'];
    else if(known('fitas-de-bom-dia'))memory=['Olhe a fita de Ciça no meu cesto! Ainda me lembra aquela manhã.','a fita da feira','joy'];
    else if(raw?.marketMorning?.claimed)memory=['Ainda lembro como você me ajudou com os cestos e as frutas.','a manhã de trabalho juntos','warm'];
    break;
   case 'lucia':
    if(known('memorias-do-jardim'))memory=['Nara desenhou a folhinha que eu mostrei. Agora tenho duas lembranças do mesmo jardim.','o desenho de Nara','joy'];
    else if(raw?.luciaGarden?.claimed)memory=['A mudinha que cuidamos ficou guardada aqui, junto da nossa conversa.','a muda que cuidamos','warm'];
    break;
   case 'bia':
    if(raw?.biaLetters?.claimed&&['janela-bia','paisagem-bia'].includes(neighbors.choices?.nara))memory=['Nara desenhou uma página para nossa carta. Agora ela tem um desenho para lembrar.','o desenho de Nara na carta','joy'];
    else if(known('bilhete-de-volta'))memory=['Téo prometeu guardar meu bilhete até a próxima volta.','o bilhete de Téo','joy'];
    else if(known('caderno-compartilhado'))memory=['Nara desenhou uma janela na página em que escrevi meus planos.','o desenho de Nara','joy'];
    else if(raw?.biaLetters?.claimed)memory=['Voltei a ler a carta que escrevemos. A saudade cabe inteira numa página.','a carta que escrevemos','warm'];
    break;
   case 'cica':
    if(neighbors.choices?.cica==='banca'&&raw?.marketMorning?.claimed)memory=['Separei uma fita para a banca de Damião. Aquela ajuda de vocês merecia um laço!','a fita da banca','joy'];
    else if(raw?.marketMorning?.claimed&&raw?.marketWitnessed)memory=[known('fitas-de-bom-dia')?'Meu laço e a arrumação de vocês deixaram a banca uma graça!':'Vi como você e Damião ajeitaram a banca. Ficou uma graça!','a banca que arrumaram','warm'];
    else if(known('fitas-de-bom-dia'))memory=['Damião sorriu quando viu o laço. Acho que escolhi a cor certa!','o laço de Damião','joy'];
    else if(neighbors.choices?.cica==='fitas')memory=['Lembra como organizamos as fitas? Ainda separo as cores daquele jeito.','as fitas que arrumamos','warm'];
    else if(neighbors.choices?.cica==='cores')memory=['Ainda guardo a dupla de cores que escolhemos.','as cores que escolhemos','warm'];
    break;
   case 'nara':
    if(raw?.biaLetters?.claimed&&neighbors.choices?.nara==='janela-bia')memory=['A janela que desenhamos para Bia ainda está aberta naquela página.','a janela da carta de Bia','joy'];
    else if(raw?.biaLetters?.claimed&&neighbors.choices?.nara==='paisagem-bia')memory=['Guardei o horizonte que pintamos para os planos de Bia.','a paisagem da carta de Bia','joy'];
    else if(known('memorias-do-jardim'))memory=['Meu desenho da folhinha de Lúcia ficou na página mais bonita.','o desenho das folhas','joy'];
    else if(known('caderno-compartilhado'))memory=['Bia escreveu uma frase ao lado da janela que desenhei.','o caderno compartilhado','joy'];
    else if(neighbors.choices?.nara)memory=['Abri o caderno bem na página que desenhamos juntos.','nosso primeiro desenho','warm'];
    break;
   case 'rosa':
    if(neighbors.choices?.rosa==='prosa')memory=['Nossa conversa tranquila ainda me acompanha pelo caminho.','a pausa para conversar','warm'];
    else if(neighbors.choices?.rosa==='caderno')memory=['Guardei no caderno a frase que escrevemos durante o passeio.','a frase do caderno','joy'];
    else if(raw?.marketMorning?.claimed)memory=['Soube da ajuda que você deu a Damião na feira. Uma manhã assim rende boa conversa!','a ajuda na feira','warm'];
    break;
   case 'zeca':
    if(raw?.luciaGarden?.claimed&&neighbors.choices?.zeca==='muda-lucia')memory=['Ainda lembro da muda que você cuidou com Lúcia. Uma história boa para compartilhar.','a muda de Lúcia','joy'];
    else if(neighbors.choices?.zeca==='vasos')memory=['Aquele papo sobre vasos me fez olhar melhor para as folhas.','a conversa sobre os vasos','warm'];
    else if(neighbors.choices?.zeca==='sementes')memory=['Ainda lembro da nossa dica de jardim.','o papo sobre sementes','warm'];
    else if(raw?.luciaGarden?.claimed)memory=['Lúcia me contou da muda que vocês cuidaram. Dá gosto saber que ela tem companhia!','o cuidado com a muda','warm'];
    break;
   case 'mila':
    if(neighbors.choices?.mila==='amigas')memory=['Guardei a ideia de misturar fitas de Ciça e desenhos de Nara.','as cores das amigas','joy'];
    else if(neighbors.choices?.mila==='cores')memory=['A faixa de cor que escolhemos ainda está no meu caderno.','a cor do caderno','warm'];
    else if(neighbors.choices?.mila==='tecidos')memory=['Ainda estou pensando nas estampas que imaginamos.','as estampas do passeio','warm'];
    else if(neighbors.choices?.cica==='banca')memory=['Ciça mostrou a ideia da fita para Damião. Agora quero desenhar uma igualzinha no meu caderno!','a fita da banca','joy'];
    else if(['janela-bia','paisagem-bia'].includes(neighbors.choices?.nara))memory=['Nara me contou do desenho que fez para a carta de Bia. Que ideia bonita!','o desenho na carta','warm'];
    break;
   case 'teo':
    if(known('bilhete-de-volta'))memory=['O bilhete de Bia está protegido no meu envelope de capa azul.','a carta de Bia','joy'];
    else if(known('recado-da-feira'))memory=['Damião pediu que eu levasse outro abraço quando voltasse.','o recado da feira','joy'];
    else if(neighbors.choices?.teo)memory=['Ainda guardo o recadinho gentil que escrevemos.','o primeiro bilhete','warm'];
    break;
   default:return null;
  }
  const morning=clock.minute<12*60;
  const fallback=DEFAULT[id]?.[morning?0:1]||'Que bom encontrar você.';
  const friendly=close?{
   damiao:'Que bom rever você! Já parece gente de casa.',lucia:'Suas visitas sempre dão um respiro ao meu dia.',bia:'Quando você chega, tenho vontade de contar todos os meus planos.',
   cica:'Olha quem voltou para escolher cores comigo!',nara:'Você já sabe onde guardo meus melhores desenhos.',teo:'Eu sabia que você voltaria para ouvir novidades!',rosa:'Que bom que voltou! Guardei uma boa conversa para hoje.',zeca:'Voltou para ver as plantas? Que bom ter companhia.',mila:'Olha quem chegou! Tenho outra ideia de desenho.'
  }[id]:null;
  const line=memory?.[0]||friendly||fallback;
  const mood=Number(person.fatigue)>75?'sleepy':memory?.[2]||((close||bond>=1)?'warm':'curious');
  return {id,name:NAMES[id],line,short:memory?.[1]||friendly||null,expression:mood,remembered:!!memory,close,kind:memory?.[1]||null};
 }
 function appendSocialKeepsakes(grid,raw,doc){
  if(!grid||!doc?.createElement)return 0;
  let added=0;
  for(const memory of collection(raw).filter(item=>!['manha-mercado','muda-matriz','carta-caminhos'].includes(item.id))){
   if(grid.querySelector?.('[data-keepake="'+memory.id+'"]'))continue;
   const article=doc.createElement('article');article.className='album-card community-keepsake';
   article.setAttribute('data-keepake',memory.id);
   const thumbnail=doc.createElement('div');thumbnail.className='fair-memory-thumbnail';
   thumbnail.textContent=memory.icon;thumbnail.setAttribute('aria-label','Lembrança ilustrativa: '+memory.title);
   const content=doc.createElement('div');content.className='album-card-content';
   const title=doc.createElement('strong');title.textContent=memory.title;
   const caption=doc.createElement('span');caption.textContent=memory.caption;
   content.append(title,caption);article.append(thumbnail,content);grid.append(article);added++;
  }
  return added;
 }
 return{snapshot,collection,collectionProgress,appendSocialKeepsakes};
});

