import { Suspense } from "react";
import { useLoaderData, Form, useNavigation, useActionData, Await, useNavigate } from "react-router";
import { ButtonComponent } from "../../components/form/button";
import { GlassTextArea } from "../../components/form/textarea-glass";
import { GlassCard } from "../../components/cards/card-glass";
import type { AIInstructionType } from "../../types/ai/ai";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function AIGeminiPage() {
  const { t } = useAdminT();
  const { instructionData } = useLoaderData<{ instructionData: Promise<AIInstructionType["data"]> }>();
  const actionData = useActionData() as { status?: string; error?: string };
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSaving = navigation.state === "submitting";

  const behaviorItems = [
    t("ai.behaviorPsychotype"),
    t("ai.behaviorCombined"),
    t("ai.behaviorSubType"),
  ];

  return (
    <AdminPageShell maxWidthClass="max-w-7xl" className="space-y-6">
      <Form method="post" className="space-y-6">
        <AdminPageHeader
          title={t("pages.ai.title")}
          actions={
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <ButtonComponent
                type="button"
                variant="secondary"
                className="w-auto! px-5"
                onClick={() => navigate("logs")}
              >
                {t("ai.viewLogs")}
              </ButtonComponent>
              <ButtonComponent
                type="submit"
                variant="oracle"
                className="w-auto! px-5"
                isLoading={isSaving}
              >
                {t("ai.syncProtocols")}
              </ButtonComponent>
            </div>
          }
        />

        <p className="text-sm text-admin-text-dim -mt-2 max-w-3xl">{t("ai.oracleHint")}</p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <GlassCard className="lg:col-span-8" noContentPadding contentClassName="h-[min(70vh,560px)] p-4 md:p-5">
            <Suspense
              fallback={
                <div className="h-full animate-pulse rounded-xl bg-admin-bg/50 border border-admin-border" />
              }
            >
              <Await resolve={instructionData}>
                {(resolvedData) => {
                  const activeInstruction = resolvedData?.[0];
                  return (
                    <div className="flex h-full min-h-0 flex-col gap-2">
                      <input type="hidden" name="instruction_id" value={activeInstruction?._id} />
                      <GlassTextArea
                        name="instruction"
                        label={t("ai.systemInstruction")}
                        defaultValue={activeInstruction?.text || ""}
                        error={actionData?.error}
                        placeholder={t("ai.instructionPlaceholder")}
                      />
                    </div>
                  );
                }}
              </Await>
            </Suspense>
          </GlassCard>

          <div className="lg:col-span-4 space-y-4">
            <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-admin-panel" />}>
              <Await resolve={instructionData}>
                {(resolvedData) => (
                  <GlassCard contentClassName="space-y-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-admin-text-dim">
                      {t("ai.activeVersion")}
                    </h3>
                    <div className="text-2xl font-bold tracking-tight text-admin-primary uppercase">
                      {resolvedData[0]?._id.slice(-6) || "N/A"}
                    </div>
                    <p className="text-[11px] leading-relaxed text-admin-text-dim">
                      {t("ai.lastUpdated")}
                      <br />
                      <span className="text-admin-text">
                        {resolvedData[0]
                          ? new Date(resolvedData[0].updated_at).toLocaleString()
                          : t("common.never")}
                      </span>
                    </p>
                  </GlassCard>
                )}
              </Await>
            </Suspense>

            <GlassCard className="border-admin-primary/20 bg-admin-primary/5" contentClassName="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-admin-primary">
                {t("ai.modelBehavior")}
              </h3>
              <ul className="space-y-2.5">
                {behaviorItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs font-medium text-admin-text-dim">
                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-admin-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {!isSaving && actionData?.status === "success" ? (
              <div className="rounded-xl border border-admin-success/20 bg-admin-success/10 px-4 py-3 text-center text-xs font-bold text-admin-success">
                {t("ai.syncSuccess")}
              </div>
            ) : null}
          </div>
        </div>
      </Form>
    </AdminPageShell>
  );
}
