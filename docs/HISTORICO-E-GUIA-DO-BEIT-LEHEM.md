# Beit Lehem — origem, guia e comparação das linhas de desenvolvimento

> Inventário histórico e técnico de 31/10/2026, organizado a pedido do autor. **Não é uma nova versão do jogo**. Reconstrói marcos sustentados pela conversa de desenvolvimento, pelos READMEs históricos do Trilhas do Roncador e pelos arquivos da PR #1. Não equivale à leitura individual de todos os commits nem à revisão visual completa em aparelho físico.

## 1. De onde surgiu e qual era o primeiro guia

O projeto nasceu de um **GeoJSON de exploração territorial**, inicialmente chamado **Trilhas do Roncador**: um mapa jogável que permitia caminhar por caminhos do arquivo, procurar marcos e criar um passaporte de descobertas. O intuito inicial não era reproduzir um simulador 3D de navegação nem afirmar que todas as casas estivessem cadastradas. O extrato antigo era pequeno (83 elementos, 78 trechos de vias), o que levou o autor a perguntar por que Belém/PB parecia ter tão poucas ruas.

A resposta criativa e técnica foi **mudar o centro do estudo para Belém, Paraíba (código IBGE 2501906)**, com ruas importadas de dados cartográficos, e tornar a exploração uma **aventura cozy**. Em vez de apenas cumprir seis paradas, seria agradável passear, encontrar pessoas, plantar, ouvir histórias, ver festas, observar bichos e guardar memórias. O autor pediu repetidamente que o mapa e os cenários anteriores não desaparecessem, que os posicionamentos não fossem arbitrários e que a cidade fosse reconhecível.

O guia original, refinado durante a conversa, era:

1. **Belém de verdade como referência**, sem confundir a cidade paraibana com Belém do Pará; o mapa real não deve ser deformado para acomodar ilustrações.
2. **Ficção carinhosa, não folclore genérico:** moradores fictícios, falas originais e atividades inspiradas por referências locais verificadas. Não atribuir diálogos inventados a entrevistados da UFPB.
3. **Aventura cotidiana:** caminhada, feira, Matriz, Rodoviária, amizades, cartas, plantações, bichos e celebrações com começo, resposta e lembrança.
4. **Direção de arte:** paleta verde-sálvia, creme, terracota, madeira e rosa discreto; silhuetas kawaii legíveis, sombras suaves, composição limpa, proporção humana coerente com ruas e fachadas.
5. **TsuLiPa⭐World como referência de ACABAMENTO** — hierarquia, organização, respiro, clareza e resposta visual — **não como banco de assets, tema idol, cores Oshi ou cenário a copiar**.
6. **Entrega incremental e recuperável:** preservar HTML antigo, testar o caminho completo, registrar mudanças visíveis, manter salvamento e ter uma edição utilizável no celular.

O território de interesse foi inicialmente debatido também a partir da **APA Roncador**, com SUDEMA/IBGE e quatro municípios (Belém, Bananeiras, Borborema e Pirpirituba); depois o autor estabeleceu que o **foco de representação e jogo seria Belém/PB**, com expansão criteriosa para Rua Nova, campo e serra. **APA institucional não é sinônimo de bairro do Roncador nem de limite do mapa jogável.**

## 2. Por que usar essas fontes e o que elas não autorizam

