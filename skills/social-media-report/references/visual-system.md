# Visual System — Dashboard

The validated design system behind the dashboard, built and screenshot-QA'd
against a real client render (Dra Cristina Raposo, July 2026). Don't
re-derive this from scratch each time — start from
[assets/dashboard-skeleton.html](../assets/dashboard-skeleton.html), fill in
the client's data, and run `assets/build-dashboard.js` to produce the final
file.

## Why this system

Built following the `dataviz` and `artifact-design` skills, treated as a UI
(scanned, not read top-to-bottom) rather than an editorial page. Two
deliberate choices worth keeping when adapting for a new client:

- **Not warm-cream-plus-serif.** The generic "AI dashboard" look is warm
  cream background + serif display + terracotta accent. This system uses a
  cool sage-tinted off-white (not cream) and reserves the serif for the
  hero number only — everything else is a clean grotesk. If you reskin for
  a client's brand colors, keep that same restraint: one characterful
  display moment, not serif headings everywhere.
- **A real hero, not a KPI-tile wall.** The single most important number of
  the month (usually Alcance/reach, but let the data decide via the
  "significant" threshold in metrics-framework.md) gets a full-width dark
  band with a huge number — everything else is secondary. The first
  version of this dashboard was an even grid of same-size cards and read as
  flat/generic; the hero fixed that.

## Color tokens

Defined as CSS custom properties in the skeleton's `:root` (light) and
`:root[data-theme="dark"]` / `@media (prefers-color-scheme: dark)` blocks —
see [artifact-design](../../../skills) conventions for why both are needed.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--accent` | `#0d9488` | `#33b0a0` | Teal — primary identity color (Feed/Carrossel in format bars, section numerals, links) |
| `--accent-2` | `#c2542d` | `#dd7c49` | Coral — secondary identity color (Reels in format bars) |
| `--good` / `--critical` / `--warn` | `#2e7d4f` / `#b23a32` / `#a3701a` | `#55b57e` / `#e2776a` / `#d6ab49` | Status colors — MoM/YoY up/down pills, insight card left-borders. Reserved; never reused as a 3rd categorical hue. |
| `--bg` | `#f1f4f2` | `#0d1512` | Page ground — cool sage-tinted, not warm cream |
| `--hero-bg` / `--hero-bg-2` | `#0f2620` / `#123a30` | `#0a2620` / `#164a3d` | Hero gradient — deliberately more saturated than `--bg` in dark mode so the hero still reads as a spotlight against a similarly-dark page (a real bug in v1-v3: hero and page background were nearly identical in dark mode, and the hero disappeared) |

**Accent/coral pair validated** via the `dataviz` skill's
`scripts/validate_palette.js` for both light and dark surfaces — teal alone
originally failed the chroma floor (read as gray) and had to be pushed more
saturated (`#0d9488` / `#33b0a0`); re-run the validator if you change either
color, don't eyeball it.

**If a client has brand colors**: swap `--accent`/`--accent-2` (and their
`-soft` variants, and the hero tokens) for theirs, but validate first —
```bash
node <dataviz-skill-path>/scripts/validate_palette.js "<hex1,hex2>" --mode light
node <dataviz-skill-path>/scripts/validate_palette.js "<hex1,hex2>" --mode dark
```
If the client's colors fail chroma/lightness/CVD checks, snap to the
nearest passing step per the dataviz skill's method — don't ship a failing
palette just because it matches the client's logo.

## Typography

- **Display (hero number, section numerals only)**: Fraunces, weights 600
  and 700. Used sparingly — one moment per page, not every heading.
- **Body/UI (everything else — labels, KPI values, table cells, insight
  text)**: IBM Plex Sans, weights 400/500/600/700. Chosen for a slightly
  technical/clinical character appropriate to a data report, with real
  tabular figures (`font-variant-numeric: tabular-nums` is set on `body`).

### Why embedded, not linked

The Artifact CSP blocks font CDN requests — a `<link>` to Google Fonts
silently falls back to the browser default and the page looks like nothing
was chosen. Both faces are embedded as base64 `@font-face` data URIs
directly in the skeleton's `<style>` block. Total cost: ~180KB across 6
files, well inside the 16MB Artifact budget.

### How the font files were obtained (repeat this for a new face)

Google's CSS2 API serves different files per unicode-range subset; for
Portuguese content you only need the `latin` subset (covers `á é í ó ú ã õ
â ê ô ü ç` — all within U+0000–00FF). Request **one weight per query** —
requesting multiple weights in one query (`wght@400;600;700`) can silently
collapse to a single static instance depending on the family; single-weight
queries reliably return distinct per-weight files.

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"

# 1. Get the CSS for one weight, extract the `latin` block's woff2 URL
curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=<Family+Name>:wght@600&display=swap" \
  | grep -A9 "/\* latin \*/" | grep -o "https://fonts.gstatic.com[^)]*woff2"

# 2. Download it
curl -s -A "$UA" "<url from step 1>" -o family-600.woff2

