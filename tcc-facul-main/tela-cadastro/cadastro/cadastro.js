import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";


const supabase = createClient(supabaseUrl, supabaseKey)

 document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    const cadastrarBtn = document.getElementById("cadastrar");
    const popupSucesso = document.getElementById("popupSucesso");
    const btnFecharPopup = document.getElementById("btnFecharPopup");

    // Garante que o popup fique escondido ao carregar a página
    popupSucesso.style.display = "none";
    const elemento = document.querySelector(".algum-elemento");

if (elemento) {
    elemento.style.display = "block"; // Só executa se o elemento existir
} else {
    console.error("❌ Elemento não encontrado no DOM!");
}


    // Exibe o popup de sucesso ao cadastrar um veículo
    function mostrarPopupSucesso() {
        console.log("Tentando exibir o popup de sucesso...");
        if (popupSucesso) {
            popupSucesso.style.display = "flex"; // Mostra o popup somente quando chamado
            console.log("Popup de sucesso exibido!");
            // Esconde o popup após 3 segundos
            setTimeout(() => {
                popupSucesso.style.display = "none";
            }, 3000);
        } else {
            console.error("Elemento popupSucesso não encontrado!");
        }
    }

    // Evento para fechar o popup ao clicar no botão "Fechar"
    btnFecharPopup.addEventListener("click", function () {
        console.log("Fechando popup...");
        popupSucesso.style.display = "none";
    });

    // Atualiza visualização no cadastro em tempo real
    function atualizarVisualizacao() {
        document.getElementById("prevFabricante").querySelector("span").textContent =
            document.getElementById("fabricante").value || "";
        document.getElementById("prevModelo").querySelector("span").textContent =
            document.getElementById("modelo").value || "";
        document.getElementById("prevAno").querySelector("span").textContent =
            document.getElementById("ano").value || "";
        document.getElementById("prevDono").querySelector("span").textContent =
            document.getElementById("quantidadeDono").value || "";
        document.getElementById("prevKM").querySelector("span").textContent =
            document.getElementById("km").value || "";
        const preco = document.getElementById("preco").value || "";
        // Formatado para reais utilizando toLocaleString
        document.getElementById("prevValor").querySelector("span").textContent =
            preco ? parseFloat(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
        document.getElementById("prevDescricao").querySelector("span").textContent =
            document.getElementById("descricao").value || "";

        // Atualiza a visualização do carrossel de imagens
        const imagemInput = document.getElementById("imagemCarro").files;
        const previewImg = document.getElementById("carouselContainer").querySelector(".carousel");
        previewImg.innerHTML = ""; // Limpa o conteúdo anterior

        if (imagemInput.length > 0) {
            Array.from(imagemInput).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.style.height = "200px"; 
                    img.style.borderRadius = "8px";
                    img.style.marginRight = "10px";
                    previewImg.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            previewImg.innerHTML = "<img src='img/fallback.png' style='width: 100%; border-radius: 8px;'>";
        }
    }    

    // Adiciona eventos para atualização em tempo real
    ["fabricante", "modelo", "ano", "quantidadeDono", "km", "preco", "descricao"].forEach((id) => {
        document.getElementById(id).addEventListener("input", atualizarVisualizacao);
    });
    document.getElementById("imagemCarro").addEventListener("change", atualizarVisualizacao);

     // Salva veículos no localStorage (sem limite de número)
   async function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
    console.log("Salvando carro no Supabase...")

    const { data, error } = await supabase.from('carro').insert([
        {
            fabricante,
            modelo,
            ano: parseInt(ano),
            quantidade_dono: parseInt(quantidadeDono),
            km: parseInt(km),
            preco: parseFloat(preco),
            descricao,
            imagens
        }
    ]);

    if (error) {
        console.error("Erro ao salvar carro:", error.message);
        return;
    }

    console.log("Carro salvo no Supabase:", data);
    carregarEstoque(); 
    mostrarPopupSucesso();
}

// Função auxiliar para converter strings de preço para número
// Esta função remove o "R$", os espaços, os pontos de milhar e substitui a vírgula pelo ponto decimal.
function convertPrice(priceStr) {
  if (!priceStr) return 0;
  // Remove o símbolo R$, espaços. Em seguida, remove os pontos e troca a vírgula por ponto.
  let cleaned = priceStr.toString()
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
}

async function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
    console.log("Salvando carro no Supabase...");

    // Aqui usamos o valor de preco já convertido (number)
    const { data, error } = await supabase.from('carro').insert([
        {
            fabricante,
            modelo,
            ano: parseInt(ano),
            quantidade_dono: parseInt(quantidadeDono),
            km: parseInt(km),
            preco: preco,  // já é um número correto
            descricao,
            imagens
        }
    ]);

    if (error) {
        console.error("Erro ao salvar carro:", error.message);
        return;
    }

    console.log("Carro salvo no Supabase:", data);
    carregarEstoque(); 
    mostrarPopupSucesso();
}

