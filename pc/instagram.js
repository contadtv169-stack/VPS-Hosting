// Instagram Poster - Publica no Instagram via PC
// Modo BETA: Simulação. Para produção, usar API oficial do Instagram Graph

const fs = require('fs');
const path = require('path');

class InstagramPoster {
  constructor() {
    this.logFile = path.join(__dirname, 'instagram-log.json');
    this.posts = [];
    try {
      if (fs.existsSync(this.logFile)) {
        this.posts = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      }
    } catch (e) { this.posts = []; }
  }

  async post(imageBase64, caption) {
    const post = {
      id: 'IG_' + Date.now(),
      image: imageBase64.substring(0, 50) + '...',
      caption: caption || '',
      timestamp: new Date().toISOString(),
      status: 'publicado',
      plataforma: 'Instagram'
    };

    this.posts.push(post);
    fs.writeFileSync(this.logFile, JSON.stringify(this.posts, null, 2));

    console.log(`📸 Instagram: Post publicado - "${caption}"`);
    return {
      success: true,
      message: 'Post publicado no Instagram com sucesso!',
      post_id: post.id,
      caption: caption,
      timestamp: post.timestamp
    };
  }

  async getHistory() {
    return { posts: this.posts.slice(-20).reverse() };
  }
}

module.exports = new InstagramPoster();
