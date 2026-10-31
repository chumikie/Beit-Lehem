# Prévia experimental Gemini — instruções e limites

Esta etapa cria uma cópia executável e isolada do HTML arquivado para comparação. **Não é uma nova versão oficial do jogo**, não substitui a V2.27 e não integra os sistemas do experimento em `dist/`.

## Abrir a prévia

Na pasta do projeto, com Node.js 18 ou superior:

```bash
npm run build:gemini
```

Gera `build/gemini-preview.html`. Para gerar e abrir no navegador padrão:

```bash
npm run play:gemini
```

O comando habitual `npm run play` continua abrindo `build/jogo.html`, isto é, a versão oficial construída a partir de `dist/`.

## Proteções desta etapa

- A fonte `references/gemini-2026-10-31/experimento-anonimizado.html.txt` é somente lida; o processo não a altera.
- A cópia gerada recebe apenas duas alterações: a remoção da atribuição duplicada que acessava `kawaiiState` antes da declaração `let`, e o título da aba para identificar a prévia experimental.
- A chave `roncador-expedition-v2-referencias-gemini` é mantida e validada como distinta da chave oficial `roncador-expedition-v2`. O diário local oficial não é migrado nem sobrescrito.
- A saída vai para `build/`, não para `dist/`. A baseline congelada e a V2.27 não são editadas.
- Se a fonte ou a chave não corresponderem ao esperado, a geração falha em vez de tentar uma correção ampla.

## O que ainda não está resolvido

A correção permite tentar abrir o experimento, mas não prova que todos os sistemas estejam corretos. Permanecem pendentes, entre outros, o contrato do álbum de seis setores, os contadores de setores novos, a identidade visual própria do Hospital Santa Lúcia, os efeitos de exportação/reabertura do HTML e a revisão de usabilidade em tela pequena.

A prévia não foi validada em navegador ou dispositivo físico nesta etapa. Ao comparar, trate os elementos experimentais como hipóteses de visual e interação, não como dados geográficos confirmados. Não use o diário oficial para testar esta cópia.
