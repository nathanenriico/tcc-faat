document.addEventListener("DOMContentLoaded", function () {
    const stockListCliente = document.querySelector(".stock-list"); // A seção completa
    const carrosContainer = document.querySelector(".carros-container"); // O container de carros dentro da seção
    const categoriesContainer = document.querySelector(".categories-container");

    // Função para carregar as categorias dinamicamente
    function carregarCategorias() {
        const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        categoriesContainer.innerHTML = ""; // Limpa as categorias antes de adicionar

        if (carrosDisponiveis.length === 0) {
            categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
            return;
        }

        // Obtém modelos únicos para criar as categorias
        const modelosUnicos = [...new Set(carrosDisponiveis.map(carro => carro.modelo))];

        modelosUnicos.forEach(modelo => {
            const categoria = document.createElement("div");
            categoria.classList.add("category");

            // Busca a imagem do primeiro carro do modelo
            const carro = carrosDisponiveis.find(carro => carro.modelo === modelo);
            const imagemCategoria = carro.imagem || "default-category.png";

            categoria.innerHTML = `
                <img src="${imagemCategoria}" alt="${modelo}" style="width: 50px; height: 50px;">
                <span>${modelo}</span>
            `;

            // Adiciona evento de clique para filtrar carros pelo modelo
            categoria.addEventListener("click", function () {
                filtrarCarrosPorModelo(modelo);
            });

            categoriesContainer.appendChild(categoria);
        });
    }

    // Função para carregar os carros na tela cliente
    function carregarCarrosTelaCliente() {
        const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosContainer.innerHTML = ""; // Limpa a lista de carros

        if (carrosDisponiveis.length === 0) {
            carrosContainer.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
            return;
        }

        carrosDisponiveis.forEach(carro => {
            const stockCard = document.createElement("div");
            stockCard.classList.add("car-card");

            stockCard.innerHTML = `
                <div class="car-image">
                    <img src="${carro.imagem}" alt="${carro.modelo}" style="width: 100%; height: auto; border-radius: 8px;">
                </div>
                <h3>${carro.fabricante} ${carro.modelo}</h3>
                <p><strong>Ano:</strong> ${carro.ano}</p>
                <p><strong>KM:</strong> ${carro.km}</p>
                <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
                <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
                <p><strong>Descrição:</strong> ${carro.descricao}</p>
                <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
            `;

            carrosContainer.appendChild(stockCard);

            // Adiciona evento ao botão de WhatsApp
            const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
            whatsappBtn.addEventListener("click", function () {
                const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} km.`;
                const numeroWhatsapp = "5511999999999"; // Substitua pelo número do WhatsApp
                const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsapp, "_blank"); // Abre o link em uma nova aba
            });
        });
    }

    // Filtra carros por modelo
    function filtrarCarrosPorModelo(modelo) {
        const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        const carrosFiltrados = carrosDisponiveis.filter(carro => carro.modelo === modelo);

        carrosContainer.innerHTML = ""; // Limpa a lista de carros
        if (carrosFiltrados.length === 0) {
            carrosContainer.innerHTML = `<p>Nenhum carro encontrado para o modelo "${modelo}".</p>`;
            return;
        }

        carrosFiltrados.forEach(carro => {
            const stockCard = document.createElement("div");
            stockCard.classList.add("car-card");

            stockCard.innerHTML = `
                <div class="car-image">
                    <img src="${carro.imagem}" alt="${carro.modelo}" style="width: 100%; height: auto; border-radius: 8px;">
                </div>
                <h3>${carro.fabricante} ${carro.modelo}</h3>
                <p><strong>Ano:</strong> ${carro.ano}</p>
                <p><strong>KM:</strong> ${carro.km}</p>
                <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
                <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
                <p><strong>Descrição:</strong> ${carro.descricao}</p>
                <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
            `;

            carrosContainer.appendChild(stockCard);
        });
    }

    // Inicializa as categorias e os carros
    carregarCategorias();
    carregarCarrosTelaCliente();
});
