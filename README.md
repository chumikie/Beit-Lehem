# Beit Lehem — desenvolvimento local

Jogo aberto e offline em Belém/PB, seu distrito Rua Nova e as serras, fauna e flora do entorno. O repositório guarda código e histórico. Não publica um site, não tem GitHub Pages ou workflows de GitHub Actions e não depende de Vercel/Supabase.

Repositório privado: https://github.com/chumikie/Beit-Lehem

## Base preservada

A versão estável é a **V2.27**. Abra `baseline/Belem-Viva-V2-27.html` diretamente no navegador para jogar a versão congelada. O HTML se adapta à tela. A V2.28 foi rejeitada e não é base deste repositório.

O território e o visual da V2.27 permanecem. Priorizar mapa, navegação, personagens e acabamento com alterações pontuais e comparáveis. Belém e Rua Nova devem se conectar ao entorno natural no mesmo mundo. O recorte futuro termina antes de desenvolver outros núcleos urbanos. A extensão de dados disponível não significa cenário integralmente desenvolvido.

## Editar e testar

É necessário Node.js 18 ou posterior para os comandos de desenvolvimento; não há dependências npm para instalar.

```sh
npm test
npm run verify:baseline
npm run build
npm run play
```

`build` gera `build/jogo.html` e `build/jogo-celular.html`, ambos autônomos. Você também pode abrir esses arquivos manualmente. `play` apenas gera e abre o HTML local, sem servidor. Os comandos diretos equivalentes são `node scripts/project.cjs test`, `build`, `play` e `verify-baseline`.

## Onde trabalhar

Leia [docs/MAPA-DO-CODIGO.md](docs/MAPA-DO-CODIGO.md) para localizar sistemas. As decisões ficam em [docs/DECISOES.md](docs/DECISOES.md); o trabalho seguinte, em [docs/PROXIMOS-PASSOS.md](docs/PROXIMOS-PASSOS.md). As instruções para assistentes ficam em [AGENTS.md](AGENTS.md).

## Atualizar sua cópia

Após clonar o repositório privado uma vez, mantenha alterações próprias registradas e use `git pull --ff-only` para receber avanços. Depois execute os testes e gere o jogo novamente. Evite usar `reset --hard` para atualizar.

O progresso é salvo no navegador, por origem, na chave `roncador-expedition-v2`. Ele não é sincronizado pelo Git. Não enviar dados pessoais do diário ao repositório. Exportar/importar o diário ainda é uma tarefa pendente; não é função implementada nesta preparação.

## Procedência e histórico

Dados geográficos, imagens e créditos existentes permanecem nos arquivos. Consulte [docs/HISTORICO-VERSOES.md](docs/HISTORICO-VERSOES.md) para o histórico anterior e os documentos de pesquisa em `docs/`. Eles descrevem decisões antigas; quando houver conflito, prevalecem `docs/DECISOES.md` e as instruções atuais do usuário.

## Testes e limites

Os testes usam Node e simulação de DOM para algumas interfaces. Eles não comprovam aparência, foco nativo, toque ou desempenho em navegador real. Esta preparação preserva o conteúdo da V2.27 e atualiza apenas o nome na apresentação para Beit Lehem. A cópia congelada mantém os nomes históricos e seu hash original. A configuração administrativa de Actions ainda deve ser conferida pelo proprietário; nenhum workflow é incluído.
