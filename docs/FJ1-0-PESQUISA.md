# Beit Lehem — FJ1.0 · Pacote de pesquisa exploratória

**Estado:** protocolo preparado; pesquisa com pessoas ainda **não executada**. Não constitui aprovação artística.
**Fonte jogável:** [PR #2](https://github.com/chumikie/Beit-Lehem/pull/2), branch `chore/consolidar-html-principal-2026-11-01`. Usar o **SHA do artefato do CI FJ1.0**, não presumir que o Pages corresponde ao HEAD.
**Limites:** nenhum merge, publicação, alteração da main, Pages, OSM, coordenadas confirmadas, save ou V2.27. Scripts de captura usam apenas HTML temporário gerado fora do repositório.

## Critérios de avaliação e escopo

Os critérios **A1–A9 originais do Claude não estão anexados** ao material recebido. Não inventar sua correspondência. Usar provisoriamente P1, P2, P3, P6 e P8 de [PROXIMOS-PASSOS.md](PROXIMOS-PASSOS.md), conferindo A1–A9 antes de dar aceite formal.

A FJ1.0 observa o **jogo existente**, não promete que o ciclo de 5 momentos nem a exportação de save já existem. O capítulo atual inclui chegada ao Mercado, conversa com Francisco, preparação de toldo/frutas/cestos e lembrança no álbum. O momento 4 (ser reconhecido) e o momento 5 (resumo de fechamento) continuam propostas; exportar/importar save pertence a FJ1.1.

## Recrutamento e preparo

- **3–5 participantes**, de preferência com familiaridade variada com jogos e com Belém/PB. Amostra exploratória, sem inferência estatística.
- Uma pessoa modera; outra pode anotar. Não solicitar nomes, telefones, contas, IDs, endereço, saves pessoais ou gravação sem consentimento.
- Uma sessão por participante em estado descartável/isolado. Registrar SHA, viewport, DPR, zoom, entrada e se houve save experimental. **Não apagar nem substituir saves reais.**
- Meta de **10–15 minutos de observação do percurso**, seguida de 3–5 minutos de conversa. Não forçar conclusão artificial pelo relógio. Em dispositivo físico, só se houver aprovação separada e aparelho em temperatura normal; não pedir teste em aparelho aquecido.
- O moderador não ensina o caminho nem revela objetivos ocultos, salvo bloqueio que impeça o participante de continuar. Anotar cada intervenção.

## Script de 10–15 minutos para o moderador

| Tempo alvo | Convite neutro | Observar, sem corrigir |
|---|---|---|
| 0:00–2:00 | “Passeie pela cidade e descubra por onde começar.” | Entendeu controles e Matriz? Tempo da primeira ação, leitura da UI. |
| 2:00–5:00 | “Encontre o Mercado seguindo as ruas que o jogo mostra.” | Uso de mapa, nomes OSM, rota, caminhos errados e posição da câmera. |
| 5:00–9:00 | “Veja quem está por perto e o que dá para fazer na feira.” | Francisco, interação, falas, obstáculos, duração do encontro. |
| 9:00–12:00 | “Se quiser, ajude na banca e veja o que muda.” | Toldo/frutas/cestos, feedback, save, repetição de ações. |
| 12:00–15:00 | “Quando achar que a manhã terminou, me avise.” | Consegue distinguir capítulo concluído de exploração livre? Procura resumo inexistente? |

**Não revelar** que os momentos 4 e 5 novos não estão implementados até terminar a sessão. Se a pessoa os procurar, anotar como lacuna real, não como “erro do jogador”.

### Ficha de observação

Usar [FJ1-0-FICHA-OBSERVACAO.md](FJ1-0-FICHA-OBSERVACAO.md) separadamente para cada pessoa, com pseudônimo P01–P05 e sem dados pessoais.

Registrar horário relativo T0, primeira ação, partida da Matriz, chegada ao Mercado, primeira conversa, primeiro cuidado com a banca e percepção de conclusão. Para cada trava: tempo, lugar, ação tentada, componente que bloqueou, frase da pessoa, ajuda dada e se retomou. Não afirmar “falha” sem evidência.

### Perguntas finais (sem indução)

1. “Por onde você achou que estava caminhando?”
2. “Como percebeu que tinha chegado ao Mercado?”
3. “O que entendeu da conversa e do gesto com Francisco?”
4. “Em que momento ficou em dúvida ou pediu ajuda?”
5. “Você acha que a manhã terminou? O que imagina que ficou guardado?”
6. “Que lugar ou pessoa gostaria de conhecer depois?”

Marcar clareza de entrada, orientação, diálogos e fechamento de 1 (não entendi) a 5 (entendi sozinho), mais comentário literal opcional.

## Sete capturas de referência, mesmo HEAD

O script de CI `scripts/label-visual-audit.cjs` produz as três capturas de marcos que já integravam a C21 e **quatro novas capturas de ruas**. Todas: Chromium Linux, **desktop 1440×900**, **DPR 1**, **zoom 2,85**, cenário inicial diurno e espera de 800 ms após posicionar a câmera numa cópia temporária do HTML. As posições dos personagens e animais no jogo versionado e no save não são modificadas.

| ID | Referência | Arquivo dentro do artefato `beit-lehem-visual-review-<run_id>` |
|---|---|---|
| R01 | Matriz | `c21-igreja-2-85.png` |
| R02 | Mercado | `c21-mercado-2-85.png` |
| R03 | Rodoviária | `c21-rodoviaria-2-85.png` |
| R04 | Rua João Pessoa (OSM) | `fj1-rua-joao-pessoa-zoom2-85-1440x900.png` |
| R05 | Rua Vicente Cado (OSM) | `fj1-rua-vicente-cado-zoom2-85-1440x900.png` |
| R06 | Rua Feliciano Pedrosa (OSM) | `fj1-rua-feliciano-pedrosa-zoom2-85-1440x900.png` |
| R07 | Rua Joaquim Rodrigues (OSM) | `fj1-rua-joaquim-rodrigues-zoom2-85-1440x900.png` |

**Importante:** a captura da rua usa o ponto de etiqueta escolhido deterministicamente pelo jogo a partir da via OSM, **não** representa entrada, lote, endereço ou ponto urbano validado pelo autor. Confirmar os quatro enquadramentos com o autor antes de avaliação artística. O CI deve ser concluído antes de marcar as sete imagens como “capturadas”; se falhar, manter o estado “pendente”.

Arquivos de artefato do Actions têm retenção de três dias. Baixar e entregar ao avaliador antes da expiração; não adicionar PNGs grandes, HTMLs gerados ou arquivos ZIP ao Git por padrão.

## Reconhecimento de marcos sem legenda

1. Nas **cópias de pesquisa** das imagens R01–R03, cobrir apenas o texto nominal do marco com uma máscara neutra; manter o mesmo recorte, zoom, iluminação e proporções. Não adulterar a silhueta nem alterar o jogo.
2. Apresentar uma imagem por vez, em ordem alternada entre participantes, sem mencionar o nome do lugar.
3. Perguntar: “Que lugar parece ser?”, “O que fez você pensar nisso?” e “Quanta certeza tem (1–5)?”. Cronometrar até 10 s de palpite espontâneo.
4. Mostrar a versão com legenda em seguida como controle; registrar se a legenda confirmou ou mudou a percepção.
5. Para R04–R07, testar **orientação viária** (“Por onde você seguiria?”; “Isto parece rua principal, acesso ou cruzamento?”). Não exigir nomes literais de ruas de quem não os conhece.
6. Relatar acertos, hesitações, falsas identificações e confiança **por pessoa e por imagem**, sem definir percentual como aprovação artística automática.

## Entrega independente ao Claude

Enviar: SHA e URL da PR, link do CI e do ZIP de capturas, lista R01–R07, contexto da manhã 08:30, zoom 2,85, DPR 1, desktop 1440×900; pedir distinção entre “vi”, “código sugere” e “hipótese”. Comparar com o mesmo SHA. Não usar imagens publicadas de `8024b8a` como se fossem HEAD e não afirmar melhora térmica ou teste em celular real.

**Decisão artística:** sempre do autor. **FJ1.0:** pesquisa, não aprovação de mudanças.
