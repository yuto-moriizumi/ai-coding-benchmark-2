import { test as setup, expect } from "@playwright/test";
import { TESTUSER_FILE, ANOTHERUSER_FILE } from "./constants";

// Generate usernames once and store in environment variables
// Check if already generated to avoid regeneration
let testUsername: string;
let anotherUsername: string;

if (!process.env.TEST_USERNAME || !process.env.ANOTHER_USERNAME) {
  const timestamp = Date.now();
  testUsername = `testuser_${timestamp}`;
  anotherUsername = `anotheruser_${timestamp}`;

  process.env.TEST_USERNAME = testUsername;
  process.env.ANOTHER_USERNAME = anotherUsername;
  console.log("[SETUP] Usernames generated:", {
    testUsername,
    anotherUsername,
  });
} else {
  testUsername = process.env.TEST_USERNAME;
  anotherUsername = process.env.ANOTHER_USERNAME;
  console.log("[SETUP] Using existing usernames:", {
    testUsername,
    anotherUsername,
  });
}

setup("authenticate as testuser", async ({ page }) => {
  // トップページにアクセス
  await page.goto("http://localhost:3000/");

  // "Register"リンクをクリック
  await page.click("text=Register");

  // /register画面に遷移したことを確認
  await expect(page).toHaveURL("http://localhost:3000/register");

  // 登録フォームに入力
  await page.getByLabel("Username").fill(testUsername);
  await page.getByLabel("Password").fill("password123");

  // "Register"ボタンをクリック
  await page.click('button:has-text("Register")');

  // トップページにリダイレクトされることを確認
  await expect(page).toHaveURL("http://localhost:3000/");

  // ログイン状態を示す要素が表示されていることを確認
  await expect(page.locator("body")).toContainText(testUsername);

  // End of authentication steps.
  await page.context().storageState({ path: TESTUSER_FILE });
});

setup("authenticate as anotheruser", async ({ page }) => {
  // トップページにアクセス
  await page.goto("http://localhost:3000/");

  // "Register"リンクをクリック
  await page.click("text=Register");

  // /register画面に遷移したことを確認
  await expect(page).toHaveURL("http://localhost:3000/register");

  // 登録フォームに入力
  await page.getByLabel("Username").fill(anotherUsername);
  await page.getByLabel("Password").fill("password456");

  // "Register"ボタンをクリック
  await page.click('button:has-text("Register")');

  // トップページにリダイレクトされることを確認
  await expect(page).toHaveURL("http://localhost:3000/");

  // ログイン状態を示す要素が表示されていることを確認
  await expect(page.locator("body")).toContainText(anotherUsername);

  // End of authentication steps.
  await page.context().storageState({ path: ANOTHERUSER_FILE });
});
