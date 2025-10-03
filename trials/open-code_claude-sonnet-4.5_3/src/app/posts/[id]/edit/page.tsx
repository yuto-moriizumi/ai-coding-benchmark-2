import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function updatePost(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const postId = parseInt(formData.get('postId') as string)
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  const post = await prisma.post.findUnique({
    where: { id: postId }
  })
  
  if (post?.authorId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  await prisma.post.update({
    where: { id: postId },
    data: { title, content }
  })
  
  redirect(`/posts/${postId}`)
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id)
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const post = await prisma.post.findUnique({
    where: { id: postId }
  })
  
  if (!post) {
    notFound()
  }
  
  if (post.authorId !== session.id) {
    redirect(`/posts/${postId}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Post</h1>
        <form action={updatePost} className="space-y-4">
          <input type="hidden" name="postId" value={post.id} />
          <div>
            <label htmlFor="title" className="block mb-2">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={post.title}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block mb-2">Content</label>
            <textarea
              id="content"
              name="content"
              defaultValue={post.content}
              className="w-full border p-2 rounded h-64"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update Post
          </button>
        </form>
      </div>
    </div>
  )
}
