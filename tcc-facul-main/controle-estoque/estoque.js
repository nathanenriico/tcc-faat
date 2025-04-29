document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    const categoriesContainer = document.querySelector(".categories-container");

    // Função para carregar o estoque de veículos
    function carregarEstoque() {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        stockSection.innerHTML = "";

        if (carrosSalvos.length === 0) {
            stockSection.innerHTML = "<p>Nenhum carro no estoque.</p>";
            return;
        }

        carrosSalvos.forEach((carro, index) => {
            const stockCard = document.createElement("div");
            stockCard.classList.add("stock-card");

            stockCard.innerHTML = `
                <div class="car-image">
                    <img src="${carro.imagem}" alt="${carro.modelo}">
                </div>
                <h3>${carro.fabricante} ${carro.modelo}</h3>
                <p><strong>Ano:</strong> ${carro.ano}</p>
                <p><strong>KM:</strong> ${carro.km}</p>
                <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
                <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
                <p><strong>Descrição:</strong> ${carro.descricao}</p>
                <button class="delete-btn" data-index="${index}">🗑️ Excluir</button>
                <button class="add-btn" data-index="${index}">➕ Adicionar</button>
            `;

            stockSection.appendChild(stockCard);
        });
    }

    // Função para carregar categorias dinamicamente
    function carregarCategorias() {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        categoriesContainer.innerHTML = "";
    
        if (carrosSalvos.length === 0) {
            categoriesContainer.innerHTML = "<p>Nenhuma categoria disponível.</p>";
            return;
        }
    
        // Obter modelos únicos
        const modelosUnicos = [...new Set(carrosSalvos.map(carro => carro.modelo))];
    
        modelosUnicos.forEach(modelo => {
            const categoria = document.createElement("div");
            categoria.classList.add("category");
    
            // Busca a imagem do primeiro carro do modelo
            const carro = carrosSalvos.find(carro => carro.modelo === modelo);
            const imagemCategoria = carro.imagem || "icons/default.png";
    
            categoria.innerHTML = `
                <div class="category-image">
                    <img src="${imagemCategoria}" alt="${modelo}">
                </div>
                <span>${modelo}</span>
            `;
    
            // Clique para filtrar carros por modelo
            categoria.addEventListener("click", function () {
                filtrarPorModelo(modelo);
            });
    
            categoriesContainer.appendChild(categoria);
        });
    
        // Salva as categorias no localStorage
        localStorage.setItem("categoriasDisponiveis", JSON.stringify(modelosUnicos));
    }
    

    // Função para filtrar carros por modelo
    function filtrarPorModelo(modelo) {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        const carrosFiltrados = carrosSalvos.filter(carro => carro.modelo === modelo);

        stockSection.innerHTML = "";
        if (carrosFiltrados.length === 0) {
            stockSection.innerHTML = `<p>Nenhum carro disponível para o modelo "${modelo}".</p>`;
            return;
        }

        carrosFiltrados.forEach((carro, index) => {
            const stockCard = document.createElement("div");
            stockCard.classList.add("stock-card");

            stockCard.innerHTML = `
                <div class="car-image">
                    <img src="${carro.imagem}" alt="${carro.modelo}">
                </div>
                <h3>${carro.fabricante} ${carro.modelo}</h3>
                <p><strong>Ano:</strong> ${carro.ano}</p>
                <p><strong>KM:</strong> ${carro.km}</p>
                <p><strong>Preço:</strong> R$ ${parseFloat(carro.preco).toFixed(2)}</p>
                <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
                <p><strong>Descrição:</strong> ${carro.descricao}</p>
                <button class="delete-btn" data-index="${index}">🗑️ Excluir</button>
            `;

            stockSection.appendChild(stockCard);
        });
    }

    // Delegação de eventos para exclusão e adição
    stockSection.addEventListener("click", function (event) {
        const target = event.target;

        // Verifica se é o botão de exclusão
        if (target.classList.contains("delete-btn")) {
            const index = target.getAttribute("data-index");
            excluirCarro(index);
        }

        // Verifica se é o botão de adicionar
        if (target.classList.contains("add-btn")) {
            const index = target.getAttribute("data-index");
            adicionarCarro(index);
        }
    });

    function excluirCarro(index) {
        let carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosDisponiveis.splice(index, 1); // Remove o carro do estoque
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosDisponiveis));
        carregarEstoque(); // Atualiza o DOM
        carregarCategorias(); // Atualiza categorias
    }

    function adicionarCarro(index) {
        const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        const carrosAdicionados = JSON.parse(localStorage.getItem("carrosAdicionados")) || [];

        const carroSelecionado = carrosDisponiveis[index];

        // Verificar se o carro já foi adicionado
        const jaExiste = carrosAdicionados.some(carro => carro.modelo === carroSelecionado.modelo);

        if (!jaExiste) {
            carrosAdicionados.push(carroSelecionado);
            localStorage.setItem("carrosAdicionados", JSON.stringify(carrosAdicionados));
            alert("Carro adicionado com sucesso!");
        } else {
            alert("Este carro já foi adicionado.");
        }
    }

    carregarEstoque(); // Carrega o estoque inicial
    carregarCategorias(); // Carrega as categorias
});

function voltarPagina() {
    window.location.href = "../tela-cadastro/cadastro/cadastro.html";
}
