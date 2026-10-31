# Camadas afetivas e visuais de Belém/PB — direção do autor

Este documento registra referências fornecidas pelo autor em 31/10/2026 para o **Gemini Preview, base principal**. São orientações de arte e cotidiano, não autorização para inventar coordenadas, reconstruir o mapa ou publicar dados pessoais. O autor afirma ter validado as coordenadas existentes do Gemini com sua vivência e fotos. Os personagens e diálogos acrescentados são **ficcionais**.

## Linguagem do mundo

Belém deve parecer **interativa, nostálgica, feliz, alegre, acolhedora e segura**. Cozy de cidade do interior, sem temática idol. Atividades menores e rotinas autônomas, com baixa carga de processamento e funcionamento offline.

## Camadas de cenário (futuras; não implementadas por este documento)

| Camada | Referência do autor | Próxima edição controlada |
| --- | --- | --- |
| Agreste → Brejo | Transição seca/pedregosa para áreas mais úmidas em direção à Serra da Copaoba | Variação gradual de flora e tonalidade, sem alterar limites ou relevo medido |
| Eixo comercial vs ruas de pedra | Feliciano Pedrosa mais movimentada; Clóvis Bezerra, Nunes e Antônio Borges de Lima com calçamento, batentes e meio-fios | Meio-fio caiado, rampas e motos estacionadas 2D só onde a composição comportar |
| Casas | Platibandas, cerâmicas, portões de alumínio/ferro, azulejo numerado, medidores, antenas e plantas | Distribuir detalhes pequenos nas fachadas existentes, sem aumentar densidade |
| Patrimônio imaterial | Feira Livre, Sorda de João de Deus e procissão da padroeira | Vapor ilustrativo junto de tabuleiros; futura compra/presente somente após testar inventário, moeda e amizade |
| Parque São Luís | Brinquedos artesanais de materiais reaproveitados, associados à Lagoa de Serra | Refinar animação da roda-gigante e avaliar interação sem criar novos pontos |
| Ciclo diário | Mercado e escola de manhã; cadeiras às 17h na Clóvis; luzes e encontros às 19h | Cenas horárias leves, com controle de desempenho móvel |

## Diálogos de bairro: etapa atual

A primeira implementação usa **somente marcos já existentes** e diálogos curtos, ficcionais, alternados nos toques sobre figurantes próximos. Código em `gemini-modules/crowd-flow.js` e chamada em `gemini-modules/game.js`. Não são transcrições de pessoas reais.

Temas já introduzidos: movimento na feira, sorda, escola e calçadas, ginásio, rodoviária, comércio, igrejas, Parque São Luís, pedra e serra. Faltam: diálogos realmente recíprocos entre dois NPCs, rotinas com destino e retorno verificados, agenda mais rica dos moradores e inspeção visual no celular.

## Fontes para conferência artística

- Prefeitura de Belém/PB — notícia sobre a Lei 475/2019: https://www.belem.pb.gov.br/noticia/prefeita-renata-sanciona-lei-tornando-patrim-nio-cultural-imaterial-a-feira-livre-a-sorda-de-jo-o-de-deus-e-a-prociss-o-da-padroeira
- Prefeitura de Belém/PB — turismo e atrativos: https://www.belem.pb.gov.br/public/index.php/noticia/turismo-projeto-destino-brejo-destaca-atrativos-do-munic-pio-de-bel-m

Links de fotos privadas e endereços de residência recebidos do autor não devem ser replicados neste documento público de código.

## Proteções

- **Fonte:** `references/gemini-2026-10-31/experimento-anonimizado.html.txt` intocada.
- **Save:** manter chave experimental e dados atuais; falas não são persistidas.
- **Mobile:** medir FPS e colisões visuais antes de somar mais NPCs.
- **Publicação:** não ativar GitHub Pages ou serviço externo sem decisão específica do autor.

## Complemento do Gemini — 31/10/2026 (resumo sem dados pessoais)

O autor trouxe uma transferência de conhecimento mais extensa de outra IA. **O documento bruto NÃO foi versionado**, pois inclui endereço residencial preciso, coordenadas pessoais e informações de convivência familiar. Não reproduzir esses dados em prévia pública ou arquivos de distribuição.

Referências artísticas não sensíveis aproveitáveis:

- **Pisos:** contraste entre eixo asfaltado mais comercial, ruas de paralelepípedo, pequenos batentes e meios-fios caiados.
- **Arquitetura:** platibandas, barras de parede em tons contrastantes, portões metálicos, numeração em azulejo, caixas d'água e plantas nos terraços.
- **Vegetação:** gradiente do Agreste para o Brejo; árvores frutíferas, três-marias e vasos, sem afirmar espécies ou declives em pontos não verificados.
- **Ritmos de rua:** manhã de feira e escola; intervalo mais calmo depois do almoço; cadeiras e conversas ao fim da tarde; iluminação e encontros noturnos.
- **Falas regionais:** gentilezas e convites simples, evitando estereótipos. Exemplos para inspiração, não falas documentadas: “Vá por sombra”, “Tem pressa não”, “Chegue pra cá”, “Arrume um banquinho aí”.
- **Cultura:** Sorda de João de Deus, feira, São Pedro e parque artesanal; conferir cada novo detalhe com fonte ou com o autor.

### Cuidado com alegações de implementação

O documento externo apresenta uma tabela classificando muitos lugares e efeitos como “100% implementados”. Essas classificações são **afirmações da outra IA, não testes desta versão**. Antes de criar tarefas ou dizer que algo funciona, conferir `gemini-modules/`, as prévias e uma inspeção visual.

Há inclusive descrições de uma residência e de um animal pessoal que **não devem ser reintroduzidos a partir dessa transferência**, porque a fonte Gemini versionada foi anonimizada. A versão pública deve permanecer sem identificadores residenciais.

A prioridade permanece: preservar o mapa Gemini, corrigir problemas verificáveis, trabalhar em módulos pequenos e registrar o que passou por testes reais.
