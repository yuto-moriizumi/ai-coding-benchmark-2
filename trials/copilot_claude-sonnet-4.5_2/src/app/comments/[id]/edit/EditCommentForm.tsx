"use client";

import { updateCommentById } from "./actions";

export default function EditCommentForm({
  commentId,
  initialContent,
}: {
  commentId: number;
  initialContent: string;
}) {
  async function handleSubmit(formData: FormData) {
    await updateCommentById(commentId, formData);
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label htmlFor="content" className="block mb-2">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={initialContent}
          required
          rows={6}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update
      </button>
    </form>
  );
}
