# Próximos passos

## Base e direção aprovadas

- A V2.27 é a referência estável congelada; **a base atual do jogo em desenvolvimento passa a ser o Gemini**, conforme decisão posterior do autor.
- O Gemini é uma referência mais rica em informações e precisão local. Aproveitar dados, descrições de ruas e estudos visuais em melhorias graduais.
- O mundo deve continuar amplo e conectado entre Belém, Rua Nova e o entorno rural/serrano. Não reduzir os limites de exploração.
- Prioridades atuais: mapa, escala, navegação, fachadas e personagens. Novas atividades, moto e contatos ficam pausados.

## Integração em andamento

1. As 17 propostas viárias do Gemini continuam pendentes de validação. Nenhum nome ou piso novo é exibido como confirmado; a fonte OSM mantém seus 86 nomes e 462 geometrias sem alteração.
2. O estudo ilustrativo de fachadas cresce de três para seis áreas: três referências centrais e três setores visuais preliminares ancorados em geometrias existentes. Nomes e limites exatos dos três novos setores continuam pendentes.
3. O snapshot `previews/beit-lehem-development.html` agora é gerado a partir da fonte Gemini. A prévia móvel, por enquanto, usa o mesmo HTML responsivo. `dist/` é a linha V2.27 preservada para transportar correções.

## Integração Gemini já realizada na PR #1

- Sete novos marcos locais ilustrativos (escola, ginásio, confeitaria, bar ficcional, Prefeitura, capela e igreja), com **posições confirmadas pelo autor com base em sua experiência e fotografias**. Essa confirmação local não altera o conteúdo extraído do OSM.
- Cada marco tem identidade ilustrativa própria e pode receber uma rota pela malha existente. Os sete destinos tiveram rotas encontradas no teste de grafo a partir do ponto inicial.
- As duas prévias de desenvolvimento foram atualizadas conjuntamente; Gemini Preview permanece separado como referência visual mais rica. A V2.27 está congelada.
- [Índice de versões e organização](VERSOES-E-ESTRUTURA.md) centraliza links e evita gerar arquivos de cada commit.

**Correção de rumo:** o Gemini é a direção principal de riqueza visual, não mero rascunho descartável. Integrar suas cenas e sistemas por etapas, preservando estabilidade, saves e território. A direção artística é **cozy do interior paraibano, não idol**. A inspeção visual real e os testes completos continuam pendentes.

## Próxima rodada

1. Conferir a comparação visual do novo snapshot com a V2.27: amplitude do mapa, leitura das ruas, escala e continuidade das fachadas. O minimapa já mostra a extensão cartográfica completa com a janela do jogador destacada; o mapa ampliado alterna entre a região próxima e o território completo.
2. Revisar se os seis estudos cobrem trechos com densidade coerente, sem uniformizar todas as casas nem mover personagens.
3. Continuar enriquecendo a malha rural/serrana a partir de referências específicas, sem inventar coordenadas de lugares ou acessos.
4. Depois das revisões de espaço, aprimorar navegação e transições de câmera, mantendo o caminho nas vias reais do mapa. Os personagens que caminham pelas ruas usam o mesmo roteador conectado, sem atalhos inventados.

Não integrar novas missões, sistema de moto ou contatos nesta etapa. Cada avanço deve registrar o que mudou, como foi testado e o que ainda é hipótese.

## Próximo trabalho após a troca de base

1. Validar no navegador a prévia Gemini como jogo principal (mapa amplo, lugares pessoais autorizados, efeitos e navegação). Não afirmar que isso já ocorreu.
2. Corrigir o álbum de seis setores, contadores, desenho próprio do hospital e exportação de HTML sem duplicação de interface.
3. Projetar migração explícita de diário entre a chave Gemini e a chave V2.27, sempre com backup e opção reversível.
4. Extrair partes do monólito Gemini para módulos pequenos e testáveis, mantendo seus recursos e o visual cozy intactos.
5. Refinar a edição de celular sem diminuir mapa ou eliminar recursos. Contatos e moto continuam no Gemini experimental e exigem revisão antes de serem aprovados como sistemas estáveis.
