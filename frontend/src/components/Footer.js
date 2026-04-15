import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram, Facebook, Send } from "lucide-react";
import { Input } from "../components/ui/input";
import API from "../lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const { data } = await API.post("/newsletter", { email });
      setSubMsg(data.message);
      setEmail("");
    } catch {
      setSubMsg("Erreur lors de l'inscription");
    }
  };

  return (
    <footer className="bg-[#2A2421] text-white/80" data-testid="footer">
      {/* Newsletter */}
      <div className="bg-[#FFF1E6] py-12 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="overline text-[#5C5C5C] mb-2">Newsletter</p>
          <h3 className="font-serif text-2xl text-[#2A2421] mb-4">Restez informee</h3>
          <p className="text-sm text-[#5C5C5C] mb-6">
            Inscrivez-vous pour recevoir nos dernieres collections et offres exclusives.
          </p>
          <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md mx-auto" data-testid="newsletter-form">
            <Input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border-[#1A1A1A]/10 rounded-none"
              data-testid="newsletter-email-input"
            />
            <button
              type="submit"
              className="bg-[#2A2421] text-white px-6 py-2 text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              data-testid="newsletter-submit-button"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {subMsg && <p className="text-sm text-[#2A2421] mt-3" data-testid="newsletter-message">{subMsg}</p>}
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h4 className="font-serif text-xl text-white mb-4">Beryl Shop</h4>
            <p className="text-sm text-white/60 leading-relaxed">
              Votre destination mode a Douala. Qualite, style et accessibilite depuis 2020.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Navigation</h5>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-white/60 hover:text-white transition-colors">Accueil</Link>
              <Link to="/boutique" className="text-sm text-white/60 hover:text-white transition-colors">Boutique</Link>
              <Link to="/a-propos" className="text-sm text-white/60 hover:text-white transition-colors">A propos</Link>
              <Link to="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Categories</h5>
            <div className="flex flex-col gap-2">
              <Link to="/boutique?category=vetements" className="text-sm text-white/60 hover:text-white transition-colors">Vetements</Link>
              <Link to="/boutique?category=chaussures" className="text-sm text-white/60 hover:text-white transition-colors">Chaussures</Link>
              <Link to="/boutique?category=accessoires" className="text-sm text-white/60 hover:text-white transition-colors">Accessoires</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">Contact</h5>
            <div className="flex flex-col gap-3">
              <a href="tel:+237655241011" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> +237 655 24 10 11
              </a>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-4 h-4" /> Douala, Cameroun
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-4 h-4" /> Ouvert 24h/24
              </div>
              <div className="flex gap-3 mt-2">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" data-testid="social-instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" data-testid="social-facebook">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Beryl Shop. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
