import { redirect } from "next/navigation";
import { getCurrentUser, registerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RegisterSearchParams = Promise<{
  error?: string;
}>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: RegisterSearchParams;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  async function handleRegister(formData: FormData) {
    "use server";
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    try {
      await registerUser(username, password);
      redirect("/");
    } catch (err) {
      const message = (err as Error).message || "Registration failed";
      redirect(`/register?error=${encodeURIComponent(message)}`);
    }
  }

  const params = (await searchParams) || {};
  const errorMessage = params.error;

  return (
    <div>
      <h1>Register</h1>
      <form action={handleRegister}>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </div>
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
}
