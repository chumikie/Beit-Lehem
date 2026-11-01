# Etapa B — auditoria das três histórias principais

**Base:** Gemini experimental na PR #1. **Foco:** jogabilidade desktop, sem publicação, merge ou novas localidades.

## Fluxos confirmados no código

| Capítulo | Desbloqueio | Progresso | Conclusão e persistência |
| --- | --- | --- | --- |
| Francisco / Feira | Chegar ao Mercado e conversar próximo a Francisco | Estender toldo, organizar frutas e cestos; requer presença dele numa manhã de trabalho | `marketMorning.claimed`, nota e memória no álbum; restauração idempotente |
| Lúcia / Jardim | Concluir Feira, ir à Matriz e conversar com Lúcia | Preparar terra, plantar, regar, escolher memória; requer presença de Lúcia | `luciaGarden.claimed`, etapa de crescimento por dia fictício, álbum; restauração preserva trabalho incompleto |
| Bia / Cartas | Concluir Jardim, ir à Rodoviária e conversar com Bia | Abrir caderno, escolher tema, selar, agradecer; requer presença de Bia | `biaLetters.claimed`, carta e álbum; restauração preserva tema e selo |

## Defeito de usabilidade encontrado e correção

A conversa que apresentava a atividade acontecia no diálogo de moradores (`lifeDialog`), mas o jogador era orientado a **fechar esse diálogo e procurar outro painel** na lateral. A progressão existia, porém era difícil identificá-la. O novo botão `chapterConversationFollowup` aparece junto à conversa **somente se** o morador estiver perto, a introdução tiver acontecido e a história ainda estiver incompleta. Ele reaproveita a ação do capítulo já implementada (`marketChapterAction`, `luciaChapterAction`, `biaChapterAction`), sem duplicar lógica, memórias ou recompensas. Fora do horário, indica que é preciso voltar durante a rotina habitual; não inventa conclusão nem movimenta personagens.

## Evidência de validação

- `tests/gemini-chapter-handoff.test.cjs`: novas verificações da sequência, ausência de atalho prematuro, conclusão única, restauração de progresso e restrição de horários; testes anteriores de cada história continuam ativos.
- Suíte completa após a alteração: **208 testes, 0 falhas**.
- `npm run verify:baseline`: hash da V2.27 confere.
- `npm run build:development-preview`: três prévias locais reconstruídas da mesma base Gemini; nenhuma foi publicada.

## Ainda não declaramos aprovado

- Conferência manual, no navegador, dos percursos **Mercado → Matriz → Rodoviária**, da distância real de interação e da leitura do novo botão no painel.
- Teste humano de uma partida longa com salvamento, fechamento do navegador e retomada dias depois. Os testes automatizados cobrem restauração de estados, mas não substituem esse percurso completo.
- Simplificação do diário e dos controles — pertence à frente de apresentação, não foi alterada nesta etapa.

**Como encontrar:** abra o caderno de moradores, encontre e converse de perto com Francisco, Lúcia ou Bia **após cumprir a história anterior**. Quando a atividade estiver disponível, surge um botão direto logo abaixo da fala para continuar o capítulo.
