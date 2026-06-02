#!/bin/bash
# sync-clientes.sh — sincroniza /clientes com data/clientes e faz deploy

CLIENTES_SRC="/Users/gabrielfragoso/clientes"
CLIENTES_DST="$(dirname "$0")/../data/clientes"

echo "🔄 Sincronizando clientes..."

for dir in "$CLIENTES_SRC"/*/; do
  slug=$(basename "$dir")
  dst="$CLIENTES_DST/$slug"

  mkdir -p "$dst/outputs"

  # client.json
  if [ -f "$dir/client.json" ]; then
    cp "$dir/client.json" "$dst/client.json"
    echo "  ✅ $slug/client.json"
  fi

  # outputs/*.json
  if [ -d "$dir/outputs" ]; then
    cp "$dir/outputs"/*.json "$dst/outputs/" 2>/dev/null
    count=$(ls "$dst/outputs/"*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✅ $slug/outputs ($count arquivos)"
  fi
done

echo ""
echo "📦 Commitando..."
cd "$(dirname "$0")/.."
git add data/
git diff --cached --quiet && echo "  Nada novo para commitar." || git commit -m "sync: atualiza dados dos clientes $(date +'%Y-%m-%d %H:%M')"

echo ""
echo "🚀 Deploy no Vercel..."
vercel --prod --yes

echo ""
echo "✅ Pronto!"
