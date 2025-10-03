"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.userId,
    },
  });

  redirect(`/posts/${post.id}`);
}

export async function updatePost(postId: number, formData: FormData) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Check if user is the author
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorId !== session.userId) {
    redirect("/");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
    },
  });

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function deletePost(postId: number) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  // Check if user is the author
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.authorId !== session.userId) {
    redirect("/");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
  redirect("/");
}
