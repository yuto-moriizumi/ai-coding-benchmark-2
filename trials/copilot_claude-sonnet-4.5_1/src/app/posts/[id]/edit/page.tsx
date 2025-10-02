import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);

  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.id) {
    redirect("/");
  }

  async function updatePost(formData: FormData) {
    "use server";

    const user = await getSession();
    if (!user) {
      redirect("/login");
    }

    const postId = parseInt(formData.get("postId") as string);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.authorId !== user.id) {
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

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Edit Post</h1>
      <form action={updatePost} className="max-w-2xl space-y-4">
        <input type="hidden" name="postId" value={post.id} />
        <div>
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={post.title}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-2">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            required
            rows={10}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Post
        </button>
      </form>
    </div>
  );
}
