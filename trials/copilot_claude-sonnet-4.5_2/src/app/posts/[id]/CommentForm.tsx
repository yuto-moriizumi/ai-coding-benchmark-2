"use client";

import { createComment } from "@/app/actions/comments";
import { useRef } from "react";

export default function CommentForm({ postId }: { postId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createComment(postId, formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mb-8">
      <div className="mb-4">
        <label htmlFor="comment-content" className="block mb-2">
          Comment
        </label>
        <textarea
          id="comment-content"
          name="content"
          required
          rows={4}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
