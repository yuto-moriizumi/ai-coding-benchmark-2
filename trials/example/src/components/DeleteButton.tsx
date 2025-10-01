"use client";

import { useFormStatus } from "react-dom";

export function DeletePostButton({
  message = "Are you sure you want to delete this post?",
}: {
  message?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
        }
      }}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function DeleteCommentButton({
  message = "Are you sure you want to delete this comment?",
}: {
  message?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
        }
      }}
      className="text-red-600 hover:underline text-sm disabled:text-gray-400"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
