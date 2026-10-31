# Beit Lehem — jogo cozy de Belém/PB

Beit Lehem explora Belém/PB, Rua Nova e o entorno rural e serrano. **Por decisão do autor, o Gemini Preview é agora a base principal da evolução visual e funcional.** A V2.27 continua preservada como referência técnica e para recuperação.

## Qual arquivo baixar?

**[Índice de versões e instruções](docs/VERSOES-E-ESTRUTURA.md)**

- **Jogo atual — computador:** [previews/beit-lehem-development.html](previews/beit-lehem-development.html) — **agora é a base Gemini**.
- **Jogo atual — celular:** [previews/beit-lehem-development-mobile.html](previews/beit-lehem-development-mobile.html) — atualmente o mesmo HTML Gemini responsivo; acabamento específico de celular pendente.
- **Gemini original corrigido para abrir:** [previews/gemini-preview.html](previews/gemini-preview.html) — conteúdo de referência preservado.
- **V2.27 estável:** [baseline/Belem-Viva-V2-27.html](baseline/Belem-Viva-V2-27.html) — não editar.

**Atenção aos saves:** a base Gemini usa uma chave de armazenamento diferente da V2.27. O progresso do diário não é transferido automaticamente entre arquivos/origens. Ainda falta exportação/importação e migração testada.

## Código e geração

- **Base de trabalho Gemini:** `references/gemini-2026-10-31/experimento-anonimizado.html.txt`, preservada como fonte original. A ferramenta `scripts/gemini-workbench.cjs` extrai somente os sistemas necessários para `gemini-modules/`, sem alterar o mapa original.
- **Prévia Gemini:** `scripts/build-gemini-preview.cjs` aplica as edições isoladas de `gemini-modules/` e a correção de inicialização à cópia, sem alterar a fonte.
- **Prévias principais:** `npm run build:development-preview` regenera ambas a partir do Gemini.
- **Módulos V2.27:** `dist/` permanece como biblioteca de referência de código estável, incluindo roteamento, gestos, UI, fachadas e salvamento antigo. `npm run build` ainda gera a V2.27 modular como recurso de comparação; não é a prévia principal.

Com Node.js 18+:

```sh
npm test
npm run verify:baseline
npm run gemini:list
npm run gemini:check
npm run build:development-preview
npm run play:development-preview
```

**Ainda não aprovamos a base Gemini como versão estável.** A correção de inicialização permite gerar a prévia, mas há pendências documentadas no álbum de seis setores, identidade do hospital, exportação e interface móvel. A validação completa do jogo e a inspeção física continuam pendentes.

## Direção artística e territorial

A aparência deve seguir a riqueza de ruas, lugares e cotidiano do Gemini, com identidade **cozy de Belém/PB**, nunca tema idol ou assets do TsuLiPa. O mapa amplo e seus dados devem ser preservados; o conhecimento e as fotografias do autor validam os pontos locais, diferenciados dos dados OSM. A V2.28 reformulada e rejeitada não passa a ser aprovada por esta decisão.

Sem hospedagem, deploy, GitHub Pages ou merge sem autorização explícita.

Para editar com pouco contexto de IA: **[guia de trabalho econômico](docs/COMO-TRABALHAR-COM-IA.md)**. Consulte também [decisões](docs/DECISOES.md), [próximos passos](docs/PROXIMOS-PASSOS.md) e [mapa do código](docs/MAPA-DO-CODIGO.md).
