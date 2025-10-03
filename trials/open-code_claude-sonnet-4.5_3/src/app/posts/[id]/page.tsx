import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DeletePostButton, DeleteCommentButton } from '@/components/DeleteButton'

async function addComment(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const postId = parseInt(formData.get('postId') as string)
  const content = formData.get('content') as string
  
  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.id
    }
  })
  
  revalidatePath(`/posts/${postId}`)
}

async function deletePost(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const postId = parseInt(formData.get('postId') as string)
  
  const post = await prisma.post.findUnique({
    where: { id: postId }
  })
  
  if (post?.authorId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  await prisma.post.delete({
    where: { id: postId }
  })
  
  redirect('/')
}

async function deleteComment(formData: FormData) {
  'use server'
  
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  
  const commentId = parseInt(formData.get('commentId') as string)
  const postId = parseInt(formData.get('postId') as string)
  
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  })
  
  if (comment?.authorId !== session.id) {
    throw new Error('Unauthorized')
  }
  
  await prisma.comment.delete({
    where: { id: commentId }
  })
  
  revalidatePath(`/posts/${postId}`)
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parseInt(id)
  const session = await getSession()
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, username: true }
      },
      comments: {
        include: {
          author: {
            select: { id: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!post) {
    notFound()
  }
  
  const isAuthor = session?.id === post.authorId

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-500 mb-4 inline-block">Back to Blog</Link>
        
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            {isAuthor && (
              <div className="flex gap-2">
                <Link 
                  href={`/posts/${post.id}/edit`}
                  data-testid="edit-post-button"
                  className="text-blue-500"
                >
                  Edit
                </Link>
                <DeletePostButton postId={post.id} onDelete={deletePost} />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">By {post.author.username}</p>
          <article className="prose max-w-none">{post.content}</article>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          
          {session ? (
            <form action={addComment} className="mb-8">
              <input type="hidden" name="postId" value={post.id} />
              <div className="mb-4">
                <label htmlFor="comment" className="block mb-2">Comment</label>
                <textarea
                  id="comment"
                  name="content"
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                Submit
              </button>
            </form>
          ) : (
            <p className="mb-8">Please login to add a comment</p>
          )}

          <div className="space-y-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="border p-4 rounded">
                <p className="mb-2">{comment.content}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">By {comment.author.username}</p>
                  {session?.id === comment.authorId && (
                    <div className="flex gap-2">
                      <Link 
                        href={`/posts/${post.id}/comments/${comment.id}/edit`}
                        className="text-blue-500 text-sm"
                      >
                        Edit
                      </Link>
                      <DeleteCommentButton 
                        commentId={comment.id} 
                        postId={post.id}
                        onDelete={deleteComment} 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
