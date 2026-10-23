export class HomePage {
  constructor(page) {
    this.page = page;
    this.articlePreviews = page.locator(".article-preview");
    this.yourFeedButton = page.getByRole("button", { name: "Your Feed" });
    this.globalFeedButton = page.getByRole("button", { name: "Global Feed" });
  }

  async open() {
    await this.page.goto("/");
  }

  firstArticle() {
    return this.articlePreviews.first();
  }
}
