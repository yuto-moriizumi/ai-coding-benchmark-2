import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  async function createPost(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user) {
      redirect('/login');
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
      return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id
      }
    });

    redirect(`/posts/${post.id}`);
  }

  return (
    <div style={{maxWidth: '42rem', margin: '2rem auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>Create New Post</h1>
      <form action={createPost}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
          />
        </div>
        <button type="submit" className="btn">
          Publish Post
        </button>
      </form>
    </div>
  );
}
