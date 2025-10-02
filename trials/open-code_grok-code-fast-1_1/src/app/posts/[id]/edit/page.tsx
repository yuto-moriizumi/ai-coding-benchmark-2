import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { EditPostForm } from '@/components/EditPostForm'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)

  if (isNaN(postId)) {
    notFound()
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, content: true, authorId: true }
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== user.id) {
    redirect(`/posts/${postId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
      <EditPostForm post={post} />
    </div>
  )
}