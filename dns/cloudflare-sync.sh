#!/bin/bash
# Script de sincronização DNS com Cloudflare

echo "=== Sincronizando DNS com Cloudflare ==="

if [ -z "$CF_API_TOKEN" ]; then
    echo "ERRO: CF_API_TOKEN não configurado"
    exit 1
fi

# Ler configuração DNS
DOMAINS=$(python3 -c "
import json
with open('dns/config.json') as f:
    config = json.load(f)
for domain in config.get('domains', []):
    print(f\"{domain['domain']}|{domain['type']}|{domain['target']}|{domain.get('proxied', True)}|{domain.get('ttl', 3600)}\")
")

# Obter Zone ID para cada domínio
echo "$DOMAINS" | while IFS='|' read -r domain type target proxied ttl; do
    # Extrair domínio principal
    main_domain=$(echo "$domain" | awk -F. '{print $(NF-1)"."$NF}')
    
    # Obter Zone ID
    ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$main_domain" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])" 2>/dev/null)
    
    if [ -z "$ZONE_ID" ]; then
        echo "Zona não encontrada para $main_domain"
        continue
    fi
    
    # Criar/atualizar registro DNS
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"$type\",
            \"name\": \"$domain\",
            \"content\": \"$target\",
            \"ttl\": $ttl,
            \"proxied\": $proxied
        }" > /dev/null
    
    echo "✅ DNS atualizado: $domain -> $target"
done

echo "=== Sincronização DNS concluída ==="
