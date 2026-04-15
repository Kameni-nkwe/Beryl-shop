import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X, LogOut, Package, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

export default function Navbar({ onOpenAuth, onOpenSearch }) {
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Accueil", to: "/" },
    { label: "Boutique", to: "/boutique" },
    { label: "A propos", to: "/a-propos" },
    { label: "Contact", to: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#FAFAFA]/70 border-b border-[#1A1A1A]/5" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-semibold tracking-tight text-[#2A2421]" data-testid="navbar-logo">
            Beryl Shop
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.to) ? "text-[#2A2421]" : "text-[#5C5C5C] hover:text-[#2A2421]"
                }`}
                data-testid={`nav-link-${link.to.replace("/", "") || "home"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
              data-testid="search-button"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-[#5C5C5C] hover:text-[#2A2421] transition-colors" data-testid="user-menu-button">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/orders")} data-testid="menu-orders">
                      <Package className="w-4 h-4 mr-2" /> Mes commandes
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                        <Shield className="w-4 h-4 mr-2" /> Administration
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" /> Deconnexion
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => onOpenAuth("login")} data-testid="menu-login">
                      Connexion
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenAuth("register")} data-testid="menu-register">
                      Inscription
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
              data-testid="cart-button"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#5C5C5C]"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[#1A1A1A]/5" data-testid="mobile-menu">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 text-sm font-medium ${
                  isActive(link.to) ? "text-[#2A2421]" : "text-[#5C5C5C]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
