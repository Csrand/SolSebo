# Registro e Verificação de E-mail

## Registro de novo usuário
* Dado que estou na página de registro
* Quando preencho o formulário com dados válidos
* E clico em "Cadastrar"
* Então devo ser redirecionado para a página de verificação
* E devo ver a mensagem "Verifique seu e-mail"

## Verificação de e-mail com token válido
* Dado que tenho um token de verificação válido
* Quando acesso a página de verificação com o token
* Então meu e-mail deve ser verificado
* E devo ver a mensagem "E-mail verificado com sucesso"
