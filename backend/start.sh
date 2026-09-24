#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ -f "$BACKEND_DIR/.env" ]]; then
  echo "==> Loading secrets from backend/.env"
  set -a
  # shellcheck disable=SC1091
  source "$BACKEND_DIR/.env"
  set +a
else
  echo "==> No backend/.env found — copy backend/.env.example to backend/.env and fill in real values (e.g. OPENROUTER_API_KEY)."
fi

BACKEND_PID=""
FRONTEND_PID=""

case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;;
  *) IS_WINDOWS=0 ;;
esac

terminate() {
  local pid="$1"
  [[ -z "$pid" ]] && return 0
  if [[ "$IS_WINDOWS" -eq 1 ]]; then
    taskkill //F //T //PID "$pid" >/dev/null 2>&1 || true
  else
    kill "$pid" 2>/dev/null || true
  fi
}

cleanup() {
  echo ""
  echo "Stopping backend and frontend..."
  terminate "$BACKEND_PID"
  terminate "$FRONTEND_PID"
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting Postgres + Garage (docker compose)..."
(cd "$BACKEND_DIR" && docker compose up -d)

echo "==> Waiting for Postgres to accept connections..."
until docker compose -f "$BACKEND_DIR/docker-compose.yml" exec -T postgres pg_isready -U imilearn >/dev/null 2>&1; do
  sleep 1
done
echo "    Postgres is ready."

echo "==> Waiting for Garage (S3-compatible storage) to accept connections..."
until curl -sS -o /dev/null http://localhost:3900; do
  sleep 1
done
echo "    Garage is ready."

echo "==> Starting backend (Spring Boot) — logging to $ROOT_DIR/backend.log"
(cd "$BACKEND_DIR" && ./mvnw -q spring-boot:run) > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo "==> Waiting for backend to respond on http://localhost:8080 ..."
until curl -sS -o /dev/null http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d '{}'; do
  sleep 2
done
echo "    Backend is up."

echo "==> Starting frontend (Vite dev server) — logging to $ROOT_DIR/frontend.log"
(cd "$FRONTEND_DIR" && npm run dev) > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 2
cat <<EOF

==========================================================
 Backend:   http://localhost:8080
 Frontend:  http://localhost:5173
 Admin login: see admin-credentials.txt
 Logs:      backend.log / frontend.log (in this directory)
 Press Ctrl+C to stop the backend and frontend.
 (Postgres keeps running — stop it with:
    cd backend && docker compose down)
==========================================================

EOF

wait
