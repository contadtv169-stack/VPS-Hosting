import os
import json
from flask import Flask, request, jsonify, render_template_string
from groq import Groq

app = Flask(__name__)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web TV IA - Assistente Inteligente</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0a0a1a; color: #fff; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1 { text-align: center; font-size: 2.5rem; margin-bottom: 2rem; background: linear-gradient(45deg, #00d4ff, #7b2ff7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .chat-box { background: #1a1a3e; border-radius: 1rem; padding: 1.5rem; height: 400px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid #2a2a5e; }
        .message { margin-bottom: 1rem; padding: 0.8rem 1rem; border-radius: 0.8rem; max-width: 80%; }
        .user { background: #7b2ff7; margin-left: auto; }
        .assistant { background: #1e3a5f; }
        .input-area { display: flex; gap: 0.5rem; }
        input { flex: 1; padding: 1rem; border-radius: 0.5rem; border: 1px solid #2a2a5e; background: #1a1a3e; color: #fff; font-size: 1rem; }
        button { padding: 1rem 2rem; background: #7b2ff7; color: #fff; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
        button:hover { background: #6a1fd6; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .card { background: #1a1a3e; border-radius: 0.8rem; padding: 1.5rem; border: 1px solid #2a2a5e; }
        .card h3 { color: #00d4ff; margin-bottom: 0.5rem; }
        .status { text-align: center; margin-top: 1rem; padding: 0.5rem; border-radius: 0.5rem; }
        .online { background: #1a4a1a; color: #4caf50; }
        .offline { background: #4a1a1a; color: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Web TV IA</h1>
        <div id="status" class="status {{ 'online' if api_key else 'offline' }}">
            🤖 IA {{ 'ATIVA' if api_key else 'INATIVA - Configure GROQ_API_KEY' }}
        </div>
        <div class="chat-box" id="chat-box">
            <div class="message assistant">Olá! Eu sou o assistente IA da Web TV. Como posso ajudar?</div>
        </div>
        <div class="input-area">
            <input type="text" id="user-input" placeholder="Digite sua mensagem..." {{ 'disabled' if not api_key }}>
            <button onclick="sendMessage()" {{ 'disabled' if not api_key }}>Enviar</button>
        </div>
        <div class="features">
            <div class="card"><h3>📺 Canais Web TV</h3><p>Gerencie e recomende canais de TV</p></div>
            <div class="card"><h3>🌐 Sites & Apps</h3><p>Assistência para criação de sites</p></div>
            <div class="card"><h3>🎬 Streaming</h3><p>Otimize suas transmissões</p></div>
            <div class="card"><h3>🔧 Suporte Técnico</h3><p>Tire dúvidas sobre a VPS</p></div>
        </div>
    </div>
    <script>
        function sendMessage() {
            const input = document.getElementById('user-input');
            const chatBox = document.getElementById('chat-box');
            const message = input.value.trim();
            if (!message) return;

            chatBox.innerHTML += '<div class="message user">' + message + '</div>';
            input.value = '';
            chatBox.scrollTop = chatBox.scrollHeight;

            fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            })
            .then(r => r.json())
            .then(data => {
                chatBox.innerHTML += '<div class="message assistant">' + data.response + '</div>';
                chatBox.scrollTop = chatBox.scrollHeight;
            });
        }

        document.getElementById('user-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE, api_key=bool(GROQ_API_KEY))

@app.route('/chat', methods=['POST'])
def chat():
    if not client:
        return jsonify({'response': '❌ API Groq não configurada. Defina GROQ_API_KEY nas variáveis de ambiente.'})

    data = request.json
    message = data.get('message', '')

    try:
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {"role": "system", "content": "Você é um assistente especializado em Web TV, hospedagem VPS, streaming e tecnologia. Responda em português do Brasil."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=2048
        )
        response = completion.choices[0].message.content
    except Exception as e:
        response = f"Erro ao processar: {str(e)}"

    return jsonify({'response': response})

@app.route('/api/generate', methods=['POST'])
def generate():
    if not client:
        return jsonify({'error': 'GROQ_API_KEY not configured'}), 503

    data = request.json
    prompt = data.get('prompt', '')
    system = data.get('system', 'You are a helpful assistant.')
    model = data.get('model', 'mixtral-8x7b-32768')

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            temperature=data.get('temperature', 0.7),
            max_tokens=data.get('max_tokens', 4096)
        )
        return jsonify({'response': completion.choices[0].message.content})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
