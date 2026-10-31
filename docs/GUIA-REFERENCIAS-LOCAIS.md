# Beit Lehem — guia cumulativo de referências locais

Este guia reúne o repertório recebido do usuário, a interpretação do experimento Gemini e verificações documentais. Serve para evoluir um único mundo de Belém/PB, Rua Nova e entorno rural/serrano. Não substitui a base V2.27 e não transforma propostas em funcionalidades implementadas.

Não registrar aqui endereços de residência, nomes de familiares/amigos, e-mails, álbuns particulares ou rotas que partam de uma casa particular. Personagens e histórias devem ser fictícios. Nomes oficiais de vias e instituições podem permanecer como referências geográficas.

## Como consultar e atualizar

Antes de cada entrega, escolher **um trecho e um problema**. Ler só os arquivos indicados no mapa do código, mais esta seção pertinente. Continuar a mesma PR de rascunho enquanto o trabalho fizer parte desta revisão; não fazer merge. As etapas podem ser desenvolvidas e testadas na branch sem trocar a versão principal.

Para cada referência, registrar separadamente:

- **Existência e identidade:** nome público e fonte que realmente menciona o lugar.
- **Posição:** ponto, entrada, lado da rua, frente e esquina, cada um com sua evidência. Nome de rua sozinho não define lote.
- **Visual:** o que foi observado e o que é desenho inventado; data e direção da foto quando disponíveis.
- **Narrativa:** memória/atividade proposta, sempre identificada como ficção.
- **Estado:** recebido, documentado, posição pendente, desenho proposto, testado ou integrado.

A ausência de confirmação pública não invalida o conhecimento local do usuário: mantém a origem pessoal da informação explícita e pede somente a revisão que for necessária à implementação. Não chamar essa informação de dado OSM sem identificador ou correspondência comprovada.

## Fontes e força da evidência

