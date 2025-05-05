document.addEventListener("DOMContentLoaded", function () {
    console.log("Query string recebida:", window.location.search);

    // Recupera os parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    let preco = params.get("preco");

    // Se o preço não estiver na URL, tenta recuperar do localStorage
    if (!preco || isNaN(parseFloat(preco))) {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        if (carrosSalvos.length > 0) {
            preco = carrosSalvos[carrosSalvos.length - 1].preco;
        } else {
            preco = "0"; 
        }
    }

    console.log("Preço recuperado:", preco);

    // Atualiza a exibição do preço na interface de financiamento
    const valorTotalInput = document.getElementById("valorTotal");
    if (valorTotalInput) {
        valorTotalInput.value = preco;
    }

    const entradaInput = document.getElementById("entrada");
    const valorFinanciadoInput = document.getElementById("valorFinanciado");

    // Define um valor inicial para a entrada (mínimo de 10% do preço)
    entradaInput.value = (parseFloat(preco) * 0.1).toFixed(2);

    // Atualiza dinamicamente o financiamento com base no valor inserido na entrada
    entradaInput.addEventListener("input", function () {
        const entradaValor = parseFloat(entradaInput.value.replace(",", "."));
        const precoCarro = parseFloat(preco);

        if (!isNaN(entradaValor) && entradaValor >= 0 && entradaValor <= precoCarro) {
            valorFinanciadoInput.value = (precoCarro - entradaValor).toFixed(2);
        } else {
            valorFinanciadoInput.value = precoCarro.toFixed(2); 
        }
    });
});
