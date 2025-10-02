import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import EditForm from './EditForm'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id)
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/login')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== session.userId) {
    redirect('/')
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Edit Post</h1>
      <EditForm post={post} />
    </div>
  )
}
