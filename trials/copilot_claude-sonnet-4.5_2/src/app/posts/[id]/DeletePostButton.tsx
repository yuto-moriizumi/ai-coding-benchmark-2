"use client";

import { deletePost } from "@/app/actions/posts";
import { useEffect, useRef } from "react";

export default function DeletePostButton({ postId }: { postId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleSubmit = (e: SubmitEvent) => {
      if (!confirm("Are you sure you want to delete this post?")) {
        e.preventDefault();
      }
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  return (
    <form
      ref={formRef}
      action={deletePost.bind(null, postId)}
      style={{ display: "inline" }}
    >
      <button type="submit" className="text-red-600 hover:underline">
        Delete
      </button>
    </form>
  );
}
