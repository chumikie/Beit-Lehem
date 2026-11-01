# Decisões vigentes

- Nome oficial: **Beit Lehem**. Repositório privado: https://github.com/chumikie/Beit-Lehem.

- V2.27 é a referência técnica estável, congelada. **Por decisão posterior do autor, o experimento Gemini passa a ser a base principal das prévias em desenvolvimento**, por conter o mapa visual e sistemas mais completos.
- V2.28 foi rejeitada. Não reutilizar seu corte territorial e seu novo elenco como padrão.
- Território desejado: cidade de Belém/PB, distrito Rua Nova, caminhos rurais, serras e fauna/flora do entorno; encerrar antes de construir os demais núcleos urbanos.
- Um mundo conectado; divisão por setores pode existir internamente para organização e desempenho.
- Prioridade atual: fundamentação e acabamento do mapa, navegação e personagens. Novas atividades pausadas.
- Mercado — decisão artística de 01/11/2026: não deslocar nem corrigir artificialmente as ruas para acomodar cenários. A área ocupada pela ilustração do Mercado deve ficar livre de cruzamentos com segmentos OSM; fachadas e comércio da Rua Feliciano Pedrosa aguardam confirmação de lotes e entradas antes de novos desenhos.
- Fotos de referência serão enviadas aos poucos pelo usuário. Trabalhar por lugares identificados e comparações visuais controladas.
- GitHub privado para desenvolvimento; cópia local para jogar; nenhuma hospedagem.
- Testes locais. Não incluir workflows; desativação administrativa de Actions ainda pendente de conferência pelo proprietário apenas neste repositório; preservar o projeto principal e as configurações globais da conta.
- Não há exportação/importação do diário ainda. Implementar de forma testável antes de trocar a origem/local de execução supondo que o progresso migrará sozinho.

- Referências do Gemini: conservar cópia grande anonimizada e guia cumulativo em uma única PR de rascunho. Commits e atualizações na PR estão autorizados; merge permanece proibido até autorização expressa. Não publicar nomes ou vínculos residenciais particulares.


## Crescimento a partir das referências Gemini

A V2.27 permanece preservada como recuperação. A linha principal de desenvolvimento agora deriva do Gemini; seus bugs, compatibilidade de save e apresentação móvel precisam ser corrigidos gradualmente sem encolher o mundo. A malha OSM de 462 trechos permanece inalterada. As 17 propostas de nomes e superfícies locais permanecem desativadas até validação; nenhum rótulo pendente é exibido como dado confirmado. O estudo de fachadas cresce para seis zonas, mas as três novas zonas são estudos preliminares, sem confirmar nomes ou limites viários. O progresso já salvo nas três áreas antigas permanece válido. O snapshot do jogo em desenvolvimento é gerado por `scripts/build-development-preview.cjs` a partir do Gemini. Os módulos de `dist/` continuam disponíveis para portar correções.

## Prévia pública de testes — autorização de 31/10/2026

O autor autorizou disponibilizar Beit Lehem na internet para poder jogar e realizar inspeções visuais, sem exigir que o repositório de desenvolvimento se torne público. A branch `gh-pages` foi preparada apenas com `index.html` (cópia do HTML autônomo atual) e `.nojekyll`; nenhuma fonte, histórico de PR ou documentação privada é incluída nessa árvore de publicação.

A ativação do GitHub Pages em **Settings → Pages → Deploy from a branch → gh-pages → /(root)** ainda depende da configuração administrativa pelo proprietário. Não considerar o site publicado até o URL abrir e o jogo carregar. Se o plano do GitHub não permitir Pages para repositório privado, consultar o autor antes de mudar a visibilidade do repositório inteiro.

A PR #1 continua como ambiente de desenvolvimento sem merge. Atualizar `gh-pages` somente depois de reconstruir e testar a prévia e obter confirmação de que é a versão desejada para testes públicos. Não publicar dados pessoais, domicílios ou anexos privados.
