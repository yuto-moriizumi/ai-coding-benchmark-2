import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function EditCommentPage({ params }: { params: Promise<{ id: string, commentId: string }> }) {
  const { id, commentId } = await params
  const session = await getSession()
  
  if (!session.isLoggedIn) {
    redirect('/login')
  }
  
  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) }
  })
  
  if (!comment) {
    notFound()
  }
  
  if (comment.authorId !== session.userId) {
    redirect(`/posts/${id}`)
  }
  
  async function updateComment(formData: FormData) {
    'use server'
    
    const session = await getSession()
    const { id, commentId } = await params
    
    if (!session.isLoggedIn || !session.userId) {
      redirect('/login')
    }
    
    const content = formData.get('content') as string
    
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) }
    })
    
    if (comment && comment.authorId === session.userId) {
      await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { content }
      })
    }
    
    redirect(`/posts/${id}`)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Comment</h1>
      <form action={updateComment} className="space-y-4">
        <div>
          <label htmlFor="content" className="block mb-1">Content</label>
          <textarea
            id="content"
            name="content"
            defaultValue={comment.content}
            required
            rows={5}
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update
        </button>
      </form>
    </div>
  )
}
