#!/usr/bin/env bash
# Build the static site and publish it to the gh-pages branch (GitHub Pages "Deploy from a branch").
# Usage: npm run deploy            (repo name and owner are read from the git remote)
set -euo pipefail
REMOTE_URL=$(git remote get-url origin)
REPO=$(basename -s .git "$REMOTE_URL")
OWNER=$(echo "$REMOTE_URL" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')
# On a custom domain run: BASE_PATH= SITE_URL=https://lancetarchitect.com npm run deploy
export NEXT_PUBLIC_BASE_PATH="${BASE_PATH-/$REPO}"
export NEXT_PUBLIC_SITE_URL="${SITE_URL:-https://$OWNER.github.io/$REPO}"
echo "Building for $NEXT_PUBLIC_SITE_URL (base path '$NEXT_PUBLIC_BASE_PATH')"
rm -rf .next out
npm run build
touch out/.nojekyll
[ -n "${CNAME:-}" ] && echo "$CNAME" > out/CNAME
cd out
git init -q -b gh-pages
git add -A
git -c commit.gpgsign=false commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -f -q "$REMOTE_URL" gh-pages
rm -rf .git
echo "Published to https://$OWNER.github.io/$REPO/"
