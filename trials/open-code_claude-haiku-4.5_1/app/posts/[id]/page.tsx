"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/app/lib/auth";

interface Author {
  id: number;
  username: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  authorId: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  comments: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<{ userId: number; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const userResponse = await fetch("/api/auth/me");
        if (userResponse.ok) {
          setUser(await userResponse.json());
        }

        const postResponse = await fetch(`/api/posts/${postId}`);
        if (postResponse.ok) {
          setPost(await postResponse.json());
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [postId]);

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText,
          postId: parseInt(postId),
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        if (post) {
          setPost({
            ...post,
            comments: [...post.comments, newComment],
          });
        }
        setCommentText("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add comment");
      }
    } catch (err) {
      setError("An error occurred while adding the comment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>
          <p className="text-gray-600 mb-4">Post not found</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user && user.userId === post.author.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Blog
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <article className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-6 border-b pb-4">
            <div>
              <p>By {post.author.username}</p>
              <p>{new Date(post.createdAt).toLocaleString()}</p>
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  data-testid="edit-post-button"
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      fetch(`/api/posts/${post.id}`, { method: "DELETE" }).then(() => {
                        window.location.href = "/";
                      });
                    }
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="text-gray-700 mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {/* Comments section */}
        <section className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a comment..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          ) : (
            <div className="rounded-md bg-blue-50 p-4 mb-8">
              <p className="text-sm text-blue-800">
                Please login to add a comment
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-6">
            {post.comments.length === 0 ? (
              <p className="text-gray-600">No comments yet.</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{comment.author.username}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {user && user.userId === comment.authorId && (
                      <div className="flex gap-2">
                        <Link
                          href={`/comments/${comment.id}/edit`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this comment?")) {
                              try {
                                const response = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
                                if (response.ok) {
                                  window.location.reload();
                                } else {
                                  alert("Failed to delete comment");
                                }
                              } catch (error) {
                                console.error("Delete error:", error);
                                alert("Error deleting comment");
                              }
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
