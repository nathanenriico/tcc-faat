document.addEventListener("DOMContentLoaded", function () {
    const stockListCliente = document.querySelector(".stock-list"); // Seção completa para exibir os carros
    const carrosContainer = document.querySelector(".carros-container"); // Container dentro da seção (separado)
    const categoriesContainer = document.querySelector(".categories-container");
  
    // Função para carregar as categorias dinamicamente
    function carregarCategorias() {
      // Supondo que os veículos estejam salvos no localStorage com a propriedade "imagens" (um array)
      const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
      categoriesContainer.innerHTML = ""; // Limpa as categorias
  
      if (carrosDisponiveis.length === 0) {
        categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
        return;
      }
  
      // Obtém os modelos únicos para criar as categorias
      const modelosUnicos = [...new Set(carrosDisponiveis.map(carro => carro.modelo))];
  
      modelosUnicos.forEach(modelo => {
        const categoria = document.createElement("div");
        categoria.classList.add("category");
  
        // Para a categoria, usa a primeira imagem disponível do primeiro veículo com esse modelo
        const carro = carrosDisponiveis.find(carro => carro.modelo === modelo);
        const imagemCategoria = (carro.imagens && carro.imagens.length > 0)
          ? carro.imagens[0]
          : "default-category.png";
  
        categoria.innerHTML = `
          <img src="${imagemCategoria}" alt="${modelo}" style="width: 100%; height: 120px; object-fit: cover;">
          <span>${modelo}</span>
        `;
  
        // Ao clicar na categoria, filtra os carros pelo modelo
        categoria.addEventListener("click", function () {
          filtrarCarrosPorModelo(modelo);
        });
  
        categoriesContainer.appendChild(categoria);
      });
    }

    // Função para carregar os carros na tela do cliente com carrossel
  function carregarCarrosTelaCliente() {
    const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
    carrosContainer.innerHTML = ""; // Limpa a lista

    if (carrosDisponiveis.length === 0) {
      carrosContainer.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
      return;
    }

    carrosDisponiveis.forEach(carro => {
      const stockCard = document.createElement("div");
      stockCard.classList.add("car-card");

      // Para exibir as imagens, usamos a propriedade "imagens".
      // Se houver mais de uma imagem, cria um carrossel.
      let imagens = (carro.imagens && carro.imagens.length > 0) ? carro.imagens : ["img/fallback.png"];
      let carouselHTML = "";

      if (imagens.length > 1) {
        // Cria um carrossel com botões de navegação
        carouselHTML = `
          <div class="carousel-container" data-index="0" style="position: relative;">
            <button class="carousel-prev" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); color:#fff; border: none; border-radius: 50%; padding: 5px;">&#9664;</button>
            <img class="carousel-image" src="${imagens[0]}" alt="${carro.modelo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            <button class="carousel-next" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); color:#fff; border: none; border-radius: 50%; padding: 5px;">&#9654;</button>
          </div>
        `;
      } else {
        // Apenas uma imagem
        carouselHTML = `
          <div class="car-image">
            <img src="${imagens[0]}" alt="${carro.modelo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          </div>
        `;
      }

      stockCard.innerHTML = `
        ${carouselHTML}
        <h3>${carro.fabricante} ${carro.modelo}</h3>
        <p><strong>Ano:</strong> ${carro.ano}</p>
        <p><strong>KM:</strong> ${carro.km}</p>
        <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
        <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
        <p><strong>Descrição:</strong> ${carro.descricao}</p>
        <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
      `;

      carrosContainer.appendChild(stockCard);

      // Se houver mais de uma imagem, configure a navegação do carrossel
      if (imagens.length > 1) {
        const carouselContainer = stockCard.querySelector(".carousel-container");
        const carouselImage = stockCard.querySelector(".carousel-image");
        const prevBtn = stockCard.querySelector(".carousel-prev");
        const nextBtn = stockCard.querySelector(".carousel-next");
        let currentIndex = 0;

        prevBtn.addEventListener("click", function () {
          currentIndex = (currentIndex - 1 + imagens.length) % imagens.length;
          carouselImage.src = imagens[currentIndex];
          carouselContainer.setAttribute("data-index", currentIndex);
        });

        nextBtn.addEventListener("click", function () {
          currentIndex = (currentIndex + 1) % imagens.length;
          carouselImage.src = imagens[currentIndex];
          carouselContainer.setAttribute("data-index", currentIndex);
        });
      }

      // Evento do botão de WhatsApp
      const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
      whatsappBtn.addEventListener("click", function () {
        const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
        const numeroWhatsapp = "5511999999999"; // Substitua pelo número correto
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsapp, "_blank");
      });
    });
  }

   // Função para filtrar carros por modelo
  function filtrarCarrosPorModelo(modelo) {
    const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
    const carrosFiltrados = carrosDisponiveis.filter(carro => carro.modelo === modelo);
    carrosContainer.innerHTML = "";

    if (carrosFiltrados.length === 0) {
      carrosContainer.innerHTML = `<p>Nenhum carro encontrado para o modelo "${modelo}".</p>`;
      return;
    }

    carrosFiltrados.forEach(carro => {
      const stockCard = document.createElement("div");
      stockCard.classList.add("car-card");

      // Semelhante à função carregarCarrosTelaCliente, monta o carrossel (se houver mais de uma imagem)
      let imagens = (carro.imagens && carro.imagens.length > 0) ? carro.imagens : ["img/fallback.png"];
      let carouselHTML = "";

      if (imagens.length > 1) {
        carouselHTML = `
          <div class="carousel-container" data-index="0" style="position: relative;">
            <button class="carousel-prev" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); color:#fff; border: none; border-radius: 50%; padding: 5px;">&#9664;</button>
            <img class="carousel-image" src="${imagens[0]}" alt="${carro.modelo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            <button class="carousel-next" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); color:#fff; border: none; border-radius: 50%; padding: 5px;">&#9654;</button>
          </div>
        `;
      } else {
        carouselHTML = `
          <div class="car-image">
            <img src="${imagens[0]}" alt="${carro.modelo}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
          </div>
        `;
      }

      stockCard.innerHTML = `
        ${carouselHTML}
        <h3>${carro.fabricante} ${carro.modelo}</h3>
        <p><strong>Ano:</strong> ${carro.ano}</p>
        <p><strong>KM:</strong> ${carro.km}</p>
        <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
        <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
        <p><strong>Descrição:</strong> ${carro.descricao}</p>
        <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
      `;
      carrosContainer.appendChild(stockCard);

      if (imagens.length > 1) {
        const carouselContainer = stockCard.querySelector(".carousel-container");
        const carouselImage = stockCard.querySelector(".carousel-image");
        const prevBtn = stockCard.querySelector(".carousel-prev");
        const nextBtn = stockCard.querySelector(".carousel-next");
        let currentIndex = 0;
        prevBtn.addEventListener("click", function () {
          currentIndex = (currentIndex - 1 + imagens.length) % imagens.length;
          carouselImage.src = imagens[currentIndex];
          carouselContainer.setAttribute("data-index", currentIndex);
        });
        nextBtn.addEventListener("click", function () {
          currentIndex = (currentIndex + 1) % imagens.length;
          carouselImage.src = imagens[currentIndex];
          carouselContainer.setAttribute("data-index", currentIndex);
        });
      }

      const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
      whatsappBtn.addEventListener("click", function () {
        const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
        const numeroWhatsapp = "5511999999999"; // Configure o número correto
        const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
        window.open(urlWhatsapp, "_blank");
      });
    });
  }

  // Inicializa as categorias e os carros
  carregarCategorias();
  carregarCarrosTelaCliente();
});
