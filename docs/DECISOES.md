# Decisões vigentes

## Produto e referência

- Nome oficial do jogo: **Beit Lehem**.
- Repositório `chumikie/Beit-Lehem`: **público por decisão do autor**. Essa visibilidade deve ser mantida.
- **A versão atual de Beit Lehem é a referência ativa de desenvolvimento, visual e técnica.** O mapa, a apresentação e os sistemas atuais orientam as próximas melhorias.
- A V2.27 permanece preservada como snapshot histórico/rollback. Não é mais a referência normativa nem limita a evolução da versão atual.
- A V2.28 reformulada anteriormente rejeitada não se torna aprovada por esta decisão.

## Território, nomes e representação

- Referência geográfica: Belém/PB, Rua Nova e o entorno rural/serrano, em mundo amplo e conectado.
- **Os nomes reais das ruas devem permanecer idênticos aos nomes validados**, incluindo acentos e grafia.
- Nomes de POIs, estabelecimentos e elementos narrativos podem ser alterados para aliases ficcionais. O nome original e o alias de exibição devem permanecer conceitualmente separados.
- Dados geográficos, validações locais do autor e ilustrações são camadas diferentes. Não apresentar desenho ilustrativo como contorno cadastral; não inventar coordenadas, entradas ou nomes.
- Não deslocar geometrias viárias reais para acomodar cenários. Setorização interna é permitida para organização/desempenho, sem fragmentar a experiência de exploração.

## Arquitetura e funcionamento

- O jogo é executado localmente no navegador e mantém progresso no armazenamento local; não há autorização para introduzir backend ou telemetria.
- A fonte editável atual está em `gemini-modules/`; as prévias em `previews/` são geradas, não editadas diretamente.
- `gemini-modules/game.js` ainda é grande e deve ser modularizado incrementalmente, preservando comportamento, visual, ordem de processamento e saves.
- A fonte HTML arquivada em `references/gemini-2026-10-31/` serve como consulta para sistemas ainda não extraídos, não como padrão imutável.
- `baseline/Belem-Viva-V2-27.html` e o código histórico em `dist/` não são a base ativa. O hash da V2.27 serve somente para verificar que o arquivo histórico não foi alterado.
- O mapa ativo é composto no build a partir de `source/belem-osm-2026.geojson` por `scripts/current-geodata.cjs`. As tags e os nomes de ruas OSM são a camada geográfica normativa.
- O build exige igualdade exata da quantidade, IDs e geometria das vias e polígonos com a base revisada; qualquer deriva interrompe a geração para revisão, sem deslocar o mundo silenciosamente.
- Aparência de pavimento (`roadAppearance`), POIs locais/aliases (`localPlaces`) e rótulos de ruas ainda não confirmados (`unverifiedRoadLabels`) são camadas separadas. Somente `roads[].tags.name` vindo de OSM pode aparecer como nome oficial de rua.
- O extrato atual tem 462 linhas viárias, 20 polígonos, 9 pontos e 86 nomes distintos em vias nomeadas. A cobertura OSM não garante a completude da malha nem a transitabilidade atual.

## Salvamento

- A base atual e V2.27 têm chaves/esquemas distintos. Não prometer transferência automática de progresso.
- Preservar a chave e o esquema atuais durante refatorações. Migração futura deve incluir backup, validação de dados e opção reversível.

## Publicação e segurança

- Repositório público não equivale a GitHub Pages ativo. Hospedagem, publicação e atualização de branches de distribuição permanecem ações separadas e exigem autorização específica.
- Não modificar configurações globais da conta nem outros repositórios.
- Relatórios antigos de auditoria de cópia pública podem conter avaliações superadas; não usá-los como evidência atual sem nova verificação. O documento antigo correspondente foi marcado como supersedido.

## Processo

- Alterações na PR #2 permanecem em rascunho até revisão. **Não fazer merge nem publicar sem autorização expressa.**
- Cada etapa deve informar arquivos alterados, testes realmente executados e limitações que continuam pendentes.

