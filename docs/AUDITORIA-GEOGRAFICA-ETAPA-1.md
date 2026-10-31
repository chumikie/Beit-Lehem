# Auditoria geográfica — etapa 1 (31/10/2026)

**Escopo:** diagnóstico documental da branch `review/referencias-locais-2026-10-31`, PR #1. **Nenhum limite, geometria, coordenada, rota, edifício ou prévia jogável foi alterado nesta etapa.** Não autoriza publicação ou merge.

## Princípio aprovado pelo autor

Concentrar o acabamento na área urbana enquanto setores afastados ainda sem referências detalhadas podem futuramente ficar temporariamente não exploráveis. **Preservar integralmente a malha territorial, serras, águas, Rua Nova e destinos rurais**; não substituir o território por uma caixa urbana pequena. Um limite de *gameplay*, se implementado, deverá ser reversível, separado dos dados geográficos e preservar a visualização do entorno. O desenho exato dependerá de nova revisão.

## O que foi conferido no código

- `source/belem-osm-2026.geojson`: 491 feições, das quais **462 linhas viárias**, **20 polígonos** e **9 pontos**. A cobertura OSM não garante a existência, acessibilidade nem completude de todos os caminhos rurais.
- `dist/map.json`: **462 ruas**, limites mundiais `[-1382.58,-5724.5,12783.82,8943.03]`, três marcos OSM principais (`igreja`, `mercado`, `rodoviaria`). São coordenadas projetadas do jogo, não latitude/longitude.
- Polígonos do mapa base: sete `pitch`, quatro `park`, cinco `residential`, um `nature_reserve`, três `grass`. **Não equivalem a um inventário completo de serras, açudes ou cursos d'água.** Não inferir que a ausência de uma feição significa ausência de água no terreno.
- `dist/terrain.json`: grade de relevo localizada, de resolução aproximada de 140 unidades por célula. Seu recorte não é uma prova de relevo detalhado para todos os ~14 km do mundo.
- `dist/geology.json`: observações pontuais do SGB, **não** polígonos do afloramento nem entradas de trilha.
- A prévia Gemini contém `pedra_cordeiro` na posição ilustrativa `[-312.85,133.24]` e `parque_sao_luis` em `[219.41,-363.86]`. Ambos estão marcados no próprio dado como `user_reference_unverified`. **Esses pontos não devem ser tratados como localizações reais confirmadas, nem como centros/contornos físicos das atrações.**

## Lugares a revisar antes de qualquer movimentação

| Referência | Evidência existente | Situação | Próxima ação |
| --- | --- | --- | --- |
| Pedra do Cordeiro | Prefeitura: formação rochosa a oeste do centro, pouco mais de 1 km, trilha com vegetação e cruzeiro | Posição ilustrativa central e escala física inadequada; perímetro e acesso desconhecidos | Recuperar referência aprovada pelo autor; distinguir afloramento, acesso, cruzeiro e mirante; depois medir geometria |
| Parque São Luís / Parque José Luís | Prefeitura: zona rural de Lagoa de Serra, cerca de 2 km do centro, numa serra | Ponto ilustrativo central; entrada, caminho e área desconhecidos | Validar coordenada/entrada do autor e vias reais de acesso, sem teleporte |
| Açudes, lagoas e águas | Memória local do autor; mapa extraído não os documenta adequadamente | Lacuna de hidrografia e identidade ambiental | Reunir nomes, fotografias e polígonos ou margens verificáveis; distinguir açude, lagoa e córrego |
| Serras e encostas | Relevo em grade limitada, descrições municipais, pontos SGB | Falta extensão e escala visual coerentes | Validar curvas e silhuetas com referência local antes de ilustrar |
| Rua Nova e conexões rurais | Objetivo do projeto e parte da malha OSM | Continuidade e transitabilidade ainda não auditadas | Verificar conectividade e acessos antes de restringir circulação |
| Centro urbano | Ruas e marcos atuais, incluindo contribuições do autor | Área prioritária de acabamento, sem perímetro validado | Definir setores por conexões viárias e fotografias, não por raio arbitrário |

