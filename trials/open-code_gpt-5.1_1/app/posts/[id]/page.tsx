import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PostParams = Promise<{
  id: string;
}>;

export default async function PostDetailPage({
  params,
}: {
  params: PostParams;
}) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (!id) notFound();

  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { comments: { include: { author: true } }, author: true },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  async function deletePost() {
    "use server";
    const current = await getCurrentUser();
    if (!current) {
      redirect("/login");
    }
    await prisma.post.delete({ where: { id: post.id } });
    redirect("/");
  }

  async function addComment(formData: FormData) {
    "use server";
    const current = await getCurrentUser();
    if (!current) {
      redirect("/login");
    }
    const content = String(formData.get("comment") || "");
    await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        authorId: current.id,
      },
    });
    redirect(`/posts/${post.id}`);
  }

  const isOwner = user && user.id === post.authorId;

  return (
    <div>
      <h1>{post.title}</h1>
      <article>{post.content}</article>

      <p>Author: {post.author.username}</p>

      {isOwner && (
        <div>
          <a href={`/posts/${post.id}/edit`} data-testid="edit-post-button">
            Edit
          </a>
          <form
            action={async () => {
              "use server";
              await deletePost();
            }}
          >
            <button type="submit">Delete</button>
          </form>
        </div>
      )}

      <a href="/">Back to Blog</a>

      <section>
        <h2>Comments</h2>
        <ul>
          {post.comments.map((c) => (
            <li key={c.id}>
              <p>{c.content}</p>
              <small>by {c.author.username}</small>
              {user && user.id === c.authorId && (
                <span>
                  {" "}
                  <a href={`/comments/${c.id}/edit`}>Edit</a>{" "}
                  <form
                    action={async () => {
                      "use server";
                      const current = await getCurrentUser();
                      if (!current) {
                        redirect("/login");
                      }
                      await prisma.comment.delete({ where: { id: c.id } });
                      redirect(`/posts/${post.id}`);
                    }}
                  >
                    <button type="submit">Delete</button>
                  </form>
                </span>
              )}
            </li>
          ))}
        </ul>

        {user ? (
          <form action={addComment}>
            <div>
              <label htmlFor="comment">Comment</label>
              <textarea id="comment" name="comment" />
            </div>
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>Please login to add a comment</p>
        )}
      </section>
    </div>
  );
}
