'use client'

import { useRouter } from 'next/navigation'

export default function DeleteButton({ postId }: { postId: number }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      router.push('/')
      router.refresh()
    } else {
      alert('Failed to delete post')
    }
  }

  return (
    <button onClick={handleDelete} className="btn btn-danger">
      Delete
    </button>
  )
}
