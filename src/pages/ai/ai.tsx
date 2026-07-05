import { Suspense } from "react";
import { useLoaderData, Form, useNavigation, useActionData, Await, useNavigate } from "react-router";
import { ButtonComponent } from "../../components/form/button";
import { GlassTextArea } from "../../components/form/textarea-glass";
import type { AIInstructionType } from "../../types/ai/ai";
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

export default function AIGeminiPage() {
    const { t } = useAdminT();
    const { instructionData } = useLoaderData<{ instructionData: Promise<AIInstructionType['data']> }>();
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
        <AdminPageShell maxWidthClass="max-w-7xl">
        <Form method="post" className="space-y-8">
            <AdminPageHeader
                title={t("pages.ai.title")}
                actions={
                    <div className="flex gap-4">
                        <ButtonComponent type="button" variant="secondary" className="w-auto! px-8" onClick={() => navigate("logs")}>
                            {t("ai.viewLogs")}
                        </ButtonComponent>
                        <ButtonComponent
                            type="submit"
                            variant="oracle"
                            className="w-auto! px-8"
                            isLoading={isSaving}
                        >
                            {t("ai.syncProtocols")}
                        </ButtonComponent>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 h-150">
                    <Suspense fallback={<div className="w-full h-full bg-admin-card/50 animate-pulse rounded-2xl border border-admin-border" />}>
                        <Await resolve={instructionData}>
                            {(resolvedData) => {
                                const activeInstruction = resolvedData?.[0];
                                return (
                                    <>
                                        <input type="hidden" name="instruction_id" value={activeInstruction?._id} />
                                        <GlassTextArea
                                            name="instruction"
                                            label={t("ai.systemInstruction")}
                                            defaultValue={activeInstruction?.text || ""}
                                            error={actionData?.error}
                                            placeholder={t("ai.instructionPlaceholder")}
                                        />
                                    </>
                                );
                            }}
                        </Await>
                    </Suspense>
                </div>

                <div className="space-y-6">
                    <Suspense fallback={<div className="h-32 bg-admin-panel rounded-2xl animate-pulse" />}>
                        <Await resolve={instructionData}>
                            {(resolvedData) => (
                                <div className="p-6 rounded-2xl bg-admin-panel border border-admin-border shadow-xl">
                                    <h3 className="text-xs font-bold text-admin-text mb-4 uppercase italic">{t("ai.activeVersion")}</h3>
                                    <div className="text-3xl font-black text-admin-primary tracking-tighter uppercase">
                                        {resolvedData[0]?._id.slice(-6) || "N/A"}
                                    </div>
                                    <p className="text-[10px] text-admin-text-dim mt-2 leading-relaxed">
                                        {t("ai.lastUpdated")} <br />
                                        <span className="text-admin-text">
                                            {resolvedData[0] ? new Date(resolvedData[0].updated_at).toLocaleString() : t("common.never")}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </Await>
                    </Suspense>

                    <div className="p-6 rounded-2xl bg-admin-primary/5 border border-admin-primary/20">
                        <h3 className="text-xs font-bold text-admin-primary mb-3 uppercase tracking-widest">{t("ai.modelBehavior")}</h3>
                        <ul className="space-y-3">
                            {behaviorItems.map((item) => (
                                <li key={item} className="flex items-center gap-2 text-xs text-admin-text-dim font-medium">
                                    <div className="w-1 h-1 rounded-full bg-admin-primary" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!isSaving && actionData?.status === "success" && (
                        <div className="p-4 rounded-xl bg-admin-success/10 border border-admin-success/20 text-admin-success text-xs font-bold animate-bounce text-center">
                            {t("ai.syncSuccess")}
                        </div>
                    )}
                </div>
            </div>
        </Form>
        </AdminPageShell>
    );
}
