# VPS Hosting - Web TV, Sites & Apps (com IA Groq)

Sistema de hospedagem VPS usando GitHub Actions, com Web TV, sites, apps e IA via Groq.

## Funcionalidades

- **Web TV**: Hospedagem de canais de TV ao vivo e streaming
- **Sites & Apps**: Hospedagem de sites estáticos/dinâmicos e aplicações
- **IA Integrada**: API Groq para assistente inteligente
- **GitHub Actions**: CI/CD e deploy automático

## Estrutura do Projeto

```
VPS-Hosting/
├── .github/workflows/   # GitHub Actions - deploy e serviços
├── server/              # Configurações do servidor (Nginx, scripts)
├── web-tv/              # Sistema de Web TV e canais
├── apps/                # Aplicações (Frontend, Backend)
├── dns/                 # Configurações de IP do servidor
├── groq-api/            # Integração com API Groq (IA)
└── README.md
```

## 24/7 Online

O workflow roda **24 horas por dia** usando:
- **Schedule automático** a cada 4 horas (cron: `0 */4 * * *`)
- **Keepalive** com monitoramento e auto-restart dos serviços
- **Timeout de 6 horas** por execução (máximo do GitHub Actions)
- **Concurrency** para manter sempre uma instância ativa

## Como Usar

### 1. Web TV
Coloque seus streams e canais na pasta `web-tv/channels/`.

### 2. Sites e Apps
Sites estáticos em `apps/frontend/`. APIs em `apps/backend/`.

### 3. API Groq (único requisito)
Configure apenas o secret `GROQ_API_KEY` no GitHub para ativar o assistente IA.

### 4. Painel de Controle
Acesse `/painel/` após o deploy. Login: `admin` / `1101112`

## Deploy Rápido

1. Faça fork deste repositório
2. Configure o Secret no GitHub:
   - `GROQ_API_KEY`: Sua chave da API Groq
3. Execute o workflow "Deploy VPS 24/7"
4. Pronto! A VPS ficará online 24/7

## Licença

MIT
