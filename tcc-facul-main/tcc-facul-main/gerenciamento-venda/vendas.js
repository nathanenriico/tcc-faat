document.addEventListener("DOMContentLoaded", function () {
    const registerSaleBtn = document.getElementById("registerSaleBtn");
    const saleModal = document.getElementById("saleModal");
    const closeBtn = document.querySelector(".close-btn");
    const saleForm = document.getElementById("saleForm");
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const lineChartCtx = document.getElementById("lineChart").getContext("2d");
    const totalVendasElem = document.getElementById("totalVendas");
    const viewSalesBtn = document.getElementById("viewSalesBtn");

    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const filterBtn = document.getElementById("filterBtn");

    let totalVendas = 0;
    let salesData = [];


    // Redireciona para a página de visualização de vendas ao clicar no botão
    viewSalesBtn.addEventListener("click", function () {
        window.location.href = "./pages/";
    });
    

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

        const saleDate = new Date(); // Data atual como data da venda
        salesData.push({ model: carModel, value: carValue, date: saleDate });
        totalVendas += carValue;

        totalVendasElem.textContent = `R$ ${totalVendas.toFixed(2)}`;
        saleModal.style.display = "none";
        atualizarGraficos();
    });

    // Filtra dados e atualiza gráficos
    filterBtn.addEventListener("click", function () {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (isNaN(startDate) || isNaN(endDate)) {
            alert("Por favor, selecione datas válidas.");
            return;
        }

        const filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        atualizarGraficosFiltrados(filteredSales);
    });

    // Inicializa gráficos
    const barChart = new Chart(barChartCtx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Vendas (R$)",
                data: [],
                backgroundColor: "#007BFF",
            }],
        },
        options: {
            responsive: true,
        },
    });

    const lineChart = new Chart(lineChartCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Crescimento (%)",
                data: [],
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

    // Atualiza gráficos filtrados
    function atualizarGraficosFiltrados(filteredData) {
        const labels = filteredData.map(sale => sale.model);
        const data = filteredData.map(sale => sale.value);

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
