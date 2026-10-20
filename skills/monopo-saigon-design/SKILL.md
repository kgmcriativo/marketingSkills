---
name: monopo-saigon-design
description: Sistema de design "Monopo Saigon" (editorial monocromático sobre luz líquida iridescente) como fonte de verdade visual para criar sites novos. Use sempre que o usuário pedir para criar, redesenhar ou estilizar um site, landing page, página institucional, portfólio ou componente de UI, ou disser "usar o design.md", "no estilo Monopo", "editorial minimalista", "hero iridescente", "pill ghost button". Impede decisões visuais genéricas (sombras, cantos arredondados médios, cores de acento, gradientes em botões, pesos bold em títulos grandes) e traz checklist de validação. For copy and conversion, see copywriting and page-cro.
metadata:
  version: 1.3.0
  source: references/DESIGN.md
---

# Monopo Saigon — Skill de Design

> Liquid iridescence behind editorial silence: uma galeria editorial preto-e-branco flutuando sobre luz derretida.

Você é um diretor de arte executando um sistema de design fechado. **`references/DESIGN.md` é a fonte de verdade.** Esta skill o organiza em regras acionáveis; se algo aqui divergir do original, o original vence (exceto nos conflitos resolvidos em "Ambiguidades do documento").

## Como usar

1. Antes de escrever qualquer HTML/CSS/JSX, leia este arquivo inteiro. Para valores exatos de tokens, consulte `references/tokens.css`; para o texto bruto, `references/DESIGN.md`.
2. Declare os tokens (`references/tokens.css`) no início do projeto. **Nunca** escreva valores literais de cor, raio, tamanho ou easing nos componentes; use sempre as variáveis.
3. Monte a página pelo "Esqueleto de página" abaixo.
4. Ao terminar, rode a "Checklist de validação" e corrija cada falha antes de entregar.
5. Em dúvida, escolha a opção **mais contida**. Este sistema é definido por aquilo que *não* faz.

## Fidelidade ao site real (leia antes de tudo)

O `DESIGN.md` é uma extração automática: ele marca "Theme: light" e lista 225px como tamanho do hero. **Medido no monopo.vn de verdade, isso está errado.** Um site que seguir só o texto do `DESIGN.md` sai "no estilo", mas fica diferente do original. Corrija assim:

| O `DESIGN.md` sugere | O site real faz |
|---|---|
| Canvas branco, faixas alternando branco/preto | **Página inteira preta** (`#000`); texto branco. Branco puro só como cor de texto |
| Hero com headline de 225px | Hero com frases de **~48px/400**, centradas, que **rotacionam** devagar; o "i" de cada palavra em *itálico*. Os **225px são do marquee gigante** do fim da página ("Discover Saigon Souls") |
| Gradiente verde → âmbar → oxblood vivo | Hero **escuro e granulado**: verde-musgo (`rgb(46,62,42)`), tan/dourado (`rgb(196,152,84)`), preto; **grão** forte e uma **esfera de vidro** com borda fina clara. Cores dessaturadas, nunca neon |
| Lista de projetos em coluna única | **Duas colunas escalonadas** (a da direita desce ~130px), imagens retrato 3:4, título 12px a 55% de branco e tags 10px a 32% embaixo |
| Menu em linha | Menu **empilhado na vertical, alinhado à direita**, 11px caixa-alta a 55% de opacidade; logo à esquerda; seletor de idioma ao centro |
| Manifesto em 78px/300 | Texto de **6,56vw/400 (94px a 1440)** em linhas fixas, com **máscara que desliza linha a linha** (veja abaixo), seguido de linhas com fio de 1px (rótulo 9px à esquerda, parágrafo 14px à direita) |
| Lead em destaque | Parágrafos de apoio em **28,5px/300** |
| Cookie banner opcional | Existe no original; omita se o site não rastreia |

Também no original: rótulos de seção com seta (`→ Selected project`, 11px/600), bloco de marcas em texto centralizado (14px) com um pill ghost abaixo, rodapé de 3 colunas em 11px cinza, container de **1080px** (margem de 180px em 1440px).

### Medidas exatas do original (extraídas do CSS computado do monopo.vn)

