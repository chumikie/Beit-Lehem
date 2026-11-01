# Mapa do código — versão atual

## Fluxo geral

```text
fontes geográficas + validações locais
                │
                ▼
       preparação / dados de mapa
                │
                ▼
        gemini-modules/
                │
                ▼
 scripts/build-gemini-preview.cjs
                │
                ▼
 scripts/build-development-preview.cjs
                │
                ▼
 previews/beit-lehem-development.html
                │
                ▼
          navegador local
```

**Atenção:** a preparação OSM que gera dados em `dist/` pertence à linha antiga. A prévia atual também contém dados de mapa embutidos na fonte Gemini e no processo de build. Esses fluxos ainda precisam ser consolidados; não presumir que editar o GeoJSON atualiza automaticamente o mapa que o jogo exibe.

## Sistemas ativos

| Sistema | Fonte atual | Responsabilidades / pontos de entrada |
| --- | --- | --- |
| Inicialização, estado e pré-processamento | `gemini-modules/game.js` | Estado do jogo, canvas, dados, `preprocess`, composição e loop principal |
| Ruas e posicionamento | `gemini-modules/game.js` | Segmentos, `nearestRoad`, geração de casas e afastamento de árvores |
| Movimento do jogador e câmera | `gemini-modules/game.js` | Entrada, deslocamento, colisão, câmera e atualização de quadro |
| Rotas e vida nas ruas | `gemini-modules/street-life.js`, `game.js` | Pontos de caminhada, encontros e circulação na malha atual |
| Moradores e multidão | `gemini-modules/resident-motion.js`, `crowd-flow.js`, `secondary-neighbors.js` | Rotinas, movimento e presença de moradores |
| Cumprimentos e momentos | `gemini-modules/street-greetings.js`, `street-moments.js` | Gestos, encontros e pequenas cenas |
| Marcos e pontos de interesse | `gemini-modules/landmarks.js` | Identidades e destinos ilustrativos |
| Quadras e fachadas | `gemini-modules/central-blocks.js`, `facade-studio.js`, `scenic-placement.js` | Composição visual, fachadas e posicionamento de cenas |
| Mundo vivo e relações | `gemini-modules/living-world.js`, `affection-memory.js` | Rotinas e memória de relações |
| Terreno e atmosfera | `gemini-modules/terrain-relief.js` | Relevo e camadas de terreno |
| Jardim de Lúcia | `gemini-modules/lucia-garden.js` | Sistema do jardim e seus estados |
| Experimento de moto | `gemini-modules/moto-experimental.js` | Sistema experimental; não tratar como estável sem revisão |
| Interface e salvamento | `gemini-modules/game.js` e módulos chamados por ele | DOM, HUD, diálogos e persistência local; ainda sem módulos dedicados de UI/save |
| Testes | `tests/*.test.cjs` | Testes automatizados de lógica, contratos e regressões |

O arquivo `gemini-modules/game.js` ainda é grande e concentra áreas demais. A modularização proposta é incremental: `game-state.js`, `save-manager.js`, `player-controller.js`, `ui-controller.js`, `world-interactions.js` e `world-renderer.js`. Esses nomes são destinos de arquitetura, não arquivos que já devam ser presumidos existentes.

## Dados geográficos

- `source/belem-osm-2026.geojson`: fonte geográfica OSM usada pelo pipeline de preparação antigo.
- `import_belem_osm.py` e `prepare_map.py`: importação/preparação para a linha antiga.
- Mapa embutido na base Gemini: fluxo atual consumido pela prévia; precisa ser ligado a uma fonte canônica para evitar deriva.
- Política de nomes: nomes de ruas preservados exatamente; POIs podem ter alias de exibição separado da origem; ilustração não é cadastro de lote.

## Build e artefatos

| Caminho | Papel |
| --- | --- |
| `gemini-modules/` | Fonte editável dos sistemas atuais |
| `scripts/build-gemini-preview.cjs` | Compõe os módulos na prévia Gemini |
| `scripts/build-development-preview.cjs` | Gera o HTML principal e as duas cópias de compatibilidade |
| `previews/beit-lehem-development.html` | HTML principal gerado |
| `previews/beit-lehem-development-mobile.html` | Cópia de compatibilidade atual, ainda idêntica ao principal |
| `previews/gemini-preview.html` | Alias antigo de compatibilidade |
| `references/gemini-2026-10-31/` | Fonte original arquivada e índice de trechos |
| `baseline/` | Snapshot histórico V2.27, imutável |
| `dist/` | Módulos e dados da linha antiga, não a fonte ativa |
| `tests/` | Testes automatizados |

## Como trabalhar

1. Começar pelo módulo atual mais próximo da funcionalidade.
2. Consultar apenas as dependências diretas e a seção pertinente do índice da fonte arquivada, se necessário.
3. Alterar a fonte, nunca o HTML gerado diretamente.
4. Preservar ordem, seeds, coordenadas, nomes de rua e esquema de save quando a tarefa não pedir alteração explícita.
5. Rodar testes específicos, `npm test` e `npm run build`; fazer inspeção manual quando disponível.
6. Registrar limites: teste automatizado não comprova visual em navegador ou aparelho físico.

A V2.27 pode ser consultada como histórico, mas não define a arquitetura ou a experiência que a versão atual deve reproduzir.
