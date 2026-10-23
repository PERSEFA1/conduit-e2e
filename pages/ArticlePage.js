export class ArticlePage {
  constructor(page) {
    this.page = page;
    this.root = page.locator(".article-page"); // скоуп на контейнер статьи

    // .first() — кнопки Delete/Edit встречаются дважды: сверху и снизу
    this.deleteButton = this.root
      .getByRole("button", { name: "Delete Article" })
      .first();
    this.editButton = this.root
      .getByRole("button", { name: "Edit Article" })
      .first();
    this.commentInput = this.root.getByRole("textbox", {
      name: "Write a comment...",
    });
    this.postCommentButton = this.root.getByRole("button", {
      name: "Post Comment",
    });
  }

  async open(slug) {
    await this.page.goto(`/#/article/${slug}`);
  }

  // Фабрики локаторов — там, где значение динамическое
  title(text) {
    return this.root.getByRole("heading", { name: text });
  }

  body(text) {
    return this.root.getByText(text);
  }

  // Блок с автором на странице отрисован дважды (сверху и снизу), в каждом
  // есть ссылка-аватар и ссылка с именем (a.author). Нас интересуют ссылки с именем.
  authorLinks(username) {
    return this.root.locator("a.author", { hasText: username });
  }

  authorLink(username) {
    return this.authorLinks(username).first();
  }
}
