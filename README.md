# VPS Hosting Completa - Web TV, Sites, Apps & Domínios

Sistema completo de hospedagem VPS usando GitHub Actions como infraestrutura, com suporte a Web TV, sites, aplicativos, domínios e acesso remoto a PC.

## Funcionalidades

- **Web TV**: Hospedagem de canais de TV ao vivo e streaming
- **Sites & Apps**: Hospedagem de sites estáticos/dinâmicos e aplicações
- **Domínios**: Gerenciamento de DNS e domínios personalizados
- **PC Remoto**: Acesso remoto ao servidor via SSH/RDP
- **IA Integrada**: API Groq para funcionalidades inteligentes
- **GitHub Actions**: CI/CD, deploy automático e infraestrutura como código

## Estrutura do Projeto

```
VPS-Hosting/
├── .github/workflows/   # GitHub Actions - CI/CD, deploy, DNS
├── server/              # Configurações do servidor (Nginx, scripts)
├── web-tv/              # Sistema de Web TV e canais
├── apps/                # Aplicações (API, Frontend, Backend)
├── dns/                 # Configurações de domínio e DNS
├── groq-api/            # Integração com API Groq (IA)
├── remote-pc/           # Scripts de acesso remoto
└── README.md
```

## Como Usar

### 1. Configurar GitHub Actions como VPS

Os workflows do GitHub Actions funcionam como sua infraestrutura de VPS, executando servidores web, APIs e serviços 24/7.

### 2. Web TV

Coloque seus streams e canais na pasta `web-tv/channels/`. Configure as URLs de streaming no arquivo de configuração.

### 3. Sites e Apps

Os sites estáticos vão em `apps/frontend/`. APIs em `apps/api/`. O deploy é automático via GitHub Actions.

### 4. Domínios

Configure seus domínios em `dns/config.json`. O workflow de DNS atualiza automaticamente.

### 5. API Groq

Configure sua chave da API Groq nos Secrets do GitHub (`GROQ_API_KEY`) para ativar funcionalidades de IA.

## Deploy Rápido

1. Faça fork deste repositório
2. Configure os Secrets no GitHub:
   - `GROQ_API_KEY`: Sua chave da API Groq
   - `DOMAIN`: Seu domínio (opcional)
   - `CF_API_TOKEN`: Token da Cloudflare (opcional)
3. Execute o workflow "Deploy VPS Completo"
4. Pronto! Sua VPS está no ar.

## Licença

MIT
