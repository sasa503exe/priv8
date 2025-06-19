const app = document.getElementById("app");
const toast = document.getElementById("toast");

function showToast(message, type = "error") {
  toast.textContent = message;
  toast.className = `fixed top-4 right-4 p-4 rounded shadow text-white ${type === "error" ? "bg-red-600" : "bg-green-600"} z-50`;
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
      if (!localStorage.getItem("saldoCapital")) {
        renderDefinirSaldo();
      } else {
        localStorage.setItem("auth", "true");
        renderMenu();
      }
    } else {
      showToast("Credenciais inválidas!");
    }
  };
}

function renderDefinirSaldo() {
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <div class="bg-white p-6 rounded shadow w-80">
        <h1 class="text-xl font-bold mb-4 text-red-700">Definir Saldo Inicial</h1>
        <input type="number" id="saldo" placeholder="Saldo Capital (R$)" step="0.01" class="border p-2 w-full mb-4">
        <button id="salvarSaldo" class="bg-green-600 text-white px-4 py-2 rounded w-full">Salvar</button>
      </div>
    </div>
  `;

  document.getElementById("salvarSaldo").onclick = () => {
    const saldo = parseFloat(document.getElementById("saldo").value);
    if (isNaN(saldo) || saldo < 0) {
      showToast("Saldo deve ser um valor positivo!");
      return;
    }
    localStorage.setItem("saldoCapital", saldo);
    localStorage.setItem("auth", "true");
    renderMenu();
  };
}

function renderMenu() {
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <div class="bg-white p-6 rounded shadow w-80">
        <h1 class="text-xl font-bold mb-4 text-red-700">Agiota Control PRO</h1>
        <div class="text-right mb-4 text-sm">Saldo: ${formatarMoeda(saldo)}</div>
        <button id="verDevedores" class="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2">Ver Devedores</button>
        <button id="gerarDivida" class="bg-green-600 text-white px-4 py-2 rounded w-full mb-2">Gerar Dívida</button>
        <button id="sair" class="bg-gray-300 px-4 py-2 rounded w-full">Sair</button>
      </div>
    </div>
  `;

  document.getElementById("verDevedores").onclick = () => renderDevedores();
  document.getElementById("gerarDivida").onclick = () => renderGerarDivida();
  document.getElementById("sair").onclick = () => {
    localStorage.removeItem("auth");
    renderLogin();
  };
}

