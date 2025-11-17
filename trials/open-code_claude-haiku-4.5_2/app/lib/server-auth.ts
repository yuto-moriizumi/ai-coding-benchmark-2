import { getCurrentUser } from "./auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getCurrentUserFromDB() {
  const user = await getCurrentUser();
  if (!user) return null;

  return await prisma.user.findUnique({
    where: { id: user.userId },
  });
}
