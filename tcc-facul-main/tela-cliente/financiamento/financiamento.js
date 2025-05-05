document.addEventListener("DOMContentLoaded", function () {
    console.log("Query string recebida:", window.location.search);

    // Recupera os parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    let preco = params.get("preco");
    let imagemCarro = params.get("imagem");

    // Se o preço não estiver na URL, tenta recuperar do localStorage
    if (!preco || isNaN(parseFloat(preco))) {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        if (carrosSalvos.length > 0) {
            preco = carrosSalvos[carrosSalvos.length - 1].preco;
            imagemCarro = carrosSalvos[carrosSalvos.length - 1].imagens[0]; // Pega a primeira imagem salva
        } else {
            preco = "0"; 
            imagemCarro = "img/fallback.png"; // Imagem padrão caso não haja veículo salvo
        }
    }

    console.log("Preço recuperado:", preco);
    console.log("Imagem do carro recuperada:", imagemCarro);

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

    // Atualiza a imagem do carro na interface
    const carImageEl = document.getElementById("carImage");
    if (carImageEl) {
        carImageEl.src = imagemCarro;
    }
});
