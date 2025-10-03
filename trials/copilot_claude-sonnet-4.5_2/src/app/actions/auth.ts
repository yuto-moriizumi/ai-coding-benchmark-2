"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData, defaultSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export async function register(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: "User already exists" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  // Create session
  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.isLoggedIn = true;
  await session.save();

  redirect("/");
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: "Username or password is incorrect" };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { error: "Username or password is incorrect" };
  }

  // Create session
  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.isLoggedIn = true;
  await session.save();

  redirect("/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
