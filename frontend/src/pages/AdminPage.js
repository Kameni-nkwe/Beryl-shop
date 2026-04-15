import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Package, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import API from "../lib/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const EMPTY_PRODUCT = {
  name: "", description: "", price: "", category: "vetements",
  image: "", sizes: "", colors: "", in_stock: true, is_popular: false, discount_percent: 0,
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await API.get("/products?limit=100");
      setProducts(data.products || []);
    } catch { /* ignore */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/admin");
      setOrders(data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchProducts();
    fetchOrders();
  }, [user, navigate, fetchProducts, fetchOrders]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, image: p.image,
      sizes: (p.sizes || []).join(", "), colors: (p.colors || []).join(", "),
      in_stock: p.in_stock, is_popular: p.is_popular,
      discount_percent: p.discount_percent || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image: form.image,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      in_stock: form.in_stock,
      is_popular: form.is_popular,
      discount_percent: parseInt(form.discount_percent) || 0,
    };
    try {
      if (editProduct) {
        await API.put(`/products/${editProduct.id}`, payload);
      } else {
        await API.post("/products", payload);
      }
      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.detail || "Echec"));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch { /* ignore */ }
  };

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(Math.round(price)) + " FCFA";

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="admin-page">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-white/60 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </button>
          <h1 className="font-serif text-2xl">Administration</h1>
          <p className="text-sm text-white/60 mt-1">Gerez vos produits et commandes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#F5F5F0] p-1 w-fit">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === "products" ? "bg-[#2A2421] text-white" : "text-[#5C5C5C]"}`}
            data-testid="admin-tab-products"
          >
            Produits ({products.length})
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === "orders" ? "bg-[#2A2421] text-white" : "text-[#5C5C5C]"}`}
            data-testid="admin-tab-orders"
          >
            Commandes ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-lg">Produits</h2>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-[#2A2421] text-white px-4 py-2 text-sm hover:bg-[#1A1A1A] transition-colors"
                data-testid="add-product-button"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            <div className="bg-white border border-[#1A1A1A]/5 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Populaire</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="w-10 h-12 bg-[#F5F5F0] overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{p.name}</TableCell>
                      <TableCell className="text-sm capitalize">{p.category}</TableCell>
                      <TableCell className="text-sm">{formatPrice(p.price)}</TableCell>
                      <TableCell>
                        <Badge variant={p.in_stock ? "default" : "destructive"} className="text-xs">
                          {p.in_stock ? "En stock" : "Rupture"}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.is_popular ? "Oui" : "Non"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-[#5C5C5C] hover:text-[#2A2421]" data-testid={`edit-product-${p.id}`}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#5C5C5C] hover:text-red-500" data-testid={`delete-product-${p.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 className="font-serif text-lg mb-4">Commandes</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-[#5C5C5C]">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="bg-white border border-[#1A1A1A]/5 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs font-mono">{o.id?.slice(0, 8)}</TableCell>
                        <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-sm">{o.items?.length || 0}</TableCell>
                        <TableCell className="text-sm font-medium">{formatPrice(o.total)}</TableCell>
                        <TableCell className="text-sm capitalize">{o.payment_method?.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant={o.status === "confirmed" ? "default" : "secondary"} className="text-xs capitalize">
                            {o.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#FAFAFA] max-h-[85vh] overflow-y-auto" data-testid="product-dialog">
          <DialogHeader>
            <DialogTitle className="font-serif">{editProduct ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
            <DialogDescription>Remplissez les informations du produit</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-sm text-[#5C5C5C]">Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-name-input" />
            </div>
            <div>
              <Label className="text-sm text-[#5C5C5C]">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none resize-none" data-testid="product-description-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#5C5C5C]">Prix (FCFA)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-price-input" />
              </div>
              <div>
                <Label className="text-sm text-[#5C5C5C]">Categorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vetements">Vetements</SelectItem>
                    <SelectItem value="chaussures">Chaussures</SelectItem>
                    <SelectItem value="accessoires">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#5C5C5C]">URL de l'image</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-image-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#5C5C5C]">Tailles (separees par virgule)</Label>
                <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-sizes-input" />
              </div>
              <div>
                <Label className="text-sm text-[#5C5C5C]">Couleurs (separees par virgule)</Label>
                <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Noir, Blanc" className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-colors-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-[#5C5C5C]">Reduction (%)</Label>
                <Input type="number" min="0" max="100" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none" data-testid="product-discount-input" />
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} data-testid="product-stock-checkbox" />
                  En stock
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} data-testid="product-popular-checkbox" />
                  Populaire
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#2A2421] text-white py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50" data-testid="save-product-button">
              {loading ? "Enregistrement..." : editProduct ? "Modifier" : "Creer le produit"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
