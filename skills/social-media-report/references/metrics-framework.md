# Metrics Framework & Insight Thresholds

This extends the `social` skill's Analytics & Optimization metrics
(Awareness / Engagement / Conversion) into concrete formulas and thresholds
for automated monthly insight generation across all platforms in the
report: Instagram + Facebook (`meta-insights.js`), Meta Ads
(`meta-ads.js`), YouTube (`youtube-insights.js`), and the Phase 1 manual
platforms (TikTok, LinkedIn, Google Meu Negócio — see
[manual-data-template.md](manual-data-template.md)).

Two comparisons are standard for every metric below: **month-over-month
(MoM)**, against the prior calendar month, and **year-over-year (YoY)**,
against the same calendar month one year back. Compute and report both —
never drop the less flattering one. The report's own text stays in
Portuguese (Alcance, not Reach) even though the field names below are the
API's English names; see SKILL.md's terminology rule.

## Data Sources

### Instagram (`meta-insights.js report monthly`)

| Bucket | Metric | Source field |
|--------|--------|-------------|
| Awareness | Reach | `account_insights.reach` |
| Awareness | Follower count (snapshot only — see note below) | `account.followers_count` |
| Awareness | Profile views | `account_insights.profile_views` |
| Engagement | Per-post engagement | `posts[].engagement` (likes + comments) |
| Engagement | Engagement rate | `posts[].engagement_rate` (% of followers) |
| Engagement | Saves, total interactions | `media insights` per post (sampled) |
| Conversion | Website clicks | `account_insights.website_clicks` |
| Conversion | Posting volume | `posts_in_period` |

**Followers is a snapshot, not a time series.** `account.followers_count`
reflects the account's *current* follower count regardless of which
`--month` you pass — pulling June and July both return today's number.
There is no MoM/YoY variation to compute from this field; report it as a
current value only, and don't fabricate a delta. Recovering real follower
growth requires the report generator to snapshot `followers_count` at
generation time each month and diff against its own prior snapshot — not
something the Graph API provides retroactively.

### Meta Ads (`meta-ads.js`)

| Bucket | Metric | Source |
|--------|--------|--------|
| Conversion | Spend | `campaigns insights` → `spend` |
| Conversion | Impressions | `campaigns insights` → `impressions` |
| Conversion | Results (link clicks, leads, etc. — depends on campaign objective) | `campaigns insights` → `actions[]`, filter by the objective's primary action type |
| Conversion | Cost per result | `campaigns insights` → `cost_per_action_type[]`, or compute `spend / results` |
| Awareness | Reach (per campaign — don't sum across campaigns, audiences overlap) | `campaigns insights` → `reach` |

Discover accounts with `meta-ads.js accounts list`; if empty, verify
whether the gap is "no account" or "account exists, missing `ads_read`/
`ads_management`" before writing either into the report (see SKILL.md
Etapa 2). Only include campaigns with actual spend in the period —
`campaigns list` returns every campaign ever created, most of them paused;
`campaigns insights` (or the account-level `/insights?level=campaign`
Graph API call) only returns rows with real delivery in the date range.

### Facebook Page (`meta-insights.js report monthly` → `facebook_page`)

| Bucket | Metric | Source field |
|--------|--------|-------------|
| Awareness | Fan/follower count | `facebook_page.page.fan_count` / `.followers_count` |
| Awareness | Page views | `facebook_page.page_insights.page_views_total` |
| Engagement | Post engagements | `facebook_page.page_insights.page_post_engagements` |
| Engagement | Per-post engagement | `facebook_page.posts[].engagement` (likes + comments + shares) |
| Awareness | Video views | `facebook_page.page_insights.page_video_views` |

Note: `facebook_page.posts` requires the `pages_read_engagement` permission
on the token — if it returns an `error`, report Page-level metrics only and
note the gap rather than fabricating post-level Facebook data.

### YouTube (`youtube-insights.js report monthly`)

