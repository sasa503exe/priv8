const app = document.getElementById('app');
let dividas = JSON.parse(localStorage.getItem('dividas')) || [];

function salvarDividas() {
  localStorage.setItem('dividas', JSON.stringify(dividas));
}

function render() {
  app.innerHTML = '<h2>Controle de Dívidas</h2>';
  if (dividas.length === 0) {
    app.innerHTML += '<p>Nenhuma dívida registrada.</p>';
    return;
  }

  dividas.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'divida-item';
    div.innerHTML = `
      <strong>${d.nome}</strong><br>
      Valor: R$ ${d.valor} <br>
      Vencimento: ${d.data} <br>
      WhatsApp: ${d.whatsapp} <br>
      ${d.pago ? '<span style="color:green;">✔ Pago</span><br>' : ''}
      <button onclick="marcarPago(${i})">Marcar como pago</button>
      <button onclick="excluirDivida(${i})">Excluir</button>
      <button onclick="cobrarZap('${d.whatsapp}', '${d.nome}', '${d.valor}')">Cobrar no Zap</button>
      <hr>
    `;
    app.appendChild(div);
  });
}

function marcarPago(i) {
  dividas[i].pago = true;
  salvarDividas();
  render();
}

function excluirDivida(i) {
  if (confirm(`Deseja excluir a dívida de ${dividas[i].nome}?`)) {
    dividas.splice(i, 1);
    salvarDividas();
    render();
  }
}

function cobrarZap(whats, nome, valor) {
  const numero = whats.replace(/\D/g, '');
  const texto = encodeURIComponent(`Olá ${nome}, lembrando que hoje vence o pagamento de R$${valor}.`);
  const link = `https://wa.me/55${numero}?text=${texto}`;
  window.open(link, '_blank');
}

// Debug: exemplo automático
if (dividas.length === 0) {
  dividas.push({
    nome: 'João do Pneu',
    valor: 2000,
    data: '2025-07-19',
    whatsapp: '51999999999',
    pago: false
  });
  salvarDividas();
}

render();
