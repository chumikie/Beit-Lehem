# Belém/PB — caderno de pesquisa cultural e natural (V2.6)

Este documento define a regra de autenticidade de **Trilhas do Roncador**: mapa e cenas não são equivalentes. A presença de um ponto OSM informa a referência geográfica comunitária; não confirma posição de porta, tamanho, fachada, uso atual ou acesso físico. Narrativas originais devem ser diferenciadas de depoimentos reais.

**V2.4:** há uma camada artística opcional visível por padrão, com quatro cenas dimensionadas e afastadas dos eixos viários e das missões. Os pontos reais continuam independentes da arte. A Praça 6 de Setembro tem somente uma `visualReference` para composição ilustrativa; não tem campo `p`, não produz rota GPS e traz aviso “sem local exato”. **Não citar as posições dos desenhos como coordenadas de edifícios ou praça.**

**V2.6:** imagens procedurais de aves e borboletas são geradas apenas dentro de parques, gramados e áreas verdes já mapeadas como polígonos no OSM, com afastamento de vias, casas e fachadas. Isso é uma **decisão de composição visual**, não um levantamento de fauna, uma estimativa de abundância ou um registro de avistamento. O canteiro com colheitas repetíveis e as agendas dos três novos moradores são ficcionais e não georreferenciam roças, casas ou pessoas reais. Conceitos de rotinas e necessidades vêm do protótipo independente `Belém — Entre Ruas e Memórias 0.6`, enviado pelo criador do jogo; sua planta fictícia não foi importada.

## Vozes, memórias e cuidado com as fontes

- **CoLingPB UFPB, Agreste urbano:** o catálogo inclui Belém-PB, códigos `brPB03_g1aF01` a `brPB03_g3aM01`, com temas de estudos, deslocamento, feira, história urbana, migração, festas, água e eletricidade. **É um índice de assuntos, não uma transcrição**. Fonte: https://repositorio.ufpb.br/jspui/bitstream/123456789/23987/2/CoLingPB_Caracter%C3%ADsticas%20dos%20%C3%A1udios_t%C3%B3picos%20abordados_Agreste-Zona%20Urbana.pdf
- **CoLingPB UFPB, Agreste rural:** os registros `brPB03_g1bF01` a `brPB03_g3bM01` incluem tópicos de macaxeira, casa de farinha, cisterna, chuva, agave, algodão, animais e histórias como Comadre Florzinha e Maria Couro. Ainda é preciso **ouvir e contextualizar** cada gravação antes de representar variantes de histórias ou falas. Fonte: https://repositorio.ufpb.br/jspui/bitstream/123456789/23987/1/CoLingPB_Caracter%C3%ADsticas%20dos%20%C3%A1udios_t%C3%B3picos%20abordados_Agreste-Zona%20Rural.pdf
- **Lei municipal 475/2019:** Feira Livre, Sorda de João de Deus e Procissão da padroeira são reconhecidas como patrimônio cultural imaterial pela Prefeitura. Fonte: https://www.belem.pb.gov.br/noticia/prefeita-renata-sanciona-lei-tornando-patrim-nio-cultural-imaterial-a-feira-livre-a-sorda-de-jo-o-de-deus-e-a-prociss-o-da-padroeira

## Camadas cartográficas necessárias para paisagens fiéis

