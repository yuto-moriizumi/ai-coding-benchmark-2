import { PrismaClient } from "@prisma/client";
import { verifyPassword, createToken, setAuthCookie } from "@/app/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: "Username or password is incorrect" },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return Response.json(
        { error: "Username or password is incorrect" },
        { status: 401 }
      );
    }

    const token = await createToken(user.id, user.email);
    await setAuthCookie(token);

    return Response.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
