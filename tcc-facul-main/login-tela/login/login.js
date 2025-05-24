emailjs.init("ZM5qXLEfWCO_-bGYS"); // Inicializa o EmailJS com o User ID fornecido

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase conectado!");

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Página de login carregada!");

  // --- Formulário de login combinado ---
 const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    console.log("Email digitado:", email);
    console.log("Senha digitada:", senha);

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // Login com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) {
        console.error("❌ Erro ao autenticar:", authError.message);
        mostrarPopupErro(); // Ou alert(authError.message);
        return;
      }

      console.log("✅ Login realizado com sucesso!", authData);

      // Buscar perfil adicional na tabela "perfil de segurança"
      const { data: perfil, error: perfilError } = await supabase
        .from("perfil de segurança")
        .select("*")
        .eq("email", email)
        .single();

      if (perfilError) {
        console.warn("⚠️ Login feito, mas não achou perfil:", perfilError.message);
      } else {
        console.log("✅ Perfil encontrado:", perfil);
        localStorage.setItem("email", perfil.email);
      }

      mostrarPopupSucesso();
      setTimeout(() => {
        window.location.href = "/tcc-faat/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
      }, 2000);
    } catch (err) {
      console.error("❌ Erro inesperado:", err.message);
    }
  });
}

  // --- Evento de clique no link "Esqueceu ou Alterar Senha?" (segundo código) ---
  const alterarSenhaLink = document.getElementById("alterarSenhaLink");
  if (alterarSenhaLink) {
    alterarSenhaLink.onclick = function () {
      mostrarPopupAlterarSenha();
    };
  }

  // --- Preenchimento automático dos campos com dados salvos no localStorage ---
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
    if (document.getElementById("lembrar")) {
      document.getElementById("lembrar").checked = true; // Mantém o checkbox marcado
    }
  }

  // --- Evento para o checkbox "Lembrar Senha" ---
  const checkboxLembrar = document.getElementById("lembrar");
  if (checkboxLembrar) {
    checkboxLembrar.addEventListener("change", function () {
      if (checkboxLembrar.checked) {
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        localStorage.setItem("email", email);
        localStorage.setItem("senha", senha);
        localStorage.setItem("lembrarSenha", "true");
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("senha");
        localStorage.setItem("lembrarSenha", "false");
      }
    });
  }
});

// Popup de erro – mesclado para exibir tanto via style quanto via classe "show"
function mostrarPopupErro() {
  const popupErro = document.getElementById("popupErro");
  
  if (popupErro) {
    popupErro.style.display = "block";
    popupErro.classList.add("show");
    
    // Criando o botão OK dinamicamente
    let botaoOk = document.createElement("button");
    botaoOk.innerText = "OK";
    botaoOk.onclick = function() {
      window.location.href = "./login.html"; // Substitua pelo link desejado
    };
    
    popupErro.appendChild(botaoOk);
  } else {
    alert("Erro ao autenticar. Verifique seu email e senha.");
  }
}


// Popup de sucesso – mesclado para exibir tanto via style quanto via classe "show"
function mostrarPopupSucesso() {
  const popupSucesso = document.getElementById("popupSucesso");
  if (popupSucesso) {
    popupSucesso.style.display = "block";
    popupSucesso.classList.add("show");

    // Vincula o clique ao botão OK (se existir o botão com id "okBtn")
    const okBtn = document.getElementById("okBtn");
    if (okBtn) {
      okBtn.addEventListener("click", fecharPopup);
    }
  } else {
    alert("✅ Login realizado com sucesso!");
    fecharPopup();
  }
}

// Função para enviar o email com o código de verificação utilizando EmailJS (SDK v4)
function enviarCodigoEmail(emailDestinatario, codigo, horarioValidade) {
  const templateParams = {
    email: emailDestinatario,  // Corresponde ao {{email}} no template
    codigo: codigo,            // Alterei de 'senha' para 'codigo' para que o template exiba o código gerado
    time: horarioValidade      // Corresponde ao {{time}} no template
  };

  emailjs.send("service_l0dz2fo", "template_ecevcc8", templateParams, "ZM5qXLEfWCO_-bGYS")
    .then(function(response) {
      console.log("✅ Email enviado com sucesso!", response.status, response.text);
    }, function(error) {
      console.error("❌ Erro ao enviar o email:", error);
      alert("Erro ao enviar o email. Tente novamente mais tarde.");
    });
}

