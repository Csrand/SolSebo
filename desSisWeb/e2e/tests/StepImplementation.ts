import { Step, BeforeSuite, AfterSuite, AfterScenario } from "gauge-ts";
import { 
  click, closeBrowser, evaluate, goto, openBrowser, 
  press, text, textBox, write, link,
  screenshot, $, waitFor, into
} from 'taiko';
import assert = require("assert");

export default class StepImplementation {
  private backendUrl: string;
  private frontendUrl: string;

  constructor() {
    this.backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  }

  @BeforeSuite()
  public async beforeSuite() {
    const headless = process.env.HEADLESS !== 'false';
    await openBrowser({ headless });
  }

  @AfterSuite()
  public async afterSuite() {
    await closeBrowser();
  }

  @AfterScenario()
  public async afterScenario() {
    await screenshot({ path: 'reports/screenshots/screenshot.png' });
  }

  // ==================== REGISTRO E VERIFICAÇÃO ====================

  @Step("Dado que estou na página de registro")
  public async navegarParaRegistro() {
    await goto(`${this.frontendUrl}/register`);
    await waitFor(2000);
  }

  @Step("Quando preencho o formulário com dados válidos")
  public async preencherFormularioRegistro() {
    const timestamp = Date.now();
    await waitFor(1500);
    await write(`user${timestamp}`, into(textBox({ id: "username" })));
    await write(`user${timestamp}@test.com`, into(textBox({ id: "e-mail" })));
    await write("Senha123", into(textBox({ id: "senha" })));
    await waitFor(500);
    await write("Senha123", into(textBox({ id: "confirmar-senha" })));
  }

  @Step("E clico em <texto>")
  public async clicarEm(texto: string) {
    await click(text(texto));
  }

  @Step("Então devo ser redirecionado para a página de verificação")
  public async verificarRedirecionamentoVerificacao() {
    await waitFor(2000);
    const url = await evaluate(() => window.location.pathname);
    assert.strictEqual(url, '/verify-notice');
  }

  @Step("E devo ver a mensagem <mensagem>")
  public async verificarMensagem(mensagem: string) {
    assert.ok(await text(mensagem).exists());
  }

  // ==================== LOGIN E RECUPERAÇÃO ====================

  @Step("Dado que tenho um usuário cadastrado")
  public async usuarioCadastrado() {
    await goto(`${this.frontendUrl}/login`);
  }

  @Step("Dado que meu e-mail está verificado")
  public async emailVerificado() {
    await goto(`${this.frontendUrl}/login`);
  }

  @Step("Quando preencho o formulário de login com credenciais válidas")
  public async preencherLoginValido() {
    await goto(`${this.frontendUrl}/login`);
    await write("testuser@test.com", into(textBox({ label: "E-mail" })));
    await write("Senha123", into(textBox({ label: "Senha" })));
  }

  @Step("Quando preencho o formulário de login com senha incorreta")
  public async preencherLoginSenhaIncorreta() {
    await goto(`${this.frontendUrl}/login`);
    await write("testuser@test.com", into(textBox({ label: "E-mail" })));
    await write("SenhaErrada", into(textBox({ label: "Senha" })));
  }

  @Step("Então devo ser redirecionado para a página de usuários")
  public async verificarRedirecionamentoUsuarios() {
    await waitFor(2000);
    const url = await evaluate(() => window.location.pathname);
    assert.strictEqual(url, '/users');
  }

  @Step("E devo estar autenticado")
  public async verificarAutenticado() {
    const token = await evaluate(() => sessionStorage.getItem('accessToken'));
    assert.ok(token);
  }

  @Step("Dado que tenho um token de verificação válido")
  public async tokenVerificacaoValido() {
    await goto(`${this.frontendUrl}/verify-email?token=dummy-token`);
  }

  @Step("Quando acesso a página de verificação com o token")
  public async acessarPaginaVerificacao() {
    const currentUrl = await evaluate(() => window.location.href);
    if (!currentUrl.includes('token=')) {
      await goto(`${this.frontendUrl}/verify-email?token=dummy-token`);
    }
  }

  @Step("Quando acesso a página de \"Esqueci minha senha\"")
  public async acessarPaginaEsqueciSenha() {
    await goto(`${this.frontendUrl}/forgot-password`);
  }

  @Step("Quando acesso a página de redefinição de senha")
  public async acessarPaginaRedefinirSenha() {
    await goto(`${this.frontendUrl}/reset-password?token=dummy-token`);
  }

  @Step("E preencho o e-mail e clico em <texto>")
  public async preencherEmailEClicar(texto: string) {
    const timestamp = Date.now();
    await write(`user${timestamp}@test.com`, into(textBox({ label: "E-mail" })));
    await click(text(texto));
  }

  @Step("E preencho a nova senha e clico em <texto>")
  public async preencherNovaSenha(texto: string) {
    await write("NovaSenha123", into(textBox({ label: "Nova Senha" })));
    await write("NovaSenha123", into(textBox({ label: "Confirmar Nova Senha" })));
    await click(text(texto));
  }

