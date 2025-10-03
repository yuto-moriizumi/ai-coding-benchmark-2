import { getSession } from "../actions/auth";
import { redirect } from "next/navigation";
import { createPost } from "../actions/posts";
import Link from "next/link";

export default async function NewPostPage() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Create New Post</h1>
      <form action={createPost} className="max-w-2xl space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
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
            required
            rows={10}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Publish Post
        </button>
      </form>
      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
