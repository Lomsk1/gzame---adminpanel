import { Bell, Mail } from "lucide-react";
import { useAdminT } from "../../store/locale/locale";

type Props = {
  notifyParties: boolean;
  sendEmail: boolean;
  onNotifyChange: (v: boolean) => void;
  onEmailChange: (v: boolean) => void;
};

export function ReportNotifyToggles({
  notifyParties,
  sendEmail,
  onNotifyChange,
  onEmailChange,
}: Props) {
  const { t } = useAdminT();

  return (
    <div className="grid sm:grid-cols-2 gap-2 rounded-xl border border-admin-border/40 bg-admin-bg/40 p-3">
      <label className="flex items-center gap-2.5 text-xs text-admin-text cursor-pointer rounded-lg px-2 py-1.5 hover:bg-admin-bg/60">
        <input
          type="checkbox"
          checked={notifyParties}
          onChange={(e) => onNotifyChange(e.target.checked)}
          className="rounded border-admin-border"
        />
        <Bell size={14} className="text-admin-primary shrink-0" />
        {t("reports.notifyPush")}
      </label>
      <label className="flex items-center gap-2.5 text-xs text-admin-text cursor-pointer rounded-lg px-2 py-1.5 hover:bg-admin-bg/60">
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(e) => onEmailChange(e.target.checked)}
          className="rounded border-admin-border"
        />
        <Mail size={14} className="text-violet-300 shrink-0" />
        {t("reports.notifyEmail")}
      </label>
    </div>
  );
}
