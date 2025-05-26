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
    
    // Inicializar gráficos vazios
    let barChart = null;
    let lineChart = null;
    
    // Carregar dados iniciais
    carregarDados();
    
    // Evento para botão Registrar Venda
    registerSaleBtn.onclick = function() {
        console.log("Botão registrar clicado");
        // Definir a data atual como valor padrão no campo de data
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById("saleDate").value = hoje;
        saleModal.style.display = "flex";
    };
    
    // Evento para botão Visualizar Vendas
    viewSalesBtn.onclick = function() {
        console.log("Botão visualizar clicado");
        window.location.href = "/tcc-facul-main/gerenciamento-venda/visualizacao-vendas/visualização-vendas.html";
    };
    
    // Evento para botão Excluir Venda
    deleteSaleBtn.onclick = function() {
        console.log("Botão excluir clicado");
        deleteModal.style.display = "flex";
        atualizarVendasExclusao();
    };
    
    // Evento para botão Filtrar
    filterBtn.addEventListener('click', function() {
        console.log("Botão filtrar clicado");
        carregarDados();
    });
    
    // Fechar modal de registro
    closeBtn.onclick = function() {
        saleModal.style.display = "none";
    };
    
    // Fechar modal de exclusão
    closeDeleteBtn.onclick = function() {
        deleteModal.style.display = "none";
    };
    
    // Botão voltar no modal de exclusão
    backBtn.onclick = function() {
        deleteModal.style.display = "none";
    };
    
    // Submeter formulário de venda
    saleForm.onsubmit = async function(e) {
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
        
        const { data, error } = await supabase
            .from("Vendas")
            .insert([{ modelo, valor, data_venda }]);

        if (error) {
            console.error("Erro ao registrar venda no Supabase:", error);
            alert("Erro ao registrar venda: " + error.message);
            return;
        }

        console.log("Venda registrada com sucesso:", data);
        alert("Venda registrada com sucesso!");
        saleModal.style.display = "none";
        document.getElementById("carModel").value = "";
        document.getElementById("carValue").value = "";
        document.getElementById("saleDate").value = "";

        // Atualizar popup de exclusão imediatamente
        atualizarVendasExclusao();
        // Recarregar dados após registrar uma nova venda
        carregarDados();
    };

    // Função para atualizar lista de vendas para exclusão
    async function atualizarVendasExclusao() {
        const deleteSalesContent = document.getElementById("deleteSalesContent");
        deleteSalesContent.innerHTML = "<p>Carregando vendas...</p>";

        const { data, error } = await supabase
            .from("Vendas")
            .select("id, modelo, valor, data_venda");

        if (error) {
            console.error("Erro ao carregar vendas:", error);
            deleteSalesContent.innerHTML = "<p>Erro ao carregar vendas.</p>";
            return;
        }

        console.log("Vendas carregadas:", data);

        if (data.length === 0) {
            deleteSalesContent.innerHTML = "<p>Nenhuma venda registrada.</p>";
            return;
        }

        // Exibir vendas no modal corretamente
        deleteSalesContent.innerHTML = data.map(sale => 
            `<div class="sale-item">
                <p>${sale.modelo} - ${formatarMoeda(sale.valor)} - ${formatarData(sale.data_venda)}</p>
                <button class="delete-btn" data-id="${sale.id}">Excluir</button>
            </div>`
        ).join("");

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                await excluirVenda(id);
            });
        });
    }

    // Função para excluir venda
    async function excluirVenda(id) {
        if (!confirm("Tem certeza que deseja excluir esta venda?")) {
            return;
        }

        const { error } = await supabase
            .from("Vendas")
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erro ao excluir venda:", error);
            alert("Erro ao excluir venda: " + error.message);
            return;
        }

        alert("Venda excluída com sucesso!");
        atualizarVendasExclusao();
        carregarDados();
    }

    // Função para carregar dados e atualizar gráficos
  async function carregarDados() {
    console.log("Carregando dados...");
    
    let query = supabase.from("Vendas").select("*");
    
    // Capturar valores dos filtros
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    console.log("Filtros aplicados:", { startDate, endDate });

    // Aplicar filtros na consulta ao Supabase
    if (startDate) {
        // Usar apenas a data sem T e Z para compatibilidade com o formato do banco
        query = query.gte("data_venda", startDate);
        console.log("Filtrando a partir de:", startDate);
    }
    
    if (endDate) {
        // Incluir o dia final completo
        query = query.lte("data_venda", endDate);
        console.log("Filtrando até:", endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Erro ao carregar dados:", error);
        return;
    }

    console.log("Dados carregados:", data);

    if (data.length === 0) {
        console.warn("Nenhuma venda encontrada para o período especificado.");
        // Atualizar total para zero
        totalVendasElement.textContent = formatarMoeda(0);
        // Criar gráficos vazios
        criarGraficos([]);
        return;
    }

    // Atualizar total de vendas
    totalVendasElement.textContent = formatarMoeda(data.reduce((total, venda) => total + venda.valor, 0));

    // Atualizar gráficos com os dados filtrados
    criarGraficos(data);
}
    
    // Função para criar os gráficos
    function criarGraficos(vendas) {
        console.log("Criando gráficos com dados:", vendas);
        
        // Verificar se os elementos canvas existem
        const barChartElement = document.getElementById('barChart');
        const lineChartElement = document.getElementById('lineChart');
        
        if (!barChartElement || !lineChartElement) {
            console.error("Elementos de gráfico não encontrados no DOM");
            return;
        }
        
        // Destruir gráficos existentes para evitar duplicação
        if (barChart) {
            barChart.destroy();
            barChart = null;
        }
        
        if (lineChart) {
            lineChart.destroy();
            lineChart = null;
        }
        
        // Preparar dados para os gráficos
        const vendasPorData = {};
        
        // Se não houver vendas, criar gráficos vazios
        if (!vendas || vendas.length === 0) {
            console.log("Nenhuma venda para exibir");
            
            // Criar gráficos vazios
            const barCtx = barChartElement.getContext('2d');
            barChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Vendas por Data (R$)',
                        data: [],
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            const lineCtx = lineChartElement.getContext('2d');
            lineChart = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Tendência de Vendas (R$)',
                        data: [],
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            return;
        }
        
        // Agrupar vendas por data
        vendas.forEach(venda => {
            // Garantir que estamos usando apenas a parte da data (sem T e Z)
            let data = venda.data_venda;
            if (data.includes('T')) {
                data = data.split('T')[0];
            }
            
            if (!vendasPorData[data]) {
                vendasPorData[data] = 0;
            }
            vendasPorData[data] += venda.valor;
            console.log(`Agrupando venda: ${data} - ${formatarMoeda(venda.valor)}`);
        });
        
        // Ordenar datas
        const datas = Object.keys(vendasPorData).sort();
        const valores = datas.map(data => vendasPorData[data]);
        
        // Criar gráfico de barras
        const barCtx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: datas.map(data => formatarData(data)),
                datasets: [{
                    label: 'Vendas por Data (R$)',
                    data: valores,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return formatarMoeda(tooltipItem.value);
                        }
                    }
                }
            }
        });
        
        // Criar gráfico de linha
        const lineCtx = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: datas.map(data => formatarData(data)),
                datasets: [{
                    label: 'Tendência de Vendas (R$)',
                    data: valores,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return formatarMoeda(tooltipItem.value);
                        }
                    }
                }
            }
        });
    }
    
    // Função auxiliar para formatar data
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