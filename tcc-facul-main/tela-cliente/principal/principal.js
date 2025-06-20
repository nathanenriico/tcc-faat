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
  
  let isDragging = false;
  let startX = 0, startY = 0;
  let yaw = 0, pitch = 0;
  let currentImageIndex = 0;
  let zoom = 1;
  
  viewer.innerHTML = `
    <div id="panoramaContainer" style="width:100%;height:100%;position:relative;background:#000;border-radius:8px;overflow:hidden;cursor:grab;">
      <canvas id="panoramaCanvas" width="800" height="600" style="width:100%;height:100%;"></canvas>
      <div style="position:absolute;top:20px;left:20px;color:white;background:rgba(0,0,0,0.8);padding:10px 15px;border-radius:20px;font-size:14px;font-weight:bold;">🌐 Street View 360°</div>
      <div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:8px 16px;border-radius:20px;font-size:12px;">Arraste para olhar ao redor</div>
      <button id="prevImage" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.7);color:white;border:none;padding:15px;border-radius:50%;cursor:pointer;font-size:18px;">◀</button>
      <button id="nextImage" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.7);color:white;border:none;padding:15px;border-radius:50%;cursor:pointer;font-size:18px;">▶</button>
      <div style="position:absolute;top:20px;right:20px;display:flex;flex-direction:column;gap:10px;">
        <button id="zoomIn" style="background:rgba(0,0,0,0.7);color:white;border:none;padding:10px;border-radius:50%;cursor:pointer;font-size:16px;">+</button>
        <button id="zoomOut" style="background:rgba(0,0,0,0.7);color:white;border:none;padding:10px;border-radius:50%;cursor:pointer;font-size:16px;">−</button>
      </div>
    </div>
  `;
  
  const canvas = document.getElementById('panoramaCanvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('panoramaContainer');
  
  // Carregar imagem atual
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  const renderPanorama = () => {
    if (!img.complete) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Simular projeção esférica
    const fov = 90; // Campo de visão
    const aspectRatio = canvasWidth / canvasHeight;
    
    // Calcular dimensões da viewport com zoom
    const viewWidth = img.width / zoom;
    const viewHeight = img.height / zoom;
    
    // Calcular offset baseado na rotação (movimento livre)
    const offsetX = ((yaw + 180) / 360) * Math.max(0, img.width - viewWidth);
    const offsetY = ((pitch + 90) / 180) * Math.max(0, img.height - viewHeight);
    
    // Garantir que ficamos dentro dos limites da imagem
    let srcX = Math.max(0, Math.min(img.width - viewWidth, offsetX));
    let srcY = Math.max(0, Math.min(img.height - viewHeight, offsetY));
    
    // Desenhar a parte visível da imagem
    ctx.drawImage(
      img,
      srcX, srcY,
      viewWidth, viewHeight,
      0, 0,
      canvasWidth, canvasHeight
    );
  };
  
  const loadImage = () => {
    img.onload = renderPanorama;
    img.src = images[currentImageIndex];
  };
  
  const handleStart = (e) => {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
    container.style.cursor = 'grabbing';
  };
  
  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.clientX || e.touches[0].clientX;
    const currentY = e.clientY || e.touches[0].clientY;
    
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    
    // Atualizar ângulos diretamente
    yaw += deltaX * 0.5;
    pitch += deltaY * 0.5;
    
    // Limitar pitch
    pitch = Math.max(-90, Math.min(90, pitch));
    
    // Limitar yaw para não sair da imagem
    yaw = Math.max(-180, Math.min(180, yaw));
    
    // Apenas renderizar, não trocar imagem
    renderPanorama();
    
    startX = currentX;
    startY = currentY;
  };
  
  const handleEnd = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };
  
  // Redimensionar canvas
  const resizeCanvas = () => {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    renderPanorama();
  };
  
  // Botões de navegação
  const prevBtn = document.getElementById('prevImage');
  const nextBtn = document.getElementById('nextImage');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  
  prevBtn.onclick = (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    yaw = 0; // Reset yaw ao trocar imagem
    pitch = 0; // Reset pitch ao trocar imagem
    loadImage();
  };
  
  nextBtn.onclick = (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % images.length;
    yaw = 0; // Reset yaw ao trocar imagem
    pitch = 0; // Reset pitch ao trocar imagem
    loadImage();
  };
  
  // Controles de zoom
  zoomInBtn.onclick = (e) => {
    e.stopPropagation();
    zoom = Math.min(zoom * 1.2, 3); // Máximo 3x
    renderPanorama();
  };
  
  zoomOutBtn.onclick = (e) => {
    e.stopPropagation();
    zoom = Math.max(zoom / 1.2, 0.5); // Mínimo 0.5x
    renderPanorama();
  };
  
  // Zoom com scroll do mouse
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoom = Math.min(zoom * 1.1, 3);
    } else {
      zoom = Math.max(zoom / 1.1, 0.5);
    }
    renderPanorama();
  });
  
  container.addEventListener('mousedown', handleStart);
  container.addEventListener('touchstart', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  document.addEventListener('touchend', handleEnd);
  window.addEventListener('resize', resizeCanvas);
  
  modal.style.display = 'block';
  resizeCanvas();
  loadImage();
  
  closeBtn.onclick = () => {
    modal.style.display = 'none';
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
    window.removeEventListener('resize', resizeCanvas);
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeBtn.onclick();
    }
  };
}