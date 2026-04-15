import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/237655241011?text=Bonjour%20Beryl%20Shop%20!"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      data-testid="whatsapp-button"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
