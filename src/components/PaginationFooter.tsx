export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationFooter({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between p-4 border-t bg-white">
      <p className="text-sm text-slate-600">
        Showing <b>{limit}</b> of <b>{total}</b>
      </p>

      <div className="flex items-center gap-1">
        <PageBtn
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          icon="fa-angles-left"
        />
        <PageBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          icon="fa-chevron-left"
        />

        <span className="mx-2 rounded border px-3 py-1 text-sm">
          Page {page} of {totalPages}
        </span>

        <PageBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          icon="fa-chevron-right"
        />
        <PageBtn
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          icon="fa-angles-right"
        />
      </div>
    </div>
  );
}

function PageBtn({ icon, ...rest }: any) {
  return (
    <button
      {...rest}
      className="px-2 py-1 rounded border bg-white text-slate-600 disabled:opacity-40"
    >
      <i className={`fa ${icon}`} />
    </button>
  );
}
