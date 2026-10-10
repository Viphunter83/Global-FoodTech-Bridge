#!/usr/bin/env bash
# Rotates INTERNAL_API_KEY across all Railway services and the Vercel portal in one pass.
# The key is generated locally and never printed. Requires `railway login` and `vercel login`.
#
# Services briefly disagree on the key while they redeploy (about 2-3 minutes); the
# portal is redeployed last so the window is as short as possible.
set -euo pipefail

cd "$(dirname "$0")/.."

KEY="ftb_$(openssl rand -hex 32)"
echo "New key fingerprint: $(printf '%s' "$KEY" | shasum -a 256 | cut -c1-12)"

echo "→ Railway: passport-service"
railway variables --service passport-service \
  --set "INTERNAL_API_KEY=$KEY" \
  --set "BLOCKCHAIN_SERVICE_URL=https://global-foodtech-bridge-production.up.railway.app" >/dev/null

echo "→ Railway: iot-service"
railway variables --service iot-service --set "INTERNAL_API_KEY=$KEY" >/dev/null

echo "→ Railway: blockchain-service"
railway variables --service blockchain-service \
  --set "INTERNAL_API_KEY=$KEY" \
  --set "CHAIN_ID=137" \
  --set "IOT_SERVICE_URL=https://celebrated-consideration-production.up.railway.app" >/dev/null

for ENV in production preview development; do
  echo "→ Vercel: $ENV"
  vercel env rm INTERNAL_API_KEY "$ENV" --yes >/dev/null 2>&1 || true
  printf '%s' "$KEY" | vercel env add INTERNAL_API_KEY "$ENV" >/dev/null
done

echo "→ Vercel: redeploying production with the new key"
LATEST=$(vercel ls --prod 2>/dev/null | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | head -1)
vercel redeploy "$LATEST" --target production >/dev/null

echo "✅ Done. Old key is no longer accepted once Railway finishes redeploying."