**Tudo é dimensionado em `vw`, com 1440px = 1:1.** Em 1920px o manifesto vira 126px e o marquee 300px. Os "px" do `DESIGN.md` valem só para 1440. Nunca fixe esses tamanhos em px no CSS; use `vw` (ou `calc(100vw / 1440 * N)`). Corpo, botões e inputs ficam fixos em 16/18px.

| Elemento | Desktop | Mobile |
|---|---|---|
| Container | gutter 12.5vw (75vw de conteúdo) | gutter 6.67vw |
| Hero (frases) | 3.4vw / 1.1 | |
| **Manifesto** | **6,56vw, entrelinha 5vw (0,76), peso 400**, margem-topo 7.66vw; cada linha `overflow:hidden`, altura 7.6vw | 10.67vw |
| Texto de apoio / citação / lead | 1.98vw / 2.76vw, **peso 300** | 4.27vw / 7.47vw |
| Marcas ("They trust us") | **2.5vw / 3.49vw**, palavras com vírgula que surgem em sequência (fade + translateY 40%, atraso 0.12s entre elas); bloco 59.38vw centralizado | 5.87vw |
| Intro de seção ("team") | 5.42vw / 5.94vw, peso 300; entra com opacity 0→1 (0.4s linear) + translateY 20%→0 (0.8s ease-signature) | 10.67vw |
| Marquee final | **15.63vw** | |
| Rótulos / labels | 0.63vw, 0.73vw, 0.83vw | |
| Espaçamentos de seção | ≈10.5vw; gap de colunas 4.5vw | |

**Máscara do manifesto (não é "palavra por palavra")**: o texto é quebrado em **linhas fixas**. Cada linha é `.line > .content(overflow hidden) > span + .mask`. A `.mask` é um retângulo **preto, 65% de opacidade**, cobrindo 100% da linha (`transform-origin: 100% 50%`, altura 115%). Quando a linha entra a **20% da base da viewport**, a máscara faz `scaleX(1 → 0)` (1.25–1.6s, ease-signature), revelando o texto da esquerda para a direita; o texto "apagado" é branco a 35%. Linhas que entram juntas ganham atraso de ~0.09s. Veja `assets/scroll-interactions.js`.

**Cursor (pequeno)**: por padrão um **ponto branco de ~0.75vw (≈11px)**, não um círculo grande. Sobre links e projetos vira um círculo (~3.4vw) com a seta ↗ (0.8s ease-signature). O ponto estica levemente na direção do movimento. Em fundo branco o ponto fica preto. Um círculo "Play" de 7.19vw existe só sobre vídeos.

**Rolagem (Locomotive Scroll no original; Lenis é a alternativa usada aqui)**: parallax por elemento com velocidades diferentes (ex.: colunas de projetos em +0.6 e -0.2, citação -0.25, textos de intro até -2), seções com `data-scroll-call` que mudam estado, grade rotacionada a 45° com linhas que correm na horizontal (`data-scroll-direction=horizontal`, só quando há muitas imagens) e marquee cuja velocidade e sentido seguem a rolagem.

### Movimento do original (o que faz o site "ficar vivo")

Um site só com CSS fica estático perto do original. Estes seis comportamentos são obrigatórios; sem eles, o resultado parece "no estilo", mas não se move como o monopo:

1. **Hero em WebGL, não em CSS.** Fluido contínuo (fbm com domain warping, paleta musgo/tan/creme) + lente de vidro com refração e borda clara + grão. Reage ao mouse (redemoinho suave) e à rolagem. Use `assets/hero-fluid-webgl.js` (canvas `#hero-gl` dentro de `.hero`). Mantenha blobs CSS apenas como fallback sem WebGL. Pause fora da viewport.
2. **Rolagem suave com inércia** (Lenis `1.1.18`, `lerp ≈ 0.085`), incluindo âncoras com `scrollTo` de ~1.6s.
3. **Distorção por velocidade de rolagem**: textos e imagens recebem `skewY` e leve `scaleX` proporcionais à velocidade e voltam a zero ao parar (variáveis `--sk`, `--st`).
4. **Cursor customizado**: ponto branco de ~0.75vw seguindo o mouse com atraso (lerp ~0.2); vira círculo de ~3.4vw com ↗ sobre links/projetos. Só em `hover:hover` e `pointer:fine`.
5. **Frases do hero rotativas** (troca a cada ~4s, 1.25s de transição) e que somem com a rolagem; manifesto que acende palavra por palavra; marquee gigante em loop linear lento.
6. **Respeitar `prefers-reduced-motion`**: sem Lenis, sem rotação, shader em quadro fixo.

