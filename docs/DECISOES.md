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
