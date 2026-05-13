const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_USER = 'admin';
const ADMIN_PASS = '1101112';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session simple
const sessions = {};

function authMiddleware(req, res, next) {
  const token = req.headers.authorization || req.query.token;
  if (token && sessions[token]) {
    req.user = sessions[token];
    return next();
  }
  if (req.path === '/login' || req.path.startsWith('/api/auth') || req.path.startsWith('/api/status') || req.path.startsWith('/api/health')) {
    return next();
  }
  if (req.method === 'GET' && (req.path === '/' || req.path.startsWith('/painel'))) {
    return next();
  }
  return res.status(401).json({ error: 'Não autorizado' });
}

app.use(authMiddleware);

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir painel
app.use('/painel', express.static(path.join(__dirname, 'painel')));

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions[token] = { username, loginAt: new Date() };
    return res.json({ token, username, message: 'Login OK' });
  }
  return res.status(401).json({ error: 'Usuário ou senha inválidos' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization;
  if (token) delete sessions[token];
  res.json({ message: 'Logout OK' });
});

app.get('/api/auth/check', (req, res) => {
  const token = req.headers.authorization;
  if (token && sessions[token]) {
    return res.json({ authenticated: true, username: sessions[token].username });
  }
  return res.json({ authenticated: false });
});

// Status do servidor
app.get('/api/status', (req, res) => {
  const ip = require('os').networkInterfaces();
  let serverIp = '0.0.0.0';
  Object.keys(ip).forEach(iface => {
    ip[iface].forEach(addr => {
      if (addr.family === 'IPv4' && !addr.internal) serverIp = addr.address;
    });
  });

  res.json({
    status: 'online',
    server: 'VPS Hosting - GitHub Actions',
    server_ip: serverIp,
    port: PORT,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      web_tv: true,
      api_groq: !!process.env.GROQ_API_KEY,
      backend: true
    }
  });
});

// Canais Web TV
const channelsDir = path.join(__dirname, '../../web-tv/channels');

app.get('/api/channels', (req, res) => {
  try {
    const files = fs.readdirSync(channelsDir).filter(f => f.endsWith('.json'));
    const channels = files.map(f => {
      const data = fs.readFileSync(path.join(channelsDir, f));
      return JSON.parse(data);
    });
    res.json(channels);
  } catch (err) {
    res.json({ error: err.message, channels: [] });
  }
});

app.post('/api/channels', (req, res) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });

  const channel = req.body;
  if (!channel.name || !channel.stream_url) {
    return res.status(400).json({ error: 'Nome e stream_url são obrigatórios' });
  }
  const filename = `channel_${Date.now()}.json`;
  const filepath = path.join(channelsDir, filename);
  channel.id = Date.now();
  channel.status = channel.status || 'online';
  fs.writeFileSync(filepath, JSON.stringify(channel, null, 2));
  res.json({ message: 'Canal criado', channel });
});

app.delete('/api/channels/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });

  try {
    const files = fs.readdirSync(channelsDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(channelsDir, f)));
      if (data.id == req.params.id) {
        fs.unlinkSync(path.join(channelsDir, f));
        return res.json({ message: 'Canal removido' });
      }
    }
    res.status(404).json({ error: 'Canal não encontrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy para API Groq
app.all('/api/generate', (req, res) => {
  const groqHost = process.env.GROQ_HOST || '127.0.0.1';
  const groqPort = parseInt(process.env.GROQ_PORT || '5000');

  const options = {
    hostname: groqHost,
    port: groqPort,
    path: '/api/generate',
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      try { res.json(JSON.parse(data)); } catch { res.send(data); }
    });
  });

  proxyReq.on('error', () => {
    res.json({ error: 'API Groq não disponível. Configure GROQ_API_KEY.' });
  });

  if (req.method === 'POST') {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// Login page redirect
app.get('/login', (req, res) => {
  res.redirect('/painel/');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend rodando na porta ${PORT}`);
  console.log(`Painel: http://0.0.0.0:${PORT}/painel/`);
});
