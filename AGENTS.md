# Beit Lehem — instruções do projeto

## Referência ativa e decisões obrigatórias

- Nome do jogo: **Beit Lehem**. A ambientação geográfica e cultural é Belém/PB, Rua Nova e o entorno rural/serrano.
- **A versão atual do jogo é a referência visual e técnica ativa.** Evoluir a partir do comportamento, do mapa e da apresentação atuais.
- **V2.27 é somente um snapshot histórico imutável**, útil para recuperação ou consulta pontual. Não tratá-la como padrão técnico, visual, arquitetural ou como condição para aprovar mudanças no jogo atual.
- O repositório `chumikie/Beit-Lehem` é **público por decisão do autor**. Mantê-lo público; não sugerir nem executar mudança de visibilidade.
- Repositório público não significa autorização automática para ativar Pages, hospedar, publicar releases ou atualizar uma branch de publicação. Essas ações exigem pedido/autorização específica.
- O jogo é local/offline. Não adicionar backend, telemetria, integrações remotas ou dependências de serviço sem pedido explícito.
- Não tocar no repositório, nas configurações ou integrações do TsuLiPa World.

## Geografia, nomes e ficção

- Preservar nomes reais de ruas exatamente como constam na fonte validada, incluindo acentos e grafia.
- Nomes de POIs, personagens, comércios e outros elementos de narrativa podem ser aliases ficcionais. Guardar nome de origem e nome exibido em campos separados quando ambos existirem.
- Não renomear uma rua para adaptar o nome de um estabelecimento; não inferir um endereço, lote, entrada ou coordenada a partir de um nome parecido.
- Distinguir explicitamente: dado OSM, dado local validado pelo autor, alias ficcional e ilustração artística.
- O build atual compõe ruas, áreas e pontos OSM de `source/belem-osm-2026.geojson` por `scripts/current-geodata.cjs`; não usar `dist/map.json` como fonte normativa.
- `roads[].tags.name` é reservado ao nome OSM exato. Sugestões antigas ficam em `unverifiedRoadLabels` e não podem ser mostradas como nome de rua.
- Acabamento visual de pavimento fica em `roadAppearance`; POIs locais ficam em `localPlaces` com `displayName`/`sourceName` separados.
- O build bloqueia alterações não revisadas de IDs/quantidade/geometria das vias e polígonos. Não desativar esse guard para contornar divergências.
- Não reduzir a extensão do território conectado para simplificar uma tarefa. Não deslocar ruas reais para acomodar cenário ilustrativo.
- A direção de arte atual é cozy do interior paraibano. Não importar estética, elenco ou assets de outro projeto.

## Fonte, edição e build

1. Fonte editável do jogo atual: `gemini-modules/`. Ler somente o módulo necessário e suas dependências diretas.
2. `gemini-modules/game.js` ainda concentra várias responsabilidades; dividir gradualmente, com contratos explícitos entre módulos e testes de regressão.
3. `references/gemini-2026-10-31/experimento-anonimizado.html.txt` é fonte arquivada de origem e consulta para partes ainda não extraídas. Não a tratar como especificação inviolável nem reler inteira a cada tarefa.
4. Os HTMLs de `previews/` são artefatos gerados. Não editar manualmente; editar fonte/módulos e regenerar.
5. `baseline/` guarda V2.27 imutável. `dist/` contém material da linha antiga. Não os usar como implementação ativa nem portar código sem inspeção de compatibilidade.
6. Comandos padrão:
   - `npm run build`: gerar o jogo atual.
   - `npm run play`: gerar e abrir o jogo atual.
   - `npm run build:legacy` / `npm run play:legacy`: ferramentas históricas da V2.27.
   - `npm test`: testes automatizados.
   - `npm run verify:baseline`: integridade do arquivo histórico, não gate do jogo atual.
7. Preservar a chave e o esquema de save atuais. Não fazer migração durante extrações de módulo.

## Critérios de engenharia

- Preferir alterações pequenas, reversíveis e em módulos bem delimitados.
- Preservar a ordem de geração e o determinismo de mapas, casas, personagens e rotinas.
- Para otimizações espaciais, comparar os resultados exatos antes/depois e testar limites de célula, coordenadas negativas e casos de fronteira. Não trocar uma busca exata por aproximação sem demonstrar equivalência.
- Não adicionar novos globais `window.*` como mecanismo padrão de integração. Quando possível, introduzir dependências por contexto/serviços explícitos.
- Atualizar testes e documentação junto da mudança. Distinguir fato implementado, hipótese e item pendente.
- Não declarar execução de testes, inspeção de navegador, teste A/B ou validação em celular que não tenha sido realizada.

## Branch e publicação

- Continuar o trabalho documental nesta PR #2, atualmente em rascunho, enquanto essa PR permanecer aberta e for a branch de evolução ativa.
- Não fazer merge, fechar/reabrir a PR, atualizar Pages ou publicar builds sem autorização expressa.
- Não criar uma PR nova para cada arquivo da mesma etapa; agrupar alterações coerentes na PR de evolução atual.
- Não inserir saves locais, credenciais, caches, ZIPs repetidos ou anexos privados no Git.
