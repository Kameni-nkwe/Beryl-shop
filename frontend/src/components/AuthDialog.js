import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function AuthDialog({ open, onOpenChange, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let result;
    if (tab === "login") {
      result = await login(email, password);
    } else {
      if (!name.trim()) {
        setError("Veuillez entrer votre nom");
        setLoading(false);
        return;
      }
      result = await register(name, email, password);
    }
    setLoading(false);
    if (result.success) {
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setName("");
    } else {
      setError(result.error);
    }
  };

  const switchTab = (newTab) => {
    setTab(newTab);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#FAFAFA]" data-testid="auth-dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-center">
            {tab === "login" ? "Connexion" : "Inscription"}
          </DialogTitle>
          <DialogDescription className="text-center text-[#5C5C5C]">
            {tab === "login" ? "Connectez-vous a votre compte" : "Creez votre compte Beryl Shop"}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-[#1A1A1A]/10 mb-4">
          <button
            onClick={() => switchTab("login")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "login" ? "text-[#2A2421] border-b-2 border-[#2A2421]" : "text-[#5C5C5C]"
            }`}
            data-testid="auth-tab-login"
          >
            Connexion
          </button>
          <button
            onClick={() => switchTab("register")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === "register" ? "text-[#2A2421] border-b-2 border-[#2A2421]" : "text-[#5C5C5C]"
            }`}
            data-testid="auth-tab-register"
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <div>
              <Label htmlFor="name" className="text-sm text-[#5C5C5C]">Nom complet</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                data-testid="auth-name-input"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm text-[#5C5C5C]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
              data-testid="auth-email-input"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-[#5C5C5C]">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
              data-testid="auth-password-input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500" data-testid="auth-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2A2421] text-white py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
            data-testid="auth-submit-button"
          >
            {loading ? "Chargement..." : tab === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
