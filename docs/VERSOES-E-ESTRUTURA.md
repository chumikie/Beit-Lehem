# Beit Lehem — encontre a versão certa

**Este é o índice de versões do jogo.** A PR #1 foi integrada à `main` em `0c2db37`. O repositório está público; o GitHub Pages usa uma branch separada e não acompanha automaticamente o HTML mais recente da `main`.

| Você quer… | Abra este arquivo | O que é |
| --- | --- | --- |
| **Consultar a referência estável** | [V2.27 estável](../baseline/Belem-Viva-V2-27.html) | Cópia congelada para comparação. Não é a prévia principal. |
| **Jogar a base Gemini atual** | [Beit Lehem — desenvolvimento](../previews/beit-lehem-development.html) | **Único HTML principal gerado**; ainda experimental. |
| **Usar o link antigo de celular** | [Beit Lehem — desenvolvimento celular](../previews/beit-lehem-development-mobile.html) | Cópia idêntica do principal; CSS responsivo, refinamento móvel pendente. |
| **Usar o link antigo Gemini** | [Gemini Preview](../previews/gemini-preview.html) | Cópia idêntica mantida por compatibilidade, não uma segunda base. |

## Como baixar e abrir

1. Clique no arquivo desejado na tabela acima, dentro do GitHub.
2. Use o botão **Download raw file** (ícone de baixar) e salve o arquivo com extensão `.html`.
3. Abra o HTML baixado no navegador. Não é preciso hospedagem nem GitHub Pages.
4. Se o arquivo já estava no seu computador, baixe novamente após novos commits; o download anterior **não se atualiza sozinho**.

**Não abra `dist/index.html` isoladamente:** é uma entrada modular, não o jogo portátil completo.

## Onde mexer sem deixar o repositório pesado

- **`references/gemini-2026-10-31/experimento-anonimizado.html.txt`** — fonte principal atual, ainda monolítica; extrair em módulos pequenos progressivamente.
- **`dist/`** — módulos V2.27 preservados para portar correções; não geram a prévia principal agora.
- **`tests/`** — testes pequenos por sistema.
- **`scripts/` e `build-standalone.cjs`** — geração de HTMLs autônomos e validações.
- **`docs/`** — decisões, guia de referência, mapa do código e próximos passos.
- **`references/gemini-2026-10-31/` e `drafts/`** — material histórico de análise, sem carregar diretamente no jogo.
- **`previews/`** — um HTML principal e dois aliases idênticos; não são três linhas de desenvolvimento.
- **`gemini-preview.html` na raiz e `publicacao/index.html`** — artefatos anteriores; não são a base para novos builds nem para publicação automática.
- **`gh-pages/index.html`** — versão pública independente, atualizada somente após aprovação e verificação do HTML sanitizado.
- **`baseline/`** — V2.27 congelada, nunca reescrita.

O histórico Git guarda os commits anteriores; **não precisamos criar V2.30.html, V2.31.html etc. a cada ajuste**. Para continuar leve:

1. Editar **módulos específicos** em `gemini-modules/`; `dist/` continua sendo a referência V2.27.
2. Rodar os testes relevantes primeiro.
3. Gerar o HTML principal com `npm run build:game` e manter os dois links legados como cópias; não criar um HTML novo por commit.
4. Registrar um resumo curto com os pontos alterados. Não adicionar caches, dependências, imagens de terceiros sem licença ou ZIPs repetidos.
5. Não apagar ou renomear os arquivos atuais sem verificar todos os caminhos de build, links e compatibilidade.

Com Node.js 18+:

```bash
npm test
npm run verify:baseline
npm run build:development-preview
npm run build:public-preview
```

Para jogar sem download de nova prévia gerada no GitHub, execute localmente `npm run play:development-preview`.

## Aprovado, experimental e pendente

- **Aprovado como referência:** V2.27.
- **Base principal do desenvolvimento:** Gemini Preview, ainda experimental.
- **Candidato atual:** HTML principal da `main` derivado do Gemini; a branch `gh-pages` pode estar defasada.
- **Ainda pendente:** inspeção visual lado a lado, testes completos de build e avaliação física em celulares.

**Estilo:** cidade cozy do interior paraibano — afetos, comércio, árvores, fachadas e cotidiano. **Sem conceitos de idol, palco idol ou elementos do TsuLiPa**. O outro jogo não é biblioteca de assets deste projeto.

**Geografia:** conservar o território de Belém/PB, Rua Nova e região rural/serrana. As coordenadas locais do Gemini usadas para novos marcos foram confirmadas pelo autor com seu conhecimento e fotografias; registrar essa proveniência separadamente das geometrias OSM. As ilustrações não pretendem representar o contorno cadastral dos prédios.
