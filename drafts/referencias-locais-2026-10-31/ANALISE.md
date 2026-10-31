# Beit Lehem — análise das referências locais

**Rodada de revisão, 31/10/2026. Preparação em PR de rascunho, sem merge e sem integração no jogo.**

A base comparada é a V2.27 preservada no commit `a5f61fe`. O arquivo recebido foi lido como código e dados, sem executar o HTML no navegador. A análise inicial cobriu o HTML; o relato detalhado enviado depois foi incorporado ao guia `docs/GUIA-REFERENCIAS-LOCAIS.md`, com hipóteses e ideias separadas dos fatos confirmados.

## Parecer

O material melhora bastante o repertório de lugares e de vida cotidiana do jogo. Há valor em conservar praticamente todas as ideias como referências e propostas. Isso não torna automaticamente corretas suas coordenadas, seus vínculos com ruas ou sua implementação. Podemos aproveitar a riqueza local e corrigir essas camadas por partes, sem substituir o mundo aprovado.

A primeira etapa recomendada é somente um trecho residencial associado à Rua Clóvis Bezerra: portão prateado, vasos, cadeiras de calçada e um cão fictício. Primeiro se define o trecho e a frente das construções; depois se compara o acabamento com a V2.27. Não precisa trazer agenda, moto, presentes ou novas missões junto.

## O que efetivamente mudou

- Os **462 trechos viários conservam suas coordenadas**. Não houve expansão ou redução do traçado nesta versão recebida.
- Limites do mapa, áreas, grade de relevo e dados geológicos permanecem iguais aos da base.
- Entram **10 pontos nomeados**, além dos 9 existentes; e **11 novas referências ilustráveis**, além dos 3 marcos existentes. O hospital já era um dos pontos antigos, por isso as duas contagens diferem.
- **17 vias recebem propostas de tags**, incluindo pavimento e nomes para trechos antes sem nome. Isso é uma contribuição local, não uma nova extração comprovada do OSM.
- Os nomes distintos passam de **86 para 92**, mas o metadado do arquivo continua dizendo 86.
- Os seis selos mudam de descrição e identidade. Cinco posições são mantidas; uma é deslocada. Isso exigiria tratar a continuidade dos selos já coletados, que hoje são associados por índice.
- A geração de casas passa de limite 650 para 1.350, aceita mais classes de via e reduz espaçamentos. O número de figurantes comuns também aumenta. São mudanças amplas de composição e custo de desenho; não são necessárias para aproveitar os novos lugares.

## O que aproveitar e como

| Elemento | Aproveitamento | Pendência antes de aparecer como lugar correto |
| --- | --- | --- |
| Trecho residencial | Portão metálico, vasos, cadeiras, presença de um cão e clima de fim de tarde | Ficcionalizar a casa e escolher lote/frente; retirar número, nomes e associação com moradores reais |
| Escola Anita Barbosa | Referência escolar e variedade de fachada | Confirmar ponto, portão, frente e relação com a rua; o arquivo coloca o ponto sobre o eixo da via |
| Ginásio O Xaviezão | Cobertura curva e identidade esportiva | Confirmar entrada, quadra e relação com as ruas vizinhas; proximidade de cruzamento não determina frente |
| Bar de convivência | Mesas amarelas, espetinhos, luzes quentes e referência de karaokê | Usar nome fictício provisório **Bar da Prosa**; confirmar posição e não reproduzir amigos reais |
| Confeitaria Sonho Doce | Vitrine, bolos e diferenciação do comércio | Nome e endereço do arquivo ainda são referências recebidas; confirmar fachada e lote |
| Prefeitura | Edifício cívico e endereço público | O endereço Rua Flávio Ribeiro, 74 consta no site municipal; isso não comprova a coordenada desenhada |
| Capela da Luz | Capela e identidade do bairro | Confirmar identidade, fachada, esquina e associação viária |
| Igreja Sagrada Família | Outro marco religioso, com desenho próprio | Confirmar denominação, localização e esquina; não usar a mesma identidade visual da Capela da Luz |
| Hospital Santa Lúcia | Reaproveitar o ponto já existente na base | Criar desenho hospitalar próprio; o novo tipo `hall` hoje faz aparecer arte e placa de Prefeitura |
| Parque São Luís | Brinquedos reaproveitados e relação rural/serrana | Não aceitar o ponto central recebido; localizar Lagoa de Serra e seu acesso por referência específica |
| Pedra do Cordeiro | Afloramento, cruzeiro e vegetação documentada do entorno | Não aceitar o ponto central recebido; localizar formação, trilha e limites com referência específica |

