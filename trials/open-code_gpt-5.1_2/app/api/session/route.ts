import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;

  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, username: true },
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