## FJ1 — roteiro de fatia jogável e auditoria independente (2026-11-02)

### Implementado e verificado na PR #2

- Referência para este registro: HEAD `957ac13798475e3f52953fd432b33ac21f43104f`, PR #2 aberta e em rascunho. O CI `41374531607` aprovou 441 testes, Chromium desktop 1440×960, emulação móvel 390×844 e 320×640, comparação A/B e build temporário; o hash da V2.27 foi conferido separadamente. Esses resultados não constituem teste em celular físico nem avaliação artística aprovada.
- O jogo já tem percurso pela malha OSM, conversas, rotinas, memórias e save local no esquema atual (v3). O capítulo `A manhã de Francisco` inclui chegada ao Mercado, conversa, três cuidados na banca, agradecimento e registro de lembrança no álbum. Isso **não** demonstra ainda uma sessão orientada de 10–15 minutos com começo e fim reconhecíveis entre Matriz e Mercado.
- A C21 (`3663d97`) limitou o contorno das plaquinhas de nomes; não solucionou comprovadamente todas as colisões com sprites, legendas de marcos e balões. A C22.1 (`957ac13`) alterou somente a concorrência do GitHub Actions para cancelar pushes ultrapassados sem interromper execuções manuais.
- As etapas históricas `C12`/`C12.1` já designam auditorias do HUD e controles móveis. O roteiro proposto pelo avaliador externo será identificado provisoriamente como **FJ1** (Fatia Jogável 1), com correspondência FJ1.0–FJ1.6 ↔ C12.0–C12.6 do Claude, para evitar sobrescrever decisões anteriores.

### Evidência histórica, hipóteses e limites

- As 14 capturas fornecidas pelo avaliador independente representam a versão do Pages associada a `8024b8a` e comparações pontuais com `304bd01`; **não** representam todas as mudanças posteriores do HEAD. O acabamento da cobertura e do banco da Rodoviária não foi publicado na versão capturada.
- A identidade sálvia/creme/terracota, o cenário local e os sprites kawaii foram avaliados positivamente. Escala excessiva de animais, pouca leitura da silhueta de marcos, aglomeração de etiquetas, repetição de telhados e ocupação do HUD são **pontos de observação**, não aprovações ou autorizações de alteração.
- Existem regras de escala, visibilidade, limites de plaquinhas e oclusão de nomes de rua implementadas desde C11–C21. A C11.6 oculta nomes apenas sob condições calculadas de possível conflito com fachadas/pessoas; a ausência de nomes em uma captura antiga não prova desaparecimento geral ou defeito novo.
- A exportação/importação de save pelo jogador **não está implementada**. A função legada de baixar o HTML não equivale a exportar progresso. Qualquer futura exportação deve conservar a chave e o esquema existentes, validar arquivos importados, pedir confirmação antes de substituir progresso e jamais enviar saves ou informações pessoais ao repositório.
- Os critérios `A1–A9` citados pelo Claude **não foram anexados**. Os critérios FJ1 propostos em `docs/PROXIMOS-PASSOS.md` são um rascunho para decisão do autor; não substituir os critérios originais sem confrontá-los.
- A proposta de novas PRs por subetapa é **planejamento**, não autorização para abrir, mesclar ou publicar PRs. A PR #2 permanece o único destino das atualizações documentais desta rodada.

### Autoridade artística e limites

- A aprovação artística final pertence exclusivamente ao autor. Antes de mudar escala, HUD, telhados, nomes, fachadas ou chão de marcos, apresentar capturas comparáveis e pedir autorização específica.
- Não deslocar OSM ou coordenadas confirmadas; não mudar posição de personagens e animais, rotas, chave de save, V2.27 nem publicar no Pages sem autorização expressa.
- Sete referências sugeridas para revisão visual independente: Matriz, Mercado, Rodoviária e, como candidatas com nomes literais encontrados no OSM, **Rua João Pessoa, Rua Vicente Cado, Rua Feliciano Pedrosa e Rua Joaquim Rodrigues**. A escolha exata e o enquadramento ficam sujeitos à confirmação do autor.
