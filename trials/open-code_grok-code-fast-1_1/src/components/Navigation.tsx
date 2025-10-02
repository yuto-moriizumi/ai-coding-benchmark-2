import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'

export async function Navigation() {
  const user = await getCurrentUser()

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Blog App
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/new-post" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Add new article
          </Link>
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <form action="/api/logout" method="post" className="inline">
                <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}