export default function App() {
  const [clientes, setClientes] = React.useState(() => JSON.parse(localStorage.getItem('clientes')) || []);
  const [nome, setNome] = React.useState("");
  const [valor, setValor] = React.useState("");
  const [juros, setJuros] = React.useState("");

  React.useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes));
  }, [clientes]);

  function adicionarCliente() {
    if (!nome || !valor || !juros) return;
    const novo = {
      id: Date.now(),
      nome,
      valor: parseFloat(valor),
      juros: parseFloat(juros),
      criado: new Date().toISOString(),
      pago: false
    };
    setClientes([...clientes, novo]);
    setNome("");
    setValor("");
    setJuros("");
  }

  function marcarPago(id) {
    setClientes(clientes.map(c => c.id === id ? { ...c, pago: true } : c));
  }

  function calcularJuros(item) {
    const dias = Math.floor((new Date() - new Date(item.criado)) / (1000 * 60 * 60 * 24));
    const total = item.valor + ((item.valor * item.juros / 100) * dias);
    return total.toFixed(2);
  }

  return (
    React.createElement("div", { className: "min-h-screen bg-yellow-100 p-4" },
      React.createElement("h1", { className: "text-2xl font-bold text-red-700 mb-4" }, "📲 Agiota Control"),
      React.createElement("div", { className: "bg-white rounded p-4 shadow mb-6" },
        React.createElement("input", { placeholder: "Nome", value: nome, onChange: e => setNome(e.target.value), className: "border p-2 w-full mb-2" }),
        React.createElement("input", { placeholder: "Valor emprestado", type: "number", value: valor, onChange: e => setValor(e.target.value), className: "border p-2 w-full mb-2" }),
        React.createElement("input", { placeholder: "Juros diário (%)", type: "number", value: juros, onChange: e => setJuros(e.target.value), className: "border p-2 w-full mb-2" }),
        React.createElement("button", { onClick: adicionarCliente, className: "bg-red-600 text-white px-4 py-2 rounded" }, "Adicionar")
      ),
      clientes.map(c =>
        React.createElement("div", { key: c.id, className: `p-4 mb-2 rounded shadow ${c.pago ? 'bg-green-100' : 'bg-white'}` },
          React.createElement("div", { className: "font-bold text-lg" }, c.nome),
          React.createElement("div", { className: "text-sm" }, `Valor inicial: R$ ${c.valor.toFixed(2)}`),
          React.createElement("div", { className: "text-sm" }, `Total com juros: R$ ${calcularJuros(c)}`),
          React.createElement("div", { className: "text-sm" }, `Juros/dia: ${c.juros}%`),
          React.createElement("div", { className: "mt-2 flex gap-2" },
            !c.pago && React.createElement("button", { onClick: () => marcarPago(c.id), className: "bg-green-600 text-white px-3 py-1 rounded" }, "Marcar pago"),
            React.createElement("a", {
              href: `https://wa.me/?text=Oi%20${c.nome},%20est%C3%A1%20devendo%20R$%20${calcularJuros(c)}.%20Favor%20acertar%20hoje.`,
              target: "_blank",
              className: "bg-yellow-500 text-black px-3 py-1 rounded"
            }, "Cobrar no Zap")
          )
        )
      )
    )
  );
}