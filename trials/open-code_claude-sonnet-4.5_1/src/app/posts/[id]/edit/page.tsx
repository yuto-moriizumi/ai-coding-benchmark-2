import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id)
  
  const user = await getSession()
  
  if (!user) {
    redirect('/login')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== user.id) {
    redirect('/')
  }

  async function updatePost(formData: FormData) {
    'use server'
    
    const user = await getSession()
    if (!user) {
      redirect('/login')
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    await prisma.post.update({
      where: { id: postId },
      data: { title, content }
    })

    redirect(`/posts/${postId}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
        
        <form action={updatePost} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={post.title}
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
              defaultValue={post.content}
              required
              rows={10}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update Post
          </button>
        </form>
      </div>
    </div>
  )
}
