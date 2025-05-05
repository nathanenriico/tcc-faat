document.addEventListener("DOMContentLoaded", function () {
    console.log("Query string recebida:", window.location.search);

    const params = new URLSearchParams(window.location.search);
    let preco = params.get("preco");
    let imagemCarro = params.get("imagem");

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

    document.getElementById("valorTotal").value = preco;
    document.getElementById("carImage").src = imagemCarro;

    const entradaInput = document.getElementById("entrada");
    const valorFinanciadoInput = document.getElementById("valorFinanciado");

    entradaInput.value = (parseFloat(preco) * 0.1).toFixed(2);
    
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

function calcularFinanciamento() {
    const valorFinanciado = parseFloat(document.getElementById("valorFinanciado").value.replace(",", "."));
    const parcelas = parseInt(document.getElementById("parcelas").value);
    const taxaJuros = parseFloat(document.getElementById("taxaJuros").value) / 100;

    if (!isNaN(valorFinanciado) && !isNaN(parcelas) && taxaJuros > 0) {
        const jurosAcumulados = valorFinanciado * taxaJuros * parcelas;
        const valorFinal = valorFinanciado + jurosAcumulados;
        const valorParcela = valorFinal / parcelas;

        document.getElementById("valorParcela").value = valorParcela.toFixed(2);
        document.getElementById("valorFinal").value = valorFinal.toFixed(2);
    } else {
        alert("Insira valores válidos para o cálculo!");
    }
}
