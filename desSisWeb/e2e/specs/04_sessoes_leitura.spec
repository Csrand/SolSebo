# Sessões de Leitura

## Início de sessão com timer
* Dado que estou autenticado
* Quando acesso a página de iniciar sessão
* E seleciono um livro da minha biblioteca
* E defino o tempo para 25 minutos (timer)
* E clico em "Iniciar Sessão"
* Então devo ver o timer regressivo na tela

## Finalização de sessão e reflexão
* Dado que estou em uma sessão de leitura ativa
* Quando o tempo acaba ou clico em "Finalizar"
* Então devo ver um timer de 20% do tempo para reflexão
* E devo ver a frase "Reflita sobre o que você leu"
* Quando o timer de reflexão acaba
* E preencho o texto sobre minha leitura
* E clico em "Finalizar Sessão"
* Então a sessão deve ser salva
* E devo ver a mensagem "Sessão salva com sucesso"
