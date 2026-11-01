# Próximos passos

## Base e direção aprovadas

- **Feliciano Pedrosa — etapa de pesquisa (01/11/2026):** endereços dos mercados Vida Nova 1/2 e Família confirmados por fontes públicas, mas lote, entrada e lado da via ainda não demonstrados. Não desenhar fachadas de marcas nem interpolar posições por número postal. Critérios e fontes em [ESTUDO-RUA-FELICIANO-PEDROSA.md](ESTUDO-RUA-FELICIANO-PEDROSA.md).
- **Academias, flora e edifícios (01/11/2026):** separar academias ativas de registros antigos; oito áreas verdes classificadas no extrato OSM não equivalem a árvores cadastradas; nenhum dos 20 polígonos OSM tem `building=*`. Ver [AUDITORIA-ACADEMIAS-FLORA-EDIFICACOES.md](AUDITORIA-ACADEMIAS-FLORA-EDIFICACOES.md) antes de atribuir fachadas, espécies ou número de andares.

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


## Etapa visual priorizada pelo autor — 31/10/2026

**Escopo aprovado:** avançar uma quadra do centro de Belém/PB por vez; dar identidade às cenas urbanas, refinar expressões e revisar a legibilidade no celular. A base a editar é o **Gemini Preview** da PR #1; a V2.27 permanece congelada. Nada de merge, hospedagem ou mudança na malha OSM.

### Primeiro incremento visual: entorno da Matriz

1. **Inventário antes de desenhar:** registrar fotografias e vídeos datados que mostrem a Igreja e os arredores; anotar fonte, data, direção da câmera e grau de confiança. A fotografia histórica de 2007 não comprova a pintura atual das casas. A rua exata e o contorno das edificações ficam pendentes quando não há identificação.
2. **Uma composição controlada:** trabalhar apenas a paleta, os materiais visíveis, volumes de fachada, sombra de beiral, iluminação e vegetação dos edifícios *ilustrativos* já existentes na área. Não inserir prédios adicionais nem mudar coordenadas ou contagem de ruas para preencher vazios.
3. **Módulo correto:** inventariar com `npm run gemini:list`; extrair `facade-studio` (e só dependências diretamente necessárias) para `gemini-modules/`, sem reescrever o HTML Gemini. Fazer um ajuste pequeno com comparação antes/depois da Matriz.
4. **Gente em escala:** revisar a relação jogador/moradores/fachadas no zoom próximo e distante. Priorizar espera, olhar e despedida quando o gesto puder ser vinculado a uma rotina; novas atividades e missões continuam pausadas.
5. **Celular na mesma entrega:** comparar 390 × 844 e uma largura menor; conferir escala, nomes dos personagens, botões de toque, balões, camadas sobrepostas e áreas seguras. A prévia móvel hoje é idêntica à desktop: não declarar adaptação adicional sem editar e testar a geração.
6. **Portões de conclusão:** testes do módulo, `npm test`, `npm run verify:baseline`, `npm run build:development-preview`, inspeção visual quando autorizada. Preservar save Gemini e imagens/fontes originais. Commit pequeno somente nesta PR, sem merge.

**Como o jogador perceberá:** caminhar em torno da Matriz e reconhecer um conjunto de fachadas com materiais, sombras e volumes mais coerentes — sem perder o mapa amplo. A revisão de celular deve deixar o mesmo lugar legível com menos oclusões.

### Fila após esse incremento

1. Mercado e ruas comerciais: variação de toldos e fachadas baseada em evidências, conservando a feira e seus horários ficcionais.
2. Rodoviária: relação entre praça de circulação, sombras, pessoas esperando e os caminhos existentes.
3. Outros setores e zona rural/serrana: somente após localizar fontes e comparar a abrangência territorial.

**Estado deste registro:** planejamento e critérios definidos; nenhuma alteração de sprite, mapa ou CSS foi implementada por este documento.
