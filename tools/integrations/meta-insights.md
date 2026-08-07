# Meta Insights (Instagram Business/Creator + Facebook Page)

Organic Instagram and Facebook Page performance data via the Graph API —
account profile, account-level insights (reach, profile views, website
clicks), per-post engagement, and the Facebook Page equivalents (fan count,
page insights, native posts). This is the organic counterpart to
[meta-ads.md](meta-ads.md), which covers paid campaigns.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Instagram Graph API (via a connected Facebook Page) |
| MCP | - | Not available |
| CLI | [✓](../clis/meta-insights.js) | `meta-insights.js` |
| SDK | ✓ | Official SDKs for Python, PHP, Node.js (shared with Meta Ads) |

## Authentication

- **Type**: OAuth 2.0 Access Token
- **Header**: `Authorization: Bearer {access_token}`
- **Setup**: The Instagram account must be a Business or Creator account
  connected to a Facebook Page. Generate a System User token (no expiration)
  in Meta Business Suite with `instagram_basic` and `instagram_manage_insights`
  permissions.
- **Env vars**: `META_ACCESS_TOKEN`, `META_IG_USER_ID` (the IG Business
  Account ID, not the Page ID — find it via `GET /{page-id}?fields=instagram_business_account`),
  `META_PAGE_ID` (the connected Facebook Page, for `page` subcommands and the
  `facebook_page` section of `report monthly`)
- **Page Insights caveat**: unlike Instagram, Facebook Page Insights and
  `/{page-id}/posts` require a **Page Access Token**, not the System User
  token directly. The CLI handles this automatically — it exchanges the
  System User token for a page token via `GET /{page-id}?fields=access_token`
  on first use and caches it for the run — but the token still needs the
  `pages_read_engagement` permission (or Page Public Content Access) granted
  for that Page, or `page posts` will return a permission error even though
  `page get`/`page insights` succeed.

## CLI Usage

```bash
# Account profile
node tools/clis/meta-insights.js account get

# Account-level insights for a specific month
node tools/clis/meta-insights.js account insights --month 2026-07

# Account-level insights for a custom date range
node tools/clis/meta-insights.js account insights --since 2026-07-01 --until 2026-07-31

# Recent posts with engagement (like_count, comments_count)
node tools/clis/meta-insights.js media list --limit 25

# Posts within a date range (client-side filtered, paginates as needed)
node tools/clis/meta-insights.js media list --since 2026-07-01 --until 2026-07-31

# Per-post insights (reach, saves, total interactions)
node tools/clis/meta-insights.js media insights --id {media_id}

# Facebook Page profile
node tools/clis/meta-insights.js page get

# Facebook Page insights for a month
node tools/clis/meta-insights.js page insights --month 2026-07

# Facebook Page native posts (requires pages_read_engagement / Page Public Content Access)
node tools/clis/meta-insights.js page posts --limit 25

# Everything at once — IG account + insights + posts, PLUS Facebook Page
# data when META_PAGE_ID is set, all in one command
node tools/clis/meta-insights.js report monthly --month 2026-07
```

`report monthly` is the primary entry point for reporting workflows: it
combines Instagram account profile, account insights, and the post list
(with `engagement` and `engagement_rate` computed per post), and — whenever
`META_PAGE_ID` (or `--page-id`) is available — a `facebook_page` section with
the same shape for the connected Page. Pass `--skip-page` to omit it.
Without `--month`/`--since`/`--until`, it defaults to the previous complete
calendar month.

Every command supports `--dry-run` to preview the request without sending it.

## Common Agent Operations

### Get account profile

```bash
GET https://graph.facebook.com/v21.0/{ig-user-id}?access_token={access_token}&fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website
```

### Get account insights

```bash
GET https://graph.facebook.com/v21.0/{ig-user-id}/insights?access_token={access_token}&metric=reach,profile_views,website_clicks&period=day&metric_type=total_value&since={since}&until={until}
```

### Get recent media

```bash
GET https://graph.facebook.com/v21.0/{ig-user-id}/media?access_token={access_token}&fields=id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink&limit=25
```

### Get per-post insights

```bash
GET https://graph.facebook.com/v21.0/{media-id}/insights?access_token={access_token}&metric=reach,total_interactions,saved
```

### Get Facebook Page profile

```bash
GET https://graph.facebook.com/v21.0/{page-id}?access_token={access_token}&fields=id,name,category,fan_count,followers_count,link
```

### Exchange for a Page Access Token (required for page insights/posts)

```bash
GET https://graph.facebook.com/v21.0/{page-id}?access_token={system_user_token}&fields=access_token
```

### Get Facebook Page insights

```bash
GET https://graph.facebook.com/v21.0/{page-id}/insights?access_token={page_access_token}&metric=page_post_engagements,page_views_total,page_video_views&period=day&since={since}&until={until}
```

### Get Facebook Page posts

```bash
GET https://graph.facebook.com/v21.0/{page-id}/posts?access_token={page_access_token}&fields=id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares
```

## Key Metrics

### Account-level (`account insights`)

| Metric | Description |
|--------|-------------|
| `reach` | Unique accounts that saw any content |
| `profile_views` | Number of times the profile was visited |
| `website_clicks` | Taps on the website link in bio |
| `accounts_engaged` | Unique accounts that engaged with content |
| `total_interactions` | Likes + comments + saves + shares, aggregate |

### Post-level (`media list` / `media insights`)

| Metric | Description |
|--------|-------------|
| `like_count`, `comments_count` | From `media list`, always available |
| `reach` | Unique accounts that saw this post |
| `saved` | Number of saves |
| `total_interactions` | Likes + comments + saves + shares for this post |

Note: available metrics vary by `media_type`/`media_product_type` (FEED,
REELS, STORY, CAROUSEL_ALBUM). If a metric errors out for a given post,
drop it and retry with a smaller metric set.

### Facebook Page (`page get` / `page insights` / `page posts`)

| Metric | Description |
|--------|-------------|
| `fan_count`, `followers_count` | From `page get`, always available |
| `page_post_engagements` | Total engagements on the Page's posts |
| `page_views_total` | Page profile views |
| `page_video_views` | Video views on Page content |

Meta deprecates/renames Page Insights metrics frequently — the three above
are confirmed valid as of the API version in this doc. If the API returns
`"The value must be a valid insights metric"`, drop the offending metric
and check the [current Page Insights metric list](https://developers.facebook.com/docs/graph-api/reference/page/insights/)
for its replacement.

## When to Use

- Monthly/weekly social media performance reporting
- Tracking follower growth and account-level reach trends
- Identifying top/bottom performing posts by engagement
- Feeding data into the `social-media-report` skill

## Rate Limits

- Standard Graph API rate limiting applies (based on app usage tier)
- Insights data can lag up to 48 hours for some metrics

## Relevant Skills

- social-media-report
- social
- analytics
