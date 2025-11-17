"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function fetchComment(id: string) {
  const res = await fetch(`/api/comments/${id}`);
  if (!res.ok) throw new Error("Failed to load comment");
  return res.json();
}

async function updateComment(id: string, content: string) {
  const res = await fetch(`/api/comments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to update comment");
  return res.json();
}

interface EditCommentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCommentPage({ params }: EditCommentPageProps) {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const comment = await fetchComment(id);
        setContent(comment.content);
        setLoaded(true);
      } catch (err) {
        setError("Failed to load comment");
      }
    })();
  }, [params]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const { id } = await params;
    try {
      const updated = await updateComment(id, content);
      router.push(`/posts/${updated.postId}`);
    } catch (err) {
      setError("Failed to update comment");
    }
  };

  if (!loaded && !error) {
    return <main className="max-w-md mx-auto p-4">Loading...</main>;
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Comment</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <textarea
          name="content"
          className="border rounded w-full p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </form>
    </main>
  );
}
