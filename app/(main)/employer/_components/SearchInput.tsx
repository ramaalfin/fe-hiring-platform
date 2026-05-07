"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps {
  /** Called with the debounced query string whenever the user types */
  onSearch: (query: string) => void;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
  /** Optional placeholder text */
  placeholder?: string;
  /** Optional additional class names for the wrapper */
  className?: string;
  /** Optional initial value */
  defaultValue?: string;
}

/**
 * SearchInput — a debounced text input with a search icon and a clear button.
 *
 * - Calls `onSearch` with the debounced query after `debounceMs` (default 300ms).
 * - Shows a clear (×) button whenever the input has a value.
 * - Fully accessible: labelled via aria-label, clear button has its own label.
 */
const SearchInput = ({
  onSearch,
  debounceMs = 300,
  placeholder = "Search jobs...",
  className,
  defaultValue = "",
}: SearchInputProps) => {
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebounce(query, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fire onSearch whenever the debounced value changes
  useEffect(() => {
    onSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    // Return focus to the input after clearing so keyboard users stay in context
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full",
        className
      )}
      role="search"
    >
      {/* Search icon — decorative, hidden from screen readers */}
      <Search
        className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search jobs"
        className={cn(
          // Base styles matching the project's shadcn Input component
          "flex h-9 w-full rounded-md border border-input bg-transparent",
          "pl-9 pr-9 py-1 text-sm shadow-sm",
          "transition-colors placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Remove the browser's native clear button (shown in some browsers for type="search")
          "[&::-webkit-search-cancel-button]:hidden"
        )}
      />

      {/* Clear button — only visible when there is a value */}
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={cn(
            "absolute right-2 flex items-center justify-center",
            "h-5 w-5 rounded-full",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-neutral-100 transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          )}
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
