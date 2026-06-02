#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

WORKTREE=$(mktemp -d)
cp -r dist/* "$WORKTREE/"
cp dist/index.html "$WORKTREE/404.html"
touch "$WORKTREE/.nojekyll"

cd "$WORKTREE"
git init -q
git checkout -b gh-pages
git add -A
git commit -q -m "Deploy site to GitHub Pages ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
git remote add origin https://github.com/Amokhalad/workout-plan.git
git push -f origin gh-pages

echo "Deployed: https://amokhalad.github.io/workout-plan/"
