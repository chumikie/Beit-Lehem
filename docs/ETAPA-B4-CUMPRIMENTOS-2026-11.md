# Etapa B4 — cumprimentos espontâneos sobre a malha real

**Base da PR #2:** B2 preservou a transição de visibilidade e retomada sem salto; B3 diversificou itinerários por morador. Não houve mudança em horários, malha, marcos, história, saves ou elenco.

## Bloqueio reproduzido

`RoncadorStreetGreetings.create().setJunctions()` usa os entroncamentos de `RoncadorRoadDetails.prepare(dist/map.json)`. O filtro de 22 m impedia toda posição amostrada de pares que já atendesse distância entre pessoas (23–64 m) e conexão viária (rota no grafo até `1,3 ×` a separação direta + 3 m).

Varredura determinística de **1.000 posições** por dupla (trajetos da B3, distâncias do grafo projetado):

| Núcleo / dupla | Distância + rota válidas | Elegíveis com 22 m | Elegíveis com 12 m |
| --- | ---: | ---: | ---: |
| Mercado — Francisco e Ciça | 146 | **0** | **61** |
| Matriz — Lúcia e Nara | 208 | **0** | **2** |
| Rodoviária — Bia e Téo | 280 | **0** | **15** |

**Interpretação:** são posições geométricas candidatas na simulação, **não número de conversas por dia**. A baixa oportunidade na Matriz continua sendo limitação a observar; não foram criadas ruas nem teletransportes.

## Mudança mínima

- `gemini-modules/street-greetings.js`: raio de proteção imediata de entroncamento passa de **22 m para 12 m**. O raio de 8 m sugerido pelo Gemini Argon foi considerado permissivo demais para esta etapa.
- Continuam obrigatórios: distância mínima e máxima entre moradores, caminho viário conectado, proteção contra terceiros próximos, cooldown de duplas/pessoas, limite de horário e prioridade de compromissos.
- Fases de gesto `notice → chat → look → wave → turn` e retorno pelo módulo de movimento da B2 não foram reescritas.
- `tests/gemini-greetings-real-map.test.cjs`: compara bloqueio antigo e novas oportunidades com junções reais, comprova que as três duplas chegam à conversa e à despedida, recusa encontros por rua desconectada ou passagem ocupada e verifica alteração do horário fictício com tempo de simulação contínuo.

## Verificações

- **222 testes aprovados, 0 falhas** (`npm test`).
- Base V2.27 intacta (`npm run verify:baseline`).
- HTML principal e cópias de compatibilidade reconstruídos (`npm run build:development-preview`).
- **Inspeção visual no navegador não realizada.** Os testes comprovam a lógica e o uso de geometria do jogo; não homologam legibilidade de balões, eventual sobreposição real de sprites nem naturalidade de todos os encontros em uma partida longa.

## Próximo cuidado

Em sessão manual de jogo, acompanhar separadamente Mercado, Matriz e Rodoviária: se Lúcia e Nara ainda se cumprimentarem raramente, não diminuir o raio automaticamente. Primeiro estudar simultaneidade dos horários, posição dos caminhos e fluxo dos NPCs respeitando entradas e cruzamentos.
