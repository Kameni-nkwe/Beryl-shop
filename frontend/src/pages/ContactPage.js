import { useState } from "react";
import { Phone, MapPin, Clock, Send } from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import API from "../lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const { data } = await API.post("/contact", form);
      setStatus(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("Erreur lors de l'envoi du message");
    }
    setLoading(false);
  };

  return (
    <div data-testid="contact-page">
      {/* Header */}
      <div className="bg-[#FFF1E6] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="overline text-[#5C5C5C] mb-2">Nous Contacter</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">Contact</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
              <div>
                <Label htmlFor="contact-name" className="text-sm text-[#5C5C5C]">Nom</Label>
                <Input
                  id="contact-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                  required
                  className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm text-[#5C5C5C]">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                  className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-subject" className="text-sm text-[#5C5C5C]">Sujet</Label>
                <Input
                  id="contact-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Objet de votre message"
                  required
                  className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none"
                  data-testid="contact-subject-input"
                />
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-sm text-[#5C5C5C]">Message</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Votre message..."
                  rows={5}
                  required
                  className="mt-1 bg-white border-[#1A1A1A]/10 rounded-none resize-none"
                  data-testid="contact-message-input"
                />
              </div>
              {status && (
                <p className="text-sm text-[#2A2421]" data-testid="contact-status">{status}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-[#2A2421] text-white px-8 py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
                data-testid="contact-submit-button"
              >
                <Send className="w-4 h-4" /> {loading ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          </div>

          {/* Info + Map */}
          <div>
            <h2 className="font-serif text-xl text-[#1A1A1A] mb-6">Informations</h2>
            <div className="space-y-6 mb-8">
              <a
                href="tel:+237655241011"
                className="flex items-center gap-3 text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
                data-testid="contact-phone"
              >
                <div className="w-10 h-10 bg-[#FFF1E6] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#2A2421]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Telephone</p>
                  <p className="text-sm">+237 655 24 10 11</p>
                </div>
              </a>
              <div className="flex items-center gap-3 text-[#5C5C5C]">
                <div className="w-10 h-10 bg-[#FFF1E6] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#2A2421]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Adresse</p>
                  <p className="text-sm">Douala, Cameroun</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[#5C5C5C]">
                <div className="w-10 h-10 bg-[#FFF1E6] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#2A2421]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">Horaires</p>
                  <p className="text-sm">Ouvert 24h/24, 7j/7</p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="w-full h-[300px] bg-[#F5F5F0]" data-testid="google-map">
              <iframe
                title="Beryl Shop Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127355.48663920504!2d9.6527868!3d4.0510564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1061128be2e1fe6d%3A0x6b55b6d0e8d4b843!2sDouala%2C%20Cameroun!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
