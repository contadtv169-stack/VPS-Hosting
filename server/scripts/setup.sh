#!/bin/bash
# Script de Configuração do Servidor VPS

echo "=== Configurando Servidor VPS ==="

# Atualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependências essenciais
sudo apt-get install -y \
    nginx \
    apache2 \
    ffmpeg \
    python3 \
    python3-pip \
    nodejs \
    npm \
    git \
    curl \
    wget \
    certbot \
    python3-certbot-nginx

# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable

# Criar diretórios
sudo mkdir -p /var/www/web-tv
sudo mkdir -p /var/www/apps
sudo mkdir -p /var/www/sites

# Permissões
sudo chown -R $USER:$USER /var/www/

echo "Servidor configurado com sucesso!"
