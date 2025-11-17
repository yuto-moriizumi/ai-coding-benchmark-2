'use client'

export default function DeleteCommentButton({ commentId }: { commentId: number }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      e.preventDefault()
    }
  }
  
  return (
    <form action="" method="POST" onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="commentId" value={commentId} />
      <button
        type="submit"
        className="text-red-500 hover:underline text-sm"
      >
        Delete
      </button>
    </form>
  )
}
