'use client'

import { useState } from 'react'
import { Comment } from '@prisma/client'

interface CommentWithAuthor extends Comment {
  author: {
    id: number
    username: string
  }
}

interface CommentListProps {
  comments: CommentWithAuthor[]
  currentUserId?: number
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  if (comments.length === 0) {
    return <p className="text-gray-600">No comments yet.</p>
  }

  const handleEdit = (comment: CommentWithAuthor) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update comment')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete comment')
      }
    } catch (err) {
      alert('An error occurred')
    }
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium">{comment.author.username}</span>
            <span className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          {editingId === comment.id ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(comment.id); }}>
              <textarea
                name="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 text-sm"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-600 text-white py-1 px-3 rounded-md hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-gray-800">{comment.content}</p>
              {true && (
                <div className="mt-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(comment)
                    }}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}