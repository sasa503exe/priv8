const app = document.getElementById("app");
const toast = document.getElementById("toast");

// --- Funções Utilitárias ---
function showToast(message, type = "error") {
  toast.textContent = message;
  toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white text-center transition-opacity duration-300 ${
    type === "error" ? "bg-red-600" : "bg-green-600"
  } z-50`;
  toast.classList.remove("hidden", "opacity-0");
  toast.classList.add("opacity-100");
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
    setTimeout(() => toast.classList.add("hidden"), 300); // Espera a transição terminar
  }, 3000);
}

function formatarData(data) {
  if (!data) return "Data inválida";
  // Assume que a data está no formato YYYY-MM-DD (ISO)
  const [year, month, day] = data.split("-");
  return `${day}/${month}/${year}`;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function validarData(dataStr) {
  if (!dataStr) return null;
  const parts = dataStr.split("/");
  if (parts.length !== 3) return null;
  const [dia, mes, ano] = parts.map(Number);
  if (
    isNaN(dia) ||
    isNaN(mes) ||
    isNaN(ano) ||
    dia < 1 ||
    dia > 31 ||
    mes < 1 ||
    mes > 12 ||
    ano < 2000 ||
    ano > 2100
  ) {
    return null;
  }
  // Verifica se a data existe (ex: 31/04)
  const date = new Date(ano, mes - 1, dia);
  if (date.getDate() !== dia || date.getMonth() !== mes - 1 || date.getFullYear() !== ano) {
      return null;
  }
  return date;
}


// --- Renderização das Telas ---

function renderLogin() {
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100 p-4">
      <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 class="text-2xl font-bold mb-6 text-red-700">Agiota Control PRO</h1>
        <input type="text" id="email" placeholder="Email" class="border border-gray-300 p-3 w-full mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
        <input type="password" id="senha" placeholder="Senha" class="border border-gray-300 p-3 w-full mb-6 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
        <button id="entrar" class="bg-red-600 text-white px-4 py-3 rounded-md w-full text-lg font-semibold hover:bg-red-700 transition duration-200">Entrar</button>
      </div>
    </div>
  `;

  document.getElementById("entrar").onclick = () => {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    if (!email || !senha) {
      showToast("Preencha email e senha!", "error");
      return;
    }
    // Simulação de autenticação
    if (email === "agiota@local" && senha === "123456") {
      localStorage.setItem("auth", "true");
       if (!localStorage.getItem("saldoCapital")) {
        renderDefinirSaldo(); // Redireciona para definir saldo se for o primeiro login
      } else {
        renderMenu();
      }
    } else {
      showToast("Credenciais inválidas!", "error");
    }
  };
}