Valide **em movimento**: grave ou capture 2+ quadros do hero em instantes diferentes e confirme que mudam; confirme que `--sk` sai de 0 durante a rolagem.

### Processo para ficar fiel (obrigatório em sites novos)

1. **Capture screenshots da referência** (Chromium/Playwright em 1440×900; rode com `mouse.wheel`, pois o site hijacka a rolagem) e olhe cada seção. Nunca derive layout só do `DESIGN.md`.
2. Leia estilos computados dos elementos-chave (`font-size`, `font-weight`, cor) em vez de confiar nos números do `DESIGN.md`.
3. Monte a página por seção, comparando lado a lado com os screenshots.
4. Reuse **estrutura, ritmo, escala e movimento**; troque conteúdo e marca. Não copie texto, logo, nome nem imagens.
5. Quanto mais contexto visual (screenshots, logo, identidade, briefing), menos a IA inventa.

## O princípio central

Um único gesto expressivo (o hero iridescente + botões pill) cercado de **disciplina radical**: preto, branco e cinzas; cantos retos; superfícies planas; tipografia enorme com respiro; movimento lento. A cor existe em **um** lugar por página e nunca na interface.

## Princípios reutilizáveis

1. **Silêncio editorial.** Espaço vazio é conteúdo. Se uma seção parece "vazia", provavelmente está correta. Não preencha.
2. **Um gesto por página.** Uma única superfície cromática (hero), um único headline monumental. Todo o resto serve a esse contraste.
3. **Contraste binário, sem meio-termo.** Raio 0 ou 75px. Peso 300 ou 400. Branco ou preto. Rápido-nunca ou lento (0.8–1.25s). Não existem valores intermediários "seguros".
4. **A tipografia é a imagem.** Hierarquia vem de tamanho, peso e entrelinha, não de cor, caixas, ícones ou sombras.
5. **Conteúdo sem chrome.** Cards, imagens e inputs não têm moldura, sombra nem preenchimento decorativo. O card *é* o conteúdo.
6. **Afordância por contexto.** Links não têm sublinhado; botões se reconhecem pela silhueta pill e pela borda de 1px.
7. **Movimento é câmera lenta.** Elementos deslizam por `transform`; nada "estala".
8. **Planicidade.** Separação entre superfícies por inversão de cor (branco ↔ preto) e bordas de 1px, jamais por elevação.
9. **Assimetria editorial.** Texto à esquerda/imagem à direita e vice-versa; centralizado só no hero.
10. **Cor é mídia, não UI.** O gradiente iridescente é uma imagem/vídeo/shader, nunca um token de interface.

## Regras por categoria

### 1. Cor

| Token | Valor | Uso permitido |
|---|---|---|
| `--color-obsidian` | `#000000` | Texto primário, bordas em superfície clara, traços SVG, seções inversas |
| `--color-paper` | `#ffffff` | Cor do texto sobre o fundo preto (e canvas, se o projeto pedir tema claro). **Nunca** como cor de CTA primário |
| `--color-inkstone` | `#181818` | Texto longo de rodapé e subtítulos secundários |
| `--color-felt-gray` | `#6d6d6d` | Texto auxiliar: endereço, legal, anotações |
| `--color-slate-pill` | `#636363` | Único preenchimento sólido de ação (consentimento/Accept) |
| `--color-ash-mist` | `#9a9a9a` | Painéis internos, zonas desabilitadas |
| `--color-pewter` | `#808080` | Estados de hover/mudo |
| Gradiente iridescente | verde `rgb(160,224,171)` → âmbar `rgb(255,172,46)` a 50% → oxblood `rgb(165,45,37)` | **Somente** atrás do hero, como mídia |

Regras:
- Paleta de interface = preto, branco, cinzas. **Accent: nenhum.** Não existe "cor de CTA primário".
- Borda em fundo escuro: `rgba(255,255,255,0.3)`. Em fundo claro: `#000000`.
- Máximo **um** backdrop iridescente por página.
- Proibido: azul de link, verde de sucesso, vermelho de erro, qualquer hue em UI. Estados de erro/sucesso se expressam por texto e peso, em cinza/preto.

### 2. Tipografia

