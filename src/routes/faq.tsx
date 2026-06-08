import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/landing/FaqSection";
import { pageTitle } from "@/lib/siteMeta";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: pageTitle("FAQ") }] }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar variant="solid" />
      <main className="flex-1 pt-20">
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
