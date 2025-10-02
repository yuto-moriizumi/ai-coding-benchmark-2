import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== user.id) {
    redirect('/')
  }

  async function updatePost(formData: FormData) {
    'use server'

    const user = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }

    const postId = formData.get('postId') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    })

    if (!post || post.authorId !== user.id) {
      throw new Error('Unauthorized')
    }

    await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        title,
        content,
      },
    })

    revalidatePath(`/posts/${postId}`)
    redirect(`/posts/${postId}`)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>Edit Post</h1>
      <form action={updatePost}>
        <input type="hidden" name="postId" value={post.id} />
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post.title}
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
            defaultValue={post.content}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Update Post
        </button>
      </form>
    </div>
  )
}
