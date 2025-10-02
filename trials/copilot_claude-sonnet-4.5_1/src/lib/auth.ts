import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  return user;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    return null;
  }
  return user;
}
