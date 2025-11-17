"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  userId: number;
  user: User;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface CurrentUser {
  userId: number;
  username: string;
}

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [param, setParam] = useState<{ id: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(setParam);
  }, [params]);

  const postId = param?.id;

  const [article, setArticle] = useState<Article | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchData = async () => {
      try {
        const [articleRes, userRes] = await Promise.all([
          fetch(`/api/articles/${postId}`),
          fetch("/api/auth/me"),
        ]);

        if (articleRes.ok) {
          const data = await articleRes.json();
          setArticle(data.article);
        } else {
          setError("Article not found");
        }

        if (userRes.ok) {
          const data = await userRes.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !article) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          userId: currentUser.userId,
          articleId: article.id,
        }),
      });

      if (res.ok) {
        setCommentText("");
        const data = await res.json();
        setArticle({
          ...article,
          comments: [...article.comments, data.comment],
        });
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await fetch(`/api/articles/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Error deleting article:", err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok && article) {
        setArticle({
          ...article,
          comments: article.comments.filter((c) => c.id !== commentId),
        });
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-red-600">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const isOwnArticle = currentUser?.userId === article.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {article.title}
              </h1>
              <p className="text-gray-600">By {article.user.email}</p>
            </div>
            {isOwnArticle && (
              <div className="space-x-2">
                <button
                  data-testid="edit-post-button"
                  onClick={() => router.push(`/posts/${article.id}/edit`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteArticle}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
          </div>
        </article>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

          {currentUser ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your comment here..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-blue-50 rounded">
              <p className="text-blue-800">Please login to add a comment</p>
            </div>
          )}

          {article.comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {article.comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-600">{comment.user.email}</p>
                    {currentUser?.userId === comment.userId && (
                      <div className="space-x-2">
                        <Link
                          href={`/comments/${comment.id}/edit`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mt-2">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
