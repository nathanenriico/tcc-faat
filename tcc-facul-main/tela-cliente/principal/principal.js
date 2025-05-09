import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔎 Supabase conectado:", supabase);

// 🚗 **Carregar Categorias do Supabase**
async function carregarCategorias() {
    console.log("🚀 Buscando categorias no Supabase...");
    
    const { data: carrosDisponiveis, error } = await supabase.from('carro').select('modelo, imagens');

    if (error) {
        console.error("❌ Erro ao carregar categorias:", error.message);
        return;
    }

    console.log("✅ Categorias recebidas:", carrosDisponiveis);
    const categoriesContainer = document.querySelector(".categories-container");

    if (!categoriesContainer) {
        console.error("❌ Elemento categories-container não encontrado!");
        return;
    }

    categoriesContainer.innerHTML = ""; 

    if (carrosDisponiveis.length === 0) {
        categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
        return;
    }

    const modelosUnicos = [...new Set(carrosDisponiveis.map(carro => carro.modelo))];

    modelosUnicos.forEach(modelo => {
        const categoria = document.createElement("div");
        categoria.classList.add("category");

        const carro = carrosDisponiveis.find(carro => carro.modelo === modelo);
        const imagemCategoria = (carro.imagens && carro.imagens.length > 0) 
            ? carro.imagens[0] 
            : "default-category.png";

        categoria.innerHTML = `
            <img src="${imagemCategoria}" alt="${modelo}" style="width: 100%; height: 120px; object-fit: cover;">
            <span>${modelo}</span>
        `;

        categoria.addEventListener("click", function () {
            filtrarCarrosPorModelo(modelo);
        });

        categoriesContainer.appendChild(categoria);
    });
}

// 🚗 **Carregar Carros do Supabase**
async function carregarCarrosTelaCliente() {
    console.log("🚀 Buscando carros no Supabase...");
    
    const { data: carrosDisponiveis, error } = await supabase.from('carro').select('*');

    if (error) {
        console.error("❌ Erro ao carregar carros:", error.message);
        return;
    }

    console.log("✅ Carros carregados:", carrosDisponiveis);
    const carrosContainer = document.querySelector(".carros-container");

    if (!carrosContainer) {
        console.error("❌ Elemento carros-container não encontrado!");
        return;
    }

    carrosContainer.innerHTML = ""; 

    if (carrosDisponiveis.length === 0) {
        carrosContainer.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
        return;
    }

    carrosDisponiveis.forEach(carro => {
        const stockCard = document.createElement("div");
        stockCard.classList.add("car-card");

        let imagensArray = (carro.imagens && typeof carro.imagens === "string") 
            ? [carro.imagens.replace(/^\[|\]$/g, "").replace(/^["]+|["]+$/g, '')] 
            : ["img/fallback.png"];
        console.log("🔎 Caminho da imagem do carro:", imagensArray[0]);

        let carouselHTML = imagensArray.length > 1 ? `
            <div class="carousel-container" data-index="0">
                <button class="carousel-prev">&#9664;</button>
                <img class="carousel-image" src="${imagensArray[0]}" alt="${carro.modelo}">
                <button class="carousel-next">&#9654;</button>
            </div>
        ` : `
            <div class="car-image">
                <img src="${imagensArray[0]}" alt="${carro.modelo}">
            </div>
        `;

        stockCard.innerHTML = `
            ${carouselHTML}
            <h3>${carro.fabricante} ${carro.modelo}</h3>
            <p><strong>Ano:</strong> ${carro.ano}</p>
            <p><strong>KM:</strong> ${carro.km}</p>
            <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
            <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
            <p><strong>Descrição:</strong> ${carro.descricao}</p>
            <div class="button-container">
                <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
                <button class="financiamento-btn">Simular Financiamento</button>
            </div>
        `;

        carrosContainer.appendChild(stockCard);

        // Evento para o botão de WhatsApp
        const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
        if (whatsappBtn) {
            whatsappBtn.addEventListener("click", function () {
                const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
                const numeroWhatsapp = "5511999999999"; // Substitua pelo número correto
                const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsapp, "_blank");
            });
        }

        // Evento para o botão de Simular Financiamento
        const financiamentoBtn = stockCard.querySelector(".financiamento-btn");
        if (financiamentoBtn) {
            financiamentoBtn.addEventListener("click", function () {
                window.location.href = 'financiamento/financiamento.html';
            });
        }
    });
}

// 🔥 **Inicializa tudo após o carregamento**
document.addEventListener("DOMContentLoaded", async function () {
    await carregarCategorias();
    await carregarCarrosTelaCliente();
});
