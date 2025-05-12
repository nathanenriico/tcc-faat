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
// Função para abrir o popup de alteração de senha com o novo layout
function mostrarPopupAlterarSenha() {
  // Cria o container do popup
  const popup = document.createElement("div");
  popup.id = "popupAlterarSenha";
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.padding = "20px";
  popup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
  popup.style.borderRadius = "8px";
  popup.style.width = "300px";
  popup.style.zIndex = "1000"; // Garante que o popup fique sobre outros elementos

  // Define o conteúdo do popup com um layout similar ao mostrado na imagem
  popup.innerHTML = `
    <h3 style="text-align: center; margin-bottom: 20px;">Alterar Senha</h3>
    <div style="margin-bottom: 15px;">
      <label for="senhaAtual" style="display: block; margin-bottom: 5px;">Senha Atual</label>
      <input type="password" id="senhaAtual" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Sua senha atual">
    </div>
    <div style="margin-bottom: 5px;">
      <label for="novaSenha" style="display: block; margin-bottom: 5px;">Nova Senha</label>
      <input type="password" id="novaSenha" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Nova senha">
      <small style="color: #666;">A senha deve ter pelo menos 6 caracteres</small>
    </div>
    <div style="margin-bottom: 20px; margin-top: 10px;">
      <label for="confirmarSenha" style="display: block; margin-bottom: 5px;">Confirme sua Senha</label>
      <input type="password" id="confirmarSenha" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" placeholder="Confirme a nova senha">
    </div>
    <button onclick="salvarAlteracaoSenha()" style="width: 100%; padding: 10px; background-color: #4CAF50; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Salvar</button>
    <button onclick="fecharPopupAlterarSenha()" style="width: 100%; margin-top: 10px; padding: 10px; background-color: #ccc; color: #000; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
  `;
  
  // Anexa o popup ao body
  document.body.appendChild(popup);
}

// Função para salvar a nova senha (valida os campos e atualiza o localStorage)
function salvarAlteracaoSenha() {
  const senhaAtual = document.getElementById("senhaAtual").value;
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  
  // Recupera a senha atual armazenada (simulação local; em produção, essa verificação deve ser feita no servidor)
  const senhaSalva = localStorage.getItem("senha");
  
  // Valida se a senha atual informada está correta
  if (senhaAtual !== senhaSalva) {
    alert("Senha atual incorreta.");
    return;
  }
  
  // Valida se a nova senha atende ao requisito de ter no mínimo 6 caracteres
  if (novaSenha.length < 6) {
    alert("A nova senha deve ter no mínimo 6 caracteres.");
    return;
  }
  
  // Verifica se a nova senha e a confirmação coincidem
  if (novaSenha !== confirmarSenha) {
    alert("As senhas não coincidem.");
    return;
  }
  
  // Se tudo estiver correto, atualiza a senha armazenada
  localStorage.setItem("senha", novaSenha);
  alert("Senha alterada com sucesso.");
  fecharPopupAlterarSenha();
}

// Função para fechar (remover) o popup de alteração de senha
function fecharPopupAlterarSenha() {
  const popup = document.getElementById("popupAlterarSenha");
  if (popup) {
    document.body.removeChild(popup);
  }
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
  window.location.href = "/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
}
