import { Step, BeforeSuite, AfterSuite, AfterScenario } from "gauge-ts";
import { 
  click, closeBrowser, evaluate, goto, openBrowser, 
  press, text, textBox, write, toLeftOf, link,
  screenshot, $
} from 'taiko';
import assert = require("assert");

export default class StepImplementation {
  private backendUrl: string;
  private frontendUrl: string;

  constructor() {
    this.backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
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
    await screenshot({ path: 'reports/screenshots/' });
  }

  // ==================== REGISTRO E VERIFICAÇÃO ====================

  @Step("Dado que estou na página de registro")
  public async navegarParaRegistro() {
    await goto(`${this.frontendUrl}/register`);
  }

  @Step("Quando preencho o formulário com dados válidos")
  public async preencherFormularioRegistro() {
    const timestamp = Date.now();
    await write(`user${timestamp}`, into(textBox({ label: "Username" })));
    await write(`User${timestamp}`, into(textBox({ label: "Nome" })));
    await write(`Last${timestamp}`, into(textBox({ label: "Sobrenome" })));
    await write(`user${timestamp}@test.com`, into(textBox({ label: "E-mail" })));
    await write("Senha123", into(textBox({ label: "Senha" })));
    await write("Senha123", into(textBox({ label: "Confirmar Senha" })));
  }

  @Step("E clico em <texto>")
  public async clicarBotao(texto: string) {
    await click(text(texto));
  }

  @Step("Então devo ser redirecionado para a página de verificação")
  public async verificarRedirecionamentoVerificacao() {
    await waitForNavigation();
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
    // Implementar via API ou assumir que já existe
    await goto(`${this.frontendUrl}/login`);
  }

  @Step("Dado que meu e-mail está verificado")
  public async emailVerificado() {
    // Implementar verificação via API
  }

  @Step("Quando preencho o formulário de login com credenciais válidas")
  public async preencherLoginValido() {
    await goto(`${this.frontendUrl}/login`);
    await write("testuser", into(textBox({ label: "E-mail ou username" })));
    await write("Senha123", into(textBox({ label: "Senha" })));
  }

  @Step("Quando preencho o formulário de login com senha incorreta")
  public async preencherLoginSenhaIncorreta() {
    await goto(`${this.frontendUrl}/login`);
    await write("testuser", into(textBox({ label: "E-mail ou username" })));
    await write("SenhaErrada", into(textBox({ label: "Senha" })));
  }

  @Step("Então devo ser redirecionado para a página de usuários")
  public async verificarRedirecionamentoUsuarios() {
    await waitForNavigation();
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
    // Implementar obtenção de token via API
  }

  @Step("Quando acesso a página de verificação com o token")
  public async acessarPaginaVerificacao(token: string) {
    await goto(`${this.frontendUrl}/verify-email/${token}`);
  }

  @Step("Então meu e-mail deve ser verificado")
  public async emailVerificadoSucesso() {
    // Verificar via API se status_validacao = true
  }

  // ==================== BIBLIOTECA E LIVROS ====================

  @Step("Dado que estou autenticado")
  public async usuarioAutenticado() {
    await goto(`${this.frontendUrl}/login`);
    // Fazer login
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
    assert.ok(await text("Clean Code").exists());
  }

  // ==================== SESSÕES DE LEITURA ====================

  @Step("Quando acesso a página de iniciar sessão")
  public async acessarPaginaSessao() {
    await goto(`${this.frontendUrl}/sessions/new`);
  }

  @Step("E seleciono um livro da minha biblioteca")
  public async selecionarLivroBiblioteca() {
    await click(text("Selecionar Livro"));
    // Implementar seleção
  }

  @Step("E defino o tempo para <tempo> minutos (timer)")
  public async definirTempoTimer(tempo: string) {
    await write(tempo, into(textBox({ label: "Tempo (minutos)" })));
  }

  @Step("Então devo ver o timer regressivo na tela")
  public async verTimerRegressivo() {
    assert.ok(await text("Tempo restante").exists());
  }

  // ==================== CLUBES DO LIVRO ====================

  @Step("Quando acesso a página de clubes")
  public async acessarPaginaClubes() {
    await goto(`${this.frontendUrl}/clubs`);
  }

  @Step("E clico em <texto>")
  public async clicarElemento(texto: string) {
    await click(text(texto));
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
}
