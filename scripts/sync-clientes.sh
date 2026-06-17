#!/bin/bash
# sync-clientes.sh — sincroniza /clientes com data/clientes e faz deploy

CLIENTES_SRC="/Users/gabrielfragoso/clientes"
CLIENTES_DST="$(dirname "$0")/../data/clientes"

echo "🔄 Sincronizando clientes..."

# Garante que todo cliente tenha login/senha do portal (gera se faltar)
python3 - << 'PYEOF'
import json, secrets, datetime, glob, os

ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"  # legível, sem 0/O/1/l/i
today = datetime.date.today().isoformat()

for p in sorted(glob.glob("/Users/gabrielfragoso/clientes/*/client.json")):
    slug = os.path.basename(os.path.dirname(p))
    with open(p) as f:
        data = json.load(f)
    meta = data.setdefault("meta", {})
    if not meta.get("portal_access"):
        meta["portal_access"] = {
            "user": slug,
            "password": "v4-" + "".join(secrets.choice(ALPHABET) for _ in range(6)),
            "created_at": today,
        }
        with open(p, "w") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  🔑 {slug}: login criado (user={slug} senha={meta['portal_access']['password']})")
PYEOF

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
git add data/ .github/
git diff --cached --quiet && echo "  Nada novo para commitar." || git commit -m "sync: atualiza dados dos clientes $(date +'%Y-%m-%d %H:%M')"

echo ""
echo "📤 Publicando no GitHub (v4oxicore/v4)..."
git push v4oxicore main && echo "  ✅ Push OK — GitHub Actions vai deployar automaticamente."

echo ""
echo "✅ Pronto! Deploy em andamento via GitHub Actions."
