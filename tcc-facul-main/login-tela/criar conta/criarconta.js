import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("✅ Supabase conectado!");

let ultimoCadastro = 0;

// 🔥 **Capturar evento de envio do formulário**
document.getElementById("cadastroForm").addEventListener("submit", cadastrarUsuario);

async function cadastrarUsuario(event) {
    event.preventDefault();
    console.log("✅ Botão de cadastro foi clicado!");

    const email = document.getElementById("novoEmail").value;
    const senha = document.getElementById("novaSenha").value;

    if (!validarEmail(email) || senha.length < 6) {
        alert("E-mail inválido ou senha muito curta (mínimo 6 caracteres).");
        return;
    }

    // 🔥 **Verifica se já passou tempo suficiente desde o último cadastro**
    const agora = Date.now();
    if (agora - ultimoCadastro < 7000) { // 7 segundos
        alert("Aguarde alguns segundos antes de tentar novamente.");
        return;
    }
    ultimoCadastro = agora;

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
        mostrarPopupSucesso();
        setTimeout(() => {
            window.location.href = "../login/login.html";
        }, 2000);
    }
}

// 🔥 **Validação simples de email**
function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

// 🔥 **Exibir Popup de Sucesso**
function mostrarPopupSucesso() {
    document.getElementById("popupSucesso").style.display = "block";
}

// 🔥 **Redirecionar para tela de login**
document.getElementById("voltarLogin").addEventListener("click", function () {
    window.location.href = "../login/login.html";
});
