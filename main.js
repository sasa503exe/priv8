const senhaCerta = "agiota123";
let dados = JSON.parse(localStorage.getItem("devedores") || "[]");

function salvarBase() {
  localStorage.setItem("devedores", JSON.stringify(dados));
  localStorage.setItem("capital", document.getElementById("capital").value);
  console.log("Dados salvos:", dados);
}

function login() {
  const senha = document.getElementById("senha").value;
  if (senha === senhaCerta) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("capital").value = localStorage.getItem("capital") || "";
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

  if (!nome || !zap || isNaN(valor) || isNaN(juros) || !venc.match(/^\\d{2}\\/\\d{2}\\/\\d{4}$/)) {
    document.getElementById("erro").classList.remove("hidden");
    return;
  }

  let dev = dados.find(d => d.nome === nome && d.zap === zap);
  if (!dev) {
    dev = { nome, zap, dividas: [] };
    dados.push(dev);
  }

  dev.dividas.push({ valor, juros, vencimento, pago: false });
  salvarBase();
  mostrar("devedores");
}

function renderDevedores() {
  dados = JSON.parse(localStorage.getItem("devedores") || "[]");
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  dados.forEach((d, i) => {
    const div = document.createElement("div");
    div.className = "bg-white p-4 rounded shadow";

    let inner = `<b>${d.nome}</b> <br> Zap: ${d.zap}<br>`;
    d.dividas.forEach(divida => {
      const total = calcularComJuros(divida.valor, divida.juros, divida.vencimento);
      inner += `Valor: R$${divida.valor} → R$${total}<br> Vence: ${divida.vencimento}<br> Juros: ${divida.juros}%<br><br>`;
    });

    div.innerHTML = inner;
    lista.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  IMask(document.getElementById("vencimento"), { mask: "00/00/0000" });
});
