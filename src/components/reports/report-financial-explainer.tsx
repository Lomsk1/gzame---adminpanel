import { useState } from "react";
import { Banknote, ChevronDown, CreditCard, Info, Wallet } from "lucide-react";
import { useAdminT } from "../../store/locale/locale";

const OUTCOMES = [
  {
    key: "fullRefund" as const,
    icon: CreditCard,
    tone: "border-rose-500/25 bg-rose-500/5",
    iconTone: "text-rose-400",
  },
  {
    key: "partialRefund" as const,
    icon: Wallet,
    tone: "border-amber-500/25 bg-amber-500/5",
    iconTone: "text-amber-400",
  },
  {
    key: "releaseSpecialist" as const,
    icon: Banknote,
    tone: "border-emerald-500/25 bg-emerald-500/5",
    iconTone: "text-emerald-400",
  },
];

export function ReportFinancialExplainer() {
  const { t } = useAdminT();
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="rounded-2xl border border-admin-primary/20 bg-admin-primary/5 overflow-hidden admin-fade-up">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-admin-primary/5 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-admin-text">
          <Info className="h-4 w-4 text-admin-primary shrink-0" />
          {t("reports.financialExplainer.title")}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-admin-text-dim transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded ? (
        <div className="px-4 pb-4 space-y-3 border-t border-admin-primary/10">
          <p className="text-xs text-admin-text-dim leading-relaxed pt-3">
            {t("reports.financialExplainer.intro")}
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            {OUTCOMES.map(({ key, icon: Icon, tone, iconTone }) => (
              <div key={key} className={`rounded-xl border p-3 space-y-2 ${tone}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${iconTone}`} />
                  <h4 className="text-xs font-bold text-admin-text">
                    {t(`reports.financialExplainer.${key}.title`)}
                  </h4>
                </div>
                <p className="text-[11px] text-admin-text-dim leading-relaxed">
                  {t(`reports.financialExplainer.${key}.client`)}
                </p>
                <p className="text-[11px] text-admin-text-dim leading-relaxed">
                  {t(`reports.financialExplainer.${key}.specialist`)}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-admin-border/50 bg-admin-bg/40 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-admin-text mb-1">
              {t("reports.financialExplainer.feesTitle")}
            </p>
            <p className="text-[11px] text-admin-text-dim leading-relaxed">
              {t("reports.financialExplainer.feesBody")}
            </p>
          </div>

          <p className="text-[10px] text-admin-text-dim/80 italic">{t("reports.financialExplainer.stripeNote")}</p>
        </div>
      ) : null}
    </section>
  );
}
