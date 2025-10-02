import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function NewPostPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  async function createPost(formData: FormData) {
    'use server'

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
    })

    redirect(`/posts/${post.id}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Create New Post</h1>
      <form action={createPost}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            required
            rows={10}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Publish Post
        </button>
      </form>
    </div>
  )
}
