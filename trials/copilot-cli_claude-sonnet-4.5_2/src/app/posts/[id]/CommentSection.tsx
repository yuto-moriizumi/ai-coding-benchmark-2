'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SessionData } from '@/lib/session'

type Comment = {
  id: number
  content: string
  authorId: number
  author: {
    username: string
  }
  createdAt: Date
}

export default function CommentSection({
  postId,
  comments,
  session,
}: {
  postId: number
  comments: Comment[]
  session: SessionData
}) {
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText, postId }),
    })

    if (response.ok) {
      setCommentText('')
      router.refresh()
    } else {
      alert('Failed to add comment')
    }
  }

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleUpdate = async (commentId: number) => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    })

    if (response.ok) {
      setEditingId(null)
      setEditContent('')
      router.refresh()
    } else {
      alert('Failed to update comment')
    }
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      router.refresh()
    } else {
      alert('Failed to delete comment')
    }
  }

  return (
    <div className="comments-section">
      <h2 className="comments-title">Comments</h2>

      {session.isLoggedIn ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <label htmlFor="comment" className="form-label">Comment</label>
          <textarea
            id="comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            rows={4}
            className="form-textarea"
            style={{ marginBottom: '0.5rem' }}
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      ) : (
        <p style={{ marginBottom: '2rem', color: '#6b7280' }}>Please login to add a comment</p>
      )}

      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            {editingId === comment.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleUpdate(comment.id)
                }}
                className="comment-edit-form"
              >
                <textarea
                  name="content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  rows={4}
                  className="form-textarea"
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="comment-content">{comment.content}</p>
                <p className="post-meta">
                  by {comment.author.username} on{' '}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                {session.userId === comment.authorId && (
                  <div className="comment-actions">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handleEdit(comment)
                      }}
                      className="link"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="link"
                      style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: '#dc2626' }}
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
    </div>
  )
}
