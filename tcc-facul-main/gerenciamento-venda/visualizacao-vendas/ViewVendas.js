document.addEventListener("DOMContentLoaded", function () {
    // Configuração do Supabase
    const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${supabaseKey}`
            }
        }
    });
    
    const resumoMesElem = document.getElementById("totalVendasMes");
    const resumoAnoElem = document.getElementById("totalVendasAnos");
    const salesContent = document.getElementById("salesContent");

    // Carregar dados do Supabase
    carregarVendas();

    async function carregarVendas() {
        try {
            const { data, error } = await supabase
                .from("Vendas")
                .select("*");

            if (error) {
                console.error("Erro ao carregar vendas:", error);
                salesContent.innerHTML = "<p>Erro ao carregar vendas.</p>";
                return;
            }

            console.log("Vendas carregadas:", data);
            
            if (!data || data.length === 0) {
                salesContent.innerHTML = "<p>Sem vendas registradas.</p>";
                resumoMesElem.textContent = formatarMoeda(0);
                resumoAnoElem.textContent = formatarMoeda(0);
                return;
            }
            
            // Processar os dados carregados
            atualizarResumoVendas(data);
            atualizarDetalhesVendas(data);
        } catch (err) {
            console.error("Erro ao processar vendas:", err);
            salesContent.innerHTML = "<p>Erro ao processar dados.</p>";
        }
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

        // Ordenar vendas por data (mais recentes primeiro)
        vendas.sort((a, b) => new Date(b.data_venda) - new Date(a.data_venda));

        vendas.forEach(venda => {
            const saleRow = document.createElement("div");
            saleRow.classList.add("sale-row");
            saleRow.innerHTML = `
                <p><strong>Modelo:</strong> ${venda.modelo}</p>
                <p><strong>Valor:</strong> ${formatarMoeda(venda.valor)}</p>
                <p><strong>Data:</strong> ${formatarData(venda.data_venda)}</p>
            `;
            salesContent.appendChild(saleRow);
        });
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
            return data.toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }
});