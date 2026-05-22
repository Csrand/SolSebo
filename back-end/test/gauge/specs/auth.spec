Autenticação
============

Tags: auth

Login page renders correctly
-----------------------------

* Navigate to "/login"
* Verify page heading "Login"
* Verify link "Cadastre-se"

Login shows error with wrong credentials
-----------------------------------------

* Navigate to "/login"
* Write "nonexistent@test.com" in the "E-mail" field
* Write "wrongpassword" in the "Senha" field
* Click the "Entrar" button
* Verify error message "Email ou senha inválidos"

Register page renders
----------------------

* Navigate to "/register"
* Verify page heading "Cadastro"

Forgot password page navigates from login
------------------------------------------

* Navigate to "/login"
* Click link "Esqueceu a senha?"
* Verify page heading "Recuperar Senha"

Reset password page shows error without token
----------------------------------------------

* Navigate to "/reset-password"
* Verify error message "Token de recuperação não encontrado"
