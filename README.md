# Legendary Workout Plan

Premium web app for your 12-week **Strong Body, Strong Mind** training program (from Google Sheets).

## Features

- **12-week periodization** — Build, Deload, Strength, Power + Test phases
- **6 training days** + REST — all exercises with weekly targets from your spreadsheet
- **Workout logging** — Actual sets & notes saved in your browser (localStorage)
- **Overview dashboard** — Training architecture at a glance

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

## GitHub Pages

### Live site (use this exact link)

**https://amokhalad.github.io/workout-plan/**

Do not open `https://amokhalad.github.io/` alone — that URL is empty (404). The app lives under `/workout-plan/`.

### Settings ([Pages](https://github.com/Amokhalad/workout-plan/settings/pages))

| Setting | Correct value |
|--------|----------------|
| Source | **Deploy from a branch** |
| Branch | **gh-pages** |
| Folder | **/ (root)** — not `/docs` |

The site is served from the `gh-pages` branch, which the deploy script builds and force-pushes.

### Still blank?

1. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Try an incognito/private window
3. Confirm the address bar ends with `/workout-plan/`

### Redeploy

```bash
npm run deploy:pages
```
