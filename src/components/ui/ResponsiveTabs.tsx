import React, { useEffect, useRef } from "react";

export interface ResponsiveTabsProps {
  tabNames: string[];
  activeTab: string;
  setActiveTab: (name: string) => void;
  /** Optional prefix to keep tab/panel ids unique on the page */
  idPrefix?: string;
  /** Optional extra classes for the outer wrapper */
  className?: string;
}

export default function ResponsiveTabs({
  tabNames,
  activeTab,
  setActiveTab,
  idPrefix = "tabs",
  className = "",
}: ResponsiveTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  /** Center the tab in view (clamped to container edges) */
  const centerTab = (index: number) => {
    const container = listRef.current;
    const tabEl = tabRefs.current[index];
    if (!container || !tabEl) return;

    const containerRect = container.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();

    // Distance from the tab's left edge to the container's left edge
    const deltaLeft = tabRect.left - containerRect.left;

    // Desired scroll so that the tab is centered
    const desired =
      container.scrollLeft +
      deltaLeft -
      (container.clientWidth / 2 - tabEl.clientWidth / 2);

    // Clamp within scroll bounds
    const maxScroll = container.scrollWidth - container.clientWidth;
    const target = Math.max(0, Math.min(desired, maxScroll));

    const prefersReduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      container.scrollTo({
        left: target,
        behavior: prefersReduced ? "auto" : "smooth",
      });
    } catch {
      container.scrollLeft = target; // Fallback
    }
  };

  /** Keyboard nav (left/right) */
  const onKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + tabNames.length) % tabNames.length;
    setActiveTab(tabNames[next]);
    // Center immediately (optimistic) for snappy UX
    centerTab(next);
    // Ensure focus moves to the next tab
    tabRefs.current[next]?.focus();
  };

  /** When activeTab changes (e.g., via click or from parent), center it */
  useEffect(() => {
    const index = tabNames.findIndex((n) => n === activeTab);
    if (index >= 0) {
      // Wait a frame to ensure layout is updated before measuring
      const id = requestAnimationFrame(() => centerTab(index));
      return () => cancelAnimationFrame(id);
    }
  }, [activeTab, tabNames]);

  return (
    <div className={`border-b border-gray-200 bg-white ${className}`}>
      <nav className="px-3 sm:px-6">
        <div
          ref={listRef}
          role="tablist"
          aria-label="Section tabs"
          className="flex gap-1 sm:gap-2 overflow-x-auto scroll-px-3 sm:scroll-px-6 py-1 sm:py-0
                     [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {tabNames.map((tabName, i) => {
            const isActive = activeTab === tabName;
            const tabId = `${idPrefix}-tab-${i}`;
            const panelId = `${idPrefix}-panel-${i}`;

            return (
              <button
                key={`${tabName}-${i}`}
                id={tabId}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => {
                  setActiveTab(tabName);
                  centerTab(i);
                }}
                onKeyDown={(e) => onKeyDown(e, i)}
                onFocus={() => centerTab(i)} // also center on focus from external nav
                className={[
                  "relative shrink-0 px-4 sm:px-5 py-3",
                  "text-sm font-medium transition",
                  "rounded-md sm:rounded-none",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900",
                  isActive
                    ? "after:absolute after:left-3 after:right-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-blue-600"
                    : "after:absolute after:left-3 after:right-3 after:-bottom-[1px] after:h-0.5 after:bg-transparent",
                ].join(" ")}
              >
                <span className="truncate">{tabName}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
