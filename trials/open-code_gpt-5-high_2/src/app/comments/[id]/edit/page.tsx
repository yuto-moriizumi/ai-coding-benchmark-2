import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { redirect } from 'next/navigation';

async function updateComment(formData: FormData) {
  'use server';
  const user = await requireUser();
  const id = Number(formData.get('id'));
  const content = String(formData.get('content')||'');
  const comment = await prisma.comment.findUnique({ where: { id }, include: { post: true } });
  if (comment && comment.authorId === user.id) {
    await prisma.comment.update({ where: { id }, data: { content } });
    redirect(`/posts/${comment.postId}`);
  }
  redirect('/');
}

export default async function EditCommentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id: idParam } = await params;
  const id = Number(idParam);
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return <div>Not found</div>;
  if (comment.authorId !== user.id) return <div>Forbidden</div>;
  return (
    <div>
      <h1>Edit Comment</h1>
      <form action={updateComment}>
        <input type="hidden" name="id" value={comment.id} />
        <textarea name="content" aria-label="content" defaultValue={comment.content} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