| Fonte / pista | Papel correto | Limite |
| --- | --- | --- |
| Malha Municipal IBGE 2025, Belém 2501906 | Referência municipal e recorte de importação | Não é catálogo completo de casas/fachadas |
| OpenStreetMap (OSM) | Ruas conectadas, nomes informados, alguns POIs e áreas verdes | Cobertura incompleta; não garante GPS de toda calçada |
| SUDEMA / APA Roncador / decreto 27.204/2006 | Contexto de proteção territorial e paisagens | Não transformar todo perímetro da APA em centro urbano |
| SGB, afloramentos com coordenadas | Observações pontuais de geologia | Não declara acesso seguro, porte ou limites das rochas |
| NASA SRTM por amostras | Tendência regional de altitude e curvas ilustrativas | Grade de 140 m não resolve inclinação de cada rua |
| UFPB CoLingPB, catálogos urbanos/rurais | Tópicos culturais e de memória de Belém | Catálogo não é transcrição nem autorização para copiar voz |
| Prefeitura, acervos e fotos históricas | Feira, Matriz, São Pedro e elementos arquitetônicos datados | Foto de 2007 não prova fachada atual |
| Vídeos locais/YouTube enviados pelo autor | Pistas para inspeção por quadro, data, rua e direção | Título de busca não equivale a vídeo verificado; direitos não são livres |
| Conhecimento e fotos do autor | Validação local de determinados pontos na linha Gemini | Registrar como fonte do autor, separada da camada OSM; não divulgar domicílios |

Em diferentes etapas foram também considerados MapBiomas, IBGE ambiental e ANA. **Identificar a fonte não significa ter importado a camada.** Não desenhar lago, afloramento, lavoura, praça ou ladeira em coordenada inventada só para preencher um vazio.

## 3. Linha histórica do protótipo anterior: o que realmente entrou

A fonte auditável desta cronologia é a documentação das versões locais `trilhas-roncador-v2*`, especialmente `README.md`, e os módulos correspondentes. Agrupamento por marcos, não por cada commit.

| Etapa | Entrega documentada | Feedback/direção resultante |
| --- | --- | --- |
| Protótipo inicial / V1 | GeoJSON pequeno, caminhada, selos, mapa e passaporte | Cobertura insuficiente de Belém/PB |
| V2 e V2.2 | Importação ampliada de Belém e cenários de Igreja, Mercado, praça e Rodoviária; acesso a referências e imagens históricas | Queria fachadas e lugares reconhecíveis, mas sem sobreposições |
| V2.3 | Retirada de fachadas grandes do mapa, com ilustrações em cartões e pontos OSM menores; jardinagem e memórias culturais | O autor percebeu **downgrade**: cidade perdeu aparência |
| V2.4 | **Restauração** dos cenários ilustrados e camada opcional, posicionada sem declarar GPS exato | Preservar a composição anterior foi um requisito permanente |
| V2.5 | São Pedro ficcional, preparo e recompensa no álbum, iluminação ilustrativa | Cultura local como vivência e não só decoração |
| V2.6 | Calendário de sete dias, Damião/Lúcia/Bia, necessidades, relações, jardinagem repetível, aves e borboletas em áreas mapeadas | A cidade deveria continuar vivendo sem o jogador |
| V2.7 | Moradores nas ruas seguindo grafo OSM; atlas de 14 afloramentos SGB | Melhor movimento e ecologia documentada, não rochas inventadas |
| V2.8–V2.10 | Hierarquia da interface, silhuetas kawaii, diário reorganizado, feira de segunda-feira, objetivos visíveis e luz no mapa | Mudanças precisavam ser perceptíveis; nenhuma função antiga apagada |
| V2.11–V2.13 | Céu fictício, bichinhos, amizade, flora fundamentada, fotografias históricas, três quadras e fachadas procedurais distintas | Aproximar arte das quadras sem afirmar casa individual real |
| V2.14 | Capítulo completo de Damião: chegada ao Mercado, conversa, três objetos de banca, agradecimento e memória | Primeiro modelo de atividade local com começo/meio/fim |
| V2.15 | Lúcia: Matriz, cuidado com plantas, conversa sobre memórias e lembrança | Ligar personagem, gesto e cenário |
| V2.16 | Bia: Rodoviária, caderno/carta, saudade, planos de futuro e álbum | Três histórias conectadas entre si |
| V2.17–V2.18 | Visitas entre protagonistas; redução/rebalanceamento de tamanho, mais moradores, interface celular | Proporção comum entre pessoa/jogador/casa/rua |
| V2.19–V2.20 | Ateliê de quadras, esboços, Ciça/Nara/Téo, encontros coletivos e recados | Seis personalidades e encontros espontâneos |
| V2.21–V2.22 | Memória social de gestos anteriores, materiais de vias conforme tags OSM, coreografia de objetos e SRTM aproximado | Não fingir detalhes de ladeiras sem dados suficientes |
| V2.23–V2.24 locais | Suavização de trajetos, distribuição de passantes, balões mais compactos, despedidas, separação na via e pequenas rotinas | Caminhada natural, calçadas legíveis e vida cotidiana delicada |

