# Beit Lehem — instruções do projeto

## Base e objetivo

- Nome atual: Beit Lehem. Repositório: chumikie/Beit-Lehem. Nomes antigos em arquivos históricos e chaves de save são intencionais.

- Base aprovada: V2.27. A V2.28 foi rejeitada por reduzir a extensão e substituir radicalmente a arte.
- Jogo local/offline. GitHub é apenas código e histórico. Não configurar Pages, hospedagem, deploy, servidor remoto, Actions, Codespaces ou integrações sem pedido específico.
- Repositório separado do TsuLiPa World. Não tocar no repositório, nas configurações ou nas integrações desse outro projeto.
- Mundo conectado de Belém/PB, distrito Rua Nova e entorno rural/serrano. Não amputar o mapa ou impor uma pequena caixa de circulação como substituto desse objetivo.
- Preservar a arte e os personagens atuais. Mudanças visuais devem ser pontuais, com comparação antes/depois antes de uma reformulação ampla.
- Novas atividades, inclusive crescimento da muda de Lúcia, estão pausadas enquanto mapa e apresentação são consolidados.

## Trabalho focado

1. Ler `docs/DECISOES.md`, `docs/PROXIMOS-PASSOS.md` e a seção pertinente de `docs/MAPA-DO-CODIGO.md`.
2. Consultar os arquivos do sistema solicitado e suas dependências diretas. Não é necessário reler o projeto inteiro, mas não presumir interfaces não verificadas.
3. Trabalhar em uma branch de tarefa e apresentar mudanças concretas, testes e limites. Não fazer merge de mudanças visuais/comportamentais sem aprovação.
4. Rodar os testes relacionados; antes da entrega integrada, executar `npm test`, `npm run verify:baseline` e `npm run build`.
5. Atualizar decisões e próximos passos quando houver uma decisão nova do usuário. Distinguir hipótese e código implementado.

## Proteções

- Não editar `baseline/Belem-Viva-V2-27.html` nem seu hash para fazer uma verificação passar.
- Não editar HTMLs autônomos gerados: alterar módulos em `dist/` e gerar novamente.
- Preservar chave e migração do save. Progresso local do usuário não entra no Git.
- Não inventar coordenadas de ruas, serras, água, espécies ou estabelecimentos. Arte ilustrativa e referência geográfica são camadas diferentes.
- Fotos e links fornecidos pelo usuário orientam desenho e pesquisa. Registrar local, direção e fonte quando conhecidos.
- Não armazenar ZIPs de cada versão, vídeos, credenciais, dependências ou caches no Git. Não modificar configurações globais da conta GitHub.
- Preferir ações reversíveis; não declarar teste de navegador, celular ou integração externa que não foi executado.

## Referências e PR de evolução

- O usuário autorizou commits e atualizações na branch `review/referencias-locais-2026-10-31`, em uma única PR de rascunho. Não criar outra PR para cada arquivo. Não fazer merge sem autorização expressa.
- Consultar `docs/GUIA-REFERENCIAS-LOCAIS.md` e o índice em `references/gemini-2026-10-31/INDICE.md`; ler o trecho pertinente do arquivo grande, em vez de reler tudo.
- Conservar a fonte anonimizada como referência; não sobrescrever `dist/` com o experimento. Coordenadas propostas não são dados OSM confirmados. Não reintroduzir dados pessoais do anexo original.
