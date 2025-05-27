document.addEventListener("DOMContentLoaded", function () {
    // Configuração do Supabase
    const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    const resumoMesElem = document.getElementById("totalVendasMes");
    const resumoAnoElem = document.getElementById("totalVendasAnos");
    const salesContent = document.getElementById("salesContent");
    const monthFilterSelect = document.getElementById("monthFilter");
    const totalVendasDetalhadas = document.getElementById("totalVendasDetalhadas");

    // Carregar dados do localStorage primeiro para exibição rápida
    let salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    
    // Preencher o seletor de meses
    preencherSeletorMeses();
    
    // Adicionar evento ao seletor de meses
    monthFilterSelect.addEventListener("change", function() {
        filtrarVendas();
    });

    // Exibir dados do localStorage imediatamente
    if (salesData.length > 0) {
        console.log("Exibindo dados do localStorage:", salesData);
        processarDadosLocais(salesData);
    }
    
    // Em seguida, carregar dados do Supabase para atualização
    carregarDadosSupabase();

    // Função para preencher o seletor de meses
    function preencherSeletorMeses() {
        const meses = [
            { valor: "todos", texto: "Todos os meses" },
            { valor: "0", texto: "Janeiro" },
            { valor: "1", texto: "Fevereiro" },
            { valor: "2", texto: "Março" },
            { valor: "3", texto: "Abril" },
            { valor: "4", texto: "Maio" },
            { valor: "5", texto: "Junho" },
            { valor: "6", texto: "Julho" },
            { valor: "7", texto: "Agosto" },
            { valor: "8", texto: "Setembro" },
            { valor: "9", texto: "Outubro" },
            { valor: "10", texto: "Novembro" },
            { valor: "11", texto: "Dezembro" }
        ];

        // Adicionar opções ao select
        meses.forEach(mes => {
            const option = document.createElement("option");
            option.value = mes.valor;
            option.textContent = mes.texto;
            monthFilterSelect.appendChild(option);
        });

        // Selecionar o mês atual
        const mesAtual = new Date().getMonth().toString();
        monthFilterSelect.value = mesAtual;
    }

    // Processar dados do localStorage
    function processarDadosLocais(dados) {
        // Converter formato do localStorage para o formato do Supabase
        const vendasFormatadas = dados.map(sale => ({
            modelo: sale.model,
            valor: sale.value,
            data_venda: new Date(sale.date).toISOString().split('T')[0]
        }));
        
        atualizarResumoVendas(vendasFormatadas);
        filtrarVendas(vendasFormatadas);
    }

    // Carregar dados do Supabase
    async function carregarDadosSupabase() {
        try {
            console.log("Carregando dados do Supabase...");
            
            const { data, error } = await supabase
                .from("Vendas")
                .select("*");

            if (error) {
                console.error("Erro ao carregar vendas do Supabase:", error);
                return;
            }

            console.log("Vendas carregadas do Supabase:", data);
            
            if (data && data.length > 0) {
                // Converter dados do Supabase para o formato do localStorage
                const localData = data.map(item => ({
                    model: item.modelo,
                    value: item.valor,
                    date: new Date(item.data_venda),
                    id: item.id
                }));
                
                // Atualizar localStorage com dados do Supabase
                localStorage.setItem("salesData", JSON.stringify(localData));
                salesData = localData;
                
                // Atualizar interface com dados do Supabase
                atualizarResumoVendas(data);
                filtrarVendas(data);
            }
        } catch (err) {
            console.error("Erro ao processar vendas do Supabase:", err);
        }
    }

    // Filtrar vendas pelo mês selecionado
    function filtrarVendas(vendas = null) {
        // Se não receber vendas como parâmetro, usar dados atuais
        const dadosParaFiltrar = vendas || (salesData.length > 0 ? 
            // Converter formato do localStorage para o formato do Supabase
            salesData.map(sale => ({
                modelo: sale.model,
                valor: sale.value,
                data_venda: new Date(sale.date).toISOString().split('T')[0]
            })) : []);
        
        if (dadosParaFiltrar.length === 0) {
            salesContent.innerHTML = "<p>Sem vendas registradas.</p>";
            totalVendasDetalhadas.textContent = formatarMoeda(0);
            return;
        }
        
        const mesSelecionado = monthFilterSelect.value;
        let vendasFiltradas = dadosParaFiltrar;
        
        if (mesSelecionado !== "todos") {
            vendasFiltradas = dadosParaFiltrar.filter(venda => {
                const dataVenda = new Date(venda.data_venda);
                return dataVenda.getMonth() === parseInt(mesSelecionado);
            });
        }
        
        // Calcular total das vendas filtradas
        const totalVendasFiltradas = vendasFiltradas.reduce((sum, venda) => sum + venda.valor, 0);
        totalVendasDetalhadas.textContent = formatarMoeda(totalVendasFiltradas);
        
        // Atualizar detalhes das vendas
        atualizarDetalhesVendas(vendasFiltradas);
    }

    // Atualiza o resumo de vendas
    function atualizarResumoVendas(vendas) {
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();

        // Filtra vendas do mês atual
        const vendasMes = vendas.filter(venda => {
            const dataVenda = new Date(venda.data_venda);
            return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
        });

        // Soma valores das vendas do mês atual
        const totalVendasMes = vendasMes.reduce((sum, venda) => sum + venda.valor, 0);
        resumoMesElem.textContent = formatarMoeda(totalVendasMes);

        // Soma valores de todas as vendas acumuladas no ano atual
        const vendasAno = vendas.filter(venda => {
            const dataVenda = new Date(venda.data_venda);
            return dataVenda.getFullYear() === anoAtual;
        });
        const totalVendasAno = vendasAno.reduce((sum, venda) => sum + venda.valor, 0);
        resumoAnoElem.textContent = formatarMoeda(totalVendasAno);
    }

    // Atualiza os detalhes das vendas na tabela
    function atualizarDetalhesVendas(vendas) {
        salesContent.innerHTML = "";

        if (vendas.length === 0) {
            salesContent.innerHTML = "<p>Nenhuma venda encontrada para o período selecionado.</p>";
            return;
        }

        // Ordenar vendas por data (mais recentes primeiro)
        vendas.sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda));

        // Criar um elemento para conter todas as vendas
        const fragment = document.createDocumentFragment();
        
        vendas.forEach(venda => {
            const saleRow = document.createElement("div");
            saleRow.classList.add("sale-row");
            
            // Verificar se os campos necessários existem
            const modelo = venda.modelo || "Modelo não especificado";
            const valor = venda.valor || 0;
            const data = venda.data_venda ? formatarData(venda.data_venda) : "Data não especificada";
            
            saleRow.innerHTML = `
                <p><strong>Modelo:</strong> ${modelo}</p>
                <p><strong>Valor:</strong> ${formatarMoeda(valor)}</p>
                <p><strong>Data:</strong> ${data}</p>
            `;
            fragment.appendChild(saleRow);
        });
        
        // Adicionar todas as vendas de uma vez
        salesContent.appendChild(fragment);
    }
    
    // Função para formatar valores em reais
    function formatarMoeda(valor) {
        if (valor === undefined || valor === null) {
            return 'R$ 0,00';
        }
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    // Função para formatar data
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
        
        try {
            const data = new Date(dataString);
            if (isNaN(data.getTime())) {
                return dataString;
            }
            return data.toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }
});