**Atenção à proveniência:** os HTMLs e testes de V2.23/V2.24 foram gerados no ambiente local de trabalho anterior. **Isso não prova que a PR #1 incorporou literalmente todo esse código**. Devemos conferir a linha ativa antes de portar uma função. Os 28 testes relatados na V2.24 local não são resultado de `npm test` sobre o Gemini atual.

O recorte OSM da linha Belém documentava **491 elementos, 462 trechos de vias, 86 nomes de ruas e nove POIs**; isso não significa que o cadastro viário real esteja 100% completo. As seis missões urbanas foram escolhidas para permitir caminhar no mapa. A Estação Roncador é um lugar ficcional identificado como tal.

## 4. Do Roncador/Belém Viva para Beit Lehem no GitHub

| Aspecto | Linha anterior (Trilhas do Roncador / Belém Viva) | Beit Lehem na PR #1 em 31/10/2026 |
| --- | --- | --- |
| Nome e eixo | Exploração do Roncador com foco crescente em Belém | **Beit Lehem**, mesma identidade cozy paraibana; nome antigo persiste em arquivos históricos |
| Base de trabalho | V2 em `dist/`, gerando HTML autônomo | **Gemini Preview** é a base PRINCIPAL experimental, por decisão posterior |
| Recuperação | Versões HTML anteriores | `baseline/Belem-Viva-V2-27.html` congelada |
| Onde editar | `dist/game.js` e módulos da época | `gemini-modules/` extraídos do Gemini; **não editar o HTML gigante nem os HTMLs gerados** |
| Visualização | HTML desktop e edição celular derivada do mesmo jogo V2 | `previews/beit-lehem-development.html` e `...-mobile.html`; atualmente **mesmo HTML Gemini responsivo** |
| Mapa | 462 segmentos OSM com quadras ilustrativas | Mundo amplo com Belém, Rua Nova e rural/serra; preservar os trechos e não cortar território |
| Propostas locais | Poucas referências confirmadas, resto documental | 17 propostas viárias continuam **desativadas** até validação; sete novos marcos ilustrativos informados como confirmados pelo autor |
| Fachadas | Três regiões centrais, depois estudos maiores | Seis setores declarados, sendo três novos **preliminares** |
| Simulação social | Três protagonistas e Ciça/Nara/Téo, relações, cartas e encontros | Parte dos sistemas existe no Gemini; verificar a implementação ativa antes de afirmar equivalência |
| Salvamento | `roncador-expedition-v2`, esquema `v:3` | Chave **experimental separada**; progresso não migra automaticamente |
| Outras propostas | Jogabilidade social e natureza como direção | Contatos e moto no Gemini ainda experimentais; novas atividades estão pausadas |

**Houve uma correção explícita de rumo**: a V2.27 continua boa referência técnica, mas **não é mais a fonte das prévias atuais**. A V2.28 reformulada foi rejeitada e não deve ser reintroduzida. A base Gemini mais rica também **não é automaticamente mais estável**.

A descrição histórica da **PR #1 ainda fala em V2.27 como base principal**, enquanto `AGENTS.md`, `README.md` e `docs/DECISOES.md` registram a decisão posterior de usar o Gemini como base atual. **Os documentos de decisão mais recentes prevalecem; atualizar o texto da PR é uma pendência de comunicação.**

## 5. O que há de comprovado e o que ainda é problema na PR #1

**Confirmado na leitura do código/documentos da branch `review/referencias-locais-2026-10-31`:**

