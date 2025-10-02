import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/session';
import { notFound, redirect } from 'next/navigation';

async function updateComment(formData: FormData){
  'use server';
  const user = await requireUser();
  const id = Number(formData.get('commentId'));
  const content = String(formData.get('content')||'').trim();
  const comment = await prisma.comment.findUnique({ where: { id } });
  if(!comment) return;
  if(comment.authorId !== user.id) return;
  await prisma.comment.update({ where: { id }, data: { content } });
  redirect(`/posts/${comment.postId}`);
}

export default async function EditComment({ params }: { params: Promise<{ id: string }> } ){
  const user = await requireUser().catch(()=>null);
  if(!user) redirect('/login');
  const { id: idParam } = await params;
  const id = Number(idParam);
  const comment = await prisma.comment.findUnique({ where: { id } });
  if(!comment) notFound();
  if(comment.authorId !== user.id) redirect(`/posts/${comment.postId}`);
  return (
    <div>
      <h1 className='text-xl mb-4'>Edit Comment</h1>
      <form id='edit-comment-form' action={updateComment} className='flex flex-col gap-2'>
        <input type='hidden' name='commentId' value={comment.id} />
        <textarea name='content' className='border p-1' defaultValue={comment.content} />
        <button type='submit' className='bg-blue-600 text-white px-3 py-1'>Update</button>
      </form>
    </div>
  );
}
