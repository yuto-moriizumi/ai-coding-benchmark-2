import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { DeleteButton } from '@/components/DeleteButton'
import { CommentItem } from './CommentItem'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id)
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { 
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!post) {
    notFound()
  }

  const user = await getSession()

  async function addComment(formData: FormData) {
    'use server'
    
    const user = await getSession()
    if (!user) {
      redirect('/login')
    }

    const content = formData.get('content') as string

    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id
      }
    })

    redirect(`/posts/${postId}`)
  }

  async function deletePost() {
    'use server'
    
    const user = await getSession()
    if (!user || user.id !== post.authorId) {
      return
    }

    await prisma.post.delete({
      where: { id: postId }
    })

    redirect('/')
  }

  async function deleteComment(commentId: number) {
    'use server'
    
    const user = await getSession()
    if (!user) return

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (comment && comment.authorId === user.id) {
      await prisma.comment.delete({
        where: { id: commentId }
      })
    }

    redirect(`/posts/${postId}`)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
          Back to Blog
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <article className="prose max-w-none">
            {post.content}
          </article>
          <p className="text-sm text-gray-500 mt-4">By {post.author.username}</p>
          
          {user && user.id === post.authorId && (
            <div className="flex gap-4 mt-4">
              <Link 
                href={`/posts/${postId}/edit`} 
                data-testid="edit-post-button"
                className="text-blue-500 hover:underline"
              >
                Edit
              </Link>
              <DeleteButton onDelete={deletePost} />
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          
          {user ? (
            <form action={addComment} className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium mb-2">
                Comment
              </label>
              <textarea
                id="comment"
                name="content"
                required
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
              <button
                type="submit"
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          ) : (
            <p className="mb-6">Please login to add a comment</p>
          )}

          <div className="space-y-4">
            {post.comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                user={user}
                deleteComment={deleteComment}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
