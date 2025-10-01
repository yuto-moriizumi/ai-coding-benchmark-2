import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);
  
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.id) {
    redirect(`/posts/${postId}`);
  }

  async function updatePost(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user || !post || user.id !== post.authorId) {
      redirect('/login');
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      return;
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content
      }
    });

    redirect(`/posts/${postId}`);
  }

  return (
    <div style={{maxWidth: '42rem', margin: '2rem auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Edit Post</h1>
      <form action={updatePost}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post.title}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            defaultValue={post.content}
          />
        </div>
        <button type="submit" className="btn">
          Update Post
        </button>
      </form>
    </div>
  );
}
