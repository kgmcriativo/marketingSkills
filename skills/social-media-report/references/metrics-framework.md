# Metrics Framework & Insight Thresholds

This extends the `social` skill's Analytics & Optimization metrics
(Awareness / Engagement / Conversion) into concrete formulas and thresholds
for automated monthly insight generation from `meta-insights.js` output.

## Data Sources

All fields below come from `node tools/clis/meta-insights.js report monthly`
unless noted otherwise.

| Bucket | Metric | Source field |
|--------|--------|-------------|
| Awareness | Reach | `account_insights.reach` |
| Awareness | Follower count / growth | `account.followers_count` |
| Awareness | Profile views | `account_insights.profile_views` |
| Engagement | Per-post engagement | `posts[].engagement` (likes + comments) |
| Engagement | Engagement rate | `posts[].engagement_rate` (% of followers) |
| Engagement | Saves, total interactions | `media insights` per post (sampled) |
| Conversion | Website clicks | `account_insights.website_clicks` |
| Conversion | Posting volume | `posts_in_period` |

## Month-over-Month Formula

```
variation_% = ((current - previous) / previous) * 100
```

Edge cases:
- `previous == 0` and `current > 0` → report as "new this period," not `+∞%`
- `previous == 0` and `current == 0` → report as "flat (0)"
- Round to 1 decimal place for display

## Derived Metrics

```
follower_growth        = current.followers_count - previous.followers_count
follower_growth_rate_%  = follower_growth / previous.followers_count * 100

avg_engagement_per_post = sum(posts[].engagement) / posts_in_period
avg_engagement_rate_%   = sum(posts[].engagement_rate) / posts_in_period

engagement_by_format = group posts by media_product_type (FEED/REELS/STORY),
                        average engagement_rate per group
```

## Insight Thresholds

Apply these to the MoM variation of each metric. A metric outside its
threshold band is a **flagged insight** — it must appear in the automated
insights section with the actual numbers, not just the direction.

| Bucket | Metric | Notable (flag) | Significant (headline) |
|--------|--------|-----------------|------------------------|
| Awareness | Reach | ±15% | ±30% |
| Awareness | Follower growth rate | ±10% | ±20% |
| Awareness | Profile views | ±15% | ±30% |
| Engagement | Avg engagement rate | ±20% | ±35% |
| Engagement | Avg engagement per post | ±20% | ±35% |
| Conversion | Website clicks | ±25% | ±40% |

"Significant" insights lead the executive summary. "Notable" insights go in
the detailed breakdown. Anything inside the band is reported factually
(the number and MoM delta) without being called out as an insight.

### Cross-metric signals worth flagging regardless of threshold

- **Reach up, engagement rate down**: content is reaching more people but
  resonating less — a targeting/algorithm reach vs. a content-quality issue.
- **Reach flat/down, engagement rate up**: smaller but more engaged audience
  — often a sign of niching down or a shift to higher-intent content.
- **Profile views up, website clicks flat/down**: bio/CTA friction — people
  are curious but not converting.
- **Follower growth flat/negative despite high engagement**: content is
  landing with existing followers but not converting new reach into follows
  — check discovery-format mix (Reels/Explore-driven posts).

## Top/Bottom Post Selection

- **Top performers**: top 3 posts by `engagement` (likes + comments) from
  the period. Pull `media insights` (`reach`, `saved`, `total_interactions`)
  for these to explain *why* they worked (reach-driven vs. save-driven vs.
  comment-driven).
- **Bottom performers**: bottom 2-3 posts by `engagement`, excluding posts
  published in the final 48 hours of the period (insights may still be
  settling — don't penalize a post for not having caught up yet).
- For each top/bottom post, note `media_type`/`media_product_type`, caption
  theme (from the truncated `caption` field), and timestamp — look for
  patterns (day of week, format, topic) across the set, not just single
  posts in isolation.

## Content-Format Comparison

Group `posts` by `media_product_type` and compare `avg_engagement_rate`
across REELS, FEED, and STORY (when present). Call out the best- and
worst-performing format for the period, and whether the posting mix
(% of posts per format) matches where engagement is concentrated — a
common finding is over-indexing on a format that underperforms, or
under-posting a format that's working.

## Narrative Templates

Use these as starting points, always filled with the real numbers — never
published as-is:

- **Reach growth**: "Reach grew {X}% MoM ({prev} → {current} accounts
  reached), {above/within/below} the account's typical range."
- **Engagement shift**: "Average engagement rate {rose/fell} {X}% MoM
  ({prev}% → {current}%), driven by {top post theme/format}."
- **Conversion**: "Website clicks {increased/decreased} {X}% MoM ({prev} →
  {current}), {consistent with / diverging from} the reach trend."
- **Content mix**: "{Format} posts averaged {X}% engagement rate vs.
  {Y}% for {other format}, despite making up only {Z}% of posts this month."
- **Recommendation**: always pair each flagged insight with one concrete,
  testable action for next month (format shift, posting cadence, CTA change,
  topic to double down on) — not a vague "keep doing what's working."
