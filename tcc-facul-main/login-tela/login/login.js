document.getElementById('loginForm').onsubmit = function(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let senha = document.getElementById("senha").value;

  let emailSalvo = localStorage.getItem("email");
  let senhaSalva = localStorage.getItem("senha");

  if (!emailSalvo || !senhaSalva) {
    mostrarPopup();  // Se não existir conta salva
  } else if (email === emailSalvo && senha === senhaSalva) {
    mostrarPopupSucesso();  // ✅ Agora mostra o popup de sucesso
  } else {
    mostrarPopupErro(); // Se errado, mostra o popup de erro
  }
};

// Ocultar Senha
function togglePassword() {
  const senhaInput = document.getElementById("senha");
  const toggleIcon = document.querySelector(".toggle-password");
  
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleIcon.textContent = "🔓";
  } else {
    senhaInput.type = "password";
    toggleIcon.textContent = "🔒";
  }
}

// Função para abrir popup de aviso (não tem conta)
function mostrarPopup() {
  document.getElementById("popupAviso").classList.add("show");
}

// Função para fechar popup de aviso e voltar para a tela de login
function fecharPopup() {
  document.getElementById("popupAviso").classList.remove("show");
  window.location.href = "../criar conta/criarconta.html";  // Redireciona para a página de login para inserir os dados novamente
}

// Função para abrir popup de erro
function mostrarPopupErro() {
  document.getElementById("popupErro").classList.add("show");
}

// Função para fechar popup de erro
function fecharPopupErro() {
  document.getElementById("popupErro").classList.remove("show");
}

// ✅ Função para abrir popup de sucesso
function mostrarPopupSucesso() {
  document.getElementById("popupSucesso").classList.add("show");
}

// ✅ Função para fechar popup de sucesso e redirecionar
function fecharPopup() {
  document.getElementById("popupSucesso").style.display = "none";
  window.location.href = "/tcc-facul-main/tcc-facul-main/tela-cadastro/cadastro.html";
}

// Ir para a página de cadastro
document.getElementById('criarConta').onclick = function() {
  window.location.href = "../criar conta/criarconta.html";
};
