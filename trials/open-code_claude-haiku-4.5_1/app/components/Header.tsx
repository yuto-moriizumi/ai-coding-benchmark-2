"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/lib/actions";

interface HeaderProps {
  user: { userId: number; username: string } | null;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleAddArticle = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/new-post");
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-gray-700">Welcome, {user.username}</span>
              <button
                onClick={handleAddArticle}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add new article
              </button>
              <form action={logoutAction} className="inline">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={handleAddArticle}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add new article
              </button>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
