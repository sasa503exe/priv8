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
  const saldoAtual = parseFloat(localStorage.getItem("saldoCapital") || 0);
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
        <button id="configurarJuros" class="block bg-purple-600 text-white px-4 py-2 rounded w-full mb-2">Configurar Juros</button>
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

  document.getElementById("configurarJuros").onclick = () => {
    menu.classList.add("hidden");
    overlay.classList.add("hidden");
    renderConfigurarJuros();
  };

  document.getElementById("sair").onclick = () => {
    localStorage.removeItem("auth");
    renderLogin();
  };
}

function renderDevedores() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  const hoje = new Date();
  const totalDevido = dividas.filter(d => !d.pago).reduce((sum, d) => {
    const venc = new Date(d.vencimento);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
    const taxaDiaria = d.juros / 100 / 30;
    const valorJuros = d.valor * taxaDiaria * diasAtraso;
    return sum + (d.valor + valorJuros);
  }, 0);
  const saldoAtual = saldo + totalDevido;

  // Dashboard
  const lucroAcumulado = dividas.reduce((sum, d) => {
    const venc = new Date(d.vencimento);
    const diasEmprestimo = Math.max(1, Math.floor((hoje - new Date(validarData(d.data))) / (1000 * 60 * 60 * 24)));
    const taxaDiaria = d.juros / 100 / 30;
    const jurosTotais = d.valor * taxaDiaria * diasEmprestimo;
    return sum + (d.pago ? jurosTotais : 0);
  }, 0);
  const valorHoje = dividas.filter(d => !d.pago && new Date(d.vencimento).toDateString() === hoje.toDateString()).reduce((sum, d) => sum + d.valor, 0);
  const inadimplentes = dividas.filter(d => !d.pago && hoje > new Date(d.vencimento)).length;
  const totalDevedores = dividas.length;
  const percentualInadimplentes = totalDevedores ? (inadimplentes / totalDevedores * 100).toFixed(1) : 0;

  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <div class="bg-white p-4 rounded shadow mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div class="text-center"><strong>Saldo</strong><br>${formatarMoeda(saldoAtual)}</div>
        <div class="text-center"><strong>Lucro</strong><br>${formatarMoeda(lucroAcumulado)}</div>
        <div class="text-center"><strong>Hoje</strong><br>${formatarMoeda(valorHoje)}</div>
        <div class="text-center"><strong>Inadimplentes</strong><br>${percentualInadimplentes}%</div>
      </div>
      <h1 class="text-2xl font-bold text-red-700 mb-4">📋 Lista de Devedores</h1>
      <div class="mb-4">
        <input id="busca" placeholder="Pesquisar por nome ou número" class="border p-2 w-full mb-2">
        <label class="flex items-center">
          <input type="checkbox" id="filtroNaoPagos" class="mr-2">
          Mostrar só não pagos
        </label>
      </div>
      <div id="lista"></div>
      <div class="mt-4 flex gap-2">
        <button id="exportarDados" class="bg-blue-600 text-white px-4 py-2 rounded">Exportar</button>
        <button id="importarDados" class="bg-green-600 text-white px-4 py-2 rounded">Importar</button>
        <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded">Voltar ao Menu</button>
      </div>
    </div>
  `;

  const buscaInput = document.getElementById("busca");
  const filtroNaoPagos = document.getElementById("filtroNaoPagos");

  function atualizarLista() {
    const termoBusca = buscaInput.value.toLowerCase();
    const filtrarNaoPagos = filtroNaoPagos.checked;
    const dividasFiltradas = dividas.filter(d => {
      const bateNome = d.nome.toLowerCase().includes(termoBusca);
      const bateNumero = d.numero ? d.numero.includes(termoBusca) : false;
      const naoPago = !d.pago;
      return (bateNome || bateNumero) && (!filtrarNaoPagos || naoPago);
    });
    renderListaDevedores(dividasFiltradas);
  }

  buscaInput.oninput = atualizarLista;
  filtroNaoPagos.onchange = atualizarLista;

  document.getElementById("exportarDados").onclick = exportarDados;
  document.getElementById("importarDados").onclick = () => document.getElementById("importFile").click();
  document.getElementById("voltarMenu").onclick = () => renderMenu();

  // Input oculto pra importação
  app.insertAdjacentHTML("beforeend", '<input type="file" id="importFile" accept=".json" class="hidden" onchange="importarDados(event)">');

  renderListaDevedores(dividas);
}

function renderListaDevedores(dividas) {
  const container = document.getElementById("lista");
  if (!dividas.length) {
    container.innerHTML = "<p class='text-gray-500'>Nenhum devedor encontrado.</p>";
    return;
  }

  const hoje = new Date();
  container.innerHTML = dividas.map(d => {
    const dataEmprestimo = validarData(d.data);
    const venc = new Date(d.vencimento);
    dataEmprestimo.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
    const vencido = hoje > venc;
    const hojeVencimento = hoje.toDateString() === venc.toDateString();
    const statusIcon = vencido ? "🔴" : hojeVencimento ? "🟡" : "🟢";
    const statusClass = vencido ? "text-red-600" : hojeVencimento ? "text-yellow-600" : "text-green-600";

    const taxaDiaria = d.juros / 100 / 30;
    const diasEmprestimo = Math.max(1, Math.floor((venc - dataEmprestimo) / (1000 * 60 * 60 * 24)));
    const valorJurosEmprestimo = d.valor * taxaDiaria * diasEmprestimo;
    const valorJurosAtraso = d.valor * taxaDiaria * diasAtraso;
    const valorJuros = vencido ? valorJurosEmprestimo + valorJurosAtraso : valorJurosEmprestimo;
    const valorFinal = d.valor + valorJuros;

    const alertaClasse = vencido ? "bg-red-200" : hojeVencimento ? "bg-yellow-200" : "";
    const localizacao = d.localizacao || "Não informada";

    return `
      <div class="bg-white p-4 rounded shadow mb-2 ${alertaClasse}">
        <div class="font-bold text-lg ${statusClass}">${statusIcon} ${d.nome}</div>
        <div class="text-sm">Telefone: ${d.numero || 'Não informado'}</div>
        <div class="text-sm">Valor inicial: ${formatarMoeda(d.valor)}</div>
        <div class="text-sm">Vencimento: ${formatarData(d.vencimento)}</div>
        <div class="text-sm">Localização: ${localizacao}</div>
        <div class="text-sm">Juros: ${formatarMoeda(valorJuros)}</div>
        <div class="text-sm">Total ${vencido ? `(atraso ${diasAtraso} dias)` : ''}: ${formatarMoeda(valorFinal)}</div>
        ${d.historicoPagamentos && d.historicoPagamentos.length ? `<div class="text-sm">Histórico: ${d.historicoPagamentos.map(p => `${p.data}: ${formatarMoeda(p.valor)}`).join(', ')}</div>` : ''}
        <div class="mt-2 flex gap-2 flex-wrap">
          ${!d.pago ? `<button onclick="registrarPagamentoParcial(${d.id}, prompt('Valor pago (R$):', ${d.valor / 2}))" class="bg-purple-600 text-white px-3 py-1 rounded">Registrar Pagamento</button>` : ''}
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : `<button onclick="desmarcarPago(${d.id})" class="bg-orange-600 text-white px-3 py-1 rounded">Marcar não pago</button>`}
          <button onclick="editarDivida(${d.id})" class="bg-yellow-500 text-black px-3 py-1 rounded">Editar</button>
          <button onclick="excluirDivida(${d.id})" class="bg-red-600 text-white px-3 py-1 rounded">Excluir</button>
          <a href="https://wa.me/${encodeURIComponent(d.numero || '')}?text=Oi%20${encodeURIComponent(d.nome)},%20voc%C3%A9%20est%C3%A1%20devendo%20${encodeURIComponent(formatarMoeda(valorFinal))}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
          ${!d.pago ? `<button onclick="gerarQRCodePIX(${d.id})" class="bg-blue-500 text-white px-3 py-1 rounded">PIX</button>` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function registrarPagamentoParcial(id, valorPago) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const divida = dividas.find(d => d.id === id);
  if (divida && !divida.pago && valorPago > 0 && valorPago <= divida.valor) {
    divida.valor -= valorPago;
    adicionarHistorico(id, valorPago);
    localStorage.setItem("dividas", JSON.stringify(dividas));
    showToast("Pagamento parcial registrado!", "success");
    renderDevedores();
  } else {
    showToast("Valor inválido ou dívida já paga!", "error");
  }
}

