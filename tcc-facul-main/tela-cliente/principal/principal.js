import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔎 Supabase conectado:", supabase);

/*  
  Função auxiliar para extrair imagens.
  Ela tenta interpretar o conteúdo do campo `imagens` como JSON; 
  se não conseguir, assume que é uma única URL ou string.
*/
function extrairImagens(campoImagens) {
  let imagensArray = [];
  if (campoImagens) {
    try {
      imagensArray = JSON.parse(campoImagens);
      if (!Array.isArray(imagensArray)) {
        imagensArray = [imagensArray];
      }
    } catch (e) {
      // Se não for JSON, usa o próprio valor
      imagensArray = [campoImagens];
    }
  }
  if (!imagensArray || imagensArray.length === 0 || !imagensArray[0].trim()) {
    imagensArray = ["img/fallback.png"];
  }
  return imagensArray;
}

/* 
  Carrega as categorias consultando apenas os campos `modelo` e `imagens` 
  da tabela "carro". Cada categoria (modelo) é exibida somente uma vez.
*/
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
    console.error("❌ Elemento .categories-container não encontrado!");
    return;
  }

  categoriesContainer.innerHTML = ""; 

  if (carrosDisponiveis.length === 0) {
    categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
    return;
  }

  // Extrai os modelos únicos usando Set
  const modelosUnicos = [...new Set(carrosDisponiveis.map(carro => carro.modelo))];

  modelosUnicos.forEach(modelo => {
    const categoria = document.createElement("div");
    categoria.classList.add("category");

    // Encontra o primeiro carro com esse modelo e extrai a sua imagem
    const carro = carrosDisponiveis.find(carro => carro.modelo === modelo);
    const imagensArray = extrairImagens(carro.imagens);
    const imagemCategoria = imagensArray[0];
    
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

/* 
  Carrega todos os carros para a tela principal.
  Utiliza a função extrairImagens para tratar o campo de imagens e, 
  se houver mais de uma imagem, exibe um "carousel" simples.
*/
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
    console.error("❌ Elemento .carros-container não encontrado!");
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

    // Extrai o array de imagens
    const imagensArray = extrairImagens(carro.imagens);
    console.log("🔎 Caminho da imagem do carro:", imagensArray[0]);

    // Se houver mais de uma imagem, exibe como carousel, senão uma imagem simples.
    let carouselHTML = imagensArray.length > 1 ? `
  <div class="carousel-container" data-index="0">
      <img class="carousel-image" src="${imagensArray[0]}" alt="${carro.modelo}">
      <button class="carousel-prev">&#9664;</button>
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
  <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
  <p><strong>Dono(s):</strong> ${carro.quantidade_dono ?? carro.quantidadeDono ?? 0}</p>
  <p><strong>Descrição:</strong> ${carro.descricao}</p>
  <div class="button-container">
    <button class="whatsapp-btn" aria-label="Contato WhatsApp">
      <img src="./icons8-whatsapp-50.png" alt="WhatsApp Icon">
    </button>
    <a href="../financiamento/financiamento.html?fabricante=${encodeURIComponent(carro.fabricante)}&modelo=${encodeURIComponent(carro.modelo)}&ano=${encodeURIComponent(carro.ano)}&preco=${encodeURIComponent(carro.preco)}&km=${encodeURIComponent(carro.km)}" class="financiamento-btn">
      Simular Financiamento
    </a>
  </div>
`;
    carrosContainer.appendChild(stockCard);

    // Adicionar evento de clique na imagem para abrir o modal
    const carImage = stockCard.querySelector('.car-image img');
    if (carImage) {
      carImage.style.cursor = 'pointer';
      carImage.addEventListener('click', function() {
        openModal(this.src, [this.src], 0);
      });
    }

    // Evento para o botão de WhatsApp
    const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", function () {
        const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
        const numeroWhatsapp = "5511985162224"; // Substitua pelo número correto
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsapp, "_blank");
      });
    }

    // O link de financiamento agora usa href direto, não precisa de event listener

    // Se existir carousel, adiciona os eventos de navegação
    const carouselContainer = stockCard.querySelector(".carousel-container");
    if (carouselContainer) {
      const prevBtn = carouselContainer.querySelector(".carousel-prev");
      const nextBtn = carouselContainer.querySelector(".carousel-next");
      const carouselImage = carouselContainer.querySelector(".carousel-image");
      let currentIndex = Number(carouselContainer.getAttribute("data-index")) || 0;
      const updateImage = () => {
        carouselContainer.setAttribute("data-index", currentIndex);
        carouselImage.src = imagensArray[currentIndex];
      };
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === 0) ? imagensArray.length - 1 : currentIndex - 1;
        updateImage();
      });
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === imagensArray.length - 1) ? 0 : currentIndex + 1;
        updateImage();
      });
      
      // Adicione este código aqui para o clique na imagem do carrossel
      if (carouselImage) {
        carouselImage.style.cursor = 'pointer';
        carouselImage.addEventListener('click', function() {
          openModal(this.src, imagensArray, currentIndex);
        });
      }
    }
  });
}

