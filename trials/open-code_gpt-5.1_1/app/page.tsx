import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [user, posts] = await Promise.all([
    getCurrentUser(),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main>
      <header>
        <h1>My Blog</h1>
        <nav>
          <Link href="/">Home</Link> | <Link href="/login">Login</Link> |{" "}
          <Link href="/register">Register</Link>
        </nav>
        {user && <p>Logged in as {user.username}</p>}
      </header>

      <section>
        <button
          onClick={undefined}
          aria-hidden
          style={{ display: "none" }}
        >
          Dummy
        </button>
        <Link href="/new-post">Add new article</Link>
      </section>

      <section>
        <h2>Articles</h2>
        {posts.length === 0 ? (
          <p>No articles yet.</p>
        ) : (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

