import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
  // Armazenamento para as vendas
  let carSales = [];
  
  // Elementos DOM
  const openSaleFormBtn = document.getElementById('openSaleFormBtn');
  const openDeleteFormBtn = document.getElementById('openDeleteFormBtn');
  const saleModal = document.getElementById('saleModal');
  const deleteModal = document.getElementById('deleteModal');
  const confirmDeleteModal = document.getElementById('confirmDeleteModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteText = document.getElementById('confirmDeleteText');
  const closeBtns = document.querySelectorAll('.close-modal');
  const carSaleForm = document.getElementById('carSaleForm');
  const deleteCarSaleForm = document.getElementById('deleteCarSaleForm');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');
  const deleteSuccessMessage = document.getElementById('deleteSuccessMessage');
  const deleteErrorMessage = document.getElementById('deleteErrorMessage');
  
  // Variável para armazenar o ID da venda a ser excluída
  let saleToDeleteId = null;

  // Carregar dados do localStorage
  loadFromLocalStorage();
  
  // Tentar carregar dados do Supabase
  carregarVendas();
  
  // Inicialização
  updateDashboard();

  // Abrir modal de venda
  openSaleFormBtn.onclick = function() {
    saleModal.style.display = "block";
  }

  // Abrir modal de exclusão
  openDeleteFormBtn.onclick = function() {
    populateDeleteSelect();
    deleteModal.style.display = "block";
  }

  // Fechar modais com X
  closeBtns.forEach(function(btn) {
    btn.onclick = function() {
      saleModal.style.display = "none";
      deleteModal.style.display = "none";
    }
  });

  // Fechar modais clicando fora
  window.onclick = function(event) {
    if (event.target == saleModal) {
      saleModal.style.display = "none";
    }
    if (event.target == deleteModal) {
      deleteModal.style.display = "none";
    }
    if (event.target == confirmDeleteModal) {
      confirmDeleteModal.style.display = "none";
    }
  }
  
  // Botão para cancelar exclusão
  cancelDeleteBtn.onclick = function() {
    confirmDeleteModal.style.display = "none";
  }

  // Carregar vendas do Supabase
  async function carregarVendas() {
    try {
      // Tentar fazer login primeiro
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Depois de login, tentar carregar dados
      const { data, error } = await supabase
        .from('vendas')
        .select('*');
      
      if (error) {
        console.log("Erro ao carregar vendas:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Mapear dados do Supabase para o formato da UI
        carSales = data.map(item => ({
          id: item.id,
          model: item.modelo,
          value: item.valor,
          date: item.data_venda
        }));
        
        // Salvar no localStorage como backup
        saveToLocalStorage();
        
        // Atualizar interface
        updateDashboard();
      }
    } catch (err) {
      console.log("Erro ao carregar do Supabase:", err);
    }
  }

  // Registrar venda
  carSaleForm.onsubmit = function(e) {
    e.preventDefault();
    
    const carModel = document.getElementById('carModel').value;
    const saleValue = parseFloat(document.getElementById('saleValue').value);
    const saleDate = document.getElementById('saleDate').value;
    
    if (!carModel || isNaN(saleValue) || !saleDate) {
      errorMessage.style.display = "block";
      return;
    }
    
    // Criar nova venda com ID local
    const newSale = {
      id: Date.now(),
      model: carModel,
      value: saleValue,
      date: saleDate
    };
    
    // Adicionar à lista local
    carSales.push(newSale);
    
    // Salvar no localStorage
    saveToLocalStorage();
    
    // Atualizar interface
    updateDashboard();
    
    // Tentar salvar no Supabase em segundo plano
    salvarNoSupabase({
      modelo: carModel,
      valor: saleValue,
      data_venda: saleDate
    });
    
    successMessage.style.display = "block";
    carSaleForm.reset();
    
    setTimeout(function() {
      saleModal.style.display = "none";
      successMessage.style.display = "none";
    }, 2000);
  }

  // Mostrar confirmação de exclusão
  deleteCarSaleForm.onsubmit = function(e) {
    e.preventDefault();
    
    const selectedId = document.getElementById('carModelDelete').value;
    
    if (!selectedId) {
      deleteErrorMessage.style.display = "block";
      return;
    }
    
    // Encontrar o modelo selecionado para mostrar na confirmação
    const selectedSale = carSales.find(sale => sale.id == selectedId);
    if (selectedSale) {
      // Armazenar o ID para uso posterior
      saleToDeleteId = selectedId;
      
      // Atualizar o texto de confirmação com o modelo específico
      confirmDeleteText.textContent = `Deseja realmente excluir este modelo: ${selectedSale.model}?`;
      
      // Esconder o modal de exclusão e mostrar o de confirmação
      deleteModal.style.display = "none";
      confirmDeleteModal.style.display = "block";
    }
  }
  
  // Confirmar exclusão
  confirmDeleteBtn.onclick = async function() {
    if (!saleToDeleteId) return;
    
    try {
      console.log("Confirmação de exclusão para ID:", saleToDeleteId);
      
      // Mostrar que estamos processando
      confirmDeleteBtn.textContent = "Processando...";
      confirmDeleteBtn.disabled = true;
      
      // Tentar excluir do Supabase primeiro
      await excluirDoSupabase(saleToDeleteId);
      
      // Se chegou aqui, a exclusão no banco foi bem-sucedida
      console.log("Exclusão no banco bem-sucedida, atualizando interface");
      
      // Remover da lista local
      carSales = carSales.filter(sale => sale.id != saleToDeleteId);
      
      // Salvar no localStorage
      saveToLocalStorage();
      
      // Atualizar interface
      updateDashboard();
      
      // Mostrar mensagem de sucesso
      confirmDeleteModal.style.display = "none";
      deleteSuccessMessage.style.display = "block";
      
      setTimeout(function() {
        deleteSuccessMessage.style.display = "none";
      }, 2000);
      
      // Limpar o ID armazenado
      saleToDeleteId = null;
    } catch (err) {
      console.error("Erro ao excluir venda:", err);
      confirmDeleteModal.style.display = "none";
      deleteErrorMessage.style.display = "block";
      
      setTimeout(function() {
        deleteErrorMessage.style.display = "none";
      }, 2000);
    } finally {
      // Restaurar o botão
      confirmDeleteBtn.textContent = "Confirmar";
      confirmDeleteBtn.disabled = false;
    }
  }

  // Salvar no Supabase
  async function salvarNoSupabase(venda) {
    try {
      // Tentar fazer login primeiro
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Depois de login, tentar salvar
      await supabase.from('vendas').insert([venda]);
    } catch (err) {
      console.log("Erro ao salvar no Supabase:", err);
    }
  }

  // Excluir do Supabase
  async function excluirDoSupabase(id) {
    try {
      console.log("Iniciando exclusão no Supabase para ID:", id);
      
      // Tentar fazer login primeiro
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (loginError) {
        console.error("Erro ao fazer login:", loginError);
        throw new Error("Falha na autenticação");
      }
      
      console.log("Login bem-sucedido, tentando excluir...");
      
      // Depois de login, tentar excluir
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Erro ao excluir do Supabase:", error);
        throw new Error("Falha ao excluir registro");
      }
      
      console.log("Registro excluído com sucesso do Supabase!");
      return true;
    } catch (err) {
      console.error("Erro ao excluir do Supabase:", err);
      throw err; // Propagar o erro para ser tratado pelo chamador
    }
  }

  // Salvar no localStorage
  function saveToLocalStorage() {
    localStorage.setItem('carSales', JSON.stringify(carSales));
  }

  // Carregar do localStorage
  function loadFromLocalStorage() {
    const savedSales = localStorage.getItem('carSales');
    if (savedSales) {
      carSales = JSON.parse(savedSales);
    }
  }

  // Preencher select de exclusão
  function populateDeleteSelect() {
    const select = document.getElementById('carModelDelete');
    select.innerHTML = '<option value="">-- Selecione um modelo --</option>';
    
    carSales.forEach(sale => {
      const option = document.createElement('option');
      option.value = sale.id;
      option.textContent = `${sale.model} - R$ ${sale.value.toFixed(2)} (${formatDate(sale.date)})`;
      select.appendChild(option);
    });
  }

  // Formatar data
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Atualizar dashboard
  function updateDashboard() {
    // Métricas
    const totalRevenue = carSales.reduce((total, sale) => total + sale.value, 0);
    document.querySelector('.metric-card:nth-child(1) p').textContent = `R$ ${totalRevenue.toFixed(2)}`;
    document.querySelector('.metric-card:nth-child(2) p').textContent = `R$ ${(totalRevenue * 0.3).toFixed(2)}`;
    document.querySelector('.metric-card:nth-child(1) span').textContent = carSales.length > 1 ? '+15%' : '+0%';
    
    // Tabela
    updateSalesTable();
    
    // Gráfico
    updateCharts();
  }

  // Atualizar tabela
  function updateSalesTable() {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = '';
    
    const sortedSales = [...carSales].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSales.forEach(sale => {
      const row = document.createElement('tr');
      
      const modelCell = document.createElement('td');
      modelCell.textContent = sale.model;
      
      const valueCell = document.createElement('td');
      valueCell.textContent = `R$ ${sale.value.toFixed(2)}`;
      
      const dateCell = document.createElement('td');
      dateCell.textContent = formatDate(sale.date);
      
      row.appendChild(modelCell);
      row.appendChild(valueCell);
      row.appendChild(dateCell);
      
      tableBody.appendChild(row);
    });
  }

  // Atualizar gráficos
  function updateCharts() {
    const salesByMonth = {};
    
    carSales.forEach(sale => {
      const date = new Date(sale.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = 0;
      }
      
      salesByMonth[monthYear] += sale.value;
    });
    
    const sortedMonths = Object.keys(salesByMonth).sort((a, b) => {
      const [monthA, yearA] = a.split('/').map(Number);
      const [monthB, yearB] = b.split('/').map(Number);
      
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    
    const labels = sortedMonths;
    const data = sortedMonths.map(month => salesByMonth[month]);
    
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (window.salesChart instanceof Chart) {
      window.salesChart.destroy();
    }
    
    window.salesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Faturamento Mensal (R$)',
            data: data,
            backgroundColor: 'rgba(0, 68, 102, 0.7)',
            borderColor: 'rgba(0, 68, 102, 1)',
            borderWidth: 1
          },
          {
            label: 'Tendência',
            data: data,
            type: 'line',
            fill: false,
            borderColor: '#d9534f',
            tension: 0.1,
            pointBackgroundColor: '#d9534f'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + value;
              }
            }
          }
        }
      }
    });
  }
});