import logo from "@/assets/prometrica-logo.png";
import { Mail, Send, Twitter, Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer id="contact" className="relative mt-24 bg-primary text-primary-foreground">
      <div className="absolute inset-x-0 -top-12 mx-auto h-24 max-w-7xl rounded-3xl bg-accent/0" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <img src={logo} alt="Prometrica Academy" className="h-9 w-auto" />
          </Link>
          <p className="mt-5 max-w-sm text-sm text-primary-foreground/70">
            The leading educational destination for future pharmacists. Strategic curricula,
            advanced training, and a reliable path to licensing success.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Telegram" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-accent hover:text-primary">
              <Send className="h-4 w-4" />
            </a>
            <a href="#" aria-label="X" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-accent hover:text-primary">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-accent hover:text-primary">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold">Platform</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="#programs" className="hover:text-accent">Programs</a></li>
            <li><a href="#courses" className="hover:text-accent">Courses</a></li>
            <li><a href="#speakers" className="hover:text-accent">Speakers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="#about" className="hover:text-accent">About</a></li>
            <li><a href="#why" className="hover:text-accent">Why Prometrica</a></li>
            <li><a href="#process" className="hover:text-accent">Process</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold">Contact</h4>
          <a href="mailto:info@prometrica.academy" className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent">
            <Mail className="h-4 w-4" /> info@prometrica.academy
          </a>
          <p className="mt-3 text-sm text-primary-foreground/70">24/7 Academic Support</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-primary-foreground/60 md:flex-row">
          <p>© 2026 Prometrica Academy. All rights reserved.</p>
          <p>Designed for excellence. Built for confident exam success.</p>
        </div>
      </div>
    </footer>
  );
}
