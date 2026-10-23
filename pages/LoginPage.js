export class LoginPage {
  constructor(page) {
    this.page = page;

    // Локаторы живут ЗДЕСЬ и больше нигде.
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessages = page.locator(".error-messages");
  }

  // --- действия ---
  async open() {
    await this.page.goto("/#/login");
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.loginButton.click();
  }

  // Композитное действие = один «пользовательский шаг»
  async login(email, password) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  // --- чтение состояния (проверку делает тест) ---
  // Сырое значение сессии в localStorage; null — сессии нет.
  async storedSession() {
    return this.page.evaluate(() => localStorage.getItem("loggedUser"));
  }
}