function renderDefinirSaldo() {
    app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100 p-4">
      <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 class="text-2xl font-bold mb-6 text-red-700">Definir Saldo Inicial</h1>
        <p class="text-gray-600 mb-4 text-sm">Informe o seu saldo de capital inicial para começar.</p>
        <input type="number" id="saldo" placeholder="Saldo Capital (R$)" step="0.01" class="border border-gray-300 p-3 w-full mb-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
        <button id="salvarSaldo" class="bg-green-600 text-white px-4 py-3 rounded-md w-full text-lg font-semibold hover:bg-green-700 transition duration-200">Salvar Saldo</button>
      </div>
    </div>
  `;

  document.getElementById("salvarSaldo").onclick = () => {
    const saldo = parseFloat(document.getElementById("saldo").value);
    if (isNaN(saldo) || saldo < 0) {
      showToast("Saldo deve ser um valor positivo!", "error");
      return;
    }
    localStorage.setItem("saldoCapital", saldo);
    showToast("Saldo inicial salvo com sucesso!", "success");
    renderMenu();
  };
}


function renderAlterarSaldo() {
  const saldoAtual = parseFloat(localStorage.getItem("saldoCapital") || 0);
  app.innerHTML = `
    <div class="flex flex-col items-center justify-center h-screen bg-yellow-100 p-4">
      <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        <h1 class="text-2xl font-bold mb-6 text-red-700">Alterar Saldo Capital</h1>
         <p class="text-gray-600 mb-4 text-sm">Seu saldo atual é: <strong>${formatarMoeda(saldoAtual)}</strong></p>
        <input type="number" id="saldo" value="${saldoAtual}" placeholder="Novo Saldo Capital (R$)" step="0.01" class="border border-gray-300 p-3 w-full mb-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
        <button id="salvarSaldo" class="bg-green-600 text-white px-4 py-3 rounded-md w-full text-lg font-semibold hover:bg-green-700 transition duration-200 mb-3">Salvar Novo Saldo</button>
         <button id="voltarMenu" class="bg-gray-300 text-gray-800 px-4 py-3 rounded-md w-full text-lg font-semibold hover:bg-gray-400 transition duration-200">Voltar ao Menu</button>
      </div>
    </div>
  `;

  document.getElementById("salvarSaldo").onclick = () => {
    const saldo = parseFloat(document.getElementById("saldo").value);
    if (isNaN(saldo) || saldo < 0) {
      showToast("Saldo deve ser um valor positivo!", "error");
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
      <header class="bg-white p-4 shadow-md flex justify-between items-center">
        <h1 class="text-xl font-bold text-red-700">Agiota Control PRO</h1>
        <button id="menuToggle" class="text-2xl text-gray-700 hover:text-red-700 focus:outline-none transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
      </header>
      <div id="menu" class="fixed inset-y-0 left-0 bg-white shadow-lg w-64 transform -translate-x-full transition duration-200 ease-in-out z-50">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 class="text-lg font-bold text-red-700">Menu</h2>
            <button id="fecharMenu" class="text-gray-500 hover:text-gray-700 focus:outline-none transition duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div class="p-4">
            <div class="text-sm mb-4 text-gray-700">Saldo Atual: <span class="font-semibold">${formatarMoeda(saldo)}</span></div>
            <button id="verDevedores" class="block bg-blue-600 text-white px-4 py-3 rounded-md w-full mb-3 text-left text-sm font-semibold hover:bg-blue-700 transition duration-200">Ver Devedores</button>
            <button id="gerarDivida" class="block bg-green-600 text-white px-4 py-3 rounded-md w-full mb-3 text-left text-sm font-semibold hover:bg-green-700 transition duration-200">Gerar Nova Dívida</button>
            <button id="alterarSaldo" class="block bg-yellow-500 text-black px-4 py-3 rounded-md w-full mb-3 text-left text-sm font-semibold hover:bg-yellow-600 transition duration-200">Alterar Saldo</button>
            <button id="configurarJuros" class="block bg-purple-600 text-white px-4 py-3 rounded-md w-full mb-3 text-left text-sm font-semibold hover:bg-purple-700 transition duration-200">Configurar Juros</button>
            <button id="sair" class="block bg-gray-300 text-gray-800 px-4 py-3 rounded-md w-full text-left text-sm font-semibold hover:bg-gray-400 transition duration-200">Sair</button>
        </div>
      </div>
      <div id="overlay" class="hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <main class="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div class="text-center text-gray-600 text-lg">Selecione uma opção no menu lateral.</div>
      </main>
    </div>
  `;

  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");
  const fecharMenu = document.getElementById("fecharMenu");
  const overlay = document.getElementById("overlay");

  menuToggle.onclick = () => {
    menu.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  };

  fecharMenu.onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  overlay.onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  };

  document.getElementById("verDevedores").onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    renderDevedores();
  };

  document.getElementById("gerarDivida").onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    renderGerarDivida();
  };

  document.getElementById("alterarSaldo").onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    renderAlterarSaldo();
  };

  document.getElementById("configurarJuros").onclick = () => {
    menu.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    renderConfigurarJuros();
  };

  document.getElementById("sair").onclick = () => {
    localStorage.removeItem("auth");
    showToast("Deslogado com sucesso!", "success");
    renderLogin();
  };
}

