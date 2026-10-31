# V2.26 — revisão e integração da banca

## Origem e escopo

Adaptação do HTML de teste entregue por Claude e enviado pelo usuário. O desenho da banca, as frutas SVG e as transformações de toldo e cestos foram reaproveitados. A interface foi isolada em Shadow DOM para evitar que os estilos do protótipo alterassem o restante do jogo. O personagem da cena usa a função de desenho oficial do Damião, com os mesmos acessórios e proporções dos retratos existentes. As coordenadas do mundo não foram alteradas.

## Refinamentos

- Agradecimento com gesto de até 2,3 segundos, que volta à pose tranquila. Não há aceno infinito.
- Caixa de frutas com seis colunas, reduzida a três em telas de até 360 px. Botões possuem dimensão mínima de 44 px.
- Selecionar fruta direciona o foco a um espaço vazio. Setas navegam entre os seis espaços, Escape cancela seleção e a conclusão das frutas direciona o foco para uma tarefa restante ou para o agradecimento.
- Marca discreta da feira de Belém/PB na banca e continuidade da paleta e do casario ilustrado. Isso não constitui levantamento de fachada real; a identidade local ainda pode receber pesquisa e refinamento adicionais.
- Frutas podem ser trocadas. Cores são sugestões, não critérios de sucesso.
- Um aviso da atividade informa falha ao ler ou gravar o progresso local.

## Integração

A atividade não usa a chave do protótipo. O campo opcional `marketFruitSlots` é salvo dentro de `roncador-expedition-v2`, mantendo `v:3`. O modelo valida nomes, quantidade e duplicidade das frutas. Uma tarefa de frutas concluída em V2.25 continua concluída, com posições reconstruídas quando ausentes. Não é criada segunda recompensa.

Abertura e ações exigem expedição ativa, conversa anterior, proximidade do Mercado e horário de Damião. A conclusão grava a memória já existente no álbum e nas notas, preservando a liberação do capítulo de Lúcia. Consultar uma lembrança já obtida continua possível pelos atalhos existentes.

Durante a revisão também foi corrigida uma referência fora de escopo no painel de cuidados (`primary`), que poderia interromper essa interface. A V2.25 foi preservada separadamente.

## Evidências

- 29 scripts `.test.cjs` passaram.
- Novos testes de lógica cobrem dados inválidos, frutas únicas, substituição, troca, permissão de ação, migração e recompensa única.
- Simulação de DOM cobre os eventos reais do módulo, foco, seleção, Escape, progressão, bloqueio após conclusão, retenção ao fechar, término do gesto e movimento reduzido.
- Scripts dos HTMLs foram analisados com `node --check`.
- Os exports completos embutem scripts, estilos, mapa e imagens; não possuem dependências externas de script ou estilo.
- `map.json`, `geology.json` e `terrain.json` foram comparados byte a byte com a base V2.25.

## O que não foi comprovado

O navegador local não está instalado; a obtenção de um executável não teve sucesso. A tentativa de abrir o arquivo pelo navegador de nuvem foi explicitamente recusada pela política de URL, que não permite o protocolo de arquivo. Não houve tentativa de contornar esse bloqueio.

Portanto, não foram confirmados: composição final no navegador, medidas reais de layout em 390 px, comportamento do foco com diálogo nativo, suporte de SVG/Shadow DOM em diferentes navegadores, toque em celular físico e desempenho em aparelhos. Dimensões e acessibilidade acima descrevem implementação e testes simulados, não validação física.

## Como avaliar diretamente

Abra `dist/Belem-Viva-Previa-Mercado-V2-26.html` para ir diretamente à banca. É uma prévia separada: presume chegada e conversa, guarda estado apenas na página e não acessa o progresso oficial. Use-a para observar proporção, controles e movimento.

No jogo completo, siga o capítulo de Damião no Mercado. Faça parte da organização, feche e reabra, recarregue a página e confirme a continuidade. Depois conclua, abra o álbum e confirme que a lembrança não é repetida e que o próximo arco continua disponível.