/*
  Filtra os carros com base no modelo selecionado.
  Executa uma consulta usando .eq('modelo', modelo) e renderiza os cards filtrados.
*/
async function filtrarCarrosPorModelo(modelo) {
  console.log("Filtrando carros para o modelo:", modelo);
  const { data: carrosFiltrados, error } = await supabase
    .from('carro')
    .select('*')
    .eq('modelo', modelo);
    
  if (error) {
    console.error("❌ Erro ao filtrar carros:", error.message);
    return;
  }

  console.log("✅ Carros filtrados:", carrosFiltrados);
  const carrosContainer = document.querySelector(".carros-container");
  if (!carrosContainer) {
    console.error("❌ Elemento .carros-container não encontrado!");
    return;
  }

  carrosContainer.innerHTML = "";

  if (carrosFiltrados.length === 0) {
    carrosContainer.innerHTML = `<p>Nenhum carro disponível para o modelo "${modelo}" no momento.</p>`;
    return;
  }

  carrosFiltrados.forEach(carro => {
    const stockCard = document.createElement("div");
    stockCard.classList.add("car-card");

    const imagensArray = extrairImagens(carro.imagens);
    let carouselHTML = imagensArray.length > 1 ? `
  <div class="carousel-container" data-index="0">
      <img class="carousel-image" src="${imagensArray[0]}" alt="${carro.modelo}">
      <button class="carousel-prev">&#9664;</button>
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
      <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
      <p><strong>Dono(s):</strong> ${carro.quantidade_dono ?? carro.quantidadeDono ?? 0}</p>
      <p><strong>Descrição:</strong> ${carro.descricao}</p>
      <div class="button-container">
        <button class="whatsapp-btn" aria-label="Contato WhatsApp">
          <img src="./icons8-whatsapp-50.png" alt="WhatsApp Icon">
        </button>
        <a href="../financiamento/financiamento.html?fabricante=${encodeURIComponent(carro.fabricante)}&modelo=${encodeURIComponent(carro.modelo)}&ano=${encodeURIComponent(carro.ano)}&preco=${encodeURIComponent(carro.preco)}&km=${encodeURIComponent(carro.km)}" class="financiamento-btn">Simular Financiamento</a>
      </div>
    `;
    carrosContainer.appendChild(stockCard);
    
    // Adicionar evento de clique na imagem para abrir o modal
    const carImage = stockCard.querySelector('.car-image img');
    if (carImage) {
      carImage.style.cursor = 'pointer';
      carImage.addEventListener('click', function() {
        openModal(this.src, [this.src], 0);
      });
    }

    // Eventos dos botões para o carro filtrado
    const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", function () {
        const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
        const numeroWhatsapp = "5511985162224"; // Ajuste conforme necessário
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsapp, "_blank");
      });
    }
    
    // O link de financiamento agora usa href direto, não precisa de event listener

    const carouselContainer = stockCard.querySelector(".carousel-container");
    if (carouselContainer) {
      const prevBtn = carouselContainer.querySelector(".carousel-prev");
      const nextBtn = carouselContainer.querySelector(".carousel-next");
      const carouselImage = carouselContainer.querySelector(".carousel-image");
      let currentIndex = Number(carouselContainer.getAttribute("data-index")) || 0;
      const updateImage = () => {
        carouselContainer.setAttribute("data-index", currentIndex);
        carouselImage.src = imagensArray[currentIndex];
      };
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === 0) ? imagensArray.length - 1 : currentIndex - 1;
        updateImage();
      });
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex === imagensArray.length - 1) ? 0 : currentIndex + 1;
        updateImage();
      });
      
      // Adicione evento de clique na imagem do carrossel
      if (carouselImage) {
        carouselImage.style.cursor = 'pointer';
        carouselImage.addEventListener('click', function() {
          openModal(this.src, imagensArray, currentIndex);
        });
      }
    }
  });
}

// Inicializa tudo após o carregamento do DOM
document.addEventListener("DOMContentLoaded", async function () {
  await carregarCategorias();
  await carregarCarrosTelaCliente();
});

// Função para abrir o modal com a imagem ampliada e navegação
function openModal(imgSrc, allImages = null, currentIndex = 0) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.close');
  
  if (modal && modalImg) {
    modal.style.display = "block";
    modalImg.src = imgSrc;
    
    // Configurar evento de fechamento ao clicar no X
    if (closeBtn) {
      closeBtn.onclick = function() {
        modal.style.display = "none";
      };
    }
    
    // Configurar evento de fechamento ao clicar fora da imagem
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
    
    // Se temos múltiplas imagens, configuramos a navegação
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');
    
    if (allImages && allImages.length > 1 && prevBtn && nextBtn) {
      // Mostrar os botões de navegação
      prevBtn.style.display = 'block';
      nextBtn.style.display = 'block';
      
      // Configurar os eventos de clique
      prevBtn.onclick = function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex === 0) ? allImages.length - 1 : currentIndex - 1;
        modalImg.src = allImages[currentIndex];
      };
      
      nextBtn.onclick = function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex === allImages.length - 1) ? 0 : currentIndex + 1;
        modalImg.src = allImages[currentIndex];
      };
    } else if (prevBtn && nextBtn) {
      // Esconder os botões se não houver múltiplas imagens
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }
}
