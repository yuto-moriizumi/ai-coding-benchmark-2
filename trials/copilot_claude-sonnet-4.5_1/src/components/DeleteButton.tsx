"use client";

export function DeleteButton({
  action,
  name,
  value,
  text = "Delete",
}: {
  action: (formData: FormData) => void;
  name: string;
  value: string | number;
  text?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={name} value={value} />
      <button
        type="submit"
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this?")) {
            e.preventDefault();
          }
        }}
      >
        {text}
      </button>
    </form>
  );
}

export function DeleteCommentButton({
  action,
  commentId,
  postId,
}: {
  action: (formData: FormData) => void;
  commentId: number;
  postId: number;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="postId" value={postId} />
      <button
        type="submit"
        className="text-red-600 hover:underline text-sm"
        onClick={(e) => {
          if (!confirm("Are you sure you want to delete this comment?")) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
