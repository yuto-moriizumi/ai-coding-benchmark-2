import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);
  
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
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!post) {
    notFound();
  }

  const user = await getCurrentUser();

  async function addComment(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user) {
      return;
    }

    const content = formData.get('content') as string;
    if (!content) {
      return;
    }

    await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id
      }
    });

    revalidatePath(`/posts/${postId}`);
  }

  async function deletePost(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user || !post || user.id !== post.authorId) {
      return;
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    redirect('/');
  }

  async function deleteComment(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user) {
      return;
    }

    const commentId = parseInt(formData.get('commentId') as string);
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.authorId !== user.id) {
      return;
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    revalidatePath(`/posts/${postId}`);
  }

  return (
    <div style={{maxWidth: '800px', margin: '2rem auto'}}>
      <div style={{marginBottom: '1rem'}}>
        <Link href="/" style={{color: '#3b82f6', textDecoration: 'none'}}>
          Back to Blog
        </Link>
      </div>

      <div style={{marginBottom: '2rem'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>{post.title}</h1>
        <p className="post-meta">
          By {post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <article style={{marginTop: '1rem', whiteSpace: 'pre-wrap'}}>
          {post.content}
        </article>

        {user && user.id === post.author.id && (
          <div style={{marginTop: '1rem'}}>
            <Link
              href={`/posts/${post.id}/edit`}
              data-testid="edit-post-button"
              className="btn btn-warning"
              style={{marginRight: '0.5rem'}}
            >
              Edit
            </Link>
            <form action={deletePost} method="POST" style={{display: 'inline'}}>
              <DeleteButton onDelete={() => {}} text="Delete" />
            </form>
          </div>
        )}
      </div>

      <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '2rem'}}>
        <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem'}}>Comments</h2>

        {user ? (
          <form action={addComment} style={{marginBottom: '2rem'}}>
            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                name="content"
                required
                rows={3}
              />
            </div>
            <button type="submit" className="btn">
              Submit
            </button>
          </form>
        ) : (
          <p style={{marginBottom: '2rem', color: '#6b7280'}}>Please login to add a comment</p>
        )}

        <div>
          {post.comments.map(comment => (
            <div key={comment.id} className="comment">
              <p style={{marginBottom: '0.5rem'}}>{comment.content}</p>
              <p className="comment-meta">
                By {comment.author.username} • {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {user && user.id === comment.author.id && (
                <div className="comment-actions">
                  <Link
                    href={`/posts/${post.id}/comments/${comment.id}/edit`}
                  >
                    Edit
                  </Link>
                  <form action={deleteComment} method="POST" style={{display: 'inline'}}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <DeleteButton onDelete={() => {}} text="Delete" />
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
