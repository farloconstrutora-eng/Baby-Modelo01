# FAWÉ — site (agência de talentos e marketing)
Pipeline de 3 etapas em `.site-build/` (ler `handoff.md` primeiro). Etapa 1 pronta: `.site-build/01-reverso/spec.md`.
- Identidade: segue `01-reverso/ref-screenshot_06.png` (Instagram @faweone) à risca; a cliente é criteriosa. Hex medidos em `tokens.json`. Nunca usar cores da interface do Instagram nem fotos de celebridades/terceiros do feed.
- Referência estrutural: Extrafazant (extrafazant.nl), só layout, ritmo e movimento. Diferente de propósito: toda a identidade (cores, fontes, logo, textos, imagens) é da FAWÉ; sem cursor customizado e sem botão de tema. Nada de código, texto ou mídia copiado.

## Estado (2026-11-14)
Etapa 2 pronta: site estático em `index/talentos/servicos/sobre/contato/404.html`, `css/style.css`, `js/content.js` (contatos), `js/main.js`. Sem GSAP ainda (etapa 3). Textos provisórios listados em `.site-build/02-grafico/log.md`. Pendências do cliente: logo vetorial oficial, fotos autorizadas (6+ talentos), WhatsApp, e-mail, horário, domínio, textos das 8 áreas. Armadilha: capturas com janela alta esticam seções 100vh; usar `-ExtraCss '.fx-pin,.fx-hscroll{min-height:700px!important}'`.

## Atualização 2026-11-15 — briefing oficial e etapa 3
- O briefing oficial está no Notion (Clientes > Baby) e copiado em `.site-build/notion-baby/`. Ele manda sobre copy, paleta e serviços; revisão em `.site-build/revisao-briefing-baby.md`.
- Decisões do usuário que CONTRARIAM o briefing (não reabrir sem ele pedir): manter os 11 efeitos GSAP (o briefing pedia só a escrita do script no hero) e manter as 5 páginas (sem The Edit, Imprensa e Para marcas como página). Também seguem divergentes: cartões 3:4 (briefing 4:5) e leopardo + listras juntos (briefing: só um).
- Paleta só com #8E0C0C, #6B0F14, #EEDC82, #FFFFFF, #F3EDE4, #1A1414, #2F80ED (azul só no balão). Logo com letras brancas.
- Contatos, prazo e número do WhatsApp do formulário só em `js/content.js`. Fontes locais em `assets/fonts`. Efeitos em `js/fx/` carregados por `fx/fx.js` (para desligar um efeito, tire-o da lista do carregador).
- Hero da Home (pedido do usuário, 2026-11-15): "Muito prazer, somos a <em class="script">FAWÉ.</em>" com sublinhado no título inteiro e a linha se desenhando (split.js). Não voltar à pílula Playfair nem ao sublinhado parcial (.t-nou/.u) no hero.
- Armadilhas: o ScrollSmoother põe o conteúdo em position:fixed, então capturas de página inteira devem usar reduced motion; `screenshot.ps1` sai em branco com GSAP ligado (use puppeteer-core em `%TEMP%\claude\fawe-qa\node`). `preload` de fonte só funciona em http(s).

- 2026-11-17: seção do tote 3D na Home (ver handoff.md, 'Tote 3D na Home'). Produto de exemplo, pendente de confirmação da FAWÉ.