function adicionarHistorico(id, valorPago) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const divida = dividas.find(d => d.id === id);
  if (divida) {
    divida.historicoPagamentos = divida.historicoPagamentos || [];
    divida.historicoPagamentos.push({ data: new Date().toLocaleDateString('pt-BR'), valor: valorPago });
    localStorage.setItem("dividas", JSON.stringify(dividas));
  }
}

function renderGerarDivida() {
  const taxaPadrao = parseFloat(localStorage.getItem("taxaJurosPadrao") || 20);
  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-red-700 mb-4">Nova Dívida</h1>
      <div class="bg-white p-4 rounded shadow">
        <input placeholder="Nome do devedor" id="nome" class="border p-2 w-full mb-2">
        <input placeholder="Número do devedor" id="numero" class="border p-2 w-full mb-2">
        <input placeholder="Valor emprestado" id="valor" type="number" step="0.01" class="border p-2 w-full mb-2">
        <input placeholder="Juros mensal (%)" id="juros" type="number" value="${taxaPadrao}" min="20" max="30" class="border p-2 w-full mb-2">
        <input placeholder="Data do empréstimo (dd/mm/aaaa)" id="data" type="text" pattern="\d{2}/\d{2}/\d{4}" class="border p-2 w-full mb-2">
        <input placeholder="Localização (bairro/cidade/link mapa)" id="localizacao" class="border p-2 w-full mb-2">
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
    const localizacao = document.getElementById("localizacao").value.trim();
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
    dividas.push({ id: Date.now(), nome, numero, valor, juros, data: dataStr, vencimento, pago: false, historicoPagamentos: [], localizacao });
    localStorage.setItem("dividas", JSON.stringify(dividas));
    showToast("Dívida adicionada com sucesso!", "success");
    renderGerarDivida();
  };

  document.getElementById("voltarMenu").onclick = () => renderMenu();
}

