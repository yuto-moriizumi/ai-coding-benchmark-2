import { prisma } from '../../../lib/prisma';
import { getSessionUser, requireUser } from '../../../lib/session';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

async function addComment(formData: FormData){
  'use server';
  const user = await getSessionUser();
  if(!user) return { error: 'Not logged in'};
  const postId = Number(formData.get('postId'));
  const content = String(formData.get('content')||'').trim();
  if(!content) return { error: 'Empty'};
  await prisma.comment.create({ data: { content, postId, authorId: user.id } });
  redirect(`/posts/${postId}`);
}

async function deletePost(formData: FormData){
  'use server';
  const user = await requireUser();
  const postId = Number(formData.get('postId'));
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if(!post) return;
  if(post.authorId !== user.id) return;
  await prisma.comment.deleteMany({ where: { postId }});
  await prisma.post.delete({ where: { id: postId }});
  redirect('/');
}

async function deleteComment(formData: FormData){
  'use server';
  const user = await requireUser();
  const cid = Number(formData.get('cid'));
  const comment = await prisma.comment.findUnique({ where: { id: cid } });
  if(!comment) return;
  if(comment.authorId !== user.id) return;
  const postId = comment.postId;
  await prisma.comment.delete({ where: { id: cid }});
  redirect(`/posts/${postId}`);
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }){
  const { id: idParam } = await params;
  const id = Number(idParam);
  const post = await prisma.post.findUnique({ where: { id }, include: { author: true, comments: { include: { author: true }, orderBy: { id: 'asc' } } } });
  if(!post) notFound();
  const user = await getSessionUser();
  return (
    <div>
      <h1>{post.title}</h1>
      <article className="my-4 whitespace-pre-wrap">{post.content}</article>
      <p className="text-sm text-gray-600">By {post.author.username}</p>
      {user?.id === post.authorId && (
        <div className="flex gap-2 my-4">
          <Link data-testid="edit-post-button" className="underline" href={`/posts/${post.id}/edit`}>Edit</Link>
          <form action={deletePost}>
            <input type="hidden" name="postId" value={post.id} />
            <button className="text-red-600" type="submit" formAction={deletePost}>Delete</button>
          </form>
        </div>
      )}
      <hr className="my-4" />
      <h2 className="font-semibold mb-2">Comments</h2>
      <div className="space-y-2 mb-4">
        {post.comments.map(c => (
          <div key={c.id} className="border p-2">
            <p>{c.content}</p>
            <p className="text-xs text-gray-500">by {c.author.username}</p>
            {user?.id === c.authorId && (
              <div className="flex gap-2 text-sm mt-1">
                <Link href={`/comments/${c.id}/edit`} className="underline">Edit</Link>
                <form action={deleteComment}>
                  <input type="hidden" name="cid" value={c.id} />
                  <button type="submit">Delete</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
      {user ? (
        <form action={addComment} className="flex flex-col gap-2">
          <input type="hidden" name="postId" value={post.id} />
            <label>Comment<textarea name="content" className="border p-1" /></label>
            <button type="submit" className="bg-blue-600 text-white px-2 py-1">Submit</button>
        </form>
      ) : (
        <p>Please login to add a comment</p>
      )}
      <p className="mt-4"><Link href="/">Back to Blog</Link></p>
    </div>
  );
}
