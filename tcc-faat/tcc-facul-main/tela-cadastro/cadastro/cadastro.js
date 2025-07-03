import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";


const supabase = createClient(supabaseUrl, supabaseKey)

 document.addEventListener("DOMContentLoaded", function () {
    const stockSection = document.querySelector(".stock-list");
    const cadastrarBtn = document.getElementById("cadastrar");
    const popupSucesso = document.getElementById("popupSucesso");
    const btnFecharPopup = document.getElementById("btnFecharPopup");

    // Garante que o popup fique escondido ao carregar a página
    popupSucesso.style.display = "none";
    const elemento = document.querySelector(".algum-elemento");

if (elemento) {
    elemento.style.display = "block"; // Só executa se o elemento existir
} else {
    console.error("❌ Elemento não encontrado no DOM!");
}


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
   async function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
    console.log("Salvando carro no Supabase...")

    const { data, error } = await supabase.from('carro').insert([
        {
            fabricante,
            modelo,
            ano: parseInt(ano),
            quantidade_dono: parseInt(quantidadeDono),
            km: parseInt(km),
            preco: parseFloat(preco),
            descricao,
            imagens
        }
    ]);

    if (error) {
        console.error("Erro ao salvar carro:", error.message);
        return;
    }

    console.log("Carro salvo no Supabase:", data);
    carregarEstoque(); 
    mostrarPopupSucesso();
}

// Função auxiliar para converter strings de preço para número
// Esta função remove o "R$", os espaços, os pontos de milhar e substitui a vírgula pelo ponto decimal.
function convertPrice(priceStr) {
  if (!priceStr) return 0;
  // Remove o símbolo R$, espaços. Em seguida, remove os pontos e troca a vírgula por ponto.
  let cleaned = priceStr.toString()
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
}

async function salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens) {
    console.log("Salvando carro no Supabase...");

    // Aqui usamos o valor de preco já convertido (number)
    const { data, error } = await supabase.from('carro').insert([
        {
            fabricante,
            modelo,
            ano: parseInt(ano),
            quantidade_dono: parseInt(quantidadeDono),
            km: parseInt(km),
            preco: preco,  // já é um número correto
            descricao,
            imagens
        }
    ]);

    if (error) {
        console.error("Erro ao salvar carro:", error.message);
        return;
    }

    console.log("Carro salvo no Supabase:", data);
    carregarEstoque(); 
    mostrarPopupSucesso();
}async function carregarEstoque() {
    const stockSection = document.querySelector(".stock-list");
    if (!stockSection) {
        console.error("❌ Elemento `.stock-list` não encontrado!");
        return;
    }

    console.log("🚗 Carregando estoque do Supabase...");
    const { data: carrosSalvos, error } = await supabase.from('carro').select('*');

    if (error) {
        console.error("❌ Erro ao carregar estoque:", error.message);
        return;
    }

    stockSection.innerHTML = carrosSalvos.length === 0 ? "<p>Nenhum carro no estoque.</p>" : "";

    carrosSalvos.forEach((carro) => {
        const stockCard = document.createElement("div");
        stockCard.classList.add("stock-card");

        stockCard.dataset.fabricante = carro.fabricante || "Não informado";
        stockCard.dataset.modelo = carro.modelo || "Não informado";
        stockCard.dataset.ano = carro.ano || "0";
        stockCard.dataset.preco = carro.preco ? carro.preco.toString() : "0";
        stockCard.dataset.km = carro.km || "Não informado";

        stockCard.innerHTML = `
            <div class="car-image">
                <img src="${carro.imagens?.[0] || 'img/fallback.png'}" 
                     alt="${carro.modelo}" 
                     style="width: 100%; border-radius: 8px;">
            </div>
            <h3>${carro.fabricante} ${carro.modelo}</h3>
            <p><strong>Ano:</strong> ${carro.ano}</p>
            <p><strong>KM:</strong> ${carro.km}</p>
            <p><strong>Preço:</strong> ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(carro.preco)}</p>
            <p class="descricao"><strong>Descrição:</strong> ${carro.descricao}</p>
            <button class="whatsapp-btn">Contato WhatsApp</button>
            <button class="financiamento-btn">Simular Financiamento</button>
        `;

        stockSection.appendChild(stockCard);

        // 🔥 **Evento do botão de WhatsApp colocado DENTRO do loop, onde `stockCard` existe**
        const whatsappBtn = stockCard.querySelector(".whatsapp-btn");
        whatsappBtn.addEventListener("click", function () {
            const mensagem = `Olá, estou interessado no ${carro.fabricante} ${carro.modelo}, ano ${carro.ano}, com ${carro.km} KM.`;
            const numeroWhatsapp = "5511985162224"; // Ajuste para o número correto
            const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
            window.open(urlWhatsapp, "_blank");
        });
    });

    // 🔥 **Evento delegado para capturar cliques no botão de financiamento**
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("financiamento-btn")) {
            event.preventDefault();

            const stockCard = event.target.closest(".stock-card");
            if (!stockCard) {
                console.error("❌ `stockCard` não encontrado! O botão pode estar fora da estrutura correta.");
                return;
            }

            const fabricante = stockCard.dataset.fabricante || "Não informado";
            const modelo = stockCard.dataset.modelo || "Não informado";
            const ano = stockCard.dataset.ano || "0";
            const preco = stockCard.dataset.preco ? parseFloat(stockCard.dataset.preco) : 0;
            const km = stockCard.dataset.km || "Não informado";

            console.log("✅ Atributos capturados antes de gerar a URL:", { fabricante, modelo, ano, preco, km });

            if (!fabricante || !modelo || !ano || !preco || !km) {
                console.error("❌ Algum valor está `undefined`! Verifique se os atributos foram corretamente atribuídos.");
                return;
            }

            const urlFinal = new URL("./financiamento.html", window.location.origin);
            urlFinal.searchParams.set("fabricante", fabricante);
            urlFinal.searchParams.set("modelo", modelo);
            urlFinal.searchParams.set("ano", ano);
            urlFinal.searchParams.set("preco", preco);
            urlFinal.searchParams.set("km", km);

            console.log("✅ URL final gerada:", urlFinal.toString());

            alert(`URL gerada antes do redirecionamento: ${urlFinal.toString()}`);

            window.location.assign(urlFinal.toString());
        }
    });
}

// 🔥 **Garante que o estoque seja carregado antes de adicionar os eventos**
document.addEventListener("DOMContentLoaded", carregarEstoque);


// Evento de cadastro de veículos
cadastrarBtn.addEventListener("click", function () {
    console.log("Botão cadastrar clicado!");

    const fabricante = document.getElementById("fabricante").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const quantidadeDono = document.getElementById("quantidadeDono").value.trim();
    const km = document.getElementById("km").value.trim();

    // Pega o valor do preço e converte corretamente usando a função convertPrice
    const precoInput = document.getElementById("preco").value.trim();
    const preco = convertPrice(precoInput);

    const descricao = document.getElementById("descricao").value.trim();
    const imagemInput = document.getElementById("imagemCarro").files;

    // Validação: verifica se todos os campos foram preenchidos (preço 0 é considerado inválido)
    if (!fabricante || !modelo || !ano || !quantidadeDono || !km || preco === 0 || !descricao) {
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
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        imagens.push("img/fallback.png");
        salvarCarro(fabricante, modelo, ano, quantidadeDono, km, preco, descricao, imagens);
    }
});

// Inicializa a exibição dos veículos ao carregar a página
carregarEstoque();
});
