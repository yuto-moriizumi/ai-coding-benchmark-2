"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createComment(postId: number, formData: FormData) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const content = formData.get("content") as string;

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.userId,
    },
  });

  revalidatePath(`/posts/${postId}`);
}

export async function updateComment(commentId: number, formData: FormData) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  const content = formData.get("content") as string;

  // Check if user is the author
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== session.userId) {
    redirect("/");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
    },
  });

  revalidatePath(`/posts/${comment.postId}`);
  redirect(`/posts/${comment.postId}`);
}

export async function deleteComment(commentId: number) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  // Check if user is the author
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment || comment.authorId !== session.userId) {
    redirect("/");
  }

  const postId = comment.postId;

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/posts/${postId}`);
}
