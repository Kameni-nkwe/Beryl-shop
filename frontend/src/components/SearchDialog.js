import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import API from "../lib/api";

export default function SearchDialog({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products?search=${encodeURIComponent(query)}&limit=6`);
        setResults(data.products || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToProduct = (product) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/boutique?search=${encodeURIComponent(product.name)}`);
  };

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#FAFAFA] p-0" data-testid="search-dialog">
        <DialogHeader className="sr-only">
          <DialogTitle>Rechercher</DialogTitle>
          <DialogDescription>Rechercher un produit</DialogDescription>
        </DialogHeader>
        <div className="p-4 border-b border-[#1A1A1A]/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5C5C]" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="pl-10 pr-10 bg-white border-[#1A1A1A]/10 rounded-none"
              data-testid="search-dialog-input"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C5C5C]">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-[#5C5C5C]">Recherche...</p>}
          {!loading && query && results.length === 0 && (
            <p className="p-4 text-sm text-[#5C5C5C]">Aucun resultat</p>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => goToProduct(p)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#FFF1E6] transition-colors text-left"
              data-testid={`search-result-${p.id}`}
            >
              <div className="w-10 h-12 bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A] truncate">{p.name}</p>
                <p className="text-xs text-[#5C5C5C] capitalize">{p.category}</p>
              </div>
              <span className="text-sm text-[#2A2421]">{formatPrice(p.price)}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
