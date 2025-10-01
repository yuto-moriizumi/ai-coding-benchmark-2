import { test, expect, Page } from "@playwright/test";
import { TESTUSER_FILE } from "./constants";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Logged out", () => {
  test("should require login to create a new post", async ({
    page,
  }: {
    page: Page;
  }) => {
    // ログアウト状態でトップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Add new article"ボタンをクリック
    await page.click("text=Add new article");

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL("http://localhost:3000/login");
  });

  test.describe("commenting on posts", () => {
    let testPostTitle: string;

    // テストデータのセットアップ: testuserでログインして投稿を作成
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext({
        storageState: TESTUSER_FILE,
      });
      const page = await context.newPage();

      // トップページにアクセス
      await page.goto("http://localhost:3000/");

      // "Add new article"ボタンをクリック
      await page.click("text=Add new article");

      // 新規投稿ページに遷移したことを確認
      await expect(page).toHaveURL("http://localhost:3000/new-post");

      testPostTitle = `test post for comment ${Date.now()}`;
      await page.getByLabel("Title").fill(testPostTitle);
      await page
        .getByLabel("Content")
        .fill("This is a test post for comment testing");

      // "Publish Post"ボタンをクリック
      await page.click('button:has-text("Publish Post")');

      // posts/任意の数字に遷移していることを確認
      await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/.+/);

      await context.close();
    });

    test("should require login to add a comment", async ({
      page,
    }: {
      page: Page;
    }) => {
      // ログアウト状態で記事ページにアクセス
      await page.goto("http://localhost:3000/");
      await page.click(`text=${testPostTitle}`);

      // コメントフォームが表示されていないことを確認
      await expect(page.getByLabel("Comment")).not.toBeVisible();

      // またはログインを促すメッセージが表示されていることを確認
      await expect(page.locator("body")).toContainText(
        "Please login to add a comment"
      );
    });
  });
});
