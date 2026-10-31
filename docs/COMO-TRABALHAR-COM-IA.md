# Desenvolvimento do Gemini com IA — modo econômico

**Base principal:** Gemini Preview. **Ponto de recuperação:** V2.27. **Branch autorizada:** `review/referencias-locais-2026-10-31`, PR #1, sem merge.

## Regra de ouro

**Não peça para a IA ler ou reescrever o HTML de 1–2 MB.** Peça o sistema e o arquivo pequeno, com contexto de entrada/saída. O jogo completo só precisa ser gerado no fechamento de uma etapa.

## Descubra o módulo sem abrir o monólito

```bash
npm run gemini:list
```

O comando relaciona os scripts internos com os nomes do índice `references/gemini-2026-10-31/INDICE.md`.

Para trabalhar só em fachadas, por exemplo:

```bash
npm run gemini:extract -- facade-studio
```

Isso cria **`gemini-modules/facade-studio.js` somente se não existir**. Não extrair todos os scripts por padrão. Faça primeiro `npm run gemini:list` para confirmar o nome reconhecido. Para editar movimento, escolha somente os módulos de movimento e seus testes.

O gerador agora substitui os scripts selecionados do Gemini pelo conteúdo de `gemini-modules/`; o mapa, as imagens incorporadas e os scripts não extraídos ficam idênticos à fonte arquivada. Para verificar as sobreposições:

```bash
npm run gemini:check
npm run build:development-preview
```

As duas prévias `previews/beit-lehem-development*.html` são geradas juntas. **Não editar diretamente os HTMLs gerados.**

## Ordem para cada pequena entrega

1. **Escopo:** um problema perceptível, como “o cumprimento não termina naturalmente” ou “vitrine da feira tem pouca identidade”.
2. **Inventário:** ler `AGENTS.md`, este guia, o módulo envolvido e seus testes — não o mapa completo.
3. **Proteções:** listar explicitamente o que deve ficar igual: ruas, área rural/serrana, casa do usuário autorizada, save, missões e identidade cozy.
4. **Mudança:** trabalhar no módulo extraído; evitar alteração de geometria ao editar arte.
5. **Verificação:** executar testes específicos, `npm test`, `npm run verify:baseline` e gerar ambas as prévias. Anotar qualquer teste que não foi possível executar.
6. **Inspeção:** abrir os HTMLs em desktop e celular quando possível; uma captura por cenário é suficiente para feedback dirigido.
7. **Entrega:** commit pequeno na mesma PR #1, relatório curto “mudou / preservado / testado / pendente”. Sem merge.

## Ordem sugerida de módulos

| Tarefa | Começar por | Regras |
| --- | --- | --- |
| Roteamento, continuidade do território | `pathfinding`, `game` | Malha OSM intacta; conferir componentes desconectados |
| Fachadas, feira e comércio | `facade-studio`, `central-blocks`, `market-scene` | Variação sem poluir ruas nem adicionar prédios |
| Moradores e despedidas | `resident-motion`, `street-greetings`, `encounter-choreography` | Sem teleporte; interações não dependem de missão |
| Convívio e rotinas | `street-moments`, `living-world`, `secondary-neighbors` | Gestos fictícios, não dados de cidadãos |
| Interface e celular | `cozy-ui`, `game` | Toque, safe areas, movimento reduzido |
| Moto e contatos Gemini | `moto-experimental`, `contatos-experimentais` | Isolados até revisar estado, save, render e controle |

Os nomes disponíveis devem ser confirmados com `gemini:list` antes da extração. O documento [INDICE.md](../references/gemini-2026-10-31/INDICE.md) guarda as linhas da cópia histórica.

## Primeiro backlog da base Gemini

1. Corrigir contrato do Ateliê de 6 setores (desbloqueio e contadores).
2. Separar a aparência do Hospital Santa Lúcia da Prefeitura.
3. Verificar exportação HTML sem duplicação de interface.
4. Auditar que os locais e referências pessoais autorizadas estejam visíveis na prévia de trabalho.
5. Portar as correções de caminhada, espaçamento de passantes e despedidas da linha `dist/` para os módulos correspondentes do Gemini.
6. Validar o fluxo de saves antes de qualquer migração entre V2.27 e Gemini.
7. Fazer inspeção visual em computador e celular físico.

**Não confundir:** o Gemini atual é mais rico visualmente, mas não é automaticamente mais estável. O objetivo é conservar a riqueza e corrigir sua implementação.

## Prompt curto para uma próxima IA

> Estamos no repositório privado `chumikie/Beit-Lehem`, PR #1, branch `review/referencias-locais-2026-10-31`. **Gemini Preview é a base principal; V2.27 está congelada como referência**. Leia `AGENTS.md` e `docs/COMO-TRABALHAR-COM-IA.md`. Não abra o HTML inteiro: use `gemini:list`, extraia e edite apenas o módulo da tarefa. Preserve mapa completo, lugares autorizados, saves e estética cozy sem elementos idol. Faça uma mudança testável, gere duas prévias juntas, registre os testes reais. Não faça merge, deploy ou alterações fora da PR.
