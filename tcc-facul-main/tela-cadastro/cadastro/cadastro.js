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
            // Esconde o popup após 3 segundos
            setTimeout(() => {
                popupSucesso.style.display = "none";
            }, 3000);
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
        // Formatado para reais utilizando toLocaleString
        document.getElementById("prevValor").querySelector("span").textContent =
            preco ? parseFloat(preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
        document.getElementById("prevDescricao").querySelector("span").textContent =
            document.getElementById("descricao").value || "";

        // Atualiza a visualização do carrossel de imagens
        const imagemInput = document.getElementById("imagemCarro").files;
        const previewImg = document.getElementById("carouselContainer").querySelector(".carousel");
        previewImg.innerHTML = ""; // Limpa o conteúdo anterior

        if (imagemInput.length > 0) {
            Array.from(imagemInput).forEach(file => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
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

    // Salva veículos no localStorage (sem limite de número)
    function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
        console.log("Salvando carro...");
        // Cria o objeto veículo – usando "imagens" (um array)
        const veiculo = { fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens };
        // Busca o array de veículos já salvos e adiciona o novo
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        carrosSalvos.push(veiculo);
        localStorage.setItem("carrosDisponiveis", JSON.stringify(carrosSalvos));

        console.log("Carro salvo com sucesso!");
        carregarEstoque();
    }

    // Carrega e exibe veículos do localStorage
    function carregarEstoque() {
        if (!stockSection) {
            console.error("Elemento stock-list não encontrado!");
            return;
        }
    
        // Busca todos os veículos salvos (não há limite definido)
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        stockSection.innerHTML = "";
    
        if (carrosSalvos.length === 0) {
            stockSection.innerHTML = "<p>Nenhum carro no estoque.</p>";
            return;
        }
    
        carrosSalvos.forEach((carro) => {
            const stockCard = document.createElement("div");
            stockCard.classList.add("stock-card");
            // Template com a imagem, informações e container de botões
            stockCard.innerHTML = `
                <div class="car-image">
                    <img src="${(carro.imagens && carro.imagens.length > 0) ? carro.imagens[0] : 'img/fallback.png'}" alt="${carro.modelo}" style="width: 100%; border-radius: 8px;">
                </div>
                <h3>${carro.fabricante} ${carro.modelo}</h3>
                <p><strong>Ano:</strong> ${carro.ano}</p>
                <p><strong>KM:</strong> ${carro.km}</p>
                <p><strong>Preço:</strong> ${parseFloat(carro.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                <p><strong>Dono(s):</strong> ${carro.quantidadeDono}</p>
                <p><strong>Descrição:</strong> ${carro.descricao}</p>
                <div class="button-container">
                    <button class="whatsapp-btn">Entrar em Contato via WhatsApp</button>
                    <button class="financiamento-btn">Simular Financiamento</button>
                </div>
            `;
            stockSection.appendChild(stockCard);
    
            // Configuração do botão do WhatsApp
            const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
            whatsappBtn.addEventListener("click", function () {
                const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} KM.`;
                const numeroWhatsapp = "5511999999999"; // Substitua pelo número correto
                const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsapp, "_blank");
            });
            
            // Configuração do botão de simulação de financiamento
            const financiamentoBtn = stockCard.querySelector(".financiamento-btn");
            financiamentoBtn.addEventListener("click", function () {
              // Para fins de depuração, exibindo os dados do carro
              console.log("Objeto carro recebido:", carro);
              const params = new URLSearchParams({
                fabricante: carro.fabricante,
                modelo: carro.modelo,
                ano: carro.ano,
                preco: carro.preco,
                km: carro.km
              });
              console.log("Parâmetros gerados:", params.toString());
              alert("Redirecionando com:\n" + params.toString());
              // Redireciona usando caminho absoluto (ajuste se necessário)
              window.location.href = "../financiamento/financiamento.html?" + params.toString();
            });
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
        const imagemInput = document.getElementById("imagemCarro").files;
    
        if (!fabricante || !modelo || !ano || !quantidadeDono || !km || !preco || !descricao) {
            alert("Por favor, preencha todos os campos!");
            return;
        }
    
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

    // Inicializa a exibição dos veículos ao carregar a página
    carregarEstoque();
});
