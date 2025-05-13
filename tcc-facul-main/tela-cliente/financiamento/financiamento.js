document.addEventListener("DOMContentLoaded", function () {
    // Para depuração: exibe a URL completa e a query string
    console.log("URL completa:", window.location.href);
    console.log("Query string:", window.location.search);
    
    const params = new URLSearchParams(window.location.search);
    
    // Obtém os valores dos parâmetros
    const fabricanteRaw = params.get("fabricante");
    const modeloRaw = params.get("modelo");
    const anoRaw = params.get("ano");
    const precoRaw = params.get("preco");
    const kmRaw = params.get("km");

    console.log("Parâmetros lidos:", {
        fabricante: fabricanteRaw,
        modelo: modeloRaw,
        ano: anoRaw,
        preco: precoRaw,
        km: kmRaw
    });

    // Aplica os valores aos elementos, tratando valores vazios com fallback
    const fabricante = (fabricanteRaw && fabricanteRaw.trim() !== "") ? fabricanteRaw.trim() : "Não informado";
    const modelo = (modeloRaw && modeloRaw.trim() !== "") ? modeloRaw.trim() : "Não informado";
    const ano = (anoRaw && anoRaw.trim() !== "") ? anoRaw.trim() : "Não informado";
    let preco = 0;
    if (precoRaw && precoRaw.trim() !== "") {
        preco = parseFloat(precoRaw);
        if (isNaN(preco)) { preco = 0; }
    }
    const km = (kmRaw && kmRaw.trim() !== "") ? kmRaw.trim() : "Não informado";

    // Atualiza os elementos da página
    document.getElementById("fabricante").textContent = fabricante;
    document.getElementById("modelo").textContent = modelo;
    document.getElementById("ano").textContent = ano;
    document.getElementById("preco").textContent = `R$ ${preco.toLocaleString("pt-BR")}`;
    document.getElementById("km").textContent = km;

    // Exemplo de cálculo de financiamento (manter seu código existente)
    document.getElementById("calcular").addEventListener("click", function () {
        const entrada = Number(document.getElementById("entrada").value) || 0;
        const parcelas = Number(document.getElementById("parcelas").value);

        if (entrada >= preco) {
            alert("Entrada não pode ser maior ou igual ao valor do carro.");
            return;
        }

        const valorFinanciado = preco - entrada;
        const taxaJuros = 0.015; // 1.5% ao mês
        const valorParcela = (valorFinanciado * (1 + taxaJuros * parcelas)) / parcelas;
        const totalPagar = valorParcela * parcelas;
        const totalJuros = totalPagar - valorFinanciado;

        document.getElementById("valorParcela").textContent = `R$ ${valorParcela.toLocaleString("pt-BR")}`;
        document.getElementById("totalPagar").textContent = `R$ ${totalPagar.toLocaleString("pt-BR")}`;
        document.getElementById("totalJuros").textContent = `R$ ${totalJuros.toLocaleString("pt-BR")}`;
    });
});
