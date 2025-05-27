document.addEventListener("DOMContentLoaded", function () {
  console.log("🔍 URL completa:", window.location.href);
  console.log("🔍 Query string recebida:", window.location.search);

  const queryString = window.location.search;
  if (!queryString) {
    console.error("❌ Nenhum parâmetro encontrado na URL! Verifique o redirecionamento.");
    return;
  }

  const params = new URLSearchParams(queryString);
  console.log("✅ Parâmetros extraídos da URL:", {
    fabricante: params.get("fabricante"),
    modelo: params.get("modelo"),
    ano: params.get("ano"),
    preco: params.get("preco"),
    km: params.get("km"),
  });

  function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
      console.log(`✅ Atualizando elemento #${id} com:`, valor);
      elemento.innerText = valor;
    } else {
      console.error(`❌ Elemento #${id} não encontrado no HTML!`);
    }
  }

// Atualizando informações do veículo
atualizarElemento("fabricante", params.get("fabricante") || "Não informado");
atualizarElemento("modelo", params.get("modelo") || "Não informado");
atualizarElemento("ano", params.get("ano") || "Não informado");

// Adicione a conversão do km aqui 👇
const km = parseInt(params.get("km")) || 0;
atualizarElemento("km", km.toLocaleString("pt-BR"));

// Formatação do preço
const preco = parseFloat(params.get("preco")) || 0;
atualizarElemento("preco", `R$ ${preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);


  // Simulação de financiamento
document.getElementById("calcular").addEventListener("click", function () {
    const entrada = Number(document.getElementById("entrada").value) || 0;
    const parcelas = Number(document.getElementById("parcelas").value);
    const preco = parseFloat(params.get("preco")) || 0;

    // **Atualiza o próprio campo de entrada**
    document.getElementById("entrada").value = entrada.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    if (entrada >= preco) {
      alert("Entrada não pode ser maior ou igual ao valor do carro.");
      return;
    }

    const valorFinanciado = preco - entrada;
    const taxaJuros = 0.0144; // 1,44% ao mês
    const valorParcela = (valorFinanciado * (1 + taxaJuros * parcelas)) / parcelas;
    const totalPagar = valorParcela * parcelas;
    const totalJuros = totalPagar - valorFinanciado;

    // Adicionando o total a financiar
    atualizarElemento("totalFinanciar", `R$ ${valorFinanciado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    atualizarElemento("valorParcela", `R$ ${valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    atualizarElemento("totalPagar", `R$ ${totalPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    atualizarElemento("totalJuros", `R$ ${totalJuros.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
});
});