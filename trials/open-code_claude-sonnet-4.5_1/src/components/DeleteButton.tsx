'use client'

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  async function handleDelete() {
    if (confirm('Are you sure you want to delete this?')) {
      await onDelete()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 text-sm hover:underline"
    >
      Delete
    </button>
  )
}
