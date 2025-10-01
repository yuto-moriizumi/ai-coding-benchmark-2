import { test, expect } from "@playwright/test";
import { loadUsernames } from "./constants";

// Load usernames that were generated during setup
const { testUsername } = loadUsernames();

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Authentication error cases", () => {
  test.only("should show error when trying to register with existing username", async ({
    page,
  }) => {
    console.log(`[TEST] Using username: ${testUsername}`);

    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Register"リンクをクリック
    await page.click("text=Register");

    // /register画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/register");

    // 既存のユーザー名で登録フォームに入力
    await page.getByLabel("Username").fill(testUsername);
    await page.getByLabel("Password").fill("anypassword");

    // "Register"ボタンをクリック
    await page.click('button:has-text("Register")');

    // エラーメッセージが表示されることを確認
    await expect(page.locator("body")).toContainText(/user already exists/i);
  });

  test("should show error when trying to login with incorrect password", async ({
    page,
  }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Login"リンクをクリック
    await page.click("text=Login");

    // /login画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/login");

    // 正しいユーザー名と間違ったパスワードでログインフォームに入力
    await page.getByLabel("Username").fill(testUsername);
    await page.getByLabel("Password").fill("wrongpassword123");

    // "Login"ボタンをクリック
    await page.click('button:has-text("Login")');

    // エラーメッセージが表示されることを確認
    await expect(page.locator("body")).toContainText(
      /username or password is incorrect/i
    );
  });
});
