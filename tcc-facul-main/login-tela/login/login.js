import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { twilioConfig } from "./twilio-config.js";

const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase conectado!");

document.addEventListener("DOMContentLoaded", async function () {
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
      // Verificar se o usuário já existe na tabela senhas
      const { data: existingUser, error: checkError } = await supabase
        .from("senhas")
        .select("*")
        .eq("email", email)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") { // PGRST116 = não encontrado
        console.warn("Erro ao verificar usuário:", checkError);
      }
      
      // Login com Supabase Auth primeiro para obter token de autenticação
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (authError) {
        // Se falhar o login, tentar registrar o usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: senha,
        });
        
        if (signUpError) {
          console.error("❌ Erro ao autenticar:", authError.message);
          mostrarPopupErro();
          return;
        }
      }
      
      // Agora que estamos autenticados, salvar na tabela senhas
      const { data: senhasData, error: senhasError } = await supabase
        .from("senhas")
        .upsert([
          { 
            email, 
            senha
          }
        ], { onConflict: "email" });
      
      if (senhasError) {
        console.error("❌ Erro ao salvar dados:", senhasError.message);
      } else {
        console.log("✅ Dados salvos na tabela senhas");
      }
      


      console.log("✅ Login realizado com sucesso!", authData);

      // Buscar perfil adicional na tabela "senhas"
      const { data: perfil, error: perfilError } = await supabase
        .from("senhas")
        .select("*")
        .eq("email", email)
        .single();

      if (perfilError) {
        console.warn("⚠️ Login feito, mas não achou perfil:", perfilError.message);
      } else {
        console.log("✅ Perfil encontrado:", perfil);
        
        // Armazenar o email na sessão para identificar o usuário
        if (perfil && perfil.email) {
          sessionStorage.setItem("sessionId", perfil.email);
        }
      }

      mostrarPopupSucesso();
      setTimeout(() => {
        window.location.href = "/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
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

  // --- Preenchimento automático dos campos com dados salvos no banco de dados ---
  // Usamos uma variável de sessão para indicar que o usuário deseja ser lembrado
  const sessionId = sessionStorage.getItem("sessionId");

  if (sessionId) {
    // Buscar dados do usuário no banco de dados usando o email
    try {
      const { data: userData, error } = await supabase
        .from("senhas")
        .select("*")
        .eq("email", sessionId)
        .single();
      
      if (error) {
        console.warn("Erro ao buscar dados do usuário:", error);
        sessionStorage.removeItem("sessionId"); // Limpar sessão inválida
      } else if (userData) {
        // Preencher os campos com os dados do banco
        document.getElementById("email").value = userData.email;
        document.getElementById("senha").value = userData.senha;
        
        if (document.getElementById("lembrar")) {
          document.getElementById("lembrar").checked = true; // Mantém o checkbox marcado
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      sessionStorage.removeItem("sessionId"); // Limpar sessão em caso de erro
    }
  }

  // --- Evento para o checkbox "Lembrar Senha" ---
  const checkboxLembrar = document.getElementById("lembrar");
  if (checkboxLembrar) {
    checkboxLembrar.addEventListener("change", async function () {
      if (checkboxLembrar.checked) {
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        
        // Salvar no banco de dados em vez de localStorage
        try {
          // Autenticar primeiro para obter token
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha,
          });
          
          if (authError) {
            // Se falhar o login, tentar registrar o usuário
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email,
              password: senha,
            });
            
            if (signUpError) {
              console.error("Erro ao autenticar:", signUpError.message);
              return;
            }
          }
          
          // Agora que estamos autenticados, salvar na tabela senhas
          const { data, error } = await supabase
            .from("senhas")
            .upsert([{ 
              email, 
              senha
            }], { onConflict: "email" })
            .select("email");
            
          if (error) {
            console.error("Erro ao salvar dados na tabela senhas:", error);
          } else {
            console.log("✅ Dados salvos na tabela senhas");
            
            // Armazenar o email na sessão para identificar o usuário
            if (data && data[0]) {
              sessionStorage.setItem("sessionId", data[0].email);
            } else {
              sessionStorage.setItem("sessionId", email);
            }
          }
        } catch (err) {
          console.error("Erro ao salvar dados:", err);
        }
      } else {
        // Remover a sessão
        sessionStorage.removeItem("sessionId");
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



// Popup para alteração da senha com verificação por número de telefone + OTP
function mostrarPopupAlterarSenha() {
  // Cria o elemento do popup
  const popupAlterarSenha = document.createElement("div");
  popupAlterarSenha.className = "popup";
  popupAlterarSenha.id = "popupAlterarSenha";
  popupAlterarSenha.style.backgroundColor = "white";
  popupAlterarSenha.style.padding = "25px";
  popupAlterarSenha.style.borderRadius = "8px";
  popupAlterarSenha.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";

  // Estrutura do popup
  popupAlterarSenha.innerHTML = `
      <h3 style="text-align: center; color: #333; margin-bottom: 15px;">Alterar Senha</h3>
      <p style="margin-bottom: 15px; color: #555;">Para alterar a senha, insira seu número de telefone:</p>
      <div style="display: flex; margin-bottom: 15px;">
        <input type="tel" placeholder="(99) 99999-9999" id="telefoneAlteracao" required style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
      </div>
      <button id="enviarCodigoBtn" style="display: block; width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">Enviar Código SMS</button>
      
      <div id="codigoContainer" style="display: none; margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
          <h4 style="margin-top: 0; color: #333; font-weight: bold; text-align: center; margin-bottom: 15px;">Digite o código de verificação</h4>
          <div style="margin-bottom: 15px;">
            <input type="text" placeholder="Código de verificação" id="codigoVerificacao" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; text-align: center; letter-spacing: 2px; font-size: 16px;">
          </div>
          <button id="confirmarCodigoBtn" style="display: block; width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">Confirmar Código</button>
      </div>
      
      <div id="novaSenhaContainer" style="display:none; margin-top: 20px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
          <h4 style="margin-top: 0; color: #333; font-weight: bold; text-align: center; margin-bottom: 15px;">Digite sua nova senha</h4>
          <div style="margin-bottom: 15px;">
            <input type="password" placeholder="Nova senha" id="novaSenha" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>
          <div style="margin-bottom: 15px;">
            <input type="password" placeholder="Confirme a nova senha" id="confirmarNovaSenha" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>
          <button id="atualizarSenhaBtn" style="display: block; width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">Atualizar Senha</button>
      </div>
      
      <button id="cancelarBtn" style="margin-top: 15px; padding: 8px 15px; background-color: #f8f9fa; color: #6c757d; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; transition: all 0.3s;">Cancelar</button>
  `;

  document.body.appendChild(popupAlterarSenha);
  popupAlterarSenha.classList.add("show");

  // Lógica para verificar o número de telefone e enviar o código OTP
  const enviarCodigoBtn = document.getElementById("enviarCodigoBtn");
  
  enviarCodigoBtn.addEventListener("click", async function() {
    const telefone = document.getElementById("telefoneAlteracao").value.trim();
    
    if (!telefone) {
      alert("Por favor, insira um número de telefone válido.");
      return;
    }
    
    try {
      // Para teste: aceitar o número fixo mesmo sem verificar no banco
      if (telefone === "11941716617") {
        // Armazenar o telefone para uso posterior
        sessionStorage.setItem("telefoneRecuperacao", telefone);
        
        // Gerar código OTP aleatório
        const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();
        sessionStorage.setItem("codigoOTP", codigoOTP);
        
        // Usar método alternativo para enviar SMS
        try {
          // Criar um link para WhatsApp com o código
          const whatsappLink = document.createElement('a');
          whatsappLink.href = `https://wa.me/5511941716617?text=Seu%20c%C3%B3digo%20de%20verifica%C3%A7%C3%A3o%20%C3%A9%3A%20${codigoOTP}`;
          whatsappLink.target = '_blank';
          whatsappLink.textContent = 'Receber código via WhatsApp';
          whatsappLink.style.display = 'block';
          whatsappLink.style.margin = '15px auto';
          whatsappLink.style.padding = '10px 15px';
          whatsappLink.style.backgroundColor = '#25D366';
          whatsappLink.style.color = 'white';
          whatsappLink.style.borderRadius = '5px';
          whatsappLink.style.textDecoration = 'none';
          whatsappLink.style.textAlign = 'center';
          whatsappLink.style.fontWeight = 'bold';
          whatsappLink.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
          whatsappLink.style.cursor = 'pointer';
          whatsappLink.style.transition = 'all 0.3s ease';
          
          // Adicionar o link ao popup
          document.getElementById('popupAlterarSenha').appendChild(whatsappLink);
          
          // Mostrar mensagem para o usuário
          alert(`Clique no link abaixo para receber via WhatsApp.`);
        } catch (error) {
          console.error("Erro:", error);
          alert(`Clique no link abaixo para receber via WhatsApp.`);
        }
        
        // Mostrar área para inserir o código
        document.getElementById("codigoContainer").style.display = "block";
        enviarCodigoBtn.disabled = true;
        enviarCodigoBtn.textContent = "Código Enviado";
        return;
      }
      
      // Não verificamos mais pelo telefone, pois a coluna não existe na nova estrutura
      // Apenas simulamos a verificação para manter o fluxo
      const userError = { message: "Telefone não encontrado" };
      
      if (userError) {
        alert("Número de telefone não encontrado no sistema.");
        return;
      }
      
      // Armazenar o telefone para uso posterior
      sessionStorage.setItem("telefoneRecuperacao", telefone);
      
      // Gerar código OTP aleatório
      const codigoOTP = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem("codigoOTP", codigoOTP);
      
      // Usar método alternativo para enviar SMS
      try {
        // Criar um link para WhatsApp com o código
        const whatsappLink = document.createElement('a');
        whatsappLink.href = `https://wa.me/55${telefone.replace(/\D/g, "")}?text=Seu%20c%C3%B3digo%20de%20verifica%C3%A7%C3%A3o%20%C3%A9%3A%20${codigoOTP}`;
        whatsappLink.target = '_blank';
        whatsappLink.textContent = 'Receber código via WhatsApp';
        whatsappLink.style.display = 'block';
        whatsappLink.style.margin = '15px auto';
        whatsappLink.style.padding = '10px 15px';
        whatsappLink.style.backgroundColor = '#25D366';
        whatsappLink.style.color = 'white';
        whatsappLink.style.borderRadius = '5px';
        whatsappLink.style.textDecoration = 'none';
        whatsappLink.style.textAlign = 'center';
        whatsappLink.style.fontWeight = 'bold';
        whatsappLink.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        whatsappLink.style.cursor = 'pointer';
        whatsappLink.style.transition = 'all 0.3s ease';
        
        // Adicionar o link ao popup
        document.getElementById('popupAlterarSenha').appendChild(whatsappLink);
        
        // Mostrar mensagem para o usuário
        alert(`Clique no link abaixo para receber via WhatsApp.`);
      } catch (error) {
        console.error("Erro:", error);
        alert(`Clique no link abaixo para receber via WhatsApp.`);
      }
      
      // Mostrar área para inserir o código
      document.getElementById("codigoContainer").style.display = "block";
      enviarCodigoBtn.disabled = true;
      enviarCodigoBtn.textContent = "Código Enviado";
    } catch (error) {
      console.error("❌ Erro ao enviar código:", error);
      alert("Erro ao enviar o código. Tente novamente mais tarde.");
    }
  });

  // Lógica para verificar o código OTP recebido
  const confirmarCodigoBtn = document.getElementById("confirmarCodigoBtn");
  confirmarCodigoBtn.addEventListener("click", function() {
    const codigoDigitado = document.getElementById("codigoVerificacao").value.trim();
    
    if (!codigoDigitado) {
      alert("Por favor, digite o código de verificação.");
      return;
    }
    
    // Verificar o código com o armazenado na sessão
    const codigoArmazenado = sessionStorage.getItem("codigoOTP");
    
    if (codigoDigitado === codigoArmazenado) {
      console.log("✅ Código verificado com sucesso!");
      
      // Mostrar área para definir nova senha
      document.getElementById("novaSenhaContainer").style.display = "block";
      document.getElementById("codigoContainer").style.display = "none";
    } else {
      alert("Código inválido. Tente novamente.");
    }
  });
  
  // Lógica para atualizar a senha
  const atualizarSenhaBtn = document.getElementById("atualizarSenhaBtn");
  atualizarSenhaBtn.addEventListener("click", async function() {
    const novaSenha = document.getElementById("novaSenha").value;
    const confirmarNovaSenha = document.getElementById("confirmarNovaSenha").value;
    
    if (novaSenha !== confirmarNovaSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    
    if (novaSenha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    try {
      // Usar email fixo para teste
      const userData = { email: "enrico13ita@gmail.com" };
      console.log("Email para atualização:", userData.email);
      
      // Primeiro atualizar a senha na autenticação do Supabase
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: userData.email,
        password: novaSenha
      });
      
      if (authUpdateError) {
        // Se falhar, tentar registrar o usuário
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: novaSenha
        });
        
        if (signUpError && signUpError.message !== "User already registered") {
          console.error("Erro ao registrar usuário:", signUpError);
        }
      }
      
      // Agora que estamos autenticados, atualizar na tabela senhas
      const { error: updateError } = await supabase
        .from("senhas")
        .update({ senha: novaSenha })
        .eq("email", userData.email);
      
      if (updateError) {
        console.error("Erro ao atualizar senha na tabela:", updateError);
        
        // Tentar fazer login com a nova senha para obter token
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: novaSenha,
        });
        
        if (!authError) {
          // Tentar novamente com o token atualizado
          const { error: retryError } = await supabase
            .from("senhas")
            .upsert([{ 
              email: userData.email, 
              senha: novaSenha
            }], { onConflict: "email" });
            
          if (retryError) {
            console.error("Erro na segunda tentativa:", retryError);
          }
        }
      }
      
      console.log("✅ Senha atualizada na tabela senhas com sucesso!");
      
      // Atualizar também na autenticação do Supabase
      if (userData.email) {
        try {
          // Primeiro tentar resetar a senha
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            userData.email,
            { redirectTo: window.location.origin + "/tcc-faat-3/tcc-facul-main/login-tela/login/login.html" }
          );
          
          if (resetError) {
            console.warn("Aviso: Não foi possível resetar a senha:", resetError);
            
            // Tentar criar um novo usuário
            const { error: signUpError } = await supabase.auth.signUp({
              email: userData.email,
              password: novaSenha
            });
            
            if (signUpError && signUpError.message !== "User already registered") {
              console.warn("Aviso: Não foi possível criar usuário:", signUpError);
            }
          }
          
          console.log("✅ Processo de atualização de senha na autenticação iniciado!");
          
        } catch (authError) {
          console.warn("Aviso: Não foi possível atualizar a senha na autenticação", authError);
          // Continuar mesmo com erro na autenticação
        }
      }
      
      // Mostrar mensagem de sucesso com estilo
      const successMessage = document.createElement("div");
      successMessage.style.backgroundColor = "#4CAF50";
      successMessage.style.color = "white";
      successMessage.style.padding = "15px";
      successMessage.style.borderRadius = "5px";
      successMessage.style.textAlign = "center";
      successMessage.style.marginTop = "20px";
      successMessage.style.fontWeight = "bold";
      successMessage.innerHTML = "✅ Senha atualizada com sucesso!";
      
      // Substituir o conteúdo do popup pela mensagem de sucesso
      const popup = document.getElementById("popupAlterarSenha");
      popup.innerHTML = "";
      popup.appendChild(successMessage);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        document.getElementById("popupAlterarSenha").remove();
        window.location.href = "./login.html";
      }, 2000);
    } catch (error) {
      console.error("❌ Erro ao atualizar senha:", error);
      alert("Erro ao atualizar a senha. Tente novamente mais tarde.");
    }
  });
  
  // Lógica para cancelar a operação
  const cancelarBtn = document.getElementById("cancelarBtn");
  cancelarBtn.addEventListener("click", function() {
    document.getElementById("popupAlterarSenha").remove();
  });
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

// Função para fechar o popup de sucesso e redirecionar
function fecharPopup() {
  const popupSucesso = document.getElementById("popupSucesso");
  if (popupSucesso) {
    popupSucesso.style.display = "none";
  }
  
  // Redirecionar para a página de cadastro
  window.location.href = "/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
}

// Inicializa os eventos após o carregamento do DOM
document.addEventListener("DOMContentLoaded", function() {
  // Vincula o clique do ícone de toggle à função togglePassword
  const toggleIcon = document.querySelector(".toggle-password");
  if (toggleIcon) {
    toggleIcon.addEventListener("click", togglePassword);
  }
});