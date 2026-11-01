# Índice do HTML de referência

Consultar `experimento-anonimizado.html.txt` por intervalos de linhas. Este arquivo anonimizado é a fonte principal do Gemini Preview e deve ser preservado. Edite sistemas extraídos em `../../gemini-modules/`, depois gere as prévias; não regrave o HTML grande para mudanças pontuais. As linhas abaixo são da cópia anonimizada.

| Bloco | Linhas inicial–final | Estado |
| --- | --- | --- |
| market-scene | 726–807 | módulo Gemini; extrair antes de editar |
| street-moments | 808–830 | módulo Gemini; extrair antes de editar |
| street-greetings | 831–884 | módulo Gemini; extrair antes de editar |
| mapa | 901–901 | módulo Gemini; extrair antes de editar |
| geologia | 902–902 | módulo Gemini; extrair antes de editar |
| relevo | 903–903 | módulo Gemini; extrair antes de editar |
| pathfinding | 904–998 | módulo Gemini; extrair antes de editar |
| landmarks | 999–1517 | módulo Gemini; extrair antes de editar |
| scenic-placement | 1518–1613 | módulo Gemini; extrair antes de editar |
| street-encounters | 1614–1688 | módulo Gemini; extrair antes de editar |
| street-community | 1689–1757 | módulo Gemini; extrair antes de editar |
| encounter-choreography | 1758–1839 | módulo Gemini; extrair antes de editar |
| road-details | 1840–1931 | módulo Gemini; extrair antes de editar |
| terrain-relief | 1932–1995 | módulo Gemini; extrair antes de editar |
| affection-memory | 1996–2058 | módulo Gemini; extrair antes de editar |
| living-world | 2059–2192 | módulo Gemini; extrair antes de editar |
| street-life | 2193–2254 | módulo Gemini; extrair antes de editar |
| fair-streets | 2255–2362 | módulo Gemini; extrair antes de editar |
| cozy-quests | 2363–2388 | módulo Gemini; extrair antes de editar |
| cozy-atmosphere | 2389–2410 | módulo Gemini; extrair antes de editar |
| neighborhood-quest | 2411–2430 | módulo Gemini; extrair antes de editar |
| central-blocks | 2431–2524 | módulo Gemini; extrair antes de editar |
| grounded-flora | 2525–2576 | módulo Gemini; extrair antes de editar |
| daily-moments | 2577–2599 | módulo Gemini; extrair antes de editar |
| market-morning | 2600–2638 | módulo Gemini; extrair antes de editar |
| lucia-garden | 2639–2683 | módulo Gemini; extrair antes de editar |
| bia-letters | 2684–2723 | módulo Gemini; extrair antes de editar |
| secondary-neighbors | 2724–2777 | módulo Gemini; extrair antes de editar |
| facade-studio | 2778–2941 | módulo Gemini; extrair antes de editar |
| cozy-ui | 2942–3418 | módulo Gemini; extrair antes de editar |
| crowd-flow | 3419–3453 | módulo Gemini; extrair antes de editar |
| resident-motion | 3454–3526 | módulo Gemini; extrair antes de editar |
| contatos-experimentais | 3528–3704 | módulo Gemini; extrair antes de editar |
| moto-experimental | 3707–3784 | módulo Gemini; extrair antes de editar |
| game | 3786–6170 | módulo Gemini; extrair antes de editar |

## Leitura focada

- Lugar e proposta de rua: `../../drafts/referencias-locais-2026-10-31/catalogo-candidato.json`.
- Problemas e integrações pendentes: `../../drafts/referencias-locais-2026-10-31/ANALISE.md`.
- A base atual das prévias é Gemini. Os módulos de `dist/` são o legado técnico V2.27, úteis para transportar correções, não para substituir o mapa.
- Não copiar `cozy-ui` inteiro para ajustar uma fachada. Ele contém imagens embutidas e propostas de interface fora do escopo atual.
- Para mudar um sistema, execute `npm run gemini:list` e `npm run gemini:extract -- nome-do-modulo`, edite apenas `gemini-modules/nome-do-modulo.js` e gere a prévia com `npm run build:development-preview`. Consulte `../../docs/COMO-TRABALHAR-COM-IA.md`.
