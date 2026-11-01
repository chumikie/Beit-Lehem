# Beit Lehem — encontre a versão certa

**Este é o índice de versões do jogo.** O repositório é privado e a PR #1 permanece em rascunho. Nenhum arquivo abaixo representa uma versão publicada na internet.

| Você quer… | Abra este arquivo | O que é |
| --- | --- | --- |
| **Consultar a referência estável** | [V2.27 estável](../baseline/Belem-Viva-V2-27.html) | Cópia congelada para comparação. Não é a prévia principal. |
| **Jogar a base Gemini no computador** | [Beit Lehem — desenvolvimento](../previews/beit-lehem-development.html) | HTML Gemini com o mapa e sistemas mais ricos; ainda experimental. |
| **Abrir a base Gemini no celular** | [Beit Lehem — desenvolvimento celular](../previews/beit-lehem-development-mobile.html) | Por enquanto o mesmo HTML responsivo Gemini; refinamento específico do celular pendente. |
| **Rever o Gemini preservado** | [Gemini Preview](../previews/gemini-preview.html) | Mesmo conteúdo das prévias principais neste marco; progresso separado da V2.27. |

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
- **`previews/`** — somente as **três prévias reconhecíveis**, não uma cópia nova para cada commit.
- **`baseline/`** — V2.27 congelada, nunca reescrita.

O histórico Git guarda os commits anteriores; **não precisamos criar V2.30.html, V2.31.html etc. a cada ajuste**. Para continuar leve:

1. Editar **módulos específicos** em `dist/`, evitando mudanças simultâneas em arquivos gigantes.
2. Rodar os testes relevantes primeiro.
3. Gerar as prévias desktop/celular **juntas a partir da fonte Gemini ao fechar um conjunto de mudanças testáveis**, e não duplicar dezenas de HTMLs.
4. Registrar um resumo curto com os pontos alterados. Não adicionar caches, dependências, imagens de terceiros sem licença ou ZIPs repetidos.
5. Não apagar ou renomear os arquivos atuais sem verificar todos os caminhos de build, links e compatibilidade.

Com Node.js 18+:

```bash
npm test
npm run verify:baseline
npm run build:development-preview
```

Para jogar sem download de nova prévia gerada no GitHub, execute localmente `npm run play:development-preview`.

## Aprovado, experimental e pendente

- **Aprovado como referência:** V2.27.
- **Base principal do desenvolvimento:** Gemini Preview, ainda experimental.
- **Candidatos atuais:** prévias desktop e celular da PR #1, derivadas do Gemini.
- **Ainda pendente:** inspeção visual lado a lado, testes completos de build e avaliação física em celulares.

**Estilo:** cidade cozy do interior paraibano — afetos, comércio, árvores, fachadas e cotidiano. **Sem conceitos de idol, palco idol ou elementos do TsuLiPa**. O outro jogo não é biblioteca de assets deste projeto.

**Geografia:** conservar o território de Belém/PB, Rua Nova e região rural/serrana. As coordenadas locais do Gemini usadas para novos marcos foram confirmadas pelo autor com seu conhecimento e fotografias; registrar essa proveniência separadamente das geometrias OSM. As ilustrações não pretendem representar o contorno cadastral dos prédios.
