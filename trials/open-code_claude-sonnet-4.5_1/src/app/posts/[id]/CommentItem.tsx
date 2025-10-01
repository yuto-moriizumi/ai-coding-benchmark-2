'use client'

import { useState } from 'react'
import { CommentEditForm } from '@/components/CommentEditForm'
import { DeleteButton } from '@/components/DeleteButton'

export function CommentItem({ 
  comment, 
  user,
  deleteComment
}: { 
  comment: any
  user: any
  deleteComment: (id: number) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="border p-4 rounded">
      {editing ? (
        <CommentEditForm
          commentId={comment.id}
          initialContent={comment.content}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <p>{comment.content}</p>
          <p className="text-sm text-gray-500 mt-2">By {comment.author.username}</p>
          
          {user && user.id === comment.authorId && (
            <div className="flex gap-4 mt-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setEditing(true)
                }}
                className="text-blue-500 text-sm hover:underline"
              >
                Edit
              </a>
              <DeleteButton onDelete={() => deleteComment(comment.id)} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
