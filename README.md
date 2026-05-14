# VPS Hosting - sonicvid.online

Sistema completo de hospedagem VPS com site, Web TV, apps, IA Groq, Instagram e Pix.

## Arquitetura

```
🌐 GitHub Pages (sonicvid.online)  →  Site público (frontend)
💻 PC Local (com ngrok)             →  Backend, IA, Web TV, Instagram, Pix
🔗 Hostinger DNS                    →  Domínio apontado para GitHub Pages
```

## Site (GitHub Pages)

O site estático fica em `apps/frontend/` e é publicado automaticamente no GitHub Pages:
- **URL:** https://sonicvid.online
- **Deploy automático** via GitHub Actions ao fazer push na branch main

## PC Local (Serviços)

Para rodar os serviços no seu PC:

```bash
cd pc
npm install
node start-pc.js
```

Isso inicia:
- **Painel:** http://localhost:3000/painel/
- **API Groq:** Interface com IA via Groq
- **Web TV:** Streaming de canais
- **Instagram:** Publicar posts
- **Pix:** Gateway de pagamentos (BETA)
- **ngrok:** Túneis públicos para acessar de qualquer lugar

## Login

**Usuário:** admin
**Senha:** 1101112

## DNS (Hostinger)

Configure no painel da Hostinger:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | contadtv169-stack.github.io |

## Secrets do GitHub (para Actions)

- `GROQ_API_KEY`: Chave da API Groq

## Funcionalidades

- 📺 Web TV com canais de streaming
- 🌐 Site institucional
- 🤖 Assistente IA com Groq
- 📸 Postagem no Instagram
- 💰 Pix Payment Gateway (BETA)
- 🔐 Painel de controle completo