function renderDevedores() {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const saldo = parseFloat(localStorage.getItem("saldoCapital") || 0);
  const hoje = new Date();
  hoje.setHours(0,0,0,0); // Zera as horas para comparação de datas

  // Recalcula o total devido com base nos juros acumulados até hoje para dívidas não pagas
  const totalDevido = dividas.filter(d => !d.pago).reduce((sum, d) => {
    const dataEmprestimo = validarData(d.data);
     if (!dataEmprestimo) return sum; // Ignora dívidas com data inválida
    dataEmprestimo.setHours(0,0,0,0);

    const diasCorridos = Math.max(1, Math.ceil((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24)));
    const taxaDiaria = (d.juros / 100) / 30;
    const valorJuros = d.valor * taxaDiaria * diasCorridos;
    return sum + (d.valor + valorJuros);
  }, 0);
  const saldoAtual = saldo + totalDevido;

  // Dashboard Calculations
  const lucroAcumulado = dividas.reduce((sum, d) => {
     if (d.pago && d.dataPagamento) { // Calcula lucro apenas para dívidas pagas com data de pagamento
      const dataEmprestimo = validarData(d.data);
      if (!dataEmprestimo) return sum; // Ignora dívidas com data inválida
      dataEmprestimo.setHours(0,0,0,0);
      const dataPagamento = new Date(d.dataPagamento + 'T00:00:00'); // Assume que você adicionaria dataPagamento ao objeto divida quando pago
       dataPagamento.setHours(0,0,0,0);
      const diasEmprestimo = Math.max(0, Math.ceil((dataPagamento - dataEmprestimo) / (1000 * 60 * 60 * 24))); // Usa ceil para contar o dia inicial
      const taxaDiaria = (d.juros / 100) / 30;
      const jurosTotais = d.valor * taxaDiaria * diasEmprestimo;
      return sum + jurosTotais;
     }
     return sum;
  }, 0);


  const valorHoje = dividas.filter(d => {
    if (d.pago) return false;
    const venc = new Date(d.vencimento + 'T00:00:00');
    venc.setHours(0,0,0,0);
    return venc.toDateString() === hoje.toDateString();
  }).reduce((sum, d) => d.valor + (d.valor * ((d.juros/100)/30) * Math.max(0, Math.ceil((hoje - validarData(d.data).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)))) , 0); // Calcula o valor total (inicial + juros até hoje) para as que vencem hoje


  const inadimplentes = dividas.filter(d => {
    if (d.pago) return false;
    const venc = new Date(d.vencimento + 'T00:00:00');
     venc.setHours(0,0,0,0);
    return hoje > venc;
  }).length;
  const totalDevedores = dividas.length;
  const percentualInadimplentes = totalDevedores ? (inadimplentes / totalDevedores * 100).toFixed(1) : 0;


  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
       <button id="voltarMenu" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold mb-4 hover:bg-gray-400 transition duration-200">← Voltar ao Menu</button>
      <h1 class="text-2xl font-bold text-red-700 mb-6 text-center">📋 Meus Devedores</h1>

      <div class="bg-white p-4 rounded-lg shadow-md mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-gray-700 text-sm">
        <div><strong>Saldo Atual</strong><br>${formatarMoeda(saldoAtual)}</div>
        <div><strong>Lucro Acumulado</strong><br>${formatarMoeda(lucroAcumulado)}</div>
        <div><strong>Vencem Hoje</strong><br>${formatarMoeda(valorHoje)}</div>
        <div><strong>Inadimplentes</strong><br>${percentualInadimplentes}%</div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-md mb-6">
        <input id="busca" placeholder="Pesquisar por nome ou número" class="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
        <label class="flex items-center text-gray-700 text-sm mt-3">
          <input type="checkbox" id="filtroNaoPagos" class="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
          Mostrar somente dívidas não pagas
        </label>
      </div>

      <div id="lista" class="space-y-4"></div>

      <div class="mt-6 flex flex-wrap gap-3 justify-center">
        <button id="exportarDadosJson" class="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition duration-200 flex-1 sm:flex-none">Exportar JSON</button>
        <button id="exportarDadosCsv" class="bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition duration-200 flex-1 sm:flex-none">Exportar CSV</button>
        <button id="importarDados" class="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-green-700 transition duration-200 flex-1 sm:flex-none">Importar Dados</button>
      </div>
       <input type="file" id="importFile" accept=".json" class="hidden" onchange="importarDados(event)">
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

  document.getElementById("exportarDadosJson").onclick = () => exportarDados('json');
   document.getElementById("exportarDadosCsv").onclick = () => exportarDados('csv');
  document.getElementById("importarDados").onclick = () => document.getElementById("importFile").click();
  document.getElementById("voltarMenu").onclick = () => renderMenu();

  renderListaDevedores(dividas);
}

