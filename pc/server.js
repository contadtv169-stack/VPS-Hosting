const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { exec, spawn } = require('child_process');

const app = express();
const PORT = 3000;

const ADMIN_USER = 'admin';
const ADMIN_PASS = '1101112';

app.use(cors());
app.use(express.json());

const sessions = {};

function authToken(req) {
  const token = req.headers.authorization || req.query.token;
  if (token && sessions[token]) return sessions[token];
  if (req.path === '/login' || req.path.startsWith('/api/auth') || req.path.startsWith('/api/status') || req.path.startsWith('/api/health')) return true;
  if (req.method === 'GET' && (req.path === '/' || req.path.startsWith('/painel'))) return true;
  return null;
}

app.use((req, res, next) => {
  if (authToken(req) !== null) return next();
  return res.status(401).json({ error: 'Não autorizado' });
});

app.use(express.static(path.join(__dirname, '../apps/frontend')));
app.use('/painel', express.static(path.join(__dirname, '../apps/backend/painel')));

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions[token] = { username, loginAt: new Date() };
    return res.json({ token, username, message: 'Login OK' });
  }
  return res.status(401).json({ error: 'Inválido' });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization;
  if (token) delete sessions[token];
  res.json({ message: 'Logout OK' });
});

app.get('/api/status', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  Object.keys(interfaces).forEach(k => {
    interfaces[k].forEach(a => { if (a.family === 'IPv4' && !a.internal) localIp = a.address; });
  });

  let ngrokUrl = '';
  try {
    const ngrokData = fs.readFileSync(path.join(__dirname, 'ngrok-url.txt'), 'utf8').trim();
    if (ngrokData) ngrokUrl = ngrokData;
  } catch (e) {}

  res.json({
    status: 'online',
    server: 'PC Local - sonicvid.online',
    local_ip: localIp,
    ngrok_url: ngrokUrl,
    domain: 'https://sonicvid.online',
    port: PORT,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      web_tv: true,
      api_groq: !!process.env.GROQ_API_KEY,
      backend: true,
      instagram: true,
      pix: true
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

const channelsDir = path.join(__dirname, '../web-tv/channels');

app.get('/api/channels', (req, res) => {
  try {
    const files = fs.readdirSync(channelsDir).filter(f => f.endsWith('.json'));
    const channels = files.map(f => JSON.parse(fs.readFileSync(path.join(channelsDir, f))));
    res.json(channels);
  } catch (err) {
    res.json({ error: err.message, channels: [] });
  }
});

app.post('/api/channels', (req, res) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });
  const ch = req.body;
  if (!ch.name || !ch.stream_url) return res.status(400).json({ error: 'Nome e URL obrigatórios' });
  ch.id = Date.now();
  ch.status = ch.status || 'online';
  fs.writeFileSync(path.join(channelsDir, `channel_${ch.id}.json`), JSON.stringify(ch, null, 2));
  res.json({ message: 'Canal criado', channel: ch });
});

app.delete('/api/channels/:id', (req, res) => {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const files = fs.readdirSync(channelsDir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(channelsDir, f)));
      if (data.id == req.params.id) { fs.unlinkSync(path.join(channelsDir, f)); return res.json({ message: 'Removido' }); }
    }
    res.status(404).json({ error: 'Não encontrado' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.all('/api/generate', (req, res) => {
  const groqHost = process.env.GROQ_HOST || '127.0.0.1';
  const groqPort = parseInt(process.env.GROQ_PORT || '5000');
  const options = {
    hostname: groqHost, port: groqPort, path: '/api/generate',
    method: req.method, headers: { 'Content-Type': 'application/json' }
  };
  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', c => data += c);
    proxyRes.on('end', () => { try { res.json(JSON.parse(data)); } catch { res.send(data); } });
  });
  proxyReq.on('error', () => res.json({ error: 'API Groq não disponível' }));
  if (req.method === 'POST') proxyReq.write(JSON.stringify(req.body));
  proxyReq.end();
});

app.post('/api/instagram/post', (req, res) => {
  const { image, caption } = req.body;
  if (!image) return res.status(400).json({ error: 'Imagem necessária' });
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const igScript = require('./instagram');
    igScript.post(image, caption || '').then(r => res.json(r)).catch(e => res.json({ error: e.message }));
  } catch (e) {
    res.json({ message: 'Simulação: Postagem enviada para o Instagram', image, caption });
  }
});

app.post('/api/pix/create', (req, res) => {
  const { valor, descricao } = req.body;
  const token = req.headers.authorization;
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Não autorizado' });
  try {
    const pixGateway = require('./pix-gateway');
    pixGateway.createCharge(valor || 0, descricao || '').then(r => res.json(r)).catch(e => res.json({ error: e.message }));
  } catch (e) {
    const codigo = 'PIX_' + Date.now();
    res.json({
      message: '💰 Pix gerado (BETA)',
      codigo,
      valor: valor || 0,
      descricao: descricao || 'Pagamento',
      pix_copia_cola: `00020126580014br.gov.bcb.pix0136${codigo}5204000053039865404${(valor||0).toFixed(2).replace('.','')}5802BR5925VPS Hosting6009Sao Paulo62070503***6304`,
      qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${codigo}`,
      status: 'pendente'
    });
  }
});

app.get('/api/pix/status/:codigo', (req, res) => {
  res.json({ codigo: req.params.codigo, status: 'pendente', message: 'BETA: Aguardando confirmação manual' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PC Server rodando em http://0.0.0.0:${PORT}`);
  console.log(`Painel: http://localhost:${PORT}/painel/`);
});
