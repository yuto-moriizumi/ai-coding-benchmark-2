import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, username: true },
  });
}

export default async function Home() {
  const [posts, sessionUser] = await Promise.all([
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
    getSessionUser(),
  ]);

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Simple Blog</h1>
        <nav className="flex gap-4 items-center">
          <Link href="/new-post" className="text-blue-600 underline">
            Add new article
          </Link>
          {sessionUser ? (
            <span className="text-sm">Logged in as {sessionUser.username}</span>
          ) : (
            <>
              <Link href="/login" className="text-blue-600 underline">
                Login
              </Link>
              <Link href="/register" className="text-blue-600 underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="space-y-2">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <div
            key={post.id}
            className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
          >
            <Link href={`/posts/${post.id}`} className="text-lg font-semibold">
              {post.title}
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
