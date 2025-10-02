import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function updateCommentAction(formData: FormData) {
  'use server';
  const cid = Number(formData.get('cid'));
  const content = (formData.get('content') as string).trim();
  const user = await getCurrentUser();
  const comment = await prisma.comment.findUnique({ where: { id: cid } });
  if (!comment) redirect('/');
  if (!user || user.id !== comment.authorId) redirect(`/posts/${comment.postId}`);
  await prisma.comment.update({ where: { id: cid }, data: { content } });
  redirect(`/posts/${comment.postId}`);
}

export default async function EditCommentPage({ params }: { params: { id: string, commentId: string } }) {
  const cid = Number(params.commentId);
  const comment = await prisma.comment.findUnique({ where: { id: cid } });
  const user = await getCurrentUser();
  if (!comment) return <div>Not found</div>;
  if (!user) redirect('/login');
  if (user.id !== comment.authorId) redirect(`/posts/${comment.postId}`);
  return (
    <div>
      <h1>Edit Comment</h1>
      <form action={updateCommentAction}>
        <input type="hidden" name="cid" value={comment.id} />
        <textarea name="content" defaultValue={comment.content} required />
        <br />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}