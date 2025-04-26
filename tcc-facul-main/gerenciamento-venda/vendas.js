document.addEventListener("DOMContentLoaded", function () {
    const registerSaleBtn = document.getElementById("registerSaleBtn");
    const saleModal = document.getElementById("saleModal");
    const closeBtn = document.querySelector(".close-btn");
    const saleForm = document.getElementById("saleForm");
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const lineChartCtx = document.getElementById("lineChart").getContext("2d");
    const totalVendasElem = document.getElementById("totalVendas");

    let totalVendas = 0;
    let salesData = [];

    // Abre o modal
    registerSaleBtn.addEventListener("click", function () {
        saleModal.style.display = "flex";
    });

    // Fecha o modal
    closeBtn.addEventListener("click", function () {
        saleModal.style.display = "none";
    });

    // Registra a venda
    saleForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const carModel = document.getElementById("carModel").value;
        const carValue = parseFloat(document.getElementById("carValue").value);

        salesData.push({ model: carModel, value: carValue });
        totalVendas += carValue;

        totalVendasElem.textContent = `R$ ${totalVendas.toFixed(2)}`;
        saleModal.style.display = "none";
        atualizarGraficos();
    });

    // Inicializa gráficos
    // Gráfico de Barras - Dados Estáticos
    const barChart = new Chart(barChartCtx, {
        type: "bar",
        data: {
            labels: ["Modelo A", "Modelo B", "Modelo C"],
            datasets: [{
                label: "Vendas (R$)",
                data: [15000, 12000, 18000],
                backgroundColor: "#007BFF",
            }],
        },
        options: {
            responsive: true,
        },
    });

    // Gráfico de Linhas - Dados Estáticos
    const lineChart = new Chart(lineChartCtx, {
        type: "line",
        data: {
            labels: ["Janeiro", "Fevereiro", "Março"],
            datasets: [{
                label: "Crescimento (%)",
                data: [10, 20, 30],
                borderColor: "#28a745",
                fill: false,
            }],
        },
        options: {
            responsive: true,
        },
    });

    // Atualiza gráficos
    function atualizarGraficos() {
        const labels = salesData.map(sale => sale.model);
        const data = salesData.map(sale => sale.value);

        barChart.data.labels = labels;
        barChart.data.datasets[0].data = data;
        barChart.update();

        const crescimento = data.map((val, index, arr) => {
            return index > 0 ? ((val - arr[index - 1]) / arr[index - 1]) * 100 : 0;
        });

        lineChart.data.labels = labels;
        lineChart.data.datasets[0].data = crescimento;
        lineChart.update();
    }
});
