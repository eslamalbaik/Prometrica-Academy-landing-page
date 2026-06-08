import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Faq {
  id: number;
  question: string; question_en?: string;
  answer: string; answer_en?: string;
}

export function FaqSection({ limit }: { limit?: number }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const pick = (ar?: string, en?: string) => (isAr ? ar : en || ar) || "";

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["landing-faqs"],
    queryFn: async () => (await api.get("/landing/faqs")).data as Faq[],
  });

  const [open, setOpen] = useState<number | null>(null);
  if (!isLoading && faqs.length === 0) return null;

  const list = limit ? faqs.slice(0, limit) : faqs;

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {t("faq.title", "Frequently Asked Questions")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("faq.subtitle", "Answers to the most common questions about the platform.")}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-card/60" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((faq) => {
              const isOpen = open === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`overflow-hidden rounded-xl border transition-all ${isOpen ? "border-primary/40 bg-card shadow-md" : "border-border bg-card/60"}`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                  >
                    <span className="font-semibold text-foreground">{pick(faq.question, faq.question_en)}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {pick(faq.answer, faq.answer_en)}
                      </p>
                    </div>
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