Famílias:
- **Roobert** (primária, tudo): substitutos permitidos **Inter** ou **Söhne**. Carregue com `font-display: swap`.
- **Raleway** (acento raríssimo, só títulos, 400/54px): substitutos Montserrat ou Jost. Nunca em corpo ou navegação. Na dúvida, não use.
- **system-ui** (microtexto, banner de cookies, letra miúda: 9px e 16px).

Pesos: **300**, **400** e **600**. O 600 só vale para tamanhos **≤ 45px**. Acima disso, apenas 300 ou 400.

Escala (peso/entrelinha conforme o papel):

| Papel | Tamanho | Peso | Entrelinha | Uso |
|---|---|---|---|---|
| micro | 9px | 400 | 1.15–1.32 | system-ui, fine print |
| label | 11px | 400 | 1.36 | menu, rodapé, rótulos |
| caption | 12px | 400 | 1.19 | seletor de idioma, legendas |
| body-sm | 16px | 400 | 1.15 | botões, logo, títulos de projeto |
| body | 18px | 400 | 1.21 | texto corrido curto |
| (leitura longa) | 16–18px | 400 | até 1.58 | blocos longos; entrelinha generosa |
| subheading | 39px | 400 | 1.19 | |
| subheading-lg | 45px | 400 | 1.15 | |
| heading-sm | 54px | 400 | 1.39 | (Raleway opcional) |
| heading | 78px | **300** | 1.10 | manifesto, seções atmosféricas ("peso sussurro") |
| heading-lg | 94px | 400 | **0.76** | afirmações densas, "objeto de arte" |
| display | 225px | 400 | **0.70–0.76** | marquee gigante de fechamento (não o hero) |
| hero-phrase | ~48px | 400 | 1.1 | frases rotativas do hero |

Regras:
- `letter-spacing: 0` em tudo (a única exceção é a animação de hover do botão).
- Acima de 78px: entrelinha 0.70–0.76 (linhas quase se tocam).
- Peso 300 em 78px é deliberado e anti-convenção. Nunca "corrija" para 600/700.
- Corpo, listas, endereços e descrições: **alinhados à esquerda**, jamais centralizados.
- Rótulos de menu em caixa-alta (WORK / MANIFESTO / CONTACT), 11–12px.
- Texto de hero: sem subtítulo e sem CTA junto ao headline.

### 3. Espaçamento e layout

- Unidade base **4px**. Densidade **espaçosa**.
- Escala: `8 · 12 · 28 · 40 · 48 · 64 · 68 · 152`. Gap de elemento **14px**, gap de seção **46px**, padding de card **34px**.
- Container: **max-width 1078px**, centrado. Só o hero e as faixas escuras quebram o container (full-bleed).
- Fundo **preto** em toda a página (o hero escurece até `#000` na base). Superfícies claras só se o projeto pedir tema claro.
- Composição **assimétrica**: texto-esq/imagem-dir alternando. Nada de pilhas centralizadas fora do hero.
- Projetos: **duas colunas escalonadas** de imagens retrato, sem chrome de card. Sem grades uniformes de 3+ colunas.
- Rodapé: três colunas compactas de endereço (ex.: Tokyo, Saigon, London) em 11px `#6d6d6d`, 8px entre linhas, sem divisórias nem rótulos.

### 4. Forma e superfície

| Elemento | Raio |
|---|---|
| botões, tags | **75px** (pill) |
| cards, imagens, inputs, links, navegação | **0px** |

- **Proibido** raio entre 1px e 74px. Ignore `--radius-lg: 10px` presente no bloco de variáveis do original (veja "Ambiguidades").
- **Proibido** `box-shadow`, `drop-shadow`, blur de elevação, glassmorphism.
- Superfícies: 1 Paper `#fff` (canvas) · 2 Slate Pill `#636363` · 3 Obsidian `#000` · 4 Ash Mist `#9a9a9a`.
- Separação só por inversão de cor e bordas de 1px. A única "elevação" é a opacidade do banner de cookies `rgba(55,55,55,0.78)`.

### 5. Componentes

**Ghost Pill Button, superfície escura** (ação primária sobre hero): fundo transparente · borda `1px solid rgba(255,255,255,0.3)` · texto `#fff` · raio 75px · padding `11px 33px` · Roobert 16px/400.

**Ghost Pill Button, superfície clara**: mesma geometria, borda `1px solid #000`, texto `#000`. Sem preenchimento no hover; anime opacidade da borda e `letter-spacing` com `cubic-bezier(0.19,1,0.22,1)` por 0.8s.

