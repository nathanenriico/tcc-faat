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
    km: params.get("km")
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

  atualizarElemento("fabricante", params.get("fabricante") || "Não informado");
  atualizarElemento("modelo", params.get("modelo") || "Não informado");
  atualizarElemento("ano", params.get("ano") || "Não informado");
  atualizarElemento("preco", `R$ ${parseFloat(params.get("preco") || 0).toLocaleString("pt-BR")}`);
  atualizarElemento("km", params.get("km") || "Não informado");

  // Simulação de financiamento
  document.getElementById("calcular").addEventListener("click", function () {
    const entrada = Number(document.getElementById("entrada").value) || 0;
    const parcelas = Number(document.getElementById("parcelas").value);
    const preco = parseFloat(params.get("preco")) || 0;

    // Atualiza o valor da entrada no formato Reais
atualizarElemento("entradaValor", `R$ ${entrada.toLocaleString("pt-BR")}`);

    if (entrada >= preco) {
      alert("Entrada não pode ser maior ou igual ao valor do carro.");
      return;
    }

    const valorFinanciado = preco - entrada;
    const taxaJuros = 0.015; // 1.5% ao mês
    const valorParcela = (valorFinanciado * (1 + taxaJuros * parcelas)) / parcelas;
    const totalPagar = valorParcela * parcelas;
    const totalJuros = totalPagar - valorFinanciado;

    atualizarElemento("valorParcela", `R$ ${valorParcela.toLocaleString("pt-BR")}`);
    atualizarElemento("totalPagar", `R$ ${totalPagar.toLocaleString("pt-BR")}`);
    atualizarElemento("totalJuros", `R$ ${totalJuros.toLocaleString("pt-BR")}`);
  });
});
