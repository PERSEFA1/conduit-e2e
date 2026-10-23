export class Header {
  constructor(page) {
    this.page = page;
    this.root = page.locator(".navbar");

    this.newArticleLink = this.root.getByRole("link", { name: "New Article" });
    this.userMenu = this.root.locator(".nav-item.dropdown");
    this.userMenuItems = this.root.locator(".dropdown-item");
  }

  // username в хедере — это <div class="nav-link dropdown-toggle">, а не <a>.
  // Поэтому getByText, а не getByRole("link"). Не переименовываем в usernameLink,
  // чтобы имя метода не врало о реальной разметке.
  usernameLabel(username) {
    return this.root.getByText(username, { exact: true });
  }

  async openUserMenu() {
    await this.userMenu.click();
  }
}
