import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function resetData() {
  "use server";
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Clear session
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("userId");

  revalidatePath("/");
}

async function logout() {
  "use server";
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  revalidatePath("/");
}

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const user = await getCurrentUser();

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span>Hello, {user.username}</span>
              <form action={logout}>
                <button type="submit" className="text-blue-600 hover:underline">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-4">
          <Link
            href="/new-post"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add new article
          </Link>
          <form action={resetData}>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reset data
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="block p-4 border rounded hover:bg-gray-50"
              >
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p className="text-gray-600 text-sm">
                  By {post.author.username}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
