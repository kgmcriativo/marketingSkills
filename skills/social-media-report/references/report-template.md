# Monthly Report Template

This describes what goes in each section, in order. The actual HTML/CSS
implementation is [assets/dashboard-skeleton.html](../assets/dashboard-skeleton.html)
— copy it, fill in the placeholders per this file, then run
`assets/build-dashboard.js` (see SKILL.md Etapa 4 and
[visual-system.md](visual-system.md)). Two deliverables share this
content: the **Dashboard** (Artifact HTML, redeployed monthly to the same
link) and the **PDF resumido** (a condensed 1-2 page version — hero +
panorama + comparison table + top insights only, skip sections 03-07 and
the full footer). Fill every placeholder with real numbers — never ship a
placeholder to a client.

File naming: `KGM_Relatorio_{NomeCliente}_{AAAAMM}` for both the PDF file
and the dashboard title, using the report's reference month, not the
generation date.

Section numbers are sequential and skip anything with no data this month
— never leave a numbered section empty, and never leave a gap in the
numbering. The list below is the full set; a given month's report will
usually have fewer.

---

## Hero

The single "significant"-threshold metric of the month (usually Alcance,
but let metrics-framework.md's thresholds decide). Show the number, its
unit, **both** MoM and YoY deltas (never just the flattering one), and a
2-3 sentence explanation that ties the two together — if they point in
different directions, say so plainly; that divergence is often the real
story (see the Instagram section 04 in visual-system.md's worked example).

## 01. Panorama do Mês — Instagram

KPI tiles, one per headline metric with data this period (Visitas ao
perfil, Cliques no link da bio, Publicações no mês, Seguidores, ...). Every
tile: value + unit + MoM pill + YoY pill + one-line plain-language
explainer of what the metric measures. Seguidores gets no MoM/YoY pill
(snapshot-only, see metrics-framework.md) — say so instead of a delta.

## 02. Comparativo — 3 Períodos

A single table, one row per headline metric, columns: mesmo mês ano
anterior, mês anterior, mês atual, MoM %, YoY %.

```
| Métrica | {Mês/Ano-1} | {Mês Anterior} | {Mês Atual} | MoM | YoY |
|---------|-------------|-----------------|-------------|-----|-----|
| Alcance | {value} | {value} | {value} | {+/-X%} | {+/-Y%} |
| Visitas ao perfil | {value} | {value} | {value} | {+/-X%} | {+/-Y%} |
| Cliques no link | {value} | {value} | {value} | {+/-X%} | {+/-Y%} |
| Posts publicados | {value} | {value} | {value} | {+/-X%} | {+/-Y%} |
```

## 03. Engajamento

- Engajamento médio por post (curtidas + comentários somados) — value +
  unit ("curtidas + comentários / post") + MoM delta
- Taxa de engajamento média (engajamento / seguidores) — value + unit
  ("% dos {N} seguidores, em média por post") + MoM delta
- State the post-count basis explicitly ("baseado nas N publicações
  consideradas") and any exclusions (see 04)

## 04. Formato de Conteúdo (Instagram)

```
| Formato | Posts | Engajamento Médio | Engajamento Médio (curtidas+coment.) |
|---------|-------|--------------------|-----------------------------------|
| Feed / Carrossel | {n} | {rate}% | {value} |
| Reels | {n} | {rate}% | {value} |
```

1-2 sentence takeaway on whether the posting mix matches what's
performing. If any posts were excluded from this comparison (anomalous
organic engagement), explain exactly why — and cross-check section 07
first (see metrics-framework.md "Before calling a low-engagement post an
outlier/test") before calling something a test post.

## 05. Posts em Destaque (Instagram)

Top 3, then bottom 2-3 (excluding the final 48h of the period):

```
{rank}. {media_type} — {date}
"{caption excerpt}"
❤️ {like_count}  💬 {comments_count}  🔖 {saved, if pulled}  📈 {alcance, if pulled}
Por que funcionou / possível motivo: {1 sentence, tied to format/topic/timing}
```

Thumbnail: real image (downloaded + embedded as base64, never hotlinked)
when the environment can reach `*.cdninstagram.com`/`*.fbcdn.net`;
otherwise the gradient+icon placeholder from the skeleton, with the
limitation disclosed in the footer — see visual-system.md.

## 06. Facebook

- Fan/follower count, page views, post engagements — value + MoM delta
  when available
- If `facebook_page.posts` errored (permission gap), say exactly what's
  missing instead of a post-level breakdown
- If the account has effectively no Facebook activity, a short factual
  note is enough — don't pad this section

## 07. Anúncios (Meta Ads)

Only include campaigns with real spend in the period (see
metrics-framework.md's Meta Ads data source section). KPI tiles for the
period total (investment, impressions, results, cost-per-result), then a
campaign table:

```
| Campanha | Investimento | Impressões | Alcance | {Resultado} | Custo/Resultado |
|----------|--------------|------------|---------|--------------|-----------------|
| {nome} | R$ {value} | {value} | {value} | {value} | R$ {value} |
```

Note that per-campaign reach shouldn't be summed (audience overlap). If no
ad account is reachable, or the account exists but lacks `ads_read`/
`ads_management`, say which — they're different situations (SKILL.md
Etapa 2). If a campaign here explains an anomalous organic post from
section 04/05, cross-reference it explicitly.

## 08. YouTube

(Omit this whole section if the client has no active/confirmed channel.)

- Subscriber count, lifetime views — value + MoM/YoY delta
- Videos published this period, avg. views/engagement per video
- 1-2 sentence insight

## 09. Outras Plataformas (Fase 1 — dados manuais)

(Omit any platform row with no data this period.)

```
| Plataforma | Métrica | Este Mês | Variação MoM |
|------------|---------|----------|--------------|
| TikTok | Seguidores | {value} | {+/-X%} |
| LinkedIn | Seguidores | {value} | {+/-X%} |
| Google Meu Negócio | Visualizações do perfil | {value} | {+/-X%} |
```

Label this section clearly as manually reported data (see
manual-data-template.md), not pulled live.

## 10. Insights Automáticos e Recomendações

Every flagged insight from metrics-framework.md's thresholds (MoM and/or
YoY), each paired with one concrete recommendation:

```
### {Insight headline}
**O que aconteceu:** {numbers and delta — MoM and/or YoY}
**Por que importa:** {business implication}
**Recomendação:** {specific, testable action for next month}
```

Use the `insight risk` style (amber left border, see visual-system.md) for
insights that need attention/correction, plain `insight` (teal) for
positive findings.

## Rodapé — Limitações e Metodologia

Always include, adapted to what actually applies this month — full list in
SKILL.md's "Limitações a divulgar sempre". Ends with the KGM footer brand
line and the `KGM_Relatorio_NomeCliente_AAAAMM` file identifier.

---

## PDF resumido — what to keep

Hero → 01 Panorama → 02 Comparativo (3 períodos) → the single biggest
insight from 10 (2-3 sentences, not the full card). Drop 03-09 and the full
footer; keep one line crediting KGM Design e Comunicação and the data
period.
