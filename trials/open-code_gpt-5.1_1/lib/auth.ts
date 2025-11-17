import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "session_user_id";

export async function registerUser(username: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw new Error("User already exists");
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashed },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(user.id), { path: "/" });
  return user;
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new Error("Username or password is incorrect");
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("Username or password is incorrect");
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(user.id), { path: "/" });
  return user;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return null;
  const id = Number(session.value);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}
