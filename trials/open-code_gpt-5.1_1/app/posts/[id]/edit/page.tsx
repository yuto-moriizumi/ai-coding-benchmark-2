import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type EditPostParams = Promise<{
  id: string;
}>;

export default async function EditPostPage({
  params,
}: {
  params: EditPostParams;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (!id) notFound();

  const [post, user] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    getCurrentUser(),
  ]);

  if (!post) notFound();
  if (!user) redirect("/login");
  if (user.id !== post.authorId) redirect("/login");

  async function updatePost(formData: FormData) {
    "use server";
    const current = await getCurrentUser();
    if (!current || current.id !== post.authorId) {
      redirect("/login");
    }
    const title = String(formData.get("title") || "");
    const content = String(formData.get("content") || "");
    await prisma.post.update({
      where: { id: post.id },
      data: { title, content },
    });
    redirect(`/posts/${post.id}`);
  }

  return (
    <div>
      <h1>Edit Post</h1>
      <form action={updatePost}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={post.title} />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" defaultValue={post.content} />
        </div>
        <button type="submit">Update Post</button>
      </form>
    </div>
  );
}
