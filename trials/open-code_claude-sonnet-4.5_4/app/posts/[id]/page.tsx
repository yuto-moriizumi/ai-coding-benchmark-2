import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
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
  
  async function deletePost() {
    'use server'
    
    const session = await getSession()
    const { id } = await params
    
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    })
    
    if (post && post.authorId === session.userId) {
      await prisma.post.delete({
        where: { id: parseInt(id) }
      })
    }
    
    redirect('/')
  }
  
  async function createComment(formData: FormData) {
    'use server'
    
    const session = await getSession()
    const { id } = await params
    
    if (!session.isLoggedIn || !session.userId) {
      return
    }
    
    const content = formData.get('content') as string
    
    if (content) {
      await prisma.comment.create({
        data: {
          content,
          postId: parseInt(id),
          authorId: session.userId,
        }
      })
      
      redirect(`/posts/${id}`)
    }
  }
  
  async function deleteComment(formData: FormData) {
    'use server'
    
    const session = await getSession()
    const { id } = await params
    const commentId = parseInt(formData.get('commentId') as string)
    
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })
    
    if (comment && comment.authorId === session.userId) {
      await prisma.comment.delete({
        where: { id: commentId }
      })
    }
    
    redirect(`/posts/${id}`)
  }
  
  const isAuthor = session.userId === post.authorId
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/" className="text-blue-500 hover:underline mb-4 block">
        Back to Blog
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-4">
        by {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
      </p>
      
      <article className="mb-6 whitespace-pre-wrap">{post.content}</article>
      
      {isAuthor && (
        <div className="flex gap-4 mb-6">
          <Link
            href={`/posts/${post.id}/edit`}
            data-testid="edit-post-button"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <form action={deletePost}>
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </form>
        </div>
      )}
      
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        
        {session.isLoggedIn ? (
          <form action={createComment} className="mb-6">
            <label htmlFor="comment" className="block mb-1">Comment</label>
            <textarea
              id="comment"
              name="content"
              rows={3}
              className="w-full p-2 border rounded mb-2"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Submit
            </button>
          </form>
        ) : (
          <p className="mb-6">Please login to add a comment</p>
        )}
        
        <div className="space-y-4">
          {post.comments.map(comment => (
            <div key={comment.id} className="border p-4 rounded">
              <p className="mb-2">{comment.content}</p>
              <p className="text-sm text-gray-600">
                by {comment.author.username} on {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {session.userId === comment.authorId && (
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/posts/${post.id}/comments/${comment.id}/edit`}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                  <form action={deleteComment} className="inline">
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button
                      type="submit"
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
