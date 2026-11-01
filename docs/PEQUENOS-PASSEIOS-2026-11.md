# Pequenos Passeios — autonomia social sem inventar caminhos

Estado em 01/11/2026: **implementado e testado na cópia local; integração com a branch remota da PR #1 pendente**. A V2.27 oficial e o mapa de ruas não foram modificados.

## O que é jogável na cópia local

Uma visita breve por semana, a partir da segunda semana do calendário fictício, em sequência rotativa:

| Semana no jogo | Visita fictícia | Trajeto na malha OSM existente | Conversa |
| --- | --- | --- | --- |
| 2ª | Bia → Lúcia | Rodoviária → Matriz | Trocar notícias do caderno |
| 3ª | Damião → Bia | Mercado → Rodoviária | Compartilhar uma novidade |
| 4ª | Lúcia → Damião | Matriz → Mercado | Cumprimentar na feira |

As semanas seguintes repetem os tipos de encontro com dias diferentes, sem gerar nova missão ou bônus. Cada visita tem chegada, conversa de alguns minutos e retorno. As trajetórias são interpoladas **sobre os vértices da malha atual**: as três ligações foram conferidas no grafo de `dist/map.json`, com distâncias cartográficas aproximadas de 787 m, 613 m e 187 m. Não se trata de endereços ou horários verdadeiros de moradores reais.

**Prioridade:** encontros comunitários, visitas semanais antigas e eventos narrativos já existentes têm precedência. Se um compromisso prioritário impedir a visita curta, ela não deve aparecer como acontecimento concluído ou ser mencionada como fato ocorrido.

## Memória social e diário

- `smallWalksSeen` registra apenas encontros com ambos os moradores presentes, próximos entre si e ao jogador, sem animação de chegada pendente. O diário mostra **👀 Presenciou**.
- `smallWalkReports` registra o relato contado **dias depois por um dos dois participantes**. O diário mostra **✉️ Ouviu de**; o jogador não passa a ter presenciado uma cena que não viu.
- Os registros usam identificador, dia do acontecimento e fonte; relatos também têm `heardDay` e personagem que contou. A restauração rejeita datas futuras, eventos inexistentes, duplicatas e conhecimento atribuído a quem não participou.
- Não há moedas, selos ou recompensas repetidas. O resumo de retorno inclui observações e relatos novos, sem criar tarefas obrigatórias. Salvamentos antigos começam com listas vazias; reiniciar a aventura limpa ambas.

## Verificação local

- `npm test`: **190 testes, zero falhas**, incluindo `tests/gemini-small-walks.test.cjs` para rota, agenda, prioridade, salvamento e diário.
- `npm run build:development-preview`: prévias desktop e celular reconstruídas; a fonte arquivada e a V2.27 ficaram intactas.
- A conferência visual manual fica com a frente artística separada.

## Pendência antes de disponibilizar código e HTML na PR #1

O arquivo local `gemini-modules/game.js` contém histórias anteriores ainda não integradas. Entretanto, a branch remota da PR #1 teve alterações visuais próprias nesse mesmo arquivo. Copiar integralmente qualquer uma dessas versões **sobrescreveria trabalho da outra frente**. É necessária uma integração preservando ambos os conjuntos, seguida de nova execução dos testes e reconstrução das prévias **do resultado combinado**. Não fazer merge nem publicação.
