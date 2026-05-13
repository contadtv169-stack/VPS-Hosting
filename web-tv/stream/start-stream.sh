#!/bin/bash
# Iniciar servidor de streaming Web TV

echo "=== Iniciando Servidor de Streaming Web TV ==="

# Instalar node-rtsp-stream se necessário
if ! command -v ffmpeg &> /dev/null; then
    sudo apt-get install -y ffmpeg
fi

# Iniciar servidor HTTP para servir streams
python3 -m http.server 8888 --bind 0.0.0.0 --directory web-tv/stream &

echo "Servidor de streaming rodando na porta 8888 (0.0.0.0)"

# Monitorar processos
while true; do
    sleep 60
    echo "Stream ativo: $(date)"
done
