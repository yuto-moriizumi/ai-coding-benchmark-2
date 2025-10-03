import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function createPost(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.id
    }
  })
  
  redirect(`/posts/${post.id}`)
}

export default async function NewPostPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
        <form action={createPost} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-2">Content</label>
            <textarea
              id="content"
              name="content"
              className="w-full border p-2 rounded h-64"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Publish Post
          </button>
        </form>
      </div>
    </div>
  )
}
