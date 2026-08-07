#!/usr/bin/env node
//
// YouTube Data API v3 — public channel/video data via a Google Cloud API key.
// No OAuth required: subscriber count, view count, and per-video stats are
// all public data available with a plain API key.
//
// NOTE: written against the documented YouTube Data API v3 spec. Verify the
// exact response shape against a real key before relying on it in production
// (see tools/integrations/youtube-insights.md for the verification checklist).

const API_KEY = process.env.YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

if (!API_KEY) {
  console.error(JSON.stringify({ error: 'YOUTUBE_API_KEY environment variable required' }))
  process.exit(1)
}

function parseArgs(args) {
  const result = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        result[key] = next
        i++
      } else {
        result[key] = true
      }
    } else {
      result._.push(arg)
    }
  }
  return result
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

async function api(path, params = {}) {
  const usp = new URLSearchParams({ ...params, key: API_KEY })
  const url = `${BASE_URL}${path}?${usp.toString()}`
  if (args['dry-run']) {
    return { _dry_run: true, method: 'GET', url: url.replace(API_KEY, '***') }
  }
  const res = await fetch(url)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

// ---- date helpers (shared pattern with meta-insights.js) ----

function pad(n) { return String(n).padStart(2, '0') }
function toISODate(d) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` }

function monthRange(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  const since = new Date(Date.UTC(y, m - 1, 1))
  const until = new Date(Date.UTC(y, m, 0))
  return { since: toISODate(since), until: toISODate(until) }
}

function previousMonthRange() {
  const now = new Date()
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  return monthRange(`${prev.getUTCFullYear()}-${pad(prev.getUTCMonth() + 1)}`)
}

function resolveDateRange() {
  if (args.since && args.until) return { since: args.since, until: args.until }
  if (args.month) return monthRange(args.month)
  return previousMonthRange()
}

// ---- channel resolution ----
// Accepts exactly one of --channel-id, --handle (e.g. "@somechannel"), or
// --username (legacy). Resolves to a channel ID + snippet + statistics.

async function resolveChannel() {
  if (args['channel-id']) {
    return api('/channels', { part: 'snippet,statistics,contentDetails', id: args['channel-id'] })
  }
  if (args.handle) {
    const handle = args.handle.startsWith('@') ? args.handle : `@${args.handle}`
    return api('/channels', { part: 'snippet,statistics,contentDetails', forHandle: handle })
  }
  if (args.username) {
    return api('/channels', { part: 'snippet,statistics,contentDetails', forUsername: args.username })
  }
  return { error: '--channel-id, --handle, or --username required' }
}

// ---- video list pagination ----
// Uploads playlist -> playlistItems -> batch videos.list for statistics.
// YouTube limits videos.list `id` to 50 per call.

async function fetchUploadsPlaylistId(channelId) {
  const res = await api('/channels', { part: 'contentDetails', id: channelId })
  if (res.error) return res
  const item = res.items && res.items[0]
  const playlistId = item && item.contentDetails && item.contentDetails.relatedPlaylists && item.contentDetails.relatedPlaylists.uploads
  if (!playlistId) return { error: 'Could not resolve uploads playlist for channel', channelId }
  return playlistId
}

async function fetchVideosInRange(channelId, { since, until, limit = 25, maxPages = 10 } = {}) {
  const playlistId = await fetchUploadsPlaylistId(channelId)
  if (playlistId && playlistId.error) return playlistId

  const sinceDate = since ? new Date(`${since}T00:00:00Z`) : null
  const untilDate = until ? new Date(`${until}T23:59:59Z`) : null

  const videoRefs = []
  let pageToken
  let pages = 0
  let hitEnd = false

  while (pages < maxPages) {
    const res = await api('/playlistItems', {
      part: 'contentDetails,snippet',
      playlistId,
      maxResults: 50,
      ...(pageToken ? { pageToken } : {}),
    })
    if (res.error) return res
    const items = res.items || []
    if (items.length === 0) break

    for (const item of items) {
      const publishedAt = item.contentDetails && item.contentDetails.videoPublishedAt
      const ts = publishedAt ? new Date(publishedAt) : null
      if (sinceDate && ts && ts < sinceDate) { hitEnd = true; break }
      if (untilDate && ts && ts > untilDate) continue
      videoRefs.push({ id: item.contentDetails.videoId, publishedAt })
      if (videoRefs.length >= limit) { hitEnd = true; break }
    }

    pages++
    pageToken = res.nextPageToken
    if (hitEnd || !pageToken) break
  }

  if (videoRefs.length === 0) return { data: [] }

  // Batch-fetch statistics for up to 50 video IDs per call.
  const videos = []
  for (let i = 0; i < videoRefs.length; i += 50) {
    const batch = videoRefs.slice(i, i + 50)
    const res = await api('/videos', { part: 'snippet,statistics,contentDetails', id: batch.map(v => v.id).join(',') })
    if (res.error) return res
    for (const v of res.items || []) {
      videos.push({
        id: v.id,
        title: v.snippet && v.snippet.title,
        publishedAt: v.snippet && v.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        view_count: Number((v.statistics && v.statistics.viewCount) || 0),
        like_count: Number((v.statistics && v.statistics.likeCount) || 0),
        comment_count: Number((v.statistics && v.statistics.commentCount) || 0),
      })
    }
  }

  return { data: videos }
}

async function main() {
  let result

  switch (cmd) {
    case 'channel':
      switch (sub) {
        case 'get':
          result = await resolveChannel()
          break
        case 'resolve': {
          const res = await resolveChannel()
          const item = res.items && res.items[0]
          result = item ? { channel_id: item.id, title: item.snippet && item.snippet.title } : { error: 'Channel not found', response: res }
          break
        }
        default:
          result = { error: 'Unknown channel subcommand. Use: get, resolve' }
      }
      break

    case 'videos':
      switch (sub) {
        case 'list': {
          if (!args['channel-id']) { result = { error: '--channel-id required (use `channel resolve` first if you only have a handle)' }; break }
          const limit = Number(args.limit) || 25
          result = await fetchVideosInRange(args['channel-id'], { since: args.since, until: args.until, limit })
          break
        }
        case 'insights': {
          if (!args.id) { result = { error: '--id required (comma-separated video IDs, up to 50)' }; break }
          result = await api('/videos', { part: 'snippet,statistics,contentDetails', id: args.id })
          break
        }
        default:
          result = { error: 'Unknown videos subcommand. Use: list, insights' }
      }
      break

    case 'report':
      switch (sub) {
        case 'monthly': {
          if (!args['channel-id']) { result = { error: '--channel-id required (use `channel resolve --handle @name` first if needed)' }; break }
          const { since, until } = resolveDateRange()
          const limit = Number(args.limit) || 25

          const [channelRes, videosRes] = await Promise.all([
            api('/channels', { part: 'snippet,statistics', id: args['channel-id'] }),
            fetchVideosInRange(args['channel-id'], { since, until, limit }),
          ])

          const channelItem = channelRes.items && channelRes.items[0]
          const stats = channelItem && channelItem.statistics
          const videos = (videosRes.data || []).map(v => ({
            ...v,
            engagement: v.like_count + v.comment_count,
          })).sort((a, b) => b.engagement - a.engagement)

          result = {
            channel_id: args['channel-id'],
            period: { since, until },
            channel: channelRes.error ? channelRes : (channelItem ? {
              title: channelItem.snippet && channelItem.snippet.title,
              subscriber_count: Number(stats && stats.subscriberCount),
              view_count: Number(stats && stats.viewCount),
              video_count: Number(stats && stats.videoCount),
              hidden_subscriber_count: !!(stats && stats.hiddenSubscriberCount),
            } : { error: 'Channel not found', response: channelRes }),
            videos_in_period: videosRes.error ? null : videos.length,
            videos: videosRes.error ? videosRes : videos,
          }
          break
        }
        default:
          result = { error: 'Unknown report subcommand. Use: monthly' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          channel: 'channel [get|resolve] [--channel-id <id>] [--handle @name] [--username <name>]',
          videos: 'videos [list|insights] [--channel-id <id>] [--limit 25] [--since <date>] [--until <date>] [--id <video-id,video-id2>]',
          report: 'report monthly --channel-id <id> [--month YYYY-MM] [--since <date>] [--until <date>] [--limit 25]',
          notes: 'Resolve a handle to a channel ID once with `channel resolve --handle @name`, then use --channel-id everywhere else (playlistItems/videos.list quota cost is lower than repeated handle lookups). Without --since/--until/--month, report defaults to the previous complete calendar month.',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
