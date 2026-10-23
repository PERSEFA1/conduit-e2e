import { test, expect } from "../fixtures/index";

// Тест не зависит от данных в базе: проверяется структура главной для гостя.
// Содержимое ленты (карточки, пагинация, пустая лента) проверяем отдельно
// интеграционными тестами с подменой /api/articles.
test("гость видит ленту Global Feed без вкладки Your Feed", async ({
  homePage,
}) => {
  await homePage.open();

  await expect(homePage.globalFeedButton).toBeVisible();
  await expect(homePage.yourFeedButton).toBeHidden();
});
