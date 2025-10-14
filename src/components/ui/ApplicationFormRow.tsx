type ApplicationFormRowProps = {
  title?: string; // Left label
  subtitle?: string; // Optional small helper text
  required?: boolean; // Shows a "Required" chip when true
  lastUpdated?: string; // Meta info on the right
  isLoading?: boolean; // Disables buttons + shows spinner
  onOpen: () => void; // Primary action (open/fill form)
  onDownload?: () => void; // Secondary action (download/preview)
};

export function ApplicationFormRow({
  title = "Application Form",
  subtitle = "Please review and complete the form",
  required = false,
  lastUpdated,
  isLoading = false,
  onOpen,
  onDownload,
}: ApplicationFormRowProps) {
  return (
    <div
      className="w-full rounded-xl border border-gray-200 bg-white/70 backdrop-blur-[1px] shadow-sm hover:shadow-md transition-shadow"
      role="group"
      aria-label={`${title} actions`}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: title + chips */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </h3>

            {required && (
              <span
                className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
                title="This document is required"
              >
                Required
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right side: meta + actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {lastUpdated && (
            <div className="hidden sm:flex items-center text-xs text-gray-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 mr-2"></span>
              Updated {lastUpdated}
            </div>
          )}

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
                title="Download / Preview"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-80"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download
              </button>
            )}

            <button
              type="button"
              onClick={onOpen}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-70"
              title="Open and fill the application form"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-30"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                    />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="opacity-90"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 5v14m0 0l-5-5m5 5l5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Open Form
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
