// Pix Payment Gateway - BETA
// Sistema de pagamentos via Pix

const fs = require('fs');
const path = require('path');

class PixGateway {
  constructor() {
    this.transactionsFile = path.join(__dirname, 'pix-transactions.json');
    this.transactions = [];
    try {
      if (fs.existsSync(this.transactionsFile)) {
        this.transactions = JSON.parse(fs.readFileSync(this.transactionsFile, 'utf8'));
      }
    } catch (e) { this.transactions = []; }
  }

  async createCharge(valor, descricao) {
    const codigo = 'PIX_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const charge = {
      codigo,
      valor: parseFloat(valor),
      descricao: descricao || 'Pagamento VPS Hosting',
      status: 'pendente',
      created_at: new Date().toISOString(),
      pix_copia_cola: this.generatePixCode(codigo, valor),
      metodo: 'PIX'
    };

    this.transactions.push(charge);
    fs.writeFileSync(this.transactionsFile, JSON.stringify(this.transactions, null, 2));

    console.log(`💰 Pix gerado: ${codigo} - R$ ${parseFloat(valor).toFixed(2)}`);

    return {
      success: true,
      message: 'Cobrança Pix criada (BETA)',
      codigo: charge.codigo,
      valor: charge.valor,
      descricao: charge.descricao,
      pix_copia_cola: charge.pix_copia_cola,
      status: 'pendente'
    };
  }

  generatePixCode(codigo, valor) {
    const valorStr = parseFloat(valor).toFixed(2).replace('.', '');
    return `00020126580014br.gov.bcb.pix0136${codigo}52040000530398654${String(valorStr).padStart(10,'0')}5802BR5925VPS Hosting6009Sao Paulo62070503***6304`;
  }

  async checkStatus(codigo) {
    const tx = this.transactions.find(t => t.codigo === codigo);
    if (!tx) return { status: 'nao_encontrado' };
    return { codigo: tx.codigo, status: tx.status, valor: tx.valor };
  }

  async confirmPayment(codigo) {
    const tx = this.transactions.find(t => t.codigo === codigo);
    if (!tx) return { error: 'Não encontrado' };
    tx.status = 'confirmado';
    tx.confirmed_at = new Date().toISOString();
    fs.writeFileSync(this.transactionsFile, JSON.stringify(this.transactions, null, 2));
    return { success: true, message: 'Pagamento confirmado', codigo };
  }

  async getTransactions() {
    return { transactions: this.transactions.slice(-50).reverse() };
  }
}

module.exports = new PixGateway();
