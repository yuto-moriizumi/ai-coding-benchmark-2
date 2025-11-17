import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Link from "next/link";

async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={user} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!user && (
          <div className="mb-8 p-4 bg-blue-100 text-blue-800 rounded">
            <p>
              <Link href="/login" className="font-bold hover:underline">
                Login
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-bold hover:underline">
                Register
              </Link>{" "}
              to create and comment on articles.
            </p>
          </div>
        )}

        {/* Posts list */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 mb-4">{post.content.substring(0, 200)}...</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By {post.author.username}</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No articles yet.</p>
            {user && (
              <Link
                href="/new-post"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create the first article
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