function renderListaDevedores(dividas) {
  const container = document.getElementById("lista");
  if (!container) return; // Verifica se o container existe

  if (!dividas.length) {
    container.innerHTML = "<p class='text-gray-500 text-center'>Nenhum devedor encontrado.</p>";
    return;
  }

  const hoje = new Date();
   hoje.setHours(0,0,0,0);

  container.innerHTML = dividas.map(d => {
    const dataEmprestimo = validarData(d.data);
    if (!dataEmprestimo) { // Pula dívidas com data inválida
        return `<div class="bg-red-100 p-4 rounded-lg shadow-md">Erro: Dívida com data inválida para ${d.nome || 'Nome desconhecido'}</div>`;
    }
    dataEmprestimo.setHours(0,0,0,0);

    const venc = new Date(d.vencimento + 'T00:00:00');
    venc.setHours(0,0,0,0);

    const diasAtraso = hoje > venc ? Math.max(0, Math.floor((hoje - venc) / (1000 * 60 * 60 * 24))) : 0;
    const vencido = hoje > venc;
    const hojeVencimento = hoje.toDateString() === venc.toDateString();

    let statusIcon = "🟢"; // Em dia
    let statusClass = "text-green-600";
    let statusText = "Em dia";
    if (vencido && !d.pago) {
      statusIcon = "🔴"; // Vencido
      statusClass = "text-red-600";
      statusText = `Vencido (${diasAtraso} dias)`;
    } else if (hojeVencimento && !d.pago) {
      statusIcon = "🟡"; // Vence hoje
      statusClass = "text-yellow-600";
      statusText = "Vence hoje";
    } else if (d.pago) {
        statusIcon = "✅"; // Pago
        statusClass = "text-blue-600";
        statusText = "Pago";
    }


    const taxaDiaria = (d.juros / 100) / 30;
    const diasCorridos = Math.max(0, Math.ceil((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24)));
    const valorJurosTotal = d.valor * taxaDiaria * diasCorridos;
    const valorTotalComJurosHoje = d.valor + valorJurosTotal;


    const alertaClasse = vencido && !d.pago ? "bg-red-100 border-l-4 border-red-500" : hojeVencimento && !d.pago ? "bg-yellow-100 border-l-4 border-yellow-500" : "bg-white";
    const localizacao = d.localizacao || "Não informada";

    return `
      <div class="${alertaClasse} p-4 rounded-lg shadow-md text-sm text-gray-700">
        <div class="flex justify-between items-center mb-2">
            <div class="font-bold text-base ${statusClass}">${statusIcon} ${d.nome}</div>
             <span class="text-xs text-gray-600">${statusText}</span>
        </div>
        <div class="mb-2">
            ${d.numero ? `<div><strong>Telefone:</strong> ${d.numero}</div>` : ''}
            <div><strong>Valor Inicial:</strong> ${formatarMoeda(d.valor)}</div>
             <div><strong>Juros Mensal:</strong> ${d.juros}%</div>
            <div><strong>Data Empréstimo:</strong> ${formatarData(d.data)}</div>
            <div><strong>Vencimento:</strong> ${formatarData(d.vencimento)}</div>
            <div><strong>Localização:</strong> ${localizacao}</div>
            ${!d.pago ? `<div><strong>Juros Acumulados:</strong> ${formatarMoeda(valorJurosTotal)} (${diasCorridos} dias)</div>
                         <div class="text-base font-bold mt-1">Total Hoje: ${formatarMoeda(valorTotalComJurosHoje)}</div>` : ''}
        </div>

        ${d.historicoPagamentos && d.historicoPagamentos.length ?
            `<div class="mb-2"><strong>Histórico de Pagamentos:</strong>
               <ul class="list-disc list-inside text-xs">
               ${d.historicoPagamentos.map(p => `<li>${p.data}: ${formatarMoeda(p.valor)}</li>`).join('')}
               </ul>
             </div>`
             : ''
        }

        <div class="mt-3 flex flex-wrap gap-2">
          ${!d.pago ? `<button onclick="promptPagamentoParcial(${d.id})" class="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition duration-200">Pgto. Parcial</button>` : ''}
          ${!d.pago ? `<button onclick="confirmarPagamento(${d.id})" class="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition duration-200">Marcar Pago</button>` : `<button onclick="desmarcarPago(${d.id})" class="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition duration-200">Marcar Não Pago</button>`}
          <button onclick="editarDivida(${d.id})" class="bg-yellow-500 text-black px-3 py-1 rounded text-xs hover:bg-yellow-600 transition duration-200">Editar</button>
          <button onclick="confirmarExclusao(${d.id})" class="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition duration-200">Excluir</button>
          ${d.numero ? `<a href="https://wa.me/${encodeURIComponent(d.numero.replace(/[^0-9]/g, ''))}?text=${encodeURIComponent(\`Olá ${d.nome}, passando para lembrar da sua dívida de ${formatarMoeda(valorTotalComJurosHoje)} que venceu/vence hoje. Poderia me dar uma posição?\`)}" target="_blank" class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition duration-200">Cobrar no Zap</a>` : ''}
          ${!d.pago ? `<button onclick="gerarQRCodePIX(${d.id})" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition duration-200">Gerar PIX</button>` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function promptPagamentoParcial(id) {
    const valorPagoStr = prompt(`Registrar pagamento parcial para ID ${id}.\nValor pago (R$):`);
    if (valorPagoStr !== null) {
        const valorPago = parseFloat(valorPagoStr);
        if (!isNaN(valorPago) && valorPago > 0) {
             adicionarHistorico(id, valorPago);
             showToast("Pagamento parcial registrado no histórico!", "success");
             renderDevedores(); // Renderiza a lista novamente para mostrar o histórico
        } else {
            showToast("Valor inválido!", "error");
        }
    }
}


function adicionarHistorico(id, valorPago) {
  const dividas = JSON.parse(localStorage.getItem("dividas") || "[]");
  const divida = dividas.find(d => d.id === id);
  if (divida) {
    divida.historicoPagamentos = divida.historicoPagamentos || [];
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    // Verifica se já existe registro de pagamento para hoje
    const hojeJaRegistrado = divida.historicoPagamentos.some(p => p.data === dataHoje);
    if (hojeJaRegistrado) {
         // Se já registrou hoje, adiciona ao valor existente
        const indexHoje = divida.historicoPagamentos.findIndex(p => p.data === dataHoje);
        divida.historicoPagamentos[indexHoje].valor += valorPago;
    } else {
        // Caso contrário, adiciona um novo registro
        divida.historicoPagamentos.push({ data: dataHoje, valor: valorPago });
    }
    localStorage.setItem("dividas", JSON.stringify(dividas));
  }
}


function renderGerarDivida() {
  const taxaPadrao = parseFloat(localStorage.getItem("taxaJurosPadrao") || 20);
  // Pega a data atual no formato YYYY-MM-DD para preencher o campo de data
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses são 0-based
  const ano = hoje.getFullYear();
  const dataAtualFormatada = `${dia}/${mes}/${ano}`;


  app.innerHTML = `
    <div class="p-4 max-w-4xl mx-auto">
       <button id="voltarMenu" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold mb-4 hover:bg-gray-400 transition duration-200">← Voltar ao Menu</button>
      <h1 class="text-2xl font-bold text-red-700 mb-6 text-center">💸 Registrar Nova Dívida</h1>
      <div class="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
            <label for="nome" class="block text-sm font-medium text-gray-700 mb-1">Nome do Devedor</label>
            <input type="text" id="nome" placeholder="Nome completo" class="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
        </div>
         <div>
            <label for="numero" class="block text-sm font-medium text-gray-700 mb-1">Número de Telefone (com DDD)</label>
            <input type="text" id="numero" placeholder="Ex: 11987654321" class="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
        </div>
        <div>
            <label for="valor" class="block text-sm font-medium text-gray-700 mb-1">Valor Emprestado (R$)</label>
            <input type="number" id="valor" placeholder="Ex: 500.00" step="0.01" class="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
        </div>
         <div>
            <label for="juros" class="block text-sm font-medium text-gray-700 mb-1">Juros Mensal (%)</label>
            <input type="number" id="juros" value="${taxaPadrao}" min="10" max="50" step="1" class="border border-gray
