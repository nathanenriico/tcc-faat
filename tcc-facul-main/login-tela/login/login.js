// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function() {
  // Evento de clique no texto "Esqueceu ou Alterar Senha?"
  const alterarSenhaLink = document.getElementById("alterarSenhaLink");
  if (alterarSenhaLink) {
    alterarSenhaLink.onclick = function() {
      mostrarPopupAlterarSenha();
    };
  }

  // Evento para o botão criar conta
  document.getElementById('criarConta').onclick = function() {
    window.location.href = "../criar conta/criarconta.html";
  };
});


  // Preenche os campos automaticamente se os dados estiverem salvos
  const emailSalvo = localStorage.getItem("email");
  const senhaSalva = localStorage.getItem("senha");
  const lembrarSenha = localStorage.getItem("lembrarSenha");

  if (lembrarSenha === "true") {
    if (emailSalvo) {
      document.getElementById("email").value = emailSalvo;
    }
    if (senhaSalva) {
      document.getElementById("senha").value = senhaSalva;
    }
    document.getElementById("lembrar").checked = true; // Mantém o checkbox marcado
  }

  // Adiciona evento ao checkbox "Lembrar Senha"
  const lembrarCheckbox = document.getElementById("lembrar");
  lembrarCheckbox.addEventListener("change", function () {
    if (lembrarCheckbox.checked) {
      // Salva o email e senha no localStorage
      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      localStorage.setItem("email", email);
      localStorage.setItem("senha", senha);
      localStorage.setItem("lembrarSenha", "true");
    } else {
      // Remove os dados salvos do localStorage
      localStorage.removeItem("email");
      localStorage.removeItem("senha");
      localStorage.setItem("lembrarSenha", "false");
    }
  });

// Função para o envio do formulário de login
document.getElementById('loginForm').onsubmit = function(event) {
  event.preventDefault();

  let email = document.getElementById("email").value;
  let senha = document.getElementById("senha").value;

  let emailSalvo = localStorage.getItem("email");
  let senhaSalva = localStorage.getItem("senha");

  if (!emailSalvo || !senhaSalva) {
    mostrarPopup(); // Popup para informar que não há conta cadastrada
  } else if (email === emailSalvo && senha === senhaSalva) {
    mostrarPopupSucesso(); // Popup de sucesso
  } else {
    mostrarPopupErro(); // Popup de erro
  }
};

// Função para abrir o popup de alteração de senha
function mostrarPopupAlterarSenha() {
  const popupAlterarSenha = document.createElement("div");
  popupAlterarSenha.className = "popup";
  popupAlterarSenha.id = "popupAlterarSenha";

  popupAlterarSenha.innerHTML = `
      <h3>Alterar Senha</h3>
      <p>Insira seu email para receber um link de alteração de senha:</p>
      <input type="email" placeholder="Seu email" id="emailAlteracao" required>
      <button onclick="enviarAlteracaoSenha()">Enviar</button>
      <button onclick="fecharPopupAlterarSenha()">Cancelar</button>
  `;

  document.body.appendChild(popupAlterarSenha);

  // Exibe o popup com animação
  popupAlterarSenha.classList.add("show");
}

// Função para fechar o popup de alteração de senha
function fecharPopupAlterarSenha() {
  const popup = document.getElementById("popupAlterarSenha");
  if (popup) {
    document.body.removeChild(popup);
  }
}

// Função para enviar alteração de senha
function enviarAlteracaoSenha() {
  const emailAlteracao = document.getElementById("emailAlteracao").value;
  const emailSalvo = localStorage.getItem("email");

  if (emailAlteracao === emailSalvo) {
    alert("Um email foi enviado com instruções para alterar sua senha.");
    fecharPopupAlterarSenha();
  } else {
    alert("Email não cadastrado. Tente novamente.");
  }
}

// Função para alternar a visualização da senha
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

// Função para abrir o popup de aviso
function mostrarPopup() {
  const popup = document.getElementById("popupAviso");
  popup.classList.add("show");

  // Aguarda 2 segundos antes de redirecionar
  setTimeout(() => {
    window.location.href = "/tcc-facul-main/tcc-facul-main/login-tela/login/login.html";
  }, 2000); // 2000 ms = 2 segundos
}

function fecharPopupAviso() {
  // Fecha o popup ao remover a classe "show"
  document.getElementById("popupAviso").classList.remove("show");

  // Redireciona para a página de login
  window.location.href = "/tcc-facul-main/tcc-facul-main/login-tela/login/login.html";
}

// Função para fechar o popup de aviso
function fecharPopup() {
  document.getElementById("popupAviso").classList.remove("show");
  window.location.href = "../criar conta/criarconta.html"; // Redireciona para a página de criar conta
}

// Função para abrir o popup de erro
function mostrarPopupErro() {
  document.getElementById("popupErro").classList.add("show");
}

// Função para fechar o popup de erro
function fecharPopupErro() {
  document.getElementById("popupErro").classList.remove("show");
}

// Função para abrir o popup de sucesso
function mostrarPopupSucesso() {
  document.getElementById("popupSucesso").classList.add("show");
}

// Função para fechar o popup de sucesso e redirecionar
function fecharPopup() {
  document.getElementById("popupSucesso").style.display = "none";
  window.location.href = "/tcc-facul-main/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
}
