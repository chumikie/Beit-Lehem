# Beit Lehem — mundo em desenvolvimento

Beit Lehem é uma experiência local e offline ambientada em Belém/PB, Rua Nova e no entorno rural e serrano. O objetivo é ampliar um mundo conectado, preservando a identidade artística e a escala do jogo aprovado.

## Três arquivos, três papéis diferentes

- **Base oficial de referência — V2.27:** [`baseline/Belem-Viva-V2-27.html`](baseline/Belem-Viva-V2-27.html). É a melhor versão estável até aqui: ampla, jogável e a base que deve crescer. Sua cópia congelada não deve ser editada.
- **Referência enriquecida do Gemini:** [`previews/gemini-preview.html`](previews/gemini-preview.html). Reúne mais referências e detalhes locais do que a base oficial. Serve como fonte de informação e comparação; não é uma substituição da V2.27.
- **Jogo em desenvolvimento — desktop:** [`previews/beit-lehem-development.html`](previews/beit-lehem-development.html). HTML autônomo da V2.27 com os aprimoramentos integrados.
- **Jogo em desenvolvimento — celular:** [`previews/beit-lehem-development-mobile.html`](previews/beit-lehem-development-mobile.html). A mesma versão, adaptada para telas pequenas. Os dois snapshots devem crescer juntos.

## Como funciona o código

A pasta `dist/` contém os módulos editáveis do jogo, os dados cartográficos, estilos e interfaces. `dist/index.html` é a entrada modular para o processo de build; não é um HTML autônomo pronto para abrir sozinha.

O snapshot de desenvolvimento pode ser regenerado com Node.js 18 ou superior:

```sh
npm run build:development-preview
```

Para gerar e abrir no navegador padrão:

```sh
npm run play:development-preview
```

A V2.27 congelada continua separada. A prévia Gemini permanece uma referência independente. Não há hospedagem, servidor remoto, GitHub Pages ou deploy.

## Validar alterações

```sh
npm test
npm run verify:baseline
npm run build
npm run build:development-preview
```

Os testes automatizados cobrem regras de dados e módulos, mas não substituem uma conferência visual em navegador e dispositivo físico.

## Direção de desenvolvimento

Prioridades atuais: mapa, escala, navegação, fachadas e personagens. Preservar a extensão do território e suas conexões. Não reduzir a área de exploração para dar aparência de conclusão. Não integrar novas missões, moto ou contatos enquanto a geografia e a apresentação ainda estiverem sendo consolidadas.

Veja [as decisões do projeto](docs/DECISOES.md), [o mapa do código](docs/MAPA-DO-CODIGO.md) e [os próximos passos](docs/PROXIMOS-PASSOS.md).
