#!/bin/bash
# Keepalive - Monitora e mantém serviços rodando 24/7

SERVICES=(
  "nginx:sudo systemctl restart nginx"
  "node:cd /home/runner/work/VPS-Hosting/VPS-Hosting/apps/backend && nohup node server.js > /tmp/backend.log 2>&1 &"
  "python:cd /home/runner/work/VPS-Hosting/VPS-Hosting/groq-api && nohup python app.py --port 5000 > /tmp/groq.log 2>&1 &"
  "python.*http.server:cd /home/runner/work/VPS-Hosting/VPS-Hosting/web-tv/stream && nohup python3 -m http.server 8888 --bind 0.0.0.0 > /tmp/stream.log 2>&1 &"
)

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

while true; do
  IP=$(curl -s ifconfig.me 2>/dev/null || echo "N/A")
  log "=== HEALTH CHECK - IP: $IP ==="

  # Verificar Nginx
  if ! pgrep -x nginx > /dev/null; then
    log "⚠️ Nginx parado. Reiniciando..."
    sudo systemctl restart nginx 2>/dev/null || sudo nginx
  else
    log "✅ Nginx OK"
  fi

  # Verificar Backend (porta 3000)
  if ! curl -s http://127.0.0.1:3000/api/health > /dev/null 2>&1; then
    log "⚠️ Backend parado. Reiniciando..."
    cd /home/runner/work/VPS-Hosting/VPS-Hosting/apps/backend
    nohup node server.js > /tmp/backend.log 2>&1 &
    sleep 2
  else
    log "✅ Backend OK"
  fi

  # Verificar API Groq (porta 5000)
  if ! curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
    log "⚠️ API Groq parada. Reiniciando..."
    cd /home/runner/work/VPS-Hosting/VPS-Hosting/groq-api
    nohup python app.py --port 5000 > /tmp/groq.log 2>&1 &
    sleep 2
  else
    log "✅ API Groq OK"
  fi

  # Verificar Stream (porta 8888)
  if ! curl -s http://127.0.0.1:8888/ > /dev/null 2>&1; then
    log "⚠️ Stream parado. Reiniciando..."
    cd /home/runner/work/VPS-Hosting/VPS-Hosting/web-tv/stream
    nohup python3 -m http.server 8888 --bind 0.0.0.0 > /tmp/stream.log 2>&1 &
    sleep 2
  else
    log "✅ Stream OK"
  fi

  log "Próximo check em 5 minutos..."
  sleep 300
done
