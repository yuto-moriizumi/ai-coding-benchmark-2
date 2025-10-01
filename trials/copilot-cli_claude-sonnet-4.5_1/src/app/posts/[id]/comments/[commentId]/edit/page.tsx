import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string; commentId: string }>;
}) {
  const { id, commentId } = await params;
  const postId = parseInt(id);
  const commentIdNum = parseInt(commentId);
  
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentIdNum }
  });

  if (!comment) {
    notFound();
  }

  if (comment.authorId !== user.id) {
    redirect(`/posts/${postId}`);
  }

  async function updateComment(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user || !comment || user.id !== comment.authorId) {
      redirect('/login');
    }

    const content = formData.get('content') as string;

    if (!content) {
      return;
    }

    await prisma.comment.update({
      where: { id: commentIdNum },
      data: {
        content
      }
    });

    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
  }

  return (
    <div style={{maxWidth: '42rem', margin: '2rem auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Edit Comment</h1>
      <form action={updateComment}>
        <div className="form-group">
          <label htmlFor="content">Comment</label>
          <textarea
            id="content"
            name="content"
            required
            rows={5}
            defaultValue={comment.content}
          />
        </div>
        <button type="submit" className="btn">
          Update
        </button>
      </form>
    </div>
  );
}
