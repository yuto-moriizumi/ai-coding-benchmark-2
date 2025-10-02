import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { NewPostForm } from '@/components/NewPostForm'

export default async function NewPost() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <NewPostForm />
    </div>
  )
}