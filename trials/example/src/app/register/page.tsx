import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/RegisterForm";

async function register(
  prevState: { error?: string } | null,
  formData: FormData
) {
  "use server";

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Check if username already exists
  console.log("[REGISTER] DATABASE_URL:", process.env.DATABASE_URL);
  console.log("[REGISTER] CWD:", process.cwd());

  const allUsers = await prisma.user.findMany();
  console.log("[REGISTER] Total users in DB:", allUsers.length);
  console.log(
    "[REGISTER] Usernames:",
    allUsers.map((u) => u.username).slice(0, 5)
  );

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  console.log(
    "[REGISTER] Checking username:",
    username,
    "Found:",
    !!existingUser
  );

  if (existingUser) {
    console.log("[REGISTER] User already exists, returning error");
    return { error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if current user is Anonymous
  const currentUser = await getCurrentUser();
  let user;

  try {
    if (currentUser && currentUser.username === "Anonymous") {
      // Update the anonymous user to a real user
      user = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          username,
          password: hashedPassword,
        },
      });
    } else {
      // Create a new user
      user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      // Set session
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      cookieStore.set("userId", user.id.toString(), {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
  } catch (error) {
    console.log("[REGISTER] Caught error:", error);
    // Handle unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      console.log("[REGISTER] Unique constraint violation, returning error");
      return { error: "User already exists" };
    }
    console.log("[REGISTER] Re-throwing error");
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export default async function RegisterPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">Register</h1>
        {/* DEBUG INFO */}
        {currentUser && (
          <div className="bg-yellow-100 p-4 mb-4 text-xs">
            <p>
              Current Session User: ID: {currentUser.id}, Username:{" "}
              {currentUser.username}
            </p>
            <p>
              Is Anonymous:{" "}
              {currentUser.username === "Anonymous" ? "Yes" : "No"}
            </p>
          </div>
        )}
        <RegisterForm registerAction={register} />
      </div>
    </div>
  );
}
