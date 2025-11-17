"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Author {
  id: number;
  username: string;
}

interface Post {
  id: number;
}

interface Comment {
  id: number;
  content: string;
  post: Post;
  author: Author;
}

export default function EditCommentPage() {
  const params = useParams();
  const router = useRouter();
  const commentId = params.id as string;
  const [comment, setComment] = useState<Comment | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

   useEffect(() => {
     async function loadComment() {
       try {
         const response = await fetch(`/api/comments/${commentId}`);
         if (response.ok) {
           const data = await response.json();
           setComment(data);
           setContent(data.content);
         } else {
           setError("Comment not found");
         }
       } catch (err) {
         console.error("Error loading comment:", err);
         setError("An error occurred while loading the comment");
       } finally {
         setLoading(false);
       }
     }

     loadComment();
   }, [commentId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        router.push(`/posts/${comment?.post.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update comment");
      }
    } catch (err) {
      setError("An error occurred while updating the comment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!comment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <p className="text-gray-600 mb-4">{error || "Comment not found"}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href={`/posts/${comment.post.id}`} className="text-blue-600 hover:text-blue-700">
            ← Back to Post
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Comment</h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Comment text"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update"}
              </button>
              <Link
                href={`/posts/${comment.post.id}`}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 inline-block"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
