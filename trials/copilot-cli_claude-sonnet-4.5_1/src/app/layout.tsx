import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog App",
  description: "A simple blog application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
          }
          .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 0.25rem;
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }
          .btn:hover {
            background: #2563eb;
          }
          .btn-danger {
            background: #ef4444;
          }
          .btn-danger:hover {
            background: #dc2626;
          }
          .btn-warning {
            background: #f59e0b;
          }
          .btn-warning:hover {
            background: #d97706;
          }
          input, textarea {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            font-size: 1rem;
          }
          label {
            display: block;
            margin-bottom: 0.25rem;
            font-weight: 500;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          .error {
            background: #fee2e2;
            border: 1px solid #f87171;
            color: #991b1b;
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            margin-bottom: 1rem;
          }
          .post-list {
            margin-top: 2rem;
          }
          .post-item {
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
            transition: box-shadow 0.3s;
          }
          .post-item:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .post-meta {
            color: #6b7280;
            font-size: 0.875rem;
          }
          .comment {
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          .comment-meta {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          .comment-actions {
            margin-top: 0.5rem;
          }
          .comment-actions a,
          .comment-actions button {
            margin-right: 1rem;
            font-size: 0.875rem;
          }
          .comment-actions a {
            color: #2563eb;
            text-decoration: none;
          }
          .comment-actions a:hover {
            text-decoration: underline;
          }
          .comment-actions button {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            padding: 0;
          }
          .comment-actions button:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <nav style={{background: '#1f2937', color: 'white', padding: '1rem'}}>
          <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Link href="/" style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none'}}>Blog</Link>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              {user ? (
                <>
                  <span>Welcome, {user.username}</span>
                  <form action="/api/logout" method="POST">
                    <button type="submit" style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', textDecoration: 'underline'}}>Logout</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" style={{color: 'white', textDecoration: 'none'}}>Login</Link>
                  <Link href="/register" style={{color: 'white', textDecoration: 'none'}}>Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="container" style={{padding: '2rem 1rem'}}>
          {children}
        </main>
      </body>
    </html>
  );
}
