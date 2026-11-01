# Matriz de evidências urbanas — Beit Lehem / Belém-PB
Revisão de 01/11/2026 · branch `chore/consolidar-html-principal-2026-11-01`

## Regra de leitura

Cada setor combina quatro camadas que não podem ser confundidas:

1. **Documento/memória:** prova a existência, a prática cultural ou uma lembrança transmitida; não define lote, fachada, entrada ou coordenada por si só.
2. **Geometria OSM:** prova somente o eixo/feição e as tags presentes na extração municipal `2501906`; não prova largura, calçada, parede, lote ou acesso interno.
3. **Âncora:** ponto OSM ou ponto de referência do autor. Um ponto local com estado `user_reference_unverified` / `user_reference_proposed` não é ponto OSM.
4. **Interpretação arquitetônica:** desenho novo do jogo. Portas, janelas, cores, toldos, quintais, muros baixos e mobiliário não são levantamentos prediais.

A extração examinada tem **491 feições: 462 linhas viárias, 20 polígonos e 9 pontos**. Há **zero** feições `building=*`; os 20 polígonos são classes de uso/área (cinco residenciais, quatro parques, três gramados, sete quadras e uma reserva natural). Logo, o protótipo não dispõe de cadastro de prédios ou parcelas. Casas, fachadas e limites de lote no Canvas são arte ficcional.

## Setores do ateliê

| Setor | Evidência documental/memória | Geometria OSM literal | Leitura arquitetônica permitida | Não afirmar |
|---|---|---|---|---|
| **Matriz / Igreja de Belém** | A documentação municipal registra a Procissão de Nossa Senhora da Conceição como patrimônio imaterial; a foto histórica de 2007 inspira a representação do templo. | Marco `igreja` com `positionStatus=osm_point`; o ponto é âncora cartográfica, não contorno do templo. | Torre, arcos, pilastras e reboco do cartão ilustrativo podem se inspirar na foto de 2007. Casas vizinhas recebem apenas variedade artística genérica. | A foto de 2007 não documenta as fachadas privadas do entorno, dimensões cadastrais ou a implantação da praça. |
| **Mercado / Feira** | Lei municipal 475/2019 reconhece a feira livre como patrimônio imaterial; a segunda-feira é o dia tradicional documentado. Foto de 2007 inspira a cena de feira. | Marco `mercado` com `positionStatus=osm_point`; ruas e polígonos preservados. | Toldos, cestos, bancas e ritmo comercial são ilustrações inspiradas na atividade e na foto histórica. | Não copiar a posição atual de cada banca, vendedor, vitrine ou porta. O ponto OSM não é o perímetro do Mercado. |
| **Rua João Pessoa** | O dossiê não apresenta levantamento fotográfico de fachadas específicas neste trecho. | Exatamente `Rua João Pessoa`: 2 trechos, cerca de 372 m; `highway=residential`, `surface=paved`. | Família residencial genérica, com variações de portas, janelas, reboco e beirais. | Não declarar que cores, portões ou fachadas pertencem a imóveis reais. |
| **Rua Clovis Bezerra e travessas documentadas** | Memória local do autor menciona cadeiras na calçada, portões, vasos e uma garagem prateada como inspiração para uma casa fictícia; a Escola Anita é referência local com ponto/entrada pendentes. | `Rua Clovis Bezerra`: 1 trecho, ~898 m, `highway=residential`, sem `surface`. Também existem `Rua Antônio Borges de Lima` (1 trecho, ~138 m, sem `surface`) e `Rua Antônio Alfredo Guedes` (1 trecho, ~140 m, `surface=sett`). | Varandas, portões, cadeiras, vasos, muros baixos e quintais podem aparecer como cenas propostas, sem afirmar que reproduzem uma casa real. Calçada de paralelepípedo é memória/indicação do autor, não tag OSM do eixo Clovis. | Não unir `Rua Antônio Alfredo da Silva` a `Rua Antônio Alfredo Guedes` (são nomes OSM distintos). A extração tem `Rua Nunes`, não `Rua Nunes Guedes`; não renomear nem presumir equivalência. Não inventar lote ou entrada da Escola Anita. |
| **Rua Feliciano Pedrosa** | Estudo comercial lista unidades Vida Nova 1/2 e Supermercado Família, mas pinos/endereço e eixos viários divergem; nenhuma frente/lote está aprovada. Sonho Doce é nome ficcional, sem posição comercial confirmada. | Exatamente `Rua Feliciano Pedrosa`: 7 trechos, ~3.239 m; `highway=primary`, `surface=asphalt`. Nenhum trecho tem tag `sidewalk` nesta extração. | Marquises, vitrines e toldos podem caracterizar uma tipologia comercial imaginada ao longo do corredor, sem identificar estabelecimento real. | Não fixar lojas pelos números postais, interpolar lotes, desenhar marcas, portas ou calçadas levantadas. O estudo mostra pinos listados a ~112–232 m do eixo em dois casos, e divergência entre endereço e OSM. |
| **Rua Vicente Cado** | Bar da Prosa é nome/cena ficcional inspirada na memória do autor: terracota, mesas amarelas, espetinhos e luzes. Localização/entrada exata não confirmadas. | Exatamente `Rua Vicente Cado`: 1 trecho, ~327 m; `highway=residential`, `surface=paved`; sem tag `sidewalk`. | Uma pequena tipologia de bar de bairro pode usar terracota, toldo, mesas e iluminação como arte ficcional. | Não apresentar Bar da Prosa como estabelecimento verificado nem afirmar o lote/porta nº 354 como georreferenciado. |
| **Rua Brasiliana da Costa / Xaviezão / 3 de Maio** | O dossiê registra o trajeto documentado do São Pedro 2026 na Rua Brasiliana da Costa e a história da Padaria/Indústria 3 de Maio. A festa é sazonal; Padaria e fábrica são POIs distintos. | `Rua Brasiliana da Costa`: 2 trechos, ~1.294 m, `highway=residential`, `surface=paved`. | Corredor para futuras cenas sazonais e ilustração de atividade produtiva somente após posicionamento público confirmado. | Não criar palco permanente, bloqueios viários, fachada da fábrica, portão, entrada ou rota para instalações privadas. Não atribuir a Padaria da Tia um lote da fábrica ou vice-versa. |

