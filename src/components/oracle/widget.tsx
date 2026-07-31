import { AdminButton, AdminCard, AdminTextarea } from "../admin";
import { useAdminT } from "../../store/locale/locale";

export const OracleWidget = () => {
  const { t } = useAdminT();

  return (
    <AdminCard padding="lg" className="space-y-4 admin-fade-up">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-admin-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-admin-text">
          {t("home.oracle.title")}
        </h3>
      </div>
      <AdminTextarea
        rows={4}
        placeholder={t("home.oracle.placeholder")}
        className="min-h-0 font-sans"
      />
      <AdminButton type="button" fullWidth>
        {t("home.oracle.generate")}
      </AdminButton>
    </AdminCard>
  );
};
