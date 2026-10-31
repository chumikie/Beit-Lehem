# Mapa do código — consultar por tarefa

| Sistema | Arquivos principais | Integração a consultar |
| --- | --- | --- |
| Ruas e geografia | `dist/map.json`, `source/belem-osm-2026.geojson`, `prepare_map.py` | `game.js`: `preprocess`, `drawRoads`, `nearestRoad` |
| Movimento do jogador e câmera | `dist/game.js` | `move`, `frame`, `clickWorld`, `setRoute`, `resize` |
| Caminhos | `dist/pathfinding.js`, `dist/street-life.js` | `walkingPoint`, `encounterRoadPoint` |
| Movimento dos moradores | `dist/resident-motion.js`, `dist/crowd-flow.js` | `residentsInStreets`, `secondaryInStreets`, `drawStreetLife` |
| Arte dos moradores | `dist/game.js` | `drawKawaiiWalker`, `drawSecondaryWalker`, `drawGuide`, `drawPlayer`, retratos |
| Fachadas e composição | `dist/central-blocks.js`, `dist/facade-studio.js`, `dist/scenic-placement.js`, `dist/landmarks.js` | `preprocess`, `house`, `drawScenicLayer` |
| Rotinas e relações | `dist/living-world.js`, `dist/secondary-neighbors.js`, `dist/affection-memory.js` | `meetResident`, `talkResident`, `talkSecondary` |
| Encontros e gestos | `dist/street-encounters.js`, `dist/street-community.js`, `dist/street-greetings.js`, `dist/street-moments.js`, `dist/encounter-choreography.js` | `drawStreetLife`, observação dos encontros |
| Mercado | `dist/market-morning.js`, `dist/market-scene.js`, `dist/fair-streets.js` | funções do Mercado em `game.js`, diálogo em `cozy-ui.js` |
| Lúcia e Bia | `dist/lucia-garden.js`, `dist/bia-letters.js` | funções dos respectivos capítulos em `game.js` |
| Natureza e terreno | `dist/grounded-flora.js`, `dist/terrain-relief.js`, `dist/cozy-atmosphere.js`, `dist/terrain.json`, `dist/geology.json` | desenho ambiental e atlas em `game.js` |
| Interface | `dist/index.html`, `dist/cozy-ui.js`, `dist/style.css`, `dist/cozy.css` | manipuladores e `updateUI` em `game.js` |
| Salvamento | `dist/game.js`, funções `restore` dos módulos | `save`, carregamento em `preprocess`, eventos de saída |
| Export offline | `build-standalone.cjs`, `scripts/project.cjs` | saída em `build/`; baseline congelada separada |
| Testes | `tests/*.test.cjs` | `npm test` roda todos localmente |

`game.js` ainda concentra funções de várias áreas. Dividi-lo é trabalho gradual: extrair um sistema de cada vez, com comportamento preservado e teste pertinente. Não reorganizar tudo junto de uma reformulação visual.
