import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Check, X, Crown, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface FeatureItem { text: string; text_en?: string; included: boolean }
interface FeatureGroup { title: string; title_en?: string; items: FeatureItem[] }
interface Plan {
  id: number;
  name: string; name_en?: string;
  description?: string; description_en?: string;
  price: string | number;
  period?: string; period_en?: string;
  badge?: string | null; badge_en?: string | null;
  is_featured: boolean;
  cta_label?: string; cta_label_en?: string; cta_url?: string;
  features: FeatureGroup[] | null;
  color?: string;
}

export function PricingPlans() {
  const [hoveredPlanId, setHoveredPlanId] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const pick = (ar?: string | null, en?: string | null) => (isAr ? ar : en || ar) || "";

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["landing-pricing-plans"],
    queryFn: async () => (await api.get("/landing/pricing-plans")).data as Plan[],
  });

  if (!isLoading && plans.length === 0) return null;

  return (
    <section id="packages" className="relative overflow-hidden py-24">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {t("pricing.badge", "Plans & Pricing")}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("pricing.title", "Choose the plan that fits you")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("pricing.subtitle", "Flexible packages that grow with your academy.")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[520px] animate-pulse rounded-3xl border border-border bg-card/50" />
            ))}
          </div>
        ) : (
          <div className="grid items-start gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const featured = plan.is_featured;
              const priceNum = Number(plan.price);
              const planColor = plan.color || (featured ? "#4F46E5" : "#10B981");
              const isHovered = hoveredPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  onMouseEnter={() => setHoveredPlanId(plan.id)}
                  onMouseLeave={() => setHoveredPlanId(null)}
                  className={`relative flex flex-col rounded-3xl border p-7 transition-all duration-300 ${
                    featured
                      ? "text-primary-foreground shadow-2xl md:-mt-4 md:mb-4 scale-[1.02]"
                      : "border-border bg-card text-foreground hover:shadow-xl"
                  }`}
                  style={{
                    backgroundColor: featured ? planColor : undefined,
                    borderColor: featured ? planColor : (isHovered ? planColor : undefined),
                    boxShadow: featured && isHovered ? `0 25px 50px -12px ${planColor}40` : undefined,
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <span
                      className={`absolute -top-3 ${isAr ? "right-6" : "left-6"} inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-md`}
                      style={{
                        backgroundColor: featured ? "#fbbf24" : planColor,
                        color: featured ? "#0f172a" : "#ffffff",
                      }}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {pick(plan.badge, plan.badge_en)}
                    </span>
                  )}

                  {/* Header */}
                  <h3 className="text-xl font-extrabold">{pick(plan.name, plan.name_en)}</h3>
                  <p className={`mt-1.5 text-sm leading-relaxed ${featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {pick(plan.description, plan.description_en)}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    {priceNum === 0 ? (
                      <span className="text-3xl font-black">{t("pricing.free", "Free")}</span>
                    ) : (
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tabular-nums">{priceNum.toLocaleString()}</span>
                        <span className={`pb-1 text-sm ${featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {pick(plan.period, plan.period_en)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to={(plan.cta_url as any) || "/register"}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition`}
                    style={{
                      backgroundColor: featured ? "#ffffff" : planColor,
                      color: featured ? planColor : "#ffffff",
                      opacity: isHovered ? 0.95 : 1,
                    }}
                  >
                    {pick(plan.cta_label, plan.cta_label_en) || t("pricing.subscribe", "Subscribe Now")}
                  </Link>

                  {/* Feature groups */}
                  <div className={`mt-7 space-y-5 border-t pt-6 ${featured ? "border-white/20" : "border-border"}`}>
                    {(plan.features || []).map((group, gi) => (
                      <div key={gi}>
                        <h4
                          className={`mb-2.5 text-xs font-bold uppercase tracking-wide ${featured ? "text-primary-foreground/70" : ""}`}
                          style={{ color: featured ? undefined : planColor }}
                        >
                          {pick(group.title, group.title_en)}
                        </h4>
                        <ul className="space-y-2">
                          {group.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-2.5 text-sm">
                              {item.included ? (
                                <Check
                                  className={`mt-0.5 h-4 w-4 shrink-0`}
                                  style={{ color: featured ? "#a7f3d0" : planColor }}
                                />
                              ) : (
                                <X className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-primary-foreground/40" : "text-gray-300"}`} />
                              )}
                              <span className={item.included ? "" : `line-through ${featured ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                                {pick(item.text, item.text_en)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
