'use client';

export function DeleteButton({
  onDelete,
  confirmMessage,
  children,
  className,
}: {
  onDelete: () => void;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    } else {
      onDelete();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
