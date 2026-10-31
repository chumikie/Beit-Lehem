# Proposta de publicação da prévia pública — Beit Lehem

**Estado:** proposta para aprovação do autor; NÃO publicada e sem alterar visibilidade de repositório, GitHub Pages ou domínios.

## Objetivo

Compartilhar só a **prévia jogável** Beit Lehem — mundo cozy de Belém/PB, baseada no Gemini — mantendo **chumikie/Beit-Lehem** privado, com toda a PR #1, documentos, histórico e referências originais fora do pacote público.

## Empacotamento proposto

| Item | Publicar? | Motivo |
| --- | --- | --- |
| `index.html` gerado da prévia Gemini atual | Sim, após sanitização e QA | Jogo jogável em computador e celular |
| Dois JPEGs embutidos no HTML | Sim, após remover EXIF; as fontes no Wikimedia Commons indicam domínio público | Recursos visuais atuais |
| Dados geográficos já necessários ao jogo, embutidos no HTML | Sim, após revisão final | Sem eles o mapa completo não funciona |
| `AGENTS.md`, `docs/`, `drafts/`, `references/`, `tests/`, `gemini-modules/`, `dist/`, `baseline/`, `.git/` | Não | Desenvolvimento e histórico privados |
| Chaves, configuração de CI ou acesso remoto | Não | Desnecessários |
| Contas, formulários, analytics, banco, servidor | Não | Jogo estático/offline; dados locais |

**Estrutura da distribuição desejada:**
```text
publicacao/
  index.html
```

O `index.html` contém mapa, CSS, JS e imagens embutidas. O projeto original NÃO será clonado para um destino público. Exportar um arquivo limpo, não publicar a árvore do repositório.

## Revisão preliminar de 31/10/2026

- HTML analisado: `previews/beit-lehem-development.html`, ~1,08 MB, branch de desenvolvimento da PR #1.
- Não foram encontrados elementos `<script src>`, `<link href>` ou `<iframe src>` externos na estrutura HTML.
- Há `@import` para Google Fonts no CSS embutido. Para uma distribuição completamente offline, remover a importação na cópia pública e usar a pilha de fontes locais; verificar visualmente o resultado.
- Há **2 JPEGs embutidos em base64 com cabeçalho EXIF**. Remover os segmentos de metadados do export, sem modificar os arquivos de referência. As duas fotografias (igreja e feira, 2007, Júnior Miranda) constam no Wikimedia Commons como domínio público, com links de fonte já presentes no jogo.
- O mapa e seus marcos OSM/IBGE e ilustrações ficcionais continuam no HTML; devem manter atribuições e distinção entre observação real e criação artística.
- Não foram identificados endereços de e-mail na inspeção textual do HTML. Isso NÃO substitui auditoria visual e de privacidade.
- O jogo usa `localStorage` com a chave experimental `roncador-expedition-v2-referencias-gemini`; sem conta, banco ou sincronização. Ao mudar de `file://` para um domínio público, os saves locais anteriores **não são transferidos automaticamente**.
- Não executar `npm run build` (V2.27) para a distribuição principal; usar a prévia Gemini gerada por `npm run build:development-preview`.

## Hospedagem recomendada

**Cloudflare Pages — Direct Upload manual** de um diretório contendo só o `index.html` revisado. Não conectar o GitHub privado à hospedagem. URL de teste separada e pública apenas após aprovação.

Alternativa: **novo repositório GitHub público apenas para distribuição**, com seu próprio histórico contendo somente `index.html`, e GitHub Pages habilitado nele. Nunca mudar a visibilidade do repositório de desenvolvimento.

### Configuração desejada (não aplicada)

- Projeto: `beit-lehem-preview` (nome a confirmar; disponibilidade não verificada).
- Diretório publicado: `publicacao/` com `index.html`.
- Build remoto: nenhum; export estático já pronto.
- Deploy: **manual**, somente após verificação e autorização específica.
- Acesso: público ao jogo; nenhuma autorização de edição.
- Domínio próprio: não nesta primeira etapa.
- Analytics/cookies de terceiros: não adicionar.
- HTTPS: oferecido pelo provedor.
- Estratégia de atualização: exportar versão aprovada, substituir apenas `index.html` no próximo deploy.
- Atribuições: manter OSM e referências exigidas.
- Política de cache e comportamento de salvamento: validar em smartphone antes de anunciar.

## Portões obrigatórios para publicar

- [ ] Remover EXIF dos dois JPEGs embutidos na cópia de distribuição.
- [x] Licenças das duas imagens históricas conferidas no Wikimedia Commons como domínio público; manter a atribuição e os links na interface.
- [ ] Remover importação de fonte remota ou aprovar uso online de Google Fonts.
- [ ] Retirar do pacote público o comentário interno inicial de arquivo de referência, sem alterar a fonte original.
- [ ] Inspecionar visualmente o jogo no Chrome desktop e em tela de celular.
- [ ] Testar a inicialização, movimentação, diálogos, controles touch e recuperação de save após recarregar.
- [ ] Verificar que não há dados pessoais/arquivos de desenvolvimento no pacote final.
- [ ] Conferir tamanho do pacote e tempo de abertura em conexão móvel.
- [ ] Obter autorização final do autor para **publicar o pacote específico**.

## Referências de configuração

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Cloudflare Direct Upload: https://developers.cloudflare.com/pages/get-started/direct-upload/

Nenhuma implantação, alteração de visibilidade ou conexão de contas deve ser realizada apenas por existir este documento.

- Igreja: https://commons.wikimedia.org/wiki/File:Igreja_N%C2%AA_Sr%C2%AA_da_Concei%C3%A7%C3%A3o_Bel%C3%A9m-PB.jpg
- Feira: https://commons.wikimedia.org/wiki/File:Feira_Livre_de_Bel%C3%A9m-PB.jpg
