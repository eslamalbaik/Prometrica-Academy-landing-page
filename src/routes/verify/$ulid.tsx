import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";
import { pageTitle } from "@/lib/siteMeta";

type VerifySearch = {
  signature?: string;
  userId?: string;
  courseId?: string;
};

export const Route = createFileRoute("/verify/$ulid")({
  head: () => ({
    meta: [{ title: pageTitle("Certificate Verification") }],
  }),
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    signature: typeof search.signature === "string" ? search.signature : undefined,
    userId: typeof search.userId === "string" ? search.userId : undefined,
    courseId: typeof search.courseId === "string" ? search.courseId : undefined,
  }),
  component: VerifyCertificate,
});

interface VerifyResult {
  valid: boolean;
  student?: string;
  course?: string;
  category?: string;
  issued_at?: string;
  ulid?: string;
  message?: string;
}

function VerifyCertificate() {
  const { ulid } = Route.useParams();
  const search = Route.useSearch();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { signature, userId, courseId } = search;

    if (!signature || !userId || !courseId) {
      setError("رابط التحقق غير مكتمل أو تالف.");
      setLoading(false);
      return;
    }

    api
      .get(`/certificates/${ulid}/verify`, {
        params: { signature, userId, courseId },
      })
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          "لم يتم العثور على الشهادة أو أن الرابط غير صالح.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [ulid, search]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <Shield className="w-14 h-14 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            التحقق من صحة الشهادة
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Certificate Authenticity Verification
          </p>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <span className="text-gray-500">جارٍ التحقق…</span>
            </div>
          )}

          {!loading && result?.valid && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-right">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
                <span className="text-xl font-bold text-green-700">
                  شهادة موثّقة وصحيحة ✓
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">اسم الطالب</span>
                  <span className="font-semibold">{result.student}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">الدورة</span>
                  <span className="font-semibold">{result.course}</span>
                </div>
                {result.category && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-400">التخصص</span>
                    <span className="font-semibold">{result.category}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">تاريخ الإصدار</span>
                  <span className="font-semibold">{result.issued_at}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-400">رقم الشهادة</span>
                  <span
                    className="font-mono text-xs text-gray-600 break-all text-right"
                    style={{ direction: "ltr" }}
                  >
                    {result.ulid}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!loading && (error || (result && !result.valid)) && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <XCircle className="w-7 h-7 text-red-500" />
                <span className="text-xl font-bold text-red-600">
                  الشهادة غير موجودة أو غير صالحة
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {error || result?.message}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
