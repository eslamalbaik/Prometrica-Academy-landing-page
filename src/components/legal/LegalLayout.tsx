import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export interface LegalSection {
  heading: string;
  body: string[];
}

/**
 * Shared layout for legal/content pages (Privacy, Terms) — same brand identity
 * as the rest of the site: Navbar + Footer, RTL-aware, clean typography.
 */
export function LegalLayout({
  title,
  updatedLabel,
  sections,
  intro,
}: {
  title: string;
  updatedLabel: string;
  intro?: string;
  sections: LegalSection[];
}) {
  const { i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex min-h-screen flex-col bg-background" dir={dir}>
      <Navbar variant="solid" />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border bg-primary/5 py-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-64 w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
          </div>
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{updatedLabel}</p>
          </div>
        </div>

        {/* Content */}
        <article className="mx-auto max-w-3xl px-4 py-14">
          {intro && <p className="mb-10 text-base leading-relaxed text-muted-foreground">{intro}</p>}

          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="mb-3 flex items-center gap-3 text-xl font-bold text-foreground">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  {section.heading}
                </h2>
                <div className="space-y-3 ps-10">
                  {section.body.map((p, j) => (
                    <p key={j} className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}

export function useLegalContent(): { isAr: boolean; pick: (ar: string, en: string) => string } {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  return { isAr, pick: (ar, en) => (isAr ? ar : en) };
}

export function legalNode(ar: string, en: string, isAr: boolean): ReactNode {
  return isAr ? ar : en;
}
