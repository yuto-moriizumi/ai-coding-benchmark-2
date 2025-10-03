"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updatePostById(postId: number, formData: FormData) {
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
