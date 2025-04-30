document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    const cadastrarBtn = document.getElementById("cadastrar");
    const popupSucesso = document.getElementById("popupSucesso");
    const btnFecharPopup = document.getElementById("btnFecharPopup");

    // Garante que o popup fique escondido ao carregar a página
    popupSucesso.style.display = "none";

    // Exibe o popup de sucesso ao cadastrar um veículo
    function mostrarPopupSucesso() {
        console.log("Tentando exibir o popup de sucesso...");
        
        if (popupSucesso) {
            popupSucesso.style.display = "flex"; // Mostra o popup somente quando chamado
            console.log("Popup de sucesso exibido!");
            
            // Define um temporizador para esconder o popup automaticamente após alguns segundos
            setTimeout(() => {
                popupSucesso.style.display = "none";
            }, 3000); // Oculta após 3 segundos
        } else {
            console.error("Elemento popupSucesso não encontrado!");
        }
    }

    // Evento para fechar o popup ao clicar no botão "Fechar"
    btnFecharPopup.addEventListener("click", function () {
        console.log("Fechando popup...");
        popupSucesso.style.display = "none";
    });

    // Atualiza visualização no cadastro em tempo real
    function atualizarVisualizacao() {
        // Atualiza os campos de texto (já existentes)
        document.getElementById("prevFabricante").querySelector("span").textContent =
            document.getElementById("fabricante").value || "";
        document.getElementById("prevModelo").querySelector("span").textContent =
            document.getElementById("modelo").value || "";
        document.getElementById("prevAno").querySelector("span").textContent =
            document.getElementById("ano").value || "";
        document.getElementById("prevDono").querySelector("span").textContent =
            document.getElementById("quantidadeDono").value || "";
        document.getElementById("prevKM").querySelector("span").textContent =
            document.getElementById("km").value || "";
        const preco = document.getElementById("preco").value || "";
        document.getElementById("prevValor").querySelector("span").textContent =
            preco ? `R$ ${parseFloat(preco).toFixed(2)}` : "";
        document.getElementById("prevDescricao").querySelector("span").textContent =
            document.getElementById("descricao").value || "";
    
        // Atualiza a visualização do carrossel de imagens
        const imagemInput = document.getElementById("imagemCarro").files;
        const previewImg = document.getElementById("carouselContainer").querySelector(".carousel");
        previewImg.innerHTML = ""; // Limpa o conteúdo anterior
    
        if (imagemInput.length > 0) {
            // Itera por todos os arquivos selecionados e cria um elemento <img> para cada um
            Array.from(imagemInput).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    // Você pode ajustar as dimensões conforme necessário; aqui demos um exemplo:
                    img.style.height = "200px"; 
                    img.style.borderRadius = "8px";
                    img.style.marginRight = "10px";
                    previewImg.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            previewImg.innerHTML = "<img src='img/fallback.png' style='width: 100%; border-radius: 8px;'>";
        }
    }    
    

    // Adiciona eventos para atualização em tempo real
    ["fabricante", "modelo", "ano", "quantidadeDono", "km", "preco", "descricao"].forEach((id) => {
        document.getElementById(id).addEventListener("input", atualizarVisualizacao);
    });
    document.getElementById("imagemCarro").addEventListener("change", atualizarVisualizacao);

    // Salva veículos no `localStorage`
    function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
        console.log("Salvando carro...");
        const veiculo = { fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens };
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosSalvos.push(veiculo);
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosSalvos));

        console.log("Carro salvo com sucesso!");

        carregarEstoque();
    }

    // Carrega e exibe veículos no estoque
    function carregarEstoque() {
        if (!stockSection) {
            console.error("Elemento stock-list não encontrado!");
            return;
        }

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
                    <img src="${carro.imagem || 'img/fallback.png'}" alt="${carro.modelo}" style="width: 100%; border-radius: 8px;">
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

    // Evento de cadastro de veículos
    cadastrarBtn.addEventListener("click", function () {
        console.log("Botão cadastrar clicado!");
    
        const fabricante = document.getElementById("fabricante").value.trim();
        const modelo = document.getElementById("modelo").value.trim();
        const ano = document.getElementById("ano").value.trim();
        const quantidadeDono = document.getElementById("quantidadeDono").value.trim();
        const km = document.getElementById("km").value.trim();
        const preco = document.getElementById("preco").value.trim();
        const descricao = document.getElementById("descricao").value.trim();
        const imagemInput = document.getElementById("imagemCarro").files;  // Nota: Sem o [0], para pegar todos os arquivos
    
        if (!fabricante || !modelo || !ano || !quantidadeDono || !km || !preco || !descricao) {
            alert("Por favor, preencha todos os campos!");
            return;
        }
    
        // AQUI é onde você adiciona o código para tratar múltiplas imagens:
        let imagens = [];
        if (imagemInput.length > 0) {
            let imagensProcessadas = 0;
            Array.from(imagemInput).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = function () {
                    imagens.push(reader.result);
                    imagensProcessadas++;
                    if (imagensProcessadas === imagemInput.length) {
                        salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens);
                        mostrarPopupSucesso();
                    }
                };
                reader.readAsDataURL(file);
            });
        } else {
            imagens.push("img/fallback.png");
            salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens);
            mostrarPopupSucesso();
        }
    });

    carregarEstoque(); // Inicializa estoque ao carregar a página
});
