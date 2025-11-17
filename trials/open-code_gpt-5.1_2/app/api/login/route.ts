import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Username or password is incorrect" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("session_user", String(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ id: user.id, username: user.username });
}