**Filled Neutral Pill**: fundo `rgba(55,55,55,0.78)` (≈ `#636363`) · texto `#fff` · borda `1px solid #fff` · raio 75px · padding `11px 33px`. Só para consentimento/confirmações utilitárias. **Nunca CTA de marketing.**

**Link de texto**: sem fundo, sem borda, raio 0, **sem sublinhado**. Roobert 12–16px/400; cor alterna `#fff`/`#000` conforme a superfície.

**Hero**: frase de ~48px/400, entrelinha 1.1, `#fff`, centralizada, rotacionando devagar entre 2–3 frases (translate+opacity, 1.25s), "i" em itálico. Sem subtítulo e sem CTA. **Marquee de fechamento**: texto de 225px/400 deslizando em loop linear lento.

**Section Heading (Whisper)**: 78px/300/1.10. **Section Heading (Anchor)**: 94px/400/0.76.

**Project Card**: fundo transparente, raio 0, sem sombra, sem borda. Duas colunas escalonadas (a direita deslocada ~130px), imagem retrato 3:4, título 12px a 55% e tags 10px a 32% abaixo; gap vertical 68px.

**Language Switcher**: três links inline (EN / VN / 中文) 12px/400, separados por espaço (sem divisórias); estado ativo sinalizado por espaçamento, não por cor.

**Rotating Scroll Indicator**: badge SVG circular no canto inferior esquerdo, texto ao longo da circunferência ("SCROLL DOWN · SCROLL DOWN"), rotação contínua e lenta, traço preto/branco sem preenchimento. É pontuação tipográfica, não botão. Único ornamento permitido.

**Top Navigation**: header fixo transparente, **66px**; logo (wordmark) à esquerda 16px/400, seletor de idioma ao centro, menu à direita 11–12px caixa-alta. Sem fundo, sem sombra, sem troca de cor ao rolar.

**Footer Address Block**: 11px/400, entrelinha 1.36, `#6d6d6d`, margens de 8px entre linhas, alinhado à esquerda.

**Cookie Banner**: barra fixa inferior `rgba(55,55,55,0.78)`, texto branco em system-ui 9–16px, um único botão Filled Neutral Pill "Accept". Sem configurações.

**Iridescent Hero Backdrop**: viewport inteira; mídia orgânica fluida (vídeo, canvas/shader ou imagem), nunca um gradiente linear chapado. Fallback sem mídia: `--gradient-iridescent-fade` com blobs/ruído animados em camadas, jamais uma faixa `linear-gradient` reta.

### 6. Imagens

- **Uma** imagem gigante por página (o hero). Todo o resto é texto, com fotografia editorial contida (recortes fechados de produto, stills de campanha) **sem moldura, borda ou sombra**.
- Sem ilustrações, sem ícones (exceto glifos de UI minúsculos), sem formas decorativas, sem stock genérico de sorrisos.
- Imagens com raio 0. Não preencha o canvas com imagens: o sistema é dominado por texto.

### 7. Movimento

- Curva assinatura: `cubic-bezier(0.19, 1, 0.22, 1)` em `transform`, cor e `opacity`; durações **0.8s** e **1.25s** (1.25s é o padrão para transforms de revelação).
- Micro-transições de cor/opacity: `ease` em **0.4s**.
- Anime `transform` e `opacity`, não `top/left/width`. Transições de borda e `flex-basis` são raras, só para revelar layout.
- Rotação contínua lenta apenas no scroll indicator.
- Nunca: bounce, spring, parallax agressivo, shake, durações < 0.4s.
- Respeite `prefers-reduced-motion`: desligue rotação e reduza revelações a fade (inferido; não consta no original).

```css
:root { --ease-signature: cubic-bezier(0.19, 1, 0.22, 1); }
.reveal { transition: transform 1.25s var(--ease-signature), opacity 1.25s var(--ease-signature); }
.btn    { transition: border-color .8s var(--ease-signature), letter-spacing .8s var(--ease-signature), color .4s ease; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition-duration: .01ms !important; } }
```

## Esqueleto de página

