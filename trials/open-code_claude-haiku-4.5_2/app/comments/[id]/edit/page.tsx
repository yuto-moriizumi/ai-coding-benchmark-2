"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  articleId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUser {
  userId: number;
  username: string;
}

export default function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [param, setParam] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(setParam);
  }, [params]);

  const commentId = param?.id;

  const [comment, setComment] = useState<Comment | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!commentId) return;

    const fetchData = async () => {
      try {
        const [commentRes, userRes] = await Promise.all([
          fetch(`/api/comments/${commentId}`),
          fetch("/api/auth/me"),
        ]);

        if (commentRes.ok) {
          const data = await commentRes.json();
          setComment(data.comment);
          setContent(data.comment.content);
        } else {
          setError("Comment not found");
        }

        if (userRes.ok) {
          const data = await userRes.json();
          setCurrentUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load comment");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [commentId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        router.push(`/posts/${comment.articleId}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!comment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">{error || "Comment not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mt-4"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Comment</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Comment content"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
