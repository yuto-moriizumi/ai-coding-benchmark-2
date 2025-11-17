import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function NewPostPage() {
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/login')
  }
  
  async function createPost(formData: FormData) {
    'use server'
    
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      redirect('/login')
    }
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: session.userId,
      }
    })
    
    redirect(`/posts/${post.id}`)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <form action={createPost} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">Content</label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Publish Post
        </button>
      </form>
    </div>
  )
}