| Tema | Situação nesta V2 | Camada e ação próxima |
| --- | --- | --- |
| Ruas e pontos nomeados | OSM municipal importado, não exaustivo | Auditar pontos, edifícios e acessos com imagens verificadas e visitas locais |
| Praças e edifícios | Três pontos OSM; praça sem geometria confirmada | Importar contornos cadastrados/OSM verificados, com data e fonte |
| Vegetação e plantações | Apenas parques/gramados/reserva em 20 polígonos OSM | Cruzar classes anuais de cobertura e uso do solo do [MapBiomas](https://brasil.mapbiomas.org/iniciativas-e-produtos/cobertura-e-uso-da-terra/cobertura-30m/cobertura/) com a malha IBGE |
| Água e lagos | Sem polígonos de água na extração atual | Cruzar rios/massas d'água da [Base Hidrográfica da ANA](https://www.snirh.gov.br/portal/snirh-1/acesso-tematico/divisao-hidrografica) e verificar coordenadas, escala e sazonalidade |
| Rochas e relevo | Ausentes no mapa jogável | Cruzar dados geológicos do [SGB](https://www.sgb.gov.br/mapeamento_geologico/) e modelo de elevação apropriado; distinguir formação geológica de afloramento visível |
| Flora e fauna | Ilustração genérica declarada | Verificar listas de ocorrência com registros locais/APA e fotografias licenciadas; só afirmar espécie onde houver evidência |

**Intensidade do mapa:** densidade de árvores, cultivo, água, rocha e altitude só deve ser dirigida por geometrias ou células de raster com fonte, resolução, data e confiança. Um vazio na base atual significa **dados faltantes**, não ausência da paisagem real. A arte de transição deve permanecer explicitamente conceitual.

## Etapa cartográfica priorizada após V2.6

1. **Vegetação e roçados (escala local):** baixar uma janela de 10 m para o município e sua borda a partir do [MapBiomas Cobertura 10 m](https://brasil.mapbiomas.org/iniciativas-e-produtos/cobertura-e-uso-da-terra/cobertura-10m/cobertura/), conservando ano, coleção, códigos de legenda, licença e resolução. Classes rasters **não** são cercas de propriedades ou identificação de cultivos individuais. Conferir a classificação anual e diferenças com a vegetação do [BDiA do IBGE](https://www.ibge.gov.br/geociencias/informacoes-ambientais/geomorfologia/23382-banco-de-informacoes-ambientais.html).
2. **Rios e massas d'água:** consultar a [Base Hidrográfica Ottocodificada da ANA](https://www.snirh.gov.br/) e o catálogo de metadados com recorte para Belém/PB e a APA inteira. Verificar geometria, hierarquia, escala e se cada corpo d'água é permanente, sazonal ou simplesmente não classificado. Não desenhar lago em área sem geometria confirmada.
3. **Rochas e formas de relevo:** cruzar [BDiA Geologia/Geomorfologia](https://www.ibge.gov.br/geociencias/informacoes-ambientais/geomorfologia/23382-banco-de-informacoes-ambientais.html) com [Geologia e afloramentos do Geoportal SGB](https://geoportal.sgb.gov.br/server/rest/services/geologia). Unidade geológica em polígono **não significa** rocha visível na superfície; só criar sprite de afloramento depois de um dado local ou imagem verificada.
4. **Elevação e declividade:** avaliar um modelo digital de elevação compatível com o tamanho dos cenários. Aplicar raster separado para iluminação e altura, sem distorcer as coordenadas dos eixos OSM nem criar encostas intransitáveis arbitrárias.
5. **Ficha de proveniência por camada:** arquivo original, autor, fonte primária, data da captura, CRS, resolução/escala, recorte com IBGE `2501906`, cobertura da APA, método de reprojeção, permissões de uso e nível de confiança; executar teste espacial antes de representar.

As referências acima foram identificadas, mas **os rasters, vetores e arquivos originais ainda não foram baixados, conciliados ou importados na V2.6**. A primeira camada precisa ser verificada no entorno real de Belém antes de virar flora ou geologia visível.

**Segurança:** não criar missões de deslocamento para propriedades particulares, açudes, nascentes, afloramentos ou áreas de conservação sem acesso e risco verificados. Registrar histórias de moradores exige atenção a consentimento, direito de imagem e direitos sobre as gravações.

# Atualização V2.7 — camada geológica GPS do SGB (31/10/2026)

Foram importados **14 registros pontuais** da camada `afloramentos/MapServer/0` do Serviço Geológico do Brasil, com filtro exato `UF='PB' AND MUNICIPIO='Belém'` para evitar a confusão com Belém do Brejo do Cruz. A resposta em GeoJSON WGS84 foi arquivada em `source/sgb-afloramentos-belem-2026.geojson`. O script `prepare_geology.cjs` gera `dist/geology.json` com longitude, latitude, nomenclatura litológica, método do GPS e coordenadas locais para o **atlas documental opcional**.

Limitações: cada ponto é uma observação geológica, não um polígono de afloramento, modelo 3D, geomorfologia detalhada, área protegida nem local público de visitação. Alguns pontos pertencem a pedreiras ou fazendas. Não criamos rotas turísticas. A interface distingue o símbolo GPS das artes fictícias do cenário.

Uma consulta espacial ao serviço de Hidrografia Parte 1 e Parte 2 do SNIRH/ANA, no retângulo aproximado do município, retornou 0 feições para as camadas consultadas. Isso **não comprova a ausência de cursos d'água**; faltam outras bases e escalas. A tentativa de acesso direto ao GeoTIFF nacional de cobertura MapBiomas 10 m, coleção 4 de 2025, retornou HTTP 403. Nenhum pixel de cobertura vegetal foi incorporado até haver download autorizado e classificação verificável. A base de relevo/geomorfologia IBGE BDiA permanece fonte potencial, não importação realizada.
