import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔎 O script estoque.js foi carregado!");

// FUNÇÃO PARA VOLTAR À PÁGINA
window.voltarPagina = function () {
  console.log("🔙 Redirecionando para a página inicial...");
  window.location.href = "../tela-cadastro/cadastro/cadastro.html";
};

// FUNÇÃO AUXILIAR: Interpreta o campo de imagens
function extrairImagens(campoImagens) {
  let imagensArray = [];
  if (campoImagens) {
    if (campoImagens.trim().startsWith("[")) {
      try {
        imagensArray = JSON.parse(campoImagens);
        if (!Array.isArray(imagensArray)) {
          imagensArray = [imagensArray];
        }
      } catch (e) {
        imagensArray = [campoImagens];
      }
    } else {
      imagensArray = [campoImagens];
    }
  }
  if (!imagensArray || imagensArray.length === 0 || imagensArray[0].trim() === "") {
    imagensArray = ["/tcc-facul-main/controle-estoque/img/fallback.png"];
  }
  return imagensArray;
}


// FUNÇÃO: Carregar Estoque do Supabase e montar os cards com slider
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

    // Utiliza a função auxiliar para extrair imagens
    const imagensArray = extrairImagens(carro.imagens);

    // Monta o HTML do card (slider + informações)
    stockCard.innerHTML = `
      <div class="slider" data-images='${JSON.stringify(imagensArray)}' data-index="0">
          <button class="slider-prev">◀</button>
          <img class="slider-image" src="${imagensArray[0]}" alt="${carro.modelo}">
          <button class="slider-next">▶</button>
      </div>
      <h3>${carro.fabricante} ${carro.modelo}</h3>
      <p><strong>Ano:</strong> ${carro.ano}</p>
      <p><strong>KM:</strong> ${carro.km}</p>
      <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
      <p><strong>Dono(s):</strong> ${carro.quantidade_dono}</p>
      <p><strong>Descrição:</strong> ${carro.descricao}</p>
      <button class="delete-btn" data-id="${carro.id}">🗑️ Excluir</button>
    `;
    stockSection.appendChild(stockCard);

    // IMPLEMENTAÇÃO DO SLIDER
    const slider = stockCard.querySelector(".slider");
    if (slider) {
      const prevBtn = slider.querySelector(".slider-prev");
      const nextBtn = slider.querySelector(".slider-next");
      const sliderImage = slider.querySelector(".slider-image");

      let images;
      try {
        images = JSON.parse(slider.getAttribute("data-images"));
        if (!Array.isArray(images)) {
          images = [images];
        }
      } catch (e) {
        images = [sliderImage.src];
      }
      let currentIndex = Number(slider.getAttribute("data-index")) || 0;
      const updateImage = () => {
        slider.setAttribute("data-index", currentIndex);
        sliderImage.src = images[currentIndex];
      };
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
        updateImage();
      });
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
        updateImage();
      });
    }
  });
}

// NOVO: FUNÇÃO Carregar Categorias (sem alterar o BD)
async function carregarCategorias() {
    console.log("🚀 Buscando categorias no Supabase...");

    const { data: carrosDisponiveis, error } = await supabase
        .from('carro')
        .select('modelo, imagens');

    if (error) {
        console.error("❌ Erro ao carregar categorias:", error.message);
        return;
    }

    console.log("✅ Categorias recebidas:", carrosDisponiveis);
    const categoriesContainer = document.querySelector(".categories-container");

    if (!categoriesContainer) {
        console.error("❌ Elemento .categories-container não encontrado! Certifique-se de que o HTML contém a seção de categorias.");
        return;
    }

    categoriesContainer.innerHTML = ""; 

    if (carrosDisponiveis.length === 0) {
        categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
        return;
    }

    // Extrair modelos únicos
    const modelosUnicos = [...new Set(carrosDisponiveis.map(carro => carro.modelo))];

    modelosUnicos.forEach(modelo => {
        const categoria = document.createElement("div");
        categoria.classList.add("category");

        // Encontra o primeiro carro relacionado a esse modelo
        const carro = carrosDisponiveis.find(carro => carro.modelo === modelo);

        // Usa a função auxiliar para extrair as imagens
        const imagensArray = extrairImagens(carro.imagens);
        const imagemCategoria = (imagensArray.length > 0 && imagensArray[0].trim() !== "") 
            ? imagensArray[0] 
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


async function filtrarPorModelo(modelo) {
  const { data: carrosSalvos, error } = await supabase.from('carro').select('*');
  if (error) {
    console.error("Erro ao filtrar por modelo:", error.message);
    return;
  }
  
  // Filtra os carros comparando de forma case-insensitive
  const carrosFiltrados = carrosSalvos.filter(carro =>
    carro.modelo.trim().toLowerCase() === modelo.trim().toLowerCase()
  );

  const stockSection = document.querySelector(".stock-list");
  stockSection.innerHTML = ""; // Limpa o container de estoque

  if (carrosFiltrados.length === 0) {
    stockSection.innerHTML = `<p>Nenhum carro disponível para o modelo "${modelo}".</p>`;
    return;
  }

  carrosFiltrados.forEach((carro) => {
    const stockCard = document.createElement("div");
    stockCard.classList.add("stock-card");

    const imagensArray = extrairImagens(carro.imagens);
    stockCard.innerHTML = `
      <div class="slider" data-images='${JSON.stringify(imagensArray)}' data-index="0">
          <button class="slider-prev">◀</button>
          <img class="slider-image" src="${imagensArray[0]}" alt="${carro.modelo}">
          <button class="slider-next">▶</button>
      </div>
      <h3>${carro.fabricante} ${carro.modelo}</h3>
      <p><strong>Ano:</strong> ${carro.ano}</p>
      <p><strong>KM:</strong> ${carro.km}</p>
      <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
      <p><strong>Dono(s):</strong> ${ carro.quantidade_dono ?? carro.quantidadeDono ?? 0 }</p>
      <p><strong>Descrição:</strong> ${carro.descricao}</p>
      <button class="delete-btn" data-id="${carro.id}">🗑️ Excluir</button>
    `;
    stockSection.appendChild(stockCard);

    // Implementação do slider para os cards filtrados
    const slider = stockCard.querySelector(".slider");
    if (slider) {
      const prevBtn = slider.querySelector(".slider-prev");
      const nextBtn = slider.querySelector(".slider-next");
      const sliderImage = slider.querySelector(".slider-image");

      let images;
      try {
        images = JSON.parse(slider.getAttribute("data-images"));
        if (!Array.isArray(images)) {
          images = [images];
        }
      } catch (e) {
        images = [sliderImage.src];
      }
      let currentIndex = Number(slider.getAttribute("data-index")) || 0;
      const updateImage = () => {
        slider.setAttribute("data-index", currentIndex);
        sliderImage.src = images[currentIndex];
      };
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
        updateImage();
      });
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
        updateImage();
      });
    }
  });
}


// Delegação de eventos para exclusão (sem afetar o BD)
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
      carregarEstoque();
      carregarCategorias();
    }
  });
});

// Inicializa tudo após carregamento
document.addEventListener("DOMContentLoaded", async function () {
  await carregarEstoque();
  await carregarCategorias();
});

function voltarPagina() {
  window.location.href = "../tela-cadastro/cadastro/cadastro.html";
}