import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag, FileText, Loader2, Check, Download, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { pageTitle } from "@/lib/siteMeta";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { API_ORIGIN as API_BASE } from "@/lib/api";

interface StoreProduct {
  id: number;
  title: string;
  description: string | null;
  price: string;
  thumbnail_path: string | null;
  files_count: number;
  is_free?: boolean;
  is_owned?: boolean;
}

export const Route = createFileRoute("/store")({
  head: () => ({ meta: [{ title: pageTitle("Store") }] }),
  component: StorePage,
});

function StorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const res = await api.get("/landing/digital-products");
      return (res.data?.products ?? []) as StoreProduct[];
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: number) =>
      (await api.post(`/v1/digital-products/${productId}/purchase`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      queryClient.invalidateQueries({ queryKey: ["my-library"] });
      navigate({ to: "/student/library" });
    },
    onError: () => setError(t("store.purchase_failed", "Purchase failed. Please try again.")),
    onSettled: () => setBusyId(null),
  });

  const handleBuy = (p: StoreProduct) => {
    setError(null);
    // Owned → go straight to the library.
    if (p.is_owned) {
      navigate({ to: "/student/library" });
      return;
    }
    // Must be logged in to purchase.
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { to: "/store" } as any });
      return;
    }
    setBusyId(p.id);
    purchaseMutation.mutate(p.id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar variant="solid" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-28">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("store.title", "Digital Store")}
          </h1>
          <p className="mt-2 text-gray-500">
            {t("store.subtitle", "eBooks, files and templates for pharmacists")}
          </p>
        </div>

        {error && (
          <div className="mx-auto mb-6 flex max-w-lg items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* States */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <p className="py-20 text-center text-gray-500">
            {t("store.load_error", "Could not load the store.")}
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">
              {t("store.empty", "No products available yet.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const isFree = p.is_free || Number(p.price) === 0;
              return (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="h-40 w-full overflow-hidden bg-gray-100">
                    {p.thumbnail_path ? (
                      <img
                        src={`${API_BASE}/storage/${p.thumbnail_path}`}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold text-gray-900">{p.title}</h2>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">
                        {p.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      {p.files_count} {t("store.files", "file(s)")}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-extrabold text-gray-900">
                        {isFree ? t("store.free", "Free") : `$${Number(p.price).toFixed(2)}`}
                      </span>

                      {p.is_owned ? (
                        <button
                          onClick={() => handleBuy(p)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                        >
                          <Download className="h-4 w-4" />
                          {t("store.in_library", "In Library")}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(p)}
                          disabled={busyId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                        >
                          {busyId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {isFree ? t("store.get", "Get") : t("store.buy", "Buy")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link to="/" className="text-sm font-semibold text-primary hover:underline">
            ← {t("store.back_home", "Back to home")}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