- Módulos `dist/` preservam a linha V2.27; o construtor `scripts/build-development-preview.cjs` cria as duas prévias atuais a partir do Gemini.
- O Gemini tem `facade-studio`, `central-blocks`, `street-greetings`, `resident-motion` e elementos de interface adaptativa. Não se deve recomeçar do zero nem copiar às cegas outro jogo.
- O desenho base da casa em `game` usa larguras/alturas procedurais de aproximadamente 10–18 unidades locais; protagonistas nomeados são desenhados em escala 1,20 e secundários em 1,02. **A proporção aparente não foi medida visualmente na PR atual.**
- Há estilos para telas até 800 px, controles de toque e `safe-area-inset-bottom`; isso demonstra regras responsivas, **não comprova ausência de sobreposição em um iPhone real**.
- `facade-studio` usa seis IDs: `matriz`, `feira`, `joao`, `clovis`, `feliciano`, `vicente`. A paleta da Matriz usa parede creme, detalhes claros, vidro e plantas, com beiral, sombra e variações ficcionais.

**Inconsistências lógicas específicas encontradas na fonte Gemini:**

1. `facade-studio.statistics()` inicializa contadores apenas para `matriz`, `feira` e `joao`, mas incrementa também os três novos setores. Para esses, o resultado pode ficar `NaN` (`undefined + 1`). A linha V2.27 tem uma inicialização para todos os setores.
2. `facade-studio.recordSketch()` ainda usa `state.length === 3` para desbloquear, apesar de existirem seis IDs. Isso contradiz o Ateliê de seis setores. Corrigir a condição e testar a compatibilidade dos três desenhos antigos, sem apagar o progresso.
3. A versão celular atual é gerada por **cópia do mesmo HTML Gemini**. Há CSS responsivo, mas ainda não há acabamento móvel independente comprovado.
4. A chave de save Gemini é diferente: exportar/importar de modo reversível continua pendente.
5. O desenho visual próprio do Hospital Santa Lúcia, a geração sem duplicações e a revisão real de navegador também constam como pendências nos documentos atuais.

**Ainda não verificado nesta auditoria:** comparação lado a lado em zoom afastado/aproximado, colisões reais em 320–390 px, fidelidade de fachadas atuais, comportamento visual dos personagens, testes completos do Gemini e equivalência de todos os sistemas da V2.27. Não declarar esses pontos resolvidos só por inspeção estática.

## 6. Guia operacional que agora deve reger cada etapa

A documentação vigente é `AGENTS.md`, `docs/DECISOES.md`, `docs/COMO-TRABALHAR-COM-IA.md`, `docs/PROXIMOS-PASSOS.md` e `references/gemini-2026-10-31/INDICE.md`.

- **Uma região/um sistema por commit.** Primeiro Matriz, depois Mercado, Rodoviária e demais setores.
- **Nunca atualizar as prévias editando HTML autônomo na mão.** Inventariar com `npm run gemini:list`; extrair só `facade-studio` (e dependência necessária) para `gemini-modules/`. Gerar ambas as prévias pelo construtor.
- **Preservar a base e o mundo:** V2.27 congelada, fonte Gemini arquivada intacta, OSM, marcos confirmados, Rua Nova, rural e serras, missões, save experimental e personagens.
- **Fontes antes de realismo:** fotos datadas, referência, orientação e confiança explícita. Posição de casa individual e nome de comércio não são deduzidos da pintura ilustrativa.
- **Visual primeiro com sobriedade:** volume, sombra do beiral, material, cor, plantas e vitrine anônima, sem edifícios extras; pessoas proporcionais e expressões legíveis.
- **Sem atalhos de validação:** testes específicos, `npm test`, `npm run verify:baseline`, `npm run gemini:check`, `npm run build:development-preview`; inspeção de desktop e celular quando o ambiente permitir. Informar o que não foi possível rodar.
- **PR única:** trabalhar na PR #1 como rascunho, commits autorizados pelo autor; **não fazer merge, deploy, Pages ou alterar outro repositório**.

## 7. Matriz: primeira entrega visual recomendada, com critérios observáveis

**Objetivo:** uma quadra do centro mais reconhecível e bem composta sem perder as ruas e a escala humana.

