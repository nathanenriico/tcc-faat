// --------------------------------------------------------------------
// Conexão com o Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase conectado!");

// --------------------------------------------------------------------
// Função para exibir um popup de aviso (erro ou informação)
function mostrarPopupAviso(mensagem, redirecionarPara = null) {
  const popupAviso = document.createElement("div");
  popupAviso.className = "popup";
  popupAviso.id = "popupAviso";

  // Cria o botão separadamente e adiciona um listener de clique
  const botao = document.createElement("button");
  botao.textContent = "OK";
  botao.addEventListener("click", () => fecharPopupAviso(redirecionarPara));

  popupAviso.innerHTML = `
    <h3>Aviso!</h3>
    <p>${mensagem}</p>
  `;
  popupAviso.appendChild(botao);
  document.body.appendChild(popupAviso);

  setTimeout(() => {
    popupAviso.classList.add("show");
  }, 10);
}


function fecharPopupAviso(redirecionarPara = null) {
  const popupAviso = document.getElementById("popupAviso");
  if (popupAviso) {
    popupAviso.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(popupAviso);
      if (redirecionarPara) {
        window.location.href = redirecionarPara;
      }
    }, 300);
  }
}

// --------------------------------------------------------------------
// Função para criar conta e tentar o auto-login
async function criarConta() {
  console.log("✅ Botão de criar conta clicado!");
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();

  // Substituindo alert() por nosso popup personalizado
  if (!email || senha.length < 6) {
    mostrarPopupAviso("O e-mail informado é inválido ou a senha é muito curta (mínimo 6 caracteres).");
    return;
  }

  // Criação de conta via Supabase
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: senha
  });

  if (signUpError) {
    console.error("❌ Erro ao criar conta:", signUpError.message);
    mostrarPopupAviso("Erro ao criar conta: " + signUpError.message);
    return;
  }
  
  console.log("✅ Conta criada com sucesso!", signUpData);

  // Verifica se é necessário confirmar o email (caso o Supabase esteja configurado para isso)
  if (!signUpData.user.confirmed_at) {
    mostrarPopupAviso("Conta criada com sucesso! Por favor, confirme seu email antes de efetuar login.");
    return;
  }

  // Tenta o auto-login somente se o usuário estiver confirmado
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha
  });
  
  if (loginError) {
    console.error("❌ Erro ao fazer login:", loginError.message);
    mostrarPopupAviso("Conta criada, mas não foi possível fazer login: " + loginError.message);
  } else {
    console.log("✅ Login efetuado com sucesso!", loginData);
    window.location.href = "/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
  }
}

// Associa o evento de clique no botão "Criar Conta"
document.getElementById("criarContaBtn").addEventListener("click", criarConta);

// --------------------------------------------------------------------
// Código do perfil e atualização (já existente)
document.addEventListener("DOMContentLoaded", async function () {
  const profileForm = document.getElementById("profileForm");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const togglePasswordButton = document.getElementById("togglePassword");

  if (!emailField || !passwordField || !togglePasswordButton) {
    console.error("❌ Elementos do formulário não encontrados.");
    return;
  }

  // Alternar visibilidade da senha
  togglePasswordButton.addEventListener("click", function () {
    const isPasswordVisible = passwordField.type === "text";
    passwordField.type = isPasswordVisible ? "password" : "text";
    togglePasswordButton.innerHTML = isPasswordVisible ? "🔒" : "🔓";
  });

  // Buscar dados do usuário
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData || !userData.user) {
    mostrarPopupAviso("Ocorreu um erro ao carregar seu perfil. Por favor, faça login novamente.");
    return;
  }

  emailField.value = userData.user.email;
  passwordField.value = ""; // Nunca exibir a senha


  function mostrarPopupSenhaIgual() {
  const popupAviso = document.createElement("div");
  popupAviso.className = "popup";
  popupAviso.id = "popupSenhaIgual";
  popupAviso.innerHTML = `
    <h3>Aviso!</h3>
    <p>A nova senha não pode ser igual à anterior.</p>
    <a href="./editar-perfil.html" class="ok-btn">Clique aqui para redefinir sua senha</a>
    <button onclick="window.location.href='./editar-perfil.html';">OK</button>
  `;
  document.body.appendChild(popupAviso);
  setTimeout(() => {
    popupAviso.classList.add("show");
  }, 10);
}

// Dentro da função de atualização de perfil:
profileForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const novoEmail = emailField.value.trim();
  const novaSenha = passwordField.value.trim();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData || !userData.user) {
    mostrarPopupAviso("Erro ao carregar perfil. Faça login novamente.");
    return;
  }

  // Verifica se a senha é igual à anterior
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: novaSenha,
  });

  if (!loginError) {
    mostrarPopupSenhaIgual(); // Exibe o popup de aviso caso a senha seja igual
    return;
  }

  if (novaSenha.length < 6) {
    mostrarPopupAviso("Senha muito curta (mínimo 6 caracteres).", "./editar-perfil.html");
    return;
  }

  const { error: senhaError } = await supabase.auth.updateUser({ password: novaSenha });
  if (senhaError) {
    mostrarPopupAviso("Erro ao atualizar a senha: " + senhaError.message);
    return;
  }

