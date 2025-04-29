document.addEventListener("DOMContentLoaded", function () {
    const resumoMesElem = document.getElementById("totalVendasMes");
    const resumoAnoElem = document.getElementById("totalVendasAnos");
    const salesContent = document.getElementById("salesContent");

    let salesData = JSON.parse(localStorage.getItem("salesData")) || []; // Carrega vendas salvas
    atualizarResumoVendas();
    atualizarDetalhesVendas();

    // Atualiza o resumo de vendas
    function atualizarResumoVendas() {
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        // Filtra vendas do mês atual
        const vendasMes = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === mesAtual && saleDate.getFullYear() === anoAtual;
        });

        // Soma valores das vendas do mês atual
        const totalVendasMes = vendasMes.reduce((sum, sale) => sum + sale.value, 0);
        resumoMesElem.textContent = `R$ ${totalVendasMes.toFixed(2)}`;

        // Soma valores de todas as vendas acumuladas no ano atual
        const vendasAno = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getFullYear() === anoAtual;
        });
        const totalVendasAno = vendasAno.reduce((sum, sale) => sum + sale.value, 0);
        resumoAnoElem.textContent = `R$ ${totalVendasAno.toFixed(2)}`;
    }

    // Atualiza os detalhes das vendas na tabela
    function atualizarDetalhesVendas() {
        salesContent.innerHTML = "";

        if (salesData.length === 0) {
            salesContent.innerHTML = "<p>Sem vendas registradas.</p>";
            return;
        }

        salesData.forEach(sale => {
            const saleDate = new Date(sale.date);
            const saleRow = document.createElement("div");
            saleRow.classList.add("sale-row");
            saleRow.innerHTML = `
                <p><strong>Modelo:</strong> ${sale.model}</p>
                <p><strong>Valor:</strong> R$ ${sale.value.toFixed(2)}</p>
                <p><strong>Data:</strong> ${saleDate.toLocaleDateString()}</p>
            `;
            salesContent.appendChild(saleRow);
        });
    }
});