1. **Header** transparente fixo (66px).
2. **Hero** full-bleed: mídia iridescente + headline display único + scroll indicator inferior-esquerdo (+ opcionalmente 1 Ghost Pill escuro, somente se o brief exigir; o headline não leva CTA colado).
3. **Manifesto**: texto de 6,56vw em linhas fixas com máscara deslizante, seguido de linhas com fio de 1px.
4. **Trabalhos**: duas colunas escalonadas, imagem + título + tags.
5. **Faixa preta inversa** com afirmação 94px/400/0.76 (opcional).
6. **Blocos assimétricos** texto/imagem alternados, gap de seção 46px (ou 152px para respiro maior).
7. **Contato**: Ghost Pill claro.
8. **Footer**: três colunas de endereço 11px cinza.
9. **Banner de cookies** se houver rastreamento.

## Implícitas e derivadas (decisões que o original não escreve, mas exige)

- **Responsivo:** 225px não cabe em mobile. Use `clamp()` preservando proporções: display `clamp(64px, 16vw, 225px)`, heading-lg `clamp(44px, 8vw, 94px)`, heading `clamp(40px, 7vw, 78px)`. Mantenha entrelinhas e pesos; nunca troque 300 por 600 para "ajudar" a leitura. Em telas estreitas o container usa gutter lateral de 16–24px (múltiplos de 4).
- **Acessibilidade:** `#6d6d6d` sobre branco passa em AA para texto normal (≈ 5:1); `#9a9a9a`/`#808080` **não** devem carregar texto sobre branco. Garanta contraste do headline sobre a mídia (overlay preto semitransparente `rgba(0,0,0,.2–.4)` é permitido, pois é "overlay fill" Obsidian). Foco visível: borda de 1px mais opaca/contorno 1px preto ou branco, sem cor e sem raio intermediário. Links sem sublinhado exigem diferenciação por contexto (menu, posição); em texto corrido, use peso/posição, nunca azul.
- **Inputs:** raio 0, borda 1px preto (claro) ou `rgba(255,255,255,.3)` (escuro), fundo transparente, texto 16px/400, sem sombra de foco.
- **Tags:** raio 75px, 11–12px/400, mesma borda de 1px do botão ghost.
- **Idioma/ícones:** suporte multilíngue (EN/VN/中文) é parte do DNA; fontes CJK devem cair em sans neutra, mantendo peso 400.
- **Tom do conteúdo:** frases curtas, afirmativas, poéticas. Evite jargão de marketing e exclamações.

## Ambiguidades do documento (resoluções obrigatórias)

| Conflito no original | Resolução |
|---|---|
| Tabela de escala diz display 225px com entrelinha 1.25, mas as regras exigem 0.70–0.76 acima de 78px | Use **0.70–0.76**. Os 1.25 são ruído de medição |
| `--radius-lg: 10px` existe nas variáveis, mas "nunca entre 1 e 74px" | **Não use** `--radius-lg`. Só 0 e 75px |
| `--color-iridescent-fade: #a02d25` (token achatado) | Use só como âncora de cor da mídia/fallback, nunca na UI. Gradiente real em `--gradient-iridescent-fade` |
| Peso 600 listado, mas "nunca 600+ acima de 45px" | 600 só ≤ 45px, e raramente (rótulos). Padrão é 300/400 |
| Slate Pill `#636363` vs `rgba(55,55,55,0.78)` | Mesmo papel. Botão: `rgba(55,55,55,.78)`; token de superfície: `#636363` |
| "Active locale ... heavier through spacing alone" | Sinalize o ativo só com espaçamento/posição |
| Exemplo "Un i ted, Unbound" é só o texto do site original | Substitua pela frase do projeto; **não copie** conteúdo/marca da Monopo |
| Prompt Guide cita só 2 exemplos numerados (1 ausente) | Siga o catálogo de componentes acima |

## Anti-padrões: o que a IA NÃO pode fazer

Decisões genéricas de IA que este sistema proíbe:
- Cards com sombra e cantos de 8–16px; botões "arredondados" (`rounded-lg/xl/2xl`).
- Botão primário preenchido com azul/roxo/gradiente; CTA verde.
- Hero com título + subtítulo + dois botões + mockup à direita.
- Grade de 3 cards com ícone, título e descrição.
- Títulos em 600–800 nos tamanhos grandes; `letter-spacing` negativo "premium".
- Gradientes roxo-azul, glassmorphism, blobs decorativos na UI, emojis como ícones.
- Seção de depoimentos com avatares circulares, selos, badges coloridos.
- Texto de corpo centralizado; sublinhado em links; hover com sombra/escala.
- Animações `ease-in-out 0.2s` ou bounce.
- Múltiplas imagens/vídeos disputando atenção; ilustrações; ícones de biblioteca (Lucide, Heroicons) na interface.
- Usar Inter/Roobert em pesos 500/700 "para dar hierarquia".

