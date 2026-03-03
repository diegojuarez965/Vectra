"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { useRef } from "react";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleSearch = (term: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", "1"); // Resetear a la página 1 cuando hay una nueva búsqueda
      if (term) {
        params.set("query", term);
      } else {
        params.delete("query");
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400); // 400ms debounce
  };

  return (
    <div className="relative flex flex-1 shrink-0 min-w-[300px]">
      <label htmlFor="search" className="sr-only">
        Búsqueda
      </label>
      <input
        className="block w-full rounded-md border border-foreground/20 bg-background py-2 pl-10 pr-4 text-sm outline-2 placeholder:text-foreground/30 text-foreground transition-colors"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-foreground/80 transition-colors" />
    </div>
  );
}
