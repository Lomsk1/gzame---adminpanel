import { useAdminT } from "../../store/locale/locale";

export const OracleWidget = () => {
  const { t } = useAdminT();

  return (
    <div className="bg-admin-card border border-admin-border p-6 rounded-3xl space-y-4 admin-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-admin-primary animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-widest text-admin-text">
          {t("home.oracle.title")}
        </h3>
      </div>
      <div className="relative">
        <textarea
          className="w-full bg-admin-bg border border-admin-border rounded-xl p-4 text-sm focus:border-admin-primary focus:ring-1 focus:ring-admin-primary outline-none transition-all placeholder:text-admin-text-dim/20"
          rows={4}
          placeholder={t("home.oracle.placeholder")}
        />
      </div>
      <button
        type="button"
        className="w-full py-3 bg-admin-primary hover:bg-admin-primary/80 text-white rounded-xl font-bold text-xs transition-transform active:scale-95 shadow-lg shadow-admin-primary/20"
      >
        {t("home.oracle.generate")}
      </button>
    </div>
  );
};
