#!/bin/bash
# Configuração de Acesso Remoto ao PC

echo "=== Configurando Acesso Remoto ==="

# Configurar SSH
sudo apt-get install -y openssh-server
sudo systemctl enable ssh
sudo systemctl start ssh

# Configurar RDP (para Windows)
sudo apt-get install -y xrdp
sudo systemctl enable xrdp
sudo systemctl start xrdp

# Configurar VNC
sudo apt-get install -y tightvncserver

# Criar túnel reverso para acesso externo
echo "Configurando túnel reverso..."
ssh -R 19999:localhost:22 -N -f user@seudominio.com

# Gerar chave SSH
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -N "" -f ~/.ssh/id_rsa
fi

echo ""
echo "=== Acesso Remoto Configurado ==="
echo "SSH: localhost:22"
echo "RDP: localhost:3389"
echo "VNC: localhost:5901"
echo ""
echo "Para acessar externamente:"
echo "  ssh user@seudominio.com -p 19999"
