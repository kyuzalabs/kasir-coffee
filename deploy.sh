#!/usr/bin/env bash
# Deploy Kasir Coffee Shop ke GitHub Pages (kyuzalabs/kasir-coffee)
set -u
cd "$(dirname "$0")"

TOKEN=$(cat /home/agentuser/.hermes/.gh_token)
OWNER="kyuzalabs"
REPO="kasir-coffee"
AUTH="Authorization: Bearer $TOKEN"

echo "==> git init & commit (main)"
if [ ! -d .git ]; then
  git init -q
  git config user.name "kyuzalabs"
  git config user.email "hazeesatoru5@gmail.com"
fi
git checkout -q -b main 2>/dev/null || git checkout -q main
git add -A
git commit -q -m "Kasir Coffee Shop — POS kasir coffee shop (React+Vite+TS+Tailwind, PWA)" 2>/dev/null && echo "   committed" || echo "   nothing new to commit"

echo "==> pastikan repo ada"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "https://api.github.com/repos/$OWNER/$REPO")
if [ "$CODE" = "404" ]; then
  RESP=$(curl -s -X POST "https://api.github.com/user/repos" \
    -H "$AUTH" -H "Accept: application/vnd.github+json" \
    -d "{\"name\":\"$REPO\",\"description\":\"Aplikasi kasir (POS) coffee shop — React+Vite+TypeScript+Tailwind, PWA\",\"public\":true}")
  echo "$RESP" | grep -q '"full_name"' && echo "   repo created" || echo "   ${RESP:0:200}"
else
  echo "   repo exists (HTTP $CODE)"
fi

echo "==> push main"
git remote remove origin 2>/dev/null || true
git remote add origin "https://kyuzalabs:${TOKEN}@github.com/$OWNER/$REPO.git"
git push -u origin main 2>&1 | tail -4

echo "==> build & deploy dist -> gh-pages"
npm run build >/dev/null 2>&1
rm -rf /tmp/kasir-ghpages
mkdir -p /tmp/kasir-ghpages
cp -r dist/. /tmp/kasir-ghpages/
touch /tmp/kasir-ghpages/.nojekyll
cd /tmp/kasir-ghpages
git init -q
git config user.name "kyuzalabs"
git config user.email "hazeesatoru5@gmail.com"
git checkout -q -b gh-pages
git add -A
git commit -q -m "deploy $(date +%s)" >/dev/null
git remote add origin "https://kyuzalabs:${TOKEN}@github.com/$OWNER/$REPO.git"
git push -f -q origin gh-pages 2>&1 | tail -4
echo "   gh-pages pushed"

echo "==> enable Pages (branch gh-pages)"
curl -s -X POST "https://api.github.com/repos/$OWNER/$REPO/pages" \
  -H "$AUTH" -H "Accept: application/vnd.github+json" \
  -d '{"source":{"branch":"gh-pages","path":"/"}}' | grep -oE '"html_url":"[^"]*"|"message":"[^"]*"' || echo "   (pages mungkin sudah aktif)"

echo "==> SELESAI"
echo "URL: https://$OWNER.github.io/$REPO/"