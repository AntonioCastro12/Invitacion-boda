import { Heart } from "lucide-react";

export default function Footer({ couple }) {
  return (
    <footer className="footer">
      <p>Con amor, {couple.bride} &amp; {couple.groom}</p>
      <Heart size={14} fill="currentColor" aria-hidden="true" />
    </footer>
  );
}
