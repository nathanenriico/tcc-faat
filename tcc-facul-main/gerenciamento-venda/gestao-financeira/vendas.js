document.addEventListener("DOMContentLoaded", function() {
    // Configuração do Supabase
    const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    console.log("Inicializando...");
    
    // Elementos DOM
    const registerSaleBtn = document.getElementById("registerSaleBtn");
    const viewSalesBtn = document.getElementById("viewSalesBtn");
    const deleteSaleBtn = document.getElementById("deleteSaleBtn");
    const saleModal = document.getElementById("saleModal");
    const deleteModal = document.getElementById("deleteModal");
    const closeBtn = document.querySelector(".close-btn");
    const closeDeleteBtn = document.querySelector(".close-delete-btn");
    const backBtn = document.getElementById("backBtn");
    const saleForm = document.getElementById("saleForm");
    const filterBtn = document.getElementById("filterBtn");
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const totalVendasElement = document.getElementById("totalVendas");
    const deleteSalesContent = document.getElementById("deleteSalesContent");
    const barChartCtx = document.getElementById("barChart").getContext("2d");
    const lineChartCtx = document.getElementById("lineChart").getContext("2d");
    
    // Dados locais
    let salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    let totalVendas = salesData.reduce((sum, sale) => sum + sale.value, 0);
    totalVendasElement.textContent = formatarMoeda(totalVendas);
    
    // Inicializar gráficos
    const barChart = new Chart(barChartCtx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Vendas por Modelo (R$)",
                data: [],
                backgroundColor: "#007BFF",
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        },
    });

    const lineChart = new Chart(lineChartCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Tendência de Vendas (R$)",
                data: [],
                borderColor: "#28a745",
                fill: false,
            }],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        },
    });
    
    // Carregar dados iniciais e atualizar gráficos
    carregarDados();
    atualizarGraficos(salesData);
    
    // Evento para botão Registrar Venda
    registerSaleBtn.addEventListener("click", function() {
        console.log("Botão registrar clicado");
        // Definir a data atual como valor padrão no campo de data
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById("saleDate").value = hoje;
        saleModal.style.display = "flex";
    });
    
    // Evento para botão Visualizar Vendas
    viewSalesBtn.addEventListener("click", function() {
        console.log("Botão visualizar clicado");
        window.location.href = "/tcc-facul-main/gerenciamento-venda/visualizacao-vendas/visualização-vendas.html";
    });
    
    // Evento para botão Excluir Venda
    deleteSaleBtn.addEventListener("click", function() {
        console.log("Botão excluir clicado");
        deleteModal.style.display = "flex";
        atualizarVendasExclusao();
    });
    
    // Evento para botão Filtrar
    filterBtn.addEventListener("click", function() {
        console.log("Botão filtrar clicado");
        filtrarVendas();
    });
    
    // Fechar modal de registro
    closeBtn.addEventListener("click", function() {
        saleModal.style.display = "none";
    });
    
    // Fechar modal de exclusão
    closeDeleteBtn.addEventListener("click", function() {
        deleteModal.style.display = "none";
    });
    
    // Botão voltar no modal de exclusão
    backBtn.addEventListener("click", function() {
        deleteModal.style.display = "none";
    });
    
    // Submeter formulário de venda
    saleForm.addEventListener("submit", function(e) {
        e.preventDefault();
        console.log("Formulário submetido");

        const modelo = document.getElementById("carModel").value;
        const valor = parseFloat(document.getElementById("carValue").value);
        const data_venda = document.getElementById("saleDate").value; // Formato: "2025-04-01"
        
        console.log("Data da venda:", data_venda);
        
        // Verificar se a data está no formato correto
        if (!data_venda) {
            alert("Por favor, selecione uma data válida.");
            return;
        }
        
        // Salvar no Supabase
        supabase
            .from("Vendas")
            .insert([{ modelo, valor, data_venda }])
            .then(({ data, error }) => {
                if (error) {
                    console.error("Erro ao registrar venda no Supabase:", error);
                    alert("Erro ao registrar venda: " + error.message);
                    return;
                }

                console.log("Venda registrada com sucesso no Supabase:", data);
                
                // Também salvar no localStorage
                const saleDate = new Date(data_venda);
                const newSale = { 
                    model: modelo, 
                    value: valor, 
                    date: saleDate,
                    id: data && data[0] ? data[0].id : Date.now() // Usar ID do Supabase ou timestamp
                };
                
                salesData.push(newSale);
                localStorage.setItem("salesData", JSON.stringify(salesData));
                
                // Atualizar total
                totalVendas += valor;
                totalVendasElement.textContent = formatarMoeda(totalVendas);
                
                alert("Venda registrada com sucesso!");
                saleModal.style.display = "none";
                document.getElementById("carModel").value = "";
                document.getElementById("carValue").value = "";
                document.getElementById("saleDate").value = "";

                // Atualizar gráficos e lista de exclusão
                atualizarGraficos(salesData);
                atualizarVendasExclusao();
            })
            .catch(err => {
                console.error("Erro ao processar venda:", err);
                alert("Ocorreu um erro ao processar a venda. Tente novamente.");
            });
    });

    // Função para atualizar lista de vendas para exclusão
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
                <p><strong>Valor:</strong> ${formatarMoeda(sale.value)}</p>
                <p><strong>Data:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
                <button class="delete-btn" data-index="${index}" data-id="${sale.id || ''}">Excluir</button>
            `;
            deleteSalesContent.appendChild(saleRow);
        });

        // Adiciona evento de exclusão a cada botão
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener("click", function() {
                const index = parseInt(this.getAttribute("data-index"));
                const id = this.getAttribute("data-id");
                excluirVenda(index, id);
            });
        });
    }

    // Função para excluir venda
    function excluirVenda(index, id) {
        if (!confirm("Tem certeza que deseja excluir esta venda?")) {
            return;
        }

        const vendaExcluida = salesData[index];
        
        // Se tiver ID, excluir do Supabase também
        if (id) {
            supabase
                .from("Vendas")
                .delete()
                .eq('id', id)
                .then(({ error }) => {
                    if (error) {
                        console.error("Erro ao excluir venda do Supabase:", error);
                        alert("Erro ao excluir venda do banco de dados: " + error.message);
                        return;
                    }
                    
                    console.log("Venda excluída do Supabase com sucesso!");
                    
                    // Continuar com exclusão local
                    finalizarExclusao();
                })
                .catch(err => {
                    console.error("Erro ao excluir venda:", err);
                    alert("Ocorreu um erro ao excluir a venda. Tente novamente.");
                });
        } else {
            // Se não tiver ID, excluir apenas localmente
            finalizarExclusao();
        }
        
        function finalizarExclusao() {
            // Remover do array local
            salesData.splice(index, 1);
            
            // Atualizar localStorage
            localStorage.setItem("salesData", JSON.stringify(salesData));
            
            // Atualizar total
            totalVendas -= vendaExcluida.value;
            totalVendasElement.textContent = formatarMoeda(totalVendas);
            
            alert("Venda excluída com sucesso!");
            
            // Atualizar interface
            atualizarVendasExclusao();
            atualizarGraficos(salesData);
        }
    }

    // Função para carregar dados do Supabase
    async function carregarDados() {
        console.log("Carregando dados do Supabase...");
        
        try {
            const { data, error } = await supabase
                .from("Vendas")
                .select("*")
                .order('data_venda', { ascending: true });
            
            if (error) {
                console.error("Erro ao carregar dados do Supabase:", error);
                return;
            }

            console.log("Dados carregados do Supabase:", data);
            
            // Sincronizar dados do Supabase com localStorage
            if (data && data.length > 0) {
                // Converter dados do Supabase para o formato do localStorage
                const supabaseData = data.map(item => ({
                    model: item.modelo,
                    value: item.valor,
                    date: new Date(item.data_venda),
                    id: item.id
                }));
                
                // Mesclar dados, priorizando os do Supabase
                salesData = supabaseData;
                localStorage.setItem("salesData", JSON.stringify(salesData));
                
                // Atualizar total
                totalVendas = salesData.reduce((sum, sale) => sum + sale.value, 0);
                totalVendasElement.textContent = formatarMoeda(totalVendas);
            }
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
        }
    }

    // Função para filtrar vendas
    function filtrarVendas() {
        const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
        const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
        
        if ((startDate && isNaN(startDate)) || (endDate && isNaN(endDate))) {
            alert("Por favor, selecione datas válidas.");
            return;
        }
        
        console.log("Filtrando vendas:", { startDate, endDate });
        
        // Se não houver datas, mostrar todos os dados
        if (!startDate && !endDate) {
            atualizarGraficos(salesData);
            return;
        }
        
        // Filtrar dados
        const filteredSales = salesData.filter(sale => {
            const saleDate = new Date(sale.date);
            
            if (startDate && endDate) {
                return saleDate >= startDate && saleDate <= endDate;
            } else if (startDate) {
                return saleDate >= startDate;
            } else if (endDate) {
                return saleDate <= endDate;
            }
            
            return true;
        });
        
        // Atualizar gráficos com dados filtrados
        atualizarGraficos(filteredSales);
    }

    // Função para atualizar gráficos
    function atualizarGraficos(vendas) {
        console.log("Atualizando gráficos com dados:", vendas);
        
        if (!vendas || vendas.length === 0) {
            // Limpar gráficos se não houver dados
            barChart.data.labels = [];
            barChart.data.datasets[0].data = [];
            barChart.update();
            
            lineChart.data.labels = [];
            lineChart.data.datasets[0].data = [];
            lineChart.update();
            return;
        }
        
        // Usar modelo do carro como label e valor como dados
        const labels = vendas.map(venda => venda.model);
        const data = vendas.map(venda => venda.value);
        
        console.log("Modelos:", labels);
        console.log("Valores:", data);
        
        // Atualizar gráfico de barras
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = data;
        barChart.update();
        
        // Calcular crescimento para o gráfico de linha
        const crescimento = data.map((val, index, arr) => {
            return index > 0 ? ((val - arr[index - 1]) / arr[index - 1]) * 100 : 0;
        });
        
        // Atualizar gráfico de linha
        lineChart.data.labels = labels;
        lineChart.data.datasets[0].data = crescimento;
        lineChart.update();
    }
    
    // Função auxiliar para formatar data para exibição
    function formatarData(dataString) {
        if (!dataString) return '';
        
        // Verificar se a data já está no formato brasileiro
        if (dataString.includes('/')) {
            return dataString;
        }
        
        // Verificar se a data tem o formato ISO com T
        if (dataString.includes('T')) {
            dataString = dataString.split('T')[0];
        }
        
        // Converter para o formato brasileiro
        try {
            const [ano, mes, dia] = dataString.split('-');
            if (ano && mes && dia) {
                return `${dia}/${mes}/${ano}`;
            }
            return dataString; // Retorna original se não conseguir formatar
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }

    // Função para formatar valores em reais
    function formatarMoeda(valor) {
        if (valor === undefined || valor === null) {
            return 'R$ 0,00';
        }
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
});