mostrarPopupAviso("Perfil atualizado com sucesso!", "/tcc-facul-main/login-tela/login/login.html");
});
});

// --------------------------------------------------------------------
// Funções de exibição de popup de sucesso (já existente)
function mostrarPopup() {
  const popup = document.getElementById("popupSuccess");
  popup.classList.add("show");
}

function fecharPopup() {
  const popup = document.getElementById("popupSuccess");
  if (popup) {
    popup.classList.remove("show");
  }
}

// --------------------------------------------------------------------
// Popup para criação de conta (salvando email e senha no Supabase)
function mostrarPopupCriarConta() {
  const popupCriarConta = document.createElement("div");
  popupCriarConta.className = "popup";
  popupCriarConta.id = "popupCriarConta";
  popupCriarConta.innerHTML = `
    <h3>Criar Conta</h3>
    <p>Preencha os dados abaixo para criar sua conta:</p>
    <input type="email" placeholder="Seu email" id="novoEmail" required>
    <input type="password" placeholder="Sua senha (mínimo 6 caracteres)" id="novaSenha" required>
    <button id="btnCriarContaPopup">Criar Conta</button>
    <button id="btnCancelarCriarContaPopup">Cancelar</button>
  `;
  document.body.appendChild(popupCriarConta);
  popupCriarConta.classList.add("show");

  document.getElementById("btnCriarContaPopup").addEventListener("click", async () => {
    const email = document.getElementById("novoEmail").value.trim();
    const senha = document.getElementById("novaSenha").value.trim();

    if (!email || senha.length < 6) {
      mostrarPopupAviso("O e-mail informado é inválido ou a senha é muito curta (mínimo 6 caracteres).");
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email: email, password: senha });
    if (error) {
      console.error("❌ Erro ao criar conta:", error.message);
      mostrarPopupAviso("Erro ao criar conta: " + error.message);
    } else {
      console.log("✅ Conta criada com sucesso!", data);
      mostrarPopupAviso("Conta criada com sucesso! Faça login.");
      fecharPopupCriarConta();
    }
  });

document.getElementById("btnCancelarCriarContaPopup").addEventListener("click", function(){
  fecharPopupCriarConta(); // Remove o popup de criação de conta
  window.location.href = "../editar-perfil/editar-perfil.html"; // Redireciona para a página de editar perfil (ou outra URL desejada)
});
}

function fecharPopupCriarConta() {
  const popup = document.getElementById("popupCriarConta");
  if (popup) {
    document.body.removeChild(popup);
  }
}

// --------------------------------------------------------------------
// Evento único para o botão "Criar Conta" (ou "Alterar Conta")
document.getElementById("criarContaBtn").addEventListener("click", mostrarPopupCriarConta);
