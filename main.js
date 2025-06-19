const app = document.getElementById("app");
const toast = document.getElementById("toast");

function showToast(message, type = "error") {
  toast.textContent = message;
  toast.className = `fixed top-4 right-4 p-4 rounded shadow text-white ${type === "error" ? "bg-red-600" : "bg-green-600"}`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function formatarData(data) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(data));
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

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
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    if (!email || !senha) {
      showToast("Preencha email e senha!");
      return;
    }
    if (email === "agiota@local" && senha === "123456") {
      localStorage.setItem("auth", "true");
      renderDashboard();
    } else {
      showToast("Credenciais inválidas!");
    }
  };
}

function renderDashboard() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");

  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-red-700">📋 Painel de Dívidas</h1>
        <button id="logout" class="bg-gray-300 px-3 py-1 rounded">Sair</button>
      </div>
      <div class="bg-white p-4 rounded shadow mb-4">
        <h2 class="font-semibold mb-2">Nova Dívida</h2>
        <input placeholder="Nome do devedor" id="nome" class="border p-2 w-full mb-2">
        <input placeholder="Valor emprestado" id="valor" type="number" step="0.01" class="border p-2 w-full mb-2">
        <input placeholder="Juros mensal (%)" id="juros" type="number" step="0.1" class="border p-2 w-full mb-2">
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
    const nome = document.getElementById("nome").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    const juros = parseFloat(document.getElementById("juros").value);
    const data = document.getElementById("data").value;
    const vencimento = document.getElementById("vencimento").value;

    if (!nome) {
      showToast("Insira o nome do devedor!");
      return;
    }
    if (isNaN(valor) || valor <= 0) {
      showToast("Valor deve ser maior que zero!");
      return;
    }
    if (isNaN(juros) || juros < 0) {
      showToast("Juros deve ser zero ou positivo!");
      return;
    }
    if (!data || !vencimento) {
      showToast("Preencha as datas!");
      return;
    }
    if (new Date(data) >= new Date(vencimento)) {
      showToast("Vencimento deve ser após o empréstimo!");
      return;
    }

    dividas.push({ id: Date.now(), nome, valor, juros, data, vencimento, pago: false });
    localStorage.setItem("dividas", JSON.stringify(dividas));
    showToast("Dívida adicionada com sucesso!", "success");
    renderLista(dividas);
  };

  renderLista(dividas);
}

function renderLista(dividas) {
  const container = document.getElementById("lista");
  if (!dividas.length) {
    container.innerHTML = "<p class='text-gray-500'>Nenhuma dívida cadastrada.</p>";
    return;
  }

  const hoje = new Date();
  container.innerHTML = dividas.map(d => {
    const venc = new Date(d.vencimento);
    const mesesAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24 * 30)));
    const vencido = hoje > venc;
    const valorFinal = d.valor * (1 + (d.juros / 100) * mesesAtraso);

    return `
      <div class="bg-white p-4 rounded shadow mb-2 ${d.pago ? 'opacity-50' : ''}">
        <div class="font-bold text-lg">${d.nome}</div>
        <div class="text-sm">Valor inicial: ${formatarMoeda(d.valor)}</div>
        <div class="text-sm">Vencimento: ${formatarData(d.vencimento)}</div>
        <div class="text-sm">Total ${vencido ? `(com juros, ${mesesAtraso} meses)` : ''}: ${formatarMoeda(valorFinal)}</div>
        ${vencido && !d.pago ? `<div class="text-sm text-red-600">Atraso: ${mesesAtraso} meses</div>` : ''}
        <div class="mt-2 flex gap-2">
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : ''}
          <a href="https://wa.me/?text=Oi%20${encodeURIComponent(d.nome)},%20voc%C3%AA%20est%C3%A1%20devendo%20${encodeURIComponent(formatarMoeda(valorFinal))}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
        </div>
      </div>
    `;
  }).join("");
}

function pagar(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const atualizadas = dividas.map(d => d.id === id ? { ...d, pago: true } : d);
  localStorage.setItem("dividas", JSON.stringify(atualizadas));
  showToast("Dívida marcada como paga!", "success");
  renderLista(atualizadas);
}

if (localStorage.getItem("auth") === "true") {
  renderDashboard();
} else {
  renderLogin();
}
