"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUser {
  userId: number;
  username: string;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, userRes] = await Promise.all([
          fetch("/api/articles"),
          fetch("/api/auth/me"),
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          setArticles(data.articles);
        }

        if (userRes.ok) {
          const data = await userRes.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddArticle = () => {
    if (!currentUser) {
      router.push("/login");
    } else {
      router.push("/new-post");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <div className="space-x-4">
            <button
              onClick={handleAddArticle}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add new article
            </button>
            {currentUser ? (
              <div className="inline-flex items-center space-x-4">
                <span className="text-gray-700">{currentUser.username}</span>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setCurrentUser(null);
                    router.refresh();
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2 inline-flex">
                <Link href="/login">
                  <button className="text-blue-600 hover:underline">Login</button>
                </Link>
                <Link href="/register">
                  <button className="text-blue-600 hover:underline">Register</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <p className="text-center text-gray-500">No articles yet.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/posts/${article.id}`)}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-2">By {article.user.email}</p>
                <p className="text-gray-700 line-clamp-3">{article.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
