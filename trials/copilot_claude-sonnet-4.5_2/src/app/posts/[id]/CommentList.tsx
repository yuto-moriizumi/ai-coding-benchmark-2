"use client";

import { deleteComment } from "@/app/actions/comments";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Comment = {
  id: number;
  content: string;
  createdAt: Date;
  author: {
    username: string;
  };
  authorId: number;
};

function DeleteCommentButton({ commentId }: { commentId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleSubmit = (e: SubmitEvent) => {
      if (!confirm("Are you sure you want to delete this comment?")) {
        e.preventDefault();
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  return (
    <form
      ref={formRef}
      action={deleteComment.bind(null, commentId)}
      style={{ display: "inline" }}
    >
      <button type="submit" className="text-red-600 hover:underline text-sm">
        Delete
      </button>
    </form>
  );
}

export default function CommentList({
  comments,
  currentUserId,
}: {
  comments: Comment[];
  currentUserId?: number;
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border p-4 rounded">
          <div className="font-semibold">{comment.author.username}</div>
          <div className="text-gray-600 text-sm mb-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
          <div className="whitespace-pre-wrap mb-2">{comment.content}</div>

          {currentUserId === comment.authorId && (
            <div className="flex gap-4">
              <Link
                href={`/comments/${comment.id}/edit`}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </Link>
              <DeleteCommentButton commentId={comment.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
