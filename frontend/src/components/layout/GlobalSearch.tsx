"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FolderKanban, Receipt, Users, ShoppingCart } from "lucide-react";
import { globalSearch, type GlobalSearchResponse, type SearchResultItem } from "@/lib/api/search";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setIsOpen(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const hasResults = results && (
    results.projects.length > 0 || 
    results.bills.length > 0 || 
    results.vendors.length > 0 || 
    results.purchase_orders.length > 0
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
        <input
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full h-10 pl-10 pr-4 rounded-full bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
          style={{
            boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
          }}
        />
        {isSearching && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 animate-spin" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-sm text-slate-500">No results found for "{query}"</div>
          ) : (
            <div className="py-2">
              
              {/* Projects */}
              {results?.projects.map((item) => (
                <ResultItem key={`proj-${item.id}`} item={item} icon={<FolderKanban className="h-4 w-4 text-purple-500" />} onClick={handleResultClick} />
              ))}

              {/* Bills */}
              {results?.bills.map((item) => (
                <ResultItem key={`bill-${item.id}`} item={item} icon={<Receipt className="h-4 w-4 text-blue-500" />} onClick={handleResultClick} />
              ))}

              {/* Vendors */}
              {results?.vendors.map((item) => (
                <ResultItem key={`vend-${item.id}`} item={item} icon={<Users className="h-4 w-4 text-orange-500" />} onClick={handleResultClick} />
              ))}

              {/* Purchase Orders */}
              {results?.purchase_orders.map((item) => (
                <ResultItem key={`po-${item.id}`} item={item} icon={<ShoppingCart className="h-4 w-4 text-green-500" />} onClick={handleResultClick} />
              ))}

            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultItem({ item, icon, onClick }: { item: SearchResultItem, icon: React.ReactNode, onClick: (url: string) => void }) {
  return (
    <button
      onClick={() => onClick(item.url)}
      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3"
    >
      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
        <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
      </div>
    </button>
  );
}