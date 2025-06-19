// Importação do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuração do Supabase
const supabaseUrl = 'https://ixoqtbcnbpzpgwbcnlvl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3F0YmNuYnB6cGd3YmNubHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTc0NzI0NTcsImV4cCI6MjAxMzA0ODQ1N30.Iy0vxXPwgwCM-Dq-V_jKCZvnDQP-LcBWe6_XXLJQnlM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para mostrar popup
function mostrarPopup(mensagem, redirectUrl = null) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.innerHTML = `
    <h3>Aviso</h3>
    <p>${mensagem}</p>
    <button onclick="fecharPopup(this.parentElement, '${redirectUrl}')">OK</button>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add("show"), 10);
}

function fecharPopup(popup, redirectUrl) {
  popup.classList.remove("show");
  setTimeout(() => {
    document.body.removeChild(popup);
    if (redirectUrl && redirectUrl !== 'null') {
      window.location.href = redirectUrl;
    }
  }, 300);
}

// Verificar se email existe no banco
async function verificarEmailExiste(email) {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'senha_temporaria_teste'
    });
    
    // Se erro é "Invalid login credentials", email existe mas senha está errada
    return error && error.message.includes('Invalid login credentials');
  } catch {
    return false;
  }
}

// Criar nova conta
async function criarNovaConta(email, senha) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha
  });

  if (error) {
    mostrarPopup("Erro ao criar conta: " + error.message);
    return false;
  }
  
  mostrarPopup("Conta criada com sucesso!", "../cadastro/cadastro.html");
  return true;
}

// Alterar senha existente
async function alterarSenha(email, novaSenha) {
  // Fazer login temporário para alterar senha
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: email,
    password: 'senha_atual' // Seria necessário pedir senha atual
  });

  if (loginError) {
    // Se não conseguir fazer login, tentar reset de senha
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    if (!resetError) {
      mostrarPopup("Email de recuperação enviado para alterar sua senha.");
    }
    return;
  }

  // Atualizar senha
  const { error: updateError } = await supabase.auth.updateUser({ 
    password: novaSenha 
  });
  
  if (updateError) {
    if (updateError.message.includes('same') || updateError.message.includes('identical')) {
      mostrarPopup("Digite uma senha diferente da anterior.");
      return;
    }
    mostrarPopup("Erro ao atualizar senha: " + updateError.message);
    return;
  }
  
  mostrarPopup("Senha atualizada com sucesso!", "../../../login-tela/login/login.html");
}

// Evento principal
document.addEventListener("DOMContentLoaded", function () {
  const criarContaBtn = document.getElementById("criarContaBtn");
  const atualizarSenhaBtn = document.getElementById("atualizarSenhaBtn");
  const profileForm = document.getElementById("profileForm");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const togglePasswordButton = document.getElementById("togglePassword");

  // Alternar visibilidade da senha
  togglePasswordButton?.addEventListener("click", function () {
    const isPasswordVisible = passwordField.type === "text";
    passwordField.type = isPasswordVisible ? "password" : "text";
    togglePasswordButton.innerHTML = isPasswordVisible ? "🔒" : "🔓";
  });

  // Botão atualizar senha
  const handleAtualizarSenha = async function(e) {
    e?.preventDefault();
    
    const email = emailField.value.trim();
    const senha = passwordField.value.trim();

    if (!email || !senha) {
      mostrarPopup("Por favor, preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      mostrarPopup("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Fazer login com email e tentar atualizar senha
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (loginError) {
        // Se erro de credenciais, email existe mas senha diferente - criar nova conta
        if (loginError.message.includes('Invalid login credentials')) {
          await criarNovaConta(email, senha);
        } else {
          mostrarPopup("Erro: " + loginError.message);
        }
        return;
      }

      // Login bem-sucedido, mas senha é a mesma
      mostrarPopup("Digite uma senha diferente da anterior.");
      
    } catch (error) {
      mostrarPopup("Erro ao processar: " + error.message);
    }
  };

  // Event listeners
  atualizarSenhaBtn?.addEventListener("click", handleAtualizarSenha);
  profileForm?.addEventListener("submit", handleAtualizarSenha);

  criarContaBtn?.addEventListener("click", async function() {
    const email = emailField.value.trim();
    const senha = passwordField.value.trim();

    if (!email || !senha) {
      mostrarPopup("Por favor, preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      mostrarPopup("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    await criarNovaConta(email, senha);
  });
});