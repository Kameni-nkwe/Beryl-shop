import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Smartphone, CreditCard } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import API from "../lib/api";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
          image: i.image,
        })),
        total: totalPrice,
        payment_method: paymentMethod,
        phone_number: paymentMethod === "mobile_money" ? phoneNumber : null,
        guest_name: !user ? guestName : null,
        guest_email: !user ? guestEmail : null,
        shipping_address: shippingAddress,
      };
      const { data } = await API.post("/orders", orderData);
      setOrderId(data.id);
      setOrderSuccess(true);
      clearCart();
    } catch {
      alert("Erreur lors de la commande. Veuillez reessayer.");
    }
    setLoading(false);
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="checkout-empty">
        <div className="text-center">
          <p className="font-serif text-xl text-[#5C5C5C]">Votre panier est vide</p>
          <button
            onClick={() => navigate("/boutique")}
            className="mt-4 bg-[#2A2421] text-white px-6 py-2 text-sm hover:bg-[#1A1A1A] transition-colors"
            data-testid="continue-shopping-button"
          >
            Continuer les achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="checkout-page">
      <div className="bg-[#FFF1E6] py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#2A2421] transition-colors mb-4"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">Finaliser la commande</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6" data-testid="checkout-form">
            {/* Guest info */}
            {!user && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-[#1A1A1A]">Informations personnelles</h3>
                <div>
                  <Label className="text-sm text-[#5C5C5C]">Nom complet</Label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                    data-testid="guest-name-input"
                  />
                </div>
                <div>
                  <Label className="text-sm text-[#5C5C5C]">Email</Label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                    data-testid="guest-email-input"
                  />
                </div>
              </div>
            )}

            {/* Shipping */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[#1A1A1A]">Adresse de livraison</h3>
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Votre adresse complete a Douala..."
                rows={3}
                required
                className="bg-white border-[#1A1A1A]/10 rounded-none resize-none"
                data-testid="shipping-address-input"
              />
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[#1A1A1A]">Mode de paiement</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mobile_money")}
                  className={`p-4 border text-left transition-colors ${
                    paymentMethod === "mobile_money"
                      ? "border-[#2A2421] bg-[#FFF1E6]"
                      : "border-[#1A1A1A]/10 bg-white"
                  }`}
                  data-testid="payment-mobile-money"
                >
                  <Smartphone className="w-5 h-5 text-[#2A2421] mb-2" />
                  <p className="text-sm font-medium text-[#1A1A1A]">Mobile Money</p>
                  <p className="text-xs text-[#5C5C5C]">MTN, Orange Money</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border text-left transition-colors ${
                    paymentMethod === "card"
                      ? "border-[#2A2421] bg-[#FFF1E6]"
                      : "border-[#1A1A1A]/10 bg-white"
                  }`}
                  data-testid="payment-card"
                >
                  <CreditCard className="w-5 h-5 text-[#2A2421] mb-2" />
                  <p className="text-sm font-medium text-[#1A1A1A]">Carte bancaire</p>
                  <p className="text-xs text-[#5C5C5C]">Visa, Mastercard</p>
                </button>
              </div>

              {paymentMethod === "mobile_money" && (
                <div>
                  <Label className="text-sm text-[#5C5C5C]">Numero de telephone</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    required
                    className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                    data-testid="phone-number-input"
                  />
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-[#5C5C5C]">Numero de carte</Label>
                    <Input placeholder="1234 5678 9012 3456" className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="card-number-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm text-[#5C5C5C]">Expiration</Label>
                      <Input placeholder="MM/AA" className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="card-expiry-input" />
                    </div>
                    <div>
                      <Label className="text-sm text-[#5C5C5C]">CVV</Label>
                      <Input placeholder="123" className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="card-cvv-input" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A2421] text-white py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
              data-testid="place-order-button"
            >
              {loading ? "Traitement..." : `Confirmer la commande - ${formatPrice(totalPrice)}`}
            </button>
            <p className="text-xs text-[#5C5C5C] text-center">Paiement simule pour le MVP</p>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFF1E6]/50 p-6 sticky top-24" data-testid="order-summary">
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-4">Resume de la commande</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-12 h-16 bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A1A1A] truncate">{item.name}</p>
                      <p className="text-xs text-[#5C5C5C]">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-[#2A2421]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#1A1A1A]/10 mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#5C5C5C]">Sous-total</span>
                  <span className="text-sm">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-[#5C5C5C]">Livraison</span>
                  <span className="text-sm text-[#2A2421]">Gratuite</span>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-[#1A1A1A]/10">
                  <span className="font-medium">Total</span>
                  <span className="font-serif text-lg font-semibold text-[#2A2421]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-[#FAFAFA]" data-testid="order-success-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-center flex flex-col items-center gap-3">
              <CheckCircle className="w-12 h-12 text-green-500" />
              Commande confirmee !
            </DialogTitle>
            <DialogDescription className="text-center text-[#5C5C5C]">
              Votre commande #{orderId?.slice(0, 8)} a ete enregistree avec succes.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center mt-4">
            <p className="text-sm text-[#5C5C5C] mb-6">
              Vous recevrez une confirmation par email. Notre equipe vous contactera pour la livraison.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#2A2421] text-white px-8 py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              data-testid="order-continue-button"
            >
              Continuer les achats
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
