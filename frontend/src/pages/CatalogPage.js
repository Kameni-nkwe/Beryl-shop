import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import API from "../lib/api";
import ProductCard from "../components/ProductCard";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const CATEGORIES = [
  { label: "Tous", value: "all" },
  { label: "Vetements", value: "vetements" },
  { label: "Chaussures", value: "chaussures" },
  { label: "Accessoires", value: "accessoires" },
];

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category && category !== "all") params.append("category", category);
        if (search) params.append("search", search);
        if (minPrice) params.append("min_price", minPrice);
        if (maxPrice) params.append("max_price", maxPrice);
        if (sort) params.append("sort", sort);
        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [category, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setCategory("all");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen" data-testid="catalog-page">
      {/* Header */}
      <div className="bg-[#FFF1E6] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="overline text-[#5C5C5C] mb-2">Notre Boutique</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Collection</h1>
          <p className="text-sm text-[#5C5C5C] mt-2">{total} produit{total > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2" data-testid="search-form">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5C5C]" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-[#1A1A1A]/10 rounded-none"
                data-testid="search-input"
              />
            </div>
          </form>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[160px] bg-white border-[#1A1A1A]/10 rounded-none" data-testid="sort-select">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus recents</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix decroissant</SelectItem>
                <SelectItem value="popular">Popularite</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-[#1A1A1A]/10 bg-white text-sm text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
              data-testid="toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filtres
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-[#FFF1E6]/50 p-6 mb-8 flex flex-wrap gap-4 items-end" data-testid="filters-panel">
            <div>
              <label className="text-xs text-[#5C5C5C] mb-1 block">Categorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[150px] bg-white border-[#1A1A1A]/10 rounded-none" data-testid="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-[#5C5C5C] mb-1 block">Prix min (FCFA)</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-[120px] bg-white border-[#1A1A1A]/10 rounded-none"
                data-testid="min-price-input"
              />
            </div>
            <div>
              <label className="text-xs text-[#5C5C5C] mb-1 block">Prix max (FCFA)</label>
              <Input
                type="number"
                placeholder="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-[120px] bg-white border-[#1A1A1A]/10 rounded-none"
                data-testid="max-price-input"
              />
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
              data-testid="clear-filters"
            >
              <X className="w-4 h-4" /> Reinitialiser
            </button>
          </div>
        )}

        {/* Category quick filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-4 py-2 text-sm transition-colors ${
                category === c.value
                  ? "bg-[#2A2421] text-white"
                  : "bg-[#FFF1E6] text-[#5C5C5C] hover:bg-[#E8D1C5]"
              }`}
              data-testid={`category-tab-${c.value}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#F5F5F0] mb-3" />
                <div className="h-3 bg-[#F5F5F0] w-1/3 mb-2" />
                <div className="h-4 bg-[#F5F5F0] w-2/3 mb-2" />
                <div className="h-3 bg-[#F5F5F0] w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="font-serif text-xl text-[#5C5C5C]">Aucun produit trouve</p>
            <p className="text-sm text-[#5C5C5C] mt-2">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" data-testid="products-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
