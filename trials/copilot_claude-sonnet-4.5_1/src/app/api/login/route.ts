import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return new NextResponse("Username or password is incorrect", {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return new NextResponse("Username or password is incorrect", {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return new NextResponse("Username or password is incorrect", {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Login error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
