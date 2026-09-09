import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm">
      <span className="text-gray-500">
        Page {page + 1} sur {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Page précédente"
          title="Page précédente"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Page suivante"
          title="Page suivante"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
