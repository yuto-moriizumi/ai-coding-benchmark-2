'use client'

export default function DeleteButton({ onDelete, children, className }: { onDelete: () => void, children: React.ReactNode, className?: string }) {
  const handleClick = (e: React.FormEvent) => {
    if (!confirm('Are you sure you want to delete this?')) {
      e.preventDefault()
    } else {
      onDelete()
    }
  }
  
  return (
    <button
      type="submit"
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
