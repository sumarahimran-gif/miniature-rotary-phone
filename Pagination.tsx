import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  id?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  id = 'pagination',
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endItem =
    totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

  return (
    <div
      id={id}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500"
    >
      <div>
        {startItem && endItem && totalItems ? (
          <span>
            Showing <strong className="text-slate-800 font-medium">{startItem}</strong> to{' '}
            <strong className="text-slate-800 font-medium">{endItem}</strong> of{' '}
            <strong className="text-slate-800 font-medium">{totalItems}</strong> results
          </span>
        ) : (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          id={`${id}-prev`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              id={`${id}-page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          id={`${id}-next`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
