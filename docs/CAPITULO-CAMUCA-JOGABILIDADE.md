# Os caminhos do Camucá — capítulo contemplativo preparatório

Data: 01/11/2026. Estado: **implementação local testada; integração com a branch da PR ainda pendente**.

## Limite geográfico

A Serra do Camucá está documentada como crista OSM `way/884827347`, mas **não há traçado de trilha com acesso público validado**. A via `way/690350985` passa perto da crista, sem demonstrar autorização de entrada. Esta etapa **não adiciona rota, entrada de fazenda, destino de missão nem ponto de teleporte**. As cenas observáveis ocorrem no marco `mato` já existente na prévia Gemini e são explicitamente um *caderno de preparação*, não uma visita à serra.

## Sequência jogável na cópia local

1. **A paisagem durante a chuva:** usar a ação *Observar* perto do marco verde `mato`, em `chuvisco`. O diário registra que é chuva ilustrativa e que o personagem está num caminho já existente.
2. **A paisagem depois da chuva:** voltar ao mesmo marco, em `sol`, **num dia de jogo posterior**. Só então a segunda lembrança é criada.
3. **Quem conhece a terra:** conversar com Damião em um dia posterior; ele ouve o relato e responde com uma história rural **fictícia** sobre ciclos de trabalho, sem alegar conhecer acesso autorizado.
4. **O que Bia ouviu:** contar pessoalmente a Bia a observação, em outro dia. Ela não recebe conhecimento por telepatia.
5. **Uma lembrança da paisagem:** retornar a Bia pelo menos três dias depois do relato. Ela pode recordar a conversa, que permanece registrada como **história contada**, não como passeio presenciado por Bia nem descoberta geográfica do Camucá.

Cada marco é persistente, ordenado, restaurado com validação, sem recompensa monetária ou repetição. O diário apresenta o progresso `0/5` a `5/5`, e a função de novidades considera dias realmente decorridos. Antigos salvamentos começam sem essa história e continuam válidos. O botão de reinício limpa os cinco marcos.

## Verificação

- `npm test`: **185 testes aprovados**, incluindo dois testes específicos novos de restauração, ordem, intervalo, salvamento e ausência de criação de rota.
- `npm run build:development-preview`: duas prévias locais reconstruídas com sucesso.
- A cópia local tem alterações anteriores de jogabilidade ainda não integradas, enquanto a mesma branch remota da PR #1 recebeu mudanças visuais em `gemini-modules/game.js`. **Não sobrescrever esse arquivo remoto com o conteúdo local integral sem uma integração de três vias e revisão dos conflitos.**

## Para concluir a integração na PR #1

Reconciliar as alterações de narrativa locais com as mudanças artísticas já enviadas à branch remota, executar a suíte completa novamente e reconstruir as duas prévias do resultado combinado. Manter PR aberta, sem merge. A abertura de percurso real na Serra do Camucá depende de confirmação independente de passagem pública ou autorização explícita.
