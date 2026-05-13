#!/bin/bash
# Informações de IP do GitHub

echo "=== IP do Servidor GitHub ==="
echo "IP Público: $(curl -s ifconfig.me 2>/dev/null || echo 'Não disponível')"
echo "Hostname: $(hostname)"
echo "IP GitHub: github.com -> $(curl -s -o /dev/null -w '%{remote_ip}' https://github.com 2>/dev/null || echo 'Não disponível')"
