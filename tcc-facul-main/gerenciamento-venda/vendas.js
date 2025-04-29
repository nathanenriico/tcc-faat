document.addEventListener("DOMContentLoaded", function () {
    const registerSaleBtn = document.getElementById("registerSaleBtn");
    const deleteSaleBtn = document.getElementById("deleteSaleBtn");
    const saleModal = document.getElementById("saleModal");
    const deleteModal = document.getElementById("deleteModal");
    const backBtn = document.getElementById("backBtn");
    const closeBtn = document.querySelector(".close-btn");
    const closeDeleteBtn = document.querySelector(".close-delete-btn");
    const saleForm = document.getElementById("saleForm");
    const deleteSalesContent = document.getElementById("deleteSalesContent");
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const lineChartCtx = document.getElementById("lineChart").getContext("2d");
    const totalVendasElem = document.getElementById("totalVendas");
    const viewSalesBtn = document.getElementById("viewSalesBtn");

    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const filterBtn = document.getElementById("filterBtn");

    let salesData = JSON.parse(localStorage.getItem("salesData")) || []; // Carrega vendas salvas
    let totalVendas = salesData.reduce((sum, sale) => sum + sale.value, 0); // Calcula total inicial
    totalVendasElem.textContent = `R$ ${totalVendas.toFixed(2)}`;

    // Redireciona para a página de visualização de vendas ao clicar no botão
    viewSalesBtn.addEventListener("click", function () {
        window.location.href = "../visualizacao-vendas/visualização-vendas.html";
    });

    // Evento para fechar o modal ao clicar no botão "Voltar"
    backBtn.addEventListener("click", function () {
        deleteModal.style.display = "none";
    });

    // Abre o modal de registro de vendas
    registerSaleBtn.addEventListener("click", function () {
        saleModal.style.display = "flex";
    });

    // Fecha o modal de registro de vendas
    closeBtn.addEventListener("click", function () {
        saleModal.style.display = "none";
    });

    // Registra a venda
    saleForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const carModel = document.getElementById("carModel").value;
        const carValue = parseFloat(document.getElementById("carValue").value);
        const saleDate = new Date();

        salesData.push({ model: carModel, value: carValue, date: saleDate });
        localStorage.setItem("salesData", JSON.stringify(salesData)); // Salva no localStorage
        totalVendas += carValue;

        totalVendasElem.textContent = `R$ ${totalVendas.toFixed(2)}`;
        saleModal.style.display = "none";

        atualizarGraficos();
    });

    // Exibe o modal de exclusão
    deleteSaleBtn.addEventListener("click", function () {
        deleteModal.style.display = "flex";
        atualizarVendasExclusao();
    });

     // Fecha o modal de exclusão ao clicar no "X"
     closeDeleteBtn.addEventListener("click", function () {
        deleteModal.style.display = "none";
    });

    // Atualiza a lista de vendas para exclusão
    function atualizarVendasExclusao() {
        deleteSalesContent.innerHTML = "";

        if (salesData.length === 0) {
            deleteSalesContent.innerHTML = "<p>Sem vendas registradas.</p>";
            return;
        }

        salesData.forEach((sale, index) => {
            const saleRow = document.createElement("div");
            saleRow.classList.add("sale-row");
            saleRow.innerHTML = `
                <p><strong>Modelo:</strong> ${sale.model}</p>
                <p><strong>Valor:</strong> R$ ${sale.value.toFixed(2)}</p>
                <p><strong>Data:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
                <button class="delete-btn" data-index="${index}">Excluir</button>
            `;
            deleteSalesContent.appendChild(saleRow);
        });

          // Adiciona evento de exclusão a cada botão
          const deleteButtons = document.querySelectorAll(".delete-btn");
          deleteButtons.forEach(button => {
              button.addEventListener("click", function () {
                  const index = button.getAttribute("data-index");
                  excluirVenda(index);
              });
          });
      }

    // Função para excluir uma venda
    function excluirVenda(index) {
        const vendaExcluida = salesData[index];
        salesData.splice(index, 1); // Remove venda do array
        localStorage.setItem("salesData", JSON.stringify(salesData)); // Atualiza localStorage

        totalVendas -= vendaExcluida.value; // Atualiza total
        totalVendasElem.textContent = `R$ ${totalVendas.toFixed(2)}`;

        atualizarVendasExclusao(); // Atualiza lista no modal
        atualizarGraficos(); // Atualiza gráficos
    }

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
