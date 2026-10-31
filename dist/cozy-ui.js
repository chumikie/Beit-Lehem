/* Static Cozy V2 interface additions, inserted before game.js initializes. */
(function () {
  'use strict';
  if (!document.getElementById('cozy-inline-style')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'cozy.css';
    document.head.append(stylesheet);
  }
  document.title = 'Beit Lehem · V2.27 Cozy';
  document.querySelector('.brand-sub').textContent = 'Lehem';
  document.querySelector('.edition').textContent = '☼ BEIT LEHEM · V2.27';
  document.querySelector('.welcome h1').innerHTML = 'Belém tem histórias<br>para viver.';
  document.querySelector('.welcome p').textContent = 'Em Belém, as ruas têm histórias, encontros e pequenos rituais. Caminhe no seu ritmo, conheça os moradores e guarde lembranças desse cantinho do Brejo.';
  document.querySelector('.welcome-eyebrow').textContent = '☼ UM NOVO DIA EM BELÉM';
  document.querySelector('.welcome-note').textContent = '6 selos para encontrar · 1 nova amizade para começar';
  document.querySelector('.field-note p').textContent = 'Ruas: OpenStreetMap/IBGE. Fachadas e jardins são ilustrações, não contornos reais. Os moradores e a Estação Roncador são ficcionais.';
  document.querySelector('.map-attribution').textContent = '© OpenStreetMap · limite IBGE 2025 · cenário ilustrativo';
  document.querySelector('.map-legend').insertAdjacentHTML('beforeend', '<span id="geologyLegend" hidden>◇ Observações SGB</span>');
  document.querySelector('#helpDialog > p').textContent = 'Encontre os seis selos, converse com Lia e registre três paisagens. Você escolhe o ritmo e a ordem das descobertas.';
  document.querySelector('#helpDialog details p').textContent = 'Base Belém 2026: 462 trechos de vias, 86 nomes diferentes e 9 pontos nomeados do OpenStreetMap, recortados pela malha municipal IBGE 2025. A cobertura depende da comunidade OSM: não garante todas as ruas nem acessibilidade. Casas, Lia e Estação Roncador são ilustrativas. Não use o jogo para navegação ou visitação real.';
  document.querySelector('#helpDialog .help-list').insertAdjacentHTML('beforeend', `
    <li><kbd>F</kbd><span>Registrar uma paisagem no diário</span></li>
    <li><kbd>E perto de Lia</kbd><span>Conversar e desenvolver a amizade</span></li>
    <li><kbd>B</kbd><span>Ver ruas e referências reais de Belém</span></li>
    <li><kbd>V</kbd><span>Visitar o caderno vivo do Brejo</span></li>
    <li><kbd>E perto de um lugar</kbd><span>Abrir uma cena cultural e guardar uma memória</span></li>
    <li><kbd>Sidebar</kbd><span>Preparar um São Pedro imaginado e mudar a luz da paisagem</span></li>
    <li><kbd>Vida em Belém</kbd><span>Conhecer moradores, acompanhar rotinas e passar para outro dia</span></li>
    <li><kbd>E perto de moradores</kbd><span>Conversar com personagens que caminham nas ruas</span></li>
    <li><kbd>☀ Céu do jogo</kbd><span>Experimentar sol, nuvens e chuvisco imaginários. A chuva pode regar seu canteiro</span></li>
    <li><kbd>♡ Três amizades</kbd><span>Converse em dias diferentes com Damião, Lúcia e Bia para guardar uma lembrança de vizinhança</span></li>
    <li><kbd>☼ Cenas do dia</kbd><span>Visite Mercado, Rodoviária e Igreja em períodos do jogo para guardar um álbum de três momentos fictícios</span></li>
    <li><kbd>♧ Flora OSM</kbd><span>Ative uma camada vegetal decorativa restrita aos polígonos verdes registrados na base cartográfica</span></li>
    <li><kbd>▦ Quadras</kbd><span>Compare fotos históricas com os acabamentos ilustrados em três trechos do centro</span></li>
    <li><kbd>♥ Gestos</kbd><span>Converse e escolha uma pequena ajuda diária para Damião, Lúcia ou Bia</span></li>
    <li><kbd>🧺 Mercado</kbd><span>Conheça Damião, arrume três detalhes ilustrativos da banca e guarde uma lembrança de manhã</span></li>
    <li><kbd>🌷 Matriz</kbd><span>Depois da manhã com Damião, ajude Lúcia a preparar uma muda ilustrativa e escolha a memória que ficará no álbum</span></li>
    <li><kbd>📚 Rodoviária</kbd><span>Depois de Lúcia, conheça Bia, abra um caderno, escolha uma carta e guarde sua mensagem no álbum</span></li>
    <li><kbd>Vizinhos</kbd><span>Conheça Ciça, Nara e Téo nos caminhos do Mercado, Matriz e Rodoviária. Acompanhe o horário fictício e ajude uma vez por dia.</span></li>
    <li><kbd>Quadras</kbd><span>Abra o Ateliê, visite os trechos da Matriz, Feira e João Pessoa e desenhe um detalhe artístico de cada um para o álbum.</span></li>
    <li><kbd>Celular</kbd><span>Toque no chão para caminhar ou use as setas. Use Explorar para conversar e Passaporte para abrir o diário.</span></li>
    <li><kbd>Atlas SGB</kbd><span>Consultar pontos geológicos documentados, sem rotas turísticas</span></li>
  `);

  document.querySelector('.topbar nav').insertAdjacentHTML('beforeend', `
    <button id="realCity" class="real-city-button" type="button" title="Ver ruas e locais reais de Belém no mapa e no Google">◈ <span>Belém real</span></button>
    <button id="centralBlocks" class="real-city-button block-button" type="button" title="Explorar as três quadras centrais ilustradas, comparar referências e marcar trajetos">▦ <span>Quadras</span></button>
    <button id="sceneryToggle" class="real-city-button scene-toggle" type="button" aria-pressed="true" title="Alternar as ilustrações de igrejas, mercado, praça e rodoviária no mapa">⌂ <span>Cenários</span></button>
    <button id="natureAtlas" class="real-city-button" type="button" title="Abrir o canteiro e as paisagens do Brejo">♧ <span>Vida no Brejo</span></button>
    <button id="observe" class="cozy-observe" type="button" title="Registrar uma paisagem no diário (F)" aria-label="Registrar uma paisagem no diário">✿ <span>Observar</span></button>
    <a class="download-html" href="./Trilhas-do-Roncador-Cozy-V2-27.html" download="Trilhas-do-Roncador-Cozy-V2-27.html" title="Baixar V2.27 inteira em HTML" aria-label="Baixar V2.27 em HTML para jogar offline">↓ <span>HTML</span></a>
  `);

  // The same tools stay accessible on phones, without squeezing seven buttons
  // into the navigation strip or removing any V2 action.
  const navigation=document.querySelector('.topbar nav');
  const pocket=document.createElement('details');pocket.className='nav-pocket';
  pocket.innerHTML='<summary aria-label="Mais ferramentas de exploração">☷ <span>Mais</span></summary><div class="nav-pocket-body"></div>';
  navigation.append(pocket);
  for(const control of ['realCity','centralBlocks','sceneryToggle','natureAtlas'])pocket.querySelector('.nav-pocket-body').append(document.getElementById(control));
  pocket.querySelector('.nav-pocket-body').append(document.querySelector('.download-html'));
  const smallNavigation=window.matchMedia('(max-width:800px)');
  const syncNavigation=()=>{pocket.open=!smallNavigation.matches;};
  syncNavigation();smallNavigation.addEventListener('change',syncNavigation);
  pocket.querySelectorAll('button,a').forEach(control=>control.addEventListener('click',()=>{if(smallNavigation.matches)pocket.open=false;}));
  document.addEventListener('pointerdown',event=>{if(smallNavigation.matches&&pocket.open&&!pocket.contains(event.target))pocket.open=false;});

  document.querySelector('.progress-block').insertAdjacentHTML('afterend', `
    <section class="chapter-card" aria-label="Missão especial de amizade">
      <div class="chapter-card-top"><span>🌼 CAPÍTULO 01</span><span class="chapter-type">HISTÓRIA COZY</span></div>
      <h3>Um caderno de novos encontros</h3>
      <p id="chapterTask">Encontre Lia perto do começo da expedição.</p>
      <div class="friendship"><span aria-hidden="true">♥</span><strong>Lia, sua nova amiga</strong><small id="friendshipLevel">0/3 ♥</small></div>
      <div class="friendship-track"><span id="friendshipBar"></span></div>
      <div class="observation-row"><span>✿ Diário de paisagens</span><strong id="observationCount">0/3</strong></div>
      <p class="activity-help">Use o botão Observar quando encontrar um lugar bonito.</p>
      <div class="observation-row"><span>◈ Memórias culturais</span><strong id="cultureCount">0/3</strong></div>
      <button id="openAlbum" type="button" class="album-open">◫ Abrir álbum de lembranças</button>
    </section>
    <section class="festival-card" aria-label="Capítulo de preparação do São Pedro">
      <span class="festival-eyebrow">✦ CAPÍTULO EXTRA · CULTURA VIVA</span>
      <h3>Nosso São Pedro</h3>
      <p>Um encontro <strong>ficcional</strong> para celebrar as memórias encontradas pelo caminho.</p>
      <div class="festival-card-progress"><span id="festivalCardProgress">0/3 preparativos</span><span id="festivalCardIcon">♡</span></div>
      <div class="festival-track"><span id="festivalBar"></span></div>
      <button id="openFestival" class="festival-open" type="button">Preparar o encontro <span>↗</span></button>
    </section>
    <section class="ambience-card" aria-label="Luz ilustrativa da paisagem">
      <span>☀ Luz da paisagem</span>
      <button id="lightButton" type="button" title="Alternar luz fictícia: manhã, tarde e anoitecer">Manhã →</button>
    </section>
    <section class="life-card" aria-label="Moradores e rotina fictícia da cidade">
      <div class="life-card-top"><span>☼ PELAS RUAS DE BELÉM</span><span>FICÇÃO COZY</span></div>
      <h3>Gente que tem histórias</h3>
      <strong id="lifeClock">Dia 1 · segunda-feira · 08:30</strong>
      <p id="fairStatus" class="life-fair-status">✿ Na segunda do jogo, a feira ganha vida.</p>
      <div class="life-cast" aria-label="Moradores do jogo">
        <span id="castDamiao" title="Seu Damião">🧺<small>Damião</small></span>
        <span id="castLucia" title="Dona Lúcia">🌷<small>Lúcia</small></span>
        <span id="castBia" title="Bia">📚<small>Bia</small></span>
      </div>
      <div id="streetEncounter" class="street-encounter-teaser" aria-live="polite">
        <span id="streetEncounterIcon" class="street-encounter-icon" aria-hidden="true">🌷</span>
        <div><strong id="streetEncounterTitle">Uma visita está a caminho</strong><small id="streetEncounterLine">Os encontros surgem conforme o calendário do jogo.</small></div>
      </div>
      <div class="neighbor-preview"><span>♡ Roda de vizinhança</span><strong id="neighborCount">0/3 amizades</strong></div>
      <div class="care-preview"><span>✿ Pequenas gentilezas</span><strong id="carePreview">0/3 gestos</strong></div>
      <div class="side-preview"><span>🧵 Vizinhos de passagem</span><strong id="sideProgress">0/3 conhecidos</strong></div>
      <div class="moment-teaser"><div><span>☼ UM DIA PELAS RUAS</span><strong id="momentProgress">0/3 cenas</strong></div><p id="momentNow">Manhã de encontros no Mercado</p><button id="momentAction" type="button">Encontrar esta cena <span>↗</span></button></div>
      <p id="lifeBrief">Enquanto você explora, os moradores fazem seus próprios planos.</p>
      <button id="openLife" type="button" class="life-open">Abrir caderno dos moradores <span>↗</span></button>
    </section>
    <section id="biaChapter" class="market-chapter-card bia-chapter-card" aria-label="Capítulo guiado: Bia e uma carta na Rodoviária" hidden>
      <div class="market-chapter-heading"><span>📚 CAMINHOS DA RODOVIÁRIA</span><span>03 · CARTAS</span></div>
      <h3>Uma carta com Bia</h3>
      <p id="biaChapterDescription">Depois do jardim de Lúcia, procure Bia perto da Rodoviária para ouvir uma história.</p>
      <div class="market-chapter-track"><i id="biaChapterBar"></i></div>
      <div class="market-chapter-progress"><strong id="biaChapterProgress">0/3 momentos</strong><span id="biaChapterClock">No ritmo dos caminhos</span></div>
      <ol class="market-chapter-steps"><li id="biaArriveStep">○ Chegar à Rodoviária</li><li id="biaTalkStep">○ Conversar sobre ir e voltar</li><li id="biaLetterStep">○ Escrever e selar uma carta</li></ol>
      <button id="biaChapterAction" class="market-chapter-action" type="button">Encontrar Bia ↗</button>
      <small>A Rodoviária é um ponto do mapa OSM. Bia, o caderno, os horários e a carta são ficção.</small>
    </section>
    <section id="luciaChapter" class="market-chapter-card lucia-chapter-card" aria-label="Capítulo guiado: Dona Lúcia e as memórias da Matriz" hidden>
      <div class="market-chapter-heading"><span>🌷 CAMINHOS DA MATRIZ</span><span>02 · MEMÓRIAS</span></div>
      <h3>O jardim de Dona Lúcia</h3>
      <p id="luciaChapterDescription">Depois de ajudar Damião, siga pelas ruas até a Matriz e conheça Lúcia.</p>
      <div class="market-chapter-track"><i id="luciaChapterBar"></i></div>
      <div class="market-chapter-progress"><strong id="luciaChapterProgress">0/3 momentos</strong><span id="luciaChapterClock">Uma visita no seu ritmo</span></div>
      <ol class="market-chapter-steps"><li id="luciaArriveStep">○ Chegar à Matriz</li><li id="luciaTalkStep">○ Ouvir uma memória de Lúcia</li><li id="luciaGardenStep">○ Cuidar de uma muda juntos</li></ol>
      <button id="luciaChapterAction" class="market-chapter-action" type="button">Encontrar Dona Lúcia ↗</button>
      <small>O caminho usa o ponto da Igreja no OSM; o vaso, a muda e a história são ficcionais, não um jardim cadastrado.</small>
    </section>
    <section id="marketChapter" class="market-chapter-card" aria-label="Capítulo guiado: a manhã de Damião no Mercado">
      <div class="market-chapter-heading"><span>🧺 CAPÍTULO DO MERCADO</span><span>01 · MANHÃ</span></div>
      <h3>A manhã de Damião</h3>
      <p id="marketChapterDescription">Siga as ruas até o Mercado e descubra quem está preparando a feira.</p>
      <div class="market-chapter-track"><i id="marketChapterBar"></i></div>
      <div class="market-chapter-progress"><strong id="marketChapterProgress">0/3 momentos</strong><span id="marketChapterClock">Segunda · manhã imaginada</span></div>
      <ol class="market-chapter-steps"><li id="marketArriveStep">○ Chegar ao entorno da feira</li><li id="marketTalkStep">○ Conversar com Damião</li><li id="marketWorkStep">○ Preparar a banca juntos</li></ol>
      <button id="marketChapterAction" class="market-chapter-action" type="button">Começar o passeio ↗</button>
      <p id="marketStreetResult" class="market-street-result" hidden></p>
      <button id="marketReturnStreet" class="market-chapter-action" type="button" hidden>⌖ Rever nossa banca na rua</button>
      <small>Os pontos das ruas vêm do OSM. Damião, bancas e tarefas são ficcionais; não indicam vendedores ou horários reais.</small>
    </section>
    <section id="fairQuestCard" class="fair-quest-card" aria-label="Missão cozy opcional da cesta de histórias">
      <div class="fair-quest-eyebrow"><span>🧺 CAPÍTULO 02</span><span>MISSÃO COZY</span></div>
      <h3>A cesta das pequenas histórias</h3>
      <p>Ajude a guardar três lembranças de uma manhã de feira inventada em Belém.</p>
      <div class="fair-quest-track"><i id="fairQuestBar"></i></div>
      <div id="fairQuestProgress" class="fair-quest-progress">0/3 pequenos cuidados</div>
      <ol class="fair-quest-steps">
        <li id="fairQuestDamiao">♡ Conversar com Seu Damião</li>
        <li id="fairQuestMercado">◇ Guardar uma memória do Mercado</li>
        <li id="fairQuestColheita">✿ Fazer uma colheita no canteiro</li>
      </ol>
      <button id="fairQuestAction" type="button" class="fair-quest-action">Encontrar Seu Damião <span>↗</span></button>
      <small class="fair-quest-legend">Personagens, objetivo e recompensa são ficcionais.</small>
    </section>
    <section class="geology-card" aria-label="Atlas geológico documental da cidade">
      <span>◇ APA & BELÉM REAL · SGB</span>
      <h3>Rochas com GPS verificado</h3>
      <p>14 observações pontuais do SGB em Belém/PB. Sem inventar lagos, montanhas ou acessos.</p>
      <button id="geologyAtlas" type="button" class="geology-open">Abrir atlas geológico <span>↗</span></button>
    </section>
  `);

  // The expedition itself is the main content. Keep all older features but
  // group optional chapters into one accessible, expandable field notebook.
  const aside=document.getElementById('sidebar');
  const routes=aside.querySelector('.route-heading');
  aside.insertBefore(aside.querySelector('#marketChapter'),routes);
  aside.insertBefore(aside.querySelector('#luciaChapter'),aside.querySelector('#marketChapter'));
  aside.insertBefore(aside.querySelector('#biaChapter'),aside.querySelector('#luciaChapter'));
  aside.insertBefore(aside.querySelector('.life-card'),routes);
  const extras=document.createElement('details');extras.className='extras-cabinet';
  extras.innerHTML='<summary><span>✿ Outros cantinhos do diário</span><small>Cesta antiga · amizade · São Pedro · geologia</small></summary><div class="extras-cabinet-body"></div>';
  aside.insertBefore(extras,aside.querySelector('.field-note'));
  for(const cls of ['.fair-quest-card','.chapter-card','.festival-card','.ambience-card','.geology-card'])extras.querySelector('.extras-cabinet-body').append(aside.querySelector(cls));

  document.querySelector('.game').insertAdjacentHTML('beforeend', `
    <div id="cozyGuideHint" class="cozy-guide-hint" hidden>✿ Lia está por perto · <kbd>E</kbd> conversar</div>
    <div id="sceneryNote" class="scenery-note">⌂ Fachadas e praça ilustrativas · posições aproximadas</div>
    <button id="skyMood" class="sky-mood" type="button" aria-label="Mudar o céu fictício do jogo" title="Alternar sol, nuvens e chuvisco — apenas uma simulação">☀ Sol manso ↻</button>
    <button id="fairDayNote" class="fair-day-note" type="button">🧺 A manhã de Damião · começar →</button>
    <button id="streetPulse" class="street-pulse" type="button" title="Abrir o caderno com as rotinas dos moradores fictícios">
      <span class="street-pulse-label"><i aria-hidden="true"></i> CIDADE VIVA · HISTÓRIA FICCIONAL</span>
      <strong id="streetResidentsCount">Moradores passeando</strong>
      <span id="streetResidentsHint">Pequenos encontros pelas ruas</span>
      <small id="streetMomentHint">☼ Manhã, tarde e entardecer</small>
      <span class="street-pulse-avatars" aria-hidden="true">🧺 🌷 📚 <b>🧵</b></span>
    </button>
    <div id="memoryFlash" class="memory-flash" aria-hidden="true"></div>
  `);

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="secondaryDialog" class="secondary-dialog" aria-labelledby="secondaryName">
      <button class="dialog-close" data-close="secondaryDialog" aria-label="Fechar conversa">×</button>
      <span class="eyebrow">✿ UM VIZINHO PELO CAMINHO · PERSONAGEM FICTÍCIO</span>
      <div class="side-dialog-intro"><div id="secondaryPortrait" class="side-portrait"></div><div><h2 id="secondaryName">Uma conversa de rua</h2><small id="secondaryRole"></small><p id="secondaryActivity"></p></div></div>
      <p id="secondaryLine" class="side-conversation" aria-live="polite">Uma nova história espera por você.</p>
      <div id="secondaryChoices" class="side-choices" aria-label="Escolher pequena gentileza"></div>
      <p id="secondaryStatus" class="side-status"></p>
      <button class="secondary full" data-close="secondaryDialog">Continuar o passeio ♡</button>
    </dialog>
    <dialog id="guideDialog" class="guide-dialog" aria-labelledby="guideTitle">
      <button class="dialog-close" data-close="guideDialog" aria-label="Fechar conversa">×</button>
      <div class="guide-portrait" aria-hidden="true"><span>✿</span><div class="guide-face">☺</div></div>
      <span class="eyebrow">UMA AMIZADE COMEÇA ASSIM</span>
      <h2 id="guideTitle">Lia, a exploradora</h2>
      <p id="guideMessage">Que bom encontrar você por aqui!</p>
      <div class="guide-friendship" aria-live="polite"><span>♥</span><span id="guideHearts">♡ ♡ ♡</span><span>Amizade</span></div>
      <button class="primary full" data-close="guideDialog">Até logo, Lia! ↗</button>
    </dialog>
    <dialog id="albumDialog" class="album-dialog" aria-labelledby="albumTitle">
      <button class="dialog-close" data-close="albumDialog" aria-label="Fechar álbum">×</button>
      <span class="eyebrow">SEU DIÁRIO DE CAMPO</span>
      <h2 id="albumTitle">Pequenas memórias do Roncador</h2>
      <p>Cada paisagem observada vira um cartão guardado aqui. Volte ao mundo para encontrar as outras.</p>
      <div id="albumGrid" class="album-grid"></div>
      <button class="primary full" data-close="albumDialog">Voltar à expedição ↗</button>
    </dialog>
    <dialog id="realCityDialog" class="real-city-dialog" aria-labelledby="realCityTitle">
      <button class="dialog-close" data-close="realCityDialog" aria-label="Fechar guia real de Belém">×</button>
      <span class="eyebrow">◈ BELÉM/PB DE VERDADE</span>
      <h2 id="realCityTitle">Um passeio entre o jogo e a cidade</h2>
      <p id="realCityStats">Preparando referências reais da cidade…</p>
      <div class="real-city-current"><strong>Onde você está no jogo</strong><span id="realCityCurrent">Belém, Paraíba</span><div class="real-city-actions"><a id="currentMaps" href="https://www.google.com/maps/search/?api=1&amp;query=Bel%C3%A9m%2C%20Para%C3%ADba" target="_blank" rel="noopener noreferrer">Ver no Google Maps ↗</a><a id="currentStreetView" href="https://www.google.com/maps/" target="_blank" rel="noopener noreferrer">Street View, se houver ↗</a></div></div>
      <h3>Referências mapeadas em Belém</h3>
      <div id="realCityPlaces" class="real-city-places"></div>
      <section class="real-city-history" aria-label="Fotografias históricas reais de Belém">
        <h3>Um pedacinho da Belém real</h3>
        <p>Duas fotografias históricas disponíveis em domínio público, de 2007. São registros da cidade, não imagens atuais nem texturas copiadas do Google.</p>
        <div class="real-city-archive">
          <figure><img id="archiveChurch" src="./assets/igreja-conceicao-2007.jpg" alt="Fotografia de 2007, em preto e branco, da Igreja de Nossa Senhora da Conceição: fachada de arcos e torre central com cruz" loading="lazy"><figcaption><strong>Nossa Senhora da Conceição</strong><span>2007 · foto: Júnior Miranda · domínio público</span><a href="https://commons.wikimedia.org/wiki/File:Igreja_N%C2%AA_Sr%C2%AA_da_Concei%C3%A7%C3%A3o_Bel%C3%A9m-PB.jpg" target="_blank" rel="noopener noreferrer">Fonte da fotografia ↗</a></figcaption></figure>
          <figure><img id="archiveMarket" src="./assets/feira-livre-2007.jpg" alt="Fotografia da feira livre de Belém em 2007: barracas, toldos e produtos artesanais" loading="lazy"><figcaption><strong>Feira livre</strong><span>2007 · foto: Júnior Miranda · domínio público</span><a href="https://commons.wikimedia.org/wiki/File:Feira_Livre_de_Bel%C3%A9m-PB.jpg" target="_blank" rel="noopener noreferrer">Fonte da fotografia ↗</a></figcaption></figure>
        </div>
        <div class="real-city-plaza"><strong>Praça 6 de Setembro</strong><p>Uma praça imaginada aparece na camada Cenários com indicação “sem local exato”. Ela não é um ponto geográfico nem uma rota. Sua localização e seu perímetro reais ainda precisam de verificação.</p><a href="https://belem.pb.gov.br/public/index.php/noticia/gestora-aline-barbosa-entrega-nova-praca-6-de-setembro-e-populacao-prestigia-o-cartao-postal-de-belem" target="_blank" rel="noopener noreferrer">Ver fotos e notícia da Prefeitura ↗</a></div>
      </section>
      <p class="real-city-disclaimer">Os pontos OSM identificam referências, não contornos, entradas ou orientação de fachadas. Fotos, Street View e eventual visualização 3D abrem externamente; a cobertura varia. O jogo não orienta visitas reais.</p>
      <button class="primary full" data-close="realCityDialog">Voltar às ruas do jogo ↗</button>
    </dialog>
    <dialog id="blockDialog" class="real-city-dialog block-dialog" aria-labelledby="blockTitle">
      <button class="dialog-close" data-close="blockDialog" aria-label="Fechar estudo das quadras">×</button>
      <span class="eyebrow">▦ ATELIÊ DAS RUAS · BELÉM/PB</span>
      <h2 id="blockTitle">Cada quadra conta uma história</h2>
      <p>Começamos por três áreas do centro. As referências de rua e os locais vêm do OpenStreetMap; <strong>as casas são pequenas composições artísticas</strong>, sem posição, endereço, cor ou dimensão cadastral. As fotos históricas orientam detalhes, nunca comprovam uma fachada atual.</p>
      <p id="blockCount" class="block-count">Preparando acabamentos...</p>
      <p class="block-sketch-status" id="blockSketchStatus" aria-live="polite">0/3 detalhes registrados</p>
      <section class="road-evidence" aria-label="Tipos de rua e precisão cartográfica"><strong>◈ O chão que pisamos</strong><p id="roadEvidence">Preparando a leitura dos pisos e do relevo...</p><button id="terrainToggle" type="button" class="terrain-toggle" aria-pressed="true">⛰ Ocultar curvas do terreno</button><p class="terrain-credit">Curvas artísticas calculadas sobre amostras do modelo <a href="https://doi.org/10.5067/MEaSUREs/SRTM/SRTMGL1.003" target="_blank" rel="noopener noreferrer">NASA SRTMGL1</a>, consultado via <a href="https://www.opentopodata.org/datasets/srtm/" target="_blank" rel="noopener noreferrer">OpenTopoData</a>. Altitude aproximada; não é GPS nem topografia de rua.</p></section>
      <button id="blockFacadesToggle" class="block-facades-toggle" type="button" aria-pressed="true">▦ Ocultar acabamentos nas casas ilustrativas</button>
      <div id="blockCards" class="central-block-gallery"></div>
      <p class="nature-citation">Igreja e feira: fotografias históricas de 2007. Praça 6 de Setembro: cascata, anfiteatro e jardins suspensos confirmados pela <a href="https://belem.pb.gov.br/public/index.php/noticia/gestora-aline-barbosa-entrega-nova-praca-6-de-setembro-e-populacao-prestigia-o-cartao-postal-de-belem" target="_blank" rel="noopener noreferrer">Prefeitura em 2023 ↗</a>, sem contorno mapeado nesta base.</p>
      <button class="primary full" data-close="blockDialog">Voltar à cidade ↗</button>
    </dialog>
    <dialog id="cultureDialog" class="real-city-dialog culture-dialog" aria-labelledby="cultureTitle">
      <button class="dialog-close" data-close="cultureDialog" aria-label="Fechar cena cultural">×</button>
      <span class="eyebrow">◈ CADERNO DE BELÉM</span>
      <h2 id="cultureTitle">Um encontro com a cidade</h2>
      <p id="cultureReliability" class="culture-status"></p>
      <canvas id="cultureArtwork" class="culture-artwork" width="440" height="230" role="img" aria-label="Cena desenhada de interpretação artística, não uma fotografia ou geometria real"></canvas>
      <figure id="cultureEvidence" class="culture-evidence" hidden><img id="cultureEvidenceImage" alt="Registro histórico de Belém/PB" loading="lazy"><figcaption><strong id="cultureEvidenceTitle">Registro da cidade</strong><span id="cultureEvidenceCaption">Fotografia histórica, não atual</span><a id="cultureEvidenceLink" href="https://commons.wikimedia.org/wiki/Category:Bel%C3%A9m_(Para%C3%ADba)" target="_blank" rel="noopener noreferrer">Consultar foto original ↗</a></figcaption></figure>
      <p id="cultureDescription"></p>
      <p id="cultureActionLead" class="culture-task-lead"></p>
      <div id="cultureOptions" class="culture-options"></div>
      <p id="cultureResult" class="culture-result" aria-live="polite"></p>
      <button id="marketAtmosphere" type="button" class="real-city-market-toggle" aria-pressed="false" hidden>✿ Mostrar bancas de feira na ilustração</button>
      <button id="cultureRoute" type="button" class="album-open">⌖ Marcar rota pelas ruas</button>
      <a id="cultureSource" class="culture-source" href="https://www.belem.pb.gov.br/a-cidade/aspectos-gerais" target="_blank" rel="noopener noreferrer">Conhecer a fonte cultural ↗</a>
      <button class="primary full" data-close="cultureDialog">Voltar ao caminho ↗</button>
    </dialog>
    <dialog id="natureDialog" class="real-city-dialog nature-dialog" aria-labelledby="natureTitle">
      <button class="dialog-close" data-close="natureDialog" aria-label="Fechar canteiro">×</button>
      <span class="eyebrow">♧ VIDA NO BREJO</span>
      <h2 id="natureTitle">Um canteiro para cuidar, um território para aprender</h2>
      <p>Uma atividade cozy inspirada em temas da zona rural de Belém. O canteiro é <strong>ficcional e não georreferenciado</strong>: não representa uma propriedade nem uma espécie identificada no mapa.</p>
      <div class="nature-stage" aria-label="Canteiro ilustrativo com crescimento da plantação"><div id="naturePlant" class="nature-plant" aria-live="polite">🌱</div><div class="nature-soil"></div></div>
      <div class="nature-progress"><strong id="natureSteps">0/3 cuidados</strong><span id="natureStory">Terra preparada para uma pequena história.</span></div>
      <p id="natureRainNote" class="nature-rain-note">☀ O céu ilustrativo também pode participar do cuidado com as plantas.</p>
      <p class="garden-harvest-line">🌾 Colheitas do seu canteiro: <strong id="gardenHarvests">0</strong></p>
      <button id="natureAction" type="button" class="primary full">Preparar a terra ♧</button>
      <button id="wildlifeToggle" type="button" class="wildlife-toggle" aria-pressed="true">🦋 Ocultar bichinhos ilustrativos no mapa</button>
      <button id="groundedFloraToggle" type="button" class="grounded-flora-toggle" aria-pressed="true">♧ Ver ilustrações nos polígonos verdes do OSM</button>
      <p id="greenCoverage" class="green-coverage">A arte verde segue somente as geometrias classificadas na base OSM, sem identificar espécies ou árvores individuais.</p>
      <p id="wildlifeCoverage" class="nature-citation">Borboletas e aves são desenhos decorativos, sem identificação de espécies reais.</p>
      <h3>O que a base geográfica confirma?</h3>
      <p id="natureCoverage" class="nature-coverage"></p>
      <div class="pedra-discovery"><strong>◇ Pedra do Cordeiro — descoberta documental</strong><p>A Prefeitura situa essa formação rochosa a pouco mais de 1 km a oeste do centro de Belém. O acesso é associado a vegetação com mandacarus e xique-xiques. <b>Ainda não há trilha GPS, acesso validado nem novo ponto de missão no jogo.</b></p><a href="https://www.belem.pb.gov.br/a-cidade/aspectos-gerais" target="_blank" rel="noopener noreferrer">Consultar a descrição municipal ↗</a></div>
      <div class="nature-tags"><span>Roçados e macaxeira — memória oral</span><span>Água, cisternas e açudes — memória oral</span><span>Animais e mata — temas documentados</span><span>Afloramentos GPS do SGB — no atlas</span><span>Hidrografia e cobertura 10 m — pendentes</span></div>
      <p class="nature-citation">Os temas vêm dos <a href="https://repositorio.ufpb.br/jspui/bitstream/123456789/23987/1/CoLingPB_Caracter%C3%ADsticas%20dos%20%C3%A1udios_t%C3%B3picos%20abordados_Agreste-Zona%20Rural.pdf" target="_blank" rel="noopener noreferrer">catálogos rurais da UFPB</a>. Ainda não são falas transcritas nem relatos reproduzidos.</p>
      <button class="primary full" data-close="natureDialog">Continuar explorando ↗</button>
    </dialog>
    <dialog id="geologyDialog" class="real-city-dialog geology-dialog" aria-labelledby="geologyTitle">
      <button class="dialog-close" data-close="geologyDialog" aria-label="Fechar atlas geológico">×</button>
      <span class="eyebrow">◇ CIÊNCIA NO MAPA · BASE REAL</span>
      <h2 id="geologyTitle">As rochas que contam histórias</h2>
      <p id="geologyCount">Carregando registros geológicos…</p>
      <p><strong>O que é real:</strong> coordenadas e descrição de afloramentos informadas pelo Serviço Geológico do Brasil (SGB). São observações pontuais; não definem a área, formato nem acessibilidade de cada formação.</p>
      <button id="geologyToggle" type="button" class="geology-toggle" aria-pressed="false">◇ Mostrar pontos no mapa</button>
      <p class="nature-citation">Os símbolos aparecem em suas coordenadas de referência, sem alteração das ruas ou dos cenários. O conjunto inclui pedreira e fazendas privadas: <strong>não são sugestões de visita nem rotas de trilha</strong>.</p>
      <ul id="geologyList" class="geology-list"></ul>
      <p class="nature-citation">Fonte: <a href="https://geoportal.sgb.gov.br/server/rest/services/geologia/afloramentos/MapServer/0" target="_blank" rel="noopener noreferrer">SGB Geoportal — Afloramentos ↗</a>, consulta por município Belém/PB, datum WGS84. Cobertura do solo MapBiomas/IBGE e rede hídrica ANA ainda não compõem este desenho.</p>
      <button class="primary full" data-close="geologyDialog">Continuar explorando ↗</button>
    </dialog>
    <dialog id="festivalDialog" class="real-city-dialog festival-dialog" aria-labelledby="festivalTitle">
      <button class="dialog-close" data-close="festivalDialog" aria-label="Fechar preparação da festa">×</button>
      <span class="eyebrow">✦ UMA FESTA PARA O NOSSO CADERNO</span>
      <h2 id="festivalTitle">Nosso São Pedro de Belém</h2>
      <p>Belém/PB celebra o São Pedro com quadrilhas e forró. Aqui você prepara <strong>um pequeno encontro fictício com Lia</strong>, sem representar uma festa real, seu endereço ou programação oficial.</p>
      <div id="festivalStage" class="festival-stage" aria-label="Ilustração de um arraial imaginário, não georreferenciado">
        <div class="festival-bunting" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="festival-moon" aria-hidden="true">☾</div>
        <div class="festival-lights" aria-hidden="true">✦　✧　✦</div>
        <div class="festival-tent" aria-hidden="true"><span>♥</span></div>
        <span class="festival-stage-caption">Um arraial criado no imaginário</span>
      </div>
      <div class="festival-checklist" aria-label="Preparativos do encontro">
        <div class="festival-task"><span id="festivalFriendCheck" aria-hidden="true">○</span><div><strong>Convide Lia</strong><small>Converse com ela na caminhada.</small></div></div>
        <div class="festival-task"><span id="festivalMarketCheck" aria-hidden="true">○</span><div><strong>Traga uma memória da feira</strong><small>Guarde uma escolha cultural perto do Mercado Público.</small></div></div>
        <div class="festival-task"><span id="festivalPhotoCheck" aria-hidden="true">○</span><div><strong>Escolha a paisagem do encontro</strong><small>Registre uma observação no diário.</small></div></div>
      </div>
      <p id="festivalMessage" class="festival-message" aria-live="polite"></p>
      <button id="festivalAction" type="button" class="primary full" disabled>Celebrar nosso encontro ✦</button>
      <button id="festivalRoute" type="button" class="album-open">⌖ Marcar o próximo encontro no mapa</button>
      <p class="festival-source">Referência cultural: <a href="https://www.belem.pb.gov.br/noticia/programacao-do-sao-pedro-inicia-repleta-de-tradicao-shows-e-novidades" target="_blank" rel="noopener noreferrer">São Pedro 2025, Prefeitura de Belém/PB ↗</a>. A atividade e seus personagens são originais do jogo.</p>
      <button class="primary full" data-close="festivalDialog">Voltar às ruas de Belém ↗</button>
    </dialog>
    <dialog id="lifeDialog" class="real-city-dialog life-dialog" aria-labelledby="lifeTitle">
      <button class="dialog-close" data-close="lifeDialog" aria-label="Fechar vida na cidade">×</button>
      <span class="eyebrow">☼ AS HISTÓRIAS NÃO PARAM</span>
      <h2 id="lifeTitle">Vida entre as ruas</h2>
      <p>Inspirado nos sistemas de convivência do protótipo <em>Belém — Entre Ruas e Memórias 0.6</em>, que você compartilhou. <strong>Os personagens, rotinas e encontros são ficcionais.</strong> Os locais de encontro usam apenas referências existentes no OpenStreetMap, sem representar moradores reais ou suas residências.</p>
      <div class="life-date"><strong id="lifeDialogClock">Dia 1 · segunda-feira · 08:30</strong><span id="lifeEvent">Um dia tranquilo em Belém.</span></div>
      <h3>Quem está pela cidade?</h3>
      <div id="residentGrid" class="resident-grid"></div>
      <section class="side-neighbor-journal" aria-label="Três novos personagens secundários fictícios">
        <div class="side-neighbor-title"><span>✿ NOVOS VIZINHOS · V2.18</span><strong id="sideJournalProgress">0 de 3</strong></div>
        <p>Ciça, Nara e Téo têm rotinas próprias entre Mercado, Matriz e Rodoviária. Conheça os três para guardar uma lembrança no álbum.</p>
        <div id="sideJournalList" class="side-journal-list"></div>
      </section>
      <div class="encounter-watch"><strong id="encounterWatchTitle">🌷 Um encontro pela cidade</strong><p id="encounterWatchInfo">Os amigos fazem visitas pelo próprio calendário.</p><button id="encounterVisit" type="button">⌖ Acompanhar a próxima conversa no Mercado ↗</button><small>Se necessário, adianta apenas o relógio fictício e marca o caminho de ruas existente. Seu progresso é mantido.</small></div>
      <section class="community-watch" aria-label="Encontros espontâneos entre vizinhos do jogo">
        <div class="community-watch-top"><span>♡ LAÇOS PELAS RUAS · V2.20</span><strong id="communityWatchProgress">0/3 presenciados</strong></div>
        <strong id="communityWatchTitle">🧵 Ciça e Damião preparam fitas</strong>
        <p id="communityWatchInfo">Vizinhos se encontram em diferentes dias e horários fictícios.</p>
        <button id="communityWatchAction" type="button">⌖ Ver o próximo encontro ↗</button>
        <small>Veja a conversa de perto para guardá-la no álbum. As ruas vêm do OSM; os personagens, atividades e encontros são ficção.</small>
      </section>
      <section id="carePanel" class="care-panel" aria-label="Gentilezas diárias com moradores" hidden><div class="care-panel-top"><span>✿ UM POUCO DE CUIDADO</span><strong id="careName">Uma gentileza</strong></div><p id="careStatus">Escolha uma pequena ajuda para hoje.</p><div id="careChoices" class="care-choices"></div><small>Atividades e falas são ficcionais. Só é possível ajudar estando perto e uma vez por dia.</small></section>
      <p id="lifeConversation" class="life-conversation" aria-live="polite">As amizades crescem devagar: uma conversa por dia pode criar uma nova lembrança.</p>
      <div class="moment-calendar"><div><span>☼ CENAS AO LONGO DO DIA</span><strong id="momentCalendarProgress">0/3 lembranças</strong></div><p id="momentCalendarNow">Acompanhe a cidade em horários diferentes.</p><button id="momentOpen" type="button">Explorar a cena de agora ↗</button><button id="momentWait" type="button">◷ Avançar ao próximo período do jogo</button><small>Horários e atividades são fictícios; a rota usa apenas os marcadores já existentes.</small></div>
      <section class="neighbor-quest" aria-label="Recompensa de amizade entre os vizinhos"><div class="neighbor-quest-top"><span>♡ PEQUENOS LAÇOS</span><strong id="neighborProgress">0 de 3 amizades</strong></div><h3>Uma roda de conversas</h3><p>Volte para conversar com Damião, Lúcia e Bia em dois dias diferentes. Quando os três tiverem dois corações, uma lembrança aparece no álbum.</p><div class="neighbor-quest-track"><i id="neighborBar"></i></div><button id="neighborRoute" type="button">⌖ Encontrar o próximo vizinho ↗</button></section>
      <h3>Pequenas lembranças <small id="careProgress" class="care-memory-progress">0/3 gentilezas</small></h3>
      <div id="lifeMemories" class="life-memories">O diário ainda espera sua primeira conversa.</div>
      <button id="lifeRest" type="button" class="life-rest">☾ Descansar e acordar no dia seguinte</button>
      <p class="nature-citation">O tempo avança apenas durante a exploração ativa. Descansar adianta o calendário <strong>do jogo</strong>; não altera o calendário real ou a previsão do tempo.</p>
      <button class="primary full" data-close="lifeDialog">Voltar à caminhada ↗</button>
    </dialog>
    <dialog id="momentDialog" class="real-city-dialog moment-dialog" aria-labelledby="momentTitle"><button class="dialog-close" data-close="momentDialog" aria-label="Fechar cena do dia">×</button><span class="eyebrow">☼ POSTAIS DE UM DIA EM BELÉM</span><div id="momentArt" class="moment-art" aria-hidden="true">🧺</div><h2 id="momentTitle">Uma pequena cena pelas ruas</h2><p id="momentDescription">Cada horário conta uma história imaginada perto dos lugares mapeados.</p><p class="moment-disclaimer">Esta é uma cena original do jogo, com localização de referência no OpenStreetMap. Não afirma que pessoas ou atividades reais acontecem aqui neste horário.</p><button id="momentCollect" type="button" class="primary full">Guardar este momento no álbum ✿</button><button class="primary full" data-close="momentDialog">Voltar à caminhada ↗</button></dialog>
    <dialog id="marketWorkDialog" class="real-city-dialog market-work-dialog" aria-labelledby="marketWorkTitle">
      <button class="dialog-close" data-close="marketWorkDialog" aria-label="Fechar atividade da banca">×</button>
      <span class="eyebrow">🧺 UM FAVOR ENTRE VIZINHOS · FICÇÃO</span>
      <h2 id="marketWorkTitle">Vamos ajeitar a banca?</h2>
      <div class="market-worker-line"><div id="marketWorkerPortrait" aria-hidden="true"></div><p id="marketWorkerSpeech">Damião: “Se você me der uma mão, a manhã fica mais leve. Vamos por partes?”</p></div>
      <div id="marketWorkScene" class="market-scene-host"></div>
      <p id="marketSaveWarning" class="market-save-warning" role="status" hidden>O navegador não permitiu salvar. Mantenha esta página aberta para continuar sua atividade.</p>
      <div class="market-work-status"><strong id="marketWorkProgress">0/3 detalhes arrumados</strong><p id="marketWorkLine" aria-live="polite">Toque nos três objetos do cenário para ajudar Damião.</p></div>
      <div id="marketThanks" class="market-thanks" hidden><strong>♡ Uma manhã para lembrar!</strong><p>Damião: “Agora sim! A gente arrumou tudo conversando. Um dia bom fica ainda melhor quando tem companhia.”</p><small>Um cartão original entrou no álbum de lembranças.</small></div>
      <button id="marketFinish" type="button" class="primary full" disabled>Arrume os três detalhes primeiro</button>
      <p class="nature-citation">A fotografia histórica da <a href="https://commons.wikimedia.org/wiki/File:Feira_Livre_de_Bel%C3%A9m-PB.jpg" target="_blank" rel="noopener noreferrer">feira de Belém em 2007 ↗</a> inspira a composição. Bancas, objetos e fala são criados para o jogo, sem posições reais.</p>
      <button class="primary full market-work-back" data-close="marketWorkDialog">Voltar à rua ↗</button>
    </dialog>
    <dialog id="luciaGardenDialog" class="real-city-dialog lucia-garden-dialog" aria-labelledby="luciaGardenTitle">
      <button class="dialog-close" data-close="luciaGardenDialog" aria-label="Fechar jardim de Lúcia">×</button>
      <span class="eyebrow">🌷 UM INSTANTE DE CUIDADO · FICÇÃO</span>
      <h2 id="luciaGardenTitle">Um jardim para guardar memórias</h2>
      <div class="market-worker-line lucia-worker-line"><div id="luciaWorkerPortrait" aria-hidden="true"></div><p id="luciaWorkerSpeech">Lúcia: “Quando a gente cuida de uma planta, também cuida de uma lembrança.”</p></div>
      <div id="luciaGardenScene" class="lucia-garden-scene" aria-label="Vaso ilustrativo com três gestos de jardinagem em ordem">
        <div class="lucia-garden-window" aria-hidden="true"><span>☀</span></div>
        <div class="lucia-garden-shelf" aria-hidden="true"></div>
        <div class="lucia-garden-pot" aria-hidden="true"><span class="lucia-garden-earth"></span><span class="lucia-garden-seedling">🌱</span><span class="lucia-garden-drops">💧 ✧</span></div>
        <div class="lucia-garden-actions">
          <button type="button" class="lucia-garden-step" data-lucia-work="terra">🍂 <span>Preparar terra</span></button>
          <button type="button" class="lucia-garden-step" data-lucia-work="muda">🌱 <span>Plantar muda</span></button>
          <button type="button" class="lucia-garden-step" data-lucia-work="agua">💧 <span>Regar</span></button>
        </div>
      </div>
      <div class="market-work-status lucia-garden-status"><strong id="luciaGardenProgress">0/3 cuidados feitos</strong><p id="luciaGardenLine">Comece preparando a terra. Cada gesto abre o próximo.</p></div>
      <div id="luciaMemoryPanel" class="lucia-memory-panel" hidden><strong>♡ Que lembrança vamos dedicar à mudinha?</strong><p>Lúcia guarda histórias simples. Escolha uma memória imaginada para esta plantinha.</p><div class="lucia-memory-choices">
        <button type="button" data-lucia-memory="quintal">☘ Um quintal de infância</button>
        <button type="button" data-lucia-memory="conversa">♡ Uma conversa no portão</button>
        <button type="button" data-lucia-memory="chuva">☂ O cheiro da primeira chuva</button>
      </div></div>
      <div id="luciaGardenThanks" class="market-thanks lucia-garden-thanks" hidden><strong>✿ Uma memória pode florescer.</strong><p id="luciaGardenFarewell">Lúcia sorri ao ver as primeiras folhas.</p><small>Um cartão original entrou no álbum. A Rodoviária e Bia serão a próxima parada.</small></div>
      <button id="luciaGardenFinish" type="button" class="primary full" disabled>Cuide da plantinha primeiro</button>
      <p class="nature-citation">O ponto da Matriz vem do OpenStreetMap e sua imagem de referência é <a href="https://commons.wikimedia.org/wiki/File:Igreja_N%C2%AA_Sr%C2%AA_da_Concei%C3%A7%C3%A3o_Bel%C3%A9m-PB.jpg" target="_blank" rel="noopener noreferrer">uma fotografia histórica de 2007 ↗</a>. O jardim e as falas são ficções, não um canteiro geolocalizado.</p>
      <button class="primary full market-work-back" data-close="luciaGardenDialog">Voltar à caminhada ↗</button>
    </dialog>
    <dialog id="biaLetterDialog" class="real-city-dialog bia-letter-dialog" aria-labelledby="biaLetterTitle">
      <button class="dialog-close" data-close="biaLetterDialog" aria-label="Fechar cartas de Bia">×</button>
      <span class="eyebrow">📮 CARTAS DE QUEM VAI E VOLTA · FICÇÃO</span>
      <h2 id="biaLetterTitle">Um caderno de caminhos</h2>
      <div class="market-worker-line bia-reader-line"><div id="biaReaderPortrait" aria-hidden="true"></div><p id="biaReaderSpeech">Bia: “Às vezes uma carta guarda um lugar inteiro dentro da gente.”</p></div>
      <div id="biaLetterScene" class="bia-letter-scene" aria-label="Mesa ilustrada com caderno, papel, envelope e selo; a composição muda conforme sua carta">
        <div class="bia-desk-window" aria-hidden="true"><span>☀</span></div>
        <div class="bia-desk-table" aria-hidden="true"></div>
        <div class="bia-desk-book" aria-hidden="true"><span>✎</span></div>
        <div class="bia-paper" aria-hidden="true"><small>uma carta para lembrar</small><p id="biaPaperText">Abra o caderno para escolher suas palavras.</p><span class="bia-paper-sign">— com carinho, de Belém</span></div>
        <div class="bia-envelope" aria-hidden="true"><span>✉</span><i>♥</i></div>
        <div class="bia-desk-pencil" aria-hidden="true">✎</div>
        <div class="bia-desk-sparkle" aria-hidden="true">✧</div>
      </div>
      <div class="market-work-status bia-letter-status"><strong id="biaLetterProgress">0/3 gestos</strong><p id="biaLetterLine">Bia espera você abrir o caderno.</p></div>
      <button id="biaNotebookOpen" type="button" class="bia-notebook-open">📖 Abrir o caderno de Bia</button>
      <div id="biaThemePanel" class="bia-theme-panel" hidden><strong>✎ Que palavras vão nesta carta?</strong><p>Escolha um dos três caminhos possíveis. O texto é uma memória criada para o jogo.</p><div class="bia-theme-choices">
        <button type="button" data-bia-theme="saudade">♡ Quando bater saudade</button>
        <button type="button" data-bia-theme="planos">✧ Caminhos que virão</button>
        <button type="button" data-bia-theme="retorno">⌂ O dia de voltar</button>
      </div></div>
      <button id="biaLetterSeal" type="button" class="bia-seal-action" disabled>✉ Escolha o texto para selar a carta</button>
      <div id="biaLetterThanks" class="market-thanks bia-letter-thanks" hidden><strong>♡ O que é escrito com carinho permanece.</strong><p id="biaLetterFarewell">Bia sorri ao fechar o envelope.</p><small>Um novo cartão vai para o álbum, junto das memórias de Damião e Lúcia.</small></div>
      <button id="biaLetterFinish" type="button" class="primary full" disabled>Termine a carta para guardar a memória</button>
      <p class="nature-citation">A Rodoviária é referenciada pelo OpenStreetMap. O <a href="https://repositorio.ufpb.br/jspui/bitstream/123456789/23987/2/CoLingPB_Caracter%C3%ADsticas%20dos%20%C3%A1udios_t%C3%B3picos%20abordados_Agreste-Zona%20Urbana.pdf" target="_blank" rel="noopener noreferrer">catálogo urbano CoLingPB/UFPB ↗</a> registra temas como estudo, deslocamento e migração em entrevistas de Belém/PB. As falas de Bia e a carta são criações originais, não transcrições.</p>
      <button class="primary full market-work-back" data-close="biaLetterDialog">Voltar às ruas ↗</button>
    </dialog>
  `);
})();
