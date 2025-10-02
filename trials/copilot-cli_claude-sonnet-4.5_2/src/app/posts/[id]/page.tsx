import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import DeleteButton from './DeleteButton'
import CommentSection from './CommentSection'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id)

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!post) {
    notFound()
  }

  const session = await getSession()
  const isAuthor = session.userId === post.authorId

  return (
    <div className="container">
      <Link href="/" className="link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Blog
      </Link>

      <h1 className="post-detail-title">{post.title}</h1>
      <p className="post-meta">
        by {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
      </p>

      <article className="article">{post.content}</article>

      {isAuthor && (
        <div className="button-group">
          <Link
            href={`/posts/${post.id}/edit`}
            data-testid="edit-post-button"
            className="btn btn-primary"
          >
            Edit
          </Link>
          <DeleteButton postId={post.id} />
        </div>
      )}

      <CommentSection 
        postId={post.id} 
        comments={post.comments} 
        session={session}
      />
    </div>
  )
}