| Bucket | Metric | Source field |
|--------|--------|-------------|
| Awareness | Subscriber count | `channel.subscriber_count` |
| Awareness | Lifetime view count | `channel.view_count` |
| Engagement | Per-video engagement | `videos[].engagement` (likes + comments) |
| Engagement | Per-video views | `videos[].view_count` |
| Conversion | Posting volume | `videos_in_period` |

### Phase 1 manual platforms (TikTok, LinkedIn, Google Meu Negócio)

Read via the `xlsx` skill per
[manual-data-template.md](manual-data-template.md). Map each row's
`metrica`/`valor_mes_atual`/`valor_mes_anterior` into the same Awareness /
Engagement / Conversion buckets used above (e.g., TikTok followers →
Awareness, TikTok likes/comments/shares → Engagement, GMB profile actions →
Conversion) so the same MoM formula and insight-writing approach applies
uniformly across every platform in the report.

## Month-over-Month and Year-over-Year Formula

Same formula for both — only the baseline period changes (prior calendar
month for MoM, same calendar month one year back for YoY):

```
variation_% = ((current - previous) / previous) * 100
```

Edge cases:
- `previous == 0` and `current > 0` → report as "new this period," not `+∞%`
- `previous == 0` and `current == 0` → report as "flat (0)"
- Round to 1 decimal place for display

Compute both for every applicable metric and show them side by side (see
report-template.md's 3-period comparison table). MoM-only reporting can
paint a misleadingly rosy picture — a real case: reach was +167.7% MoM but
-23.6% YoY, because the account's posting cadence still hadn't recovered to
its year-ago level. The YoY number was the more important story that month.

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

Apply these to both the MoM and YoY variation of each metric — a metric can
be flagged on one and not the other, and that divergence is itself often
the headline (see the reach example above). A metric outside its threshold
band is a **flagged insight** — it must appear in the automated insights
section with the actual numbers, not just the direction.

| Bucket | Metric | Notable (flag) | Significant (headline) |
|--------|--------|-----------------|------------------------|
| Awareness | Reach | ±15% | ±30% |
| Awareness | Profile views | ±15% | ±30% |
| Engagement | Avg engagement rate | ±20% | ±35% |
| Engagement | Avg engagement per post | ±20% | ±35% |
| Conversion | Website clicks | ±25% | ±40% |
| Conversion | Ad spend / results / CPC | ±25% | ±40% |

(Follower growth rate dropped from this table — see the snapshot-only note
above; there's no MoM/YoY delta to threshold.)

"Significant" insights lead the executive summary. "Notable" insights go in
the detailed breakdown. Anything inside the band is reported factually
(the number and MoM/YoY delta) without being called out as an insight.

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

### Before calling a low-engagement post an outlier/"test"

Cross-check it against Meta Ads campaigns for the same period (match on
caption text — boosted-post campaign names are usually the post's own
caption, truncated). A post with near-zero *organic* engagement can still
be a real, working campaign if it was boosted — its result lives in spend/
clicks/reach from the ad, not in the organic like count. Confirmed case:
a Reel with 10 organic likes turned out to be a R$125 boosted campaign
with 29K impressions and 838 link clicks — the "it flopped" read was
simply wrong. Only call something a test/anomaly once you've checked and
found no matching campaign.

## Content-Format Comparison

Instagram-specific (Facebook/YouTube don't expose an equivalent format
breakdown at this data granularity). Group `posts` by `media_product_type`
and compare `avg_engagement_rate`
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
- **YoY divergence**: "{Metric} {rose/fell} {X}% MoM but is still {Y}%
  {above/below} {same month, prior year} ({prev_yoy} → {current}) —
  {plausible driver, e.g. posting cadence, seasonal event}."
- **Ads result**: "Campaign '{name}' spent R$ {spend} for {results} {result
  type} (R$ {cpc} per result), {X}% {more/less} efficient than '{other
  campaign}' (R$ {other_cpc})."
- **Recommendation**: always pair each flagged insight with one concrete,
  testable action for next month (format shift, posting cadence, CTA change,
  budget reallocation between campaigns, topic to double down on) — not a
  vague "keep doing what's working."
