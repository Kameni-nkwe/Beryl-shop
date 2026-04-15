import { Star } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { Badge } from "../components/ui/badge";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const discountedPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";
  };

  return (
    <div className="group" data-testid={`product-card-${product.id}`}>
      <div className="product-image-wrapper relative aspect-[3/4] mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.discount_percent > 0 && (
          <Badge className="absolute top-3 left-3 bg-[#2A2421] text-white text-xs rounded-none">
            -{product.discount_percent}%
          </Badge>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm font-medium text-[#5C5C5C]">Rupture de stock</span>
          </div>
        )}
        <button
          onClick={() => addItem(product)}
          disabled={!product.in_stock}
          className="absolute bottom-0 left-0 right-0 bg-[#2A2421] text-white py-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#1A1A1A] disabled:opacity-50"
          data-testid={`add-to-cart-${product.id}`}
        >
          Ajouter au panier
        </button>
      </div>
      <div>
        <p className="overline text-[#5C5C5C] mb-1">{product.category}</p>
        <h3 className="font-serif text-base font-medium text-[#1A1A1A] mb-1">{product.name}</h3>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#E8D1C5] text-[#E8D1C5]" />
            <span className="text-xs text-[#5C5C5C]">{product.rating || 0}</span>
          </div>
          <span className="text-xs text-[#5C5C5C]">({product.reviews_count || 0} avis)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#2A2421]">{formatPrice(discountedPrice)}</span>
          {product.discount_percent > 0 && (
            <span className="text-xs text-[#5C5C5C] line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
