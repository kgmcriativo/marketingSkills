#!/usr/bin/env node
//
// Injects the embedded KGM dashboard fonts (base64 woff2, stored in
// fonts/*.b64) into a dashboard HTML file that still has the
// __FRAUNCES_600__ / __FRAUNCES_700__ / __PLEX_400__ / __PLEX_500__ /
// __PLEX_600__ / __PLEX_700__ placeholders from dashboard-skeleton.html.
//
// Usage:
//   node build-dashboard.js <input.html> <output.html>
//
// Typical flow: copy dashboard-skeleton.html, fill in the client's data
// (KPIs, insights, posts, ads — see references/report-template.md and
// references/visual-system.md), then run this script to produce the final
// self-contained file to hand to the Artifact tool.

const fs = require('fs')
const path = require('path')

const [, , inputPath, outputPath] = process.argv

if (!inputPath || !outputPath) {
  console.error('Usage: node build-dashboard.js <input.html> <output.html>')
  process.exit(1)
}

const fontsDir = path.join(__dirname, 'fonts')
const placeholders = {
  __FRAUNCES_600__: 'fraunces-600.b64',
  __FRAUNCES_700__: 'fraunces-700.b64',
  __PLEX_400__: 'plexsans-400.b64',
  __PLEX_500__: 'plexsans-500.b64',
  __PLEX_600__: 'plexsans-600.b64',
  __PLEX_700__: 'plexsans-700.b64',
}

let html = fs.readFileSync(inputPath, 'utf8')

for (const [placeholder, file] of Object.entries(placeholders)) {
  if (!html.includes(placeholder)) {
    console.error(`Warning: placeholder ${placeholder} not found in ${inputPath} (already built, or skeleton was edited?)`)
    continue
  }
  const b64 = fs.readFileSync(path.join(fontsDir, file), 'utf8').trim()
  html = html.split(placeholder).join(b64)
}

fs.writeFileSync(outputPath, html)
console.log(`Built ${outputPath} (${(html.length / 1024).toFixed(1)} KB)`)
