function validarEmail(email) {
    // Validação simples de formato
    return /\S+@\S+\.\S+/.test(email);
  }

document.getElementById('cadastroForm').onsubmit = function(event) {
    event.preventDefault();

    let novoEmail = document.getElementById("novoEmail").value;
    let novaSenha = document.getElementById("novaSenha").value;

    if (novoEmail && novaSenha) {
        localStorage.setItem("email", novoEmail);
        localStorage.setItem("senha", novaSenha);
        mostrarPopup(); // Chama a função para mostrar o popup
    } else {
        alert("Preencha todos os campos.");
    }
};

// Função para mostrar o popup
function mostrarPopup() {
    document.getElementById("popupSucesso").style.display = "block";
}

// Função para fechar o popup
function fecharPopup() {
    document.getElementById("popupSucesso").style.display = "none";
    window.location.href = "../login/login.html"; // Caminho correto
}

// Voltar para o login
document.getElementById('voltarLogin').onclick = function() {
    window.location.href = "../login/login.html"; // Caminho correto
};