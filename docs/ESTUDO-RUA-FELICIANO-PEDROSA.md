# Rua Feliciano Pedrosa — estudo de implantação comercial

Estado: **pesquisa**, não implantação de lojas no mapa. Revisado em 01/11/2026.

## O que está documentado

| Referência pública | Endereço informado | Fonte | Precisão espacial |
| --- | --- | --- | --- |
| Supermercado Vida Nova 1 | Rua Feliciano Pedrosa, 1870, Centro | Site da própria Rede Paraíba | Endereço; lote/entrada sem coordenada verificada |
| Supermercado Vida Nova 2 | Rua Feliciano Pedrosa, 1600, Centro | Site da própria Rede Paraíba | Endereço; lote/entrada sem coordenada verificada |
| Supermercado Família | Rua Feliciano Pedrosa, 1451, Centro | Cadastros comerciais | Endereço; lote/entrada sem coordenada verificada |

Fontes de pesquisa (não incluir como links da experiência jogável):

- https://redeparaibasupermercados.com.br/nossas-lojas/
- https://radardocnpj.com.br/empresa/08972149000144
- https://brfirmas.org/Supermercado%2BFam%C3%ADlia-1343817

O último diretório apresenta um ponto histórico aproximado para o Família em
(-6.694701, -35.535434). Sua distância calculada ao eixo da via Rua Feliciano
Pedrosa no GeoJSON usado pelo jogo é de **aproximadamente 91 m**. Não usar esse
ponto como posição de fachada, entrada ou terreno.

## Inspeção cartográfica visual complementar (01/11/2026)

O Google Maps exibe três fichas compatíveis com os endereços e nomes acima.
As coordenadas abaixo são **pinos de listagens**, não contornos ou entradas
validados. Usadas apenas na pesquisa, nunca como links ou imagens dentro do jogo.

| Estabelecimento | Pino da listagem (lat, lon) | Distância ao eixo OSM rotulado `Rua Feliciano Pedrosa` | Via OSM mais próxima do pino |
| --- | --- | ---: | --- |
| Vida Nova 1 | -6.7010519, -35.5368980 | ~232 m | Travessa São Pedro (~3 m) |
| Vida Nova 2 | -6.6985579, -35.5363792 | ~112 m | Rua Boa Vista (~17 m) |
| Família | -6.6971944, -35.5358164 | ~15 m | Rua Feliciano Pedrosa (~15 m) |

Há portanto uma divergência entre **endereço postal e rótulos de vias no extrato
OSM atual** — não concluir automaticamente que os pinos, o cadastro postal ou
o nome da rua estão errados. Preservar os segmentos existentes até conferência
local/OSM independente. A foto principal da listagem Vida Nova 2 parece mostrar
outro estabelecimento, logo **não é evidência confiável de fachada**. A imagem
principal do Família mostra frente comercial e calçada, mas não comprova a
delimitação do lote. A imagem em destaque da unidade 1 mostra o interior.

Links de pesquisa das fichas do Google Maps, fora da experiência jogável:

- Vida Nova 1: https://www.google.com/maps/place/?q=place_id:ChIJu4PzEDG_rQcRGgQTqGERM2A
- Vida Nova 2: https://www.google.com/maps/place/?q=place_id:ChIJly4Oxdu_rQcR7o90psS_730
- Família: https://www.google.com/maps/search/?api=1&query=Supermercado%20Fam%C3%ADlia%20Bel%C3%A9m%20PB

Antes de incluir fachadas de estabelecimentos, verificar imagens de frente,
posição da porta, lado da rua e data das fotos. Nenhum dos três lotes está
aprovado como geometria exata nesta revisão.

## Geografia e composição do trecho

- A malha atual possui sete segmentos OSM denominados `Rua Feliciano Pedrosa`.
  Preservar integralmente suas coordenadas, conectividade e nome.
- A numeração postal **não** autoriza distribuir os prédios por interpolação
  linear, pois não há confirmação da sequência dos lotes nem do lado da rua.
- Antes de posicionar estabelecimentos, confirmar no mesmo referencial a
  fachada/entrada e a relação com o eixo viário, sem usar residência particular
  como âncora.
- Após verificação: fachada no lote correto, entrada voltada à calçada,
  largura livre de pedestres, separação ilustrativa entre piso viário e passeio,
  beiral e sombra sem cruzar a faixa de circulação.
- Enquanto isso, aprimorar apenas fachadas **já existentes** e comprovadamente
  livres da via, sem atribuir marcas comerciais a casas genéricas.

## Bloqueios explícitos

Não inserir novas lojas, pinos exatos, geometria de edifícios, placas de marca,
entradas ou números no Canvas com base somente neste estudo. Não alterar rotas,
áreas de exploração, moradores, missões ou salvamentos. Referências fotográficas
ou cartográficas permanecem fora da interface jogável.

Próxima confirmação necessária: fotografias públicas atuais e/ou imagem
cartográfica datada com localização inequívoca de cada fachada, especialmente
os dois Vida Nova e o Família. A aprovação de um lado da rua deve ser explícita.