## Marcos e setores fora da malha de fachadas

| Referência | Evidência | Estado espacial | Regra de arte |
|---|---|---|---|
| Rodoviária | Ponto público no mapa; o dossiê não fornece levantamento da fachada. | Ponto OSM; desenho atual é simbólico. | Cartão ilustrativo, sem declarar réplica da estação. |
| Praça 6 de Setembro | Notícia municipal de 2023 descreve cascata iluminada, anfiteatro e jardins suspensos. | O jogo usa uma posição proposta, sem polígono/entrada confirmados. | Usar esses elementos como vocabulário visual, não planta ou dimensões construídas. |
| Pedra do Cordeiro | Prefeitura descreve formação a oeste, pouco mais de 1 km, com cruzeiro, mandacaru e xique-xique. | Pino do autor é pontual; contorno, entrada e trilha não estão validados. | Separar afloramento, cruzeiro, mirante e acesso. Não criar caminho jogável nem desenhar uma rocha como lote. |
| Parque Artesanal São Luís / Lagoa de Serra | Prefeitura o situa em propriedade rural no alto de serra; matéria de 2019 descreve brinquedos reciclados e aproximadamente 2 km do centro. | Pino do autor é pontual; entrada e acesso atual não foram verificados. | Brinquedos e roda-gigante do jogo são miniaturas artísticas, não inventário físico. |
| Sítios, açudes e Serra do Camucá | Dossiê documenta corpos d'água OSM, crista `way/884827347` e referências rurais; não documenta uma trilha autorizada com o nome Trilha do Camucá. | Água em arquivo separado; crista é `natural=ridge`, não via; acesso continua pendente. | Não desenhar acesso, porteira, sede de fazenda ou ligação rural inventada. |

## Auditoria do eixo Y e pinos de Pedra/Parque

A projeção usada pelo build é:

`x = (lon - originLon) × metersPerDegreeLon`
`y = (originLat - lat) × metersPerDegreeLat`

A função inversa usada no jogo é:
`lat = originLat - y / metersPerDegreeLat`
`lon = originLon + x / metersPerDegreeLon`

Para os pinos públicos fornecidos pelo autor, a fórmula ativa produz:

- **Pedra do Cordeiro** (-6.6984919, -35.5472188) → **[-1134,22; +192,80]**.
- **Parque São Luís** (-6.7129197, -35.5237656) → **[+1458,78; +1798,90]**.

A anotação antiga em `AUDITORIA-GEOGRAFICA-ETAPA-1.md` registrou Y negativo. Isso está em desacordo com a fórmula ativa e com a função inversa; **o registro textual antigo é que está com o sinal invertido, não se deve inverter a projeção nem mover os pinos**.

Conferência de distância em linha reta até a geometria viária da extração preservada (não é rota, entrada nem direito de passagem):

- Pedra: ~650,5 unidades até `way/542266676` com Y positivo; ~802,4 na alternativa com sinal invertido.
- Parque: ~339,4 unidades até `way/710704449` com Y positivo; a alternativa com Y negativo cai a ~0,53 unidade de `way/264042894`. Esta proximidade aparente é artefato do sinal errado.
- Portanto, **não** declarar que o Parque fica a 0,5 m de uma via nem usar esse ponto como entrada. O parque precisa de referência de acesso independente; a Pedra também não tem conexão pedonal confirmada.

## Regras de implementação e regressão

1. Nomes OSM são literais; não normalizar acentos ou fundir vias parecidas.
2. Âncoras de setores de rua devem ser calculadas sobre os segmentos OSM com os nomes exatos, não sobre POIs locais sem posição confirmada nem coordenadas fixas.
3. Raios/corredores do ateliê são limites visuais de classificação, nunca limites de bairro ou lotes.
4. O alinhamento das fachadas e o sentido da porta são transformações de desenho. Não alteram centros de casas, vias, pontos, missões, horários, itinerários ou saves.
5. Calçadas, muros, quintais e entradas continuam propostas artísticas até existir geometria/registro de campo adequado; não criar polígonos de edifícios.