# 3. Base64-encode for embedding (no line wraps)
base64 -w0 family-600.woff2 > family-600.b64
```

The Google Fonts CDN host (`fonts.googleapis.com`, `fonts.gstatic.com`) is
generally reachable — unlike Instagram/Facebook's own CDN hosts, which are
often blocked by egress policy in sandboxed environments (see thumbnails
note below). If it isn't reachable in your environment, fall back to a
considered system-font stack instead of a broken embed — never ship a
`@font-face` pointing at an unreachable URL.

The `-A "$UA"`  (a desktop Chrome user agent) matters: without it, Google's
CSS2 endpoint may serve older formats (ttf/eot) instead of woff2.

The 6 files already fetched for this skill's default type pair live in
[assets/fonts/](../assets/fonts/) as `.b64` text files — reuse them as-is
for any client using this default system; only re-fetch if you change the
type pair.

## Post thumbnails — a real environment limitation

Instagram media URLs (`media_url`, `thumbnail_url` from `meta-insights.js`)
point at `*.cdninstagram.com` / `*.fbcdn.net`. Two things to know:

1. **Never hotlink them in the Artifact.** The CSP blocks remote image
   requests — a bare `<img src="https://scontent-...">` simply won't load.
   Download the bytes and embed as a `data:image/jpeg;base64,...`
   background-image or `<img src="data:...">`, the same pattern as the
   fonts above.
2. **Some sandboxed sessions can't reach those CDN hosts at all** — verified
   in this skill's own build session: `graph.facebook.com` (the API) was
   reachable, but `scontent-*.cdninstagram.com` and `*.fbcdn.net` returned
   403 from the egress proxy. If `curl` to a `media_url` fails with a
   connect/403 error, don't retry or route around it — fall back to the
   `.post-thumb` gradient+icon placeholder already in the skeleton (format
   tag + rank badge, colored by `feed`/`reels`), and say so explicitly in
   the footer limitations. Don't leave the post card looking broken or
   silently ship a placeholder without explaining it's a placeholder.

## Layout pattern

Numbered sections (`01`, `02`, ...), Fraunces numeral + uppercase Plex Sans
label. Renumber sequentially if a section is omitted for missing data —
never leave a gap (e.g. `01, 02, 04` because `03` had no data) or reuse a
number across two different sections.

Standard section order (mirrors
[report-template.md](report-template.md)): hero → panorama/KPI grid →
3-period comparison table (MoM + YoY) → engagement → content format → top
posts → Facebook → Ads → automated insights → footer. Omit Facebook/Ads/
YouTube/Fase-1 sections entirely (don't renumber around a gap silently —
just compact the numbering) when there's genuinely nothing to show, but
always explain the omission in the footer.

## Rules that produced real corrections during QA — don't regress these

1. **Every number needs its unit and a one-line explainer attached directly
   under it** (`.kpi-explain`, `.card-sub`, `.stat-block-explain`) — not
   only in the footer. A first draft that showed "434,5" with no unit was
   confusing (is that people? a percentage? thousands?) — every number
   answers "what does this measure" without the reader having to hunt.
2. **Use Portuguese terms in the report**, even when the underlying API
   field is English — "Alcance" not "Reach", etc. The data layer
   (`meta-insights.js` output) stays in English field names; only the
   report copy is translated.
3. **Before labeling a low-engagement post a "test" or an anomaly, check
   section 07 (Ads) for a matching campaign.** A real case from this
   skill's build: three Reels published the same day with near-zero
   organic engagement looked like test posts — one of them turned out to
   be a boosted ad (paid results, not organic), which completely changes
   the story. Cross-reference before concluding.
4. **Screenshot both themes and mobile width before calling a dashboard
   done.** Two real bugs only showed up this way: the mobile header
   wrapped text on top of itself, and the dark-mode hero blended into the
   page background because its color was too close to `--bg`. Neither was
   visible from reading the HTML/CSS source.
5. **Strip internal-review language before the client sees the link.**
   Building this dashboard iteratively (review → feedback → revise) left
   "Prévia interna" in the header and "não é o entregável final" in the
   footer — harmless during internal review, but confusing and
   unprofessional once the same link was handed to the client. Before
   sharing, grep the built HTML for "prévia"/"rascunho"/"draft"/"interna"
   and remove anything that shouldn't be client-facing.
6. **Every post card gets a link to the real post, thumbnail or not.**
   Added `.post-card-link` (the post's `permalink`) after realizing the
   footer note claimed "links to the real post" while the cards had no
   actual link — an unverified claim in the deliverable itself. It's also
   the cheapest way to compensate for a placeholder thumbnail: the client
   can always click through and see the real image on Instagram.

## How to screenshot for QA

Chromium is pre-installed in Claude Code web/CLI sessions
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`); `playwright-core` (not the
full `playwright` package with its own browser download) drives it:

```bash
npm install playwright-core --no-save --silent
node -e "
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, colorScheme: 'light' });
  await page.goto('file://' + path.resolve('output.html'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'shot-light.png', fullPage: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'shot-dark.png', fullPage: true });
  await page.setViewportSize({ width: 380, height: 800 });
  await page.screenshot({ path: 'shot-mobile.png' });
  await browser.close();
})();
"
```

(The exact `chromium-*` build directory name can vary — `ls
/opt/pw-browsers/` to confirm before hardcoding the path.) Read the
resulting PNGs before publishing — this is where the mobile-wrap and
dark-mode-hero bugs above were actually caught.
