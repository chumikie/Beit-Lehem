# Belém Viva V2.27 — consequências visíveis da manhã de feira

## Objetivo

Conectar a atividade da V2.26 ao passeio: o que foi arrumado na janela também aparece em uma banca do cenário. Esta entrega aprofunda a proposta inicial de participar da vida da cidade e guardar memórias.

## Implementação

`fair-streets.js` seleciona a banca existente mais próxima do POI do Mercado, sem mover ou adicionar pontos geográficos. Sua arte assume o estado do toldo, das seis frutas e dos cestos. A placa de Damião é uma identificação ficcional de interface. As outras bancas não mudaram. O pequeno afastamento de árvores decorativas no entorno desta banca evita que a copa a cubra; isso não altera dados de vegetação real.

A banca aparece durante a feira anterior e, depois do pedido de Damião, também nas outras manhãs em que ele está trabalhando no Mercado. Não representa horário real. Ao tocar na banca, a atividade só abre com conversa, proximidade e disponibilidade já exigidas na V2.26. O botão de retorno marca o trajeto para o POI mapeado do Mercado, não uma suposta posição real de vendedor.

A reação de Ciça depende da presença efetiva dela perto da banca e do jogador. São excluídos visita, viagem e aproximação. Uma rota de até 140 unidades no grafo é exigida para evitar comentário através de uma quadra desconectada. Não se força deslocamento, não se concede prêmio e não se adiciona missão. A proximidade dispara texto breve, um gesto e uma nota, uma única vez. Sua fala futura pode reconhecer o resultado.

## Continuidade

O save mantém a chave `roncador-expedition-v2` e `v:3`. O novo campo opcional `marketWitnessed` é aceito somente com a manhã já concluída. Não muda a contagem do álbum. Posições das frutas continuam no campo introduzido na V2.26. Saves antigos recebem o valor falso para a reação e preservam os capítulos anteriores.

## Verificações

- 30 scripts passaram, incluindo os 29 da base V2.26.
- Novo teste: seleção de banca existente, efeitos parciais e completos, migração, hitbox, reação contextual, conexão viária e memória de Ciça.
- 1000 movimentos de frutas verificados sem IDs duplicados.
- Inspeção estática dos três estados da arte da banca a partir das chamadas de desenho.
- Comparação byte a byte dos arquivos cartográficos com a base V2.26.
- Exportação offline e análise de sintaxe dos scripts embutidos.

Não foram executados teste de layout em navegador, foco nativo, toque físico ou benchmark móvel. O bloqueio de URL do navegador de nuvem para arquivos locais, registrado na V2.26, permanece uma limitação; não se tentou contorná-lo.

## Como observar

Na prévia isolada, abra a banca, conclua parte da organização e volte. O recorte abaixo da abertura acompanha toldo, cestos e frutas. Essa prévia não acessa o salvamento oficial.

No jogo completo, siga o capítulo de Damião no Mercado, faça a atividade e volte à rua. Procure a placa Damião ou use “Rever nossa banca na rua”. Ciça só comenta se sua rotina a levar perto nas condições descritas; não é um evento garantido ao fechar a janela.
