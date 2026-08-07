# Monthly Social Media Report Template

Two deliverables share this structure: the **Dashboard** (Artifact HTML,
redeployed monthly to the same link) and the **PDF resumido** (a condensed
1-2 page version — cover + executive summary + KPI table + top insights
only, skip the detailed per-platform breakdowns and appendix). Fill every
placeholder with real numbers from Stage 2/3 of the SKILL.md workflow —
never ship a placeholder to a client.

File naming: `KGM_Relatorio_{NomeCliente}_{AAAAMM}` for both the PDF file
and the dashboard title, using the report's reference month, not the
generation date.

---

## 1. Capa

```
{Nome do Cliente} — Relatório de Social Media
Período: {Mês Ano} (comparado a {mês anterior})
KGM Design e Comunicação
Data do relatório: {data}
```

---

## 2. Resumo Executivo

KPI cards, current value + MoM delta (▲/▼ {X}%), one row per platform that
has data this period:

```
| Plataforma | Métrica | Este Mês | Variação MoM |
|------------|---------|----------|--------------|
| Instagram | Seguidores | {value} | {+/-X%} |
| Instagram | Reach | {value} | {+/-X%} |
| Instagram | Engajamento médio | {value}% | {+/-X%} |
| Facebook | Seguidores | {value} | {+/-X%} |
| YouTube | Inscritos | {value} | {+/-X%} |
| YouTube | Visualizações (período) | {value} | {+/-X%} |
```

Omit rows for platforms with no data this period — don't leave a blank row.

2-3 sentence narrative: the single biggest story of the month (the
"significant" threshold insight from metrics-framework.md), stated plainly.

---

## 3. Instagram

- Awareness: reach, follower growth, profile views — value + MoM delta
- Engagement: avg. engagement rate, avg. engagement per post — value + delta
- Conversion: website clicks — value + delta
- 1-2 sentence insight per bucket, tied to the specific numbers

Chart: reach and engagement rate trend across the period (see `dataviz`
skill for chart selection).

---

## 4. Facebook

- Fan/follower count, page views, post engagements — value + MoM delta
- 1-2 sentence insight
- If `facebook_page.posts` errored (permission gap), note it here instead
  of a post-level breakdown

---

## 5. YouTube

(Omit this whole section if the client has no active channel.)

- Subscriber count, lifetime views — value + MoM delta
- Videos published this period, avg. views/engagement per video
- 1-2 sentence insight

---

## 6. Outras Plataformas (Fase 1 — dados manuais)

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

---

## 7. Posts em Destaque (Instagram)

Top 3, then bottom 2-3 (excluding the final 48h of the period):

```
{rank}. {media_type} — {date}
"{caption excerpt}"
❤️ {like_count}  💬 {comments_count}  🔖 {saved, if pulled}  📈 {reach, if pulled}
Por que funcionou / possível motivo: {1 sentence, tied to format/topic/timing}
```

---

## 8. Comparação de Formato de Conteúdo (Instagram)

```
| Formato | Posts | Engajamento Médio | % dos Posts |
|---------|-------|--------------------|-------------|
| Reels | {n} | {rate}% | {%} |
| Feed | {n} | {rate}% | {%} |
| Carrossel | {n} | {rate}% | {%} |
```

1-2 sentence takeaway on whether the posting mix matches what's performing.

---

## 9. Insights Automáticos e Recomendações

Every flagged insight from Stage 3 (metrics-framework.md thresholds), each
paired with one concrete recommendation:

```
### {Insight headline}
**O que aconteceu:** {numbers and delta}
**Por que importa:** {business implication}
**Recomendação:** {specific, testable action for next month}
```

---

## 10. Foco do Próximo Mês

3-5 bullet priorities derived directly from the recommendations above,
ordered by expected impact.

---

## 11. Apêndice (dashboard completo only — omit from the PDF resumido)

- Tabela completa de KPIs (todas as métricas puxadas, não só as principais)
- Metodologia: fontes de dados (Instagram/Facebook Graph API via
  `meta-insights.js`, YouTube Data API via `youtube-insights.js`, planilha
  manual para TikTok/LinkedIn/GMB), definição do período
- Limitações de dados (ver SKILL.md "Limitações a divulgar sempre")
- Rodapé: "KGM Design e Comunicação" em todas as páginas/telas
