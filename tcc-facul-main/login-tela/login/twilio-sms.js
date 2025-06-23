// Função para enviar SMS usando a API do Twilio
import { twilioConfig } from './twilio-config.js';

export async function enviarSMS(numeroTelefone, mensagem) {
  try {
    // Formatar número para padrão internacional
    if (!numeroTelefone.startsWith('+')) {
      numeroTelefone = '+55' + numeroTelefone.replace(/\D/g, '');
    }
    
    // Parâmetros para a API do Twilio
    const params = new URLSearchParams();
    params.append('To', numeroTelefone);
    params.append('From', twilioConfig.phoneNumber);
    params.append('Body', mensagem);
    
    // URL da API do Twilio
    const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`;
    
    // Credenciais em Base64
    const auth = btoa(`${twilioConfig.accountSid}:${twilioConfig.authToken}`);
    
    // Enviar requisição para a API do Twilio
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: params
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS enviado com sucesso!', data);
      return { success: true, data };
    } else {
      console.error('❌ Erro ao enviar SMS:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error('❌ Erro ao enviar SMS:', error);
    return { success: false, error };
  }
}