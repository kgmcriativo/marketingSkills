# YouTube Insights

Public YouTube channel and video performance data via the YouTube Data API
v3 — subscriber count, total views, and per-video stats (views, likes,
comments). No OAuth required: all data pulled here is public and available
with a plain Google Cloud API key.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | YouTube Data API v3 |
| MCP | - | Not available |
| CLI | [✓](../clis/youtube-insights.js) | `youtube-insights.js` |
| SDK | ✓ | Official SDKs for Python, PHP, Node.js, Java |

## Authentication

- **Type**: API key (no OAuth needed for public data)
- **Setup**: In [Google Cloud Console](https://console.cloud.google.com/),
  create/select a project, enable **YouTube Data API v3**, then create an
  API key under Credentials. Optionally restrict the key to the YouTube Data
  API v3 to limit blast radius if it leaks.
- **Env var**: `YOUTUBE_API_KEY`
- **Quota**: Free tier is 10,000 units/day. `channels.list` and
  `videos.list` cost 1 unit each; `playlistItems.list` costs 1 unit per
  page (up to 50 items). A monthly report pull for one channel (~25-50
  videos) costs well under 100 units.

## CLI Usage

```bash
# Resolve a handle to a channel ID (do this once, then reuse --channel-id)
node tools/clis/youtube-insights.js channel resolve --handle "@somechannel"

# Channel profile + stats
node tools/clis/youtube-insights.js channel get --channel-id UCxxxxxxxx

# Recent videos in a date range, with view/like/comment counts
node tools/clis/youtube-insights.js videos list --channel-id UCxxxxxxxx --since 2026-07-01 --until 2026-07-31

# Stats for specific videos (comma-separated IDs, up to 50)
node tools/clis/youtube-insights.js videos insights --id VIDEO_ID1,VIDEO_ID2

# Everything at once — channel stats + videos in period with engagement
node tools/clis/youtube-insights.js report monthly --channel-id UCxxxxxxxx --month 2026-07
```

`report monthly` is the primary entry point for reporting workflows: channel
stats plus every video published in the period, with `engagement`
(likes + comments) computed and sorted descending. Without
`--month`/`--since`/`--until`, it defaults to the previous complete
calendar month.

Resolve a handle to a channel ID **once** with `channel resolve` rather than
passing `--handle` to every command — it saves a lookup on every call.

Every command supports `--dry-run` to preview the request without sending it.

## Common Agent Operations

### Resolve a channel by handle

```bash
GET https://www.googleapis.com/youtube/v3/channels?key={api_key}&part=snippet,statistics,contentDetails&forHandle=@somechannel
```

### Get channel statistics

```bash
GET https://www.googleapis.com/youtube/v3/channels?key={api_key}&part=snippet,statistics&id={channel_id}
```

### List recent uploads (via the channel's uploads playlist)

```bash
GET https://www.googleapis.com/youtube/v3/channels?key={api_key}&part=contentDetails&id={channel_id}
# -> contentDetails.relatedPlaylists.uploads
GET https://www.googleapis.com/youtube/v3/playlistItems?key={api_key}&part=contentDetails,snippet&playlistId={uploads_playlist_id}&maxResults=50
```

### Get video statistics (batch, up to 50 IDs)

```bash
GET https://www.googleapis.com/youtube/v3/videos?key={api_key}&part=snippet,statistics,contentDetails&id={video_id1,video_id2,...}
```

## Key Metrics

### Channel-level

| Metric | Description |
|--------|-------------|
| `subscriberCount` | Total subscribers (may be hidden by the channel owner — check `hiddenSubscriberCount`) |
| `viewCount` | Lifetime total views across the channel |
| `videoCount` | Total public videos |

### Video-level

| Metric | Description |
|--------|-------------|
| `viewCount` | Views on the video |
| `likeCount` | Likes (may be unavailable if the creator hides it) |
| `commentCount` | Comment count (0/absent if comments are disabled) |

## When to Use

- Monthly/periodic YouTube channel performance reporting
- Tracking subscriber growth and view trends over time
- Identifying top/bottom performing videos by engagement
- Feeding data into the `social-media-report` skill (Phase 2 automated
  platforms: Instagram, Facebook, YouTube)

## Verification Checklist (before first production use)

This CLI was written against the documented API spec but has not yet been
exercised against a real key (pending API key generation). Before relying
on it:

1. Run `channel resolve --handle @<known-channel>` and confirm the returned
   `channel_id` matches the channel's real ID (visible in YouTube Studio or
   the channel's "About" page).
2. Run `channel get --channel-id <id>` and sanity-check `subscriberCount`
   against the public subscriber count shown on the channel page.
3. Run `videos list --channel-id <id> --limit 5` and confirm the returned
   videos and view counts match what's visible on the channel's Videos tab.
4. If any step errors with `quotaExceeded`, `keyInvalid`, or
   `accessNotConfigured`, check that the YouTube Data API v3 is enabled for
   the Cloud project the key belongs to.

## Rate Limits

- 10,000 quota units/day on the free tier (see Authentication above)
- No per-second rate limit documented beyond quota exhaustion

## Relevant Skills

- social-media-report
- social
- analytics
