// PC Launcher - Inicia todos os serviços no PC
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const NGROK_PATH = 'ngrok'; // ou caminho completo
const LOG_DIR = path.join(__dirname, 'logs');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

function log(msg) {
  const line = `[${new Date().toLocaleString('pt-BR')}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(LOG_DIR, 'startup.log'), line + '\n');
}

function startProcess(name, cmd, args, opts = {}) {
  log(`Iniciando ${name}...`);
  const proc = spawn(cmd, args, { stdio: 'pipe', shell: true, ...opts });
  const outFile = fs.createWriteStream(path.join(LOG_DIR, `${name}.log`));
  proc.stdout.pipe(outFile);
  proc.stderr.pipe(outFile);
  proc.on('error', (err) => log(`❌ ${name} erro: ${err.message}`));
  proc.on('exit', (code) => log(`⚠️ ${name} finalizou (código ${code})`));
  log(`✅ ${name} iniciado (PID: ${proc.pid})`);
  return proc;
}

async function startNgrok() {
  const tunnels = [
    { name: 'backend', port: 3000 },
    { name: 'web-tv', port: 8080 },
    { name: 'groq-api', port: 5000 }
  ];

  const ngrokUrlFile = path.join(__dirname, 'ngrok-url.txt');

  tunnels.forEach(t => {
    startProcess(`ngrok-${t.name}`, NGROK_PATH, [`http`, `${t.port}`, `--log=stdout`]);
  });

  log('Aguardando ngrok estabelecer túneis...');
  await new Promise(r => setTimeout(r, 5000));

  try {
    const res = await fetch('http://127.0.0.1:4040/api/tunnels');
    const data = await res.json();
    const urls = data.tunnels.map(t => ({ name: t.name, url: t.public_url }));
    fs.writeFileSync(ngrokUrlFile, JSON.stringify(urls, null, 2));
    log('=== URLs PÚBLICAS (ngrok) ===');
    urls.forEach(u => log(`${u.name}: ${u.url}`));
    log('==============================');

    // Salvar URL principal
    const main = urls.find(u => u.name.includes('backend')) || urls[0];
    if (main) fs.writeFileSync(path.join(__dirname, 'ngrok-url.txt'), main.url);

    return urls;
  } catch (e) {
    log(`⚠️ Não foi possível ler túneis ngrok: ${e.message}`);
    log('Acesse http://127.0.0.1:4040 para ver as URLs manualmente');
    return [];
  }
}

async function main() {
  log('');
  log('======================================');
  log('  PC VPS HOSTING - sonicvid.online');
  log('  Login: admin / 1101112');
  log('======================================');
  log('');

  // Verificar ngrok
  try {
    exec(`${NGROK_PATH} --version`, (err) => {
      if (err) log('⚠️ ngrok não encontrado. Instale em https://ngrok.com/download');
    });
  } catch (e) {}

  // Iniciar serviços
  const processes = [];

  // 1. Backend + API + Painel
  processes.push(startProcess('backend-pc', 'node', [path.join(__dirname, 'server.js')], {
    env: { ...process.env, PORT: '3000' }
  }));

  // 2. Groq API (Python)
  const groqDir = path.join(__dirname, '../groq-api');
  if (fs.existsSync(path.join(groqDir, 'app.py'))) {
    processes.push(startProcess('groq-api', 'python', [path.join(groqDir, 'app.py'), '--port', '5000'], {
      env: { ...process.env }
    }));
  }

  // 3. Web TV Stream
  const streamDir = path.join(__dirname, '../web-tv/stream');
  processes.push(startProcess('web-tv-stream', 'python', ['-m', 'http.server', '8888', '--bind', '0.0.0.0'], {
    cwd: streamDir
  }));

  // 4. Nginx (se disponível no Windows - via WSL ou nativo)
  try {
    exec('where nginx', (err) => {
      if (!err) {
        processes.push(startProcess('nginx', 'nginx', []));
      }
    });
  } catch (e) {}

  // Aguardar serviços iniciarem
  log('Aguardando serviços iniciarem...');
  await new Promise(r => setTimeout(r, 3000));

  // Iniciar ngrok
  log('Iniciando túneis ngrok...');
  const ngrokUrls = await startNgrok();

  log('');
  log('======================================');
  log('  ✅ PC SERVIDOR ATIVO');
  log('======================================');
  log(`  📡 Painel: http://localhost:3000/painel/`);
  log(`  🌐 Site: https://sonicvid.online`);
  if (ngrokUrls.length > 0) {
    log(`  🔗 URL Pública: ${ngrokUrls[0]?.url || 'Ver em http://127.0.0.1:4040'}`);
  }
  log('======================================');
  log('');
  log('Pressione Ctrl+C para parar todos os serviços');
}

main().catch(err => {
  log(`Erro fatal: ${err.message}`);
  process.exit(1);
});
