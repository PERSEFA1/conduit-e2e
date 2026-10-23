import { test, expect } from "../fixtures/index";

test.describe("Страница статьи: автор", () => {
  test.use({ authenticated: true });

  test.beforeEach(async ({ articlePage, article }) => {
    await articlePage.open(article.slug);
  });

  test("показывает заголовок, текст и ссылку на профиль автора", async ({
    articlePage,
    article,
    testUser,
  }) => {
    await expect(articlePage.title(article.title)).toBeVisible();
    await expect(articlePage.body(article.body)).toBeVisible();

    // Блок автора отрисован сверху и снизу страницы.
    await expect(articlePage.authorLinks(testUser.username)).toHaveCount(2);
    await expect(articlePage.authorLink(testUser.username)).toHaveAttribute(
      "href",
      `#/profile/${testUser.username}`,
    );
  });

  test("даёт кнопки Edit и Delete и форму комментария", async ({
    articlePage,
  }) => {
    await expect(articlePage.editButton).toBeVisible();
    await expect(articlePage.deleteButton).toBeVisible();
    await expect(articlePage.commentInput).toBeVisible();
    await expect(articlePage.postCommentButton).toBeVisible();
  });
});

test.describe("Страница статьи: гость", () => {
  test("видит статью, но не видит управляющие элементы", async ({
    articlePage,
    article,
  }) => {
    await articlePage.open(article.slug);

    await expect(articlePage.title(article.title)).toBeVisible();
    await expect(articlePage.body(article.body)).toBeVisible();

    await expect(articlePage.editButton).toBeHidden();
    await expect(articlePage.deleteButton).toBeHidden();
    await expect(articlePage.commentInput).toBeHidden();
    await expect(articlePage.postCommentButton).toBeHidden();
  });
});
