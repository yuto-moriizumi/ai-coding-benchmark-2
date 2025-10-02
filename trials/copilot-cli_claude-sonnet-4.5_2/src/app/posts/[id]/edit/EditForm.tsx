'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Post = {
  id: number
  title: string
  content: string
}

export default function EditForm({ post }: { post: Post }) {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const response = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })

    const data = await response.json()

    if (response.ok) {
      router.push(`/posts/${post.id}`)
      router.refresh()
    } else {
      setError(data.error || 'Failed to update post')
    }
  }

  return (
    <>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="form-textarea"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Post
        </button>
      </form>
    </>
  )
}
