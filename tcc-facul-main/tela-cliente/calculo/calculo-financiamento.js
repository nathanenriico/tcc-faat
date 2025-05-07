document.addEventListener("DOMContentLoaded", function () {
  console.log("Query string recebida:", window.location.search);

  // Recupera os parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  let preco = params.get("preco");
  let imagemCarro = params.get("imagem");

  // Se não houver preço na URL, tenta obter do localStorage ou usa valores padrão
  if (!preco || isNaN(parseFloat(preco))) {
      const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
      if (carrosSalvos.length > 0) {
          preco = carrosSalvos[carrosSalvos.length - 1].preco;
          imagemCarro = carrosSalvos[carrosSalvos.length - 1].imagens[0];
      } else {
          preco = "0";
          imagemCarro = "img/fallback.png";
      }
  }

  // Atualiza os campos da página
  document.getElementById("valorTotal").value = parseFloat(preco).toFixed(2);
  document.getElementById("carImage").src = imagemCarro;

  const entradaInput = document.getElementById("entrada");
  const valorFinanciadoInput = document.getElementById("valorFinanciado");

  // Define a entrada automática como 10% do valor total
  entradaInput.value = (parseFloat(preco) * 0.1).toFixed(2);
  valorFinanciadoInput.value = (parseFloat(preco) - parseFloat(entradaInput.value)).toFixed(2);

  // Evento para atualizar o valor financiado ao alterar a entrada
  entradaInput.addEventListener("input", function () {
      const entradaValor = parseFloat(entradaInput.value.replace(",", "."));
      const precoCarro = parseFloat(preco);

      if (!isNaN(entradaValor) && entradaValor >= 0 && entradaValor <= precoCarro) {
          valorFinanciadoInput.value = (precoCarro - entradaValor).toFixed(2);
      } else {
          valorFinanciadoInput.value = precoCarro.toFixed(2);
      }

      // Recalcula o financiamento ao alterar a entrada
      calcularFinanciamento();
  });

  // Eventos para recalcular o financiamento quando o número de parcelas ou a taxa de juros mudar
  document.getElementById("parcelas").addEventListener("change", calcularFinanciamento);
  document.getElementById("taxaJuros").addEventListener("input", calcularFinanciamento);

  // Recalcula automaticamente ao carregar a página
  calcularFinanciamento();
});

// Função para calcular o financiamento
function calcularFinanciamento() {
  const valorFinanciado = parseFloat(document.getElementById("valorFinanciado").value.replace(",", "."));
  const parcelas = parseInt(document.getElementById("parcelas").value);
  const taxaJuros = parseFloat(document.getElementById("taxaJuros").value) / 100;

  if (!isNaN(valorFinanciado) && !isNaN(parcelas) && taxaJuros >= 0) {
      // Cálculo usando juros simples
      const jurosAcumulados = valorFinanciado * taxaJuros * parcelas;
      const valorFinal = valorFinanciado + jurosAcumulados;
      const valorParcela = valorFinal / parcelas;

      document.getElementById("valorParcela").value = valorParcela.toFixed(2);
      document.getElementById("valorFinal").value = valorFinal.toFixed(2);
  } else {
      alert("Insira valores válidos para o cálculo!");
  }
}
