import { test as base, expect, request } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { LoginPage } from "../pages/LoginPage";
import { Header } from "../pages/Header";
import { ArticlePage } from "../pages/ArticlePage";
import { HomePage } from "../pages/HomePage";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const shortId = (length) => randomUUID().replace(/-/g, "").slice(0, length);

// Тело ответа читаем ДО dispose() контекста: после dispose ответ недоступен,
// и вместо причины ошибки приходит "Response has been disposed".
async function expectStatus(res, expected, action) {
  if (res.status() !== expected) {
    throw new Error(
      `${action}: ожидался статус ${expected}, получен ${res.status()} — ${await res.text()}`,
    );
  }
}

// Подставляет сессию в localStorage до загрузки страницы.
async function seedAuth(page, { token, email, username }) {
  await page.addInitScript(
    ({ token, email, username }) => {
      // Только один раз за жизнь вкладки: после logout/reload флаг уже стоит,
      // и скрипт не перетирает текущее состояние приложения.
      if (sessionStorage.getItem("__e2e_auth_seeded") === "1") return;
      sessionStorage.setItem("__e2e_auth_seeded", "1");

      localStorage.setItem(
        "loggedUser",
        JSON.stringify({
          headers: { Authorization: `Token ${token}` },
          isAuth: true,
          loggedUser: { email, username, bio: null, image: null, token },
        }),
      );
    },
    { token, email, username },
  );
}

export const test = base.extend({
  // ------------------------------------------------------------------
  // Опция: авторизован ли браузер. По умолчанию — гость.
  // Включается явно: test.use({ authenticated: true }) в файле или describe.
  // ------------------------------------------------------------------
  authenticated: [false, { option: true }],

  // ------------------------------------------------------------------
  // testUser: один на воркер, создаётся через API
  // ------------------------------------------------------------------
  testUser: [
    async ({}, use) => {
      const id = shortId(12);
      const user = {
        username: `e2e_${id}`,
        email: `e2e_${id}@example.test`,
        password: "12345",
      };

      const api = await request.newContext({ baseURL: BASE_URL });
      let token;
      try {
        const res = await api.post("/api/users", { data: { user } });
        await expectStatus(res, 201, "регистрация тестового пользователя");
        const body = await res.json();
        token = body.user.token;
      } finally {
        await api.dispose();
      }

      await use({ ...user, token });
    },
    { scope: "worker" },
  ],

  // ------------------------------------------------------------------
  // page: переопределяем встроенную фикстуру. Авторизация зависит только
  // от опции `authenticated`, а не от того, какие POM запросил тест.
  // Цена: testUser регистрируется на воркере и для гостевых тестов (один POST).
  // ------------------------------------------------------------------
  page: async ({ page, authenticated, testUser }, use) => {
    if (authenticated) await seedAuth(page, testUser);
    await use(page);
  },

  // ------------------------------------------------------------------
  // article: создаётся от имени testUser, удаляется после теста.
  // Тег уникален для теста: параллельные тесты не создают один и тот же
  // новый тег одновременно. Для воспроизведения гонки на общих тегах:
  //   $env:E2E_SHARED_TAGS=1   (и перед прогоном очистить таблицу Tags)
  // ------------------------------------------------------------------
  article: async ({ testUser }, use) => {
    const id = shortId(8);
    const headers = { Authorization: `Token ${testUser.token}` };
    const tagList = process.env.E2E_SHARED_TAGS
      ? ["e2e", "auto"]
      : [`e2e-${id}`];

    const api = await request.newContext({ baseURL: BASE_URL });
    try {
      const createRes = await api.post("/api/articles", {
        data: {
          article: {
            title: `E2E Article ${id}`,
            description: "Created by Playwright fixture",
            body: "Test body content",
            tagList,
          },
        },
        headers,
      });
      await expectStatus(createRes, 201, "создание статьи");
      const { article } = await createRes.json();

      await use(article);

      // 404 допустим: тест мог удалить статью сам.
      const delRes = await api.delete(`/api/articles/${article.slug}`, {
        headers,
      });
      if (!delRes.ok() && delRes.status() !== 404) {
        throw new Error(
          `удаление статьи: статус ${delRes.status()} — ${await delRes.text()}`,
        );
      }
    } finally {
      await api.dispose();
    }
  },

  // ------------------------------------------------------------------
  // Page Objects
  // ------------------------------------------------------------------
  loginPage: async ({ page }, use) => await use(new LoginPage(page)),
  header: async ({ page }, use) => await use(new Header(page)),
  articlePage: async ({ page }, use) => await use(new ArticlePage(page)),
  homePage: async ({ page }, use) => await use(new HomePage(page)),
});

export { expect };
