'use client'

import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  postId: number
}

export function DeleteButton({ postId }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.href = '/'
      } else {
        alert('Failed to delete post')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  )
}