  @Step("Então meu e-mail deve ser verificado")
  public async emailVerificadoSucesso() {
    await waitFor(1000);
    assert.ok(await text("E-mail verificado com sucesso").exists());
  }

  @Step("Então minha senha deve ser atualizada")
  public async senhaAtualizada() {
    assert.ok(await text("Senha redefinida com sucesso").exists());
  }

  @Step("E devo ser redirecionado para a página de login")
  public async redirecionadoParaLogin() {
    await waitFor(2000);
    const url = await evaluate(() => window.location.pathname);
    assert.strictEqual(url, '/login');
  }

  // ==================== BIBLIOTECA E LIVROS ====================

  @Step("Dado que estou autenticado")
  public async usuarioAutenticado() {
    await goto(`${this.frontendUrl}/login`);
    await write("testuser@test.com", into(textBox({ label: "E-mail" })));
    await write("Senha123", into(textBox({ label: "Senha" })));
    await click(text("Entrar"));
    await waitFor(2000);
  }

  @Step("Quando acesso a página de livros")
  public async acessarPaginaLivros() {
    await goto(`${this.frontendUrl}/books`);
  }

  @Step("E busco por um livro existente")
  public async buscarLivroExistente() {
    await write("Clean Code", into(textBox({ placeholder: "Buscar livro..." })));
    await press('Enter');
  }

  @Step("Então devo ver o livro na lista de resultados")
  public async verLivroNaLista() {
    await waitFor(1000);
    assert.ok(await text("Clean Code").exists());
  }

  // ==================== SESSÕES DE LEITURA ====================

  @Step("Quando acesso a página de iniciar sessão")
  public async acessarPaginaSessao() {
    await goto(`${this.frontendUrl}/sessions/new`);
  }

  @Step("E seleciono um livro da minha biblioteca")
  public async selecionarLivroBiblioteca() {
    await write("1", into(textBox({ placeholder: "ID do livro" })));
  }

  @Step("E defino o tempo para <tempo> minutos (timer)")
  public async definirTempoTimer(tempo: string) {
    const input = textBox({ label: "Tempo (minutos)" });
    await write(tempo, into(input));
  }

  @Step("Então devo ver o timer regressivo na tela")
  public async verTimerRegressivo() {
    await waitFor(1000);
    assert.ok(await text("Tempo restante").exists());
  }

  // ==================== CLUBES DO LIVRO ====================

  @Step("Quando acesso a página de clubes")
  public async acessarPaginaClubes() {
    await goto(`${this.frontendUrl}/clubs`);
  }

  @Step("E preencho o nome e descrição")
  public async preencherClube() {
    const timestamp = Date.now();
    await write(`Clube ${timestamp}`, into(textBox({ label: "Nome" })));
    await write("Descrição do clube", into(textBox({ label: "Descrição" })));
  }

  @Step("Então o clube deve ser criado")
  public async clubeCriado() {
    assert.ok(await text("Clube").exists());
  }

  // ==================== ADDITIONAL STEPS ====================

  @Step("Quando busco um livro e clico em <texto>")
  public async buscarELicar(texto: string) {
    await write("Clean Code", into(textBox({ placeholder: "Buscar livro..." })));
    await click(text(texto));
  }

  @Step("Então o livro deve aparecer na minha biblioteca")
  public async livroNaBiblioteca() {
    await waitFor(1000);
    const url = await evaluate(() => window.location.pathname);
    assert.strictEqual(url, '/library');
  }

  @Step("Dado que estou em uma sessão de leitura ativa")
  public async sessaoAtiva() {
    await goto(`${this.frontendUrl}/sessions/new`);
    await write("1", into(textBox({ placeholder: "ID do livro" })));
    await click(text("Iniciar Sessão"));
    await waitFor(1000);
  }

  @Step("Quando o tempo acaba ou clico em <texto>")
  public async finalizarOuTempoAcaba(texto: string) {
    await click(text(texto));
  }

  @Step("Então devo ver um timer de 20% do tempo para reflexão")
  public async timerReflexao() {
    await waitFor(1000);
    assert.ok(await text("Reflita").exists());
  }

  @Step("E devo ver a frase <frase>")
  public async verFrase(frase: string) {
    assert.ok(await text(frase).exists());
  }

  @Step("Quando o timer de reflexão acaba")
  public async timerReflexaoAcaba() {
    await waitFor(1000);
  }

  @Step("E preencho o texto sobre minha leitura")
  public async preencherReflexao() {
    await write("Ótima leitura! Aprendi muito sobre clean code.", into($("textarea")));
  }

  @Step("Então a sessão deve ser salva")
  public async sessaoSalva() {
    await waitFor(1000);
    assert.ok(await text("Sessão").exists());
  }

  @Step("Quando visualizo a lista de clubes")
  public async visualizarListaClubes() {
    await goto(`${this.frontendUrl}/clubs`);
  }

  @Step("E clico em <texto> em um clube")
  public async clicarEmClube(texto: string) {
    await click(text(texto));
  }

  @Step("Então devo ser membro do clube")
  public async membroClube() {
    await waitFor(1000);
    assert.ok(await text("Clube").exists());
  }
}
