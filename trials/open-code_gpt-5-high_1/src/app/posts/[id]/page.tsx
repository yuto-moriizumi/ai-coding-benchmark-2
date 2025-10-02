import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function deletePostAction(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const user = await getCurrentUser();
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) redirect('/');
  if (!user || post.authorId !== user.id) redirect('/');
  await prisma.comment.deleteMany({ where: { postId: id } });
  await prisma.post.delete({ where: { id } });
  redirect('/');
}

async function addCommentAction(formData: FormData) {
  'use server';
  const user = await getCurrentUser();
  const postId = Number(formData.get('postId'));
  if (!user) redirect('/login');
  const content = (formData.get('content') as string).trim();
  if (!content) redirect(`/posts/${postId}`);
  await prisma.comment.create({ data: { content, postId, authorId: user.id } });
  redirect(`/posts/${postId}`);
}

export default async function PostDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({ where: { id }, include: { comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }, author: true } });
  const user = await getCurrentUser();
  if (!post) return <div>Not found</div>;
  return (
    <div>
      <h1>{post.title}</h1>
      <article>{post.content}</article>
      <p>by {post.author.username}</p>
      <a href="/">Back to Blog</a>
      {user && user.id === post.authorId && (
        <div style={{ display: 'flex', gap: 8 }}>
          <a data-testid="edit-post-button" href={`/posts/${post.id}/edit`}>Edit</a>
          <form action={deletePostAction} onSubmit={(e) => { if(!globalThis.confirm || !confirm('Are you sure?')) { e.preventDefault(); } }}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit">Delete</button>
          </form>
        </div>
      )}
      <section>
        <h2>Comments</h2>
        {post.comments.length === 0 && <p>No comments yet.</p>}
        <ul>
          {post.comments.map(c => (
            <li key={c.id}>
              <div><strong>{c.author.username}:</strong> {c.content}</div>
              {user && user.id === c.authorId && (
                <span style={{ marginLeft: 8 }}><a href={`/posts/${post.id}/comments/${c.id}/edit`}>Edit</a></span>
              )}
              {user && user.id === c.authorId && (
                <form action={async (fd) => { 'use server'; const current = await getCurrentUser(); if(!current) redirect('/login'); const cid = Number(fd.get('cid')); await prisma.comment.delete({ where: { id: cid } }); }} onSubmit={(e) => { if(!globalThis.confirm || !confirm('Delete comment?')) { e.preventDefault(); } }} style={{ display: 'inline' }}>
                  <input type="hidden" name="cid" value={c.id} />
                  <button type="submit">Delete</button>
                </form>
              )}
            </li>
          ))}
        </ul>
        {user ? (
          <form action={addCommentAction}>
            <label>Comment<textarea name="content" required /></label>
            <input type="hidden" name="postId" value={post.id} />
            <button type="submit">Submit</button>
          </form>
        ) : (
          <p>Please login to add a comment</p>
        )}
      </section>
    </div>
  );
}