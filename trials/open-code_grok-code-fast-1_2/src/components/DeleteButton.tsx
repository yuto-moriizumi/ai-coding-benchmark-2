'use client';

interface DeleteButtonProps {
  action: string;
  method?: string;
  children: React.ReactNode;
}

export default function DeleteButton({ action, method = 'POST', children }: DeleteButtonProps) {
  return (
    <form action={action} method={method} className="inline">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        className="text-red-600 hover:text-red-800"
      >
        {children}
      </button>
    </form>
  );
}