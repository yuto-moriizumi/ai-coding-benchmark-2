'use client'

import { useState } from 'react'

export function CommentEditForm({ 
  commentId, 
  initialContent, 
  onCancel 
}: { 
  commentId: number
  initialContent: string
  onCancel: () => void 
}) {
  const [content, setContent] = useState(initialContent)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await fetch(`/posts/comments/${commentId}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    
    window.location.reload()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full border rounded px-3 py-2"
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Update
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
