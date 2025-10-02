import { prisma } from './db';
import bcrypt from 'bcryptjs';

export async function createUser(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const sessionId = crypto.randomUUID();
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: hashedPassword,
      sessionId,
    },
  });
  return user;
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  // Generate new sessionId on login
  const sessionId = crypto.randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { sessionId },
  });
  return { ...user, sessionId };
}

export async function logoutUser(sessionId: string) {
  await prisma.user.updateMany({
    where: { sessionId },
    data: { sessionId: null },
  });
}