1. **Inventariar** um pequeno conjunto de fotos/vídeos datados da Igreja Nossa Senhora da Conceição e arredores, separando elementos comprovados da fachada da Igreja das casas vizinhas ainda não levantadas.
2. **Corrigir antes o contrato dos seis setores** (contadores e desbloqueio); conferir retrocompatibilidade do álbum de três desenhos. Isso é reparo lógico, não redesign.
3. **Extrair só o módulo de fachadas Gemini**. Modificar a Matriz com sombras de contato, acabamento de superfícies e diferenciação leve de telhados/portas **apenas em casas procedurais existentes**. Não alterar marcas OSM nem layout de blocos por estética.
4. **Medir escala:** comparar casa 10–18 unidades, protagonista 1,20, secundário 1,02 e jogador no zoom perto, afastado e em caminhada. Reduzir poluição do desenho ao afastar, se a comparação confirmar a necessidade.
5. **Celular:** testar 390×844 e 320×640, safe areas, botões de exploração, minimapa, nome e balão sobre a pessoa, overlay de objetivos e telas de diálogo. O controle deve ser tocável; o centro do mapa e os pés das pessoas devem continuar visíveis.
6. **Validar os fluxos tocados:** abrir mapa, caminhar até Matriz, observar fachadas, conversar, registrar um desenho, salvar, recarregar e retomar. Gerar **desktop e celular juntos**. Conferir que a V2.27 congelada mantém o mesmo hash.
7. **Commit somente após a verificação possível** e resumo de antes/depois, incluindo limitações. Não adicionar novos lugares apenas para parecer mais povoado.

**Critério de pronto:** a Matriz ganha acabamento observável em dois níveis de zoom, o Ateliê conta seis setores corretamente sem perder três registros antigos, os controles móveis continuam legíveis, e os testes aplicáveis passam. Se faltarem fontes atuais, a arte deve dizer explicitamente “interpretação histórica/ilustrativa”, não “fachada atual confirmada”.

## 8. Depois da Matriz — fila curta

1. **Mercado/feira:** toldos, bancas e fachadas diversas, respeito à segunda-feira ficcional e aos dados documentais; Damião integrado ao cenário.
2. **Rodoviária:** espera, deslocamento, cartas de Bia, sombra e espaço de circulação.
3. **Serras, Pedra do Cordeiro e campo:** preservar localizações confirmadas e transição entre núcleos; dados vegetais e rochosos apenas com proveniência verificável.
4. **Pessoas:** saídas, descanso, conversas, encontros e despedidas com colisão/silhueta adequadas; não acrescentar novos sistemas enquanto a base principal estiver instável.
5. **Dados e continuidade:** exportação/importação de saves Gemini/V2.27 somente com migração reversível testada.

## 9. Índice de evidências para retomar sem reler tudo

- [README da base atual](../README.md)
- [Decisões vigentes](DECISOES.md)
- [Próximos passos e Matriz](PROXIMOS-PASSOS.md)
- [Guia de trabalho econômico com IA](COMO-TRABALHAR-COM-IA.md)
- [Mapa do código V2.27](MAPA-DO-CODIGO.md)
- [Índice da fonte Gemini](../references/gemini-2026-10-31/INDICE.md)
- [Jogo atual, desktop](../previews/beit-lehem-development.html)
- [Jogo atual, celular](../previews/beit-lehem-development-mobile.html)
- [V2.27 recuperável](../baseline/Belem-Viva-V2-27.html)
- [PR #1](https://github.com/chumikie/Beit-Lehem/pull/1)
- Histórico local anterior: `trilhas-roncador-v2-24/README.md` e `tests/` no ambiente de desenvolvimento em que aquela versão foi criada; **não é a linha ativa do Gemini**.

**Nota final:** PR é um conjunto de alterações em revisão, **não “versão 1”** do jogo. Seus commits formam o histórico incremental, mas o arquivo jogável atual só muda quando os construtores geram novas prévias e elas são adicionadas à branch. A PR #1 deve permanecer aberta até autorização expressa para merge.