function renderDevedores() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  const totalDevido = dividas.filter(d => !d.pago).reduce((sum, d) => {
    const venc = new Date(d.vencimento);
    const diasAtraso = Math.max(0, Math.floor((new Date() - venc) / (1000 * 60 * 60 * 24)));
    const taxaDiaria = d.juros / 100 / 30;
    return sum + (d.valor * (1 + taxaDiaria * diasAtraso));
  }, 0);
  const saldoAtual = saldo + totalDevido;

  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-red-700 mb-4">📋 Lista de Devedores</h1>
      <div class="text-right mb-4 text-sm">Saldo Atual: ${formatarMoeda(saldoAtual)}</div>
      <div id="lista"></div>
      <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded mt-4">Voltar ao Menu</button>
    </div>
  `;

  renderListaDevedores(dividas);
  document.getElementById("voltarMenu").onclick = () => renderMenu();
}

function renderListaDevedores(dividas) {
  const container = document.getElementById("lista");
  if (!dividas.length) {
    container.innerHTML = "<p class='text-gray-500'>Nenhum devedor cadastrado.</p>";
    return;
  }

  const hoje = new Date();
  container.innerHTML = dividas.map(d => {
    const venc = new Date(d.vencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
    const vencido = hoje > venc;
    const taxaDiaria = d.juros / 100 / 30;
    const valorFinal = d.valor * (1 + taxaDiaria * diasAtraso);

    return `
      <div class="bg-white p-4 rounded shadow mb-2">
        <div class="font-bold text-lg">${d.nome}</div>
        <div class="text-sm">Telefone: ${d.numero || 'Não informado'}</div>
        <div class="text-sm">Valor inicial: ${formatarMoeda(d.valor)}</div>
        <div class="text-sm">Vencimento: ${formatarData(d.vencimento)}</div>
        <div class="text-sm">Total ${vencido ? `(com juros, ${diasAtraso} dias)` : ''}: ${formatarMoeda(valorFinal)}</div>
        ${vencido && !d.pago ? `<div class="text-sm text-red-600">Atraso: ${diasAtraso} dias</div>` : ''}
        <div class="mt-2 flex gap-2">
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : ''}
          <button onclick="editarDivida(${d.id})" class="bg-yellow-500 text-black px-3 py-1 rounded">Editar</button>
          <button onclick="excluirDivida(${d.id})" class="bg-red-600 text-white px-3 py-1 rounded">Excluir</button>
          <a href="https://wa.me/${encodeURIComponent(d.numero || '')}?text=Oi%20${encodeURIComponent(d.nome)},%20voc%C3%A1%20est%C3%A1%20devendo%20${encodeURIComponent(formatarMoeda(valorFinal))}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
        </div>
      </div>
    `;
  }).join("");
}

function renderGerarDivida() {
  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-red-700 mb-4">Nova Dívida</h1>
      <div class="bg-white p-4 rounded shadow">
        <input placeholder="Nome do devedor" id="nome" class="border p-2 w-full mb-2">
        <input placeholder="Número do devedor" id="numero" class="border p-2 w-full mb-2">
        <input placeholder="Valor emprestado" id="valor" type="number" step="0.01" class="border p-2 w-full mb-2">
        <input placeholder="Juros mensal (%)" id="juros" type="number" step="0.1" class="border p-2 w-full mb-2">
        <input placeholder="Data do empréstimo" id="data" type="date" class="border p-2 w-full mb-2">
        <input placeholder="Data de vencimento" id="vencimento" type="date" class="border p-2 w-full mb-2">
        <button id="addDivida" class="bg-yellow-500 text-black px-4 py-2 rounded">Salvar dívida</button>
      </div>
      <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded mt-4">Voltar ao Menu</button>
    </div>
  `;

  document.getElementById("addDivida").onclick = () => {
    const nome = document.getElementById("nome").value.trim();
    const numero = document.getElementById("numero").value.trim();
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

    const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
    dividas.push({ id: Date.now(), nome, numero, valor, juros, data, vencimento, pago: false });
    localStorage.setItem("dividas", JSON.stringify(dividas));
    showToast("Dívida adicionada com sucesso!", "success");
    renderGerarDivida();
  };

  document.getElementById("voltarMenu").onclick = () => renderMenu();
}

function editarDivida(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const divida = dividas.find(d => d.id === id);

  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-red-700 mb-4">Editar Dívida</h1>
      <div class="bg-white p-4 rounded shadow">
        <input value="${divida.nome}" id="nome" class="border p-2 w-full mb-2">
        <input value="${divida.numero || ''}" id="numero" class="border p-2 w-full mb-2">
        <input value="${divida.valor}" id="valor" type="number" step="0.01" class="border p-2 w-full mb-2">
        <input value="${divida.juros}" id="juros" type="number" step="0.1" class="border p-2 w-full mb-2">
        <input value="${divida.data}" id="data" type="date" class="border p-2 w-full mb-2">
        <input value="${divida.vencimento}" id="vencimento" type="date" class="border p-2 w-full mb-2">
        <button id="salvarDivida" class="bg-yellow-500 text-black px-4 py-2 rounded">Salvar</button>
      </div>
      <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded mt-4">Voltar ao Menu</button>
    </div>
  `;

  document.getElementById("salvarDivida").onclick = () => {
    const nome = document.getElementById("nome").value.trim();
    const numero = document.getElementById("numero").value.trim();
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

    const atualizadas = dividas.map(d => d.id === id ? { ...d, nome, numero, valor, juros, data, vencimento } : d);
    localStorage.setItem("dividas", JSON.stringify(atualizadas));
    showToast("Dívida atualizada com sucesso!", "success");
    renderDevedores();
  };

  document.getElementById("voltarMenu").onclick = () => renderDevedores();
}

function pagar(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const atualizadas = dividas.map(d => d.id === id ? { ...d, pago: true } : d);
  localStorage.setItem("dividas", JSON.stringify(atualizadas));
  showToast("Dívida marcada como paga!", "success");
  renderDevedores();
}

function excluirDivida(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const atualizadas = dividas.filter(d => d.id !== id);
  localStorage.setItem("dividas", JSON.stringify(atualizadas));
  showToast("Dívida excluída com sucesso!", "success");
  renderDevedores();
}

if (!localStorage.getItem("auth")) {
  renderLogin();
} else {
  renderMenu();
}
