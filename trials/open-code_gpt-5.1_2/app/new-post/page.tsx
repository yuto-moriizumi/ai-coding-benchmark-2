"use client";

import { FormEvent, useEffect, useState } from "react";

async function createPost(title: string, content: string) {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create post");
  }
  return data;
}

async function fetchSession() {
  const res = await fetch("/api/session");
  if (!res.ok) return null;
  return res.json();
}

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (!session || !session.user) {
        window.location.href = "/login";
      }
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const post = await createPost(title, content);
      window.location.href = `/posts/${post.id}`;
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create post");
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Post</h1>
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
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Publish Post
        </button>
      </form>
    </main>
  );
}
