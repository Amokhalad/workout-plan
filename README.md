# Legendary Workout Plan

Premium web app for your 12-week **Strong Body, Strong Mind** training program (from Google Sheets).

## Features

- **12-week periodization** — Build, Deload, Strength, Power + Test phases
- **6 training days** + REST — all exercises with weekly targets from your spreadsheet
- **Workout logging** — Actual sets & notes saved in your browser (localStorage)
- **Week 1 seed data** — Bench press logs from your sheet pre-filled
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

1. Open [Repository Settings → Pages](https://github.com/bareq4601358-alj/workout-plan/settings/pages)
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”)
3. Push to `main` — the workflow builds and deploys automatically
4. Live site: **https://bareq4601358-alj.github.io/workout-plan/**

If the page is blank or 404, wait 2–3 minutes after the Actions workflow finishes (green checkmark).
