'use client'

export default function DeletePostButton({ postId }: { postId: number }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      e.preventDefault()
    }
  }
  
  return (
    <form action={`/posts/${postId}/delete`} method="POST" onSubmit={handleSubmit}>
      <button
        type="submit"
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </form>
  )
}
