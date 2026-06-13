import { useEffect, useState, useRef } from "react";
import { API_ORIGIN } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Trash2, ArrowRight, PackageOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/prometrica-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link, useNavigate } from "@tanstack/react-router";

export function Navbar({ variant = "transparent" }: { variant?: "transparent" | "solid" }) {
  const { t } = useTranslation();
  const { isAuthenticated, isReady, user, logout } = useAuth();
  const { items, count, total, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    }
    if (cartOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

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
    { href: "#packages", label: t('navbar.packages', 'Packages') },
    { href: "/store", label: t('navbar.store', 'Store') },
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
          {/* Cart popup */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setCartOpen(o => !o)}
              className="relative flex items-center justify-center rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>

            <AnimatePresence>
              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute end-0 top-full mt-3 w-80 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary text-sm">{t('cart.title', 'Your Cart')}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">{count}</span>
                      )}
                    </div>
                    <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Items */}
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                      <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm font-semibold text-primary">{t('cart.empty', 'Your cart is empty')}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t('cart.empty_desc', 'Browse our courses and add them to your cart.')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-60 overflow-y-auto divide-y divide-border">
                        {items.map(item => (
                          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-4 py-3">
                            <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full bg-primary/10" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-primary truncate">{item.title}</p>
                              <p className="text-xs font-bold text-accent">${item.price.toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.type)}
                              className="flex-shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <span className="text-sm font-bold text-primary">{t('cart.total', 'Total')}</span>
                        <span className="text-base font-extrabold text-accent">${total.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {/* Footer buttons */}
                  <div className="flex flex-col gap-2 border-t border-border p-3">
                    {items.length > 0 && (
                      <>
                        <button
                          onClick={() => { setCartOpen(false); navigate({ to: '/checkout' }); }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                        >
                          {t('cart.checkout', 'Proceed to Checkout')} <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { clearCart(); }}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('cart.clear', 'Clear Cart')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCartOpen(false)}
                      className="w-full rounded-xl border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-accent/5 transition-colors"
                    >
                      {t('cart.continue_shopping', 'Continue Shopping')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!isReady ? (
            /* Auth state is still loading — show nothing to prevent flash */
            null
          ) : isAuthenticated ? (
            <div className="relative group">
              <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pe-3 shadow-sm hover:bg-accent/5 transition">
                <img src={user?.avatar ? `${API_ORIGIN}/storage/${user.avatar}` : "https://placehold.co/100x100/1e293b/ffffff?text=" + (user?.name?.[0] || 'U')} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
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
