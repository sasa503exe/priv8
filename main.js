const senhaCerta = "agiota123";
let dados = JSON.parse(localStorage.getItem("devedores") || "[]");
let capital = localStorage.getItem("capital") || "";

function salvarBase() {
  localStorage.setItem("devedores", JSON.stringify(dados));
  localStorage.setItem("capital", document.getElementById("capital").value);
}

function login() {
  if (document.getElementById("senha").value === senhaCerta) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("capital").value = capital;
  } else {
    alert("Senha incorreta.");
  }
}

function logout() {
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("nova").classList.add("hidden");
  document.getElementById("devedores").classList.add("hidden");
}

function mostrar(secao) {
  document.getElementById("nova").classList.add("hidden");
  document.getElementById("devedores").classList.add("hidden");
  if (secao === "nova") document.getElementById("nova").classList.remove("hidden");
  if (secao === "devedores") renderDevedores();
}

function parseDataBr(str) {
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m}-${d}`);
}

function calcularComJuros(valor, juros, vencimento) {
  const venc = parseDataBr(vencimento);
  const hoje = new Date();
  let meses = (hoje.getFullYear() - venc.getFullYear()) * 12 + (hoje.getMonth() - venc.getMonth());
  if (hoje.getDate() > venc.getDate()) meses += 1;
  meses = Math.max(0, meses);
  return (valor * (1 + juros / 100 * meses)).toFixed(2);
}

function salvarDivida() {
  const nome = document.getElementById("nome").value.trim();
  const zap = document.getElementById("zap").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const juros = parseFloat(document.getElementById("juros").value);
  const venc = document.getElementById("vencimento").value.trim();
  const erroBox = document.getElementById("erro");

  if (!nome || !zap || isNaN(valor) || isNaN(juros) || !venc.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    erroBox.textContent = "Preencha todos os campos corretamente.";
    erroBox.classList.remove("hidden");
    return;
  }

  erroBox.classList.add("hidden");
  let dev = dados.find(d => d.nome === nome && d.zap === zap);
  if (!dev) {
    dev = { nome, zap, dividas: [] };
    dados.push(dev);
  }

  const editIndex = document.getElementById("edit_index").value;
  const nova = { valor, juros, vencimento: venc, pago: false };

  if (editIndex) {
    dev.dividas[parseInt(editIndex)] = nova;
    document.getElementById("edit_index").value = "";
  } else {
    dev.dividas.push(nova);
  }

  salvarBase();
  mostrar("devedores");
}

function limparFormulario() {
  ["nome", "zap", "valor", "juros", "vencimento", "edit_index"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("erro").classList.add("hidden");
}

function renderDevedores() {
  dados = JSON.parse(localStorage.getItem("devedores") || "[]");
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  dados.forEach((d, i) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";
    let html = `<div class="flex justify-between"><strong>${d.nome}</strong> <button onclick="excluirDevedor(${i})" class="text-red-600">Excluir</button></div>
                <div>Zap: ${d.zap}</div>`;

    d.dividas?.forEach((dv, j) => {
      const final = calcularComJuros(dv.valor, dv.juros, dv.vencimento);
      html += `<hr class="my-2">
               <div>Original: R$ ${dv.valor.toFixed(2)} → Final: <b>R$ ${final}</b></div>
               <div>Juros: ${dv.juros}% | Vencimento: ${dv.vencimento}</div>
               ${dv.pago ? "<div class='text-green-600'>✔ Pago</div>" : ""}
               <div class="flex gap-2 mt-2">
                 <button onclick="editar(${i},${j})" class="bg-blue-500 text-white px-2 py-1 rounded">Editar</button>
                 ${!dv.pago ? `<button onclick="pagar(${i},${j})" class="bg-green-600 text-white px-2 py-1 rounded">Pagar</button>` : ""}
               </div>`;
    });

    card.innerHTML = html;
    lista.appendChild(card);
  });
}

function editar(i, j) {
  const d = dados[i];
  const dv = d.dividas[j];
  document.getElementById("nome").value = d.nome;
  document.getElementById("zap").value = d.zap;
  document.getElementById("valor").value = dv.valor;
  document.getElementById("juros").value = dv.juros;
  document.getElementById("vencimento").value = dv.vencimento;
  document.getElementById("edit_index").value = j;
  mostrar("nova");
}

function pagar(i, j) {
  dados[i].dividas[j].pago = true;
  salvarBase();
  renderDevedores();
}

function excluirDevedor(i) {
  if (confirm("Deseja excluir este devedor?")) {
    dados.splice(i, 1);
    salvarBase();
    renderDevedores();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  IMask(document.getElementById("vencimento"), { mask: "00/00/0000" });
});