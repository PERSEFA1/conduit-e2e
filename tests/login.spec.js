import { randomUUID } from "node:crypto";
import { test, expect } from "../fixtures/index";

test.describe("Вход (API)", () => {
  test("Корректный логин возвращает 200 и рабочий токен", async ({
    request,
    testUser,
  }) => {
    const res = await request.post("/api/users/login", {
      data: { user: { email: testUser.email, password: testUser.password } },
    });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.username).toBe(testUser.username);
    expect(body.user.token).toBeTruthy();

    // Токен из ответа входа должен работать на защищённом эндпоинте.
    const meRes = await request.get("/api/user", {
      headers: { Authorization: `Token ${body.user.token}` },
    });
    expect(meRes.status()).toBe(200);

    const me = await meRes.json();
    expect(me.user.email).toBe(testUser.email);
    expect(me.user.username).toBe(testUser.username);
  });

  test("Неверный пароль возвращает 422", async ({ request, testUser }) => {
    const res = await request.post("/api/users/login", {
      data: {
        user: { email: testUser.email, password: "totally-wrong-password" },
      },
    });

    expect(res.status()).toBe(422);

    const body = await res.json();
    expect(body.errors.body).toEqual(["Wrong email/password combination"]);
  });

  test(
    "Неизвестный email отвечает так же, как неверный пароль (422)",
    {
      annotation: {
        type: "issue",
        description:
          "Сейчас 404 и другое сообщение: по ответам можно узнавать зарегистрированные email",
      },
    },
    async ({ request }) => {
      // Ожидаемое (безопасное) поведение; до исправления тест ожидаемо падает.
      test.fail();

      const res = await request.post("/api/users/login", {
        data: {
          user: {
            email: `nobody_${randomUUID()}@example.test`,
            password: "12345",
          },
        },
      });

      expect(res.status()).toBe(422);

      const body = await res.json();
      expect(body.errors.body).toEqual(["Wrong email/password combination"]);
    },
  );
});
