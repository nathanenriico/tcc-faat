import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

// Função auxiliar para converter strings de preço para número
function convertPrice(priceStr) {
  if (!priceStr) return 0;
  let cleaned = priceStr.toString().replace(/[^\d,\.]/g, "");
  cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("Query string recebida:", window.location.search);
  
  const params = new URLSearchParams(window.location.search);
  const carId = params.get("id");  // Pega o ID do carro da URL
  
  let precoReal, imagemCarro;
  
  if (carId) {
    // Consulta os dados atualizados do carro no Supabase usando o ID
    const { data: carData, error } = await supabase
      .from("carro")    // Nome da tabela onde os veículos são cadastrados
      .select("preco, imagens")
      .eq("id", carId)
      .single();
    
    if (error) {
      console.error("Erro ao buscar dados do carro:", error.message);
      // Fallback: usa o preço e imagem passados na URL
      precoReal = convertPrice(params.get("preco"));
      imagemCarro = params.get("imagem") || "img/fallback.png";
    } else {
      console.log("Dados do carro consultado:", carData);
      precoReal = typeof carData.preco === "number" ? carData.preco : convertPrice(carData.preco);
      imagemCarro = (carData.imagens && carData.imagens.length > 0) ? carData.imagens[0] : "img/fallback.png";
    }
  } else {
    // Se não houver ID, usa os parâmetros da URL
    let precoParam = params.get("preco");
    if (!precoParam || isNaN(parseFloat(precoParam))) {
      const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
      if (carrosSalvos.length > 0) {
        precoParam = carrosSalvos[carrosSalvos.length - 1].preco;
        imagemCarro = carrosSalvos[carrosSalvos.length - 1].imagens[0];
      } else {
        precoParam = "0";
        imagemCarro = "img/fallback.png";
      }
    }
    precoReal = convertPrice(precoParam);
    imagemCarro = imagemCarro || "img/fallback.png";
  }
  
  console.log("Preço recuperado:", precoReal);
  console.log("Imagem do carro recuperada:", imagemCarro);
  
  // Atualiza os componentes da interface de financiamento
  const valorTotalInput = document.getElementById("valorTotal");
  if (valorTotalInput) {
    valorTotalInput.value = precoReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  
  const entradaInput = document.getElementById("entrada");
  const valorFinanciadoInput = document.getElementById("valorFinanciado");
  let entradaInicial = precoReal * 0.1;
  if (entradaInput) {
    entradaInput.value = entradaInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  
  if (entradaInput && valorFinanciadoInput) {
    entradaInput.addEventListener("input", function () {
      let entradaStr = entradaInput.value.replace(/[R$\s.]/g, "").replace(",", ".");
      let entradaValor = parseFloat(entradaStr);
  
      if (!isNaN(entradaValor) && entradaValor >= 0 && entradaValor <= precoReal) {
        let novoFinanciado = precoReal - entradaValor;
        valorFinanciadoInput.value = novoFinanciado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      } else {
        valorFinanciadoInput.value = precoReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      }
    });
  }
  
  const carImageEl = document.getElementById("carImage");
  if (carImageEl) {
    carImageEl.src = imagemCarro;
  }
  
  // Opcional: Se desejar, também pode salvar ou registrar dados do financiamento no Supabase
});