// Popup para alteração da senha com verificação do email do dono e envio de código real por email
function mostrarPopupAlterarSenha() {
  // Cria o elemento do popup
  const popupAlterarSenha = document.createElement("div");
  popupAlterarSenha.className = "popup";
  popupAlterarSenha.id = "popupAlterarSenha";

  // Estrutura do popup:
  // 1. Campo para inserir o email;
  // 2. Botão para verificar o email e enviar o código;
  // 3. Área (inicialmente oculta) para inserir o código recebido;
  // 4. Área (inicialmente oculta) para inserir a nova senha;
  // 5. Botões para cancelar.
  popupAlterarSenha.innerHTML = `
      <h3>Alterar Senha</h3>
      <p>Para alterar a senha, insira o seu email de acesso:</p>
      <input type="email" placeholder="Seu email" id="emailAlteracao" required>
      <button id="verificarEmailBtn">Verificar Email</button>
      
      <div id="codigoContainer" style="display: none; margin-top: 10px;">
          <p>Digite o código de verificação enviado ao seu email:</p>
          <input type="text" placeholder="Código de verificação" id="codigoVerificacao" required>
          <button id="confirmarCodigoBtn" style="margin-top:10px;">Confirmar Código</button>
      </div>
      
      <div id="novaSenhaContainer" style="display:none; margin-top: 10px;">
          <p>Digite sua nova senha:</p>
          <input type="password" placeholder="Nova senha" id="novaSenha" required>
          <input type="password" placeholder="Confirme a nova senha" id="confirmarNovaSenha" required>
          <button id="atualizarSenhaBtn" style="display:block; margin-top:10px;">Atualizar Senha</button>
      </div>
      
      <button id="cancelarBtn" style="margin-top:10px;">Cancelar</button>
  `;

  document.body.appendChild(popupAlterarSenha);
  popupAlterarSenha.classList.add("show");

  // Lógica para verificar o email do dono e enviar o código de verificação
  const verificarEmailBtn = document.getElementById("verificarEmailBtn");
  verificarEmailBtn.addEventListener("click", function() {
    // Pega e normaliza o email inserido
    const emailInputValue = document.getElementById("emailAlteracao").value.trim().toLowerCase();

    // Email real do dono (certifique-se de que está tudo em minúsculas)
    const ownerEmail = "enrico13ita@gmail.com".toLowerCase();

    if (emailInputValue === ownerEmail) {
      // Gera um código de 6 dígitos
      const codigoGerado = Math.floor(100000 + Math.random() * 900000).toString();
      window._codigoVerificacaoOwner = codigoGerado;
      
      // Envia o código de verificação por email
      enviarCodigoEmail(emailInputValue, codigoGerado);
      
      alert("Código de verificação enviado para seu email.");
      // Exibe o container para que o usuário insira o código recebido
      document.getElementById("codigoContainer").style.display = "block";
    } else {
      alert("Apenas o dono do site pode alterar a senha.");
    }
  });

  // Lógica para confirmar o código de verificação
  const confirmarCodigoBtn = document.getElementById("confirmarCodigoBtn");
  confirmarCodigoBtn.addEventListener("click", function() {
    const codigoDigitado = document.getElementById("codigoVerificacao").value.trim();
    if (codigoDigitado === window._codigoVerificacaoOwner) {
      alert("Código verificado com sucesso!");
      // Exibe os campos para atualização da senha
      document.getElementById("novaSenhaContainer").style.display = "block";
    } else {
      alert("Código incorreto, por favor, tente novamente.");
    }
  });

  // Lógica para atualizar a senha (simulação)
  const atualizarSenhaBtn = document.getElementById("atualizarSenhaBtn");
  atualizarSenhaBtn.addEventListener("click", function() {
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value;
    
    if (novaSenha !== confirmarNovaSenha) {
      alert("As senhas não conferem! Verifique e tente novamente.");
      return;
    }
    
    // Aqui você implementaria a lógica real de atualização (por exemplo, via backend)
    // Em vez de usar alert(), atualizamos o conteúdo do popup com a mensagem de sucesso
    popupAlterarSenha.innerHTML = `
      <h3>Senha Atualizada</h3>
      <p>Sua senha foi atualizada com sucesso!</p>
    `;
    
    // Após 2 segundos, fecha o popup automaticamente
    setTimeout(fecharPopupAlterarSenha, 2000);
  });

  // Botão de cancelar para fechar o popup
  const cancelarBtn = document.getElementById("cancelarBtn");
  cancelarBtn.addEventListener("click", fecharPopupAlterarSenha);
}

// Função para fechar o popup de alteração de senha
function fecharPopupAlterarSenha() {
  const popup = document.getElementById("popupAlterarSenha");
  if (popup) {
    document.body.removeChild(popup);
  }
}

 // Vincula o clique do ícone de toggle à função togglePassword.
  const toggleIcon = document.querySelector(".toggle-password");
  if (toggleIcon) {
    toggleIcon.addEventListener("click", togglePassword);
  }

// Função para alternar a visualização da senha
function togglePassword() {
  const senhaInput = document.getElementById("senha");
  const toggleIcon = document.querySelector(".toggle-password");
  
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleIcon.textContent = "🔓";  // ícone de cadeado aberto
  } else {
    senhaInput.type = "password";
    toggleIcon.textContent = "🔒";  // ícone de cadeado fechado
  }
}

// Função para abrir o popup de aviso
function mostrarPopup() {
  const popup = document.getElementById("popupAviso");
  if (popup) {
    popup.classList.add("show");

    // Aguarda 2 segundos antes de redirecionar
    setTimeout(() => {
      window.location.href = "/tcc-facul-main/tcc-facul-main/login-tela/login/login.html";
    }, 2000);
  }
}

// Função para fechar o popup de aviso
function fecharPopupAviso() {
  const popup = document.getElementById("popupAviso");
  if (popup) {
    popup.classList.remove("show");
  }
  window.location.href = "/tcc-facul-main/tcc-facul-main/login-tela/login/login.html";
}

// Função para fechar o popup de sucesso e redirecionar
function fecharPopup() {
  const popupSucesso = document.getElementById("popupSucesso");
  if (popupSucesso) {
    popupSucesso.style.display = "none";
  }
  window.location.href = "/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
}

