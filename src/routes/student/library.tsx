import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, Loader2, Library, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { pageTitle } from "@/lib/siteMeta";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface LibraryFile {
  id: number;
  digital_product_id: number;
  file_name: string;
  file_size: number;
}
interface LibraryProduct {
  id: number;
  title: string;
  description: string | null;
  thumbnail_path: string | null;
  price: string;
  files: LibraryFile[];
}

export const Route = createFileRoute("/student/library")({
  head: () => ({ meta: [{ title: pageTitle("My Library") }] }),
  component: LibraryPage,
});

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

function LibraryPage() {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-library"],
    queryFn: async () => {
      const res = await api.get("/v1/my-library");
      return (res.data?.products ?? []) as LibraryProduct[];
    },
  });

  // Track which file is currently being prepared for download.
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  /**
   * Secure download flow:
   *  1. Ask the API for a 5-minute signed URL (Bearer token sent automatically).
   *  2. Navigate the browser straight to that signed URL to stream the file.
   */
  const handleDownload = async (productId: number, file: LibraryFile) => {
    setDownloadingId(file.id);
    setDownloadError(null);
    try {
      const res = await api.get(
        `/v1/digital-products/${productId}/files/${file.id}/download`
      );
      const url: string = res.data?.download_url;
      if (!url) throw new Error("No download URL returned");

      // Trigger the browser download via the signed URL.
      const a = document.createElement("a");
      a.href = url;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setDownloadError(
        err?.response?.status === 403
          ? t("library.not_entitled", "You don't have access to this file.")
          : t("library.download_failed", "Download failed. Please try again.")
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const products = data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Library className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("library.title", "My Digital Library")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("library.subtitle", "eBooks, files and templates you've purchased")}
            </p>
          </div>
          <Link
            to="/student/dashboard"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("library.back", "Dashboard")}
          </Link>
        </div>

        {downloadError && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {downloadError}
          </div>
        )}

        {/* States */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-white p-10 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-gray-600">
              {t("library.load_error", "Could not load your library.")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
            <Library className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">
              {t("library.empty_title", "Your library is empty")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t("library.empty_desc", "Digital products you buy will appear here.")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row">
                  {/* Thumbnail */}
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:w-44">
                    {p.thumbnail_path ? (
                      <img
                        src={`${API_BASE}/storage/${p.thumbnail_path}`}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info + files */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{p.title}</h2>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</p>
                    )}

                    <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                      {p.files.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-400">
                          {t("library.no_files", "No files in this product.")}
                        </p>
                      ) : (
                        p.files.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <FileText className="h-5 w-5 shrink-0 text-primary" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-800">
                                  {f.file_name}
                                </p>
                                <p className="text-xs text-gray-400">{formatBytes(f.file_size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(p.id, f)}
                              disabled={downloadingId === f.id}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                            >
                              {downloadingId === f.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              {t("library.download", "Download")}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
