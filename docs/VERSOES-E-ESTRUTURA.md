# Beit Lehem — versões e estrutura

**A versão atual de Beit Lehem é a referência ativa para jogar, comparar e desenvolver.** A V2.27 é apenas um snapshot histórico imutável; não é a referência principal nem um padrão técnico obrigatório.

O repositório GitHub é público por decisão do autor. Isso não significa que GitHub Pages esteja atualizado ou que toda build local esteja publicada.

## Qual arquivo abrir

| Objetivo | Arquivo | Papel |
| --- | --- | --- |
| Jogar/inspecionar o jogo atual | [Prévia principal](../previews/beit-lehem-development.html) | HTML gerado a partir dos módulos atuais |
| Usar o link de compatibilidade móvel | [Prévia mobile](../previews/beit-lehem-development-mobile.html) | Cópia atualmente idêntica ao principal |
| Usar link Gemini anterior | [Alias Gemini](../previews/gemini-preview.html) | Cópia idêntica mantida para compatibilidade |
| Consultar o marco histórico | [V2.27 congelada](../baseline/Belem-Viva-V2-27.html) | Arquivo histórico/rollback; não editar |

Para abrir localmente: baixe o HTML principal e abra no navegador. O progresso permanece no armazenamento local do navegador e a origem/chave de save pode diferir da V2.27.

## Onde editar

- **`gemini-modules/`** — fonte editável dos sistemas atuais. `game.js` ainda é um monólito e será separado aos poucos.
- **`scripts/build-gemini-preview.cjs`** — montagem da prévia atual.
- **`scripts/build-development-preview.cjs`** — gera o principal e as duas cópias de compatibilidade.
- **`previews/`** — artefatos gerados; não editar diretamente.
- **`references/gemini-2026-10-31/`** — material original arquivado para consulta de sistemas que ainda não foram extraídos.
- **`source/`, `import_belem_osm.py`, `prepare_map.py`** — fluxo geográfico da preparação antiga; sua integração com o mapa embutido atual ainda precisa ser consolidada.
- **`tests/`** — testes por sistema e regressões.
- **`baseline/`** — arquivo histórico V2.27 e integridade do snapshot.
- **`dist/`** — módulos/artefatos da linha antiga; não usar como fonte normativa do jogo atual.
- **`docs/`** — decisões, próximos passos, mapa do código e instruções.

## Comandos

Com Node.js 18+:

```bash
npm test
npm run build
npm run play
npm run verify:baseline
```

- `npm run build`: gera o jogo atual e sincroniza os aliases.
- `npm run play`: gera e abre a prévia atual.
- `npm run verify:baseline`: confere somente que o arquivo histórico V2.27 permanece intacto.

Para abrir explicitamente a linha antiga:

```bash
npm run build:legacy
npm run play:legacy
```

Não criar um novo HTML versionado a cada ajuste. O histórico Git conserva os commits; mantenha um principal gerado e aliases de compatibilidade.

## Geografia e nomes

- Nomes de ruas devem permanecer idênticos aos nomes reais validados, inclusive grafia e acentos.
- POIs e estabelecimentos podem usar nomes ficcionais no jogo. O alias exibido deve ser separado do nome de origem.
- Geometria OSM, validação local, nome de exibição e arte ilustrativa não são a mesma coisa.
- Não inferir coordenadas, limites de lote ou acessos sem fonte.

## Salvamento

A versão atual e a V2.27 possuem chaves/esquemas de save diferentes. Não presumir migração automática. Extrações de módulos devem preservar a chave e o formato atuais. Uma futura migração exige backup, validação e reversibilidade.

## Estado de validação

A existência de um HTML gerado não significa que todos os recursos tenham sido validados em navegador ou celular. Consulte a PR de evolução e os próximos passos para saber o que foi efetivamente testado. Não declarar inspeção visual ou teste físico sem execução.

GitHub Pages e qualquer outra distribuição são independentes da visibilidade pública do repositório. Atualizar hospedagem/publicação exige autorização específica.
