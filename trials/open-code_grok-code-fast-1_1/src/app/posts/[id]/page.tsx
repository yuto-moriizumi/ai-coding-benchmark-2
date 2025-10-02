import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { CommentForm } from '@/components/CommentForm'
import { CommentList } from '@/components/CommentList'
import { DeleteButton } from '@/components/DeleteButton'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const postId = parseInt(id, 10)

  if (isNaN(postId)) {
    notFound()
  }

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
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!post) {
    notFound()
  }

  const user = await getCurrentUser()
  const isAuthor = user?.id === post.author.id

  return (
    <div className="max-w-4xl mx-auto">
      <article className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-6">
          By {post.author.username} on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
          {isAuthor && (
            <>
              <Link href={`/posts/${post.id}/edit`} data-testid="edit-post-button" className="text-green-600 hover:underline">
                Edit
              </Link>
              <DeleteButton postId={post.id} />
            </>
          )}
        </div>
      </article>

      <section>
        <h2 className="text-2xl font-bold mb-4">Comments</h2>
        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-gray-600 mb-4">Please login to add a comment</p>
        )}
        <CommentList comments={post.comments} currentUserId={user?.id} />
      </section>
    </div>
  )
}