Outros detalhes úteis: caixas de medidor, placas, reservatórios, marquises, vitrines, motos estacionadas e meio-fio claro. São propostas de arte adequadas ao repertório; não equivalem a um levantamento das fachadas. Aplicá-las a um trecho identificado antes de espalhá-las pela cidade inteira.

## Geografia: o que está confirmado e o que não está

O site municipal descreve o Parque São Luís na comunidade rural de Lagoa de Serra, a cerca de 2 km do centro, e a Pedra do Cordeiro na região oeste, a pouco mais de 1 km. O arquivo os coloca a aproximadamente **425 m e 340 m**, respectivamente, da origem que a própria grade chama de centro urbano. A escala e a descrição não combinam; esses pontos devem ficar pendentes, sem inventar novas coordenadas para compensar.

A mesma fonte documenta material reaproveitado no parque, cruzeiro e mandacaru/xique-xique no entorno da trilha da Pedra. Isso sustenta referências de ambiente, mas não uma distribuição botânica por todo o mapa, nem a aparência atual de cada lugar.

Vários novos pontos caem exatamente sobre linhas de ruas. Isso é compatível com âncoras aproximadas escolhidas para o jogo, mas não prova entrada, lado da rua ou contorno construído. No caso da Sagrada Família, a âncora está sobre a Clóvis Bezerra e a cerca de 25,5 m da geometria nomeada Florânea; não basta para declarar uma esquina exata. Essa medida é uma relação interna da grade, não uma verificação em campo.

Todos os novos marcos trazem `positionStatus: osm_point`. O HTML não inclui novos identificadores OSM que comprovem essas origens; os dados-fonte antigos continuam os mesmos. Portanto, o catálogo preparado separa existência, hipótese de posição e proposta de arte. Isso preserva sua contribuição pessoal sem apresentá-la como uma confirmação que ainda não temos.

A página municipal de aspectos gerais confirma alguns elementos, mas não sustenta automaticamente as conversas, os grupos de amigos, todas as fachadas ou todos os endereços associados a ela no código. Não foi feita verificação independente completa de cada comércio e instituição nesta rodada.

Fontes consultadas em 31/10/2026:

- [Aspectos gerais — Prefeitura de Belém/PB](https://www.belem.pb.gov.br/a-cidade/aspectos-gerais): parque, Pedra, vegetação da trilha, Igreja da Conceição e endereço público da Prefeitura.
- [Projeto Destino Brejo — notícia municipal de 2019](https://www.belem.pb.gov.br/noticia/turismo-projeto-destino-brejo-destaca-atrativos-do-munic-pio-de-bel-m): referências às trilhas e ao parque de material reaproveitado. É documentação histórica, não inspeção atual de funcionamento.

## Nomes e memórias pessoais

No rascunho preparado, a residência vira **Casa da Varanda**, o cão vira **Pingo** e o bar recebe **Bar da Prosa**, como nomes de trabalho. A família e a turma passam a ser grupos fictícios sem nomes individuais. O número e a coordenada da residência foram retirados do catálogo. Trocar só o nome mantendo número, família e localização não bastaria para ficcionalizar essa casa.

Ruas e instituições públicas nomeadas em homenagem a pessoas podem conservar seus nomes geográficos/documentais. A regra é não transformar parentes, amigos ou moradores reais em personagens identificáveis. Os moradores já estabelecidos do jogo continuam preservados. O HTML original enviado não foi alterado nem publicado.

## Código: impedimentos confirmados

**1. A inicialização para antes de carregar o mapa.** No HTML, linha 3806, uma atribuição a `kawaiiState` acontece antes de sua declaração com `let`. Reproduzi o prefixo inicial no Node, com apenas os três canvases e as fábricas de estado simulados: `ReferenceError: Cannot access 'kawaiiState' before initialization`. Os 32 scripts passam na análise sintática, mostrando por que sintaxe sozinha não basta. O erro está antes da promessa de carregamento e do tratamento de erro desse carregamento.

**2. O salvamento muda de identidade.** Na linha 3792, a chave é uma chave exclusiva do experimento, diferente de `roncador-expedition-v2`. Isso isola o experimento, mas não migra automaticamente o diário oficial. Não deve entrar assim na integração. Além disso, `reset()` reinicia os contatos, mas não reinicia o estado da moto, suas contagens ou partículas de emoji.

**3. O álbum foi ampliado parcialmente.** O ateliê passa de três para seis setores, mas `recordSketch()` e a exibição da recompensa continuam verificando igualdade exata com 3. Reproduzi o quarto registro retornando `unlocked: false` depois do terceiro ter retornado `true`. A estatística de uma casa no novo setor `clovis` também retorna `NaN`, pois os contadores dos novos setores não são inicializados. Precisamos decidir a regra do álbum antes de ampliar seus objetivos.

**4. A classificação visual confunde o hospital com a Prefeitura.** Os dois usam o tipo `hall`, cujo desenho contém bandeiras e a placa da Prefeitura. Reaproveitar o volume básico pode ser útil, mas a identidade deve variar por lugar.

## Riscos e decisões para depois

- O botão de baixar serializa o DOM já montado. Ao reabrir o arquivo, os scripts continuam inserindo interface; há risco de duplicação de painéis e IDs. Não executei esse fluxo no navegador.
- Dar sorda pela agenda e reabastecer a cesta não exigem proximidade no código recebido; a chegada ao parque incrementa o contador de passeio ao teletransportar, sem uma interação de passeio separada. Isso pode ser uma regra de protótipo, mas não deve ser apresentado como atividade presencial já resolvida.
- Contatos, inventário, moto, acessórios e novos botões ampliam bastante a interface. A nova barra tem adaptação CSS, mas não foi medida a 390 px nem validada com toque, foco ou leitor de tela.
- Parte das animações novas ainda usa tempo contínuo mesmo com redução de movimento. A acessibilidade precisa ser observada antes de integrar.
- Portas e ruas desenhadas não comprovam acesso atual. As distâncias e tempos de caminhada nas falas precisam ser derivados do caminho confirmado, não repetidos como fatos.
- Os novos módulos se chamam V2.28 e V2.29 internamente; isso não os torna sucessores aprovados. Esta revisão preserva a V2.27 e não recupera a reformulação visual anteriormente rejeitada.

## Preparação entregue e ordem das etapas

A branch `review/referencias-locais-2026-10-31` reúne este material para uma única PR de rascunho, autorizada pelo usuário. Atualizações seguintes devem continuar nela enquanto o escopo for o mesmo. A pasta `drafts/referencias-locais-2026-10-31/` contém um catálogo desativado e um resumo de auditoria. Nenhum módulo do jogo carrega esses arquivos.

1. **Agora:** revisar o catálogo e escolher o trecho residencial. Nenhuma posição pendente entra no jogo como confirmada.
2. **Primeiro ajuste visual:** comparar um pequeno trecho da Clóvis Bezerra com a base, incluindo portão, vasos, cadeiras e cão fictício; sem expandir atividades ou mudar a câmera/personagens juntos.
3. **Depois:** revisar um comércio e sua esquina, com ponto e frente confirmados. Repetir o processo para escola, ginásio e demais marcos.
4. **Entorno natural:** organizar as ligações rurais e serranas, localizar parque e Pedra com referências específicas e conservar os limites de exploração combinados.
5. **Só então:** decidir contatos, moto e outras atividades como entregas próprias. Nenhuma ideia foi descartada por ficar para outra etapa.

## Validação e limites

- 32 scripts do anexo passaram em `node --check`.
- Prefixo de inicialização e os dois problemas de contrato do ateliê reproduzidos no Node.
- Uma cópia isolada dos módulos recebidos foi confrontada com os 30 testes da base: 23 passaram e 7 falharam. Algumas falhas são expectativas fixas de contagens antigas; outra é a ausência de `ellipse` no canvas falso do teste. Esse resultado **não significa sete defeitos de navegador** e não valida a integração.
- O catálogo foi conferido: 11 lugares e 17 propostas viárias, todos desativados; nenhuma coordenada residencial foi copiada para ele.
- Os arquivos executáveis da base continuam sem alteração nesta rodada; sua suíte de testes, cópia congelada e geração foram verificadas separadamente.
- Nenhum teste visual em navegador, aparelho físico, toque ou foco nativo foi executado nesta análise.
- O usuário autorizou publicar os materiais em uma PR de rascunho. Não fazer merge, deploy ou alterações em outro projeto. A validação do protótipo recebido não equivale à aprovação para integrá-lo.