## Coordenadas enviadas anteriormente

O guia `docs/GUIA-REFERENCIAS-LOCAIS.md` registra que o autor forneceu referências e links de mapas, mas **não há nesta auditoria uma tabela consolidada e verificável das coordenadas aprovadas** para Pedra, parque e corpos d'água. Não substituir os pontos ilustrativos por valores estimados a partir de distâncias textuais. Solicitar apenas a referência pública pontual que faltar após recuperar os registros apropriados; nunca incluir endereços particulares ou rotas de origem residencial.

## Regras para a futura fronteira temporária de exploração

1. **Não alterar** `source/`, `dist/map.json`, o relevo ou o mapa original por causa de um limite de gameplay.
2. Preferir uma **máscara reversível de setores desenvolvidos**, com continuidade de vias, em vez de recorte cartográfico ou retângulo rígido.
3. Manter serras, água e destinos externos visíveis no mapa e na direção de arte, inclusive enquanto não exploráveis.
4. Não bloquear uma estrada conectada sem avaliar a experiência de ida e retorno e sem comunicação clara ao jogador.
5. Validar primeiro com o autor um mapa de setores e os pontos corrigidos. Só implementar o bloqueio em etapa futura.
6. Testar zoom, minimapa e salvamento antes de ativar qualquer mudança de circulação.

## Fontes e limites da conferência

- `docs/DECISOES.md`, `docs/PROXIMOS-PASSOS.md`, `docs/GUIA-REFERENCIAS-LOCAIS.md`.
- `source/belem-osm-2026.geojson`, `dist/map.json`, `dist/terrain.json`, `dist/geology.json`; referência Gemini embutida nas prévias.
- Prefeitura de Belém/PB, *Aspectos Gerais*: https://www.belem.pb.gov.br/a-cidade/aspectos-gerais
- Prefeitura de Belém/PB, notícia histórica sobre Parque São Luís (2019): https://mail.belem.pb.gov.br/noticia/turismo-e-sustentabilidade-conhe-a-o-parque-de-divers-es-constru-do-com-materiais-recicl-veis-em-bel-m

As fontes municipais documentam **existência, contexto e distâncias aproximadas**, não latitude/longitude, geometrias ou situação de acesso atual. Nenhuma inspeção visual em navegador ou medição geodésica foi realizada.

## Complemento — recuperação das referências anteriores

Uma busca adicional no histórico de colaboração recuperou os seguintes dados, **sem transformá-los em posições aprovadas**:

- Os links Google Maps citados no passado chegaram truncados (`https://www.google.com/...`), sem URLs completas que permitam validar pontos.
- O protótipo anterior também usava a posição interna `[258,-356]` para Parque São Luís/Lagoa de Serra, próxima da posição atual `[219.41,-363.86]`. **As duas são ilustrativas e próximas demais do centro** para concluir que representam o local real.
- Foram anotadas posições de protótipo para `Açude Tribofe/Riacho do Grotão [340,106]` e `Cachoeira do Roncador/Rio Bananeiras [-382,512]`. **Não incorporar tais pontos como hidrografia confirmada** sem verificar município, feições, margens e referências: a mera menção ao Roncador não comprova que seja um destino do território jogável de Belém.
- Há referências geográficas históricas para Lagoa do Matias/Matau, Gameleira e Sítio Picada em material de apoio. São **localidades a pesquisar**, não coordenadas aprovadas para novos atrativos.
- Para Pedra do Cordeiro, o histórico continua indicando apenas posição geral a oeste e distância aproximada, **sem coordenada corrigida**.
- O usuário explicitou que o afloramento é muito maior que o desenho atual. **Separar a extensão da rocha do ponto de entrada da trilha e do cruzeiro/mirante** é requisito para a representação futura.

**Decisão desta rodada:** manter os dados e a exploração como estão até confirmar pontos de acesso e extensão. A ordem aprovada continua: (1) destinos afastados, (2) águas e serras, (3) setores exploráveis. Nenhuma dessas fases deve apagar o território.
