import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔎 Supabase conectado:", supabase);

function extrairImagens(campoImagens) {
  let imagensArray = [];
  if (campoImagens) {
    try {
      imagensArray = JSON.parse(campoImagens);
      if (!Array.isArray(imagensArray)) {
        imagensArray = [imagensArray];
      }
    } catch (e) {
      imagensArray = [campoImagens];
    }
  }
  if (!imagensArray || imagensArray.length === 0 || !imagensArray[0].trim()) {
    imagensArray = ["img/fallback.png"];
  }
  return imagensArray;
}

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

    const imagensArray = extrairImagens(carro.imagens);
    console.log("🔎 Caminho da imagem do carro:", imagensArray[0]);

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

    const carImage = stockCard.querySelector('.car-image img');
    if (carImage) {
      carImage.style.cursor = 'pointer';
      carImage.addEventListener('click', function() {
        open360Modal(imagensArray);
      });
    }

    const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
    if (whatsappBtn) {
      whatsappBtn.addEventListener("click", function () {
        const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
        const numeroWhatsapp = "5511985162224";
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsapp, "_blank");
      });
    }

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
      
      if (carouselImage) {
        carouselImage.style.cursor = 'pointer';
        carouselImage.addEventListener('click', function() {
          open360Modal(imagensArray);
        });
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  await carregarCarrosTelaCliente();
});

function open360Modal(images) {
  const modal = document.getElementById('modal360');
  const viewer = document.getElementById('viewer360');
  const closeBtn = document.querySelector('.close-360');
  
  if (!modal || !viewer) return;
  
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  
  viewer.innerHTML = `
    <div style="width:100%;height:100%;position:relative;background:#000;border-radius:8px;overflow:hidden;cursor:grab;">
      <img style="width:100%;height:100%;object-fit:cover;transition:transform 0.1s ease;user-select:none;" src="${images[0]}" alt="360° View">
      <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.7);color:white;padding:8px 16px;border-radius:20px;font-size:12px;pointer-events:none;">Arraste para rotacionar 360°</div>
    </div>
  `;
  
  const image = viewer.querySelector('img');
  const container = viewer.querySelector('div');
  
  const handleStart = (e) => {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    container.style.cursor = 'grabbing';
  };
  
  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.clientX || e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    if (Math.abs(deltaX) > 10) {
      const direction = deltaX > 0 ? 1 : -1;
      currentIndex = (currentIndex + direction + images.length) % images.length;
      image.src = images[currentIndex];
      startX = currentX;
    }
  };
  
  const handleEnd = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };
  
  container.addEventListener('mousedown', handleStart);
  container.addEventListener('touchstart', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchend', handleEnd);
  
  modal.style.display = 'block';
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeBtn.onclick();
    }
  };
}