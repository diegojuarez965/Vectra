"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  // Si solo hay 1 página (o ninguna), no mostramos los controles
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4 border-t border-foreground/10 mt-8">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1 || disabled}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Anterior
      </button>

      <span className="text-sm font-medium text-foreground/80">
        Página <span className="text-primary font-bold">{currentPage}</span>{" "}
        de {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages || disabled}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Siguiente
      </button>
    </div>
  );
}
