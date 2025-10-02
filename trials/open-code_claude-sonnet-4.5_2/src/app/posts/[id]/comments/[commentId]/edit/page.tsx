import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export default async function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string; commentId: string }>
}) {
  const { id, commentId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const comment = await prisma.comment.findUnique({
    where: { id: parseInt(commentId) },
  })

  if (!comment) {
    notFound()
  }

  if (comment.authorId !== user.id) {
    redirect('/')
  }

  async function updateComment(formData: FormData) {
    'use server'

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const commentId = formData.get('commentId') as string
    const postId = formData.get('postId') as string
    const content = formData.get('content') as string

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    })

    if (!comment || comment.authorId !== user.id) {
      throw new Error('Unauthorized')
    }

    await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        content,
      },
    })

    revalidatePath(`/posts/${postId}`)
    redirect(`/posts/${postId}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Edit Comment</h1>
      <form action={updateComment}>
        <input type="hidden" name="commentId" value={comment.id} />
        <input type="hidden" name="postId" value={id} />
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="content">Comment</label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            defaultValue={comment.content}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Update
        </button>
      </form>
    </div>
  )
}
