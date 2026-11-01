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
ponto como posição de fachada, entrada ou terreno. Não há coordenadas
independentes e verificadas para os lotes dos três mercados neste levantamento.

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
