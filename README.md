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

## Como Usar

### 1. Web TV
Coloque seus streams e canais na pasta `web-tv/channels/`.

### 2. Sites e Apps
Sites estáticos em `apps/frontend/`. APIs em `apps/api/`. Deploy automático via GitHub Actions.

### 3. API Groq (único requisito)
Configure apenas o secret `GROQ_API_KEY` no GitHub para ativar o assistente IA.

## Deploy Rápido

1. Faça fork deste repositório
2. Configure o Secret no GitHub:
   - `GROQ_API_KEY`: Sua chave da API Groq
3. Execute o workflow "Deploy VPS Completo"
4. Pronto!

## Licença

MIT