function renderConfigurarJuros() {
  const taxaPadrao = parseFloat(localStorage.getItem("taxaJurosPadrao") || 20);
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100">
      <div class="bg-white p-6 rounded shadow w-80">
        <h1 class="text-xl font-bold mb-4 text-red-700">Configurar Juros Padrão</h1>
        <input type="number" id="taxaJuros" value="${taxaPadrao}" min="10" max="50" step="1" class="border p-2 w-full mb-4" placeholder="Taxa mensal (%)">
        <button id="salvarTaxa" class="bg-green-600 text-white px-4 py-2 rounded w-full">Salvar</button>
        <button id="voltarMenu" class="bg-gray-300 px-4 py-2 rounded w-full mt-2">Voltar ao Menu</button>
      </div>
    </div>
  `;

  document.getElementById("salvarTaxa").onclick = () => {
    const taxa = parseFloat(document.getElementById("taxaJuros").value);
    if (isNaN(taxa) || taxa < 10 || taxa > 50) {
      showToast("Taxa deve estar entre 10% e 50%!", "error");
      return;
    }
    localStorage.setItem("taxaJurosPadrao", taxa);
    showToast("Taxa de juros salva com sucesso!", "success");
    renderMenu();
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
        <input value="${divida.localizacao || ''}" id="localizacao" placeholder="Localização (bairro/cidade/link mapa)" class="border p-2 w-full mb-2">
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
    const localizacao = document.getElementById("localizacao").value.trim();
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

    const atualizadas = dividas.map(d => d.id === id ? { ...d, nome, numero, valor, juros, data: dataStr, vencimento, localizacao } : d);
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

function exportarDados() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const dados = dividas.map(d => ({
    id: d.id,
    nome: d.nome,
    numero: d.numero,
    valor: d.valor,
    juros: d.juros,
    data: d.data,
    vencimento: d.vencimento,
    pago: d.pago,
    historicoPagamentos: d.historicoPagamentos,
    localizacao: d.localizacao
  }));
  const jsonData = JSON.stringify(dados, null, 2);
  const csvData = [
    "id,nome,numero,valor,juros,data,vencimento,pago,historicoPagamentos,localizacao",
    ...dividas.map(d => `${d.id},${d.nome},${d.numero || ''},${d.valor},${d.juros},${d.data},${d.vencimento},${d.pago},${JSON.stringify(d.historicoPagamentos).replace(/"/g, '""')},${d.localizacao || ''}`).join("\n")
  ].join("\n");
  const blobJson = new Blob([jsonData], { type: "application/json" });
  const blobCsv = new Blob([csvData], { type: "text/csv" });
  const urlJson = URL.createObjectURL(blobJson);
  const urlCsv = URL.createObjectURL(blobCsv);
  const aJson = document.createElement("a");
  const aCsv = document.createElement("a");
  aJson.href = urlJson;
  aCsv.href = urlCsv;
  aJson.download = "dividas.json";
  aCsv.download = "dividas.csv";
  aJson.click();
  aCsv.click();
  URL.revokeObjectURL(urlJson);
  URL.revokeObjectURL(urlCsv);
  showToast("Dados exportados com sucesso!", "success");
}

function importarDados(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const dados = JSON.parse(e.target.result);
      if (!Array.isArray(dados) || !dados.every(d => d.id && d.nome && d.valor && d.juros && d.data && d.vencimento)) {
        throw new Error("Formato inválido!");
      }
      const dividasExistentes = JSON.parse(localStorage.getItem("dividas") || "[]");
      const novasDividas = [...dividasExistentes, ...dados];
      localStorage.setItem("dividas", JSON.stringify(novasDividas));
      showToast("Dados importados com sucesso!", "success");
      renderDevedores();
    } catch (error) {
      showToast("Erro ao importar: formato inválido!", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // Limpa o input pra nova importação
}

function gerarQRCodePIX(id) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const divida = dividas.find(d => d.id === id);
  if (!divida || divida.pago) return;

  const hoje = new Date();
  const venc = new Date(divida.vencimento);
  const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
  const taxaDiaria = divida.juros / 100 / 30;
  const diasEmprestimo = Math.max(1, Math.floor((venc - new Date(validarData(divida.data))) / (1000 * 60 * 60 * 24)));
  const valorJuros = divida.valor * taxaDiaria * (diasEmprestimo + (hoje > venc ? diasAtraso : 0));
  const valorTotal = divida.valor + valorJuros;

  const chavePIX = "sua_chave_pix_aqui"; // Substitua por uma chave PIX real
  const payload = `0002010414BR.GOV.BCB.PIX0114${chavePIX}520400005303986540510.005802BR5925Agiota Control PRO6009São Paulo62070503***6304${valorTotal.toFixed(2)}`;
  const qrCodeData = btoa(payload); // Codifica em base64 pra simulação (QR real precisa de lib como qrcode.js)

  app.insertAdjacentHTML("beforeend", `
    <div id="qrModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-4 rounded shadow w-80">
        <h2 class="text-lg font-bold mb-2">QR Code PIX</h2>
        <div class="text-center mb-2">Valor: ${formatarMoeda(valorTotal)}</div>
        <div class="text-center mb-2">Para: ${divida.nome}</div>
        <div class="bg-gray-200 p-4 mb-2" style="width: 200px; height: 200px;">QR Code (Simulação)</div>
        <button onclick="document.getElementById('qrModal').remove()" class="bg-red-600 text-white px-4 py-2 rounded w-full">Fechar</button>
      </div>
    </div>
  `);
  showToast("QR Code gerado (simulação)!", "success");
}

if (!localStorage.getItem("auth")) {
  renderLogin();
} else {
  renderMenu();
}
