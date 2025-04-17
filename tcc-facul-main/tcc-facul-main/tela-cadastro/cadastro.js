document.addEventListener("DOMContentLoaded", function () {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            console.log("Mudança detectada no DOM:", mutation.target);
        });
    });
    // Preview da imagem em tempo real via arquivo
document.getElementById("imagemCarro").addEventListener("change", function () {
    const imagemInput = this.files[0];
    const preview = document.getElementById("previewImagem");
  
    if (imagemInput) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
      };
      reader.readAsDataURL(imagemInput);
    } else {
      preview.src = "img/fallback.png";
    }
  });
  
  // Preview da imagem em tempo real via URL
  document.getElementById("urlImagem").addEventListener("input", function () {
    const urlImagem = this.value;
    const preview = document.getElementById("previewImagem");
  
    if (urlImagem && (urlImagem.startsWith("http://") || urlImagem.startsWith("https://"))) {
      preview.src = urlImagem;
    } else if (!urlImagem) {
      preview.src = "img/fallback.png";
    }
  });
  
    observer.observe(document.body, { childList: true, subtree: true });

    console.log("JavaScript carregado corretamente!");

    // Exibe veículos na tela principal
    function exibirVeiculos() {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        const carContainer = document.querySelector(".carousel-container");
        if (!carContainer) return;

        carContainer.innerHTML = "";

        if (carrosSalvos.length === 0) {
            carContainer.innerHTML = "<p>Nenhum carro disponível no momento.</p>";
            return;
        }

        carrosSalvos.forEach((carro) => {
            let imagemFinal = carro.imagem || "img/fallback.png";
            const carCard = document.createElement("div");
            carCard.classList.add("car-card");

            carCard.innerHTML = `
                <div class="car-image">
                    <img src="${imagemFinal}" alt="${carro.modelo}" 
                    onerror="this.onerror=null; this.src='img/fallback.png';"
                    style="width: 100%; height: auto; border-radius: 8px;">
                </div>
                <div class="car-details">
                    <h3>${carro.fabricante} ${carro.modelo} - ${carro.ano}</h3>
                    <p>${carro.quantidadeDono} Dono(s)</p>
                    <p>${carro.km} km</p>
                    <p>${carro.descricao}</p>
                    <p class="price">R$ ${parseFloat(carro.preco).toFixed(2)}</p>
                </div>
            `;
            carContainer.appendChild(carCard);
        });
    }

    // Exibe veículos no estoque
    function exibirEstoque() {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        const stockSection = document.querySelector(".stock-list");
        if (!stockSection) return;

        stockSection.innerHTML = "";

        if (carrosSalvos.length === 0) {
            stockSection.innerHTML = "<p>Nenhum carro no estoque.</p>";
            return;
        }

        carrosSalvos.forEach((carro) => {
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
            `;
            stockSection.appendChild(stockCard);
        });
    }

    // Exibe nas duas telas
    exibirVeiculos();
    exibirEstoque();

    // Cadastro de veículos
    document.getElementById("cadastrar").addEventListener("click", function () {
        const fabricante = document.getElementById("fabricante").value;
        const modelo = document.getElementById("modelo").value;
        const ano = document.getElementById("ano").value;
        const quantidadeDono = document.getElementById("quantidadeDono").value;
        const km = document.getElementById("km").value;
        const preco = document.getElementById("preco").value;
        const descricao = document.getElementById("descricao").value;
        const imagemInput = document.getElementById("imagemCarro").files[0];
        const urlImagem = document.getElementById("urlImagem").value;

        let imagemBase64 = "";

        if (imagemInput) {
            const reader = new FileReader();
            reader.onloadend = function () {
                imagemBase64 = reader.result;
                salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagemBase64);
            };
            reader.readAsDataURL(imagemInput);
        } else {
            salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, urlImagem);
        }
    });

    function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagem) {
        if (!imagem) {
            imagem = "img/fallback.png";
        }

        const veiculo = { fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagem };

        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosSalvos.push(veiculo);
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosSalvos));
       

        console.log("Veículo salvo:", veiculo);

        mostrarPopupSucesso();  // 👈 chama o popup
        exibirVeiculos();
        exibirEstoque();
        limparVisualizacao();
    }

    function mostrarPopupSucesso() {
      document.getElementById("popupSucesso").style.display = "flex";
    
      // Adiciona o event listener toda vez que o popup abrir (garante que o botão exista)
      document.getElementById("btnFecharPopup").onclick = fecharPopupSucesso;
    }
    
    function fecharPopupSucesso() {
      document.getElementById("popupSucesso").style.display = "none";
    }
    
    // Atualizar visualização em tempo real
document.getElementById("fabricante").addEventListener("input", () => {
    document.querySelector("#prevFabricante span").textContent = document.getElementById("fabricante").value;
  });
  document.getElementById("modelo").addEventListener("input", () => {
    document.querySelector("#prevModelo span").textContent = document.getElementById("modelo").value;
  });
  document.getElementById("ano").addEventListener("input", () => {
    document.querySelector("#prevAno span").textContent = document.getElementById("ano").value;
  });
  document.getElementById("quantidadeDono").addEventListener("input", () => {
    document.querySelector("#prevDono span").textContent = document.getElementById("quantidadeDono").value;
  });
  document.getElementById("km").addEventListener("input", () => {
    document.querySelector("#prevKM span").textContent = document.getElementById("km").value;
  });
  document.getElementById("preco").addEventListener("input", () => {
    const valor = parseFloat(document.getElementById("preco").value || 0);
    const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.querySelector("#prevValor span").textContent = valorFormatado;
});
  document.getElementById("descricao").addEventListener("input", () => {
    document.querySelector("#prevDescricao span").textContent = document.getElementById("descricao").value;
  });
  
    // Limpa a visualização após cadastro
    function limparVisualizacao() {
        document.querySelector("#prevFabricante span").textContent = "";
        document.querySelector("#prevModelo span").textContent = "";
        document.querySelector("#prevAno span").textContent = "";
        document.querySelector("#prevDono span").textContent = "";
        document.querySelector("#prevKM span").textContent = "";
        document.querySelector("#prevValor span").textContent = "";
        document.querySelector("#prevDescricao span").textContent = "";
    }
});
