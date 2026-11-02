# Próximos passos

## Direção aprovada

- A **versão atual de Beit Lehem** é a referência visual e técnica ativa.
- A V2.27 fica congelada como registro histórico e recurso de recuperação; não usar seus sistemas ou visuais como padrão obrigatório.
- Preservar a geografia ampla e conectada de Belém/PB, Rua Nova e entorno rural/serrano.
- Manter os nomes reais das ruas exatamente como validados. POIs e estabelecimentos podem usar aliases ficcionais, sem alterar o nome da rua ou apagar a proveniência do dado.
- O repositório GitHub permanece público. Isso não autoriza, por si só, ativar Pages ou publicar uma build.

## Sequência de trabalho

### 1. Alinhamento de documentação e build

- Concluído nesta etapa: alinhar README, instruções para agentes, decisões, próximos passos, mapa do código e índice de versões à referência atual.
- Fazer `npm run build` e `npm run play` apontarem para o jogo atual. Preservar a geração antiga em comandos explícitos `build:legacy` e `play:legacy`.
- Marcar avaliações anteriores de privacidade/publicação como supersedidas quando não refletirem as decisões atuais.
- Não fazer merge nem atualizar GitHub Pages nesta etapa.

### 2. Fluxo geográfico canônico — integração e regressões automatizadas concluídas; inspeção visual pendente

- O build atual agora lê diretamente `source/belem-osm-2026.geojson` por `scripts/current-geodata.cjs` e injeta o mapa composto durante a geração offline.
- Ruas, áreas e pontos são reconstruídos a partir das feições OSM. O nome da rua é copiado literalmente de `properties.name`, sem normalização ou correção de acentos.
- A geometria das 462 vias e dos 20 polígonos é comparada com a base revisada embutida; divergências de contagem, IDs ou coordenadas interrompem o build para revisão.
- Superfícies usadas apenas pelo estilo foram separadas em `roadAppearance`; nove pontos locais foram movidos para `localPlaces`, com `displayName`, `sourceName`, proveniência e estado; seis rótulos herdados sem correspondência OSM estão em `unverifiedRoadLabels` e não são exibidos como ruas.
- A preparação antiga de `dist/map.json` deixa de ser o caminho de composição do mapa ativo. O HTML arquivado e os HTMLs gerados não foram editados diretamente.

**Validação automatizada:** os testes de geografia e de separação OSM/localPlaces integram a suíte oficial; a suíte completa passou no CI. A inspeção visual de nomes, POIs, fachadas e salvamentos ainda requer uma prévia temporária aberta em navegador. O HTML versionado não foi regenerado nesta etapa. Mudanças futuras na geometria OSM exigem revisão explícita e atualização deliberada da referência geométrica; não desativar o guard para aprová-las automaticamente.

### 3. Geração de casas — índices espaciais implementados e validados

- O índice de segmentos viários agora é construído antes da geração de casas e é reutilizado na reserva de espaço de árvores. A grade de ruas usa caixas delimitadoras expandidas em 22 unidades; a consulta continua executando a distância ponto-segmento exata e os limites estritos originais (11,5; 14,5; 22).
- A ocupação de casas agora usa uma grade de 32 unidades. A consulta visita as células vizinhas necessárias e mantém `Math.hypot` e os limites estritos originais (14,5; 18).
- O laço de candidatos, a ordem das vias/lados, o incremento de IDs, os `seeds`, os filtros de cenário/campo e a seleção final de até 1.350 casas foram mantidos. As funções de geração/seleção foram isoladas para permitir comparação direta entre busca exaustiva e indexada.
- Novo teste C17 compara, sobre a malha de ruas de referência, a lista ordenada de todos os candidatos e a lista final selecionada entre os dois caminhos; também verifica coordenadas negativas, limites de célula e distâncias exatamente no limiar. O teste mede contagens de comparações geométricas, sem depender de benchmark temporal.

**Validação por equivalência:** com 5.023 segmentos e quatro cenas, a busca exaustiva e a indexada produziram exatamente 2.077 candidatos e as mesmas 1.350 casas selecionadas, na mesma ordem, coordenadas e atributos. As comparações ponto-segmento caíram de 21.408.026 para 35.632; as comparações de ocupação, de 3.083.985 para 10.297. Os casos de célula negativa, fronteira e distância exatamente no limite passaram.

**Validação oficial:** GitHub Actions executou `npm test` com Node 22.23.4: **398/398 testes passaram, zero falhas**, em 25,14 segundos (execução no commit `04d5739`). Os testes C10/C17, os de cobertura espacial e as regressões geográficas fazem parte dessa execução. A inspeção visual no navegador continua pendente. Nenhum HTML gerado foi atualizado nesta etapa.
### 4. Validação contínua no GitHub — suíte oficial aprovada

