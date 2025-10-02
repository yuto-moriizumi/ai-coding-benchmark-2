'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })

    const data = await response.json()

    if (response.ok) {
      router.push(`/posts/${data.post.id}`)
      router.refresh()
    } else {
      if (response.status === 401) {
        router.push('/login')
      } else {
        setError(data.error || 'Failed to create post')
      }
    }
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Create New Post</h1>
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
          Publish Post
        </button>
      </form>
    </div>
  )
}
