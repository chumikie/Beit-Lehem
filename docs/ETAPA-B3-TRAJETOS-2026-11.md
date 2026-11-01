# Etapa B3 — trajetos independentes na malha existente

**Base:** PR #2, commit `bbe4016` da Etapa B2. **Fonte adicional:** relatório Gemini Argon entregue pelo autor. Nenhuma alteração de mapa, horários, salvamentos, missões ou posicionamentos de marcos.

## Diagnóstico reproduzido com `dist/map.json`

O itinerário antigo escolhia no máximo dois ramos por paridade e encerrava após aproximadamente 32 m. Moradores com `variant` 0/6, 1/7 e 2/8 repetiam a mesma polilinha.

| Região | Morador | Antes | Depois |
| --- | --- | --- | --- |
| Mercado | Francisco (`damiao`, 0) | 41,6 m / 2 vértices | 41,6 m / 2 vértices |
| Mercado | Ciça (6) | 41,6 m / 2 vértices, **mesmo ramo** | **89,5 m / 3 vértices, ramo diferente** |
| Matriz | Lúcia (1) | 33,2 m / 3 vértices | **84,9 m / 6 vértices** |
| Matriz | Nara (7) | 33,2 m / 3 vértices, **mesmo ramo** | **87,6 m / 9 vértices, ramo diferente** |
| Rodoviária | Bia (2) | 44,4 m / 3 vértices | **92,9 m / 3 vértices** |
| Rodoviária | Téo (8) | 44,4 m / 3 vértices, **mesmo ramo** | **56,0 m / 4 vértices, ramo diferente** |

Todas as medidas são calculadas em coordenadas projetadas do extrato OSM atual; não são distâncias reais medidas em campo. **Francisco continua num trecho curto de 41,6 m**, porque os limites locais e a topologia disponível não justificam inventar outro caminho só para impor uma meta de 60 m.

## Correção

- `dist/street-life.js`: escolhe entre todos os ramos elegíveis usando uma variação completa por morador; remove o corte precoce de 32 m, mantendo limite padrão de 95 m, proibição de vértices repetidos e no máximo 12 passos.
- `gemini-modules/street-life.js`: mesma lógica extraída da fonte experimental, para que a **prévia HTML também use o código corrigido**. A fonte arquivada permanece intacta.
- `tests/matriz-mercado-circulation.test.cjs`: testa divergência de polilinhas, adjacência real dos vértices OSM, limite de distância, continuidade da amostragem, pausas, preservação de horários e paridade entre código de teste e código compilado da prévia.

## Validação

- `npm test`: **218 aprovados, 0 falhas** na cópia isolada da PR #2.
- `npm run verify:baseline`: V2.27 intacta.
- `npm run build:development-preview`: HTML principal reconstruído e cópias de compatibilidade sincronizadas; verificada presença da nova seleção de ramos no HTML gerado.
- **Inspeção visual no navegador não realizada nesta etapa.** A comparação antes/depois é geométrica e automatizada, não captura visual homologada.

## Fora do escopo

Não reduzimos raios de esquina, não alteramos o sistema de cumprimentos, não mudamos horários/almoço de Lúcia/Ciça, não deslocamos prédios nem águas, não adicionamos micro-atividades. O diagnóstico geográfico e a acessibilidade dos encontros precisam de investigação própria, sem misturar regressões na Etapa B3.
