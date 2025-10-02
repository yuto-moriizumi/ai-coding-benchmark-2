import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
    },
  });

  const user = await getSession();

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <nav className="flex gap-4">
          <Link href="/new-post" className="text-blue-600 hover:underline">
            Add new article
          </Link>
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
              <form action="/api/logout" method="POST">
                <button type="submit" className="text-blue-600 hover:underline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border p-4 rounded">
              <Link
                href={`/posts/${post.id}`}
                className="text-xl font-semibold text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
              <p className="text-gray-600 text-sm mt-2">
                By {post.author.username}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
