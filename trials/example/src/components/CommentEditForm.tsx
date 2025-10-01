"use client";

import { useState } from "react";
import Link from "next/link";

interface CommentEditFormProps {
  commentId: number;
  postId: number;
  initialContent: string;
  updateAction: (
    commentId: number,
    postId: number,
    formData: FormData
  ) => Promise<void>;
}

export function CommentEditForm({
  commentId,
  postId,
  initialContent,
  updateAction,
}: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <form
      action={async (formData: FormData) => {
        await updateAction(commentId, postId, formData);
      }}
      className="mt-2"
    >
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-2"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
        >
          Update
        </button>
        <Link
          href={`/posts/${postId}`}
          className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700 text-sm inline-block"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
