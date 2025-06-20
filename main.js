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

function validarData(dataStr) {
  const [dia, mes, ano] = dataStr.split('/').map(Number);
  if (!dataStr.match(/^\d{2}\/\d{2}\/\d{4}$/) || dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 2000 || ano > 2100) {
    return null;
  }
  return new Date(ano, mes - 1, dia);
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

function renderAlterarSaldo() {
  const saldoAtual = parseFloat(localStorage.getItem "saldoCapital") || 0);
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <div class="bg-white p-6 rounded shadow w-80">
        <h1 class="text-xl font-bold mb-4 text-red-700">Alterar Saldo Capital</h1>
        <input type="number" id="saldo" value="${saldoAtual}" placeholder="Saldo Capital (R$)" step="0.01" class="border p-2 w-full mb-4">
        <button id="salvarSaldo" class="bg-green-600 text-white px-4 py-2 rounded w-full">Salvar</button>
        <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded w-full mt-2">Voltar ao Menu</button>
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
    showToast("Saldo atualizado com sucesso!", "success");
    renderMenu();
  };

  document.getElementById("voltarMenu").onclick = () => renderMenu();
}

function renderMenu() {
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  app.innerHTML = `
    <div class="flex flex-col h-screen bg-yellow-100">
      <div class="bg-white p-4 shadow flex justify-between items-center">
        <h1 class="text-xl font-bold text-red-700">Agiota Control PRO</h1>
        <button id="menuToggle" class="text-2xl">📋</button>
      </div>
      <div id="menu" class="hidden bg-white shadow w-64 fixed top-0 left-0 h-full p-4 z-50">
        <button id="fecharMenu" class="text-xl mb-4">✖</button>
        <div class="text-sm mb-4">Saldo: ${formatarMoeda(saldo)}</div>
        <button id="verDevedores" class="block bg-blue-600 text-white px-4 py-2 rounded w-full mb-2">Ver Devedores</button>
        <button id="gerarDivida" class="block bg-green-600 text-white px-4 py-2 rounded w-full mb-2">Gerar Dívida</button>
        <button id="alterarSaldo" class="block bg-yellow-500 text-black px-4 py-2 rounded w-full mb-2">Alterar Saldo</button>
        <button id="sair" class="block bg-gray-300 px-4 py-2 rounded w-full">Sair</button>
      </div>
      <div id="overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>
    </div>
  `;

  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  const fecharMenu = document.getElementById("fecharMenu");
  const overlay = document.getElementById("overlay");

  menuToggle.onclick = () => {
    menu.classList.toggle("hidden");
    overlay.classList.toggle("hidden");
  };

  fecharMenu.onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  overlay.onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  document.getElementById("verDevedores").onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
    renderDevedores();
  };

  document.getElementById("gerarDivida").onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
    renderGerarDivida();
  };

  document.getElementById("alterarSaldo").onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
    renderAlterarSaldo();
  };

  document.getElementById("sair").onclick = () => {
    localStorage.removeItem("auth");
    renderLogin();
  };
}

