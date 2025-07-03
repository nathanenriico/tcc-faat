# Configuração do Twilio para SMS

Para que o envio de SMS funcione corretamente, você precisa configurar sua conta do Twilio:

1. Crie uma conta em [Twilio](https://www.twilio.com/)
2. Obtenha seu Account SID e Auth Token no painel do Twilio
3. Compre um número de telefone no Twilio
4. Edite o arquivo `login.js` e substitua:
   - `AC_SEU_ACCOUNT_SID` pelo seu Account SID
   - `SEU_AUTH_TOKEN` pelo seu Auth Token
   - `+15551234567` pelo seu número de telefone Twilio

## Importante

- O número de telefone de destino (11941716617) deve estar verificado na sua conta Twilio se estiver usando uma conta de teste
- Para contas pagas, você pode enviar SMS para qualquer número
- O formato do número deve ser internacional (+5511941716617)

## Testando

1. Clique em "Esqueceu ou Alterar Senha?"
2. Digite o número 11941716617
3. Clique em "Enviar Código SMS"
4. Você receberá um SMS com o código de verificação
5. Digite o código na caixa de verificação
6. Defina sua nova senha