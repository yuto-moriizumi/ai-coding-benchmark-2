import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/session';
import { notFound, redirect } from 'next/navigation';

async function updatePost(formData: FormData){
  'use server';
  const user = await requireUser();
  const postId = Number(formData.get('postId'));
  const title = String(formData.get('title')||'').trim();
  const content = String(formData.get('content')||'').trim();
  const post = await prisma.post.findUnique({ where: { id: postId }});
  if(!post) return;
  if(post.authorId !== user.id) return;
  await prisma.post.update({ where: { id: postId }, data: { title, content }});
  redirect(`/posts/${postId}`);
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> } ){
  const user = await requireUser().catch(()=>null);
  if(!user) redirect('/login');
  const { id: idParam } = await params;
  const id = Number(idParam);
  const post = await prisma.post.findUnique({ where: { id } });
  if(!post) notFound();
  if(post.authorId !== user.id) redirect(`/posts/${id}`);
  return (
    <div>
      <h1 className="text-xl mb-4">Edit Post</h1>
      <form id="edit-post-form" action={updatePost} className="flex flex-col gap-2">
        <input type="hidden" name="postId" value={post.id} />
        <label>Title<input id="title" name="title" defaultValue={post.title} className="border p-1" /></label>
        <label>Content<textarea id="content" name="content" defaultValue={post.content} className="border p-1" /></label>
        <button type="submit" className="bg-blue-600 text-white px-3 py-1">Update Post</button>
      </form>
    </div>
  );
}
