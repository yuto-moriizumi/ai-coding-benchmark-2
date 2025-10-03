import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function updateComment(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const commentId = parseInt(formData.get('commentId') as string)
  const postId = parseInt(formData.get('postId') as string)
  const content = formData.get('content') as string
  
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  })
  
  if (comment?.authorId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  await prisma.comment.update({
    where: { id: commentId },
    data: { content }
  })
  
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

export default async function EditCommentPage({ 
  params 
}: { 
  params: Promise<{ id: string; commentId: string }> 
}) {
  const { id, commentId } = await params
  const postId = parseInt(id)
  const commentIdNum = parseInt(commentId)
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const comment = await prisma.comment.findUnique({
    where: { id: commentIdNum }
  })
  
  if (!comment) {
    notFound()
  }
  
  if (comment.authorId !== session.id) {
    redirect(`/posts/${postId}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Comment</h1>
        <form action={updateComment} className="space-y-4">
          <input type="hidden" name="commentId" value={comment.id} />
          <input type="hidden" name="postId" value={postId} />
          <div>
            <label htmlFor="content" className="block mb-2">Comment</label>
            <textarea
              id="content"
              name="content"
              defaultValue={comment.content}
              className="w-full border p-2 rounded h-32"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
        </form>
      </div>
    </div>
  )
}
