# Beit Lehem — jogo cozy de Belém/PB

Beit Lehem é um jogo local/offline inspirado na geografia, nas ruas e no cotidiano de Belém/PB, incluindo Rua Nova e o entorno rural e serrano.

**A versão atual de Beit Lehem é a referência ativa de desenvolvimento, visual e técnica.** A V2.27 permanece preservada como registro histórico e opção de recuperação; não determina a arte, a arquitetura nem os critérios de evolução do jogo atual.

O repositório **chumikie/Beit-Lehem é público por decisão do autor e deve permanecer público**. Visibilidade do repositório, hospedagem e publicação do jogo são assuntos separados: não altere configurações de Pages nem publique uma nova versão sem autorização específica.

## Qual versão usar

- **Jogo atual:** [previews/beit-lehem-development.html](previews/beit-lehem-development.html). É a prévia principal gerada a partir dos módulos atuais.
- **Compatibilidade celular:** [previews/beit-lehem-development-mobile.html](previews/beit-lehem-development-mobile.html). No momento é uma cópia idêntica da prévia principal; não representa um segundo ramo de desenvolvimento nem comprova acabamento móvel específico.
- **Link Gemini antigo:** [previews/gemini-preview.html](previews/gemini-preview.html). Cópia de compatibilidade, não uma base independente.
- **Arquivo histórico V2.27:** [baseline/Belem-Viva-V2-27.html](baseline/Belem-Viva-V2-27.html). Imutável; serve para recuperação histórica e conferência de integridade, não como padrão obrigatório para o jogo atual.

Veja também o [índice de versões e estrutura](docs/VERSOES-E-ESTRUTURA.md).

## Código e geração

- **Fonte editável do jogo atual:** `gemini-modules/`. O arquivo `game.js` ainda concentra muitos sistemas e será modularizado gradualmente.
- **Geração da prévia:** `scripts/build-gemini-preview.cjs` e `scripts/build-development-preview.cjs`.
- **HTMLs em `previews/`:** artefatos gerados. Não editar diretamente; alterar os módulos e gerar novamente.
- **Fonte Gemini arquivada:** `references/gemini-2026-10-31/experimento-anonimizado.html.txt`. Material de origem/consulta para trechos que ainda não foram extraídos; não é uma especificação imutável do jogo atual.
- **`baseline/` e `dist/`:** material histórico da linha V2.27. Não usar como fonte normativa nem portar código automaticamente sem revisar sua compatibilidade com a arquitetura atual.

Com Node.js 18+:

```sh
npm test
npm run build
npm run play
npm run gemini:list
npm run gemini:check
npm run verify:baseline
```

`npm run build` gera a prévia principal atual e atualiza as duas cópias de compatibilidade. `npm run play` gera essa prévia e tenta abri-la no navegador.

Os comandos históricos continuam disponíveis, mas são explícitos:

```sh
npm run build:legacy
npm run play:legacy
```

`npm run verify:baseline` confere apenas o hash do arquivo histórico V2.27. Não é uma avaliação da qualidade nem um portão de aprovação para mudanças no jogo atual.

## Geografia e nomes

O mapa ativo é composto durante o build a partir de `source/belem-osm-2026.geojson`, usando `scripts/current-geodata.cjs` e a projeção local já adotada pelo jogo.

- **Ruas e geometria:** identificadores, traçados e `properties.name` vêm da fonte OSM. O build verifica igualdade exata da geometria das 462 vias e dos 20 polígonos com o mapa revisado atual; se a quantidade, os IDs ou as coordenadas mudarem, ele interrompe a geração para revisão.
- **Nomes de ruas:** só um `name` presente na feição OSM pode virar rótulo de rua. Grafia, acentos e valores são copiados sem correção automática.
- **Aparência:** superfícies usadas apenas para manter o acabamento visual ficam em `roadAppearance`, sem alterar as tags geográficas OSM.
- **POIs locais:** ficam em `localPlaces`, com `displayName`, `sourceName`, proveniência e estado da posição. O nome exibido no jogo pode ser um alias, mas não substitui o nome original da fonte.
- **Rótulos de via não confirmados:** ficam em `unverifiedRoadLabels` com estado de revisão e não são exibidos como nome de rua.
- **Limites da fonte:** o recorte OSM/IBGE é uma referência de cobertura, não garantia de que todas as vias, acessos ou condições atuais estejam mapeadas.

O extrato consultado registra 491 feições: 462 linhas viárias, 20 polígonos e 9 pontos. São 86 nomes distintos em vias nomeadas nessa captura. Isso descreve o arquivo consultado, não certifica a completude do município.

## Salvamento e compatibilidade

A base atual e a V2.27 usam chaves/esquemas de salvamento diferentes. O progresso local não é transferido automaticamente entre elas. Preservar a chave e o formato atuais durante refatorações; qualquer migração futura precisa de backup, validação e caminho reversível.

## Testes e limites conhecidos

`npm test` executa os testes automatizados locais. Eles cobrem partes importantes de lógica, mas não substituem inspeção real no navegador, trajetos completos nem validação em aparelhos móveis. Não declarar essas verificações como concluídas sem executá-las.

O utilitário `build:public-preview` e o antigo relatório de cópia pública são material de uma avaliação anterior; não são a fonte atual de decisão sobre a visibilidade do repositório. Revisar esse fluxo antes de reutilizá-lo para distribuição ou hospedagem.

Para detalhes de arquitetura, decisões e fila de trabalho, consulte [mapa do código](docs/MAPA-DO-CODIGO.md), [decisões](docs/DECISOES.md), [próximos passos](docs/PROXIMOS-PASSOS.md) e [guia de trabalho com IA](docs/COMO-TRABALHAR-COM-IA.md).
