# Meta Insights (Instagram Business/Creator)

Organic Instagram performance data via the Instagram Graph API — account
profile, account-level insights (reach, profile views, website clicks), and
per-post engagement. This is the organic counterpart to [meta-ads.md](meta-ads.md),
which covers paid campaigns.

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
  Account ID, not the Page ID — find it via `GET /{page-id}?fields=instagram_business_account`)

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

# Everything at once — account + insights + posts with engagement, for one command
node tools/clis/meta-insights.js report monthly --month 2026-07
```

`report monthly` is the primary entry point for reporting workflows: it
combines account profile, account insights, and the post list (with
`engagement` and `engagement_rate` computed per post) into a single JSON
payload. Without `--month`/`--since`/`--until`, it defaults to the previous
complete calendar month.

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
