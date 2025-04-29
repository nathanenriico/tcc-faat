document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    const cadastrarBtn = document.getElementById("cadastrar");
    const popupSucesso = document.getElementById("popupSucesso");
    const btnFecharPopup = document.getElementById("btnFecharPopup");

    // Atualiza visualização no cadastro em tempo real
    function atualizarVisualizacao() {
        document.getElementById("prevFabricante").querySelector("span").textContent =
            document.getElementById("fabricante").value || "Não informado";
        document.getElementById("prevModelo").querySelector("span").textContent =
            document.getElementById("modelo").value || "Não informado";
        document.getElementById("prevAno").querySelector("span").textContent =
            document.getElementById("ano").value || "Não informado";
        document.getElementById("prevDono").querySelector("span").textContent =
            document.getElementById("quantidadeDono").value || "Não informado";
        document.getElementById("prevKM").querySelector("span").textContent =
            document.getElementById("km").value || "Não informado";
        const preco = document.getElementById("preco").value || "0";
        document.getElementById("prevValor").querySelector("span").textContent =
            preco ? `R$ ${parseFloat(preco).toFixed(2)}` : "Não informado";
        document.getElementById("prevDescricao").querySelector("span").textContent =
            document.getElementById("descricao").value || "Não informado";

        const imagemInput = document.getElementById("imagemCarro").files[0];
        const previewImg = document.getElementById("carouselContainer").querySelector(".carousel");
        previewImg.innerHTML = ""; // Limpa carrossel

        if (imagemInput) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "100%";
                img.style.borderRadius = "8px";
                previewImg.appendChild(img);
            };
            reader.readAsDataURL(imagemInput);
        } else {
            previewImg.innerHTML = "<img src='img/fallback.png' style='width: 100%; border-radius: 8px;'>";
        }
    }

    // Adiciona eventos para atualização em tempo real
    ["fabricante", "modelo", "ano", "quantidadeDono", "km", "preco", "descricao"].forEach((id) => {
        document.getElementById(id).addEventListener("input", atualizarVisualizacao);
    });
    document.getElementById("imagemCarro").addEventListener("change", atualizarVisualizacao);

    // Exibe o popup de sucesso
    function mostrarPopupSucesso() {
        if (popupSucesso) {
            popupSucesso.style.display = "flex"; // Exibe o popup
        } else {
            console.error("Elemento popupSucesso não encontrado!");
        }
    }

    // Salva veículos no `localStorage`
    function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagem) {
        const veiculo = { fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagem };
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosSalvos.push(veiculo);
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosSalvos));

        carregarEstoque();
       
    }

    // Carrega e exibe veículos no estoque
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
                    <img src="${carro.imagem || "img/fallback.png"}" alt="${carro.modelo}" style="width: 100%; border-radius: 8px;">
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

    // Evento de cadastro de veículos
    cadastrarBtn.addEventListener("click", function () {
        const fabricante = document.getElementById("fabricante").value.trim();
        const modelo = document.getElementById("modelo").value.trim();
        const ano = document.getElementById("ano").value.trim();
        const quantidadeDono = document.getElementById("quantidadeDono").value.trim();
        const km = document.getElementById("km").value.trim();
        const preco = document.getElementById("preco").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const imagemInput = document.getElementById("imagemCarro").files[0];

        if (!fabricante || !modelo || !ano || !quantidadeDono || !km || !preco || !descricao) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        if (imagemInput) {
            const reader = new FileReader();
            reader.onloadend = function () {
                salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, reader.result);
            };
            reader.readAsDataURL(imagemInput);
        } else {
            salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, "img/fallback.png");
        }
    });

    carregarEstoque(); // Inicializa estoque ao carregar a página
});