- Adicionado `.github/workflows/test.yml` para executar a suíte nativa `npm test` com Node.js 22 em cada atualização da branch de trabalho.
- Resultado confirmado: 398 testes, 398 aprovados, 0 falhas; execução de 25,14 s.
- O workflow tem permissão de leitura do repositório, não faz merge, não publica e não aciona Pages.
- A execução oficial fica registrada no [GitHub Actions](https://github.com/chumikie/Beit-Lehem/actions/runs/41331595171).

### 5. Build isolado — concluído

- O workflow executa `buildGeminiPreview` fora do repositório e valida 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais, 86 nomes de ruas e a inatividade dos rótulos viários não verificados.
- No HEAD da inspeção visual, o build temporário teve **955.404 bytes**. Nenhum HTML em `previews/` ou `publicacao/` foi escrito pelo workflow.
- O workflow não publica, não atualiza Pages e não faz merge.

### 6. Inspeção visual desktop/mobile — concluída com ajustes e observações restantes

- Adicionado `scripts/visual-inspection.cjs`, executado em Chromium headless com viewport desktop **1440×960** e viewport móvel com toque **390×844**, ambos servidos de um HTML temporário fora do repositório.
- O ensaio captura telas de boas-vindas, jogo, mapa ampliado e estado depois de interação, além de produzir `visual-report.json`. Artefato temporário: [capturas da Etapa 6](https://github.com/chumikie/Beit-Lehem/actions/runs/41334796719/artifacts/13094378479), com retenção de três dias.
- As duas telas abriram o canvas de jogo com conteúdo desenhado, sem overflow horizontal. A etiqueta de localização exibiu **Rua Joaquim Rodrigues**, nome literal presente em `properties.name` da fonte OSM. O nome estava truncado no celular antes do ajuste; agora cabe integralmente.
- O mapa ampliado abriu nas duas resoluções (desktop **796×480**, móvel **318×480**). Um toque/clique em cada mapa fechou o diálogo, selecionou um trecho viário e produziu a confirmação **“Caminho marcado pelas ruas”** (246 m aproximados no desktop; 139 m no móvel).
- O controle direcional móvel ficou visível e recebeu evento de toque; o desktop recebeu entrada de teclado. Depois das interações, o armazenamento local manteve a chave experimental, `v: 3`, `mapSource: belem-osm-2026.geojson` e coordenadas finitas do jogador.
- A revisão dos pets revelou agrupamento visual e plaquinhas sobrepostas. A fonte agora aplica afastamento apenas ao desenho dos sprites (sem mudar itinerários nem coordenadas salvas), posiciona as plaquinhas em faixas sem colisão e omite a placa quando não existe espaço livre. O nome das ruas no topo também ganhou largura móvel responsiva.
- Regressões adicionadas/atualizadas em `tests/gemini-c15-pet-silhouette.test.cjs`, `tests/gemini-c15-pet-route-audit.test.cjs` e `tests/gemini-preview.test.cjs`; o inspetor também exige que nome oficial não esteja truncado e que o mapa realmente consiga marcar uma rota.
- **Observação que permanece:** em zoom próximo alguns bichinhos ainda se reúnem em grupos densos, embora as placas testadas já não se sobreponham. Isso será avaliado como escolha de composição/vida cotidiana, sem deslocar rotas reais. A inspeção foi em Chromium emulado; não substitui teste em aparelhos físicos. As duas mensagens de console `net::ERR_FAILED` vieram de recursos remotos bloqueados pelo próprio ensaio; **não houve page errors JavaScript**.

**Validação oficial do HEAD da Etapa 6:** `npm test` **400/400**, zero falhas (Node 22; 18,91 s); build temporário **955.404 bytes**; inspeção Chromium desktop/móvel concluída; artefato enviado com sucesso. [Execução completa no GitHub Actions](https://github.com/chumikie/Beit-Lehem/actions/runs/41334796719).

### 7. Reconstrução urbana guiada por evidências — primeira subetapa concluída

- Criar uma matriz que separa evidência documental, geometria OSM, memória local e interpretação arquitetônica; não tratar ausência de edifício no extrato como ausência física na cidade.
- Reclassificar as áreas de estudo por pontos OSM ou corredores calculados diretamente sobre nomes/geometrias OSM literais. Os raios/corredores são apenas limites de composição visual, não perímetros de bairros ou lotes.
- Alinhar a frente ilustrada de cada casa ao rumo da rua geradora e voltá-la visualmente para a via. A transformação é exclusivamente de renderização: não altera centros, dimensões, ângulos salvos, grafo, missões ou saves.
- A auditoria de projeção confirmou que a fórmula ativa é coerente: X=(lon−origemLon)×escalaLon; Y=(origemLat−lat)×escalaLat; GPS inverso usa origemLat−Y/escalaLat. Corrigir a anotação antiga de sinal Y no relatório geográfico; não mover os pinos.
- **Resultado da subetapa 7.1 (HEAD 124f5533):** matriz setorial registrada em `docs/MATRIZ-EVIDENCIAS-URBANAS-2026-11-01.md`; âncoras de rua calculadas na geometria OSM literal; fachadas rotacionadas para o lado da rua; sem alteração de coordenadas das casas, ruas, áreas, POIs, missões, horários ou formato de save.
- **Projeção:** round-trip GPS aprovado; sinal Y positivo validado para Pedra do Cordeiro e Parque São Luís. A anotação negativa anterior foi retificada em `docs/AUDITORIA-GEOGRAFICA-ETAPA-1.md`; nenhum pino foi movido.
- **Regressões:** `npm test` **412/412**, zero falhas. Inspeção Playwright desktop 1440×960 e móvel 390×844 aprovada; sem overflow e sem page errors JavaScript. Build temporário **960.876 bytes**, 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais e 86 nomes; nenhum HTML versionado escrito.
- [CI da subetapa 7.1](https://github.com/chumikie/Beit-Lehem/actions/runs/41341075932) · [artefato de capturas e relatório](https://github.com/chumikie/Beit-Lehem/actions/runs/41341075932/artifacts/13097490673).

- Próximas subetapas: passeios e limites visuais interpretativos, composição de quarteirões e diversidade de fachadas; só serão desenhados como arte quando não houver lotes/edifícios verificados. Não inventar calçadas mapeadas, entradas ou muros cadastrais.

### Subetapa 7.2 — frentes de rua e ritmo de quarteirões

- `gemini-modules/facade-studio.js` ganhou uma camada determinística de frentes ilustrativas: recuos rasos, faixa de quintal, caminho de acesso cenográfico, muros baixos e portões residenciais; nas áreas comerciais, ritmo de vitrines, vãos e toldos anônimos.
- A camada distingue Matriz, Feira, João Pessoa, Clovis Bezerra e travessas, Feliciano Pedrosa e Vicente Cado. Feira e Feliciano recebem ritmo comercial mais contínuo; Vicente recebe apenas variações pontuais de pequena frente comercial; João Pessoa e Clovis permanecem predominantemente residenciais. A Matriz usa acabamento mais sóbrio e claro.
- O desenho é recortado pelo envelope das casas já ilustradas e não cria footprint, lote, edifício, entrada ou obstáculo. Calçadas e meios-fios continuam como traços de Canvas da camada viária; não são tags OSM nem medições de largura.
- Nenhum eixo, geometria, nome, ID, coordenada, rota, horário, missão ou campo/chave de save foi editado. Nenhum HTML gerado versionado foi alterado.
- `tests/gemini-street-frontage-layer.test.cjs` acrescenta três regressões: cobertura dos seis setores com preservação de posição/dimensão/ângulo, determinismo por semente e diferenciação de tipologia sem nomes comerciais inventados. Os testes geográficos e de colisão existentes continuam ativos.
- **Validação do HEAD `0ac298a` (CI #47):** `npm test` **415/415**, zero falhas. Build temporário **964.079 bytes**, com 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais e 86 nomes; `versionedPreviewsWritten=false`.
- Playwright/Chromium passou em desktop **1440×960** e móvel com toque **390×844**: canvas desenhado, sem overflow horizontal, nomes OSM canônicos sem truncamento, mapa ampliado interativo, seleção de rota e save experimental isolado válidos. Rotas de verificação: ~246 m no desktop e ~139 m no móvel. Nenhum erro JavaScript de página; duas mensagens `net::ERR_FAILED` correspondem a recursos externos bloqueados pelo harness.
- [CI da subetapa 7.2](https://github.com/chumikie/Beit-Lehem/actions/runs/41342123915) · [capturas e relatório temporários](https://github.com/chumikie/Beit-Lehem/actions/runs/41342123915/artifacts/13098185589).

Próxima subetapa: revisar transições visuais entre frentes residenciais e comerciais, especialmente em zoom próximo, e avaliar sobreposições aparentes entre quintais, muros e casas ilustradas sem alterar a geometria ou a lógica de colisão.

### Subetapa 7.3 — transições de frente e inspeção de colisões visuais

- `gemini-modules/facade-studio.js` agora classifica as frentes artísticas em três perfis determinísticos: residencial, comercial e misto. Feira mantém predominância comercial com transições pontuais; Feliciano Pedrosa tem continuidade comercial com fachadas intermediárias; Vicente Cado combina residências e pequenas frentes comerciais; João Pessoa e Clovis permanecem residenciais; Matriz recebe transições mais raras e discretas.
- O perfil misto usa faixa de jardim, pequeno trecho de marquise/faixa anônima e caminho deslocado. Não há nomes, logotipos, lojas reais, lotes, portas georreferenciadas ou footprints novos.
- `tests/gemini-street-frontage-layer.test.cjs` ganhou duas regressões: distribuição dos perfis coerente por setor e verificação em zoom próximo de que a pintura permanece sob recorte Canvas e não modifica posição, dimensões, ângulo, lado ou outros campos da casa. A lógica física de colisão e a geometria OSM não foram modificadas.
- `scripts/visual-inspection.cjs` captura agora uma imagem adicional de zoom próximo após cinco incrementos de zoom, tanto em desktop como em móvel, e verifica tinta no canvas e ausência de overflow horizontal.
- **CI HEAD `94c9bafb` (#49):** `npm test` **417/417 aprovados, zero falhas**. Build temporário **965.470 bytes**, com 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais e 86 nomes; nenhum preview versionado foi escrito.
- Playwright/Chromium: desktop **1440×960** e móvel com toque **390×844**, ambos com cinco incrementos de zoom para captura próxima. Dez capturas temporárias (welcome, jogo, closeup, mapa e após interação por viewport); sem overflow horizontal e sem erros JavaScript de página. As duas mensagens de console `net::ERR_FAILED` correspondem a recursos externos bloqueados pelo harness.
- O nome exibido continuou canônico (`Rua Joaquim Rodrigues`); mapa ampliado e seleção de rota funcionaram (mensagem aproximada: 246 m no desktop e 139 m no móvel). Save experimental isolado continuou válido, versão 3, fonte `belem-osm-2026.geojson` e coordenadas finitas.
- A inspeção próxima ainda mostra adensamento de sprites de animais e placas de personagens ao redor da câmera inicial, especialmente no móvel. É um limite visual preexistente de composição de personagens, não uma colisão física nem uma expansão da camada de fachadas; fica registrado para uma etapa própria de espaçamento/legibilidade.
- [CI da subetapa 7.3](https://github.com/chumikie/Beit-Lehem/actions/runs/41342539407) · [capturas desktop/mobile e relatório JSON](https://github.com/chumikie/Beit-Lehem/actions/runs/41342539407/artifacts/13098226700).

Próximo passo: tratar o agrupamento de personagens e placas na câmera inicial, preservando posições de agenda, rotas, horários e saves; em paralelo, revisar transições de frente em outras cenas de quarteirão com evidência visual dedicada.

### Subetapa 7.4 — composição visual da câmera inicial

- `gemini-modules/game.js` ganhou `streetPetCrowdVisible`: seleção de silhuetas por distância em pixels de tela, sem deslocar os pontos reais. O intervalo mínimo é de 44 px no canvas compacto (até 600 px) e 26 px em telas maiores; como a distância é convertida pelo zoom atual, mais animais reaparecem naturalmente quando a câmera aproxima.
- No mobile, a câmera usa a largura real do canvas (`w`) para ativar o perfil compacto, não a largura expandida do retângulo de culling. As placas dos pets ficam restritas ao Bolt no mobile; os demais nomes continuam disponíveis na identificação/diário, sem ocupar a cena. Placas de moradores também caem para uma por composição em telas estreitas.
- Nenhum pet ou morador foi removido dos itinerários. Permanecem os 13 pets, suas agendas e amostragens de rota; a filtragem só decide quais sprites/placas cabem simultaneamente no quadro. A lógica de movimento, coordenadas salvas, grafo OSM, horários, IDs e esquema de save não foi modificada.
- Regressões C15.5 verificam espaçamento compacto/desktop, resposta ao zoom, imutabilidade do ponto de rota, retorno booleano da visibilidade de placa, detecção da largura real do canvas e limite de uma placa de morador no mobile. Os testes existentes de 7 dias confirmam que os 13 pets continuam nos caminhos reais.
- **CI HEAD `879c1eb5` (#?):** `npm test` **422/422 aprovados, zero falhas**. Build temporário **966.467 bytes**, 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais e 86 nomes; nenhum preview versionado foi escrito.
- Playwright/Chromium: desktop **1440×960** e móvel com toque **390×844**, ambos com cinco incrementos de zoom e capturas welcome, jogo, closeup, mapa e após interação. Sem overflow horizontal, sem page errors JavaScript; duas mensagens de console `net::ERR_FAILED` são recursos externos bloqueados pelo harness.
- `Rua Joaquim Rodrigues` continua literal/canônica. Mapa ampliado e seleção de rota funcionaram; save experimental isolado permaneceu válido (v3, `belem-osm-2026.geojson`, coordenadas finitas).
- A captura móvel agora evita placas de animais em série; ainda há alguns sprites próximos no centro da cena quando as rotas convergem, mas sem nomes competindo sobre os corpos. O desktop mantém mais identificações simultâneas, coerente com a área maior. Chromium emulado não substitui ensaio em aparelho físico.
- [CI da subetapa 7.4](https://github.com/chumikie/Beit-Lehem/actions/runs/41344020396) · [capturas e relatório temporários](https://github.com/chumikie/Beit-Lehem/actions/runs/41344020396/artifacts/13097553993).

Próximo passo: avaliar os sprites ainda próximos no corredor central em zoom alto, sem aumentar os limites de deslocamento visual nem tocar nas posições de agenda; qualquer refinamento adicional deve continuar limitado à composição da câmera.

### Subetapa 7.5 — correção de espaçamento e legibilidade dos elementos existentes

- A correção principal atua em `streetPetCrowdVisible`, filtro de desenho já existente: o intervalo mínimo passa a 104 px em telas compactas e 80 px em desktop, sempre convertido pelo zoom. O filtro apenas evita desenhar silhuetas que se encostam; não cria animais, não altera rotas nem desloca pontos.

- A legibilidade das placas reaproveita `streetPetNameplateVisible` e `streetPetNameplateSlot`, sem um seletor adicional. O slot existente mantém no máximo três placas no desktop e uma em telas compactas; a ordem original dos candidatos preserva a prioridade de Bolt. No mobile, ele usa as faixas superiores já existentes da mesma função para afastar a placa do direcional tátil.

- O cartão “Cidade viva” continua sendo o componente existente. No mobile, sua tipografia e largura são ajustadas, a descrição continua disponível quando o jogador está parado e a ocultação durante a caminhada permanece sob a regra original. Somente os avatares decorativos redundantes são ocultados nesse enquadramento.

- O cartão existente “Próxima descoberta” recebe um ajuste específico até 360 px para manter o título e a distância legíveis ao lado dos controles de zoom, sem mudar o destino ou a rota.

- As regressões ficam junto de `tests/gemini-c15-pet-silhouette.test.cjs`, cobrindo a distância visual, resposta ao zoom, imutabilidade dos pontos de rota, limite do slot de placas e leitura do destino em 320 px. Não é criado módulo, entidade, sistema ou arquivo de teste isolado.

- Nenhuma alteração em geometria OSM, coordenadas, agendas, horários, rotas, missões ou saves. Nenhum HTML gerado versionado foi editado.

### 8. Modularizar o monólito de forma incremental

Separar responsabilidades de `gemini-modules/game.js` sem reescrever o jogo inteiro:

1. Definir um contexto explícito de dependências e estado, reduzindo o uso de novos globais `window.*`.
2. Extrair e testar a serialização/validação de saves em `save-manager.js`, sem mudar a chave nem o formato atual.
3. Extrair movimento do jogador, colisão, câmera e controles em `player-controller.js`.
4. Extrair diálogos, HUD e manipulação de DOM em `ui-controller.js`.
5. Isolar interações com o mundo em `world-interactions.js`.
6. Separar renderização em `world-renderer.js` depois que os contratos estiverem estáveis.
7. Manter `game.js` como composição/inicialização e coordenador dos sistemas.

A extração de `game-state.js` deve definir a criação/forma do estado sem transformá-lo em um novo objeto global onipresente. Não fazer a divisão em lote.

### 9. Validação integrada contínua

- Executar testes específicos do módulo alterado e depois `npm test`.
- Executar build em destino temporário e abrir a prévia em navegador; só escrever HTMLs versionados quando houver autorização específica.
- Testar rotas completas, salvamento/recarregamento e retomada de aba.
- Repetir inspeções em desktop e larguras móveis; testes Chromium emulados não substituem aparelhos físicos.
- Relatar explicitamente quais testes foram executados e quais inspeções reais continuam pendentes.

## Restrições de escopo

- Não editar manualmente HTMLs gerados em `previews/`.
- Não modificar a cópia congelada V2.27 para fazê-la passar em verificações.
- Não mudar chave/formato de save durante extração de módulos.
- Não mover ruas reais, inventar coordenadas ou transformar nomes ficcionais de POIs em nomes viários.
- Não adicionar missões, sistemas ou entidades novas como parte de uma etapa de arquitetura/performance, a menos que o autor peça.
- Não fazer merge, ativar/atualizar Pages ou publicar sem autorização expressa.

## Histórico de pesquisa local

Estudos de fachada, mercado, academia, flora, edifícios e referências visuais devem ser consultados apenas quando a tarefa correspondente voltar à fila. Distinguir fonte pública, confirmação do autor, hipótese e elemento ficcional. Não inferir lotes ou entradas a partir de numeração postal isolada.

## FJ1 — fatia vertical jogável Matriz → Mercado (proposta para decisão, 2026-11-02)

Este roteiro corresponde à proposta externa chamada “C12.0–C12.6”, **não** às etapas históricas C12/C12.1 deste projeto. Nada abaixo foi implementado nesta atualização documental. O alvo de **10–15 minutos é tempo real de sessão**, a verificar com pessoas, não duração garantida ou mudança no relógio fictício do jogo.

### Situação atual, sem confundir hipótese com implementação

| Elemento | Estado comprovado | Lacuna a avaliar |
|---|---|---|
| Caminhada pela Matriz e Mercado | Grafo de ruas OSM, destinos e controles de caminhada existem e passam no CI. | Tempo de descoberta e percurso de pessoas novas sem atalhos de teste. |
| “A manhã de Francisco” | Chegada, conversa, toldo, frutas, cestos, agradecimento e álbum têm estado/salvamento. | Começo orientado na Matriz e fechamento explícito de uma sessão curta. |
| Reconhecimento de vizinhos | Relações, encontros e memórias condicionais já existem em histórias maiores. | Um momento 4 consistente com **um encontro realmente registrado** durante essa fatia. |
| Etiquetas de animais | C11–C21 já introduziram limites e a C21 corrigiu o contorno. | Medir colisões de plaquinhas com sprites, balões e marcos no HEAD antes de novo ajuste. |
| Exportar/importar save | Save local v3 existente; compatibilidade com saves antigos é testada. | Fluxo seguro de download, validação e restauração controlada, sem nova chave. |
| Apresentação móvel | CI Chromium cobre 390×844 e 320×640. | Adicionar cenário de 360×640 e observar pessoas reais em dispositivo frio, só quando aprovado. |
| Silhueta dos marcos | Matriz, Mercado e Rodoviária possuem arte e legenda. | Reconhecimento sem rótulos, evitando inventar chão ou geografia. |

### Critérios provisórios FJ1 — não são os A1–A9 oficiais do Claude

- **P1 — Entrada:** início da manhã compreensível na Matriz; participante encontra a primeira ação sem tutorial obrigatório.
- **P2 — Percurso:** caminhada contínua da Matriz ao Mercado pelas ruas OSM existentes, sem teleporte obrigatório.
- **P3 — Marcos:** participante identifica Matriz/Mercado/Rodoviária pelo conjunto visual sem depender exclusivamente da legenda; quatro corredores viários são avaliados como orientação, não como adivinhação de nomes.
- **P4 — História:** sequência curta coerente de chegada, conversa, pequena ajuda, reconhecimento condicional e fechamento, sem retirar diálogos existentes.
- **P5 — Memória verdadeira:** um vizinho só reconhece a personagem pelo que aconteceu no save; sem afirmar encontro não realizado.
- **P6 — Fechamento e tempo:** resumo fiel das ações realizadas, opção clara de continuar explorando e aferição da meta de 10–15 minutos em sessões de teste, sem cronômetro punitivo.
- **P7 — Continuidade portátil:** exportação/importação local e reversível, com validação, confirmação e preservação da chave/esquema atual e dos saves existentes.
- **P8 — Interfaces:** desktop, 390×844 e 360×640 legíveis e operáveis, sem ocultar controles, caminhos, conversa ou legenda essencial.
- **P9 — Não regressão:** preservar OSM, 36 moradores, 13 animais, rotas, histórias, diálogos, arte não aprovada, HUD, saves, V2.27, suíte e CI.

Quando o documento original chegar, criar uma tabela de equivalência **P1–P9 ↔ A1–A9**, sem atribuir conteúdos inventados aos critérios oficiais.

### Etapas em PRs futuras distintas — backlog, não PRs abertas agora

Cada linha prevê **uma PR futura de escopo pequeno**, somente após aprovar a base de integração e o roteiro. A PR #2 atual não será dividida, fechada, mesclada ou publicada nesta rodada.

| Nome Claude → FJ1 | Uma PR planejada | Tarefas pequenas | Critérios provisórios |
|---|---|---|---|
| C12.0 → **FJ1.0** | Protocolo e teste exploratório | 1. Preparar formulário sem dados pessoais; 2. acompanhar 3–5 sessões do fluxo já existente; 3. registrar tempos e travas; 4. priorizar problemas observados. **Não exigir exportação ainda inexistente.** | P1, P2, P3, P6, P8 |
| C12.1 → **FJ1.1** | Save portátil | 1. Auditoria do esquema v3; 2. exportar JSON local; 3. validar importação sem execução de conteúdo; 4. prévia e confirmação de substituição; 5. teste de ida e volta e arquivo inválido. Nenhuma chave nova. | P7, P9 |
| C12.2 → **FJ1.2** | Escala e etiquetas | 1. Capturas do mesmo estado nos zooms; 2. medir silhuetas e retângulos de balões/placas; 3. corrigir **um** conflito comprovado; 4. regressão de posições e identidades. Não aplicar redução geral sem prova. | P3, P8, P9 |
| C12.3 → **FJ1.3** | Abertura e encerramento | 1. Testar primeiro convite na Matriz; 2. adaptar as etapas já existentes do Mercado; 3. reconhecimento condicional (momento 4); 4. resumo fiel (momento 5); 5. retomada após save. | P1, P4, P5, P6, P9 |
| C12.4 → **FJ1.4** | Celular | 1. Cenários Chromium 390×844 e 360×640; 2. verificar controle, balões e HUD; 3. corrigir só sobreposição reproduzida; 4. manter regressão 320×640. Não pedir teste no celular aquecido. | P2, P8, P9 |
| C12.5 → **FJ1.5** | Chão e leitura dos marcos | 1. Teste cego de silhueta; 2. selecionar **um** marco insuficientemente reconhecido; 3. propor tratamento mínimo dentro da arte ilustrativa; 4. comparar com escala/OSM inalterados e pedir aprovação artística. | P3, P9 |
| C12.6 → **FJ1.6** | Segunda validação | 1. Repetir protocolo com 3–5 participantes, sem presumir que serão os mesmos; 2. confrontar métricas da FJ1.0; 3. verificar save e conclusão; 4. entregar achados e decisão artística ao autor. | P1–P9 |

Uma PR por etapa não significa sete PRs criadas agora. Evitar PRs simultâneas contra a main; decidir a base de cada uma depois da revisão da PR #2. Em cada rodada entregar URL da PR, SHA, arquivos alterados, CI efetivo, evidências dos sete pontos e pendências.

### Cinco momentos da manhã — composição proposta

1. **Chegada à Matriz (futuro enquadramento):** o jogador percebe os caminhos e escolhe seguir para o Mercado, sem forçar deslocamento.
2. **Caminhada real:** a rota segue o grafo OSM existente, com observações opcionais.
3. **Feira e gentileza (já parcialmente jogável):** conversar com Francisco e, se quiser, estender toldo, separar frutas e empilhar cestos ilustrativos; agradecer e guardar lembrança.
4. **Ser reconhecido por uma vizinha — texto novo, NÃO implementado.** Somente quando o estado confirmar que Ciça presenciou uma ajuda/conversa anterior:
   - **Ciça:** “Oxente, você por aqui de novo! Lembrei da ajuda que deu na banca.”
   - **Lia:** “Foi uma manhã boa, né?”
   - **Ciça:** “Foi sim. Gentileza dessas fica na lembrança.”
   
   **Alternativa quando não existe lembrança válida** (não fingir reconhecimento):
   - **Ciça:** “Bom dia! Tá conhecendo o movimento da feira?”
   - **Lia:** “Tô caminhando sem pressa.”
   - **Ciça:** “Pois faça isso. Cada canto tem seu encanto.”
   
   Ambas são falas **ficcionais**, sem atribuir hábitos, fatos ou diálogos a comerciantes ou moradores reais.
5. **Fechar a manhã — texto novo, NÃO implementado.** Depois das tarefas efetivamente concluídas:
   - **Francisco:** “Prontinho. A banca ficou arrumada. Obrigado pela mãozinha, viu?”
   - **Lia:** “Gostei de passar a manhã por aqui.”
   - **Francisco:** “E eu gostei da companhia. A conversa fica pra outro dia.”
   
   **Cartão de resumo condicional:** “Hoje você saiu da Matriz, caminhou até o Mercado e conversou com Francisco. [Se for verdade: ajudou com toldo/frutas/cestos.] [Se for verdade: reencontrou Ciça.] Uma lembrança dessa manhã ficou no álbum.” Não listar ações ausentes; não criar prêmio fictício nem encerrar a exploração livre. Se houver saída antecipada, mostrar “Você pode retomar de onde parou”, não uma conclusão falsa.

### Roteiro de teste com 3–5 jogadores — primeiro ciclo FJ1.0

**Antes:** consentimento simples para registrar observações anônimas, sem coletar nome completo, conta, chave de save ou qualquer conteúdo pessoal. Uma pessoa modera, outra observa se disponível. Apresentar o objetivo como “passear pela cidade e encontrar uma manhã de feira”, sem ensinar o caminho. Não pedir testes em celular aquecido; testes físicos dependem de aprovação e aparelho frio.

**Durante (até 15 min como meta, sem interromper abruptamente se demorar):**

1. Começar com save descartável/isolado em sessão de pesquisa; registrar dispositivo, viewport, zoom e versão/commit. Não usar save pessoal.
2. Iniciar na Matriz. Perguntar “O que você acha que dá para fazer primeiro?”. Registrar **tempo até a primeira ação**, hesitação e pedidos de ajuda.
3. Pedir “Encontre o Mercado pelas ruas do jogo”. Registrar tempo de partida, desvios, cliques errados, uso de mapa, rota, etiqueta e HUD.
4. No Mercado, deixar descobrir Francisco e as tarefas sem conduzir. Registrar tempo até primeira conversa, número de tentativas, dúvidas e estado real do capítulo.
5. Observar se aparece reconhecimento coerente ou confusão com moradores; na FJ1.0 anotar apenas o comportamento já existente, pois o momento 4 novo ainda não estará implementado.
6. Perguntar “Você sabe quando essa manhã terminou e se seu progresso ficou guardado?”. No primeiro ciclo, **não** alegar conclusão nova/exportação como pronta.
7. Se houver bloqueio, anotar minuto, lugar, elemento coberto, ação tentada, mensagem recebida e intervenção do moderador. Salvar captura apenas com consentimento e sem informações pessoais.

**Após (3–5 min):** perguntas abertas: “Onde você achou que estava?”, “Qual foi o primeiro destino?”, “Como reconheceu o Mercado?”, “Qual fala ficou na memória?”, “Em que momento ficou perdido?”, “O que achou que foi salvo?”, “O que teria vontade de fazer depois?”. Escala de clareza 1–5 para começo, caminhada, conversa e fim. Registro mínimo por participante: T0, primeira ação, chegada ao Mercado, conversa, ajuda, percepção de fim, travas e observações. Não fazer média esconder casos individuais em amostra de 3–5.

### Teste de reconhecimento dos marcos sem legenda

Usar **cópias de capturas Chromium** do mesmo SHA, ângulo, escala, horário e tamanho; ocultar somente a legenda nominal **na cópia de pesquisa**, sem patch no jogo ou no OSM. Apresentar individualmente Matriz, Mercado e Rodoviária em ordem aleatória; dar até 10 s por imagem e perguntar: “Que lugar parece ser?”, “Que detalhe ajudou?” e “Quanta certeza você tem (1–5)?”. Registrar acerto espontâneo, tempo, pistas citadas e confusões. Depois mostrar a legenda como controle para distinguir desconhecimento da cidade de silhueta ambígua.

Para as **quatro ruas**, não exigir que um novato adivinhe nomes OSM apenas por telhados. Testar orientação (“Você percebe uma rua, acesso, cruzamento e por onde seguiria?”), continuidade da caminhada e correspondência com o mapa. Candidatas com nomes OSM verificados: Rua João Pessoa, Rua Vicente Cado, Rua Feliciano Pedrosa e Rua Joaquim Rodrigues. Confirmar com o autor os quatro enquadramentos.

Critério quantitativo de reconhecimento ainda **não aprovado**: com apenas 3–5 pessoas, reportar cada resposta e não transformar uma porcentagem isolada em veredito artístico. O autor decide se a silhueta merece mudança.

### Entrega para revisão independente a cada rodada

- Link da PR e commit SHA exato (se ainda não houver PR futura, informar “planejada, não criada”).
- Comparação com baseline visual do mesmo cenário em **sete referências**: Matriz, Mercado, Rodoviária e quatro ruas confirmadas; mesmo zoom/viewport/horário quando possível.
- Dizer o que mudou na arte e o que permaneceu igual, distinguindo resultado de Chromium emulado de teste real.
- CI, contagem de testes, integridade do mapa/saves e pendências de aprovação. Nenhuma publicação, merge ou aprovação artística automática.
