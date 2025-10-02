import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  async function addComment(formData: FormData) {
    'use server'

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const content = formData.get('content') as string
    const postId = formData.get('postId') as string

    await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: user.id,
      },
    })

    revalidatePath(`/posts/${postId}`)
  }

  async function deletePost() {
    'use server'

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const postIdStr = id
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postIdStr) },
    })

    if (!post || post.authorId !== user.id) {
      throw new Error('Unauthorized')
    }

    await prisma.post.delete({
      where: { id: parseInt(postIdStr) },
    })

    redirect('/')
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <Link href="/">Back to Blog</Link>

      <article style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h1>{post.title}</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
      </article>

      {user && user.id === post.authorId && (
        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
          <Link href={`/posts/${post.id}/edit`} data-testid="edit-post-button">
            Edit
          </Link>
          <form action={deletePost}>
            <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>
              Delete
            </button>
          </form>
        </div>
      )}

      <section style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h2>Comments</h2>

        {user ? (
          <form action={addComment} style={{ marginTop: '20px', marginBottom: '30px' }}>
            <input type="hidden" name="postId" value={post.id} />
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                name="content"
                rows={4}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px' }}>
              Submit
            </button>
          </form>
        ) : (
          <p>Please login to add a comment</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {post.comments.map((comment) => {
            async function deleteComment() {
              'use server'
              const user = await getCurrentUser()
              if (!user) redirect('/login')
              
              const commentToDelete = await prisma.comment.findUnique({
                where: { id: comment.id },
              })
              
              if (!commentToDelete || commentToDelete.authorId !== user.id) {
                throw new Error('Unauthorized')
              }
              
              await prisma.comment.delete({
                where: { id: comment.id },
              })
              
              revalidatePath(`/posts/${post.id}`)
            }

            return (
              <div key={comment.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <p>{comment.content}</p>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '5px' }}>
                  By {comment.author.username} on {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                {user && user.id === comment.authorId && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <Link href={`/posts/${post.id}/comments/${comment.id}/edit`}>Edit</Link>
                    <form action={deleteComment}>
                      <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
