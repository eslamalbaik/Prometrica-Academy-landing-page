import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/prometrica-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link } from "@tanstack/react-router";

export function Navbar({ variant = "transparent" }: { variant?: "transparent" | "solid" }) {
  const { t } = useTranslation();
  const { isAuthenticated, isReady, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#programs", label: t('navbar.programs') },
    { href: "#why", label: t('navbar.why_us') },
    { href: "#courses", label: t('navbar.courses') },
    { href: "/store", label: t('navbar.store', 'Store') },
    { href: "#speakers", label: t('navbar.speakers') },
    { href: "#contact", label: t('navbar.contact') },
  ];

  const isSolid = variant === "solid";

  return (
    <header className={
      isSolid 
        ? "bg-white border-b border-border z-50" 
        : `absolute inset-x-0 top-3 md:top-5 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`
    }>
      <motion.div
        initial={isSolid ? false : { y: -30, opacity: 0 }}
        animate={isSolid ? false : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-500 md:px-6 ${
          isSolid
            ? "py-4"
            : scrolled
              ? "rounded-2xl border border-border/70 bg-card/85 py-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
              : "py-3"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Prometrica Academy" className="h-12 w-auto md:h-16" />
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
              <span className="absolute -bottom-1 start-0 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {!isReady ? (
            /* Auth state is still loading — show nothing to prevent flash */
            null
          ) : isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pe-3 shadow-sm hover:bg-accent/5 transition">
                <img src={user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : "https://placehold.co/100x100/1e293b/ffffff?text=" + (user?.name?.[0] || 'U')} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
              </button>
              <div className="absolute end-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2 flex flex-col gap-1">
                  {user?.role === 'admin' ? (
                    <>
                      <a href="http://localhost:5173/dashboards/lms" className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md">{t('navbar.admin_dashboard')}</a>
                    </>
                  ) : (
                    <>
                      <Link to="/student/dashboard" className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md">{t('navbar.my_courses')}</Link>
                      <Link to="/student/library" className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md">{t('navbar.my_library', 'My Library')}</Link>
                      <Link to="/store" className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md">{t('navbar.store', 'Store')}</Link>
                      <Link to="/student/dashboard" className="px-3 py-2 text-sm text-foreground hover:bg-accent/10 rounded-md">{t('navbar.my_account')}</Link>
                    </>
                  )}
                  <button onClick={logout} className="px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md text-start w-full">{t('navbar.logout')}</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-primary md:inline-block">
                {t('navbar.login')}
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:bg-accent hover:text-accent-foreground"
              >
                <span>{t('navbar.register')}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent transition group-hover:bg-primary" />
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="ms-1 rounded-md border border-border p-2 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-2 rounded-2xl border border-border bg-card p-4 shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
