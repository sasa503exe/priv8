// ... (código existente até renderDevedores)

// Novas funções
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

function renderListaDevedores(dividas) {
  const container = document.getElementById("lista");
  if (!dividas.length) {
    container.innerHTML = "<p class='text-gray-500'>Nenhum devedor cadastrado.</p>";
    return;
  }

  const hoje = new Date();
  container.innerHTML = dividas.map(d => {
    const dataEmprestimo = validarData(d.data);
    const venc = new Date(d.vencimento);
    dataEmprestimo.setHours(0, 0, 0, 0);
    venc.setHours(0, 0, 0, 0);
    const diasAtraso = Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24)));
    const diasEmprestimo = Math.max(1, Math.floor((venc - dataEmprestimo) / (1000 * 60 * 60 * 24)));
    const vencido = hoje > venc;
    const hojeVencimento = hoje.toDateString() === venc.toDateString();

    const taxaDiaria = d.juros / 100 / 30;
    const valorJurosEmprestimo = d.valor * taxaDiaria * diasEmprestimo;
    const valorJurosAtraso = d.valor * taxaDiaria * diasAtraso;
    const valorJuros = vencido ? valorJurosEmprestimo + valorJurosAtraso : valorJurosEmprestimo;
    const valorFinal = d.valor + valorJuros;

    const alertaClasse = vencido ? "bg-red-200" : hojeVencimento ? "bg-yellow-200" : "";
    const alertaTexto = vencido ? "⚠ Vencida" : hojeVencimento ? "⚠ Vence hoje" : "";

    return `
      <div class="bg-white p-4 rounded shadow mb-2 ${alertaClasse}">
        <div class="font-bold text-lg">${d.nome}</div>
        <div class="text-sm">Telefone: ${d.numero || 'Não informado'}</div>
        <div class="text-sm">Valor inicial: ${formatarMoeda(d.valor)}</div>
        <div class="text-sm">Vencimento: ${formatarData(d.vencimento)} ${alertaTexto}</div>
        <div class="text-sm">Juros: ${formatarMoeda(valorJuros)}</div>
        <div class="text-sm">Total ${vencido ? `(atraso ${diasAtraso} dias)` : ''}: ${formatarMoeda(valorFinal)}</div>
        ${d.historicoPagamentos && d.historicoPagamentos.length ? `<div class="text-sm">Histórico: ${d.historicoPagamentos.map(p => `${p.data}: ${formatarMoeda(p.valor)}`).join(', ')}</div>` : ''}
        <div class="mt-2 flex gap-2 flex-wrap">
          ${!d.pago ? `<button onclick="registrarPagamentoParcial(${d.id}, prompt('Valor pago (R$):', ${d.valor / 2}))" class="bg-purple-600 text-white px-3 py-1 rounded">Registrar Pagamento</button>` : ''}
          ${!d.pago ? `<button onclick="pagar(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded">Marcar pago</button>` : `<button onclick="desmarcarPago(${d.id})" class="bg-orange-600 text-white px-3 py-1 rounded">Marcar não pago</button>`}
          <button onclick="editarDivida(${d.id})" class="bg-yellow-500 text-black px-3 py-1 rounded">Editar</button>
          <button onclick="excluirDivida(${d.id})" class="bg-red-600 text-white px-3 py-1 rounded">Excluir</button>
          <a href="https://wa.me/${encodeURIComponent(d.numero || '')}?text=Oi%20${encodeURIComponent(d.nome)},%20voc%C3%A9%20est%C3%A1%20devendo%20${encodeURIComponent(formatarMoeda(valorFinal))}.%20Favor%20acertar." target="_blank" class="bg-yellow-500 text-black px-3 py-1 rounded">Cobrar no Zap</a>
        </div>
      </div>
    `;
  }).join("");
}

function renderConfigurarJuros() {
  const taxaPadrao = parseFloat(localStorage.getItem("taxaJurosPadrao")) || 20;
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

function renderGerarDivida() {
  const taxaPadrao = parseFloat(localStorage.getItem("taxaJurosPadrao")) || 20;
  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-red-700 mb-4">Nova Dívida</h1>
      <div class="bg-white p-4 rounded shadow">
        <input placeholder="Nome do devedor" id="nome" class="border p-2 w-full mb-2">
        <input placeholder="Número do devedor" id="numero" class="border p-2 w-full mb-2">
        <input placeholder="Valor emprestado" id="valor" type="number" step="0.01" class="border p-2 w-full mb-2">
        <input placeholder="Juros mensal (%)" id="juros" type="number" value="${taxaPadrao}" min="20" max="30" class="border p-2 w-full mb-2">
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
    dividas.push({ id: Date.now(), nome, numero, valor, juros, data: dataStr, vencimento, pago: false, historicoPagamentos: [] });
    localStorage.setItem("dividas", JSON.stringify(dividas));
    showToast("Dívida adicionada com sucesso!", "success");
    renderGerarDivida();
  };

  document.getElementById("voltarMenu").onclick = () => renderMenu();
}

// Atualiza renderMenu pra incluir a nova opção
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

// ... (código existente de editarDivida, pagar, desmarcarPago, excluirDivida)

if (!localStorage.getItem("auth")) {
  renderLogin();
} else {
  renderMenu();
}
