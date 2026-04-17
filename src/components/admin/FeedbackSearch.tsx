"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

export default function FeedbackSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full lg:w-96 group">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isPending ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground group-focus-within:text-emerald-500'}`} />
      <input 
        type="text" 
        placeholder="Filter by name, email, or content..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full h-14 pl-12 pr-4 bg-background/50 border border-border/50 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
