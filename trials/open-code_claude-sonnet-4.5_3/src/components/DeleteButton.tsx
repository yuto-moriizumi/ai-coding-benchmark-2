'use client'

export function DeletePostButton({ 
  postId,
  onDelete
}: { 
  postId: number
  onDelete: (formData: FormData) => Promise<void>
}) {
  return (
    <form 
      action={onDelete}
      onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this post?')) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" className="text-red-500">
        Delete
      </button>
    </form>
  )
}

export function DeleteCommentButton({ 
  commentId,
  postId,
  onDelete
}: { 
  commentId: number
  postId: number
  onDelete: (formData: FormData) => Promise<void>
}) {
  return (
    <form 
      action={onDelete}
      onSubmit={(e) => {
        if (!confirm('Are you sure you want to delete this comment?')) {
          e.preventDefault()
        }
      }}
      className="inline"
    >
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="postId" value={postId} />
      <button type="submit" className="text-red-500 text-sm">
        Delete
      </button>
    </form>
  )
}
