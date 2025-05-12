document.addEventListener("DOMContentLoaded", function () {
    console.log("Query string recebida: ", window.location.search);
  
    // Recupera os parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    let preco = params.get("preco");
    let imagemCarro = params.get("imagem");
  
    // Debug: exibe os valores obtidos pela URL
    console.log("Preco obtido via URL:", preco);
    console.log("Imagem obtida via URL:", imagemCarro);
  
    // Se não houver preço na URL, tenta obter do localStorage ou usa valores padrão
    if (!preco || isNaN(parseFloat(preco))) {
        const carrosSalvos = JSON.parse(localStorage.getItem("carrosDisponiveis")) || [];
        console.log("Carros salvos no localStorage:", carrosSalvos);
        if (carrosSalvos.length > 0) {
            preco = carrosSalvos[carrosSalvos.length - 1].preco;
            imagemCarro = carrosSalvos[carrosSalvos.length - 1].imagens[0];
        } else {
            preco = "0";
            imagemCarro = "img/fallback.png";
        }
    }
    
    // Converte o preço para número e exibe no console
    const precoFloat = parseFloat(preco);
    console.log("Preço final utilizado:", precoFloat);
  
    // Atualiza os campos com o valor formatado e a imagem do carro
    let valorTotalInput = document.getElementById("valorTotal");
    if (valorTotalInput) {
        valorTotalInput.value = precoFloat.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    } else {
        console.error("Elemento com id 'valorTotal' não encontrado");
    }
  
    let carImage = document.getElementById("carImage");
    if (carImage) {
        carImage.src = imagemCarro;
    } else {
        console.error("Elemento com id 'carImage' não encontrado");
    }
  
    const entradaInput = document.getElementById("entrada");
    const valorFinanciadoInput = document.getElementById("valorFinanciado");
  
    // Define a entrada automática como 10% do valor total
    const entradaValor = precoFloat * 0.1;
    if (entradaInput) {
        entradaInput.value = entradaValor.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL'
        });
    } else {
        console.error("Elemento com id 'entrada' não encontrado");
    }
  
    // Calcula o valor a financiar
    const financedValue = precoFloat - entradaValor;
    if (valorFinanciadoInput) {
        valorFinanciadoInput.value = financedValue.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL'
        });
    } else {
        console.error("Elemento com id 'valorFinanciado' não encontrado");
    }
    
    // Define valores padrão para parcelas e taxa de juros se estiverem vazios
    const parcelasInput = document.getElementById("parcelas");
    if (parcelasInput) {
        if (!parcelasInput.value || isNaN(parseInt(parcelasInput.value))) {
            parcelasInput.value = 12; // Exemplo: 12 parcelas
        }
        parcelasInput.addEventListener("change", calcularFinanciamento);
    } else {
        console.error("Elemento com id 'parcelas' não encontrado");
    }
  
    const taxaJurosInput = document.getElementById("taxaJuros");
    if (taxaJurosInput) {
        if (!taxaJurosInput.value) {
            taxaJurosInput.value = 0; // Exemplo: 0% de juros
        }
        taxaJurosInput.addEventListener("input", calcularFinanciamento);
    } else {
        console.error("Elemento com id 'taxaJuros' não encontrado");
    }
  
    // Atualiza o valor financiado quando a entrada é alterada
    if (entradaInput) {
        entradaInput.addEventListener("input", function () {
            const numericEntrada = parseBRL(entradaInput.value);
            if (!isNaN(numericEntrada) && numericEntrada >= 0 && numericEntrada <= precoFloat) {
                const newFinanciado = precoFloat - numericEntrada;
                if (valorFinanciadoInput) {
                    valorFinanciadoInput.value = newFinanciado.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL'
                    });
                }
            } else {
                if (valorFinanciadoInput) {
                    valorFinanciadoInput.value = precoFloat.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL'
                    });
                }
            }
            calcularFinanciamento();
        });
    }
  
    // Recalcula automaticamente os valores ao carregar a página
    calcularFinanciamento();
});
  
// Função auxiliar para converter uma string formatada em BRL para número
function parseBRL(valueStr) {
    if (!valueStr) return NaN;
    // Remove "R$", espaços e outros caracteres indesejados
    valueStr = valueStr.replace("R$", "").trim();
    // Remove os pontos (separador de milhar)
    valueStr = valueStr.replace(/\./g, "");
    // Substitui a vírgula decimal pelo ponto
    valueStr = valueStr.replace(",", ".");
    return parseFloat(valueStr);
}
  
// Função para recalcular o financiamento
function calcularFinanciamento() {
    const valorFinanciadoStr = document.getElementById("valorFinanciado").value;
    const valorFinanciado = parseBRL(valorFinanciadoStr);
    const parcelas = parseInt(document.getElementById("parcelas").value);
    
    let taxaJurosStr = document.getElementById("taxaJuros").value.trim();
    taxaJurosStr = taxaJurosStr.replace(",", "."); // Permite o uso de vírgula
    const taxaJuros = parseFloat(taxaJurosStr) / 100;
  
    if (isNaN(valorFinanciado) || isNaN(parcelas) || taxaJuros < 0) {
        console.warn("Algum valor está inválido para o cálculo do financiamento");
        return;
    }
    
    // Cálculo usando juros simples
    const jurosAcumulados = valorFinanciado * taxaJuros * parcelas;
    const valorFinal = valorFinanciado + jurosAcumulados;
    const valorParcela = valorFinal / parcelas;
  
    const valorParcelaInput = document.getElementById("valorParcela");
    if (valorParcelaInput) {
        valorParcelaInput.value = valorParcela.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL'
        });
    }
  
    const valorFinalInput = document.getElementById("valorFinal");
    if (valorFinalInput) {
        valorFinalInput.value = valorFinal.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL'
        });
    }
}