import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../components/ui/sheet";

export default function CartSheet() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";
  };

  const goToCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#FAFAFA] flex flex-col" data-testid="cart-sheet">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Votre Panier</SheetTitle>
          <SheetDescription>
            {items.length === 0 ? "Votre panier est vide" : `${items.length} article${items.length > 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-6">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 py-4 border-b border-[#1A1A1A]/5" data-testid={`cart-item-${item.key}`}>
              <div className="w-20 h-24 bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</h4>
                {(item.size || item.color) && (
                  <p className="text-xs text-[#5C5C5C] mt-0.5">
                    {item.size && `Taille: ${item.size}`} {item.color && `Couleur: ${item.color}`}
                  </p>
                )}
                <p className="text-sm font-medium text-[#2A2421] mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center border border-[#1A1A1A]/10 hover:bg-[#E8D1C5] transition-colors"
                    data-testid={`cart-minus-${item.key}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.key, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center border border-[#1A1A1A]/10 hover:bg-[#E8D1C5] transition-colors"
                    data-testid={`cart-plus-${item.key}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="ml-auto p-1 text-[#5C5C5C] hover:text-red-500 transition-colors"
                    data-testid={`cart-remove-${item.key}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#1A1A1A]/5 pt-4 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#5C5C5C]">Total</span>
              <span className="font-serif text-lg font-semibold text-[#2A2421]" data-testid="cart-total">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={goToCheckout}
              className="w-full bg-[#2A2421] text-white py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              data-testid="checkout-button"
            >
              Passer la commande
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
