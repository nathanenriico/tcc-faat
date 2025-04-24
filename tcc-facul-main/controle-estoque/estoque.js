document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");

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

    // Delegação de eventos para garantir que os eventos dos botões sejam mantidos
    stockSection.addEventListener("click", function(event) {
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
});

function voltarPagina() {
    window.location.href = "../tela-cadastro/cadastro.html";
}
