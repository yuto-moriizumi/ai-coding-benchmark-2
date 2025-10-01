import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { LoginForm } from "@/components/LoginForm";

async function login(prevState: { error?: string } | null, formData: FormData) {
  "use server";

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Username or password is incorrect" };
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("userId", user.id.toString(), {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  revalidatePath("/", "layout");
  redirect("/");
}

export default function LoginPage() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <LoginForm loginAction={login} />
      </div>
    </div>
  );
}
