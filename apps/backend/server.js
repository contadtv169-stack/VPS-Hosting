const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        server: 'VPS Hosting',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            web_tv: true,
            api_groq: !!process.env.GROQ_API_KEY,
            dns: true,
            remote_pc: true
        }
    });
});

// API de canais Web TV
const channelsDir = path.join(__dirname, '../../web-tv/channels');
const fs = require('fs');

app.get('/api/channels', (req, res) => {
    try {
        const files = fs.readdirSync(channelsDir).filter(f => f.endsWith('.json'));
        const channels = files.map(f => {
            const data = fs.readFileSync(path.join(channelsDir, f));
            return JSON.parse(data);
        });
        res.json(channels);
    } catch (err) {
        res.json({ error: err.message });
    }
});

// API de health check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend rodando na porta ${PORT}`);
});
