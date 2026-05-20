"use client";

export function ConfirmSubmit({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <button
      className="rounded-full bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white"
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
      type="submit"
    >
      {children}
    </button>
  );
}
