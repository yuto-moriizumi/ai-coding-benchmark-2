import { prisma } from './db';

export async function getUserBySessionId(sessionId: string) {
  if (!sessionId) return null;
  return prisma.user.findUnique({
    where: { sessionId },
  });
}