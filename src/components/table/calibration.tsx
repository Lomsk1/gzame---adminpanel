import type { RecentAnswer } from "../../types/stats/dashboard";
import { AdminBadge, AdminCard, AdminTable, AdminTableBody, AdminTableHead, AdminTd, AdminTh, AdminTr } from "../admin";
import { useAdminT } from "../../store/locale/locale";

export const CalibrationTable = ({ items }: { items: RecentAnswer[] }) => {
  const { t } = useAdminT();

  return (
    <AdminCard padding="none" className="h-full overflow-hidden admin-fade-up">
      <div className="border-b border-admin-border bg-admin-panel/60 px-4 py-3.5 md:px-5">
        <h3 className="text-sm font-semibold text-admin-text">
          {t("home.table.title")}
        </h3>
      </div>
      <AdminTable className="rounded-none border-x-0 border-b-0">
        <AdminTableHead>
          <tr>
            <AdminTh>{t("home.table.subject")}</AdminTh>
            <AdminTh>{t("home.table.psychometric")}</AdminTh>
            <AdminTh>{t("home.table.consensus")}</AdminTh>
            <AdminTh>{t("home.table.date")}</AdminTh>
          </tr>
        </AdminTableHead>
        <AdminTableBody>
          {(items ?? []).length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-admin-text-dim">
                {t("common.noResults")}
              </td>
            </tr>
          ) : (items ?? []).map((answer) => (
            <AdminTr key={answer._id}>
              <AdminTd>
                <div className="text-sm font-semibold text-admin-text">
                  {answer.user_id?.nickname || t("common.unknown")}
                </div>
              </AdminTd>
              <AdminTd>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-admin-primary uppercase tracking-tight">
                    {answer.finalPsychotype}
                  </span>
                  {answer.subPsychotype ? (
                    <span className="text-[11px] font-medium uppercase text-admin-text-dim">
                      {t("home.table.subPrefix", { value: answer.subPsychotype })}
                    </span>
                  ) : null}
                </div>
              </AdminTd>
              <AdminTd>
                <div className="flex items-center">
                  <AdminBadge tone={answer.geminiVote === answer.finalPsychotype ? "success" : "warning"}>
                    {answer.geminiVote}
                  </AdminBadge>
                </div>
              </AdminTd>
              <AdminTd className="text-[11px] text-admin-text-dim">
                {new Date(answer.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </AdminTd>
            </AdminTr>
          ))}
        </AdminTableBody>
      </AdminTable>
    </AdminCard>
  );
};
