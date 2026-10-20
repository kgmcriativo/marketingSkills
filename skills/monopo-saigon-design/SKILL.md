---
name: monopo-saigon-design
description: Sistema de design "Monopo Saigon" (editorial monocromático sobre luz líquida iridescente) como fonte de verdade visual para criar sites novos. Use sempre que o usuário pedir para criar, redesenhar ou estilizar um site, landing page, página institucional, portfólio ou componente de UI, ou disser "usar o design.md", "no estilo Monopo", "editorial minimalista", "hero iridescente", "pill ghost button". Impede decisões visuais genéricas (sombras, cantos arredondados médios, cores de acento, gradientes em botões, pesos bold em títulos grandes) e traz checklist de validação. For copy and conversion, see copywriting and page-cro.
metadata:
  version: 1.0.0
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
| `--color-paper` | `#ffffff` | Canvas principal; texto sobre fundo escuro. **Nunca** como cor de CTA primário |
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
| display | 225px | 400 | **0.70–0.76** | headline do hero |

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
- Faixas alternam **branco ↔ preto** (texto branco no preto).
- Composição **assimétrica**: texto-esq/imagem-dir alternando. Nada de pilhas centralizadas fora do hero.
- Lista de projetos: **coluna única**, uma imagem por linha, largura total do container, título abaixo. **Sem grade multicoluna de cards.**
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

**Hero Display Headline**: Roobert 225px/400, entrelinha 0.70–0.76, `#fff` sobre mídia iridescente. Frase única, centralizada na viewport. Sem subtítulo e sem CTA.

**Section Heading (Whisper)**: 78px/300/1.10. **Section Heading (Anchor)**: 94px/400/0.76.

**Project Card / List Row**: fundo transparente, raio 0, sem sombra, sem borda, sem padding envolvente. Imagem na largura do container; título 16–18px/400 abaixo; gap 14–46px entre linhas.

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
3. **Manifesto**: faixa branca, heading 78px/300, texto à esquerda, container 1078px.
4. **Trabalhos/serviços**: lista de coluna única, imagem + título.
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
- [ ] Display 225px/400 com entrelinha 0.70–0.76; heading 78px/300; heading-lg 94px/400/0.76.
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
- [ ] Lista de projetos em coluna única; sem grade multicoluna de cards.
- [ ] Blocos assimétricos; centralização só no hero.
- [ ] Header 66px transparente, sem sombra nem troca de cor.
- [ ] Rodapé de três colunas, 11px, `#6d6d6d`.

**Imagem**
- [ ] Uma mídia gigante (hero); demais imagens sem moldura/sombra/raio.
- [ ] Sem ilustrações, sem ícones decorativos; só o badge rotativo como ornamento.

**Movimento**
- [ ] Curva `cubic-bezier(0.19,1,0.22,1)`; transforms 0.8–1.25s; micro `ease` 0.4s.
- [ ] Animação por `transform`/`opacity`; `prefers-reduced-motion` respeitado.

**Qualidade geral**
- [ ] Contraste AA em todo texto; foco visível sem cor.
- [ ] Responsivo com `clamp()`; sem overflow horizontal em 375px.
- [ ] Nada copiado da marca Monopo (nome, textos, logo).
- [ ] O resultado pareceria uma página de revista, não um template SaaS.

## Arquivos de apoio

- `references/DESIGN.md`: documento original (fonte de verdade).
- `references/tokens.css`: tokens CSS/Tailwind v4 prontos, já corrigidos conforme as resoluções acima.
