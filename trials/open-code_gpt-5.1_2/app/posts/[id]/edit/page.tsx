"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function fetchPost(id: string) {
  const res = await fetch(`/api/posts/${id}`);
  if (!res.ok) throw new Error("Failed to load post");
  return res.json();
}

async function updatePost(id: string, title: string, content: string) {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to update post");
  return res.json();
}

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const post = await fetchPost(id);
        setTitle(post.title);
        setContent(post.content);
        setLoaded(true);
      } catch (err) {
        setError("Failed to load post");
      }
    })();
  }, [params]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const { id } = await params;
    try {
      await updatePost(id, title, content);
      router.push(`/posts/${id}`);
    } catch (err) {
      setError("Failed to update post");
    }
  };

  if (!loaded && !error) {
    return <main className="max-w-md mx-auto p-4">Loading...</main>;
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            id="title"
            className="border rounded w-full p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">
            Content
          </label>
          <textarea
            id="content"
            className="border rounded w-full p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Post
        </button>
      </form>
    </main>
  );
}
