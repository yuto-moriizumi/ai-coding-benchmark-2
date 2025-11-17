'use client';

import { useTransition } from 'react';

export function DeletePostButton({ 
  deleteAction,
  postId 
}: { 
  deleteAction: (formData: FormData) => void;
  postId: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      startTransition(() => {
        const formData = new FormData();
        formData.append('postId', postId.toString());
        deleteAction(formData);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}

export function DeleteCommentButton({ 
  deleteAction,
  commentId,
  postId 
}: { 
  deleteAction: (formData: FormData) => void;
  commentId: number;
  postId: number;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      startTransition(() => {
        const formData = new FormData();
        formData.append('commentId', commentId.toString());
        formData.append('postId', postId.toString());
        deleteAction(formData);
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-red-500 hover:underline text-sm disabled:opacity-50"
    >
      Delete
    </button>
  );
}
