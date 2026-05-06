# Login e Recuperação de Senha

## Login com credenciais válidas
* Dado que meu e-mail está verificado
* Quando preencho o formulário de login com credenciais válidas
* E clico em "Entrar"
* Então devo ser redirecionado para a página de usuários
* E devo estar autenticado

## Login com senha incorreta
* Dado que tenho um usuário cadastrado
* Quando preencho o formulário de login com senha incorreta
* E clico em "Entrar"
* Então devo ver a mensagem de erro "Senha incorreta"

## Solicitação de recuperação de senha
* Dado que tenho um usuário cadastrado
* Quando acesso a página de "Esqueci minha senha"
* E preencho o e-mail e clico em "Enviar"
* Então devo ver a mensagem "E-mail de recuperação enviado"

## Redefinição de senha com token válido
* Dado que tenho um token de recuperação válido
* Quando acesso a página de redefinição de senha
* E preencho a nova senha e clico em "Redefinir"
* Então minha senha deve ser atualizada
* E devo ser redirecionado para a página de login
