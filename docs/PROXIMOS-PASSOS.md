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

### 5. Build isolado e revisão visual — próxima etapa

- Acrescentado ao workflow um passo que executa `buildGeminiPreview` em arquivo temporário fora do repositório e valida 462 vias, 20 áreas, 9 pontos OSM, 9 POIs locais e 86 nomes de ruas.
- Esse passo não escreve em `previews/`, não altera `publicacao/index.html` e não gera artefato publicado.
- A execução desse novo passo ainda precisa concluir no commit que o introduziu.
- Depois, abrir uma saída temporária no navegador e conferir nomes de ruas, posição das casas, POIs, fachadas, rotas e salvamento em desktop e móvel. Inspeção visual não deve ser declarada concluída apenas com testes de código.

### 6. Modularizar o monólito de forma incremental

Separar responsabilidades de `gemini-modules/game.js` sem reescrever o jogo inteiro:

1. Definir um contexto explícito de dependências e estado, reduzindo o uso de novos globais `window.*`.
2. Extrair e testar a serialização/validação de saves em `save-manager.js`, sem mudar a chave nem o formato atual.
3. Extrair movimento do jogador, colisão, câmera e controles em `player-controller.js`.
4. Extrair diálogos, HUD e manipulação de DOM em `ui-controller.js`.
5. Isolar interações com o mundo em `world-interactions.js`.
6. Separar renderização em `world-renderer.js` depois que os contratos estiverem estáveis.
7. Manter `game.js` como composição/inicialização e coordenador dos sistemas.

A extração de `game-state.js` deve definir a criação/forma do estado sem transformá-lo em um novo objeto global onipresente. Não fazer a divisão em lote.

### 5. Validação integrada

- Executar testes específicos do módulo alterado e depois `npm test`.
- Executar `npm run build` e abrir a prévia gerada.
- Testar rotas completas, salvamento/recarregamento e retomada de aba.
- Fazer inspeção em desktop e em larguras móveis; não declarar acabamento móvel apenas porque existe um alias HTML com nome mobile.
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
