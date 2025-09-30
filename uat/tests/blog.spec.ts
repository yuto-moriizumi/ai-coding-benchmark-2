import { test, expect, Page } from "@playwright/test";

test.describe.serial("Blog app", () => {
  test("should reset all posts", async ({ page }: { page: Page }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Reset data"ボタンをクリック
    await page.click("text=Reset data");

    // 記事が存在しないことを確認
    await expect(page.locator("article")).toHaveCount(0);
  });

  test("should allow a user to create a new post", async ({
    page,
  }: {
    page: Page;
  }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "my new post"という記事が存在しないことを確認
    await expect(page.locator("body")).not.toContainText("my new post");

    // "Add new article"ボタンをクリック
    await page.click("text=Add new article");

    // /new-post画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/new-post");

    // フォームに入力
    await page.locator("#title").fill("my new post");
    await page.locator("#content").fill("my content");

    // "Publish Post"ボタンをクリック
    await page.click("text=Publish Post");

    // posts/任意の数字に遷移していることを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+/);

    // ページのh1テキストの内容が「my new post」であることを確認
    await expect(page.locator("h1")).toHaveText("my new post");

    // articleタグの中身に「my content」が含まれることを確認
    await expect(page.locator("article")).toContainText("my content");

    // トップページに戻る
    await page.click("text=Back to Blog");

    // トップページに遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // 追加した記事がトップページに表示されていることを確認
    await expect(page.locator("body")).toContainText("my new post");
  });

  test("should allow a user to add a comment to a post", async ({
    page,
  }: {
    page: Page;
  }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");
    await page.click("text=my new post");

    // "This is a great post!"というコメントが存在しないことを確認
    await expect(page.locator("body")).not.toContainText(
      "This is a great post!"
    );

    // コメントフォームに入力
    await page.getByLabel("Your Name").fill("John Doe");
    await page.getByLabel("Comment").fill("This is a great post!");

    // "Submit"ボタンをクリック
    await page.click("text=Submit");

    // フォームが空になっていることを確認
    await expect(page.getByLabel("Your Name")).toBeEmpty();
    await expect(page.getByLabel("Comment")).toBeEmpty();

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText("John Doe");
    await expect(page.locator("body")).toContainText("This is a great post!");
  });

  test("should allow a user to register a new account", async ({
    page,
  }: {
    page: Page;
  }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Register"リンクをクリック
    await page.click("text=Register");

    // /register画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/register");

    // 登録フォームに入力
    await page.getByLabel("Username").fill("testuser");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");

    // "Register"ボタンをクリック
    await page.click('button:has-text("Register")');

    // トップページにリダイレクトされることを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // ログイン状態を示す要素が表示されていることを確認
    await expect(page.locator("body")).toContainText("testuser");
  });

  test("should allow a user to login", async ({ page }: { page: Page }) => {
    // トップページにアクセス
    await page.goto("http://localhost:3000/");

    // "Login"リンクをクリック
    await page.click("text=Login");

    // /login画面に遷移したことを確認
    await expect(page).toHaveURL("http://localhost:3000/login");

    // ログインフォームに入力
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");

    // "Login"ボタンをクリック
    await page.click('button:has-text("Login")');

    // トップページにリダイレクトされることを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // ログイン状態を示す要素が表示されていることを確認
    await expect(page.locator("body")).toContainText("testuser");
  });

  test("should allow a logged-in user to edit their post", async ({
    page,
  }: {
    page: Page;
  }) => {
    // ログインしてトップページにアクセス
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("http://localhost:3000/");

    // 自分の投稿記事をクリック
    await page.click("text=my new post");

    // "Edit"ボタンが表示されていることを確認
    await expect(page.locator("text=Edit")).toBeVisible();

    // "Edit"ボタンをクリック
    await page.click("text=Edit");

    // /posts/数字/edit画面に遷移したことを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+\/edit/);

    // フォームの内容を変更
    await page.locator("#title").fill("my updated post");
    await page.locator("#content").fill("my updated content");

    // "Update Post"ボタンをクリック
    await page.click("text=Update Post");

    // 記事詳細ページに戻ることを確認
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/posts\/\d+/);

    // 更新された内容が表示されていることを確認
    await expect(page.locator("h1")).toHaveText("my updated post");
    await expect(page.locator("article")).toContainText("my updated content");
  });

  test("should allow a logged-in user to delete their post", async ({
    page,
  }: {
    page: Page;
  }) => {
    // ログインしてトップページにアクセス
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.click('button:has-text("Login")');
    await expect(page).toHaveURL("http://localhost:3000/");

    // 自分の投稿記事をクリック
    await page.click("text=my updated post");

    // "Delete"ボタンが表示されていることを確認
    await expect(page.locator("text=Delete")).toBeVisible();

    // "Delete"ボタンをクリック
    await page.click("text=Delete");

    // 確認ダイアログが表示されたらOKをクリック
    page.on("dialog", (dialog) => dialog.accept());

    // トップページにリダイレクトされることを確認
    await expect(page).toHaveURL("http://localhost:3000/");

    // 削除した記事が表示されていないことを確認
    await expect(page.locator("body")).not.toContainText("my updated post");
  });

  test("should allow a logged-in user to edit their comment", async ({
    page,
  }: {
    page: Page;
  }) => {
    // 新しい記事を作成
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.click('button:has-text("Login")');
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill("test post for comment");
    await page.locator("#content").fill("test content");
    await page.click("text=Publish Post");

    // コメントを追加
    await page.getByLabel("Comment").fill("My original comment");
    await page.click("text=Submit");

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText("My original comment");

    // "Edit"ボタン(コメントの)をクリック
    await page
      .locator("text=My original comment")
      .locator("..")
      .locator("text=Edit")
      .click();

    // コメント編集フォームが表示されることを確認
    const commentEditField = page.locator(
      'textarea[value*="My original comment"]'
    );
    await expect(commentEditField).toBeVisible();

    // コメントを編集
    await commentEditField.fill("My updated comment");

    // "Update"ボタンをクリック
    await page.click("text=Update");

    // 更新されたコメントが表示されていることを確認
    await expect(page.locator("body")).toContainText("My updated comment");
    await expect(page.locator("body")).not.toContainText("My original comment");
  });

  test("should allow a logged-in user to delete their comment", async ({
    page,
  }: {
    page: Page;
  }) => {
    // ログインして記事ページにアクセス
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.click('button:has-text("Login")');
    await page.goto("http://localhost:3000/");
    await page.click("text=test post for comment");

    // コメントが表示されていることを確認
    await expect(page.locator("body")).toContainText("My updated comment");

    // "Delete"ボタン(コメントの)をクリック
    await page
      .locator("text=My updated comment")
      .locator("..")
      .locator("text=Delete")
      .click();

    // 確認ダイアログが表示されたらOKをクリック
    page.on("dialog", (dialog) => dialog.accept());

    // コメントが削除されていることを確認
    await expect(page.locator("body")).not.toContainText("My updated comment");
  });

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

  test("should require login to add a comment", async ({
    page,
  }: {
    page: Page;
  }) => {
    // ログアウト状態で記事ページにアクセス
    await page.goto("http://localhost:3000/");
    await page.click("text=test post for comment");

    // コメントフォームが表示されていないことを確認
    await expect(page.getByLabel("Comment")).not.toBeVisible();

    // またはログインを促すメッセージが表示されていることを確認
    await expect(page.locator("body")).toContainText(
      "Please login to add a comment"
    );
  });

  test("should not allow editing posts created by other users", async ({
    page,
  }: {
    page: Page;
  }) => {
    // 2人目のユーザーを登録
    await page.goto("http://localhost:3000/register");
    await page.getByLabel("Username").fill("anotheruser");
    await page.getByLabel("Email").fill("anotheruser@example.com");
    await page.getByLabel("Password").fill("password456");
    await page.click('button:has-text("Register")');

    // testuserが作成した記事にアクセス
    await page.goto("http://localhost:3000/");
    await page.click("text=test post for comment");

    // "Edit"ボタンが表示されていないことを確認
    await expect(page.locator("text=Edit")).not.toBeVisible();
  });

  test("should not allow deleting posts created by other users", async ({
    page,
  }: {
    page: Page;
  }) => {
    // anotherユーザーでログイン
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("anotheruser@example.com");
    await page.getByLabel("Password").fill("password456");
    await page.click('button:has-text("Login")');

    // testuserが作成した記事にアクセス
    await page.goto("http://localhost:3000/");
    await page.click("text=test post for comment");

    // "Delete"ボタンが表示されていないことを確認
    await expect(page.locator("text=Delete")).not.toBeVisible();
  });

  test("should not allow editing comments created by other users", async ({
    page,
  }: {
    page: Page;
  }) => {
    // testuserでログインして新しいコメントを作成
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("testuser@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.click('button:has-text("Login")');

    // anotherユーザーが作成した記事を作成
    await page.goto("http://localhost:3000/new-post");
    await page.locator("#title").fill("post by testuser");
    await page.locator("#content").fill("content by testuser");
    await page.click("text=Publish Post");

    // testuserがコメントを追加
    await page.getByLabel("Comment").fill("Comment by testuser");
    await page.click("text=Submit");

    // ログアウトしてanotherユーザーでログイン
    await page.click("text=Logout");
    await page.click("text=Login");
    await page.getByLabel("Email").fill("anotheruser@example.com");
    await page.getByLabel("Password").fill("password456");
    await page.click('button:has-text("Login")');

    // 記事にアクセス
    await page.goto("http://localhost:3000/");
    await page.click("text=post by testuser");

    // testuserのコメントに対して"Edit"ボタンが表示されていないことを確認
    const testuserComment = page
      .locator("text=Comment by testuser")
      .locator("..");
    await expect(testuserComment.locator("text=Edit")).not.toBeVisible();
  });

  test("should not allow deleting comments created by other users", async ({
    page,
  }: {
    page: Page;
  }) => {
    // anotherユーザーでログイン済みの状態で記事にアクセス
    await page.goto("http://localhost:3000/login");
    await page.getByLabel("Email").fill("anotheruser@example.com");
    await page.getByLabel("Password").fill("password456");
    await page.click('button:has-text("Login")');

    await page.goto("http://localhost:3000/");
    await page.click("text=post by testuser");

    // testuserのコメントに対して"Delete"ボタンが表示されていないことを確認
    const testuserComment = page
      .locator("text=Comment by testuser")
      .locator("..");
    await expect(testuserComment.locator("text=Delete")).not.toBeVisible();
  });
});
