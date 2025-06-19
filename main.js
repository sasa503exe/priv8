const app = document.getElementById("app");

function renderLogin() {
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <div class="bg-white p-6 rounded shadow w-80">
        <h1 class="text-xl font-bold mb-4 text-red-700">Agiota Control PRO</h1>
        <input type="text" id="email" placeholder="Email" class="border p-2 w-full mb-2">
        <input type="password" id="senha" placeholder="Senha" class="border p-2 w-full mb-4">
        <button id="entrar" class="bg-red-600 text-white px-4 py-2 rounded w-full">Entrar</button>
      </div>
    </div>
  `;

  document.getElementById("entrar").onclick = () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    if (email === "agiota@local" && senha === "123456") {
      localStorage.setItem("auth", "true");
      renderDashboard();
    } else {
      alert("Credenciais inválidas.");
    }
  };
}

function renderDashboard() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");

  app.innerHTML = `
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-red-700">📋 Painel de Dívidas</h1>
        <button id="logout" class="bg-gray-300 px-3 py-1 rounded">Sair</button>
      </div>
      <div class="bg-white p-4 rounded shadow mb-4">
        <h2 class="font-semibold mb-2">Nova Dívida</h2>
        <input placeholder="Nome do devedor" id="nome" class="border p-2 w-full mb-2">
        <input placeholder="Valor emprestado (R$)" id="valor" type="number" class="border p-2 w-full mb-2">
        <input placeholder="Juros mensal (%)" id="juros" type="number" class="border p-2 w-full mb-2">
        <input placeholder="Data do empréstimo" id="data" type="date" class="border p-2 w-full mb-2">
        <input placeholder="Data de vencimento" id="vencimento" type="date" class="border p-2 w-full mb-2">
        <button id="addDivida" class="bg-yellow-500 text-black px-4 py-2 rounded">Salvar dívida</button>
      </div>
      <div id="lista"></div>
    </div>
  `;

  document.getElementById("logout").onclick = () => {
    localStorage.removeItem("auth");
    renderLogin();
  };

  document.getElementById("addDivida").onclick = () => {
    const nome = document.getElementById("nome").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const juros = parseFloat(document.getElementById("juros").value);
    const data = document.getElementById("data").value;
    const vencimento = document.getElementById("vencimento").value;

    if (!nome || !valor || !juros || !data || !vencimento) return alert("Preencha tudo!");

    dividas.push({ id: Date.now(), nome, valor, juros, data, vencimento, pago: false });
    localStorage.setItem("dividas", JSON.stringify(dividas));
    renderDashboard();
  };

  renderLista(dividas);
}

function renderLista(dividas) {
  const container = document.getElementById("lista");
  if (!dividas.length) {
    container.innerHTML = "<p>Nenhuma dívida cadastrada.</p>";
    return;
  }

  const hoje = new Date();
  container.innerHTML = dividas.map(d => {
    const venc = new Date(d.vencimento);
    const dias = Math.floor((hoje - venc) / (1000 * 60 * 60 * 24));
    const vencido = hoje > venc;
    const valorFinal = vencido ? d.valor + (d.valor * d.juros / 100) : d.valor;
    return `
      <div class="bg-white p-4 rounded shadow mb-2 ${d.pago ? 'opacity-50' : ''}">
        <div class="font-bold text-lg">${d.nome}</div>
        <div class="text-sm">Valor inicial: R$ ${d.valor.toFixed(2)}</div>
        <div class="text-sm">Vencimento: ${d.vencimento}</div>
        <div class="text-sm">Total ${vencido ? '(com juros)' : ''}: R$ ${valorFinal.toFixed(2)}</div>
        <div class="mt-2 flex gap-2">
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : ''}
          <a href="https://wa.me/?text=Oi%20${d.nome},%20est%C3%A1%20devendo%20R$%20${valorFinal.toFixed(2)}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
        </div>
      </div>
    `;
  }).join("");
}

function pagar(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const atualizadas = dividas.map(d => d.id === id ? { ...d, pago: true } : d);
  localStorage.setItem("dividas", JSON.stringify(atualizadas));
  renderDashboard();
}

if (localStorage.getItem("auth") === "true") {
  renderDashboard();
} else {
  renderLogin();
}