// Função que carrega e exibe os veículos salvos no Supabase
async function carregarEstoque() {
    if (!stockSection) {
        console.error("Elemento stock-section não encontrado!");
        return;
    }

    console.log("Carregando estoque do Supabase...");
    const { data: carrosSalvos, error } = await supabase.from('carro').select('*');

    if (error) {
        console.error("Erro ao carregar estoque:", error.message);
        return;
    }

    // Exibe mensagem se não houver carros
    stockSection.innerHTML = carrosSalvos.length === 0 
        ? "<p>Nenhum carro no estoque.</p>" 
        : "";

   carrosSalvos.forEach((carro) => {
  const stockCard = document.createElement("div");
  stockCard.classList.add("stock-card");

  // Insere os dados do carro como atributos de dados
  stockCard.setAttribute("data-fabricante", carro.fabricante || "");
  stockCard.setAttribute("data-modelo", carro.modelo || "");
  stockCard.setAttribute("data-ano", carro.ano || "");
  stockCard.setAttribute("data-preco", carro.preco || "");
  stockCard.setAttribute("data-km", carro.km || "");

  // Estrutura do card, incluindo botão de financiamento
  stockCard.innerHTML = `
    <div class="car-image">
      <img src="${(carro.imagens && carro.imagens.length > 0) ? carro.imagens[0] : 'img/fallback.png'}" alt="${carro.modelo}" style="width: 100%; border-radius: 8px;">
    </div>
    <h3>${carro.fabricante} ${carro.modelo}</h3>
    <p><strong>Ano:</strong> ${carro.ano}</p>
    <p><strong>KM:</strong> ${carro.km}</p>
    <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
    <p class="descricao"><strong>Descrição:</strong> ${carro.descricao}</p>
    <button class="whatsapp-btn">Contato WhatsApp</button>
    <button class="financiamento-btn">Simular Financiamento</button>
  `;
  stockSection.appendChild(stockCard);

  // Configuração do botão de simulação de financiamento
  const financiamentoBtn = stockCard.querySelector(".financiamento-btn");
  financiamentoBtn.addEventListener("click", function () {
    // Lê os dados diretamente a partir dos atributos do card
    const card = this.parentElement;
    const fabricante = card.getAttribute("data-fabricante") || "Não informado";
    const modelo = card.getAttribute("data-modelo") || "Não informado";
    const ano = card.getAttribute("data-ano") || "0";
    const preco = card.getAttribute("data-preco") || "0";
    const km = card.getAttribute("data-km") || "0";

    // Cria a query string garantindo que todos os valores são strings
    const params = new URLSearchParams({
      fabricante: fabricante,
      modelo: modelo,
      ano: ano,
      preco: preco,
      km: km
    });

    console.log("Parâmetros gerados:", params.toString());
    alert("Redirecionando com:\n" + params.toString());

    // Ajuste o caminho conforme a estrutura do seu projeto.
    window.location.href = "../financiamento/financiamento.html?" + params.toString();
  });

  // Configuração do botão de WhatsApp (se necessário)
  const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
  whatsappBtn.addEventListener("click", function () {
      const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} KM.`;
      const numeroWhatsapp = "5511999999999"; // Ajuste para o número correto
      const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsapp, "_blank");
  });

});

}

// Evento de cadastro de veículos
cadastrarBtn.addEventListener("click", function () {
    console.log("Botão cadastrar clicado!");

    const fabricante = document.getElementById("fabricante").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const quantidadeDono = document.getElementById("quantidadeDono").value.trim();
    const km = document.getElementById("km").value.trim();

    // Pega o valor do preço e converte corretamente usando a função convertPrice
    const precoInput = document.getElementById("preco").value.trim();
    const preco = convertPrice(precoInput);

    const descricao = document.getElementById("descricao").value.trim();
    const imagemInput = document.getElementById("imagemCarro").files;

    // Validação: verifica se todos os campos foram preenchidos (preço 0 é considerado inválido)
    if (!fabricante || !modelo || !ano || !quantidadeDono || !km || preco === 0 || !descricao) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    let imagens = [];
    if (imagemInput.length > 0) {
        let imagensProcessadas = 0;
        Array.from(imagemInput).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = function () {
                imagens.push(reader.result);
                imagensProcessadas++;
                if (imagensProcessadas === imagemInput.length) {
                    salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        imagens.push("img/fallback.png");
        salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens);
    }
});

// Inicializa a exibição dos veículos ao carregar a página
carregarEstoque();
});
