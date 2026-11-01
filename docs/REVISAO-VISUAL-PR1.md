# Beit Lehem — revisão visual da PR #1

Data: 31/10/2026. Escopo: exclusivamente a apresentação da base Gemini.

## Inspeções realizadas

- **Navegador, tela desktop:** prévia pública por `htmlpreview.github.io`, commit `ffd565e`. Captura visual do mapa central com Mercado e Matriz na mesma vista, em zoom inicial e após um afastamento; menus de mapa, álbum e diário dos moradores abertos.
- **Mercado / Matriz:** composição central realmente observada. Os letreiros completos e avisos repetidos de ilustração cruzavam uma área visualmente densa, junto de fachadas, nomes e ícones.
- **Álbum:** cartões distinguíveis, espaços e hierarquia adequados. Nenhuma mudança no conteúdo das lembranças.
- **Diário dos moradores:** cartões de Damião, Lúcia e Bia bem separados; retratos observados pequenos diante das molduras.
- **Rodoviária:** código e posição de sua ilustração conferidos; **não** foi obtida captura localizada de perto nesta rodada.
- **Celular:** estrutura CSS/previsões de tela mantidas e HTML reconstruído, mas **não** houve captura de navegador em 390 × 844 ou 320 × 640 nesta rodada. O Playwright local não dispunha de Chromium e o download falhou. Não considerar a aparência móvel aprovada por esse motivo.
- **Rua Nova e conversas:** localização de seções do diário e interfaces de contato conferida no código/árvore de acessibilidade. Deslocamento completo e conversas individuais com Bia, Lúcia e Damião não foram reproduzidos visualmente nesta rodada.

## Correções estritamente visuais

1. Legendas dos marcos: nomes só aparecem no mapa quando câmera e jogador estão suficientemente próximos; cartões postais continuam mostrando todos os nomes. Legendas do Mercado e Rodoviária ficam abaixo das áreas de atividade para não atravessar bancas e espera.
2. Avisos de representação ilustrativa: exibidos de perto, preservando a distinção entre arte e geografia sem repetir placas sobre o mapa distante.
3. Retratos do diário: moradores ocupam maior área do canvas do cartão, preservando suas silhuetas e cores; os sprites caminhando não foram alterados.

## Proteções e verificação

- Nenhum trecho de rua, coordenada, construção cartográfica ou acesso foi criado ou deslocado.
- Sem alterações deliberadas em missões, progressão, relógio, encontros, movimentos ou salvamentos.
- `npm test`, `npm run verify:baseline` e `npm run build:development-preview` executados após as alterações. Verificar seus resultados no resumo da rodada.
- Duas prévias de desenvolvimento são geradas do mesmo conjunto de módulos, sem edição manual de HTML.
- PR #1 permanece em rascunho; sem merge e sem atualização de `gh-pages`.

## Próxima inspeção visual necessária

Capturar as três localidades em 1440 × 900, 390 × 844 e 320 × 640 com o navegador de testes funcional; conferir rótulos a 0,9×, 1,55× e 2,3×. Priorizar Rodoviária e Mercado de perto, depois Rua Nova e as interfaces de conversa em horários em que cada personagem esteja disponível. Corrigir somente conflitos efetivamente observados.
