import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/login')
  }
  
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) }
  })
  
  if (!post) {
    notFound()
  }
  
  if (post.authorId !== session.userId) {
    redirect('/')
  }
  
  async function updatePost(formData: FormData) {
    'use server'
    
    const session = await getSession()
    const { id } = await params
    
    if (!session.isLoggedIn || !session.userId) {
      redirect('/login')
    }
    
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (post && post.authorId === session.userId) {
      await prisma.post.update({
        where: { id: parseInt(id) },
        data: { title, content }
      })
    }
    
    redirect(`/posts/${id}`)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <form action={updatePost} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={post.title}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="content" className="block mb-1">Content</label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            required
            rows={10}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Post
        </button>
      </form>
    </div>
  )
}
