document.addEventListener("DOMContentLoaded", function () {
    const profileForm = document.getElementById("profileForm");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");
    const togglePasswordButton = document.getElementById("togglePassword");

    // Inicializa os campos de perfil com valores salvos no localStorage
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("senha");

    if (savedEmail) {
        emailField.value = savedEmail;
    }
    if (savedPassword) {
        passwordField.value = savedPassword;
    }

    // Salva as informações do perfil no localStorage e mostra o popup
    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = emailField.value;
        const password = passwordField.value;

        // Verificar campos antes de salvar
        if (email.trim() === "" || password.trim() === "") {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Salva os novos valores no localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("senha", password);

        // Mostra o popup de sucesso
        mostrarPopup();
    });

    // Alterna entre mostrar e ocultar a senha
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

// Função para exibir o popup
function mostrarPopup() {
    const popup = document.getElementById("popupSuccess");
    popup.classList.add("show");
  }
  
  function fecharPopup() {
    const popup = document.getElementById("popupSuccess");
    popup.classList.remove("show");
  }  
