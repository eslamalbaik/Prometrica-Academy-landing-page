import { useTranslation } from "react-i18next";
import { X, Lock, Check, Crown } from "lucide-react";

export interface PackageOption {
  id: number;
  name: string;
  price: string | number;
  entitlements: Record<string, boolean> | null;
}

const FEATURE_LABELS: Record<string, string> = {
  has_quizzes: "Quizzes & exams",
  has_files: "Downloadable files",
  has_certificate: "Completion certificate",
};

/**
 * Lock & Upsell modal — shown when a student taps a feature their current tier
 * doesn't include. Lists the available packages and highlights the tier that
 * unlocks the requested feature.
 */
export function UpsellModal({
  open,
  onClose,
  requiredTier,
  feature,
  packages,
  onChoose,
}: {
  open: boolean;
  onClose: () => void;
  requiredTier?: string | null;
  feature?: string | null;
  packages: PackageOption[];
  onChoose?: (pkg: PackageOption) => void;
}) {
  const { t } = useTranslation();
  if (!open) return null;

  const featureLabel = feature ? FEATURE_LABELS[feature] ?? feature : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-7 text-center text-white">
          <button onClick={onClose} className="absolute end-4 top-4 text-white/70 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">{t("upsell.title", "Upgrade to unlock")}</h2>
          <p className="mt-1 text-sm text-white/70">
            {featureLabel
              ? t("upsell.feature_locked", { defaultValue: `“${featureLabel}” isn’t included in your current plan.`, feature: featureLabel })
              : t("upsell.generic_locked", "This feature isn’t included in your current plan.")}
            {requiredTier && (
              <>
                {" "}
                {t("upsell.required", { defaultValue: `Available from the ${requiredTier} plan.`, tier: requiredTier })}
              </>
            )}
          </p>
        </div>

        {/* Packages */}
        <div className="max-h-[55vh] space-y-3 overflow-y-auto p-6">
          {packages.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {t("upsell.contact", "Contact support to upgrade your access.")}
            </p>
          ) : (
            packages.map((pkg) => {
              const isRecommended = requiredTier && pkg.name === requiredTier;
              const flags = pkg.entitlements ?? {};
              return (
                <div
                  key={pkg.id}
                  className={`rounded-xl border p-4 ${
                    isRecommended ? "border-primary ring-1 ring-primary/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isRecommended && <Crown className="h-4 w-4 text-amber-500" />}
                      <span className="font-bold text-slate-900">{pkg.name}</span>
                      {isRecommended && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          {t("upsell.recommended", "Recommended")}
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">
                      {Number(pkg.price) === 0 ? t("upsell.free", "Free") : `$${Number(pkg.price).toFixed(2)}`}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {Object.keys(FEATURE_LABELS).map((key) => (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        {flags[key] ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300" />
                        )}
                        <span className={flags[key] ? "text-slate-700" : "text-gray-400 line-through"}>
                          {FEATURE_LABELS[key]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onChoose?.(pkg)}
                    className={`mt-4 w-full rounded-lg py-2.5 text-sm font-bold transition ${
                      isRecommended
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {t("upsell.choose", "Choose {{name}}", { name: pkg.name })}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
