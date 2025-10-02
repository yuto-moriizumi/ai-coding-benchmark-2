'use client';

import { useState } from 'react';

interface EditCommentFormProps {
  commentId: number;
  postId: number;
  initialContent: string;
}

export default function EditCommentForm({ commentId, postId, initialContent }: EditCommentFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'POST',
      body: new URLSearchParams({
        content,
        _method: 'PUT',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
    });

    if (response.status < 400) {
      window.location.href = `/posts/${postId}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          name="content"
          id="content"
          rows={4}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      <div className="mt-2">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update
        </button>
      </div>
    </form>
  );
}