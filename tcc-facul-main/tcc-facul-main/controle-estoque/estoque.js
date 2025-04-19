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
                    <img src="${carro.imagem}" alt="${carro.modelo}" 
                    style="width: 100%; height: auto; border-radius: 8px;">
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

        adicionarEventosExcluir();
    }

    function adicionarEventosExcluir() {
        const botoesExcluir = document.querySelectorAll(".delete-btn");
        botoesExcluir.forEach(botao => {
            botao.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                excluirCarro(index);
            });
        });
    }

    function excluirCarro(index) {
        let carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosSalvos.splice(index, 1);
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosSalvos));
        carregarEstoque();
    }

    carregarEstoque();
});

function voltarPagina() {
    window.location.href = "../tela-cadastro/cadastro.html";
}
