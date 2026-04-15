import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import API from "../lib/api";
import { Badge } from "../components/ui/badge";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/");
      return;
    }
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders");
        setOrders(data || []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchOrders();
  }, [user, authLoading, navigate]);

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#5C5C5C]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="orders-page">
      <div className="bg-[#FFF1E6] py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-[#5C5C5C] hover:text-[#2A2421] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">Mes commandes</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20" data-testid="no-orders">
            <Package className="w-16 h-16 mx-auto mb-4 text-[#E8D1C5]" />
            <p className="font-serif text-lg text-[#5C5C5C]">Aucune commande</p>
            <button onClick={() => navigate("/boutique")} className="mt-4 bg-[#2A2421] text-white px-6 py-2 text-sm hover:bg-[#1A1A1A] transition-colors">
              Decouvrir la boutique
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-[#1A1A1A]/5 p-6" data-testid={`order-${order.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="text-xs text-[#5C5C5C] font-mono">#{order.id?.slice(0, 8)}</p>
                    <p className="text-xs text-[#5C5C5C]">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={order.payment_status === "completed" ? "default" : "secondary"} className="text-xs capitalize">
                      {order.payment_status}
                    </Badge>
                    <Badge variant={order.status === "confirmed" ? "default" : "secondary"} className="text-xs capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.name} x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1A1A1A]/5 mt-4 pt-3 flex justify-between">
                  <span className="text-sm text-[#5C5C5C]">Total</span>
                  <span className="font-serif font-semibold text-[#2A2421]">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
