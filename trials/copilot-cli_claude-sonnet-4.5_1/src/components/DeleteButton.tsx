'use client';

export function DeleteButton({ onDelete, text = 'Delete', className = '' }: { onDelete: () => void, text?: string, className?: string }) {
  return (
    <button
      type="submit"
      className={className || 'btn btn-danger'}
      onClick={(e) => {
        if (!confirm(`Are you sure you want to delete this ${text.toLowerCase()}?`)) {
          e.preventDefault();
        }
      }}
    >
      {text}
    </button>
  );
}
