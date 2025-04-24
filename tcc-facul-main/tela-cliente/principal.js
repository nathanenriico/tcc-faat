document.addEventListener("DOMContentLoaded", function () {
    const stockListCliente = document.querySelector(".stock-list");
  
    // Função para carregar os carros da tela cliente
    function carregarCarrosTelaCliente() {
        // Recupera os carros do localStorage
        const carrosDisponiveis = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
  
        if (carrosDisponiveis.length === 0) {
            stockListCliente.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
            return;
        }
  
        // Adiciona os carros ao HTML da tela cliente
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
  
            stockListCliente.appendChild(stockCard);
  
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
  
    carregarCarrosTelaCliente();
  });
  
