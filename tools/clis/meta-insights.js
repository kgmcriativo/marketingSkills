#!/usr/bin/env node

const TOKEN = process.env.META_ACCESS_TOKEN
const DEFAULT_IG_USER_ID = process.env.META_IG_USER_ID
const DEFAULT_PAGE_ID = process.env.META_PAGE_ID
const BASE_URL = 'https://graph.facebook.com/v21.0'

if (!TOKEN) {
  console.error(JSON.stringify({ error: 'META_ACCESS_TOKEN environment variable required' }))
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
const [cmd, sub, ...rest] = args._

async function api(method, path, body, token = TOKEN) {
  const url = `${BASE_URL}${path}`
  const opts = {
    method,
    headers: { Authorization: `Bearer ${token}` },
  }
  if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  if (args['dry-run']) {
    return { _dry_run: true, method, url, headers: { ...opts.headers, Authorization: '***' }, body: body || undefined }
  }
  const res = await fetch(url, opts)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

function getIgUserId() {
  return args['ig-user-id'] || DEFAULT_IG_USER_ID
}

function getPageId() {
  return args['page-id'] || DEFAULT_PAGE_ID
}

// Page-level insights/posts endpoints require a Page Access Token, not the
// System User token directly. Exchange it once per run and cache it.
let pageTokenCache
async function getPageAccessToken(pageId) {
  if (pageTokenCache) return pageTokenCache
  const res = await api('GET', `/${pageId}?fields=access_token`)
  if (res.error) return res
  pageTokenCache = res.access_token
  return pageTokenCache
}

// ---- date helpers ----

function pad(n) { return String(n).padStart(2, '0') }
function toISODate(d) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` }

// Returns { since, until } (YYYY-MM-DD, inclusive) for a "YYYY-MM" string.
function monthRange(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  const since = new Date(Date.UTC(y, m - 1, 1))
  const until = new Date(Date.UTC(y, m, 0)) // last day of month
  return { since: toISODate(since), until: toISODate(until) }
}

// Previous complete calendar month relative to now.
function previousMonthRange() {
  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth() // 0-indexed current month
  const prev = new Date(Date.UTC(y, m - 1, 1))
  return monthRange(`${prev.getUTCFullYear()}-${pad(prev.getUTCMonth() + 1)}`)
}

function resolveDateRange() {
  if (args.since && args.until) return { since: args.since, until: args.until }
  if (args.month) return monthRange(args.month)
  return previousMonthRange()
}

// ---- media pagination ----

async function fetchMediaPage(igUserId, fields, limit, after) {
  let path = `/${igUserId}/media?fields=${fields}&limit=${limit}`
  if (after) path += `&after=${after}`
  return api('GET', path)
}

// Fetches media newest-first, stopping once items fall before `since` or
// the requested `limit`/page cap is hit. Media edge has no native date
// filter, so filtering by timestamp happens client-side.
async function fetchMediaInRange(igUserId, { since, until, limit = 50, maxPages = 10 } = {}) {
  const fields = 'id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink'
  const sinceDate = since ? new Date(`${since}T00:00:00Z`) : null
  const untilDate = until ? new Date(`${until}T23:59:59Z`) : null

  const items = []
  let after
  let pages = 0
  let hitEnd = false

  while (pages < maxPages) {
    const page = await fetchMediaPage(igUserId, fields, Math.min(limit, 50), after)
    if (page.error) return page
    const data = page.data || []
    if (data.length === 0) break

    for (const item of data) {
      const ts = new Date(item.timestamp)
      if (sinceDate && ts < sinceDate) { hitEnd = true; break }
      if (untilDate && ts > untilDate) continue
      items.push(item)
      if (items.length >= limit) { hitEnd = true; break }
    }

    pages++
    after = page.paging && page.paging.cursors && page.paging.next ? page.paging.cursors.after : undefined
    if (hitEnd || !after) break
  }

  return { data: items }
}

// ---- page posts pagination (mirrors fetchMediaInRange) ----

async function fetchPagePostsInRange(pageId, pageToken, { since, until, limit = 50, maxPages = 10 } = {}) {
  const fields = 'id,message,created_time,permalink_url,likes.summary(true).limit(0),comments.summary(true).limit(0),shares'
  const sinceDate = since ? new Date(`${since}T00:00:00Z`) : null
  const untilDate = until ? new Date(`${until}T23:59:59Z`) : null

  const items = []
  let after
  let pages = 0
  let hitEnd = false

  while (pages < maxPages) {
    let path = `/${pageId}/posts?fields=${fields}&limit=${Math.min(limit, 50)}`
    if (after) path += `&after=${after}`
    const page = await api('GET', path, undefined, pageToken)
    if (page.error) return page
    const data = page.data || []
    if (data.length === 0) break

    for (const item of data) {
      const ts = new Date(item.created_time)
      if (sinceDate && ts < sinceDate) { hitEnd = true; break }
      if (untilDate && ts > untilDate) continue
      items.push(item)
      if (items.length >= limit) { hitEnd = true; break }
    }

    pages++
    after = page.paging && page.paging.cursors && page.paging.next ? page.paging.cursors.after : undefined
    if (hitEnd || !after) break
  }

  return { data: items }
}

function normalizePagePost(item) {
  const likes = (item.likes && item.likes.summary && item.likes.summary.total_count) || 0
  const comments = (item.comments && item.comments.summary && item.comments.summary.total_count) || 0
  const shares = (item.shares && item.shares.count) || 0
  return {
    id: item.id,
    created_time: item.created_time,
    permalink_url: item.permalink_url,
    message: item.message ? item.message.slice(0, 140) : null,
    like_count: likes,
    comments_count: comments,
    share_count: shares,
    engagement: likes + comments + shares,
  }
}

async function main() {
  let result

  switch (cmd) {
    case 'account':
      switch (sub) {
        case 'get': {
          const igUserId = getIgUserId()
          if (!igUserId) { result = { error: '--ig-user-id required (or set META_IG_USER_ID)' }; break }
          const fields = args.fields || 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website'
          result = await api('GET', `/${igUserId}?fields=${fields}`)
          break
        }
        case 'insights': {
          const igUserId = getIgUserId()
          if (!igUserId) { result = { error: '--ig-user-id required (or set META_IG_USER_ID)' }; break }
          const { since, until } = resolveDateRange()
          const metrics = args.metrics || 'reach,profile_views,website_clicks'
          const period = args.period || 'day'
          const metricType = args['metric-type'] || 'total_value'
          result = await api(
            'GET',
            `/${igUserId}/insights?metric=${metrics}&period=${period}&metric_type=${metricType}&since=${since}&until=${until}`
          )
          break
        }
        default:
          result = { error: 'Unknown account subcommand. Use: get, insights' }
      }
      break

    case 'media':
      switch (sub) {
        case 'list': {
          const igUserId = getIgUserId()
          if (!igUserId) { result = { error: '--ig-user-id required (or set META_IG_USER_ID)' }; break }
          const limit = Number(args.limit) || 25
          if (args.since || args.until) {
            result = await fetchMediaInRange(igUserId, { since: args.since, until: args.until, limit })
          } else {
            const fields = args.fields || 'id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink'
            result = await fetchMediaPage(igUserId, fields, limit, args.after)
          }
          break
        }
        case 'insights': {
          if (!args.id) { result = { error: '--id required' }; break }
          const metrics = args.metrics || 'reach,total_interactions,saved'
          result = await api('GET', `/${args.id}/insights?metric=${metrics}`)
          break
        }
        default:
          result = { error: 'Unknown media subcommand. Use: list, insights' }
      }
      break

    case 'page':
      switch (sub) {
        case 'get': {
          const pageId = getPageId()
          if (!pageId) { result = { error: '--page-id required (or set META_PAGE_ID)' }; break }
          const fields = args.fields || 'id,name,category,fan_count,followers_count,link'
          result = await api('GET', `/${pageId}?fields=${fields}`)
          break
        }
        case 'insights': {
          const pageId = getPageId()
          if (!pageId) { result = { error: '--page-id required (or set META_PAGE_ID)' }; break }
          const pageToken = await getPageAccessToken(pageId)
          if (pageToken.error) { result = pageToken; break }
          const { since, until } = resolveDateRange()
          // Meta deprecates/renames Page Insights metrics frequently. These
          // three are confirmed valid as of the API version above; adjust if
          // the API returns "must be a valid insights metric".
          const metrics = args.metrics || 'page_post_engagements,page_views_total,page_video_views'
          const period = args.period || 'day'
          result = await api(
            'GET',
            `/${pageId}/insights?metric=${metrics}&period=${period}&since=${since}&until=${until}`,
            undefined,
            pageToken
          )
          break
        }
        case 'posts': {
          const pageId = getPageId()
          if (!pageId) { result = { error: '--page-id required (or set META_PAGE_ID)' }; break }
          const pageToken = await getPageAccessToken(pageId)
          if (pageToken.error) { result = pageToken; break }
          const limit = Number(args.limit) || 25
          result = await fetchPagePostsInRange(pageId, pageToken, { since: args.since, until: args.until, limit })
          break
        }
        default:
          result = { error: 'Unknown page subcommand. Use: get, insights, posts' }
      }
      break

    case 'report':
      switch (sub) {
        case 'monthly': {
          const igUserId = getIgUserId()
          if (!igUserId) { result = { error: '--ig-user-id required (or set META_IG_USER_ID)' }; break }
          const { since, until } = resolveDateRange()
          const limit = Number(args.limit) || 50
          const metrics = args.metrics || 'reach,profile_views,website_clicks'

          const [account, insights, media] = await Promise.all([
            api('GET', `/${igUserId}?fields=id,username,name,followers_count,follows_count,media_count,profile_picture_url`),
            api('GET', `/${igUserId}/insights?metric=${metrics}&period=day&metric_type=total_value&since=${since}&until=${until}`),
            fetchMediaInRange(igUserId, { since, until, limit }),
          ])

          const followers = account.followers_count || 0
          const posts = (media.data || []).map(item => {
            const likes = item.like_count || 0
            const comments = item.comments_count || 0
            return {
              id: item.id,
              media_type: item.media_type,
              media_product_type: item.media_product_type,
              timestamp: item.timestamp,
              permalink: item.permalink,
              caption: item.caption ? item.caption.slice(0, 140) : null,
              like_count: likes,
              comments_count: comments,
              engagement: likes + comments,
              engagement_rate: followers ? Number(((likes + comments) / followers * 100).toFixed(2)) : null,
            }
          })

          result = {
            ig_user_id: igUserId,
            period: { since, until },
            account: account.error ? account : {
              username: account.username,
              name: account.name,
              followers_count: account.followers_count,
              follows_count: account.follows_count,
              media_count: account.media_count,
            },
            account_insights: insights.error ? insights : (insights.data || []).reduce((acc, m) => {
              acc[m.name] = m.total_value ? m.total_value.value : (m.values ? m.values[0].value : null)
              return acc
            }, {}),
            posts_in_period: posts.length,
            posts: posts.sort((a, b) => b.engagement - a.engagement),
          }

          // Facebook Page data is optional — included whenever a page ID is
          // available, since it's the "equivalent" dataset for the same report.
          const pageId = args['skip-page'] ? null : getPageId()
          if (pageId) {
            const pageToken = await getPageAccessToken(pageId)
            if (pageToken.error) {
              result.facebook_page = { error: pageToken.error }
            } else {
              const pageMetrics = args['page-metrics'] || 'page_post_engagements,page_views_total,page_video_views'
              const [page, pageInsights, pagePosts] = await Promise.all([
                api('GET', `/${pageId}?fields=id,name,category,fan_count,followers_count`, undefined, pageToken),
                api('GET', `/${pageId}/insights?metric=${pageMetrics}&period=day&since=${since}&until=${until}`, undefined, pageToken),
                fetchPagePostsInRange(pageId, pageToken, { since, until, limit }),
              ])

              const normalizedPosts = Array.isArray(pagePosts.data)
                ? pagePosts.data.map(normalizePagePost).sort((a, b) => b.engagement - a.engagement)
                : []

              result.facebook_page = {
                page_id: pageId,
                page: page.error ? page : {
                  name: page.name,
                  category: page.category,
                  fan_count: page.fan_count,
                  followers_count: page.followers_count,
                },
                page_insights: pageInsights.error ? pageInsights : (pageInsights.data || []).reduce((acc, m) => {
                  acc[m.name] = m.values && m.values.length
                    ? m.values.reduce((sum, v) => sum + (typeof v.value === 'number' ? v.value : 0), 0)
                    : null
                  return acc
                }, {}),
                posts_in_period: pagePosts.error ? null : normalizedPosts.length,
                posts: pagePosts.error ? pagePosts : normalizedPosts,
              }
            }
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
          account: 'account [get|insights] [--ig-user-id <id>] [--metrics reach,profile_views,website_clicks] [--period day] [--metric-type total_value] [--since <date>] [--until <date>] [--month YYYY-MM]',
          media: 'media [list|insights] [--ig-user-id <id>] [--limit 25] [--after <cursor>] [--since <date>] [--until <date>] [--id <media-id>] [--metrics reach,total_interactions,saved]',
          page: 'page [get|insights|posts] [--page-id <id>] [--metrics page_post_engagements,page_views_total,page_video_views] [--period day] [--since <date>] [--until <date>] [--month YYYY-MM] [--limit 25]',
          report: 'report monthly [--ig-user-id <id>] [--page-id <id>] [--skip-page] [--month YYYY-MM] [--since <date>] [--until <date>] [--limit 50]',
          notes: 'Without --since/--until/--month, account/page insights and report default to the previous complete calendar month. report monthly includes Facebook Page data automatically when META_PAGE_ID (or --page-id) is set; pass --skip-page to omit it.',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
