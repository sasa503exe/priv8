
const senhaCorreta = "agiota123";
let dividas = JSON.parse(localStorage.getItem('dividas')) || [];

function salvarDividas() {
  localStorage.setItem('dividas', JSON.stringify(dividas));
}

function login() {
  const inputSenha = document.getElementById("senha").value;
  if (inputSenha === senhaCorreta) {
    document.getElementById("login-area").style.display = "none";
    document.getElementById("main").style.display = "block";
    render();
  } else {
    alert("Senha incorreta!");
  }
}

function adicionarDivida() {
  const nome = document.getElementById("nome").value;
  const valor = document.getElementById("valor").value;
  const data = document.getElementById("data").value;
  const whatsapp = document.getElementById("whatsapp").value;

  if (!nome || !valor || !data || !whatsapp) {
    alert("Preencha todos os campos.");
    return;
  }

  dividas.push({ nome, valor, data, whatsapp, pago: false });
  salvarDividas();
  render();
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = '';
  if (dividas.length === 0) {
    app.innerHTML = "<p>Nenhuma dívida cadastrada.</p>";
    return;
  }

  dividas.forEach((d, i) => {
    const el = document.createElement("div");
    el.className = "divida-item";
    el.innerHTML = `
      <strong>${d.nome}</strong><br>
      Valor: R$ ${d.valor}<br>
      Vencimento: ${d.data}<br>
      WhatsApp: ${d.whatsapp}<br>
      ${d.pago ? "<span style='color:green;'>✔ Pago</span><br>" : ""}
      <button onclick="marcarPago(${i})">Marcar como pago</button>
      <button onclick="excluirDivida(${i})">Excluir</button>
      <button onclick="cobrarZap('${d.whatsapp}', '${d.nome}', '${d.valor}')">Cobrar no Zap</button>
    `;
    app.appendChild(el);
  });
}

function marcarPago(i) {
  dividas[i].pago = true;
  salvarDividas();
  render();
}

function excluirDivida(i) {
  if (confirm("Tem certeza que deseja excluir esta dívida?")) {
    dividas.splice(i, 1);
    salvarDividas();
    render();
  }
}

function cobrarZap(num, nome, valor) {
  const numero = num.replace(/\D/g, "");
  const texto = encodeURIComponent(`Olá ${nome}, estou passando para lembrar da dívida de R$${valor}, vencida hoje.`);
  window.open(`https://wa.me/55${numero}?text=${texto}`, "_blank");
}
