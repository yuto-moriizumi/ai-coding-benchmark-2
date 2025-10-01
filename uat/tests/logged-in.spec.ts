import { test, expect, Page } from "@playwright/test";
import { TESTUSER_FILE } from "./constants";

// ユニークなIDを生成するヘルパー関数
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

test.describe("Logged in", () => {
  // testuser用の認証状態を使用
  test.use({ storageState: TESTUSER_FILE });

  test("should allow a user to create a new post", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const postTitle = `my new post ${uniqueId}`;
    const postContent = `my content ${uniqueId}`;

    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // 記事が存在しないことを確認
    await expect(page.locator("body")).not.toContainText(postTitle);

    // "Add new article"ボタンをクリック
    await page.click("text=Add new article");

    // /new-post画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/new-post");

    // フォームに入力
    await page.locator("#title").fill(postTitle);
    await page.locator("#content").fill(postContent);

    // "Publish Post"ボタンをクリック
    await page.click("text=Publish Post");

    // posts/任意の数字に遷移していることを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+/);

    // ページのh1テキストの内容が正しいことを確認
    await expect(page.locator("h1")).toHaveText(postTitle);

    // articleタグの中身にコンテンツが含まれることを確認
    await expect(page.locator("article")).toContainText(postContent);

    // トップページに戻る
    await page.click("text=Back to Blog");

    // トップページに遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // 追加した記事がトップページに表示されていることを確認
    await expect(page.locator("body")).toContainText(postTitle);
  });

  test("should allow a user to add a comment to a post", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const postTitle = `comment test post ${uniqueId}`;
    const commentText = `This is a great post! ${uniqueId}`;

    // 新しい記事を作成
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill(postTitle);
    await page.locator("#content").fill(`Content for ${postTitle}`);
    await page.click("text=Publish Post");

    // コメントが存在しないことを確認
    await expect(page.locator("body")).not.toContainText(commentText);

    // コメントフォームに入力
    await page.getByLabel("Comment").fill(commentText);

    // "Submit"ボタンをクリック
    await page.click("text=Submit");

    // フォームが空になっていることを確認
    await expect(page.getByLabel("Comment")).toBeEmpty();

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText(commentText);
  });

  test("should allow a logged-in user to edit their post", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const originalTitle = `edit test post ${uniqueId}`;
    const updatedTitle = `updated post ${uniqueId}`;
    const updatedContent = `updated content ${uniqueId}`;

    // 新しい記事を作成
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill(originalTitle);
    await page
      .locator("#content")
      .fill(`Original content for ${originalTitle}`);
    await page.click("text=Publish Post");

    // "Edit"ボタンが表示されていることを確認
    await expect(page.getByTestId("edit-post-button")).toBeVisible();

    // "Edit"ボタンをクリック
    await page.getByTestId("edit-post-button").click();

    // /posts/数字/edit画面に遷移したことを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+\/edit/);

    // フォームの内容を変更
    await page.locator("#title").fill(updatedTitle);
    await page.locator("#content").fill(updatedContent);

    // "Update Post"ボタンをクリック
    await page.click("text=Update Post");

    // 記事詳細ページに戻ることを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+/);

    // 更新された内容が表示されていることを確認
    await expect(page.locator("h1")).toHaveText(updatedTitle);
    await expect(page.locator("article")).toContainText(updatedContent);
  });

  test("should allow a logged-in user to delete their post", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const postTitle = `delete test post ${uniqueId}`;

    // 新しい記事を作成
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill(postTitle);
    await page.locator("#content").fill(`Content for ${postTitle}`);
    await page.click("text=Publish Post");

    // "Delete"ボタンが表示されていることを確認
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();

    // 確認ダイアログが表示されたらOKをクリック（クリック前に設定）
    page.on("dialog", (dialog) => dialog.accept());

    // "Delete"ボタンをクリック
    await page.locator('button:has-text("Delete")').click();

    // トップページにリダイレクトされることを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // 削除した記事が表示されていないことを確認
    await expect(page.locator("body")).not.toContainText(postTitle);
  });

  test("should allow a logged-in user to edit their comment", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const postTitle = `comment edit test ${uniqueId}`;
    const originalComment = `My original comment ${uniqueId}`;
    const updatedComment = `My updated comment ${uniqueId}`;

    // 新しい記事を作成(既に認証済み)
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill(postTitle);
    await page.locator("#content").fill(`Content for ${postTitle}`);
    await page.click("text=Publish Post");

    // コメントを追加
    await page.getByLabel("Comment").fill(originalComment);
    await page.click("text=Submit");

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText(originalComment);

    // "Edit"ボタン(コメントの)をクリック
    const commentContainer = page
      .locator(`text=${originalComment}`)
      .locator("..");
    await commentContainer.locator('a:has-text("Edit")').click();

    // コメント編集フォームが表示されることを確認
    // form内のtextareaを特定するためにUpdateボタンを持つform内を探す
    const editForm = page.locator('form:has(button:has-text("Update"))');
    const commentEditField = editForm.locator('textarea[name="content"]');
    await expect(commentEditField).toBeVisible();
    await expect(commentEditField).toHaveValue(originalComment);

    // コメントを編集
    await commentEditField.fill(updatedComment);

    // "Update"ボタンをクリック
    await page.locator('button:has-text("Update")').click();

    // 更新されたコメントが表示されていることを確認
    await expect(page.locator("body")).toContainText(updatedComment);
    await expect(page.locator("body")).not.toContainText(originalComment);
  });

  test("should allow a logged-in user to delete their comment", async ({
    page,
  }: {
    page: Page;
  }) => {
    const uniqueId = generateUniqueId();
    const postTitle = `comment delete test ${uniqueId}`;
    const commentText = `Comment to delete ${uniqueId}`;

    // 新しい記事を作成
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill(postTitle);
    await page.locator("#content").fill(`Content for ${postTitle}`);
    await page.click("text=Publish Post");

    // コメントを追加
    await page.getByLabel("Comment").fill(commentText);
    await page.click("text=Submit");

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText(commentText);

    // 確認ダイアログが表示されたらOKをクリック（クリック前に設定）
    page.on("dialog", (dialog) => dialog.accept());

    // "Delete"ボタン(コメントの)をクリック
    const commentContainer = page.locator(`text=${commentText}`).locator("..");
    await commentContainer.locator('button:has-text("Delete")').click();

    // コメントが削除されていることを確認
    await expect(page.locator("body")).not.toContainText(commentText);
  });
});
