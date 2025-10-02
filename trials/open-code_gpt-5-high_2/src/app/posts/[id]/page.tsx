import { prisma } from '../../../lib/prisma';
import { getCurrentUser, requireUser } from '../../../lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function addComment(formData: FormData) {
  'use server';
  const user = await getCurrentUser();
  if (!user) return { error: 'Please login to add a comment' };
  const postId = Number(formData.get('postId'));
  const content = String(formData.get('content')||'').trim();
  if (!content) return { error: 'Content required' };
  await prisma.comment.create({ data: { content, postId, authorId: user.id } });
  redirect(`/posts/${postId}`);
}

async function deletePost(formData: FormData) {
  'use server';
  const user = await requireUser();
  const postId = Number(formData.get('postId'));
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId === user.id) {
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });
  }
  redirect('/');
}

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const post = await prisma.post.findUnique({ where: { id }, include: { author: true, comments: { include: { author: true }, orderBy: { createdAt: 'asc' } } } });
  if (!post) return <div>Not found</div>;
  const user = await getCurrentUser();
  return (
    <div>
      <Link href="/">Back to Blog</Link>
      <h1>{post.title}</h1>
      <article>{post.content}</article>
      {user && user.id === post.authorId && (
        <div className="flex gap-2 mt-4">
          <Link data-testid="edit-post-button" href={`/posts/${post.id}/edit`}>Edit</Link>
          <form action={deletePost}>
            <input type="hidden" name="postId" value={post.id} />
            <button type="submit">Delete</button>
          </form>
        </div>
      )}
      <section className="mt-6">
        <h2>Comments</h2>
        <ul>
          {post.comments.map(c => (
            <li key={c.id}>
              <div>{c.content} - {c.author.username} {user && user.id===c.authorId && (<><Link href={`/comments/${c.id}/edit`}>Edit</Link> <form style={{display:'inline'}} action={async (fd: FormData)=>{ 'use server'; const user= await requireUser(); const cid=Number(fd.get('commentId')); const comment= await prisma.comment.findUnique({ where:{ id: cid }}); if(comment && comment.authorId===user.id){ await prisma.comment.delete({ where:{ id: cid }});} redirect(`/posts/${post.id}`); }} ><input type="hidden" name="commentId" value={c.id} /><button type="submit">Delete</button></form></>)}</div>
            </li>
          ))}
        </ul>
        {user ? (
          <form action={addComment}>
            <input type="hidden" name="postId" value={post.id} />
            <label>Comment<textarea name="content" aria-label="Comment" /></label>
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>Please login to add a comment</p>
        )}
      </section>
    </div>
  );
}
