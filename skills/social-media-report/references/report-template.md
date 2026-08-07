# Monthly Social Media Report Template

Use this structure for both delivery formats — as PPTX slide content (one
section ≈ one slide or slide group) and as an Artifact dashboard (one
section ≈ one panel/card group). Fill every placeholder with real numbers
from Stage 1/2; never ship a placeholder to a client.

---

## 1. Cover

```
{Client name} — Social Media Report
Instagram: @{username}
Period: {Month Year} (compared to {previous month/period})
Prepared by: KGM Design e Comunicação
Report date: {date}
```

---

## 2. Executive Summary

KPI cards, each with current value + MoM delta (▲/▼ {X}%):

```
| Metric | This Month | MoM Change |
|--------|-----------|------------|
| Followers | {value} | {+/-X%} |
| Reach | {value} | {+/-X%} |
| Profile Views | {value} | {+/-X%} |
| Website Clicks | {value} | {+/-X%} |
| Posts Published | {value} | {+/-X%} |
| Avg. Engagement Rate | {value}% | {+/-X%} |
```

2-3 sentence narrative: the single biggest story of the month (the
"significant" threshold insight from the metrics framework), stated plainly
— what happened and why it matters for the business.

---

## 3. Awareness

- Reach trend (this month vs. last): {value}, {delta}
- Follower growth: {net new} ({rate}%)
- Profile views: {value}, {delta}
- 1-2 sentence insight, tied to the specific numbers above

Chart: reach and follower count, current vs. previous period (bar or KPI
comparison — see the `dataviz` skill for chart selection when building an
Artifact).

---

## 4. Engagement

- Average engagement rate: {value}%, {delta}
- Average engagement per post: {value}, {delta}
- Total interactions on top posts: {value}
- 1-2 sentence insight

Chart: engagement rate by post, chronological across the period, to spot
trend vs. one-off spikes.

---

## 5. Conversion

- Website clicks: {value}, {delta}
- Profile views → clicks ratio: {value}%
- 1-2 sentence insight, including whether conversion moved with or against
  awareness (see cross-metric signals in metrics-framework.md)

---

## 6. Top Performing Posts

For each of the top 3 (with thumbnail/permalink if building a visual
deliverable):

```
{rank}. {media_type} — {date}
"{caption excerpt}"
❤️ {like_count}  💬 {comments_count}  🔖 {saved, if pulled}  📈 {reach, if pulled}
Why it worked: {1 sentence, tied to format/topic/timing}
```

## 7. Underperforming Posts

Same structure, bottom 2-3 (excluding posts from the final 48h of the
period). Frame as learning, not blame:

```
{media_type} — {date}
"{caption excerpt}"
❤️ {like_count}  💬 {comments_count}
Possible reason: {1 sentence, tied to format/topic/timing}
```

---

## 8. Content Format Comparison

```
| Format | Posts | Avg. Engagement Rate | Share of Posts |
|--------|-------|----------------------|----------------|
| Reels | {n} | {rate}% | {%} |
| Feed | {n} | {rate}% | {%} |
| Carousel | {n} | {rate}% | {%} |
```

1-2 sentence takeaway on whether the posting mix matches what's performing.

---

## 9. Automated Insights & Recommendations

List every flagged insight from Stage 2 (metrics-framework.md thresholds),
each paired with one concrete recommendation:

```
### {Insight headline}
**What happened:** {numbers and delta}
**Why it matters:** {business implication}
**Recommendation:** {specific, testable action for next month}
```

---

## 10. Next Month Focus

3-5 bullet priorities derived directly from the recommendations above,
ordered by expected impact.

---

## 11. Appendix

- Full KPI table (all metrics pulled, not just headline ones)
- Methodology: data source (Instagram Graph API via `meta-insights.js`),
  period definition, sampling note for per-post reach/saves
- Data limitations (see SKILL.md "Data limitations to disclose")
