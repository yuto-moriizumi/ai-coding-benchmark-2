import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "./actions/auth";
import LogoutButton from "./LogoutButton";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const session = await getSession();

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <div className="flex gap-4">
          <Link href="/new-post" className="text-blue-600 hover:underline">
            Add new article
          </Link>
          {session.isLoggedIn ? (
            <>
              <span>Welcome, {session.username}!</span>
              <LogoutButton />
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
        </div>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="border p-4 rounded">
              <Link href={`/posts/${post.id}`}>
                <h3 className="text-xl font-semibold text-blue-600 hover:underline">
                  {post.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm">
                By {post.author.username} on{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
