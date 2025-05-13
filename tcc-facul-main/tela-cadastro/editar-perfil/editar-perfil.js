import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase conectado!");
document.getElementById("criarContaBtn").addEventListener("click", criarConta);

async function criarConta() {
    console.log("✅ Botão de criar conta clicado!");

    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;

    if (!email || senha.length < 6) {
        alert("E-mail inválido ou senha muito curta (mínimo 6 caracteres).");
        return;
    }

    // 🔥 **Criar usuário no Supabase**
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: senha
    });

    if (error) {
        console.error("❌ Erro ao criar conta:", error.message);
        alert("Erro ao criar conta: " + error.message);
    } else {
        console.log("✅ Conta criada com sucesso!", data);
        alert("Conta criada com sucesso! Faça login.");
    }
}
document.getElementById("voltarCadastroBtn").addEventListener("click", function () {
    window.location.href = "../cadastro/cadastro.html";
});



document.addEventListener("DOMContentLoaded", async function () {
    const profileForm = document.getElementById("profileForm");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const togglePasswordButton = document.getElementById("togglePassword");

    // 🔥 **Carregar dados do usuário logado**
    const { data: user, error } = await supabase.auth.getUser();
    if (error || !user) {
        alert("Erro ao carregar perfil. Faça login novamente.");
        return;
    }

    emailField.value = user.user.email;
    passwordField.value = ""; // A senha nunca deve ser exibida

    // 🔥 **Atualizar perfil no Supabase**
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log("✅ Botão de salvar perfil clicado!");

        const novoEmail = emailField.value;
        const novaSenha = passwordField.value;

        if (!novoEmail || novaSenha.length < 6) {
            alert("E-mail inválido ou senha muito curta (mínimo 6 caracteres).");
            return;
        }

        const updates = {};
        if (novoEmail) updates.email = novoEmail;
        if (novaSenha) updates.password = novaSenha;

        const { error: updateError } = await supabase.auth.updateUser(updates);

        if (updateError) {
            console.error("❌ Erro ao atualizar perfil:", updateError.message);
            alert("Erro ao atualizar perfil: " + updateError.message);
        } else {
            console.log("✅ Perfil atualizado com sucesso!");
            mostrarPopup();
        }
    });

    // 🔥 **Alternar visibilidade da senha**
    togglePasswordButton.addEventListener("click", function () {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            togglePasswordButton.textContent = "🔓";
        } else {
            passwordField.type = "password";
            togglePasswordButton.textContent = "🔒";
        }
    });
});

// 🔥 **Exibir popup de sucesso**
function mostrarPopup() {
    const popup = document.getElementById("popupSuccess");
    popup.classList.add("show");
}

// 🔥 **Fechar popup**
function fecharPopup() {
    const popup = document.getElementById("popupSuccess");
    if (popup) {
        popup.classList.remove("show");
    }
}


