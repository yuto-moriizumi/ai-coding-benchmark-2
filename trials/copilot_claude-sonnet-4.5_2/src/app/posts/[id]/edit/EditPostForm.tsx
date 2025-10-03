"use client";

import { updatePostById } from "./actions";

export default function EditPostForm({
  postId,
  initialTitle,
  initialContent,
}: {
  postId: number;
  initialTitle: string;
  initialContent: string;
}) {
  async function handleSubmit(formData: FormData) {
    await updatePostById(postId, formData);
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label htmlFor="title" className="block mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={initialTitle}
          required
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="content" className="block mb-2">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={initialContent}
          required
          rows={10}
          className="w-full border p-2 rounded"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Post
      </button>
    </form>
  );
}