function renderDevedores() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  const hoje = new Date("2025-06-19T18:39:00-03:00"); // Data atual ajustada
  const totalDevido = dividas.filter(d => !d.pago).reduce((sum, d) => {
    const venc = new Date(d.vencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
    const taxaDiaria = d.juros / 100 / 30; // Juros mensal pra diária
    const valorJuros = d.valor * taxaDiaria * diasAtraso;
    return sum + (d.valor + valorJuros);
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

  const hoje = new Date("2025-06-19T18:39:00-03:00"); // Data atual ajustada
  container.innerHTML = dividas.map(d => {
    const dataEmprestimo = validarData(d.data); // Data do empréstimo
    const venc = new Date(d.vencimento); // Data de vencimento
    dataEmprestimo.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24))); // Dias após vencimento
    const diasEmprestimo = Math.max(1, Math.floor((venc - dataEmprestimo) / (1000 * 60 * 60 * 24))); // Dias do empréstimo
    const vencido = hoje > venc;

    // Calcular juros para o período do empréstimo
    const taxaDiaria = d.juros / 100 / 30; // Juros mensal dividido por 30 dias
    const valorJurosEmprestimo = d.valor * taxaDiaria * diasEmprestimo; // Juros até o vencimento
    const valorJurosAtraso = d.valor * taxaDiaria * diasAtraso; // Juros por atraso
    const valorJuros = vencido ? valorJurosEmprestimo + valorJurosAtraso : valorJurosEmprestimo; // Total de juros
    const valorFinal = d.valor + valorJuros; // Total a pagar

    return `
      <div class="bg-white p-4 rounded shadow mb-2">
        <div class="font-bold text-lg">${d.nome}</div>
        <div class="text-sm">Telefone: ${d.numero || 'Não informado'}</div>
        <div class="text-sm">Valor inicial: ${formatarMoeda(d.valor)}</div>
        <div class="text-sm">Vencimento: ${formatarData(d.vencimento)}</div>
        <div class="text-sm">Juros: ${formatarMoeda(valorJuros)}</div>
        <div class="text-sm">Total ${vencido ? `(atraso ${diasAtraso} dias)` : ''}: ${formatarMoeda(valorFinal)}</div>
        ${vencido && !d.pago ? `<div class="text-sm text-red-600">Atraso: ${diasAtraso} dias</div>` : ''}
        <div class="mt-2 flex gap-2 flex-wrap">
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : `<button onclick="desmarcarPago(${d.id})" class="bg-orange-600 text-white px-3 py-1 rounded">Marcar não pago</button>`}
          <button onclick="editarDivida(${d.id})" class="bg-yellow-500 text-black px-3 py-1 rounded">Editar</button>
          <button onclick="excluirDivida(${d.id})" class="bg-red-600 text-white px-3 py-1 rounded">Excluir</button>
          <a href="https://wa.me/${encodeURIComponent(d.numero || '')}?text=Oi%20${encodeURIComponent(d.nome)},%20voc%C3%AA%20est%C3%A1%20devendo%20${encodeURIComponent(formatarMoeda(valorFinal))}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
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
        <input placeholder="Juros mensal (%)" id="juros" type="number" min="20" max="30" class="border p-2 w-full mb-2">
        <input placeholder="Data do empréstimo (dd/mm/aaaa)" id="data" type="text" pattern="\d{2}/\d{2}/\d{4}" class="border p-2 w-full mb-2">
        <button id="definirPrazo" class="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2">Definir Prazo</button>
        <select id="prazo" class="border p-2 w-full mb-2 hidden">
          <option value="20">20 dias</option>
          <option value="30">30 dias</option>
        </select>
        <button id="addDivida" class="bg-yellow-500 text-black px-4 py-2 rounded">Salvar dívida</button>
      </div>
      <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded mt-4">Voltar ao Menu</button>
    </div>
  `;

  const definirPrazoBtn = document.getElementById("definirPrazo");
  const prazoSelect = document.getElementById("prazo");
  definirPrazoBtn.onclick = () => {
    prazoSelect.classList.toggle("hidden");
    if (!prazoSelect.classList.contains("hidden")) {
      prazoSelect.focus();
    }
  };

  document.getElementById("addDivida").onclick = () => {
    const nome = document.getElementById("nome").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    const juros = parseInt(document.getElementById("juros").value);
    const dataStr = document.getElementById("data").value.trim();
    const prazo = document.getElementById("prazo").value;
    const data = validarData(dataStr);
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    const vencimento = new Date(ano, mes - 1, dia + parseInt(prazo)).toISOString().split('T')[0];

    if (!nome) {
      showToast("Insira o nome do devedor!");
      return;
    }
    if (isNaN(valor) || valor <= 0) {
      showToast("Valor deve ser maior que zero!");
      return;
    }
    if (isNaN(juros) || ![20, 30].includes(juros)) {
      showToast("Juros deve ser 20% ou 30%!");
      return;
    }
    if (!data) {
      showToast("Data inválida! Use dd/mm/aaaa.");
      return;
    }
    if (data >= new Date(vencimento)) {
      showToast("Vencimento deve ser após o empréstimo!");
      return;
    }

    const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
    dividas.push({ id: Date.now(), nome, numero, valor, juros, data: dataStr, vencimento, pago: false });
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
        <input value="${divida.juros}" id="juros" type="number" min="20" max="30" class="border p-2 w-full mb-2">
        <input value="${divida.data}" id="data" type="text" pattern="\d{2}/\d{2}/\d{4}" placeholder="dd/mm/aaaa" class="border p-2 w-full mb-2">
        <button id="definirPrazo" class="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2">Definir Prazo</button>
        <select id="prazo" class="border p-2 w-full mb-2 hidden">
          <option value="20" ${20 === (new Date(divida.vencimento) - new Date(divida.data.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24) ? 'selected' : ''}>20 dias</option>
          <option value="30" ${30 === (new Date(divida.vencimento) - new Date(divida.data.split('/').reverse().join('-'))) / (1000 * 60 * 60 * 24) ? 'selected' : ''}>30 dias</option>
        </select>
        <button id="salvarDivida" class="bg-yellow-500 text-black px-4 py-2 rounded">Salvar</button>
      </div>
      <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded mt-4">Voltar ao Menu</button>
    </div>
  `;

  const definirPrazoBtn = document.getElementById("definirPrazo");
  const prazoSelect = document.getElementById("prazo");
  definirPrazoBtn.onclick = () => {
    prazoSelect.classList.toggle("hidden");
    if (!prazoSelect.classList.contains("hidden")) {
      prazoSelect.focus();
    }
  };

  document.getElementById("salvarDivida").onclick = () => {
    const nome = document.getElementById("nome").value.trim();
    const numero = document.getElementById("numero").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    const juros = parseInt(document.getElementById("juros").value);
    const dataStr = document.getElementById("data").value.trim();
    const prazo = document.getElementById("prazo").value;
    const data = validarData(dataStr);
    const [dia, mes, ano] = dataStr.split('/').map(Number);
    const vencimento = new Date(ano, mes - 1, dia + parseInt(prazo)).toISOString().split('T')[0];

    if (!nome) {
      showToast("Insira o nome do devedor!");
      return;
    }
    if (isNaN(valor) || valor <= 0) {
      showToast("Valor deve ser maior que zero!");
      return;
    }
    if (isNaN(juros) || ![20, 30].includes(juros)) {
      showToast("Juros deve ser 20% ou 30%!");
      return;
    }
    if (!data) {
      showToast("Data inválida! Use dd/mm/aaaa.");
      return;
    }
    if (data >= new Date(vencimento)) {
      showToast("Vencimento deve ser após o empréstimo!");
      return;
    }

    const atualizadas = dividas.map(d => d.id === id ? { ...d, nome, numero, valor, juros, data: dataStr, vencimento } : d);
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

function desmarcarPago(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const atualizadas = dividas.map(d => d.id === id ? { ...d, pago: false } : d);
  localStorage.setItem("dividas", JSON.stringify(atualizadas));
  showToast("Dívida marcada como não paga!", "success");
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
