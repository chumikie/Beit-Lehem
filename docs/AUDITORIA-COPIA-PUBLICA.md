# Auditoria para uma futura cópia pública — Beit Lehem

**Estado: BLOQUEADA para publicação.** Preparação interna da PR #1. Nenhum repositório público, hospedagem, branch pública ou deploy foi criado.

## Objetivo

Permitir revisão e contribuição do Gemini sem expor o histórico nem os dados privados de `chumikie/Beit-Lehem`. A saída futura deve nascer em **um repositório novo, com histórico novo**, nunca por mudança de visibilidade do repositório original.

## O que foi inspecionado

- A prévia principal Gemini da branch de desenvolvimento.
- O gerador `scripts/build-public-preview.cjs` e o plano anterior `docs/PLANO-PREVIA-PUBLICA.md`.
- A estrutura atual dos arquivos no GitHub.

## Riscos confirmados

1. A prévia embute lógica de contatos afetivos e uma âncora residencial particular. Mesmo sem mostrar um endereço completo na interface, os identificadores e dados do código podem revelar informação não destinada ao público.
2. Remover EXIF de duas fotografias, comentário interno e importação de fonte remota **não** anonimiza o JavaScript, o mapa embutido ou a narrativa.
3. Copiar o repositório atual para um repositório público preservando `.git`, documentos, rascunhos e referências exporia o histórico e material que não pertence ao pacote de colaboração.
4. O HTML público isolado não inclui automaticamente uma estrutura de módulos simples para contribuições. Isso deve ser planejado separadamente.

## Proteção implementada

O comando `npm run build:public-preview` agora executa uma verificação que **recusa o export** enquanto encontrar os identificadores privados conhecidos. Falhas devem ser tratadas como bloqueio, nunca como aprovação automática.

Essa lista de indicadores é inicial; passar pela verificação **não** comprova anonimização completa. Não publicar por conta própria apenas porque o comando terminou.

## Próximas entregas antes de pedir aprovação para publicar

- [ ] Definir quais narrativas e locais afetivos o autor autoriza compartilhar.
- [ ] Remover os módulos e os dados particulares da **cópia**, sem alterar a base Gemini privada.
- [ ] Garantir que imagens, metadados, comentários, textos, mapas e scripts não revelem endereços pessoais ou identificadores privados.
- [ ] Preparar um pacote de código colaborativo com apenas os módulos necessários, `README`, licenças e teste de build, sem `.git` anterior.
- [ ] Executar testes, auditoria de conteúdo completa e inspeção visual.
- [ ] Mostrar ao autor uma lista exata dos arquivos do pacote e obter aprovação explícita.
- [ ] Só depois criar um repositório público novo e publicar, mediante nova autorização.

## Arquivos que não serão copiados por padrão

`baseline/`, `drafts/`, `references/`, `docs/` internos, `AGENTS.md`, `.git/`, saves locais, anexos privados e arquivos históricos integrais.

**Privacidade do repositório original:** manter `chumikie/Beit-Lehem` privado. PR #1 permanece em rascunho, sem merge.
