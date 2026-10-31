# Beit Lehem — desenvolvimento local

Jogo aberto e offline em Belém/PB, seu distrito Rua Nova e as serras, fauna e flora do entorno. O repositório guarda código e histórico. Não publica um site, não tem GitHub Pages ou workflows de GitHub Actions e não depende de Vercel/Supabase.

Repositório privado: https://github.com/chumikie/Beit-Lehem

## Onde estão os HTMLs

- **Base jogável congelada V2.27:** [`baseline/Belem-Viva-V2-27.html`](baseline/Belem-Viva-V2-27.html). É um HTML autônomo, pronto para baixar e abrir. Não editar: é a cópia de segurança imutável.
- **Jogo em desenvolvimento:** [`dist/index.html`](dist/index.html), junto com CSS, dados e módulos JavaScript da pasta `dist/`. É a fonte de trabalho; não é um HTML autônomo para baixar sozinho.
- **Prévia experimental Gemini:** [`previews/gemini-preview.html`](previews/gemini-preview.html). É uma comparação isolada, pronta para baixar e abrir; não é a versão oficial e usa uma chave de salvamento própria.
- **Fonte original do experimento:** [`references/gemini-2026-10-31/experimento-anonimizado.html.txt`](references/gemini-2026-10-31/experimento-anonimizado.html.txt). Está arquivada como texto de referência, propositalmente não executável.
- **HTMLs oficiais gerados localmente:** `build/jogo.html` e `build/jogo-celular.html`. São saídas de build ignoradas pelo Git; gere-as com `npm run build`.

A página do GitHub mostra o código dos HTMLs, mas não hospeda nem executa o jogo. Para jogar, baixe o arquivo autônomo e abra no navegador, ou use os comandos locais abaixo.

## Base preservada

A versão estável é a **V2.27**. A V2.28 foi rejeitada e não é base deste repositório.

O território e o visual da V2.27 permanecem. Priorizar mapa, navegação, personagens e acabamento com alterações pontuais e comparáveis. Belém e Rua Nova devem se conectar ao entorno natural no mesmo mundo. O recorte futuro termina antes de desenvolver outros núcleos urbanos. A extensão de dados disponível não significa cenário integralmente desenvolvido.

## Editar e testar

É necessário Node.js 18 ou posterior para os comandos de desenvolvimento; não há dependências npm para instalar.

```sh
npm test
npm run verify:baseline
npm run build
npm run play
```

`build` gera `build/jogo.html` e `build/jogo-celular.html`, ambos autônomos. Você também pode abrir esses arquivos manualmente. `play` apenas gera e abre o HTML local, sem servidor.

### Prévia experimental Gemini

```sh
npm run build:gemini
npm run play:gemini
```

O primeiro comando atualiza o snapshot versionado `previews/gemini-preview.html`; o segundo também o abre no navegador. A versão experimental não altera o jogo oficial nem o diário V2.27.

## Onde trabalhar

Leia [docs/MAPA-DO-CODIGO.md](docs/MAPA-DO-CODIGO.md) para localizar sistemas. As decisões ficam em [docs/DECISOES.md](docs/DECISOES.md); o trabalho seguinte, em [docs/PROXIMOS-PASSOS.md](docs/PROXIMOS-PASSOS.md). As instruções para assistentes ficam em [AGENTS.md](AGENTS.md).

## Atualizar sua cópia

Após clonar o repositório privado uma vez, mantenha alterações próprias registradas e use `git pull --ff-only` para receber avanços. Depois execute os testes e gere o jogo novamente. Evite usar `reset --hard` para atualizar.

O progresso é salvo no navegador, por origem, na chave `roncador-expedition-v2`. Ele não é sincronizado pelo Git. Não enviar dados pessoais do diário ao repositório. Exportar/importar o diário ainda é uma tarefa pendente; não é função implementada nesta preparação.

## Procedência e histórico

Dados geográficos, imagens e créditos existentes permanecem nos arquivos. Consulte [docs/HISTORICO-VERSOES.md](docs/HISTORICO-VERSOES.md) para o histórico anterior e os documentos de pesquisa em `docs/`. Eles descrevem decisões antigas; quando houver conflito, prevalecem `docs/DECISOES.md` e as instruções atuais do usuário.

## Testes e limites

Os testes usam Node e simulação de DOM para algumas interfaces. Eles não comprovam aparência, foco nativo, toque ou desempenho em navegador real. A cópia congelada mantém os nomes históricos e seu hash original. Nenhum workflow é incluído.
