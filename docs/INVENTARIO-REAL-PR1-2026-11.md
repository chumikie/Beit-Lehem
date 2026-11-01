# Beit Lehem — inventário real da PR #1 (01/11/2026)

> **Fonte única de triagem técnica**, não certificado de qualidade visual. Conferido sobre a base Gemini integrada, módulos `gemini-modules/`, testes `tests/` e geradores `scripts/`. A base oficial V2.27 permanece separada. **Prioridade do autor: jogabilidade de computador; publicação online e acabamento de celular fora do foco atual.**

## Como ler os estados

- **Implementado e testado na lógica:** código presente na prévia experimental e testes automatizados aplicáveis aprovados; não significa uma experiência visual conferida.
- **Implementado, a validar na experiência:** aparece no código, mas ainda requer sessão jogável integral, observação ou aceitação pelo autor.
- **Experimental:** disponível na base Gemini, mas não aprovado como sistema estável.
- **Somente pesquisa:** referências documentais levantadas; **não há destino, geometria, acesso ou interação confirmada no jogo** para esse item.
- **Ideia:** roteiro proposto, sem implementação correspondente confirmada.

## O que entrou no jogo

| Sistema / experiência | Estado | Evidência de implementação | O que falta para considerar concluído |
| --- | --- | --- | --- |
| Mapa de Belém, ruas e roteamento | Implementado e testado na lógica | `dist/map.json`, `tests/data.test.cjs`, `tests/pathfinding.test.cjs` | Cobertura dos POIs e conferência espacial de destinos novos |
| Caminhada, câmera e moradores em trajetos | Implementado, a validar na experiência | `gemini-modules/game.js`, `resident-motion.js`, `living-world.js`; testes de percurso | Inspeção de deslocamento, escalas e situações reais de jogo |
| Matriz, Mercado, Rodoviária e fachadas | Implementado, a validar na experiência | `gemini-modules/landmarks.js`, `facade-studio.js`, `central-blocks.js`, `scenic-placement.js` | Aceitação visual e observação de colisões/oclusões no jogo |
| Feira e capítulo do Mercado | Implementado e testado na lógica | `tests/market-morning.test.cjs`, `tests/market-consequences.test.cjs`, `gemini-modules/game.js` | Explicitar acesso, completar experiência com o jogador; uniformizar nome Francisco |
| Bia, Téo, cartas e recados | Implementado e testado na lógica | `tests/bia-letters.test.cjs`, `tests/gemini-teo-recados.test.cjs`, `gemini-modules/game.js` | Conferir fluidez das conversas e caminho de descoberta |
| Lúcia, crescimento da muda e Zeca | Implementado e testado na lógica | `gemini-modules/lucia-garden.js`, `tests/gemini-garden-memories.test.cjs` | Confirmar estágios e tempo ausente numa partida completa |
| Rua Nova: três descobertas e lembranças | Implementado e testado na lógica | `tests/gemini-rua-nova-paths.test.cjs`, `tests/gemini-cross-memories.test.cjs` | Validar encontros, caminhos e textos na experiência |
| Memória social, tradições, desfechos semanais | Implementado e testado na lógica | `tests/gemini-city-reports.test.cjs`, `tests/gemini-friendship-traditions.test.cjs`, `tests/gemini-multiweek-endings.test.cjs` | Dar visibilidade às consequências e verificar ordens de jogo |
| Pequenos Passeios (Bia, Lúcia, Francisco) | Implementado e testado na lógica | `gemini-modules/living-world.js`, `tests/gemini-small-walks.test.cjs`; caderno de retorno | Conferir encontro no cenário e percepção do jogador; começa na 2ª semana |
| Fauna existente, Bolt e reações | Implementado e testado na lógica | `tests/gemini-pet-behavior.test.cjs`, `tests/gemini-pet-proximity.test.cjs` | Inspeção de sobreposições e naturalidade dos movimentos |
| Pausas, observações e bons-dias | Implementado e testado na lógica | `tests/gemini-world-pauses.test.cjs`, `tests/gemini-morning-greetings.test.cjs` | Ações descobríveis, animações e legibilidade das respostas |
| Padaria da Tia e história do pão | Implementado e testado na lógica **como ficção** | `tests/gemini-padaria-da-tia.test.cjs`, `tests/gemini-bread-stories.test.cjs` | Localização real da referência comercial **não** resolvida; revisar terminologia visual residual |
| São Pedro: conversas e memórias | Implementado e testado na lógica | `tests/gemini-sao-pedro-memory.test.cjs` | Não confundir capítulo com representação cartográfica completa do evento |
| Hidrografia inicial | Implementação parcial | `source/belem-aguas-osm-2026-11-01.geojson`, `tests/gemini-hydrography.test.cjs`, `scripts/build-gemini-preview.cjs` | Levantar demais corpos d'água, validar entorno e contemplação visual |
| Camucá: observações e capítulos preparatórios | Implementado **sem rota de trilha** | `tests/gemini-camuca-stories.test.cjs`, `gemini-modules/game.js` | Confirmar acesso público da Trilha; nunca indicar passagem não verificada |
| Diário de retorno | Implementado, a validar na experiência | `renderStoryTracker()` em `gemini-modules/game.js`, `tests/gemini-return-notebook.test.cjs` | Simplificar acesso e diferenciar bem concluído / possível / ouvido / visto |
| Salvamento e migração interna de novas memórias | Implementado e testado por partes | Testes de Bia, Lúcia, Passeios, Mercado, retorno e outras migrações | Teste humano de partida longa, exportação/reimportação e retomada sem perda |
| Moto e contatos Gemini | Experimental | `gemini-modules/moto-experimental.js`, `gemini-modules/game.js` | Não confundir disponibilidade experimental com aprovação |

