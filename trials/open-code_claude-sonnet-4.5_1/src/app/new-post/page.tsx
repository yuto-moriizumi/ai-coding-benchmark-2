import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function NewPostPage() {
  const user = await getSession()
  
  if (!user) {
    redirect('/login')
  }

  async function createPost(formData: FormData) {
    'use server'
    
    const user = await getSession()
    if (!user) {
      redirect('/login')
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id
      }
    })

    redirect(`/posts/${post.id}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
        
        <form action={createPost} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={10}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Publish Post
          </button>
        </form>
      </div>
    </div>
  )
}
