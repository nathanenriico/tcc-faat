document.addEventListener("DOMContentLoaded", function () {
    // Recuperando veículos do localStorage
    const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
    const availableCarsSection = document.querySelector(".available-cars");

    // Verificando se há carros cadastrados
    if (carrosSalvos.length === 0) {
        availableCarsSection.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
        return;
    }

    // Adicionando os veículos na seção de "Carros Disponíveis"
    carrosSalvos.forEach((carro) => {
        const carCard = document.createElement("div");
        carCard.classList.add("car-card");

        carCard.innerHTML = `
            <div class="car-image">
                <img src="car-placeholder.png" alt="${carro.modelo}">
            </div>
            <div class="car-details">
                <h3>${carro.fabricante} ${carro.modelo} - ${carro.ano}</h3>
                <p>${carro.quantidadeDono} Dono(s)</p>
                <p>${carro.km} km</p>
                <p>${carro.descricao}</p>
                <p class="price">R$ ${parseFloat(carro.preco).toFixed(2)}</p>
            </div>
        `;

        availableCarsSection.appendChild(carCard);
    });
});

