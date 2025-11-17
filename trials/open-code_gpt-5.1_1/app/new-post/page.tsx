import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  async function createPost(formData: FormData) {
    "use server";
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect("/login");
    }
    const title = String(formData.get("title") || "");
    const content = String(formData.get("content") || "");
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: currentUser!.id,
      },
    });
    redirect(`/posts/${post.id}`);
  }

  return (
    <div>
      <h1>New Post</h1>
      <form action={createPost}>
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" />
        </div>
        <button type="submit">Publish Post</button>
      </form>
    </div>
  );
}
