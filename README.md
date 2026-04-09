# 🥐 Food Sales Dashboard

A clean, minimal analytics dashboard built with HTML, CSS, and Chart.js — no framework needed.

## Features
- Monthly revenue bar chart (2024 / 2025 comparison)
- Category breakdown donut chart
- Top products bar list
- Region & city revenue breakdown
- Searchable orders table
- Year filter (All / 2024 / 2025)
- CSV export

## Deploy to Vercel

### Option 1 — Vercel CLI (fastest)
```bash
npm i -g vercel
vercel
```

### Option 2 — GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Framework preset: **Other**
5. Click **Deploy** ✅

No build step needed — Vercel serves `index.html` directly.

## Local Preview
```bash
# Just open in browser — no server needed
open index.html

# Or use a simple server
npx serve .
```

## File Structure
```
food-dashboard/
├── index.html   — Main page
├── style.css    — All styles
├── data.js      — Sales data (244 orders)
├── app.js       — Charts + table logic
└── README.md
```

## Customising the Data
To add your own data, edit `data.js` and replace the `RAW_DATA` array. Each record needs:
```js
{ id, date, region, city, category, product, qty, unitPrice, total }
```
