import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔎 O script estoque.js foi carregado!");

// 🚗 **Função para voltar à página anterior**
window.voltarPagina = function () {
    console.log("🔙 Voltando para a página anterior...");
    window.history.back(); // Volta para a página anterior
};

// 🚗 **Carregar estoque do Supabase**
async function carregarEstoque() {
    console.log("🚀 Buscando estoque no Supabase...");
    const stockSection = document.querySelector(".stock-list");

    if (!stockSection) {
        console.error("❌ Elemento .stock-list não encontrado!");
        return;
    }

    const { data: carrosSalvos, error } = await supabase.from('carro').select('*');

    if (error) {
        console.error("❌ Erro ao carregar estoque:", error.message);
        return;
    }

    console.log("✅ Dados recebidos do Supabase:", carrosSalvos);
    stockSection.innerHTML = carrosSalvos.length === 0 ? "<p>Nenhum carro no estoque.</p>" : "";

    carrosSalvos.forEach((carro) => {
        console.log("🛠️ Processando carro:", carro.modelo);

        const stockCard = document.createElement("div");
        stockCard.classList.add("stock-card");

        // ✅ Correção da imagem
        let imagensArray = (carro.imagens && typeof carro.imagens === "string") 
            ? [carro.imagens.replace(/^\[|\]$/g, "").replace(/^["]+|["]+$/g, '')] 
            : ["/tcc-facul-main/controle-estoque/img/fallback.png"];

        console.log("🔎 Caminho da imagem do carro:", imagensArray[0]);

        stockCard.innerHTML = `
            <div class="slider" data-images='${JSON.stringify(imagensArray)}' data-index="0">
                <button class="slider-prev">◀</button>
                <img class="slider-image" src="${imagensArray[0]}" alt="${carro.modelo}">
                <button class="slider-next">▶</button>
            </div>
            <h3>${carro.fabricante} ${carro.modelo}</h3>
            <p><strong>Ano:</strong> ${carro.ano}</p>
            <p><strong>KM:</strong> ${carro.km}</p>
            <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
            <p><strong>Dono(s):</strong> ${carro.quantidade_dono}</p>
            <p><strong>Descrição:</strong> ${carro.descricao}</p>
            <button class="delete-btn" data-id="${carro.id}">🗑️ Excluir</button>
        `;
        stockSection.appendChild(stockCard);
    });
}

// 🚗 **Excluir veículo no Supabase**
document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    
    if (!stockSection) {
        console.error("❌ Elemento .stock-list não encontrado!");
        return;
    }

    stockSection.addEventListener("click", async function (event) {
        const target = event.target;

        if (target.classList.contains("delete-btn")) {
            const id = target.getAttribute("data-id");
            console.log("🗑️ Solicitando exclusão do carro ID:", id);

            const { error } = await supabase.from('carro').delete().eq('id', id);

            if (error) {
                console.error("❌ Erro ao excluir carro:", error.message);
                return;
            }

            console.log("✅ Carro excluído com sucesso!");
            carregarEstoque(); // Atualiza a tela após excluir
        }
    });
});

// 🔥 **Inicializa tudo após o carregamento**
document.addEventListener("DOMContentLoaded", async function () {
    await carregarEstoque();
});
