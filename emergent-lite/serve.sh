#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m http.server 5173 &
PID=$!
echo "Serveur démarré sur http://localhost:5173 (PID $PID). Appuyez sur Ctrl+C pour arrêter."
wait $PID