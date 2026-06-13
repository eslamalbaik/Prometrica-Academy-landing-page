import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Clock, Infinity as InfinityIcon, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getLoginUrl } from "@/lib/authSession";

import { API_ORIGIN } from "@/lib/api";

interface BundleCourse {
  id: number;
  title: string;
  thumbnail: string | null;
}

interface Bundle {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  price: number;
  image?: string | null;
  access_days?: number | null;
  courses_count: number;
  courses: BundleCourse[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function BundlesSection() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const isAr = i18n.language === "ar";

  const { data: bundles = [], isLoading } = useQuery<Bundle[]>({
    queryKey: ["landing-bundles"],
    queryFn: async () => (await api.get("/landing/bundles")).data,
  });

  if (!isLoading && bundles.length === 0) return null;

  const pick = (ar?: string | null, en?: string | null) =>
    (isAr ? ar : en || ar) || "";

  const handleAddToCart = (b: Bundle) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl(window.location.href);
      return;
    }
    addToCart({
      id: b.id,
      type: "bundle",
      title: pick(b.name, b.name_en) || b.name,
      price: Number(b.price),
      thumbnail: b.image ? `${API_ORIGIN}/storage/${b.image}` : null,
    });
  };

  return (
    <section id="bundles" className="relative overflow-hidden py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-14 max-w-2xl">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-accent"
          >
            {t("landing.bundles.badge", "باقات تعليمية")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-3 text-4xl font-bold text-primary md:text-5xl"
          >
            {t("landing.bundles.title1", "وفّر أكثر مع")}{" "}
            <span className="text-gradient">
              {t("landing.bundles.title2", "الباقات المجمّعة")}
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-4 text-muted-foreground"
          >
            {t(
              "landing.bundles.subtitle",
              "اشترِ مجموعة من الكورسات بسعر مخفض وابدأ رحلتك التعليمية الشاملة."
            )}
          </motion.p>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-3xl border border-border bg-card/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b, i) => (
              <motion.div
                key={b.id}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"
              >
                {/* Image or gradient banner */}
                {b.image ? (
                  <div className="aspect-[16/7] overflow-hidden">
                    <img
                      src={`${API_ORIGIN}/storage/${b.image}`}
                      alt={b.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/7] bg-gradient-to-br from-primary/80 to-accent/70 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-white/60" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-primary">
                    {pick(b.name, b.name_en) || b.name}
                  </h3>

                  {/* Description */}
                  {(b.description || b.description_en) && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {pick(b.description, b.description_en)}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-accent" />
                      {b.courses_count} {t("landing.bundles.courses", "كورس")}
                    </span>
                    {b.access_days ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-accent" />
                        {b.access_days} {t("landing.bundles.days", "يوم")}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <InfinityIcon className="h-3.5 w-3.5 text-accent" />
                        {t("landing.bundles.lifetime", "وصول مدى الحياة")}
                      </span>
                    )}
                  </div>

                  {/* Course thumbnails preview */}
                  {b.courses.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {b.courses.slice(0, 4).map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title}
                        </span>
                      ))}
                      {b.courses.length > 4 && (
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
                          +{b.courses.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price + CTA */}
                  <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                    <div className="text-2xl font-black text-accent tabular-nums">
                      {Number(b.price) === 0
                        ? t("pricing.free", "مجاني")
                        : Number(b.price).toLocaleString() + " ر.س"}
                    </div>

                    {isInCart(b.id, "bundle") ? (
                      <Link
                        to="/cart"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        {t("cart.in_cart", "في السلة")}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(b)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {t("landing.bundles.buy", "اشترِ الباقة")}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