| Código | Fonte | O que sustenta | Limite |
| --- | --- | --- | --- |
| U | Relato do usuário e tabela produzida com o Gemini | Repertório de lugares, relações de vizinhança, detalhes afetivos e sugestões | Não é inspeção independente nem extrato cadastral |
| G | Links de mapas públicos fornecidos no relato | Candidatos de destino e nomes a conferir | A URL não prova distância, percurso, acesso atual ou frente do edifício; não conservar origens residenciais |
| M | [Aspectos gerais da Prefeitura](https://www.belem.pb.gov.br/a-cidade/aspectos-gerais) | Parque São Luís/Lagoa de Serra, Pedra do Cordeiro, vegetação do entorno da trilha, Conceição e endereço público da Prefeitura | Referência documental, não levantamento atual de cada fachada ou horário |
| T | [Destino Brejo — notícia municipal de 2019](https://www.belem.pb.gov.br/noticia/turismo-projeto-destino-brejo-destaca-atrativos-do-munic-pio-de-bel-m) | Gastronomia, cerâmica/artesanato, Igreja da Conceição e trilhas/parque de reaproveitamento | Não comprova coordenadas nem funcionamento atual |
| O | Dados existentes em `source/` e `dist/map.json` | Traçado, tags, pontos e origem da base preservada | Cobertura incompleta; vias e pontos não são fachadas reais |
| F | Imagem fornecida diretamente para esta revisão | Elementos visíveis e enquadramento da própria imagem | Os links privados citados pelo Gemini não foram abertos; não afirmar que vimos essas fotos |

## Lugares e identidade visual

| Lugar / setor | Evidência disponível | O que queremos aproveitar | Próxima conferência |
| --- | --- | --- | --- |
| Rua Clóvis Bezerra, trecho residencial | O + U | Portões metálicos, vasos, cadeiras, batentes e convivência no fim da tarde | Selecionar trecho e frentes; pavimento e altura dos batentes por foto; não reproduzir casa particular |
| Casa da Varanda e cão Pingo | Proposta fictícia | Referência de acolhimento residencial e gestos simples | Lote narrativo a definir; sem endereço ou família real; não é hub já integrado |
| EMEF Anita de Melo Barbosa Lima | U + G; ponto do protótipo ainda pendente | Muro, portão amplo e rampa; azul/branco como hipótese de paleta | Confirmar ponto, entrada, frente e aparência com imagem; não tratar tempo de caminhada do relato como medida do jogo |
| Ginásio O Xaviezão | U + G | Cobertura metálica em arco e arquibancadas | Confirmar acesso e relação com Brasiliana da Costa/Nunes Guedes e Câmara; não adicionar minigame nesta etapa |
| Bar da Prosa, nome fictício | U | Mesas amarelas, espetinhos, terracota, iluminação e referência de karaokê | Conferir fachada/posição no trecho da Vicente Cado; retirar amigos reais e não presumir noite de evento atual |
| Confeitaria Sonho Doce | U + G | Fachada comercial, vitrine, doces e pausa de café como possibilidade futura | Confirmar estabelecimento, lote e visual; toldo listrado é proposta artística até confirmação |
| Igreja Nossa Senhora da Conceição | O + M | Identidade neoclássica, torre, arcos e papel no centro | Comparar com as imagens históricas existentes; a documentação municipal registra inauguração em 1934 |
| Igreja Sagrada Família | U | Diversificar os marcos religiosos | Conferir denominação e relação com Florânea/Clóvis Bezerra; não confundir com a Conceição ou Capela da Luz |
| Prefeitura, Rua Flávio Ribeiro | M + U | Composição cívica distinta | Endereço público documentado; ponto e fachada ainda precisam de referência; três mastros são proposta recebida |
| Correios e Praça 6 de Setembro | Correios em O; praça já documental na base | Centro de caminhada, jardins e espaços de encontro | Não confundir o ponto dos Correios com o contorno da praça; confirmar posição e planta antes de criar rota |
| Eixo Feliciano Pedrosa | O + U | Marquises, portas comerciais e vitrines | Confirmar pavimento por trecho e sentido; não espalhar a mesma fachada nem alterar tags OSM silenciosamente |
| Capela da Luz e bairro | U + G | Pequeno marco religioso e identidade cultural de bairro | Conferir ponto e ligação com Mário Barbosa, Abdias Machado e Boa Vista; bandeirolas são uma proposta sazonal |
| Hospital Santa Lúcia | Ponto já existente em O | Referência de quarteirão com arte própria | Não usar o mesmo tipo visual/placa da Prefeitura; confirmar frente e contorno |
| Pedra do Cordeiro | M + T | Afloramento, cruzeiro, vista e vegetação da trilha | A fonte descreve oeste e pouco mais de 1 km do centro; coordenada central do protótipo não aprovada; confirmar acesso e limites |
| Parque São Luís / Lagoa de Serra | M + T | Brinquedos reaproveitados, paisagem rural e serrana | A fonte descreve Lagoa de Serra a cerca de 2 km do centro; não usar posição central do protótipo |
| Rua Nova e conexões rurais | Objetivo aprovado; parte da base existente | Continuidade cidade–campo–serra no mesmo mapa | Ainda não detalhado pelo novo relato. Não preencher com localidades inventadas nem considerar concluído |

## Ruas, conexões e pavimentação

Preservar os 462 trechos geométricos da base. As 17 propostas de tags estão em `drafts/referencias-locais-2026-10-31/catalogo-candidato.json`, desativadas. Alterações locais devem ser uma camada com procedência, separada da importação original.

O relato sugere conectores entre Clóvis Bezerra, Antônio Alfredo da Silva, Antônio Borges de Lima, Flávio Ribeiro, Brasiliana da Costa e o eixo comercial. Também cita Nunes Guedes, Antônio Alfredo Guedes, Solon de Lucena e Luís/Luiz Gomes. **Semelhança de nome não significa mesma rua**: conferir cada uma no traçado antes de alterar rótulo ou desenhar atalhos.

Há uma divergência de nome entre a travessa citada como Feliciano Pedrosa no relato e a **Travessa Feliciano Feitosa** na base. Não resolver por substituição automática. Há também descrições diferentes da esquina residencial nas mensagens do experimento; nenhuma deve virar posicionamento exato sem revisão local.

Não copiar os tempos de 5–8 minutos, 6 minutos ou 17 minutos como regras fixas. A escala e o tempo do jogo são escolhas de design; a rota precisa ser calculada no grafo realmente confirmado. Um destino no mapa não prova passagem por uma travessa ou entrada de edifício.

Detalhes propostos: paralelepípedo, batentes altos, meio-fio claro, reservatórios, caixas de medidor, marquises e motos estacionadas. Validar o trecho e depois desenhar variantes. Meio-fio branco não precisa virar uma faixa tracejada no meio da via; orientar pelo lado e pela largura da rua.

## Eventos e vida cotidiana — possibilidades futuras

| Referência | Estado | Possível expressão no jogo | O que falta |
| --- | --- | --- | --- |
| Feira livre e sorda tradicional | Já há documentação e atividade de mercado na base | Barracas, cestos, alimentos e sociabilidade | Integrar refinamentos ao mercado existente; não duplicar inventário ou recompensas |
| São Pedro de Belém | Referência cultural já presente na base; nova tabela cita julho | Ornamentação, iluminação e mudança de atmosfera | Datas e programação dependem do ano; separar calendário fictício do calendário real |
| Sexta Cultural | Sugestão de U; faixa de horário não verificada | Comércio, música e convivência no centro | Fonte específica, local e periodicidade; não assumir ocorrência semanal ou horário atual |
| Bloco Risca Faca / tradição do Bairro da Luz | Relato de U, ainda sem fonte específica conferida | Estandartes, cor e memória cultural | Confirmar denominação, história, local e calendário; página municipal genérica não comprova tudo |
| Conversa na calçada ao entardecer | U + proposta ficcional | Moradores param, sentam, conversam e se despedem | Horário do jogo e animações consistentes; não declarar rotina de moradores reais |
| Karaokê e encontro no bar | U + proposta ficcional | Luz, música e conversa como ambientação; atividade só em etapa própria | Referência visual e regra de interação; não trazer aparência/marca do outro projeto |
| Esporte no ginásio | Proposta do Gemini | Movimento e encontros; eventual atividade futura | Escopo próprio, horários fictícios e testes; ainda não implementado |
| Cerâmica e ateliês | T + U | Objetos, vitrines e trabalho artesanal | Referências de peças e fachadas; personagens artesãos fictícios, sem biografias copiadas |
| Parque e paisagem serrana | M + T | Passeio contemplativo, engenhosidade e natureza | Posicionamento e caminho confirmados antes de interações ou viagens instantâneas |

## O que o arquivo grande permite aproveitar

Ele preserva a base de ruas e acrescenta tipos visuais de edifícios, setores, detalhes e sistemas experimentais. Não é uma atualização geográfica completa: não amplia a malha viária, não revisa o relevo e não substitui os dados-fonte.

A afirmação de “200 fachadas detalhadas” veio do relato; não foi confirmada como contagem medida nesta revisão. Um limite de 1.350 casas não garante essa quantidade, a distribuição correta ou desempenho. O filtro antigo aceitava apenas vias residenciais, mas isso não prova ausência de toda arte comercial na Feliciano Pedrosa, onde há outros sistemas de cena/bancas. Corrigir o preenchimento por setor é mais controlável que dobrar tudo.

Os sistemas de contatos e moto ficam preservados como ideias e código de consulta. O experimento tem erro de inicialização, chave de save diferente, contratos de álbum incompletos e posições sem confirmação. Não carregar tudo em `dist/` para depois tentar corrigir dentro da versão principal.

## Ordem de trabalho proposta

1. Consolidar esta fonte e o catálogo na PR de rascunho, sem merge.
2. Confirmar um trecho residencial e seus lotes/frentes com o usuário; depois criar uma comparação visual limitada.
3. Revisar uma fachada comercial e uma esquina conectada ao trecho; em seguida escola/ginásio e demais marcos, um conjunto por vez.
4. Organizar ligações para Rua Nova e entorno natural; localizar parque e Pedra com referências específicas.
5. Retomar gestos espontâneos e acabamento das transições entre caminhar, descansar, conversar e despedir-se no espaço revisado.
6. Só então decidir contatos, moto, presentes e atividades como entregas próprias.

Ao concluir cada etapa, registrar o que mudou ao jogar, como foi testado e quais dúvidas persistem. A PR pode crescer com esses passos; o merge depende de autorização expressa.


## Estado atual da integração

O arquivo `dist/local-road-references.js` conserva as 17 propostas viárias do material Gemini, mas todas permanecem desativadas. Nomes e superfícies precisam de validação local antes de aparecerem no jogo. A fonte OSM continua exibindo seus 86 nomes confirmados e preserva os 462 trechos e suas geometrias.

O estudo de fachadas agora considera seis áreas visuais: três referências centrais do jogo e três setores preliminares posicionados ao longo de geometrias candidatas existentes. Esses três setores não confirmam nomes de ruas, limites cadastrais, endereços ou fachadas individuais. A arte é interpretativa.

A V2.27 continua sendo a base oficial. O experimento Gemini é a referência informativa mais rica; a versão de desenvolvimento é gerada a partir dos módulos editáveis de `dist/` e publicada como HTML independente em `previews/beit-lehem-development.html` e `previews/beit-lehem-development-mobile.html`.
