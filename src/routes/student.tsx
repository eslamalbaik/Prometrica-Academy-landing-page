import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="solid" />
      <div className="flex-1 w-full pt-6 pb-12">
        <ProtectedRoute />
      </div>
      <Footer />
    </div>
  );
}