## Geografia pesquisada, **ainda não entregue como novo destino validado**

| Referência | Estado | Pendência antes de implementar |
| --- | --- | --- |
| Padaria 3 de Maio e fábrica | Somente pesquisa geográfica; história ficcional já existe | Coordenadas, lote, fachada e entrada pública confirmados separadamente |
| Cemitério de Belém | Somente pesquisa | Perímetro e entrada pública georreferenciados |
| Caixa(s)-d'água e igrejas adicionais | Somente pesquisa | Inventário OSM, fotografia e posição verificável |
| Praça 6 de Setembro | Pesquisa inicial; novas interações são **ideia** | Polígono, âncoras de circulação e pontos de descanso sem inventar mobiliário |
| Praça Boa Vista | Somente pesquisa | Polígono verificável |
| Espaço Vó Donzinha | Somente pesquisa | Fachada, entrada e localização da referência |
| Hospital, UBS e postos de combustível | Somente pesquisa para novos detalhes | Entrada, sentido da via e circulação pública; não inventar estacionamentos |
| Parque São Luís e brinquedos de sucata | Ideias apoiadas em referência local | Levantamento dos brinquedos representados, acesso e interações |
| Trilha do Camucá e acesso à Fazenda Camucá | Somente pesquisa sobre acesso | Demonstrar percurso público e permitido antes de torná-lo jogável |

## Por que há tantos commits, mas poucas novidades óbvias?

Uma classificação **aproximada apenas pelos títulos** dos 345 commits do histórico local integrado encontrou **123 prévias/builds**, **41 testes**, **19 relatórios/documentação** e **162 outros** (código, artes, correções e integração misturados). Não é uma auditoria linha por linha; uma atualização de três HTMLs pode gerar três commits e não acrescentar três funcionalidades. A PR tem 125 arquivos alterados; ela não equivale a 345 capítulos ou versões do jogo.

As prévias HTML compiladas são snapshots: atualizar a PR não altera automaticamente um HTML previamente baixado nem uma página pública separada. Os três arquivos em `previews/` são gerados da mesma experiência Gemini responsiva; **não são três jogos diferentes**.

## Critérios de conclusão daqui em diante

1. **Foco em jogabilidade desktop**. Não condicionar novos capítulos a publicação online ou refação do celular.
2. Cada entrega deve ter **local/horário/ação reconhecíveis**, entrada intuitiva, efeito visível, persistência testada e orientação curta de *como jogar*.
3. Não chamar uma referência pesquisada de *implementada* nem um teste unitário de *inspeção visual aprovada*.
4. Tratar `docs/PROXIMOS-PASSOS.md` e documentos históricos como **contexto datado**; este inventário determina a classificação atual, até nova verificação.
5. Antes de nova expansão, uma rodada completa no computador cobrindo **Matriz → Mercado → Rodoviária → Diário → salvar/retomar**, registrando falhas reais.
6. A PR #1 permanece em rascunho, **sem merge**; preservar alterações visuais paralelas.
