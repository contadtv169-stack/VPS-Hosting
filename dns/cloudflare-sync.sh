#!/bin/bash
# Informações de IP do GitHub

echo "=== IP do Servidor GitHub ==="
IP=$(curl -s ifconfig.me 2>/dev/null || echo 'Não disponível')
echo "IP Público: $IP"
echo "Hostname: $(hostname)"
echo ""
echo "=== URLs de Acesso ==="
echo "Sites/Apps: http://$IP"
echo "Web TV: http://$IP:8080"
echo "Painel: http://$IP:3000/painel/"
echo "API Groq: http://$IP:3000/api/generate"
