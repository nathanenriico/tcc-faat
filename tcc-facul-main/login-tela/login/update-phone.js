// Script para adicionar telefone ao usuário
document.addEventListener("DOMContentLoaded", async function() {
  // Importar Supabase
  const { createClient } = supabase;
  
  // Configuração do Supabase
  const supabaseUrl = 'https://jmusacsvgkeqaoorzfwa.supabase.co';
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdXNhY3N2Z2tlcWFvb3J6ZndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NzEzMjMsImV4cCI6MjA2MjE0NzMyM30.ApkfhnRPQuaF3ozZcdb0CtLziCf5O-M0EIYk4AUecrY";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Atualizar o telefone do usuário
  const { data, error } = await supabase
    .from('senhas')
    .update({ telefone: '11941716617' })
    .eq('email', 'enrico13ita@gmail.com');
  
  if (error) {
    console.error("Erro ao atualizar telefone:", error);
  } else {
    console.log("Telefone atualizado com sucesso:", data);
  }
});