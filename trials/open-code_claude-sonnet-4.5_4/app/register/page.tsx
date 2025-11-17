import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import * as bcrypt from 'bcryptjs'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params.error
  
  async function register(formData: FormData) {
    'use server'
    
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    
    if (!username || !password) {
      return
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })
    
    if (existingUser) {
      redirect('/register?error=user_exists')
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      }
    })
    
    // Set session
    const session = await getSession()
    session.userId = user.id
    session.username = user.username
    session.isLoggedIn = true
    await session.save()
    
    redirect('/')
  }
  
  return (
    <div className="max-w-md mx-auto mt-8 p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error === 'user_exists' && (
        <p className="text-red-500 mb-4">User already exists</p>
      )}
      <form action={register} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Register
        </button>
      </form>
    </div>
  )
}
