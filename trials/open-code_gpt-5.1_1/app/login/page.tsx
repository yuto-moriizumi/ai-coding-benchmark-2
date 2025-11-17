import { redirect } from "next/navigation";
import { getCurrentUser, loginUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type LoginSearchParams = Promise<{
  error?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    try {
      await loginUser(username, password);
      redirect("/");
    } catch (err) {
      const message = (err as Error).message || "Login failed";
      redirect(`/login?error=${encodeURIComponent(message)}`);
    }
  }

  const params = (await searchParams) || {};
  const errorMessage = params.error;

  return (
    <div>
      <h1>Login</h1>
      <form action={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