Se sentir vontade de usar algum desses, volte ao princípio 1 (silêncio editorial) e resolva com **tamanho, peso, espaço ou inversão preto/branco**.

## Checklist de validação

Marque cada item antes de entregar; qualquer "não" é bloqueante.

**Cor**
- [ ] Interface usa só `#000`, `#fff`, `#181818`, `#6d6d6d`, `#636363`, `#9a9a9a`, `#808080` (+ `rgba` documentados).
- [ ] Nenhum matiz cromático em UI (links, botões, bordas, ícones, estados).
- [ ] Exatamente **um** backdrop iridescente, e apenas atrás de texto do hero.
- [ ] Nenhum gradiente em botões, badges ou controles.

**Tipografia**
- [ ] Roobert (ou Inter/Söhne) em tudo; Raleway ausente ou restrito a um título acento.
- [ ] Hero ~48px/400; 225px apenas no marquee; lead 28,5px/300; manifesto 6,56vw/400 (entrelinha 5vw).
- [ ] Nenhum peso ≥ 600 acima de 45px.
- [ ] `letter-spacing: 0` fora do hover do botão.
- [ ] Corpo/listas/endereços alinhados à esquerda.

**Forma**
- [ ] Todo raio é 0 ou 75px. Zero raios intermediários (busque `rounded`, `border-radius`).
- [ ] Zero `box-shadow` / `drop-shadow`.
- [ ] Botões e tags pill; cards, imagens, inputs, links, nav com raio 0.
- [ ] Botão: padding `11px 33px`, borda 1px, Roobert 16px/400.

**Layout**
- [ ] Container 1078px; só hero/faixas escuras full-bleed.
- [ ] Espaçamentos múltiplos de 4px da escala; gap de seção 46px, de elemento 14px.
- [ ] Projetos em duas colunas escalonadas (retrato 3:4), sem chrome de card.
- [ ] Página escura, hero granulado musgo/dourado com esfera de vidro, frases rotativas de ~48px com "i" em itálico.
- [ ] Screenshots da referência comparados lado a lado antes de entregar.
- [ ] Blocos assimétricos; centralização só no hero.
- [ ] Header 66px transparente, sem sombra nem troca de cor.
- [ ] Rodapé de três colunas, 11px, `#6d6d6d`.

**Imagem**
- [ ] Uma mídia gigante (hero); demais imagens sem moldura/sombra/raio.
- [ ] Sem ilustrações, sem ícones decorativos; só o badge rotativo como ornamento.

**Movimento**
- [ ] Curva `cubic-bezier(0.19,1,0.22,1)`; transforms 0.8–1.25s; micro `ease` 0.4s.
- [ ] Animação por `transform`/`opacity`; `prefers-reduced-motion` respeitado.
- [ ] Hero em WebGL animado (2 quadros distintos), Lenis ativo, skew por velocidade, parallax e marquee ligados à rolagem.
- [ ] Tamanhos em `vw` (manifesto 6,56vw, marquee 15,63vw, marcas 2,5vw); cursor padrão é um ponto de ~11px.
- [ ] Manifesto com máscara por linha (65% preto, scaleX 1→0), não por palavra.

**Qualidade geral**
- [ ] Contraste AA em todo texto; foco visível sem cor.
- [ ] Responsivo com `clamp()`; sem overflow horizontal em 375px.
- [ ] Nada copiado da marca Monopo (nome, textos, logo).
- [ ] O resultado pareceria uma página de revista, não um template SaaS.

## Arquivos de apoio

- `references/DESIGN.md`: documento original (fonte de verdade).
- `references/tokens.css`: tokens CSS prontos, no tema escuro do site real.
- `assets/scroll-interactions.js`: máscara do manifesto, Lenis, parallax, marquee atrelado à rolagem e cursor.
- `assets/hero-fluid-webgl.js`: shader do hero (fluido + lente de vidro), pronto para usar com `<canvas id="hero-gl">` dentro de `.hero`.
