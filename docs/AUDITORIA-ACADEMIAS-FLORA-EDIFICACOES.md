# Auditoria: academias, flora e o que é edifício em Beit Lehem

Pesquisa de 01/11/2026. **Acervo de referência**, sem inclusão automática na
experiência jogável e sem alterar a malha geográfica.

## Academias — referências para confirmar lote e operação

| Referência | Endereço publicado em Belém/PB | Grau de evidência |
| --- | --- | --- |
| Espaço Hidrovida | Rua Feliciano Pedrosa, 3031 | Endereço em guia comercial; Prefeitura também menciona o estabelecimento e há pesquisa acadêmica nele. Sem entrada/lote verificado. |
| Academia Superação | Rua Joaquim Rodrigues, 118 | Guia e registro empresarial; situação operacional contemporânea e fachada por confirmar. |
| Academia Corpus Fitness | Rua Brasiliano da Costa, 421/450 | Guias divergem no número; cadastro antigo consta baixado/inapto. Não representá-la como loja ativa sem nova verificação. |
| Base Fitness Centro de Musculação | Rua Feliciano Pedrosa, s/n | Registro empresarial aberto em 2026; estabelecimento, terreno e fachada precisam de verificação independente. |
| Centro de Treinamento Pura Energia | Rua Flávio Ribeiro, 08 | Listagem comercial; confirmar funcionamento e posição da entrada. |

Não converter nomes de pessoas físicas listadas em categoria fiscal de academia
em personagens nem em placas de estabelecimentos; classificação tributária não
prova que haja uma academia aberta no endereço. **O Xaviezão é ginásio de
esportes**, não uma academia particular de musculação.

Fontes de pesquisa: https://www.solutudo.com.br/empresas/pb/belem/academias ;
https://www.solutudo.com.br/empresas/pb/belem/academias?mais_buscadas=1 ;
https://www.belem.pb.gov.br/noticia/coleta-de-lixo-ser-alterada-nas-semanas-do-natal-e-do-ano-novo-no-centro-de-bel-m-e-ruas-adjacentes ;
https://cnpj.biz/66391363000103 .

## Flora: formação vegetal versus espécies individuais

- O município está no **bioma Caatinga**, segundo inventários territoriais.
- A Prefeitura documenta especificamente **xique-xique e mandacaru** no acesso
  à Pedra do Cordeiro. Isso autoriza o vocabulário artístico nesse setor,
  **não** o plantio virtual dessas espécies em toda rua ou parcela rural.
- O município ocupa uma paisagem de transição regional Agreste/Brejo, mas essa
  expressão cultural não determina sozinha a fitofisionomia de cada polígono.
- O GeoJSON OSM preservado contém **4 polígonos `park`**, **3 `grass`** e
  **1 `nature_reserve`**, além de áreas `pitch` e `residential`. Não existe
  levantamento de árvores isoladas ou espécies por polígono nesse extrato.
- `grounded-flora.js` amostra pontos ilustrativos dentro dessas áreas verdes,
  evitando ruas e cenários, mas **cada árvore desenhada é uma ilustração**,
  não uma árvore cadastral. Não chamar um polígono `park` de mata nativa sem prova.

Fontes de pesquisa: https://www.belem.pb.gov.br/a-cidade/aspectos-gerais ;
https://www.aguaesaneamento.org.br/municipios-e-saneamento/pb/belem ;
https://snif.florestal.gov.br/images/pdf/publicacoes/periodo_eleitoral/publicacoes_ifn/relatorios/IFN_PB_2019_periodo_eleitoral.pdf .

## O que é prédio, casa, área, via ou desenho

Inventário automatizado de `source/belem-osm-2026.geojson` (491 feições):

| Tipo no arquivo atual | Quantidade | Interpretação permitida |
| --- | ---: | --- |
| `LineString` | 462 | Eixos/segmentos de ruas e caminhos, não paredes |
| `Polygon` | 20 | Áreas de uso/cobertura: parques, grama, quadras e áreas residenciais, **não edifícios individuais** |
| `Point` | 9 | Marcadores de locais públicos/comércio, sem contorno de prédio ou acesso cadastrado |
| Feições com `building=*` | **0** | O extrato não permite confirmar nenhuma implantação de edifício por polígono |

O jogo ainda desenha casas e marcos simbólicos próximos da malha viária.
Essas formas são **arquitetura fictícia em Canvas 2D**, não edifícios
georreferenciados. A ausência de `building=*` não significa que Belém não tenha
prédios; significa que **este extrato não os levantou**. Não inferir número de
andares, uso, muro, portão, fachada ou entrada com base no eixo viário.

## Regras para a próxima camada visual

1. Preservar vias e circulação; impedir que volumes, calçadas e sombras
   atravessem a área de trânsito.
2. Separar a camada de **edifício confirmado** (quando houver perímetro e
   entrada verificados) da camada **cenário ilustrativo**.
3. Distinguir área verde urbana, gramado, roçado e vegetação nativa;
   conferir classe e evidência antes de desenhar copas/espécies.
4. Academias somente entram com nome, operação e localização de entrada
   suficientemente verificados; nenhum novo ponto exato é aprovado aqui.
5. Não introduzir fotos reais, mapas externos ou links de documentação na UI.

**Resultado desta etapa:** diagnóstico e catálogo de hipóteses. Sem novo
edifício, árvore cadastrada, academia, rua ou estabelecimento no mapa jogável.
