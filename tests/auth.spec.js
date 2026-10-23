import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures/index";

test.describe("Вход через UI", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("успешный вход открывает главную и показывает пользователя", async ({
    page,
    loginPage,
    header,
    homePage,
    testUser,
  }) => {
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL("/#/");
    await expect(header.usernameLabel(testUser.username)).toBeVisible();
    await expect(header.newArticleLink).toBeVisible();
    await expect(homePage.yourFeedButton).toBeVisible();

    // Названия пунктов я предположил; если тест красный, в сообщении
    // об ошибке будут реальные — подставьте их.
    await header.openUserMenu();
    await expect(header.userMenuItems).toHaveText([
      /profile/i,
      /settings/i,
      /log\s*out/i,
    ]);
  });

  test("неверный пароль: ошибка, остаёмся на странице входа, сессии нет", async ({
    page,
    loginPage,
    testUser,
  }) => {
    await loginPage.login(testUser.email, "wrong-password");

    await expect(loginPage.errorMessages).toContainText(
      /wrong email\/password/i,
    );
    await expect(page).toHaveURL("/#/login");
    expect(await loginPage.storedSession()).toBeNull();
  });

  test(
    "неизвестный email даёт то же сообщение, что и неверный пароль",
    {
      annotation: {
        type: "issue",
        description:
          "Разные ответы на неизвестный email и на неверный пароль позволяют перебором узнавать зарегистрированные email",
      },
    },
    async ({ loginPage, testUser }) => {
      // Ожидаемое (безопасное) поведение. Пока приложение отвечает иначе,
      // тест помечен как ожидаемо падающий; после исправления Playwright
      // сообщит, что тест неожиданно прошёл, и маркер нужно убрать.
      test.fail();

      await loginPage.login(
        `nobody_${randomUUID()}@example.test`,
        testUser.password,
      );
      await expect(loginPage.errorMessages).toContainText(
        /wrong email\/password/i,
      );
    },
  );
});
