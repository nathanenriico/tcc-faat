import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase conectado!");

// 🔥 **Verificar se eventos de clique estão funcionando**
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Página de login carregada!");

    document.getElementById("loginForm").addEventListener("submit", realizarLogin);
    
});
document.addEventListener("DOMContentLoaded", function () {
    const botaoCriarConta = document.getElementById("criarContaBtn");
    
    if (botaoCriarConta) {
        botaoCriarConta.addEventListener("click", function () {
            window.location.href = "../editar-perfil/editar-perfil.html";
        });
    }
});


// 🔥 **Função de login**
async function realizarLogin(event) {
    event.preventDefault();
    console.log("✅ Botão de login clicado!");

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        console.error("❌ Erro ao autenticar:", error.message);
        mostrarPopupErro();
    } else {
        console.log("✅ Login realizado!", data);

        mostrarPopupSucesso();
        setTimeout(() => {
            window.location.href = "/tcc-faat/tcc-facul-main/tela-cadastro/cadastro/cadastro.html";
        }, 2000);
    }
}

// 🔥 **Função de redirecionamento para cadastro**
function redirecionarCadastro() {
    console.log("✅ Botão de criar conta clicado!");
    window.location.href = "../criar conta/criarconta.html";
}
function mostrarPopupErro() {
    const popupErro = document.getElementById("popupErro");
    if (popupErro) {
        popupErro.style.display = "block";
    } else {
        alert("Erro ao autenticar. Verifique seu email e senha.");
    }
}
function mostrarPopupSucesso() {
    const popupSucesso = document.getElementById("popupSucesso");
    if (popupSucesso) {
        popupSucesso.style.display = "block";
    } else {
        alert("✅ Login realizado com sucesso!");
    }
}


